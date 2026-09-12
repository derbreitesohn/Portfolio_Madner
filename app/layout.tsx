// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Flo Madner — Creative Developer",
  description: "Flo Madner is a Creative Computing student and developer in Austria. Explore his web apps, games and Blender-built 3D museum, or download his CV.",
  metadataBase: new URL("https://portfolio-madner.vercel.app"),
  openGraph: {
    title: "Flo Madner — Creative Developer",
    description: "Websites, games & spaces to explore. Step inside the Flooded Museum or browse my selected work.",
    type: "website",
    locale: "en_GB",
    images: [{ url: "/museum/preview.webp", width: 1440, height: 1029, alt: "The Flooded Museum by Flo Madner" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Flo Madner — Creative Developer",
    description: "Websites, games & spaces to explore.",
    images: ["/museum/preview.webp"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
