import os
import pandas as pd
import psycopg2
from dotenv import load_dotenv

# Load env variables from backend
load_dotenv(os.path.join(os.path.dirname(__file__), '../backend/.env'))

DB_URL = os.getenv("DATABASE_URL")

def check_dates():
    if not DB_URL:
        print("Error: DATABASE_URL not set.")
        return
    
    clean_url = DB_URL.split('?')[0]
    conn = psycopg2.connect(clean_url)
    
    print("Checking available dates in December 2025...")
    try:
        df = pd.read_sql("""
            SELECT DISTINCT trade_date 
            FROM raw_market_data 
            WHERE trade_date >= '2025-12-01' AND trade_date <= '2025-12-31'
            ORDER BY trade_date
        """, conn)
        
        print(f"Found {len(df)} unique dates.")
        print(df)
        
    except Exception as e:
        print(e)
    finally:
        conn.close()

if __name__ == "__main__":
    check_dates()
