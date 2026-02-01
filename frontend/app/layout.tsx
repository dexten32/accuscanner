import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "Accuscan",
    description: "Detect Institutional Accumulation",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className="antialiased min-h-screen selection:bg-emerald-500 selection:text-white">
                {children}
            </body>
        </html>
    );
}
