import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Layers,
  Cpu,
  Truck,
  Package,
  Boxes,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  RefreshCw,
  TrendingUp,
  Activity,
  Plus,
  ClipboardList,
  Scale,
  Calendar,
  Building2,
  UserCheck
} from "lucide-react";
import { getDashboardStats } from "../services/reportService";

export const DashboardPage = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const userRole = (currentUser?.role || currentUser?.Role || "User").trim();

  const fetchStats = useCallback(async () => {
    try {
      setRefreshing(true);
      const res = await getDashboardStats();
      if (res?.success && res.data) {
        setStats(res.data);
      }
    } catch (err) {
      console.error("Failed to load dashboard metrics:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const projects = stats?.projects || {};
  const production = stats?.production || {};
  const machines = stats?.machines || {};
  const deliveries = stats?.deliveries || {};
  const store = stats?.store || {};
  const pending = stats?.pending || {};
  const recentProductions = stats?.recent_productions || [];
  const recentDeliveries = stats?.recent_deliveries || [];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner (Slim & Compact) */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 rounded-2xl px-5 py-3.5 sm:px-6 sm:py-4 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-blue-500/10 rounded-full blur-2xl pointer-events-none -mr-16 -mt-16" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-2">
              <span>Welcome, <span className="text-blue-300">{currentUser?.employee_name || currentUser?.name || "Operations Team"}</span></span>
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-semibold text-blue-200 border border-white/10">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {userRole} &bull; ERP Live
            </span>
          </div>

          <button
            onClick={fetchStats}
            disabled={refreshing}
            className="self-start md:self-auto px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold backdrop-blur-xs flex items-center gap-1.5 transition-all cursor-pointer border border-white/10 shadow-xs shrink-0"
          >
            <RefreshCw size={13} className={refreshing ? "animate-spin text-blue-300" : ""} />
            Refresh
          </button>
        </div>

        {/* Quick Action Navigation Bar - Slim Ribbon */}
        <div className="mt-3 pt-2.5 border-t border-white/10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          <button
            onClick={() => navigate("/pages/mainModule/sales-orders")}
            className="px-2.5 py-1.5 bg-white/5 hover:bg-white/15 rounded-lg text-left transition-all group cursor-pointer border border-white/5 flex items-center justify-between"
          >
            <div>
              <span className="text-[9px] text-pink-300 block leading-tight">Commercial</span>
              <span className="text-[11px] font-bold text-white group-hover:text-pink-200">Sales Orders</span>
            </div>
            <ArrowRight size={11} className="opacity-0 group-hover:opacity-100 transition-opacity text-pink-300" />
          </button>

          <button
            onClick={() => navigate("/pages/mainModule/projects")}
            className="px-2.5 py-1.5 bg-white/5 hover:bg-white/15 rounded-lg text-left transition-all group cursor-pointer border border-white/5 flex items-center justify-between"
          >
            <div>
              <span className="text-[9px] text-blue-300 block leading-tight">Step 1</span>
              <span className="text-[11px] font-bold text-white group-hover:text-blue-200">Products</span>
            </div>
            <ArrowRight size={11} className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-300" />
          </button>

          <button
            onClick={() => navigate("/pages/mainModule/planning")}
            className="px-2.5 py-1.5 bg-white/5 hover:bg-white/15 rounded-lg text-left transition-all group cursor-pointer border border-white/5 flex items-center justify-between"
          >
            <div>
              <span className="text-[9px] text-indigo-300 block leading-tight">Step 2</span>
              <span className="text-[11px] font-bold text-white group-hover:text-indigo-200">Planning</span>
            </div>
            <ArrowRight size={11} className="opacity-0 group-hover:opacity-100 transition-opacity text-indigo-300" />
          </button>

          <button
            onClick={() => navigate("/pages/mainModule/material-dispatches")}
            className="px-2.5 py-1.5 bg-white/5 hover:bg-white/15 rounded-lg text-left transition-all group cursor-pointer border border-white/5 flex items-center justify-between"
          >
            <div>
              <span className="text-[9px] text-amber-300 block leading-tight">Step 3</span>
              <span className="text-[11px] font-bold text-white group-hover:text-amber-200">Dispatch</span>
            </div>
            <ArrowRight size={11} className="opacity-0 group-hover:opacity-100 transition-opacity text-amber-300" />
          </button>

          <button
            onClick={() => navigate("/pages/mainModule/production")}
            className="px-2.5 py-1.5 bg-white/5 hover:bg-white/15 rounded-lg text-left transition-all group cursor-pointer border border-white/5 flex items-center justify-between"
          >
            <div>
              <span className="text-[9px] text-emerald-300 block leading-tight">Step 4</span>
              <span className="text-[11px] font-bold text-white group-hover:text-emerald-200">Production</span>
            </div>
            <ArrowRight size={11} className="opacity-0 group-hover:opacity-100 transition-opacity text-emerald-300" />
          </button>

          <button
            onClick={() => navigate("/pages/mainModule/delivery")}
            className="px-2.5 py-1.5 bg-white/5 hover:bg-white/15 rounded-lg text-left transition-all group cursor-pointer border border-white/5 flex items-center justify-between col-span-2 sm:col-span-1"
          >
            <div>
              <span className="text-[9px] text-cyan-300 block leading-tight">Step 5</span>
              <span className="text-[11px] font-bold text-white group-hover:text-cyan-200">Delivery</span>
            </div>
            <ArrowRight size={11} className="opacity-0 group-hover:opacity-100 transition-opacity text-cyan-300" />
          </button>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Active Products */}
        <div
          onClick={() => navigate("/pages/mainModule/projects")}
          className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:border-blue-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500">Active Products</span>
            <Boxes size={16} className="text-blue-600 group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{projects.active || 0}</p>
          <span className="text-[10px] text-slate-400 mt-0.5 block">
            Total: {projects.total || 0} products
          </span>
        </div>

        {/* Production Runs */}
        <div
          onClick={() => navigate("/pages/mainModule/production")}
          className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:border-indigo-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500">Total Output</span>
            <Cpu size={16} className="text-indigo-600 group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-2xl font-black text-indigo-700 mt-2 font-mono">
            {Number(production.total_actual_quantity || 0).toLocaleString()}
          </p>
          <span className="text-[10px] text-indigo-600 font-medium mt-0.5 block">
            {production.total_runs || 0} production runs
          </span>
        </div>

        {/* OK Finished Goods */}
        <div
          onClick={() => navigate("/pages/mainModule/store")}
          className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:border-emerald-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500">OK Finished Parts</span>
            <CheckCircle2 size={16} className="text-emerald-600 group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-2xl font-black text-emerald-700 mt-2 font-mono">
            {Number(production.total_ok_quantity || 0).toLocaleString()}
          </p>
          <span className="text-[10px] text-emerald-600 font-medium mt-0.5 block">
            * Inward to store FG
          </span>
        </div>

        {/* Rejection Rate */}
        <div
          onClick={() => navigate("/pages/mainModule/production")}
          className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:border-rose-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500">Rejection Rate</span>
            <AlertTriangle size={16} className="text-rose-600 group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-2xl font-black text-rose-700 mt-2 font-mono">
            {production.rejection_rate_percentage || 0}%
          </p>
          <span className="text-[10px] text-rose-500 font-medium mt-0.5 block">
            {Number(production.total_rejection_quantity || 0).toLocaleString()} parts rejected
          </span>
        </div>

        {/* Production Speed */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500">Production Rate</span>
            <Activity size={16} className="text-amber-600" />
          </div>
          <p className="text-2xl font-black text-amber-700 mt-2 font-mono">
            {production.average_production_per_hour || 0}
          </p>
          <span className="text-[10px] text-slate-500 font-medium mt-0.5 block">
            Nos / Working Hour
          </span>
        </div>

        {/* Total Deliveries */}
        <div
          onClick={() => navigate("/pages/mainModule/delivery")}
          className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:border-blue-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500">Units Delivered</span>
            <Truck size={16} className="text-blue-600 group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-2xl font-black text-blue-700 mt-2 font-mono">
            {Number(deliveries.total_delivered_quantity || 0).toLocaleString()}
          </p>
          <span className="text-[10px] text-blue-500 font-medium mt-0.5 block">
            {deliveries.total || 0} delivery challans
          </span>
        </div>
      </div>

      {/* Middle Operations Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Machine Status Widget */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Cpu size={16} className="text-blue-600" />
              Machine Floor Allocation ({machines.total || 0} total)
            </h3>
            <button
              onClick={() => navigate("/pages/mainModule/machines")}
              className="text-[11px] font-semibold text-blue-600 hover:text-blue-800"
            >
              View All
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
              <span className="text-[10px] font-semibold text-emerald-600 block">Available</span>
              <span className="text-xl font-bold text-emerald-800 mt-0.5 block">
                {machines.available || 0}
              </span>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
              <span className="text-[10px] font-semibold text-blue-600 block">Running</span>
              <span className="text-xl font-bold text-blue-800 mt-0.5 block">
                {machines.running || 0}
              </span>
            </div>

            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl">
              <span className="text-[10px] font-semibold text-rose-600 block">Maintenance</span>
              <span className="text-xl font-bold text-rose-800 mt-0.5 block">
                {machines.maintenance || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Store Inventory Snapshot */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Package size={16} className="text-indigo-600" />
              Store & Inventory Health
            </h3>
            <button
              onClick={() => navigate("/pages/mainModule/store")}
              className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800"
            >
              Store Master
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-[10px] text-slate-500 font-medium block">Raw Materials</span>
              <span className="text-lg font-bold text-slate-900 mt-0.5 block">
                {store.raw_materials_count || 0} SKUs
              </span>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-[10px] text-slate-500 font-medium block">Finished Goods</span>
              <span className="text-lg font-bold text-slate-900 mt-0.5 block">
                {store.finished_goods_count || 0} Items
              </span>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
              <span className="text-[10px] text-amber-700 font-semibold block">Low Stock Alert</span>
              <span className="text-lg font-bold text-amber-800 mt-0.5 block">
                {store.low_stock_count || 0} SKUs
              </span>
            </div>

            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl">
              <span className="text-[10px] text-rose-700 font-semibold block">Out of Stock</span>
              <span className="text-lg font-bold text-rose-800 mt-0.5 block">
                {store.out_of_stock_count || 0} SKUs
              </span>
            </div>
          </div>
        </div>

        {/* Pending Requisitions */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ClipboardList size={16} className="text-amber-600" />
              Requisitions & Plannings Action
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <div
              onClick={() => navigate("/pages/mainModule/material-requests")}
              className="p-3 bg-amber-50/70 hover:bg-amber-100/70 border border-amber-200 rounded-xl flex items-center justify-between cursor-pointer transition-colors"
            >
              <div>
                <span className="font-bold text-amber-900 block">Pending Material Requisitions</span>
                <span className="text-[10px] text-amber-700">Awaiting Store Manager dispatch</span>
              </div>
              <span className="px-2.5 py-1 bg-amber-600 text-white font-bold rounded-lg text-xs font-mono">
                {pending.material_requests || 0}
              </span>
            </div>

            <div
              onClick={() => navigate("/pages/mainModule/planning")}
              className="p-3 bg-blue-50/70 hover:bg-blue-100/70 border border-blue-200 rounded-xl flex items-center justify-between cursor-pointer transition-colors"
            >
              <div>
                <span className="font-bold text-blue-900 block">Active Plannings in Queue</span>
                <span className="text-[10px] text-blue-700">Underway for machine production</span>
              </div>
              <span className="px-2.5 py-1 bg-blue-600 text-white font-bold rounded-lg text-xs font-mono">
                {pending.plannings || 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Live Tables: Recent Productions & Deliveries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Production Entries */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Cpu size={16} className="text-blue-600" />
              Recent Production Runs
            </h3>
            <button
              onClick={() => navigate("/pages/mainModule/production")}
              className="text-[11px] font-semibold text-blue-600 hover:text-blue-800"
            >
              View All
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <th className="py-2.5 px-3">Run ID</th>
                  <th className="py-2.5 px-3">Project</th>
                  <th className="py-2.5 px-3">Machine</th>
                  <th className="py-2.5 px-3 text-right">OK Parts</th>
                  <th className="py-2.5 px-3 text-right">Rejection %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentProductions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-400">
                      No recent production runs logged.
                    </td>
                  </tr>
                ) : (
                  recentProductions.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/70">
                      <td className="py-2.5 px-3 font-mono font-bold text-blue-600">
                        {p.production_code || `PRD-${p.id}`}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">
                        {p.project_name}
                      </td>
                      <td className="py-2.5 px-3 text-slate-700">
                        {p.machine_name} ({p.shift})
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-emerald-600 font-mono">
                        {Number(p.ok_quantity || 0).toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-rose-600 font-mono">
                        {p.rejection_percentage || 0}%
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Deliveries */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Truck size={16} className="text-indigo-600" />
              Recent Client Deliveries
            </h3>
            <button
              onClick={() => navigate("/pages/mainModule/delivery")}
              className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800"
            >
              View All
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <th className="py-2.5 px-3">Challan</th>
                  <th className="py-2.5 px-3">Project & Client</th>
                  <th className="py-2.5 px-3 text-right">Dispatched Qty</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentDeliveries.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-slate-400">
                      No recent delivery challans recorded.
                    </td>
                  </tr>
                ) : (
                  recentDeliveries.map((d) => (
                    <tr key={d.id} className="hover:bg-slate-50/70">
                      <td className="py-2.5 px-3 font-mono font-bold text-blue-600">
                        {d.delivery_number || `DEL-${d.id}`}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">
                        <div>{d.project_name}</div>
                        <span className="text-[10px] text-slate-400 font-normal">{d.client_name}</span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-900 font-mono">
                        {Number(d.delivered_qty || 0).toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-full font-semibold text-[10px]">
                          {d.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
