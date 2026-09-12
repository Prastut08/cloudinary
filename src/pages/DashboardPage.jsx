import React from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { Image, Layers, Sparkles, CheckCircle2, ArrowUpRight } from 'lucide-react';

const STATS = [
  { label: 'Total Catalog Assets', value: '1,248', change: '+12% this month', icon: Image },
  { label: 'Generated Variants', value: '9,984', change: '8 presets active', icon: Layers },
  { label: 'Backgrounds Removed', value: '1,120', change: '98.4% success rate', icon: Sparkles },
  { label: 'Channel Sync Status', value: '100%', change: 'All endpoints live', icon: CheckCircle2 },
];

const RECENT_PRODUCTS = [
  { id: 'SKU-9021', name: 'Leather Minimalist Wallet', status: 'Processed', variants: 8, updated: '10 mins ago' },
  { id: 'SKU-9022', name: 'Matte Ceramic Coffee Mug', status: 'Processed', variants: 8, updated: '25 mins ago' },
  { id: 'SKU-9023', name: 'Ergonomic Desk Lamp', status: 'Queued', variants: 0, updated: '1 hour ago' },
  { id: 'SKU-9024', name: 'Linen Travel Backpack', status: 'Processed', variants: 8, updated: '3 hours ago' },
];

export default function DashboardPage() {
  return (
    <DashboardLayout>
      {/* Top Banner / Page Title */}
      <div className="flex items-center justify-between border-b border-neutral-200 pb-5">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 tracking-tight">Catalog Overview</h2>
          <p className="text-xs text-neutral-500 mt-1">
            Automated e-commerce & social media content transformation pipeline
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white border border-neutral-200 rounded-lg p-5 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between text-neutral-500">
                <span className="text-xs font-medium text-neutral-500">{stat.label}</span>
                <Icon className="w-4 h-4 text-neutral-400" />
              </div>
              <div className="mt-4">
                <div className="text-2xl font-bold text-neutral-900 tracking-tight">{stat.value}</div>
                <div className="text-[11px] text-neutral-400 font-normal mt-1">{stat.change}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Media Activity Table */}
      <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-neutral-900">Recent Media Queue</h3>
            <p className="text-xs text-neutral-500 mt-0.5">Static view of catalog asset transformation status</p>
          </div>
          <button className="text-xs text-neutral-600 hover:text-neutral-900 font-medium inline-flex items-center gap-1">
            View All Assets <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-neutral-100 bg-neutral-50/50 text-neutral-500 font-medium">
                <th className="py-3 px-6">SKU / ID</th>
                <th className="py-3 px-6">Product Title</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6">Variants</th>
                <th className="py-3 px-6 text-right">Last Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-neutral-700">
              {RECENT_PRODUCTS.map((prod) => (
                <tr key={prod.id} className="hover:bg-neutral-50/60 transition-colors">
                  <td className="py-3 px-6 font-mono text-[11px] text-neutral-500">{prod.id}</td>
                  <td className="py-3 px-6 font-medium text-neutral-900">{prod.name}</td>
                  <td className="py-3 px-6">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium ${
                        prod.status === 'Processed'
                          ? 'bg-neutral-100 text-neutral-800 border border-neutral-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {prod.status}
                    </span>
                  </td>
                  <td className="py-3 px-6">{prod.variants} generated</td>
                  <td className="py-3 px-6 text-right text-neutral-400">{prod.updated}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
