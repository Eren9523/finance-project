import React from 'react';
export const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="p-8">
    <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
    <p className="mt-2 text-slate-500">页面开发中...</p>
  </div>
);
