import pandas as pd
import argparse
import os
import sys
from dotenv import load_dotenv

# Load env variables from backend
load_dotenv(os.path.join(os.path.dirname(__file__), '../backend/.env'))

from database import insert_daily_data

def ingest_single_file(file_path):
    print(f"Reading File: {file_path}")
    if not os.path.exists(file_path):
        print("Error: File not found.")
        return

    try:
        df = pd.read_csv(file_path)
        
        # Standardize column names: uppercase, strip spaces
        df.columns = [c.strip().upper() for c in df.columns]
        
        # Mapping Logic
        # We need: SYMBOL, DATE, OPEN, HIGH, LOW, CLOSE, PREV_CLOSE, VOLUME, DELIV_QTY, DELIV_PCT
        
        # 1. Symbol
        sym_col = next((c for c in df.columns if c in ['SYMBOL', 'TICKER', 'SCRIP_ID']), None)
        if not sym_col:
            print(f"Error: Missing Symbol column. Found: {df.columns.tolist()}")
            return
            
        # 2. Date
        date_col = next((c for c in df.columns if c in ['DATE', 'TRADE_DATE', 'TIMESTAMP', 'DATE1']), None)
        if not date_col:
            print("Error: Missing Date column.")
            return

        # 3. OHLC
        # Check standard names
        
        # 4. Delivery
        # delivery qty often: DELIV_QTY, DELIVERY QUANTITY, DELIVERABLE QTY
        del_qty_col = next((c for c in df.columns if 'DELIV' in c and 'QTY' in c), None)
        # delivery pct often: DELIV_PCT, % DELIV, PCT_DELIV
        del_pct_col = next((c for c in df.columns if 'DELIV' in c and ('%' in c or 'PCT' in c)), None)
        
        # Rename map
        rename_map = {
            sym_col: 'symbol',
            date_col: 'trade_date',
            'OPEN': 'open',
            'HIGH': 'high',
            'LOW': 'low',
            'CLOSE': 'close',
            'PREVCLOSE': 'prev_close',
            'PREV_CLOSE': 'prev_close',
            'TOTTRDQTY': 'volume',
            'VOLUME': 'volume',
            'TRADED_QTY': 'volume'  
        }
        
        if del_qty_col: rename_map[del_qty_col] = 'delivery_qty'
        if del_pct_col: rename_map[del_pct_col] = 'delivery_pct'
        
        # Apply rename
        df = df.rename(columns=rename_map)
        
        # Clean Data
        required = ['symbol', 'trade_date', 'open', 'high', 'low', 'close', 'volume']
        missing = [c for c in required if c not in df.columns]
        
        if missing:
            print(f"Error: Missing required columns after mapping: {missing}")
            print(f"Original Headers: {df.columns.tolist()}")
            return
            
        # Filter series if exists
        if 'SERIES' in df.columns:
            df = df[df['SERIES'].isin(['EQ', 'BE'])]
            
        # Date parsing
        df['trade_date'] = pd.to_datetime(df['trade_date'])
        
        # Ensure numeric
        for col in ['open', 'high', 'low', 'close', 'volume']:
            df[col] = pd.to_numeric(df[col], errors='coerce')
            
        # Handle Delivery if missing
        if 'delivery_qty' not in df.columns:
            df['delivery_qty'] = 0
        if 'delivery_pct' not in df.columns:
            df['delivery_pct'] = 0
            
        # Calculate Delivery Pct if we have Qty but not Pct
        if 'delivery_pct' in df.columns:
             # If strictly 0, maybe try calc?
             pass
        elif 'delivery_qty' in df.columns and 'volume' in df.columns:
             df['delivery_pct'] = (df['delivery_qty'] / df['volume']) * 100
             
        # Fill NaNs
        df = df.fillna(0)
        
        print(f"Ready to insert {len(df)} records for {df['trade_date'].iloc[0].date()}")
        
        insert_daily_data(df)
        print("Ingestion Completed.")
        
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Ingest Single CSV Daily Data")
    parser.add_argument("file", help="Path to combined CSV file")
    
    args = parser.parse_args()
    ingest_single_file(args.file)
