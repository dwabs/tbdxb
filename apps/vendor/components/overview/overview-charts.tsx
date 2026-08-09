"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const MAROON = "#4A2536";
const PINK = "#F47EB4";

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

function truncate(label: string, max = 10) {
  return label.length > max ? `${label.slice(0, max - 1)}…` : label;
}

export function OverviewCharts({
  weeklySeries,
  conversionData,
}: {
  weeklySeries: { week: string; tickets: number; revenue: number }[];
  conversionData: { title: string; views: number; tickets: number; rate: number }[];
}) {
  const hasBookings = weeklySeries.some((w) => w.tickets > 0 || w.revenue > 0);

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Tickets sold, last 12 weeks</CardTitle>
        </CardHeader>
        <CardContent>
          {hasBookings ? (
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={weeklySeries} margin={{ left: -16, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="week" tick={tickStyle} tickLine={false} axisLine={false} />
                <YAxis tick={tickStyle} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line
                  type="monotone"
                  dataKey="tickets"
                  name="Tickets sold"
                  stroke={MAROON}
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="py-10 text-center text-sm text-muted-foreground">
              No bookings in the last 12 weeks yet.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Net revenue, last 12 weeks</CardTitle>
        </CardHeader>
        <CardContent>
          {hasBookings ? (
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={weeklySeries} margin={{ left: 4, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="week" tick={tickStyle} tickLine={false} axisLine={false} />
                <YAxis
                  tick={tickStyle}
                  tickLine={false}
                  axisLine={false}
                  width={64}
                  tickFormatter={(v: number) => AED.format(v)}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(value) => [AED.format(Number(value)), "Net revenue"]}
                />
                <Line
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
            <p className="py-10 text-center text-sm text-muted-foreground">
              No bookings in the last 12 weeks yet.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Views → bookings conversion</CardTitle>
        </CardHeader>
        <CardContent>
          {conversionData.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              No viewed events yet.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={conversionData} margin={{ left: -16, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis
                  dataKey="title"
                  tick={tickStyle}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v: string) => truncate(v)}
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
  );
}
