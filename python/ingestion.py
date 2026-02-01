import pandas as pd
import io

def parse_and_merge(bhavcopy_file, delivery_file, fno_bhavcopy_file=None):
    try:
        # --------------------
        # F&O SYMBOL MAP
        # --------------------
        fno_symbols = set()
        if fno_bhavcopy_file:
            df_fno = pd.read_csv(fno_bhavcopy_file)
            df_fno.columns = [c.strip() for c in df_fno.columns]
            df_fno.rename(columns={
                "TckrSymb": "symbol",
                "FinInstrmTp": "instrument"
            }, inplace=True)
            df_fno["symbol"] = df_fno["symbol"].astype(str).str.strip().str.upper()
            fno_symbols = set(
                df_fno[
                    df_fno["instrument"].isin(["STF", "STO"])
                ]["symbol"]
            )

        # --------------------
        # PRICE DATA
        # --------------------
        df_price = pd.read_csv(bhavcopy_file)
        df_price.columns = [c.strip() for c in df_price.columns]

        col_map = {
            'TradDt': 'trade_date',
            'TckrSymb': 'symbol',
            'SctySrs': 'series',
            'OpnPric': 'open',
            'HghPric': 'high',
            'LwPric': 'low',
            'ClsPric': 'close',
            'PrvsClsgPric': 'prev_close',
            'TtlTradgVol': 'volume',
            'ISIN': 'ISIN'
        }
        df_price.rename(columns=col_map, inplace=True)

        df_price = df_price[
            (df_price['series'] == 'EQ') &
            (df_price['ISIN'].str.startswith('INE', na=False))
        ]

        # --------------------
        # DELIVERY DATA
        # --------------------
        df_del = pd.read_csv(delivery_file)
        df_del.columns = [c.strip() for c in df_del.columns]

        df_del.rename(columns={
            'SYMBOL': 'symbol',
            'SERIES': 'series',
            'DATE1': 'trade_date',
            'DELIV_QTY': 'delivery_qty',
            'DELIV_PER': 'delivery_pct'
        }, inplace=True)

        df_del['series'] = (
            df_del['series']
            .astype(str)
            .str.strip()      # removes leading/trailing whitespace
            .str.upper()     # safety
        )

        df_del = df_del[df_del['series'] == 'EQ']

        # --------------------
        # STANDARDIZATION
        # --------------------
        for df in [df_price, df_del]:
            df['trade_date'] = pd.to_datetime(df['trade_date'])
            df['symbol'] = df['symbol'].astype(str).str.strip().str.upper()
            df['series'] = df['series'].astype(str).str.strip().str.upper()

        # --------------------
        # STRICT MERGE
        # --------------------
        merged = pd.merge(
            df_price,
            df_del[['trade_date', 'symbol', 'series', 'delivery_qty', 'delivery_pct']],
            on=['trade_date', 'symbol', 'series'],
            how='inner'
        )

        if merged.empty:
            raise ValueError("Merged 0 records")

        # --------------------
        # ADD F&O FLAG
        # --------------------
        merged["is_fno"] = merged["symbol"].isin(fno_symbols)

        merged['trade_date'] = merged['trade_date'].dt.strftime('%Y-%m-%d')

        return merged[[
            'trade_date', 'symbol', 'open', 'high', 'low', 'close',
            'prev_close', 'volume', 'delivery_qty', 'delivery_pct', 'is_fno'
        ]]

    except Exception as e:
        raise ValueError(f"Error processing files: {e}")




# delv_file = r'F:\Markets\Stocks\sec_bhavdata_full_30012026.csv'
# bhav_file = r'F:\Markets\Stocks\BhavCopy_NSE_CM_0_0_0_20260130_F_0000.csv'
# parse_and_merge(bhav_file, delv_file)