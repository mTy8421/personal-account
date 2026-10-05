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
      <div className="rounded-xl bg-white p-3 shadow-lg border border-zinc-200 dark:bg-zinc-800 dark:border-zinc-700">
        <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">
          {item.categoryName}
        </p>
        <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
          {formatCurrency(item.amount)}
        </p>
        <p className="text-xs text-zinc-400">{item.percentage}% ของรายจ่ายทั้งหมด</p>
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
    return <div className="h-64 w-full animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-800" />;
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center text-center text-zinc-400">
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
                <Cell key={`cell-${index}`} fill={entry.color || "#10b981"} />
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
            className="flex items-center justify-between rounded-lg p-1.5 hover:bg-zinc-50 dark:hover:bg-zinc-800/60"
          >
            <div className="flex items-center gap-2">
              <span
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: item.color || "#10b981" }}
              />
              <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300 truncate max-w-[120px]">
                {item.categoryName}
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                {formatCurrency(item.amount)}
              </span>
              <span className="ml-1 text-[11px] text-zinc-400">({item.percentage}%)</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
