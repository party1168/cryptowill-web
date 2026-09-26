import { notFound } from "next/navigation";
import type { ReactNode } from "react";

// The dev console is an integration tool, not part of the product: 404 outside `next dev`.
export default function DevLayout({ children }: { children: ReactNode }) {
  if (process.env.NODE_ENV === "production") notFound();
  return children;
}
