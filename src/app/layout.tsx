import type { Metadata } from "next";
import { VT323, Nunito, Caveat } from "next/font/google";
import "./globals.css";

const vt323 = VT323({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-vt323",
  display: "swap",
});

const nunito = Nunito({
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
  variable: "--font-nunito",
  display: "swap",
});

const caveat = Caveat({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-caveat",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Desktop Dear — A tiny computer filled with memories.",
  description:
    "Create a magical interactive virtual desktop filled with memories, messages, and surprises. Share one unique link. Let them discover your world.",
  keywords: ["digital gift", "virtual desktop", "nostalgic", "memories", "scrapbook", "Windows XP"],
  openGraph: {
    title: "Desktop Dear",
    description: "A tiny computer filled with memories.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${vt323.variable} ${nunito.variable} ${caveat.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
