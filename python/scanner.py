import pandas as pd
import numpy as np
from database import get_data_for_date, get_history_stats

def run_scanner(date, min_del, vol_multiplier, max_price_move, lookback_days):
    """
    Main scanner engine.
    1. Fetches universe for 'date'.
    2. Fetches historical volume stats.
    3. Computes signals.
    """
    # 1. Load Today's Universe
    df = get_data_for_date(date)
    if df.empty:
        return pd.DataFrame(), "No data found for selected date."
    
    # 2. Compute Lookback Metrics (Avg Volume)
    avg_vols = get_history_stats(date, df['symbol'].tolist(), lookback_days)
    
    if not avg_vols:
        return pd.DataFrame(), f"Insufficient historical data to calculate {lookback_days}-day Avg Volume."
        
    df['avg_volume'] = df['symbol'].map(avg_vols)
    
    # Filter out stocks with no history (IPO or connection issue)
    df = df.dropna(subset=['avg_volume'])
    
    # 3. Compute Metrics
    # Volume Spike
    # Avoid division by zero
    df = df[df['avg_volume'] > 0]
    df['vol_spike'] = df['volume'] / df['avg_volume']
    
    # Price Change %
    # Need Prev Close. In our DB, we store 'close'. Detailed change calc needs prev day close.
    # PROMPT SPEC: "Price Change % = (close - prev_close) / prev_close"
    # But our DB table only has 'close'.
    # OPTION A: Fetch T-1 close.
    # OPTION B: Use 'Observed' price change if we assume user uploads standard Bhavcopy which HAS 'PrevClose'.
    # WAIT! My `ingestion.py` threw away 'PrevClose'.
    # CRITICAL FIX: The user's input "CM-UDiFF" *usually* implies just the day's data, but standard Bhavcopy *does* have PrevClose.
    # In `ingestion.py`, I mapped columns but might have missed 'PrevClose'.
    # Let's approximate Price Change using the Open price if PrevClose is missing, OR better, let's fix Ingestion to keep Prev Close if available
    # OR, calculate it from DB (Close of T-1).
    # DB approach is most robust.
    
    # Let's simplify: We accept (Close - Open) / Open roughly for intraday, 
    # BUT "Accumulation" usually means vs Yesterday Close.
    # We will fetch T-1 Close efficiently.
    
    # ..Actually, standard Bhavcopy almost ALWAYS has PREV_CLOSE or OPEN/CLOSE. 
    # Let's just calculate (Close - Open) / Open for now if we don't have PrevClose,
    # OR strictly, I should have kept PREV_CLOSE.
    # I'll rely on Price Change relative to *Open* for Intraday accumulation logic 
    # or just fetch T-1 from DB.
    # Let's fetch T-1 from DB for accuracy.
    
    # Optimization: One query to get Prev Close?
    # Actually, `database.py` history stats calculates AVG Volume. 
    # Let's rely on Price Change being small today. (Close approx equal to Open is also a sign).
    
    # NOTE: I will calculate Price Change % based on Open-Close for simplicity in V1 unless I refactor DB to store PrevClose.
    # Standard accumulation definition: Price didn't move much *during the day* despite volume.
    # Price Change %
    # Updated: Using Prev Close from DB (from input Bhavcopy)
    
    # Avoid division by zero
    df = df[df['prev_close'] > 0]
    df['price_change_pct'] = ((df['close'] - df['prev_close']) / df['prev_close']) * 100
    
    
    # 4. Apply Filters
    mask_del = df['delivery_pct'] >= min_del
    mask_vol = df['vol_spike'] >= vol_multiplier
    # Absolute move check
    mask_price = abs(df['price_change_pct']) <= max_price_move
    
    results = df[mask_del & mask_vol & mask_price].copy()
    
    # 5. Scoring
    # score = 0.4 * norm(del) + 0.4 * norm(vol) + ...
    # Simple rank implementation
    if not results.empty:
        # Normalize roughly
        results['score'] = (results['delivery_pct'] * 1.0) + (results['vol_spike'] * 10.0) 
        # (Weight volume spike heavily: 2x spike ~ 20pts, 50% del ~ 50pts)
        
        def tag_signal(row):
            if row['vol_spike'] > 3.0 and row['delivery_pct'] > 50:
                return "Strong Accumulation"
            return "Accumulation"
            
        results['signal_tag'] = results.apply(tag_signal, axis=1)
        results = results.sort_values(by='score', ascending=False).reset_index(drop=True)
        
    return results, None
