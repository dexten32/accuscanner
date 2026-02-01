
import psycopg2
import os
import sys
from dotenv import load_dotenv

load_dotenv('../backend/.env')
db_url = os.getenv('DATABASE_URL')
clean_url = db_url.split('?')[0]
try:
    conn = psycopg2.connect(clean_url)
    cur = conn.cursor()
    cur.execute("SELECT email, id FROM users WHERE email='admin@accuscan.com'")
    user = cur.fetchone()
    print(f"User found: {user}")
    conn.close()
except Exception as e:
    print(f"Error: {e}")
