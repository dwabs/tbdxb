"use client";

import { Area, AreaChart, ResponsiveContainer, Tooltip, YAxis } from "recharts";

const tooltipStyle = {
  borderRadius: 8,
  border: "1px solid var(--border)",
  background: "var(--popover)",
  color: "var(--popover-foreground)",
  fontSize: 12,
  padding: "6px 10px",
};

/** 12-week trend sparkline — no axes/gridlines, just shape. */
export function TrendSparkline({
  data,
  tooltipLabel,
}: {
  data: { label: string; value: number }[];
  tooltipLabel: string;
}) {
  const id = `trend-${tooltipLabel.replace(/\s+/g, "-")}`;
  return (
    <ResponsiveContainer width="100%" height={56}>
      <AreaChart data={data} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.35} />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <YAxis hide domain={[0, "auto"]} />
        <Tooltip
          contentStyle={tooltipStyle}
          labelFormatter={(label) => label}
          formatter={(value) => [value, tooltipLabel]}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke="var(--primary)"
          strokeWidth={1.5}
          fill={`url(#${id})`}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
