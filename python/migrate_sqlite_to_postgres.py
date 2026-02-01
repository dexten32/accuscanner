import sqlite3
import pandas as pd
import os
import sys
from dotenv import load_dotenv

# Load env variables from backend
load_dotenv(os.path.join(os.path.dirname(__file__), '../backend/.env'))

from database import insert_daily_data

# Path to SQLite DB
SQLITE_DB_PATH = os.path.join(os.path.dirname(__file__), '../database/market_data.db')

def migrate():
    if not os.path.exists(SQLITE_DB_PATH):
        print(f"Error: SQLite database not found at {SQLITE_DB_PATH}")
        return

    print("Connecting to SQLite...")
    conn_sqlite = sqlite3.connect(SQLITE_DB_PATH)
    
    print("Reading daily_equity_data...")
    df = pd.read_sql_query("SELECT * FROM daily_equity_data", conn_sqlite)
    conn_sqlite.close()
    
    if df.empty:
        print("No data found in SQLite DB.")
        return

    print(f"Read {len(df)} rows. Converting columns if needed...")
    
    # Ensure date column is datetime for Postgres
    if 'trade_date' in df.columns:
        df['trade_date'] = pd.to_datetime(df['trade_date'])

    # Ensure is_fno is boolean (SQLite uses 0/1)
    if 'is_fno' in df.columns:
        df['is_fno'] = df['is_fno'].astype(bool)

    print("Inserting into Postgres (this may take a while)...")
    try:
        # We process in chunks to avoid memory issues if DB is huge
        chunk_size = 5000
        for i in range(0, len(df), chunk_size):
            chunk = df.iloc[i:i+chunk_size]
            print(f"Processing chunk {i} to {i+len(chunk)}...")
            insert_daily_data(chunk)
            
        print("Migration Completed Successfully.")
    except Exception as e:
        print(f"Error during migration: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    migrate()
