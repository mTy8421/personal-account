"use client";

import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { formatCurrency } from "@/lib/utils/currency";

interface MonthlyTrendChartProps {
  data: {
    month: string;
    income: number;
    expense: number;
    net: number;
  }[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl bg-card p-3 shadow-lg border border-border">
        <p className="text-xs font-bold text-foreground mb-1">
          {label}
        </p>
        {payload.map((item: any, i: number) => (
          <div key={i} className="flex justify-between gap-4 text-xs py-0.5">
            <span style={{ color: item.color }}>{item.name}:</span>
            <span className="font-semibold text-foreground">
              {formatCurrency(item.value)}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function MonthlyTrendChart({ data }: MonthlyTrendChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-72 w-full animate-pulse rounded-xl bg-muted" />;
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <XAxis
            dataKey="month"
            tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(val) => `${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="top"
            align="right"
            wrapperStyle={{ paddingBottom: 15, fontSize: 12 }}
          />
          <Bar
            name="รายรับ"
            dataKey="income"
            fill="#2A9D8F"
            radius={[4, 4, 0, 0]}
            maxBarSize={32}
          />
          <Bar
            name="รายจ่าย"
            dataKey="expense"
            fill="#DA4167"
            radius={[4, 4, 0, 0]}
            maxBarSize={32}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
