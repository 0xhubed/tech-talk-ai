import type { Metadata } from "next";
import {
  Inter,
  Space_Grotesk,
  Fira_Code,
} from "next/font/google";
import "katex/dist/katex.min.css";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-space-grotesk",
});

const firaCode = Fira_Code({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-fira-code",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "TechTalk AI by Daniel Huber | Policy, ML & Agents Showcase",
  description:
    "Interactive, animation-rich presentation website covering AI history, policy guardrails, machine learning foundations, housing price modeling, and agent discovery loops.",
  openGraph: {
    title: "TechTalk AI by Daniel Huber",
    description:
      "Learn the policy guardrails, machine learning foundations, and AI agents powering the talk with interactive housing price modeling and pendulum experiments.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TechTalk AI by Daniel Huber",
    description:
      "Interactive walkthrough of AI history, policy guardrails, machine learning foundations, scaling laws, and agent sandboxes built for live presenting.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="bg-[color:var(--color-bg-primary)]">
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} ${firaCode.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
