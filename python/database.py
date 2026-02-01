import os
import sys
import psycopg2
import pandas as pd
from psycopg2.extras import execute_values

DB_URL = os.getenv("DATABASE_URL")

from sqlalchemy import create_engine

# Engine cache
_engine = None

def get_engine():
    global _engine
    if _engine is None:
        if not DB_URL:
             print("Error: DATABASE_URL not set.")
             sys.exit(1)
        # SQLAlchemy also dislikes some params or needs correct driver
        # default postgresql:// uses psycopg2
        # Strip ?pgbouncer=true or other non-standard params if they break engine
        clean_url = DB_URL.split('?')[0]
        _engine = create_engine(clean_url)
    return _engine

def get_connection():
    if not DB_URL:
        print("Error: DATABASE_URL not set.")
        sys.exit(1)
    
    # Psycopg2 doesn't like options in the DSN that it doesn't understand?
    # Or specifically ?pgbouncer=true might be causing issues.
    # Let's strip parameters for psycopg2 if needed, or just that one.
    clean_url = DB_URL.split('?')[0]
    return psycopg2.connect(clean_url)

def init_db():
    pass

def insert_daily_data(df):
    """
    Upsert daily data into 'raw_market_data'.
    """
    # For insertion, we still use psycopg2 execute_values for speed
    conn = get_connection()
    try:
        if df.empty:
            return

        # Ensure columns match: trade_date, symbol, open, high, low, close, prev_close, volume, delivery_qty, delivery_pct, is_fno
        required_cols = ['trade_date', 'symbol', 'open', 'high', 'low', 'close', 'prev_close', 'volume', 'delivery_qty', 'delivery_pct', 'is_fno']
        
        # Fill missing
        for col in required_cols:
            if col not in df.columns:
                if col == 'is_fno':
                    df[col] = False  # Default to False if missing
                else:
                    df[col] = None

        data_tuples = [
            (
                x.trade_date, x.symbol, x.open, x.high, x.low, x.close, 
                x.prev_close, x.volume, x.delivery_qty, x.delivery_pct, x.is_fno
            )
            for x in df.itertuples(index=False)
        ]

        sql = """
            INSERT INTO raw_market_data (
                trade_date, symbol, open, high, low, close, prev_close, volume, delivery_qty, delivery_pct, is_fno, updated_at
            ) VALUES %s
            ON CONFLICT (trade_date, symbol) DO UPDATE SET
                open = EXCLUDED.open,
                high = EXCLUDED.high,
                low = EXCLUDED.low,
                close = EXCLUDED.close,
                prev_close = EXCLUDED.prev_close,
                volume = EXCLUDED.volume,
                delivery_qty = EXCLUDED.delivery_qty,
                delivery_pct = EXCLUDED.delivery_pct,
                is_fno = EXCLUDED.is_fno,
                updated_at = NOW()
        """
        
        with conn.cursor() as cur:
            # execute_values expects a single %s in the sql to be replaced by the values list
            tpl = "(%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW())"
            execute_values(cur, sql, data_tuples, template=tpl)
            
        conn.commit()
    except Exception as e:
        print(f"Error inserting daily data: {e}")
        conn.rollback()
        raise
    finally:
        conn.close()

def get_available_dates():
    """Return sorted list of available trade dates."""
    engine = get_engine()
    with engine.connect() as conn:
        dates = pd.read_sql("SELECT DISTINCT trade_date FROM raw_market_data ORDER BY trade_date DESC", conn)
        return dates['trade_date'].astype(str).tolist()

def get_data_for_date(date):
    """Fetch all data for a specific date."""
    engine = get_engine()
    print(f"[DB] Fetching data for date: {date}")
    # params must be dict or list for sqlalchemy connection
    # Or just use text() but read_sql handles basic string query with params
    # Pandas read_sql with engine/connection often prefers params as list/dict
    
    # Note: read_sql on engine might need SQL abstraction or simple text
    # safe approach:
    query = "SELECT * FROM raw_market_data WHERE trade_date = %(date)s"
    df = pd.read_sql(query, engine, params={"date": date})
    
    print(f"[DB] Rows found: {len(df)}")
    return df

def get_history_stats(date, symbols, lookback=20):
    """
    Calculates Average Volume for the given symbols over the LAST N days BEFORE 'date'.
    """
    engine = get_engine()
    
    # 1. Get stats for pre-qualified dates.
    dates_query = "SELECT DISTINCT trade_date FROM raw_market_data WHERE trade_date < %(date)s ORDER BY trade_date DESC LIMIT %(limit)s"
    past_dates = pd.read_sql(dates_query, engine, params={"date": date, "limit": lookback})
    
    if past_dates.empty:
        return {}

    min_date = past_dates['trade_date'].min()
    max_date = past_dates['trade_date'].max()
    
    # Optimization: Don't filter by symbol in SQL if the universe is large (most of market), 
    # just filter by date and group by symbol.
    
    query = """
    SELECT symbol, AVG(volume) as avg_volume
    FROM raw_market_data
    WHERE trade_date >= %(min_d)s AND trade_date <= %(max_d)s
    GROUP BY symbol
    """
    stats = pd.read_sql(query, engine, params={"min_d": min_date, "max_d": max_date})
    
    # Filter for requested symbols in Pandas to avoid massive IN clause
    if symbols:
        stats = stats[stats['symbol'].isin(symbols)]
    
    return stats.set_index('symbol')['avg_volume'].to_dict()
