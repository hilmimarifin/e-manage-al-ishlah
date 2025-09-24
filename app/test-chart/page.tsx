"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis } from "recharts";

const data = [
  { name: "A", value: 400 },
  { name: "B", value: 300 },
];

const COLORS = ['#0088FE', '#00C49F'];

export default function TestChart() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-8">Chart Test Page</h1>
      
      {/* Simple Pie Chart Test */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Simple Pie Chart</h2>
        <div className="w-full h-64 border border-gray-300">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Simple Bar Chart Test */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Simple Bar Chart</h2>
        <div className="w-full h-64 border border-gray-300">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis dataKey="name" />
              <YAxis />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
