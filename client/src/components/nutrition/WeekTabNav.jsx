import React from 'react';

const DAYS = [
  { num: 1, label: 'Mon' },
  { num: 2, label: 'Tue' },
  { num: 3, label: 'Wed' },
  { num: 4, label: 'Thu' },
  { num: 5, label: 'Fri' },
  { num: 6, label: 'Sat' },
  { num: 7, label: 'Sun' }
];

export default function WeekTabNav({ activeDay, onChange }) {
  return (
    <div className="flex bg-primary/5 p-1 rounded-full border border-primary/10 overflow-x-auto custom-scrollbar no-scrollbar scrollbar-none max-w-lg">
      <div className="flex gap-1 w-full min-w-max">
        {DAYS.map((d) => (
          <button
            key={d.num}
            onClick={() => onChange(d.num)}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all-smooth cursor-pointer ${
              activeDay === d.num
                ? 'bg-primary text-white shadow-sm'
                : 'text-muted hover:text-primary hover:bg-primary/5'
            }`}
          >
            {d.label}
          </button>
        ))}
      </div>
    </div>
  );
}
