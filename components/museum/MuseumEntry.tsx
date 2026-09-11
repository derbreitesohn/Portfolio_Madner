"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";

const MuseumExperience = dynamic(() => import("./MuseumExperience"), { ssr: false });

export default function MuseumEntry() {
  const router = useRouter();
  return <MuseumExperience onBack={() => router.push("/")} />;
}
