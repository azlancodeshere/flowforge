
"use client";

import { useEffect, useState } from "react";

/**
 * Copyright year for the footer.
 *
 * The landing page is statically prerendered, and Next.js 16 refuses to
 * prerender `new Date()` inside a client component, so the value cannot be
 * read during render. It has to be resolved on the client after hydration.
 *
 * The read is deferred into a timeout callback rather than being called
 * directly in the effect body: that keeps react-hooks/set-state-in-effect
 * happy and avoids a synchronous cascading render, while still producing
 * the correct year as soon as the page is interactive.
 */
export default function CurrentYear() {
  const [year, setYear] = useState<number | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setYear(new Date().getFullYear()), 0);

    return () => clearTimeout(timer);
  }, []);

  if (year === null) {
    return null;
  }

  return <>{year}</>;
}
