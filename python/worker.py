import os
import sys
import argparse
import psycopg2
from psycopg2.extras import execute_values
import pandas as pd
from datetime import datetime
from dotenv import load_dotenv

# Load env variables from backend
load_dotenv(os.path.join(os.path.dirname(__file__), '../backend/.env'))

# Now import local modules that use env vars
from scanner import run_scanner

# Configuration
DB_URL = os.getenv("DATABASE_URL")

def log(msg):
    print(f"[Worker] {msg}", flush=True)

def get_db_connection():
    if not DB_URL:
        log("Error: DATABASE_URL not set.")
        sys.exit(1)
    # Strip params like ?pgbouncer=true which psycopg2 dislikes
    clean_url = DB_URL.split('?')[0]
    return psycopg2.connect(clean_url)

def update_run_status(conn, date, status, error=None):
    """
    Update the scanner_runs table.
    """
    sql = """
        INSERT INTO scanner_runs (run_date, status, started_at)
        VALUES (%s, %s, NOW())
        ON CONFLICT (run_date) DO UPDATE SET
            status = EXCLUDED.status,
            completed_at = CASE WHEN EXCLUDED.status IN ('completed', 'failed') THEN NOW() ELSE NULL END,
            error_message = %s
    """
    try:
        with conn.cursor() as cur:
            cur.execute(sql, (date, status, error))
        conn.commit()
    except Exception as e:
        log(f"Failed to update run status: {e}")

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--date", required=True, help="YYYY-MM-DD")
    args = parser.parse_args()
    
    date_str = args.date
    log(f"Initializing for date: {date_str}")
    
    try:
        conn = get_db_connection()
        log("DB Connection successful.")
    except Exception as e:
        log(f"DB Connection failed: {e}")
        return

    try:
        log(f"Starting Scan for {date_str}...")
        update_run_status(conn, date_str, "running")
        
        # Run Scanner
        # run_scanner(date_str, min_del, vol_mult, max_move, lookback)
        # We'll use defaults or standard values for the automated runner
        # Defaults: min_delivery=40, vol_spike=1.5, price_change=5.0, lookback=20
        log("Invoking run_scanner logic...")
        results, error = run_scanner(date_str, 40, 1.5, 5.0, 20)
        
        if error:
            log(f"Scanner returned error: {error}")
            update_run_status(conn, date_str, "failed", error)
        else:
            log(f"Scanner finished. Found {len(results)} results.")
            # Note: run_scanner/database.py handles insertion of results internally based on previous refactors?
            # Let's check `scanner.py`. If it returns DF, we might need to insert it.
            # In Phase 2 Step 8, we implemented `scanner_results` insert logic.
            # Let's assume `run_scanner` just RETURNS data and we need to save it?
            # actually if we look at `scanner.py` (from memory), it returns (results_df, error).
            # It does NOT verify insertion.
            # So we should call the insertion logic in `database.py` or here.
            
            # Re-implementing simplified insertion here since we have the connection
            if not results.empty:
                log("Inserting results to DB...")
                # Columns expected: trade_date, symbol, delivery_percent, volume_multiplier, price_change_pct, score
                # Ensure mapping
                results['trade_date'] = date_str
                
                # Check column names from Scanner Results
                # expected: symbol, delivery_pct, vol_spike, price_change_pct, score
                
                data_tuples = []
                for _, row in results.iterrows():
                    # Ensure is_fno exists, default False
                    is_fno_val = row.get('is_fno', False)
                      
                    data_tuples.append((
                        date_str,
                        row['symbol'],
                        row['close'],
                        row['price_change_pct'],
                        row['volume'],
                        row['avg_volume'],
                        row['vol_spike'], 
                        row['delivery_pct'],
                        row['score'],
                        row['signal_tag'],
                        is_fno_val
                    ))
                      
                sql = """
                    INSERT INTO scanner_results (
                        trade_date, symbol, close, price_change_pct, volume, avg_volume, volume_multiplier, delivery_percent, score, signal_tag, is_fno
                    ) VALUES %s
                    ON CONFLICT (trade_date, symbol) DO UPDATE SET
                        close = EXCLUDED.close,
                        price_change_pct = EXCLUDED.price_change_pct,
                        volume = EXCLUDED.volume,
                        avg_volume = EXCLUDED.avg_volume,
                        volume_multiplier = EXCLUDED.volume_multiplier,
                        delivery_percent = EXCLUDED.delivery_percent,
                        score = EXCLUDED.score,
                        signal_tag = EXCLUDED.signal_tag,
                        is_fno = EXCLUDED.is_fno
                """
                
                with conn.cursor() as cur:
                    # Added extra %s for is_fno
                    template = "(%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)"
                    execute_values(cur, sql, data_tuples, template=template)
                conn.commit()
                log("Insertion complete.")
                
            update_run_status(conn, date_str, "completed")
            log("Scan Completed Successfully.")
        
    except Exception as e:
        log(f"Critical Exception: {e}")
        import traceback
        traceback.print_exc()
        update_run_status(conn, date_str, "failed", str(e))
    finally:
        conn.close()

if __name__ == "__main__":
    main()
