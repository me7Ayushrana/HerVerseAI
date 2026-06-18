import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

export default function MacroRing({ targetCalories, proteinG, carbG, fatG }) {
  const pKcal = (proteinG || 0) * 4;
  const cKcal = (carbG || 0) * 4;
  const fKcal = (fatG || 0) * 9;
  const totalCal = pKcal + cKcal + fKcal || 1;

  const data = [
    { name: 'Protein', value: Math.round(proteinG || 0), kcal: Math.round(pKcal), percentage: Math.round((pKcal / totalCal) * 100), color: '#EC4899' },
    { name: 'Carbs', value: Math.round(carbG || 0), kcal: Math.round(cKcal), percentage: Math.round((cKcal / totalCal) * 100), color: '#A78BFA' },
    { name: 'Fats', value: Math.round(fatG || 0), kcal: Math.round(fKcal), percentage: Math.round((fKcal / totalCal) * 100), color: '#10B981' }
  ];

  return (
    <div className="glass-card p-6 border-primary/20 shadow-sm flex flex-col md:flex-row items-center gap-6">
      {/* Chart */}
      <div className="relative w-44 h-44 flex-shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={75}
              paddingAngle={4}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-display font-extrabold text-gradient">{Math.round(targetCalories || 0)}</span>
          <span className="text-[10px] text-muted uppercase font-bold tracking-wider">kcal target</span>
        </div>
      </div>

      {/* Legend & Details */}
      <div className="flex-1 space-y-3 w-full">
        <h4 className="text-xs font-bold text-muted uppercase tracking-wider mb-2 border-b border-primary/5 pb-1">Target Macros</h4>
        {data.map((item, index) => (
          <div key={index} className="flex justify-between items-center text-xs">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
              <span className="font-semibold text-textMain">{item.name}</span>
            </div>
            <div className="text-right">
              <span className="font-bold text-textMain">{item.value}g</span>
              <span className="text-muted text-[10px] ml-1.5">({item.percentage}%)</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
