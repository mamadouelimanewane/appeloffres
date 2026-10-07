import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Console admin — Appeldoffres.sn",
  robots: { index: false, follow: false },
};

export default function LayoutAdmin({ children }: { children: React.ReactNode }) {
  return children;
}
