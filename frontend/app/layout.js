export const metadata = {
  title: "IPL Simulator",
  description: "Cricket Simulation Game"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
