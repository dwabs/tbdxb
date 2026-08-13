import { StatTile } from "@/components/stat-tile";

/** Same tile Overview uses, just a grid of them dropped onto a list page —
 *  the numbers should look like part of one system, not a second, lighter-
 *  weight widget style invented for list pages. */
export function PageStats({ items }: { items: { label: string; value: string | number }[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
      {items.map((item) => (
        <StatTile key={item.label} label={item.label} value={item.value} />
      ))}
    </div>
  );
}
