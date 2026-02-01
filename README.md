# Delivery Accumulation Scanner

A powerful tool designed to detect **Institutional Accumulation** in NSE stocks by analyzing delivery percentage, volume spikes, and price stability.

## 🚀 Overview

The **Delivery Accumulation Scanner** helps traders identify stocks that are being quietly accumulated by big players before a potential price breakout. It filters stocks based on:
*   High Delivery Percentage (Real buying)
*   Abnormal Volume Spikes (Interest)
*   Low Price Volatility (Accumulation within a range)

This tool is built with **Python**, **Streamlit**, and **SQLite**.

## ✨ Key Features

*   **Accumulation Detection**: specific algorithms to find high delivery + volume with low price movement.
*   **Historical Analysis**: Uses a local SQLite database to compute volume averages and compare against history.
*   **Interactive Dashboard**: A clean, web-based UI built with Streamlit to run scans and view results.
*   **Customizable Filters**: Adjust Minimum Delivery %, Volume Multiplier, and Price Move thresholds on the fly.
*   **Scoring System**: Ranks stocks based on the strength of the accumulation signal.

## 📂 Project Structure

*   `app.py`: The main entry point for the Streamlit application. Handles the UI and user interaction.
*   `scanner.py`: Contains the core logic for the scanner engine, filtering, and scoring algorithms.
*   `database.py`: Manages SQLite database connections, table creation, and data retrieval (daily equity data).
*   `market_data.db`: The local SQLite database storing historical price and delivery data.

## 🛠️ Installation & Setup

### Prerequisites
*   Python 3.8 or higher
*   pip (Python package manager)

### Steps

1.  **Clone the repository** (or download the source code):
    ```bash
    git clone <repository-url>
    cd <repository-directory>
    ```

2.  **Install dependencies**:
    ```bash
    pip install -r requirements.txt
    ```
    *Note: If `requirements.txt` is missing, you will need `streamlit`, `pandas`, and `numpy`.*

## 🖥️ Usage

1.  **Run the Application**:
    ```bash
    streamlit run app.py
    ```

2.  **Using the Scanner**:
    *   The app will check for existing data in `market_data.db`.
    *   **Select Trade Date**: Choose the date you want to analyze from the sidebar.
    *   **Adjust Settings**:
        *   **Min Delivery %**: Minimum percentage of volume that resulted in delivery (default: 35%).
        *   **Volume Spike**: How many times the current volume is higher than average (default: 2.0x).
        *   **Max Price Move %**: Maximum absolute price change allowed (default: 1.5%).
    *   **Run Scan**: Click the "Run Scan" button to see the results.

3.  **Data Ingestion** (Important):
    *   This scanner relies on historical NSE data (CM-UDiFF Bhavcopy and Security Delivery Data).
    *   Ensure your `market_data.db` is populated. The `database.py` file contains an `insert_daily_data` function that is designed to work with data ingestion scripts (not fully detailed here, but expected to be part of your data pipeline).

## ⚠️ Disclaimer

**This tool is for informational and analytical purposes only.**
It does not constitute investment advice or trading recommendations. The creator is not a SEBI-registered investment advisor. Users are solely responsible for their own trading decisions.
