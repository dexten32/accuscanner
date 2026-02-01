# AccuScan

AccuScan is a specialized stock analysis tool designed to identify accumulation behavior in NSE stocks. It filters opportunities based on high delivery percentage, volume spikes, and controlled price action.

## Features

- **Advanced Scanning**: Filter stocks by Delivery %, Volume Multiples, and Price Action.
- **Visual Analytics**: Interactive charts and data visualization using Recharts/Framer Motion.
- **Historic Analysis**: Customizable lookback periods (10, 20, 30 days) for volume averaging.
- **Smart Scoring**: Proprietary scoring algorithm to rank potential accumulation candidates.
- **Modern UI**: Dark-mode optimized, responsive interface built with TailwindCSS.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS v4
- **Database**: SQLite (via `better-sqlite3`)
- **Icons**: Lucide React

## specific Requirements

- The application expects a SQLite database named `market_data.db` to exist in the **parent directory** of this project.
- This database must contain a `daily_equity_data` table with NSE bhavcopy data.

## Getting Started

1.  **Install Dependencies**
    ```bash
    npm install
    ```

2.  **Setup Database**
    Ensure `market_data.db` is present in the directory above the project root.

3.  **Run Development Server**
    ```bash
    npm run dev
    ```

4.  **Build for Production**
    ```bash
    npm run build
    npm start
    ```

## License

ISC
