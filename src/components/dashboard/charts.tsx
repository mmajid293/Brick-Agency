"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const COLORS = ["#b7410e", "#ffb77e", "#8a4901", "#dec2a1", "#58423a"];

interface ChartsProps {
  productionHistory: { date: string; produced: number; wastage: number }[];
  expenseChart: { category: string; amount: number }[];
  monthProfit: number;
}

export function DashboardCharts({ productionHistory, expenseChart, monthProfit }: ChartsProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="heat-glow">
        <CardHeader>
          <CardTitle>7-Day Brick Production</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={productionHistory}>
              <defs>
                <linearGradient id="brickGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#b7410e" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#b7410e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--outline-variant)" opacity={0.3} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "var(--on-surface-variant)" }} />
              <YAxis tick={{ fontSize: 11, fill: "var(--on-surface-variant)" }} />
              <Tooltip
                contentStyle={{
                  background: "var(--surface-container-high)",
                  border: "1px solid var(--outline-variant)",
                  borderRadius: "8px",
                  color: "var(--on-surface)",
                }}
              />
              <Area type="monotone" dataKey="produced" stroke="#b7410e" fill="url(#brickGrad)" name="Produced" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card className="heat-glow">
        <CardHeader>
          <CardTitle>Monthly Expenses (PKR)</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={expenseChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--outline-variant)" opacity={0.3} />
              <XAxis dataKey="category" tick={{ fontSize: 10, fill: "var(--on-surface-variant)" }} />
              <YAxis tick={{ fontSize: 11, fill: "var(--on-surface-variant)" }} />
              <Tooltip
                formatter={(v) => `PKR ${Number(v).toLocaleString()}`}
                contentStyle={{
                  background: "var(--surface-container-high)",
                  border: "1px solid var(--outline-variant)",
                  borderRadius: "8px",
                  color: "var(--on-surface)",
                }}
              />
              <Bar dataKey="amount" fill="#b7410e" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card className="heat-glow lg:col-span-2">
        <CardHeader>
          <CardTitle>
            Monthly Profit/Loss:{" "}
            <span className={monthProfit >= 0 ? "text-secondary" : "text-error"}>
              PKR {monthProfit.toLocaleString()}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex h-48 items-center justify-center">
          <ResponsiveContainer width="50%" height="100%">
            <PieChart>
              <Pie data={expenseChart} dataKey="amount" nameKey="category" cx="50%" cy="50%" outerRadius={70} label>
                {expenseChart.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "var(--surface-container-high)",
                  border: "1px solid var(--outline-variant)",
                  borderRadius: "8px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
