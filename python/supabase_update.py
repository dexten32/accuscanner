# ============================================================
# NSE END-TO-END DOWNLOAD + INGEST PIPELINE (POSTGRES VPS)
# ============================================================

import io
import time
import zipfile
import requests
import pandas as pd
import psycopg2
from psycopg2.extras import execute_values
from datetime import datetime, timedelta

# ============================================================
# ======================= CONFIG ==============================
# ============================================================

# -------- POSTGRES VPS CONFIG --------
DB_CONFIG = {
    "host": "93.127.198.5",
    "port": 5432,
    "dbname": "accuscanner_db",
    "user": "accuscanner_user",
    "password": "scanner123"
}

TABLE_NAME = "daily_equity_data"

START_DATE = datetime(2026, 2, 1)
END_DATE = datetime.now()

# -------- NSE URLS --------
BHAVCOPY_URL = (
    "https://nsearchives.nseindia.com/content/cm/"
    "BhavCopy_NSE_CM_0_0_0_{date}_F_0000.csv.zip"
)

FO_BHAVCOPY_URL = (
    "https://nsearchives.nseindia.com/content/fo/"
    "BhavCopy_NSE_FO_0_0_0_{date}_F_0000.csv.zip"
)

DELIVERY_URL = (
    "https://nsearchives.nseindia.com/products/content/"
    "sec_bhavdata_full_{date}.csv"
)

HEADERS = {
    "User-Agent": "Mozilla/5.0",
    "Accept-Language": "en-US,en;q=0.9",
    "Connection": "keep-alive"
}

# ============================================================
# ======================= DB =================================
# ============================================================

def get_conn():
    return psycopg2.connect(**DB_CONFIG)

def init_db():
    conn = get_conn()
    cur = conn.cursor()

    cur.execute(f"""
        CREATE TABLE IF NOT EXISTS {TABLE_NAME} (
            trade_date DATE,
            symbol TEXT,
            open NUMERIC,
            high NUMERIC,
            low NUMERIC,
            close NUMERIC,
            prev_close NUMERIC,
            volume BIGINT,
            delivery_qty BIGINT,
            delivery_pct NUMERIC,
            is_fno INTEGER,
            PRIMARY KEY (trade_date, symbol)
        )
    """)

    conn.commit()
    cur.close()
    conn.close()

def insert_daily_data(df: pd.DataFrame):
    if df.empty:
        return

    conn = get_conn()
    cur = conn.cursor()

    cols = list(df.columns)
    values = [tuple(row) for row in df.to_numpy()]

    sql = f"""
        INSERT INTO {TABLE_NAME} ({', '.join(cols)})
        VALUES %s
        ON CONFLICT (trade_date, symbol) DO NOTHING
    """

    execute_values(cur, sql, values, page_size=1000)
    conn.commit()

    cur.close()
    conn.close()

# ============================================================
# ======================= SESSION =============================
# ============================================================

def setup_session():
    s = requests.Session()
    s.headers.update(HEADERS)
    try:
        s.get("https://www.nseindia.com", timeout=10)
    except:
        pass
    return s

# ============================================================
# ======================= DOWNLOAD ===========================
# ============================================================

def unzip_and_extract_csv(content):
    try:
        with zipfile.ZipFile(io.BytesIO(content)) as z:
            for f in z.namelist():
                if f.endswith(".csv"):
                    return io.BytesIO(z.read(f))
    except zipfile.BadZipFile:
        return None
    return None

def download_data_for_date(session, date):
    ymd = date.strftime("%Y%m%d")
    dmy = date.strftime("%d%m%Y")

    result = {"cm": None, "fo": None, "delivery": None}

    try:
        r = session.get(BHAVCOPY_URL.format(date=ymd), timeout=15)
        if r.status_code == 200:
            result["cm"] = unzip_and_extract_csv(r.content)
    except:
        pass

    try:
        r = session.get(FO_BHAVCOPY_URL.format(date=ymd), timeout=15)
        if r.status_code == 200:
            result["fo"] = unzip_and_extract_csv(r.content)
    except:
        pass

    try:
        r = session.get(DELIVERY_URL.format(date=dmy), timeout=15)
        if r.status_code == 200:
            result["delivery"] = io.BytesIO(r.content)
    except:
        pass

    return result

