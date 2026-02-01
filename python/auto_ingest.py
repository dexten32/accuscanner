import requests
import zipfile
import io
import os
import time
from datetime import datetime, timedelta

from ingestion import parse_and_merge
from database import insert_daily_data, init_db

# --------------------------------------------------
# CONFIG
# --------------------------------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DOWNLOAD_DIR = os.path.join(BASE_DIR, "downloads")

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
    "sec_bhavdata_full_{date_ddmmyyyy}.csv"
)

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    "Accept-Language": "en-US,en;q=0.9",
    "Accept-Encoding": "gzip, deflate, br",
    "Connection": "keep-alive"
}

# --------------------------------------------------
# SESSION
# --------------------------------------------------
def setup_session():
    s = requests.Session()
    s.headers.update(HEADERS)
    s.get("https://www.nseindia.com", timeout=10)
    return s

# --------------------------------------------------
# UTIL
# --------------------------------------------------
def unzip_and_save(content, filename):
    with zipfile.ZipFile(io.BytesIO(content)) as z:
        for name in z.namelist():
            if name.endswith(".csv"):
                path = os.path.join(DOWNLOAD_DIR, filename)
                with open(path, "wb") as f:
                    f.write(z.read(name))
                return path
    return None

# --------------------------------------------------
# CORE: DOWNLOAD + INGEST (PER DAY)
# --------------------------------------------------
def process_date(session, date_obj):
    yyyymmdd = date_obj.strftime("%Y%m%d")
    ddmmyyyy = date_obj.strftime("%d%m%Y")

    print(f"\n📅 Processing {date_obj.date()}")

    cm_file = fo_file = del_file = None

    # --- CM Bhavcopy ---
    try:
        r = session.get(BHAVCOPY_URL.format(date=yyyymmdd), timeout=15)
        if r.status_code == 200:
            cm_file = unzip_and_save(
                r.content,
                f"CM_BhavCopy_{yyyymmdd}.csv"
            )
            print("✅ CM Bhavcopy")
        else:
            print("⏭️ CM Bhavcopy not available")
    except Exception as e:
        print(f"❌ CM error: {e}")

    # --- FO Bhavcopy ---
    try:
        r = session.get(FO_BHAVCOPY_URL.format(date=yyyymmdd), timeout=15)
        if r.status_code == 200:
            fo_file = unzip_and_save(
                r.content,
                f"FO_BhavCopy_{yyyymmdd}.csv"
            )
            print("✅ F&O Bhavcopy")
        else:
            print("⏭️ F&O Bhavcopy not available")
    except Exception as e:
        print(f"❌ FO error: {e}")

    # --- Delivery ---
    try:
        r = session.get(DELIVERY_URL.format(date_ddmmyyyy=ddmmyyyy), timeout=15)
        if r.status_code == 200:
            del_file = os.path.join(
                DOWNLOAD_DIR,
                f"DELIVERY_{ddmmyyyy}.csv"
            )
            with open(del_file, "wb") as f:
                f.write(r.content)
            print("✅ Delivery data")
        else:
            print("⏭️ Delivery data not available")
    except Exception as e:
        print(f"❌ Delivery error: {e}")

    # --- INGEST ONLY IF ALL REQUIRED FILES EXIST ---
    if cm_file and del_file:
        try:
            df = parse_and_merge(
                bhavcopy_file=cm_file,
                delivery_file=del_file,
                fno_bhavcopy_file=fo_file
            )
            insert_daily_data(df)
            print(f"📥 Ingested {len(df)} rows")
        except Exception as e:
            print(f"❌ Ingestion failed: {e}")
    else:
        print("⚠️ Skipped ingestion (missing CM or Delivery)")

# --------------------------------------------------
# MAIN
# --------------------------------------------------
def main():
    os.makedirs(DOWNLOAD_DIR, exist_ok=True)

    init_db()  # auto-create DB & tables

    start_date = datetime(2024, 1, 1)
    end_date = datetime.now()

    session = setup_session()

    current = start_date
    while current <= end_date:
        process_date(session, current)
        time.sleep(0.6)
        current += timedelta(days=1)

    print("\n✅ Pipeline completed")

# --------------------------------------------------
if __name__ == "__main__":
    main()
