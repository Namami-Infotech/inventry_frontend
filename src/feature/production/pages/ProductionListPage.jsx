import React, { useState, useEffect, useCallback } from 'react';
import {
  Cpu,
  Plus,
  Search,
  Trash2,
  Eye,
  CheckCircle2,
  Clock,
  Loader2,
  AlertCircle,
  X,
  Layers,
  Hash,
  Boxes,
  Package,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Filter,
  Send,
  Sparkles,
  ClipboardList,
  Truck,
  RotateCcw,
  Check,
  FileText,
  ShieldAlert
} from 'lucide-react';
import {
  getAllProductionTasks,
  deleteProductionTask,
  recordFinishedGoods
} from '../services/productionService';
import { CreateProductionModal } from '../components/CreateProductionModal';
import { ProductionDetailDrawer } from '../components/ProductionDetailDrawer';
import { Pagination } from '../../../components/common/pagination';

export const ProductionListPage = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('requests'); // 'requests', 'store_received', 'output_damage'
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modals & Drawers
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerInitialTab, setDrawerInitialTab] = useState('stage1');

  // Fetch Production Tasks
  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getAllProductionTasks({
        search: searchTerm
      });
      if (res && res.data) {
        setTasks(res.data);
      } else if (Array.isArray(res)) {
        setTasks(res);
      } else {
        setTasks([]);
      }
    } catch (err) {
      console.error("Error fetching production tasks:", err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTasks();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchTasks]);

  // Open Details Drawer
  const handleOpenDrawer = (taskId, stageTab = 'stage1') => {
    setSelectedTaskId(taskId);
    setDrawerInitialTab(stageTab);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedTaskId(null);
  };

  // Delete Task
  const handleDelete = async (task) => {
    if (
      window.confirm(
        `Are you sure you want to delete production work order "${task.task_id}" (${task.product_name})? This action cannot be undone.`
      )
    ) {
      try {
        await deleteProductionTask(task.id);
        fetchTasks();
      } catch (err) {
        console.error("Error deleting production task:", err);
        alert(err.response?.data?.message || "Failed to delete production task.");
      }
    }
  };

  // Date and Number formatting helpers
  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  const formatQty = (val) => {
    if (val === null || val === undefined || val === '') return '0';
    const num = parseFloat(val);
    if (isNaN(num)) return '0';
    return parseFloat(num.toFixed(2)).toString();
  };

  // Filter lists for each tab
  const totalOrders = tasks.length;

  // Tab 1: Material Requests (Planned / Pending Store Issue)
  const materialRequestsTasks = tasks.filter((t) =>
    ['planned', 'material requested'].includes((t.status || 'planned').toLowerCase())
  );

  // Tab 2: Received from Store (Tracking all individual material receipt batches from store to production)
  const storeReceivedEntries = [];
  tasks.forEach((task) => {
    const logs = Array.isArray(task.dispatch_logs) ? task.dispatch_logs : [];
    const taskItems = task.items || [];
    const totalRequired = taskItems.reduce((acc, it) => acc + (parseFloat(it.required_qty) || 0), 0);

    if (logs.length > 0) {
      let runningCumulativeMap = {};

      logs.forEach((log, idx) => {
        const rawItems = Array.isArray(log.items_summary)
          ? log.items_summary
          : typeof log.items_summary === 'string'
            ? (() => { try { return JSON.parse(log.items_summary); } catch { return []; } })()
            : [];

        // Accumulate this batch's quantities
        rawItems.forEach((it) => {
          const key = it.item_name || it.item_id || it.name;
          runningCumulativeMap[key] = (runningCumulativeMap[key] || 0) + (parseFloat(it.qty || it.quantity) || 0);
        });

        const batchSentQty = rawItems.reduce((acc, it) => acc + (parseFloat(it.qty || it.quantity) || 0), 0);
        const totalCumulativeIssued = Object.values(runningCumulativeMap).reduce((acc, v) => acc + (parseFloat(v) || 0), 0);

        const isFullyDispatchedUpToHere = totalRequired > 0 && totalCumulativeIssued >= (totalRequired - 0.0001);
        const batchStatus = isFullyDispatchedUpToHere ? 'Fully Received' : 'Partially Received';
        const isPartial = (log.dispatch_type || '').toLowerCase().includes('partial');
        const batchTitle = log.dispatch_type || (logs.length > 1 ? `Partial Issue #${idx + 1}` : 'Store Dispatch');

        const dispatchPercent = totalRequired > 0
          ? Math.min(100, Math.round((totalCumulativeIssued / totalRequired) * 100))
          : 0;

        storeReceivedEntries.push({
          id: `log-${task.id}-${log.id || idx}`,
          taskId: task.id,
          task_id: task.task_id,
          product_name: task.product_name,
          proposed_quantity: task.proposed_quantity,
          assigned_to: task.assigned_to || 'Unassigned',
          batchTitle,
          isPartial,
          batchIndex: idx + 1,
          totalBatches: logs.length,
          dispatched_by: log.dispatched_by || 'Store Warehouse',
          date: log.created_at || task.start_date || task.created_at,
          batchSentQty,
          totalCumulativeIssued,
          totalRequiredQty: totalRequired,
          dispatchPercent,
          status: batchStatus,
          isFullyDispatched: isFullyDispatchedUpToHere,
          items: rawItems,
          task: task
        });
      });
    } else {
      // If task has not yet been dispatched, or legacy without logs
      const totalIssued = taskItems.reduce((acc, it) => acc + (parseFloat(it.issued_qty) || 0), 0);
      const isFullyDispatched = totalIssued >= totalRequired && totalRequired > 0;
      const dispatchPercent = totalRequired > 0 ? Math.min(100, Math.round((totalIssued / totalRequired) * 100)) : 0;

      storeReceivedEntries.push({
        id: `task-${task.id}`,
        taskId: task.id,
        task_id: task.task_id,
        product_name: task.product_name,
        proposed_quantity: task.proposed_quantity,
        assigned_to: task.assigned_to || 'Unassigned',
        batchTitle: totalIssued > 0 ? 'Store Dispatch' : 'Awaiting Store Dispatch',
        isPartial: totalIssued > 0 && !isFullyDispatched,
        batchIndex: 1,
        totalBatches: 1,
        dispatched_by: 'Store Warehouse',
        date: task.start_date || task.created_at,
        batchSentQty: totalIssued,
        totalCumulativeIssued: totalIssued,
        totalRequiredQty: totalRequired,
        dispatchPercent,
        status: isFullyDispatched ? 'Fully Received' : totalIssued > 0 ? 'Partially Received' : 'Awaiting Dispatch',
        isFullyDispatched,
        items: [],
        task: task
      });
    }
  });

  // Sort by date descending (latest delivery first)
  storeReceivedEntries.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

  const filteredStoreReceived = storeReceivedEntries.filter((entry) => {
    if (!searchTerm) return true;
    const s = searchTerm.toLowerCase();
    return (
      (entry.task_id || '').toLowerCase().includes(s) ||
      (entry.product_name || '').toLowerCase().includes(s) ||
      (entry.assigned_to || '').toLowerCase().includes(s) ||
      (entry.dispatched_by || '').toLowerCase().includes(s) ||
      (entry.batchTitle || '').toLowerCase().includes(s)
    );
  });

  // Tab 3: Finished Goods & Damage/Shortage
  const outputDamageTasks = tasks.filter((t) =>
    ['in production', 'completed', 'material issued'].includes((t.status || '').toLowerCase())
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchTerm, tasks.length]);

  const totalTab1 = materialRequestsTasks.length;
  const totalPagesTab1 = Math.ceil(totalTab1 / itemsPerPage) || 1;
  const paginatedTab1 = materialRequestsTasks.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalTab2 = filteredStoreReceived.length;
  const totalPagesTab2 = Math.ceil(totalTab2 / itemsPerPage) || 1;
  const paginatedTab2 = filteredStoreReceived.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalTab3 = outputDamageTasks.length;
  const totalPagesTab3 = Math.ceil(totalTab3 / itemsPerPage) || 1;
  const paginatedTab3 = outputDamageTasks.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalFinishedGoods = tasks.reduce((sum, t) => sum + (parseInt(t.finished_quantity, 10) || 0), 0);
  const totalTargetGoods = tasks.reduce((sum, t) => sum + (parseInt(t.proposed_quantity, 10) || 0), 0);
  const totalScrapCount = tasks.reduce((sum, t) => sum + (parseInt(t.rejected_quantity, 10) || 0), 0);

  return (
    <div className="max-w-7xl mx-auto space-y-4 sm:space-y-5 text-xs">
      {/* 🌟 1. PAGE HEADER */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shrink-0">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
              Production Management
              <span className="text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
                {totalOrders} Work Orders
              </span>
            </h1>
            <p className="text-xs text-gray-500">
              Manufacturing lifecycle & floor operations
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all duration-200 active:scale-[0.98] cursor-pointer shrink-0"
        >
          <Plus size={15} />
          <span>New Work Order</span>
        </button>
      </div>

      {/* 🌟 2. THREE SLEEK HORIZONTAL TABS */}
      <div className="flex items-center gap-1 bg-white p-1.5 rounded-2xl border border-gray-200 shadow-sm overflow-x-auto">
        {/* Tab 1: Material Requests */}
        <button
          type="button"
          onClick={() => setActiveTab('requests')}
          className={`flex-1 min-w-[150px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${activeTab === 'requests'
            ? 'bg-blue-600 text-white shadow-sm'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
        >
          <ClipboardList size={15} />
          <span>Material Requests</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${activeTab === 'requests'
              ? 'bg-white/20 text-white'
              : 'bg-slate-200/70 text-slate-700'
              }`}
          >
            {materialRequestsTasks.length}
          </span>
        </button>

        {/* Tab 2: Store Received */}
        <button
          type="button"
          onClick={() => setActiveTab('store_received')}
          className={`flex-1 min-w-[150px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${activeTab === 'store_received'
            ? 'bg-indigo-600 text-white shadow-sm'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
        >
          <Truck size={15} />
          <span>Store Received</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${activeTab === 'store_received'
              ? 'bg-white/20 text-white'
              : 'bg-slate-200/70 text-slate-700'
              }`}
          >
            {filteredStoreReceived.length}
          </span>
        </button>

        {/* Tab 3: Output & Scrap */}
        <button
          type="button"
          onClick={() => setActiveTab('output_damage')}
          className={`flex-1 min-w-[150px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${activeTab === 'output_damage'
            ? 'bg-emerald-600 text-white shadow-sm'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
        >
          <Package size={15} />
          <span>Output & Scrap</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${activeTab === 'output_damage'
              ? 'bg-white/20 text-white'
              : 'bg-slate-200/70 text-slate-700'
              }`}
          >
            {totalFinishedGoods} / {totalTargetGoods}
          </span>
        </button>
      </div>

      {/* 🌟 3. SEARCH & FILTERS BAR */}
      <div className="bg-white p-3 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by Task ID (e.g. PRD-001), product name, project in-charge..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-9 py-2 text-xs text-gray-900 font-medium bg-slate-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white placeholder:text-gray-400 transition"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 rounded-full hover:bg-gray-200/60 transition cursor-pointer"
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* 🌟 4. TAB 1 CONTENT: MATERIAL REQUESTS (STORE REQUISITIONS) */}
      {activeTab === 'requests' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-10 flex flex-col items-center justify-center gap-2 text-gray-400">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              <p className="font-medium text-xs">Loading material requests...</p>
            </div>
          ) : materialRequestsTasks.length === 0 ? (
            <div className="p-10 text-center text-gray-400 space-y-2">
              <ClipboardList className="w-10 h-10 mx-auto text-gray-300" />
              <p className="text-sm font-bold text-gray-700">No Pending Material Requests</p>
              <p className="text-xs text-gray-400">All created production orders have been processed or none are pending.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[850px]">
                <thead>
                  <tr className="bg-slate-50 text-[11px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200">
                    <th className="py-3 px-4">Task ID</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Product</th>
                    <th className="py-3 px-4 text-center">Target Qty</th>
                    <th className="py-3 px-4 text-center">BOM Items</th>
                    <th className="py-3 px-4">In-charge</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedTab1.map((task) => (
                    <tr
                      key={task.id}
                      onClick={() => handleOpenDrawer(task.id, 'stage1')}
                      className="hover:bg-amber-50/30 transition-colors cursor-pointer"
                    >
                      {/* Task ID */}
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 text-xs">
                          {task.task_id}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-3 px-4 text-xs text-gray-600 font-medium whitespace-nowrap">
                        {formatDate(task.start_date || task.created_at)}
                      </td>

                      {/* Finished Product */}
                      <td className="py-3 px-4 font-semibold text-gray-900 text-xs">
                        {task.product_name}
                      </td>

                      {/* Proposed Goods Quantity */}
                      <td className="py-3 px-4 text-center font-bold text-slate-800 text-xs">
                        <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200 inline-block">
                          {formatQty(task.proposed_quantity)}
                        </span>
                      </td>

                      {/* BOM Items Requested */}
                      <td className="py-3 px-4 text-center">
                        <span className="font-bold text-indigo-900 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 inline-block text-xs">
                          {task.total_items || 0} items ({formatQty(task.total_required_qty)} qty)
                        </span>
                      </td>

                      {/* Project In-charge */}
                      <td className="py-3 px-4 font-medium text-gray-700 text-xs">
                        {task.assigned_to || 'Unassigned'}
                      </td>

                      {/* Store Request Status */}
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                          <Clock size={11} /> Pending Store Dispatch
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenDrawer(task.id, 'stage1')}
                            className="p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                            title="View Material Request"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(task)}
                            className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                            title="Delete Work Order"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Tab 1 Pagination */}
          {!loading && totalTab1 > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPagesTab1}
              totalItems={totalTab1}
              itemsPerPage={itemsPerPage}
              onPageChange={(page) => setCurrentPage(page)}
            />
          )}
        </div>
      )}

      {/* 🌟 5. TAB 2 CONTENT: RECEIVED FROM STORE */}
      {activeTab === 'store_received' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-10 flex flex-col items-center justify-center gap-2 text-gray-400">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
              <p className="font-medium text-xs">Loading store dispatch status...</p>
            </div>
          ) : filteredStoreReceived.length === 0 ? (
            <div className="p-10 text-center text-gray-400 space-y-2">
              <Truck className="w-10 h-10 mx-auto text-gray-300" />
              <p className="text-sm font-bold text-gray-700">No Store Dispatches</p>
              <p className="text-xs text-gray-400">No active work orders currently waiting or received from Store.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[850px]">
                <thead>
                  <tr className="bg-slate-50 text-[11px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200">
                    <th className="py-3 px-4">Task ID</th>
                    <th className="py-3 px-4 text-center">Batch</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Product</th>
                    <th className="py-3 px-4 text-center">Target Qty</th>
                    <th className="py-3 px-4 text-center">Materials Received</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">In-charge</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedTab2.map((entry) => {
                    return (
                      <tr
                        key={entry.id}
                        onClick={() => handleOpenDrawer(entry.taskId, 'stage2')}
                        className="hover:bg-indigo-50/30 transition-colors cursor-pointer"
                      >
                        {/* Task ID */}
                        <td className="py-3 px-4">
                          <span className="font-mono font-bold text-blue-700 text-xs bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                            {entry.task_id}
                          </span>
                        </td>

                        {/* Batch */}
                        <td className="py-3 px-4 text-center">
                          {entry.totalBatches > 1 ? (
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${entry.isFullyDispatched
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                              }`}>
                              Batch #{entry.batchIndex}
                            </span>
                          ) : (
                            <span className="text-gray-400 text-xs font-medium">—</span>
                          )}
                        </td>

                        {/* Date */}
                        <td className="py-3 px-4 text-xs text-gray-600 font-medium whitespace-nowrap">
                          {formatDate(entry.date)}
                        </td>

                        {/* Finished Product */}
                        <td className="py-3 px-4 font-semibold text-gray-900 text-xs">
                          {entry.product_name}
                        </td>

                        {/* Proposed Goods Quantity */}
                        <td className="py-3 px-4 text-center font-bold text-slate-800 text-xs">
                          <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200 inline-block">
                            {formatQty(entry.proposed_quantity)}
                          </span>
                        </td>

                        {/* Items Received vs Requested */}
                        <td className="py-3 px-4 text-center">
                          <div className="inline-flex flex-col items-center gap-1">
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${entry.isFullyDispatched ? 'bg-emerald-500' : 'bg-indigo-600'
                                    }`}
                                  style={{ width: `${entry.dispatchPercent}%` }}
                                />
                              </div>
                              <span className="font-bold text-slate-800 text-xs">{entry.dispatchPercent}%</span>
                            </div>
                            <span className="text-[10px] text-gray-400 font-medium">
                              {formatQty(entry.totalCumulativeIssued)} / {formatQty(entry.totalRequiredQty)}
                            </span>
                          </div>
                        </td>

                        {/* Store Dispatch Status */}
                        <td className="py-3 px-4">
                          {entry.isFullyDispatched ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                              <Check size={12} /> Received
                            </span>
                          ) : entry.totalCumulativeIssued > 0 ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                              Partial
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                              Pending
                            </span>
                          )}
                        </td>

                        {/* Project In-charge */}
                        <td className="py-3 px-4 font-medium text-gray-700 text-xs">
                          {entry.assigned_to || 'Unassigned'}
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end">
                            <button
                              type="button"
                              onClick={() => handleOpenDrawer(entry.taskId, 'stage2')}
                              className="p-1.5 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition cursor-pointer"
                              title="View Store Dispatch Items"
                            >
                              <Eye size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Tab 2 Pagination */}
          {!loading && totalTab2 > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPagesTab2}
              totalItems={totalTab2}
              itemsPerPage={itemsPerPage}
              onPageChange={(page) => setCurrentPage(page)}
            />
          )}
        </div>
      )}

      {/* 🌟 6. TAB 3 CONTENT: FINISHED GOODS & SCRAP */}
      {activeTab === 'output_damage' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-10 flex flex-col items-center justify-center gap-2 text-gray-400">
              <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
              <p className="font-medium text-xs">Loading output records...</p>
            </div>
          ) : outputDamageTasks.length === 0 ? (
            <div className="p-10 text-center text-gray-400 space-y-2">
              <Package className="w-10 h-10 mx-auto text-gray-300" />
              <p className="text-sm font-bold text-gray-700">No Production Outputs Logged</p>
              <p className="text-xs text-gray-400">When work orders enter production, output and damage reports will appear here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[850px]">
                <thead>
                  <tr className="bg-slate-50 text-[11px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200">
                    <th className="py-3 px-4">Task ID</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Product</th>
                    <th className="py-3 px-4 text-center">Target</th>
                    <th className="py-3 px-4 text-center">Finished</th>
                    <th className="py-3 px-4 text-center">Scrap</th>
                    <th className="py-3 px-4 text-right">Selling Price (₹)</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedTab3.map((task) => {
                    const proposed = parseInt(task.proposed_quantity, 10) || 1;
                    const finished = parseInt(task.finished_quantity, 10) || 0;
                    const rejected = parseInt(task.rejected_quantity, 10) || 0;
                    const shortage = Math.max(0, proposed - finished);
                    const isFullyCompleted = finished >= proposed;
                    const sellPrice = parseFloat(task.selling_price || task.product_price) || 0;

                    return (
                      <tr
                        key={task.id}
                        onClick={() => handleOpenDrawer(task.id, 'stage3')}
                        className="hover:bg-emerald-50/30 transition-colors cursor-pointer"
                      >
                        {/* Task ID */}
                        <td className="py-3 px-4">
                          <span className="font-mono font-bold text-blue-700 text-xs bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                            {task.task_id}
                          </span>
                        </td>

                        {/* Date */}
                        <td className="py-3 px-4 text-xs text-gray-600 font-medium whitespace-nowrap">
                          {formatDate(task.start_date || task.created_at)}
                        </td>

                        <td className="py-3 px-4 font-semibold text-gray-900 text-xs">
                          {task.product_name}
                        </td>

                        <td className="py-3 px-4 text-center font-bold text-slate-700 text-xs">
                          <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200 inline-block">
                            {proposed}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-center">
                          <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block text-xs">
                            {finished}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-center">
                          {rejected > 0 ? (
                            <span className="font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 text-xs">
                              {rejected}
                            </span>
                          ) : (
                            <span className="text-gray-400 text-xs font-medium">—</span>
                          )}
                        </td>

                        {/* Selling Price */}
                        <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700 text-xs">
                          {sellPrice > 0 ? `₹${sellPrice.toFixed(2)}` : <span className="text-gray-400 font-normal">—</span>}
                        </td>

                        <td className="py-3 px-4">
                          {isFullyCompleted ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                              <Check size={12} /> Completed
                            </span>
                          ) : shortage > 0 ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                              <AlertTriangle size={12} className="text-amber-500" /> Short: {shortage}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                              In Production
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end">
                            <button
                              type="button"
                              onClick={() => handleOpenDrawer(task.id, 'stage3')}
                              className="p-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition cursor-pointer"
                              title="View / Record Finished Goods Output"
                            >
                              <Eye size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Tab 3 Pagination */}
          {!loading && totalTab3 > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPagesTab3}
              totalItems={totalTab3}
              itemsPerPage={itemsPerPage}
              onPageChange={(page) => setCurrentPage(page)}
            />
          )}
        </div>
      )}

      {/* 🌟 8. CREATE PRODUCTION MODAL */}
      <CreateProductionModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={() => {
          fetchTasks();
          setIsCreateOpen(false);
        }}
      />

      {/* 🌟 9. PRODUCTION DETAIL DRAWER */}
      <ProductionDetailDrawer
        isOpen={isDrawerOpen}
        taskId={selectedTaskId}
        initialTab={drawerInitialTab}
        onClose={handleCloseDrawer}
        onRefresh={fetchTasks}
      />
    </div>
  );
};
