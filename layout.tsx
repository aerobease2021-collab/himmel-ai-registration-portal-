import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Himmel AI | Partner & Freelancer Registration",
  description: "Join the Himmel AI network of vendors and freelance professionals.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}