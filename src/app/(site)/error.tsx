"use client";

import { useEffect } from "react";
import { siteButtonClassName } from "@/components/site/site-button";

export default function SiteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="container-page flex flex-col items-center py-32 text-center">
      <h1 className="font-display text-3xl font-bold text-ink">Something went wrong</h1>
      <p className="mt-3 max-w-md text-sm text-body">Please try again in a moment.</p>
      <button type="button" onClick={reset} className={`${siteButtonClassName} mt-10`}>
        Try again
      </button>
    </section>
  );
}
