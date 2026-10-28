"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

export default function DashboardError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Card>
      <EmptyState
        icon={AlertTriangle}
        title="This page couldn't be loaded"
        description={error.digest ? `Reference: ${error.digest}` : "An unexpected error occurred."}
        action={<Button onClick={reset}>Try again</Button>}
      />
    </Card>
  );
}
