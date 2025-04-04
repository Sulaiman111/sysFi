"use client"

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

const data = [
  {
    name: "Jan",
    invoices: 220,
    payments: 180,
  },
  {
    name: "Feb",
    invoices: 300,
    payments: 250,
  },
  {
    name: "Mar",
    invoices: 500,
    payments: 450,
  },
  {
    name: "Apr",
    invoices: 400,
    payments: 420,
  },
  {
    name: "May",
    invoices: 550,
    payments: 500,
  },
  {
    name: "Jun",
    invoices: 600,
    payments: 580,
  },
]

export function Overview() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={data}>
        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
        <Tooltip />
        <Line type="monotone" dataKey="invoices" stroke="#8884d8" strokeWidth={2} activeDot={{ r: 8 }} />
        <Line type="monotone" dataKey="payments" stroke="#82ca9d" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  )
}

