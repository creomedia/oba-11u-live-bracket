import "./globals.css";

export const metadata = {
  title: "2026 11U AAA OBA Live Bracket",
  description: "Live 11U AAA OBA Championship bracket from Riverside."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
