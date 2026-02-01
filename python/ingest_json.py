import json
import pandas as pd
import argparse
import os
import sys
from dotenv import load_dotenv

# Load env from backend
load_dotenv(os.path.join(os.path.dirname(__file__), '../backend/.env'))

from database import insert_daily_data

def process_file(file_path):
    print(f"Reading file: {file_path}")
    
    with open(file_path, 'r') as f:
        data = json.load(f)
    
    # Assuming JSON structure is a list of records
    # If it's a diff structure, we might need to adjust
    if not isinstance(data, list):
         print("Error: JSON root must be a list of records.")
         return

    df = pd.DataFrame(data)
    
    # Ensure columns match what insert_daily_data expects
    # It likely expects: symbol, date, close, volume, etc.
    # Map 'date' to 'trade_date' if needed, or ensure JSON has 'trade_date'
    
    # Basic validation
    required_cols = ['symbol', 'trade_date', 'open', 'high', 'low', 'close', 'volume', 'delivery_data', 'delivery_pct']
    missing = [c for c in required_cols if c not in df.columns]
    
    if missing:
        print(f"Warning: Missing columns: {missing}. Ensure your JSON matches the schema.")
    
    # Convert trade_date if it's string
    if 'trade_date' in df.columns:
        df['trade_date'] = pd.to_datetime(df['trade_date'])

    print(f"Inserting {len(df)} records...")
    insert_daily_data(df)
    print("Done.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Ingest Market Data JSON")
    parser.add_argument("file", help="Path to JSON file")
    args = parser.parse_args()
    
    if os.path.exists(args.file):
        process_file(args.file)
    else:
        print("File not found.")
