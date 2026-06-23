import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fitness Dashboard",
  description: "Personalized fitness tracking dashboard (Next.js frontend).",
  applicationName: "Fitness Dashboard"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
