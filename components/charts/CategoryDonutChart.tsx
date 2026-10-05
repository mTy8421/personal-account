"use client";

import React, { useEffect, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { formatCurrency } from "@/lib/utils/currency";

interface CategoryDonutChartProps {
  data: {
    categoryName: string;
    amount: number;
    color: string;
    percentage: number;
  }[];
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const item = payload[0].payload;
    return (
      <div className="rounded-xl bg-card p-3 shadow-lg border border-border">
        <p className="text-xs font-semibold text-muted-foreground">
          {item.categoryName}
        </p>
        <p className="text-sm font-bold text-foreground">
          {formatCurrency(item.amount)}
        </p>
        <p className="text-xs text-muted-foreground">{item.percentage}% ของรายจ่ายทั้งหมด</p>
      </div>
    );
  }
  return null;
};

export function CategoryDonutChart({ data }: CategoryDonutChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-64 w-full animate-pulse rounded-xl bg-muted" />;
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center text-center text-muted-foreground">
        <p className="text-sm">ไม่มีข้อมูลรายจ่ายในเดือนนี้</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="h-64 w-full sm:w-1/2">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="amount"
              nameKey="categoryName"
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={4}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color || "#2A9D8F"} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="w-full sm:w-1/2 max-h-60 overflow-y-auto space-y-2 pr-2">
        {data.map((item, index) => (
          <div
            key={index}
            className="flex items-center justify-between rounded-lg p-1.5 hover:bg-muted/60 transition"
          >
            <div className="flex items-center gap-2">
              <span
                className="h-3 w-3 rounded-full shrink-0"
                style={{ backgroundColor: item.color || "#2A9D8F" }}
              />
              <span
                className="text-xs font-medium text-foreground truncate max-w-[120px]"
                title={item.categoryName}
              >
                {item.categoryName}
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-foreground">
                {formatCurrency(item.amount)}
              </span>
              <span className="ml-1 text-[11px] text-muted-foreground">({item.percentage}%)</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
