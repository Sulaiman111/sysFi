"use client"

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

const data = [
  {
    name: "Jan",
    total: 18000,
  },
  {
    name: "Feb",
    total: 22000,
  },
  {
    name: "Mar",
    total: 32000,
  },
  {
    name: "Apr",
    total: 28000,
  },
  {
    name: "May",
    total: 35000,
  },
  {
    name: "Jun",
    total: 42000,
  },
  {
    name: "Jul",
    total: 38000,
  },
  {
    name: "Aug",
    total: 45000,
  },
  {
    name: "Sep",
    total: 48000,
  },
  {
    name: "Oct",
    total: 52000,
  },
  {
    name: "Nov",
    total: 58000,
  },
  {
    name: "Dec",
    total: 65000,
  },
]

export function RevenueChart() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `$${value / 1000}k`}
        />
        <Tooltip
          formatter={(value: number) => [`$${value.toLocaleString()}`, "Revenue"]}
          labelFormatter={(label) => `Month: ${label}`}
        />
        <Bar dataKey="total" fill="currentColor" radius={[4, 4, 0, 0]} className="fill-primary" />
      </BarChart>
    </ResponsiveContainer>
  )
}

