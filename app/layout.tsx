import type { Metadata } from "next";
import { Barlow, Barlow_Condensed, IBM_Plex_Mono } from "next/font/google";
import Topo from "@/components/Topo";
import {
  HOME_DESCRIPTION,
  HOME_TITLE,
  OPEN_GRAPH,
  SITE_NAME,
  SITE_URL,
} from "@/lib/Site";
import "./globals.css";

const barlow = Barlow({
  variable: "--font-barlow",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const barlowCondensed = Barlow_Condensed({
  variable: "--font-barlow-condensed",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${HOME_TITLE} | ${SITE_NAME}`,
    template: `%s | ${SITE_NAME}`,
  },
  description: HOME_DESCRIPTION,
  applicationName: SITE_NAME,
  openGraph: OPEN_GRAPH,
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en-CA"
      className={`${barlow.variable} ${barlowCondensed.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="relative flex min-h-full flex-col font-sans">
        <Topo />
        {children}
      </body>
    </html>
  );
}
