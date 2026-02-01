import streamlit as st
import pandas as pd
import os
from dotenv import load_dotenv

# Load env variables from backend
load_dotenv(os.path.join(os.path.dirname(__file__), '../backend/.env'))

from database import init_db, get_available_dates
from scanner import run_scanner

# Init DB
init_db()

st.set_page_config(page_title="Delivery Scanner", layout="wide", page_icon="🟢")

# --- DISCLAIMER ---
if "disclaimer_accepted" not in st.session_state:
    st.session_state.disclaimer_accepted = False

if not st.session_state.disclaimer_accepted:
    st.title("⚠️ Disclaimer")
    st.markdown("""
    **This tool is intended for informational and analytical purposes only.**
    
    It does not constitute investment advice, trading recommendations, or solicitation to buy or sell any securities.
    
    The creator is not a SEBI-registered investment advisor or research analyst, and users are solely responsible for their own trading and investment decisions.
    """)
    if st.button("I Agree & Proceed"):
        st.session_state.disclaimer_accepted = True
        st.rerun()
    st.stop()

st.title("Delivery Accumulation Scanner")
st.markdown("### See accumulation before the move")
st.markdown("Our tool highlights stocks showing heavy delivery-based buying without significant price expansion. These patterns often appear before base formation and trend reversals.")
st.markdown("We identify NSE stocks showing abnormal volume and high delivery activity without price expansion a common signature of accumulation. The output helps traders focus on stocks worth deeper chart analysis.")

# --- SIDEBAR: DATA & SETTINGS ---
with st.sidebar:
    # Data managed via automated scripts
    pass

    st.header("Scanner Settings")
    
    # Date Selection
    avail_dates = get_available_dates()
    if not avail_dates:
        st.warning("No data in DB. Upload files first.")
        selected_date = None
    else:
        selected_date = st.selectbox("Select Trade Date", avail_dates, index=0)
    
    min_del = st.slider("Min Delivery %", 20, 80, 35)
    vol_mult = st.slider("Volume Spike (x Avg)", 1.0, 10.0, 2.0, 0.5)
    max_move = st.slider("Max Price Move %", 0.5, 5.0, 1.5)
    lookback = st.selectbox("Lookback (Days)", [10, 20, 30], index=1)
    
    run_scan = st.button("▶️ Run Scan", type="primary")

# --- MAIN CONTENT ---

if run_scan and selected_date:
    with st.spinner(f"Scanning market for {selected_date}..."):
        results, error = run_scanner(selected_date, min_del, vol_mult, max_move, lookback)
        
        if error:
            st.warning(error)
        elif results.empty:
            st.info("No stocks matched the criteria.")
        else:
            # Metrics
            st.subheader(f"Results for {selected_date}")
            c1, c2, c3 = st.columns(3)
            c1.metric("Signals Found", len(results))
            strong = len(results[results['signal_tag'] == 'Strong Accumulation'])
            c2.metric("Strong Signals", strong)
            c3.metric("Top Result", results.iloc[0]['symbol'] if not results.empty else "-")
            
            # Table
            st.dataframe(
                results[['symbol', 'close', 'price_change_pct', 'volume', 'avg_volume', 'vol_spike', 'delivery_pct', 'signal_tag', 'score']],
                column_config={
                    "price_change_pct": st.column_config.NumberColumn("Price Chg %", format="%.2f%%"),
                    "vol_spike": st.column_config.NumberColumn("Vol Spike", format="%.2fx"),
                    "delivery_pct": st.column_config.NumberColumn("Del %", format="%.2f%%"),
                    "score": st.column_config.ProgressColumn("Score", min_value=0, max_value=200, format="%.2f"),
                },
                width='stretch'
            )
else:
    if not avail_dates:
        st.markdown("""
        ### 👋 Welcome!
        This system detects **Institutional Accumulation** by analyzing:
        1. **Delivery %**: High real buying.
        2. **Volume Spike**: Unusual activity vs 20-day average.
        3. **Price Stability**: Price hasn't broken out yet.
        
        **Get Started:**
        1. Download **CM-UDiFF Bhavcopy** and **Security Delivery Data** from NSE.
        2. Upload them in the sidebar.
        3. Build your historical database and Run Scan.
        """)