# ============================================================
# ======================= PARSE + MERGE ======================
# ============================================================

def parse_and_merge(cm_data, delivery_data, fo_data):
    if not cm_data or not delivery_data:
        return pd.DataFrame()

    # -------- F&O MAP --------
    fno_symbols = set()
    if fo_data:
        df_fo = pd.read_csv(fo_data)
        df_fo.columns = [c.strip() for c in df_fo.columns]
        df_fo.rename(columns={"TckrSymb": "symbol", "FinInstrmTp": "instrument"}, inplace=True)
        df_fo["symbol"] = df_fo["symbol"].str.upper().str.strip()
        fno_symbols = set(df_fo[df_fo["instrument"].isin(["STO", "STF"])]["symbol"])

    # -------- CM --------
    df_p = pd.read_csv(cm_data)
    df_p.columns = [c.strip() for c in df_p.columns]
    df_p.rename(columns={
        "TradDt": "trade_date",
        "TckrSymb": "symbol",
        "SctySrs": "series",
        "OpnPric": "open",
        "HghPric": "high",
        "LwPric": "low",
        "ClsPric": "close",
        "PrvsClsgPric": "prev_close",
        "TtlTradgVol": "volume",
        "ISIN": "isin"
    }, inplace=True)

    df_p = df_p[(df_p["series"] == "EQ") & (df_p["isin"].str.startswith("INE"))]

    # -------- DELIVERY --------
    df_d = pd.read_csv(delivery_data)
    df_d.columns = [c.strip() for c in df_d.columns]
    df_d.rename(columns={
        "SYMBOL": "symbol",
        "SERIES": "series",
        "DATE1": "trade_date",
        "DELIV_QTY": "delivery_qty",
        "DELIV_PER": "delivery_pct"
    }, inplace=True)

    df_d = df_d[df_d["series"].str.upper() == "EQ"]

    # -------- STANDARDIZE --------
    for df in (df_p, df_d):
        df["symbol"] = df["symbol"].str.upper().str.strip()
        df["trade_date"] = pd.to_datetime(df["trade_date"])

    merged = pd.merge(
        df_p,
        df_d[["trade_date", "symbol", "series", "delivery_qty", "delivery_pct"]],
        on=["trade_date", "symbol", "series"],
        how="inner"
    )

    merged["is_fno"] = merged["symbol"].isin(fno_symbols).astype(int)
    merged["trade_date"] = merged["trade_date"].dt.date

    return merged[[
        "trade_date", "symbol", "open", "high", "low", "close",
        "prev_close", "volume", "delivery_qty", "delivery_pct", "is_fno"
    ]]

# ============================================================
# ======================= PIPELINE ===========================
# ============================================================

def ingest_date(session, date):
    print(f"Fetching {date.date()}...")
    streams = download_data_for_date(session, date)

    if not streams["cm"] or not streams["delivery"]:
        print(f"❌ Missing files for {date.date()}")
        return

    df = parse_and_merge(streams["cm"], streams["delivery"], streams["fo"])

    if not df.empty:
        insert_daily_data(df)
        print(f"✅ {date.date()} inserted ({len(df)})")
    else:
        print(f"⚠️ No data merged for {date.date()}")

def run():
    init_db()
    session = setup_session()

    cur = START_DATE
    while cur <= END_DATE:
        try:
            ingest_date(session, cur)
        except Exception as e:
            print(f"❌ {cur.date()} failed → {e}")

        time.sleep(0.6)
        cur += timedelta(days=1)

# ============================================================
# ======================= ENTRY ===============================
# ============================================================

if __name__ == "__main__":
    run()
