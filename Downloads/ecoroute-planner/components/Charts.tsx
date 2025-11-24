import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { RouteOption } from '../types';

interface ChartsProps {
  routes: RouteOption[];
}

export const EmissionsChart: React.FC<ChartsProps> = ({ routes }) => {
  // Sort by emissions descending for better visualization
  const data = [...routes].map(r => ({
    ...r,
    displayName: r.routeLabel ? `${r.mode} (${r.routeLabel})` : r.mode
  })).sort((a, b) => b.emissionsKg - a.emissionsKg);

  const getBarColor = (emissions: number) => {
    if (emissions === 0) return '#16a34a'; // Green-600
    if (emissions < 1) return '#65a30d'; // Lime-600
    if (emissions < 5) return '#ca8a04'; // Yellow-600
    return '#dc2626'; // Red-600
  };

  return (
    <div className="h-72 w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#cbd5e1" />
          <XAxis type="number" stroke="#334155" fontSize={12} tickFormatter={(val) => `${val}kg`} tick={{fill: '#000'}} />
          <YAxis 
            type="category" 
            dataKey="displayName" 
            stroke="#334155" 
            fontSize={11} 
            width={120}
            interval={0}
            tick={{fill: '#000', fontWeight: 500}}
          />
          <Tooltip 
            cursor={{ fill: '#f1f5f9' }}
            contentStyle={{ borderRadius: '8px', border: '1px solid #cbd5e1', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', color: '#000' }}
            itemStyle={{ color: '#000' }}
          />
          <Bar dataKey="emissionsKg" radius={[0, 4, 4, 0]} barSize={20}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(entry.emissionsKg)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};