# Delivery Accumulation Scanner

This project is a stock market scanner designed to identify accumulation patterns in NSE stocks. It consists of a Node.js/Express backend, a Next.js frontend, and Python scripts for data ingestion.

## Prerequisites

-   **Node.js**: v18+ installed.
-   **Python**: v3.8+ installed.
-   **PostgreSQL**: A database instance (Supabase is used in this project).

## 1. Setup & Installation

### Backend
1.  Navigate to the backend folder:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Set up environment variables:
    -   Create a `.env` file in `backend/` (see `backend/.env.example` if available).
    -   Required variables:
        ```env
        DATABASE_URL="postgresql://user:password@host:port/database"
        JWT_SECRET="your_secret_key"
        PORT=3001
        ```
4.  Generate Prisma Client:
    ```bash
    npx prisma generate
    ```

### Frontend
1.  Navigate to the frontend folder:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Set up environment variables:
    -   Create a `.env.local` file in `frontend/`.
    -   Required variables:
        ```env
        NEXT_PUBLIC_RAZORPAY_KEY_ID="your_razorpay_key"
        ```

### Python (Data Ingestion)
1.  Navigate to the python folder:
    ```bash
    cd python
    ```
2.  Create a virtual environment (optional but recommended):
    ```bash
    python -m venv venv
    # Windows:
    .\venv\Scripts\activate
    # Mac/Linux:
    source venv/bin/activate
    ```
3.  Install dependencies:
    ```bash
    pip install pandas psycopg2-binary requests python-dotenv
    ```

---

## 2. Running the Application

You need to run the backend and frontend in separate terminals.

**Terminal 1: Start Backend**
```bash
cd backend
npm run dev
```
*Server runs on http://localhost:3001*

**Terminal 2: Start Frontend**
```bash
cd frontend
npm run dev
```
*Website runs on http://localhost:3000*

**Terminal 3: Python Workers (Optional)**
This is essential if you want the "Run Scanner" button on the website to trigger scanner logic.
*(Note: The backend currently triggers scanner logic via python script execution, so just ensuring the environment is set up is enough. The backend will call `python worker.py` automatically.)*

---

## 3. Adding New Data (Data Ingestion)

To populate the database with new market data, you have two options using the scripts in the `python/` folder.

### Option A: Automatic Download & Ingest (Recommended)

This script downloads Bhavcopies and Delivery reports separately from NSE, merges them, and saves them to the database.

1.  Open `python/auto_ingest.py`.
2.  Update the `start_date` and `end_date` in the `main()` function to the range you want to ingest:
    ```python
    start_date = datetime(2024, 1, 1) # Set your start date
    end_date = datetime.now()         # Set your end date
    ```
3.  Run the script:
    ```bash
    cd python
    python auto_ingest.py
    ```

### Option B: Manual Single File Ingest

If you have a combined CSV file (containing Symbol, Date, OHLC, Volume, Delivery Data), you can ingest it manually.

1.  Run the script pointing to your CSV file:
    ```bash
    cd python
    python ingest_daily.py "path/to/your/file.csv"
    ```

### How Data Flow Works
1.  **Ingestion**: Python scripts (`auto_ingest.py`) fetch raw data and save it to the `raw_market_data` table.
2.  **Scanning**: When a user clicks "Run Scanner" on the website:
    -   The Backend API calls `python/worker.py`.
    -   `worker.py` reads from `raw_market_data`, calculates metrics (Volume Spike, Delivery %), filters based on logic, and saves results to `scanner_results` table.
3.  **Viewing**: The Frontend fetches processed data from `scanner_results` table.
