import type { ReactNode } from "react";

import { Card, CardContent } from "@/components/ui/card";

export function StatTile({
  label,
  value,
  caption,
  chart,
}: {
  label: string;
  value: string | number;
  caption?: string;
  chart?: ReactNode;
}) {
  return (
    <Card className={chart ? "overflow-hidden" : undefined}>
      <CardContent>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="mt-1 text-2xl font-semibold tracking-tight">{value}</p>
        {caption ? (
          <p className="mt-1 text-xs text-muted-foreground">{caption}</p>
        ) : null}
        {chart ? <div className="-mx-2 mt-3 -mb-2">{chart}</div> : null}
      </CardContent>
    </Card>
  );
}
