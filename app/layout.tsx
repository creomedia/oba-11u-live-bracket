import "./globals.css";

export const metadata = {
  title: "2026 11U AAA OBA Provincial Championship | Live Bracket",
  description: "Live 11U AAA OBA Provincial Championship bracket from Windsor, Ontario."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
