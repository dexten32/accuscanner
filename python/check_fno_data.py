
import os
import sys
import psycopg2
from dotenv import load_dotenv

# Load env from backend
load_dotenv(os.path.join(os.path.dirname(__file__), '../backend/.env'))

DB_URL = os.getenv("DATABASE_URL")

if not DB_URL:
    print("DATABASE_URL not set")
    sys.exit(1)

try:
    conn = psycopg2.connect(DB_URL.split('?')[0])
    cur = conn.cursor()

    print("--- RawMarketData ---")
    cur.execute("SELECT is_fno, COUNT(*) FROM raw_market_data GROUP BY is_fno")
    rows = cur.fetchall()
    for r in rows:
        print(f"is_fno={r[0]}: {r[1]} rows")

    print("\n--- ScannerResults ---")
    cur.execute("SELECT is_fno, COUNT(*) FROM scanner_results GROUP BY is_fno")
    rows = cur.fetchall()
    for r in rows:
        print(f"is_fno={r[0]}: {r[1]} rows")

    cur.close()
    conn.close()

except Exception as e:
    print(f"Error: {e}")
