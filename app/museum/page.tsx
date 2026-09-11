import type { Metadata } from "next";
import Link from "next/link";
import MuseumEntry from "@/components/museum/MuseumEntry";

export const metadata: Metadata = {
  title: "The Flooded Museum — Flo Madner",
  description: "Explore Flo Madner's projects inside an overgrown, flooded museum. An interactive portfolio built with Blender and Three.js.",
};

export default function MuseumPage() {
  return <>
    <MuseumEntry />
    <noscript><p style={{ padding: "2rem" }}>This walkthrough needs JavaScript. <Link href="/#projects">View Flo&apos;s projects in the portfolio.</Link></p></noscript>
  </>;
}
