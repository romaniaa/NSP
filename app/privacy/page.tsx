import type { Metadata } from "next";
import Link from "next/link";
import LegalPage from "@/components/LegalPage";
import { CREATOR_NAME, CREATOR_URL } from "@/components/SiteFooter";
import { OPEN_GRAPH, SITE_NAME } from "@/lib/Site";

const TITLE = "Privacy Policy";
const DESCRIPTION = `How ${SITE_NAME} handles your data: no accounts, no cookies, no tracking. Your hills and theme stay in your own browser.`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/privacy" },
  openGraph: { ...OPEN_GRAPH, title: `${TITLE} | ${SITE_NAME}`, description: DESCRIPTION, url: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <LegalPage title={TITLE} updated="November 20, 2026">
      <p>
        {SITE_NAME} (openpeaks.ca) is a free ski conditions site run by{" "}
        <a href={CREATOR_URL}>{CREATOR_NAME}</a> in British Columbia, Canada. The
        short version: there are no accounts, no cookies of our own, no analytics and
        no ads. We don&apos;t collect your personal information and we don&apos;t sell
        or share anything about you.
      </p>

      <h2>What stays in your browser</h2>
      <p>
        Two settings are saved in your browser&apos;s local storage, on your device
        only. They are never sent to us.
      </p>
      <ul>
        <li>
          <strong>My hills</strong>: the list of hills and backcountry zones you pick
          for your home page.
        </li>
        <li>
          <strong>Theme</strong>: whether you chose light or dark mode.
        </li>
      </ul>
      <p>
        You can clear them at any time by clearing this site&apos;s data in your
        browser settings. When you share your hills, the list goes in the part of the
        link after the <code>#</code>, which browsers don&apos;t send to the server.
      </p>

      <h2>Hosting and server logs</h2>
      <p>
        The site is hosted on Vercel. Like any web host, Vercel processes basic
        technical information when your browser requests a page, such as your IP
        address, browser type, the page requested and the time, to deliver the site and
        protect it from abuse. We don&apos;t use this information to identify you.
        Vercel is based in the United States, so this information may be processed
        outside Canada. See{" "}
        <a href="https://vercel.com/legal/privacy-policy">Vercel&apos;s privacy policy</a>.
      </p>

      <h2>Weather and avalanche data</h2>
      <p>
        Forecasts, snow reports and avalanche ratings are fetched by our server from
        Open-Meteo, Avalanche Canada and the resorts&apos; own reports. Your browser
        doesn&apos;t contact those services, and nothing about you is sent to them.
        Fonts are served from openpeaks.ca itself, not from a third-party font service.
      </p>

      <h2>Webcams</h2>
      <p>
        Hill pages embed live webcams from the resorts and their webcam providers (for
        example Skaping, CamStreamer and YouTube). These load directly from those
        services once you scroll to them, so they receive your IP address and browser
        information and may set their own cookies. Their privacy policies apply to
        those embeds, not this one.
      </p>

      <h2>Links to other sites</h2>
      <p>
        We link to resorts, Avalanche Canada and other sites. Once you follow a link,
        that site&apos;s privacy policy applies.
      </p>

      <h2>Children</h2>
      <p>
        {SITE_NAME} isn&apos;t directed at children and doesn&apos;t knowingly collect
        information from anyone, children included.
      </p>

      <h2>Changes</h2>
      <p>
        If the site starts handling data differently, for example by adding analytics,
        this page will be updated first and the date at the top will change.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about privacy? Get in touch through{" "}
        <a href={CREATOR_URL}>romanhermens.com</a>. See also the{" "}
        <Link href="/terms">Terms of Use</Link>.
      </p>
    </LegalPage>
  );
}
