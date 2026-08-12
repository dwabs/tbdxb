import { Card, CardContent } from "@/components/ui/card";

export function StatTile({
  label,
  value,
  caption,
}: {
  label: string;
  value: string | number;
  caption?: string;
}) {
  return (
    <Card>
      <CardContent>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="mt-1 text-2xl font-semibold tracking-tight">{value}</p>
        {caption ? (
          <p className="mt-1 text-xs text-muted-foreground">{caption}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
