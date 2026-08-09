"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const MAROON = "#4A2536";
const PINK = "#F47EB4";
const CATEGORY_COLORS = ["#4A2536", "#F47EB4", "#BE3775", "#7A5766", "#EE6BA6", "#331924"];

const AED = new Intl.NumberFormat("en-AE", {
  style: "currency",
  currency: "AED",
  maximumFractionDigits: 0,
});

const tickStyle = { fontSize: 12, fill: "var(--muted-foreground)" };
const tooltipStyle = {
  borderRadius: 8,
  border: "1px solid var(--border)",
  fontSize: 13,
};

function truncate(label: string, max = 18) {
  return label.length > max ? `${label.slice(0, max - 1)}…` : label;
}

export function OverviewCharts({
  weeklySeries,
  topEvents,
  categoryData,
  conversionData,
}: {
  weeklySeries: { week: string; tickets: number; revenue: number }[];
  topEvents: { title: string; tickets: number }[];
  categoryData: { category: string; count: number }[];
  conversionData: { title: string; views: number; tickets: number; rate: number }[];
}) {
  const hasBookings = weeklySeries.some((w) => w.tickets > 0 || w.revenue > 0);

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Tickets & revenue, last 12 weeks</CardTitle>
        </CardHeader>
        <CardContent>
          {hasBookings ? (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={weeklySeries} margin={{ left: -16, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="week" tick={tickStyle} tickLine={false} axisLine={false} />
                <YAxis yAxisId="tickets" tick={tickStyle} tickLine={false} axisLine={false} allowDecimals={false} />
                <YAxis
                  yAxisId="revenue"
                  orientation="right"
                  tick={tickStyle}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v: number) => AED.format(v)}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(value, name) =>
                    name === "Net revenue"
                      ? [AED.format(Number(value)), name]
                      : [Number(value), name]
                  }
                />
                <Line
                  yAxisId="tickets"
                  type="monotone"
                  dataKey="tickets"
                  name="Tickets sold"
                  stroke={MAROON}
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  yAxisId="revenue"
                  type="monotone"
                  dataKey="revenue"
                  name="Net revenue"
                  stroke={PINK}
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="py-16 text-center text-sm text-muted-foreground">
              No bookings in the last 12 weeks yet.
            </p>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Top events by tickets sold</CardTitle>
          </CardHeader>
          <CardContent>
            {topEvents.length === 0 ? (
              <p className="py-16 text-center text-sm text-muted-foreground">No tickets sold yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={topEvents} layout="vertical" margin={{ left: 8, right: 16 }}>
                  <XAxis type="number" tick={tickStyle} tickLine={false} axisLine={false} allowDecimals={false} />
                  <YAxis
                    type="category"
                    dataKey="title"
                    tick={tickStyle}
                    tickLine={false}
                    axisLine={false}
                    width={110}
                    tickFormatter={(v: string) => truncate(v, 16)}
                  />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="tickets" name="Tickets sold" fill={MAROON} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Events by category</CardTitle>
          </CardHeader>
          <CardContent>
            {categoryData.length === 0 ? (
              <p className="py-16 text-center text-sm text-muted-foreground">No events yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    dataKey="count"
                    nameKey="category"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                  >
                    {categoryData.map((entry, i) => (
                      <Cell key={entry.category} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            )}
            {categoryData.length > 0 ? (
              <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                {categoryData.map((entry, i) => (
                  <li key={entry.category} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span
                      className="size-2 shrink-0 rounded-full"
                      style={{ backgroundColor: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }}
                    />
                    {entry.category} ({entry.count})
                  </li>
                ))}
              </ul>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Views → bookings conversion</CardTitle>
          </CardHeader>
          <CardContent>
            {conversionData.length === 0 ? (
              <p className="py-16 text-center text-sm text-muted-foreground">
                No viewed events yet.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={conversionData} margin={{ left: -16, right: 8 }}>
                  <XAxis
                    dataKey="title"
                    tick={tickStyle}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v: string) => truncate(v, 10)}
                  />
                  <YAxis tick={tickStyle} tickLine={false} axisLine={false} unit="%" />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(value, _name, item) => [
                      `${value}% (${item.payload.tickets}/${item.payload.views})`,
                      "Conversion",
                    ]}
                  />
                  <Bar dataKey="rate" name="Conversion" fill={PINK} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
