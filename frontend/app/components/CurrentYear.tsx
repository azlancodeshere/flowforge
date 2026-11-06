
"use client";

import { useEffect, useState } from "react";

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
