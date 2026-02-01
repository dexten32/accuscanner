
import psycopg2
import os
import sys
from dotenv import load_dotenv

load_dotenv('../backend/.env')
db_url = os.getenv('DATABASE_URL')
if not db_url:
    print("No DATABASE_URL found")
    sys.exit(1)

clean_url = db_url.split('?')[0]
try:
    conn = psycopg2.connect(clean_url)
    cur = conn.cursor()
    cur.execute('SELECT COUNT(*) FROM raw_market_data')
    count = cur.fetchone()[0]
    print(f"Rows: {count}")
    conn.close()
except Exception as e:
    print(f"Error: {e}")
