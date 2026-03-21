import "./globals.css";

export const metadata = {
  title: "IPL Simulator",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
