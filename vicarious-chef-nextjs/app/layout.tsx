import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "The Vicarious Chef – Prototype",
  description: "A playable game-show concept where chefs guide contestants in real time.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
