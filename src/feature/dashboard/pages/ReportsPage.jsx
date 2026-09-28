import React, { useState, useEffect, useMemo } from "react";
import {
  FileText,
  Boxes,
  Cpu,
  RefreshCw,
  Search,
  Printer,
  Download,
  AlertTriangle,
  Layers,
  Truck,
  Package,
  Calendar,
  Plus,
  X,
  CheckCircle2,
  HelpCircle,
  Eye,
  SlidersHorizontal,
  ChevronRight,
  TrendingUp,
  ShieldAlert,
  ArrowRight
} from "lucide-react";
import {
  getProjectsReport,
  getMachineReport,
  getDailyStockReport,
  saveMonthOpeningStock,
  savePdiRejection,
  getPdiRejections,
  deletePdiRejection
} from "../services/reportService";

export const ReportsPage = () => {
  const todayStr = useMemo(() => {
    const now = new Date();
    return now.toISOString().split("T")[0];
  }, []);

  const currentMonthStr = useMemo(() => {
    return todayStr.substring(0, 7);
  }, [todayStr]);

  const [activeTab, setActiveTab] = useState("daily-stock"); // 'daily-stock' | 'projects' | 'machines' | 'pdi-log'
  const [stockSubView, setStockSubView] = useState("overview"); // 'overview' | 'ledger'

  // Filter States
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [selectedMonth, setSelectedMonth] = useState(currentMonthStr);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [search, setSearch] = useState("");
  const [rollMode, setRollMode] = useState("wip"); // 'wip' | 'gross_fg'

  // Data States
  const [loading, setLoading] = useState(true);
  const [stockReportData, setStockReportData] = useState(null);
  const [projectsData, setProjectsData] = useState([]);
  const [machinesData, setMachinesData] = useState([]);
  const [pdiLogData, setPdiLogData] = useState([]);

  // Modals
  const [isPdiModalOpen, setIsPdiModalOpen] = useState(false);
  const [isOpeningModalOpen, setIsOpeningModalOpen] = useState(false);
  const [modalSubmitting, setModalSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Form states
  const [pdiForm, setPdiForm] = useState({
    project_id: "",
    inspection_date: todayStr,
    rejection_quantity: "",
    reason: "Dimension / Visual Defect",
    inspected_by: "",
    notes: ""
  });

  const [openingForm, setOpeningForm] = useState({
    project_id: "",
    month_key: currentMonthStr,
    opening_stock: "",
    notes: ""
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Sync month if date changes
  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
    if (newDate) {
      setSelectedMonth(newDate.substring(0, 7));
    }
  };

  // Fetch Reports
  const fetchReports = async () => {
    try {
      setLoading(true);

      const [stockRes, projRes, machRes, pdiRes] = await Promise.all([
        getDailyStockReport({
          date: selectedDate,
          month: selectedMonth,
          project_id: selectedProjectId || undefined,
          roll_mode: rollMode
        }).catch((err) => {
          console.error("Daily stock report error:", err);
          return null;
        }),
        getProjectsReport().catch(() => ({ data: [] })),
        getMachineReport().catch(() => ({ data: [] })),
        getPdiRejections({
          month: selectedMonth,
          project_id: selectedProjectId || undefined
        }).catch(() => ({ data: [] }))
      ]);

      if (stockRes && stockRes.success) {
        setStockReportData(stockRes);
      }
      setProjectsData(Array.isArray(projRes?.data) ? projRes.data : []);
      setMachinesData(Array.isArray(machRes?.data) ? machRes.data : []);
      setPdiLogData(Array.isArray(pdiRes?.data) ? pdiRes.data : []);
    } catch (err) {
      console.error("Failed to fetch reports:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [selectedDate, selectedMonth, selectedProjectId, rollMode]);

  const handlePrint = () => {
    window.print();
  };

  // CSV Export for Daily Stock Report
  const handleExportCSV = () => {
    if (!stockReportData || !stockReportData.products) return;

    let csvContent = "data:text/csv;charset=utf-8,";

    if (stockSubView === "overview") {
      csvContent += "Product Code,Product Name,Client,Month Opening Stock,Day Stock (Opening),Production OK Qty,PDI Rejection Qty,Finished Good Stock,Dispatched Qty,WIP Inventory Stock,Tomorrow Day Stock\n";
      stockReportData.products.forEach((p) => {
        csvContent += `"${p.project_code}","${p.project_name}","${p.client_name}",${p.month_opening_stock},${p.day_stock},${p.production_ok_quantity},${p.pdi_rejection_quantity},${p.finished_good_quantity},${p.dispatched_quantity},${p.wip_stock},${p.tomorrow_day_stock}\n`;
      });
    } else {
      csvContent += "Day,Date,Day Stock (Opening),Production OK,Floor Rejection,PDI Rejection,Finished Good,Dispatched Qty,WIP Inventory Stock,Tomorrow Day Stock\n";
      const ledger = stockReportData.selected_project_ledger || [];
      ledger.forEach((l) => {
        csvContent += `${l.day_number},"${l.date}",${l.day_stock},${l.production_ok_quantity},${l.production_floor_rejection},${l.pdi_rejection_quantity},${l.finished_good_quantity},${l.dispatched_quantity},${l.wip_stock},${l.tomorrow_day_stock}\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Stock_Report_${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Submit PDI Rejection
  const handleSubmitPdi = async (e) => {
    e.preventDefault();
    if (!pdiForm.project_id || !pdiForm.rejection_quantity) {
      alert("Please select a product and enter the rejection quantity.");
      return;
    }

    try {
      setModalSubmitting(true);
      await savePdiRejection({
        ...pdiForm,
        rejection_quantity: Number(pdiForm.rejection_quantity)
      });
      showToast("PDI rejection logged successfully!");
      setIsPdiModalOpen(false);
      setPdiForm({
        project_id: "",
        inspection_date: selectedDate,
        rejection_quantity: "",
        reason: "Dimension / Visual Defect",
        inspected_by: "",
        notes: ""
      });
      fetchReports();
    } catch (err) {
      alert("Failed to save PDI Rejection: " + (err.response?.data?.message || err.message));
    } finally {
      setModalSubmitting(false);
    }
  };

  // Submit Month Opening Stock
  const handleSubmitOpening = async (e) => {
    e.preventDefault();
    if (!openingForm.project_id || openingForm.opening_stock === "") {
      alert("Please select a product and specify the month opening stock.");
      return;
    }

    try {
      setModalSubmitting(true);
      await saveMonthOpeningStock({
        ...openingForm,
        opening_stock: Number(openingForm.opening_stock)
      });
      showToast("Month opening stock updated successfully!");
      setIsOpeningModalOpen(false);
      setOpeningForm({
        project_id: "",
        month_key: selectedMonth,
        opening_stock: "",
        notes: ""
      });
      fetchReports();
    } catch (err) {
      alert("Failed to save Month Opening Stock: " + (err.response?.data?.message || err.message));
    } finally {
      setModalSubmitting(false);
    }
  };

  // Delete PDI Rejection
  const handleDeletePdi = async (id) => {
    if (!window.confirm("Are you sure you want to delete this PDI rejection record?")) return;
    try {
      await deletePdiRejection(id);
      showToast("PDI rejection entry deleted.");
      fetchReports();
    } catch (err) {
      alert("Error deleting PDI record: " + (err.response?.data?.message || err.message));
    }
  };

  // Filtered Products for Daily Stock table
  const productsList = stockReportData?.products || [];
  const filteredProducts = productsList.filter(
    (p) =>
      (p.project_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (p.project_code || "").toLowerCase().includes(search.toLowerCase()) ||
      (p.client_name || "").toLowerCase().includes(search.toLowerCase())
  );

  // Selected project for ledger view
  const currentSelectedProject = useMemo(() => {
    if (!selectedProjectId) {
      return productsList[0] || null;
    }
    return productsList.find((p) => String(p.project_id) === String(selectedProjectId)) || productsList[0] || null;
  }, [selectedProjectId, productsList]);

  const activeLedger = useMemo(() => {
    if (selectedProjectId) {
      return stockReportData?.selected_project_ledger || [];
    }
    return currentSelectedProject?.days_ledger || stockReportData?.selected_project_ledger || [];
  }, [selectedProjectId, currentSelectedProject, stockReportData]);

  // Filtered list for Legacy Tabs
  const filteredProjectsTab = projectsData.filter(
    (p) =>
      (p.project_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (p.project_code || "").toLowerCase().includes(search.toLowerCase()) ||
      (p.client_name || "").toLowerCase().includes(search.toLowerCase())
  );

  const filteredMachinesTab = machinesData.filter(
    (m) =>
      (m.machine_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (m.machine_code || "").toLowerCase().includes(search.toLowerCase()) ||
      (m.machine_type || "").toLowerCase().includes(search.toLowerCase())
  );

  const summary = stockReportData?.summary || {
    total_products: 0,
    total_month_opening: 0,
    total_day_stock: 0,
    total_production_ok: 0,
    total_pdi_rejection: 0,
    total_finished_good: 0,
    total_dispatched: 0,
    total_wip_stock: 0
  };

  return (
    <div className="space-y-6 pb-14 text-slate-800">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-600 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 size={16} />
          {toastMessage}
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 shadow-xs">
              <FileText className="w-5 h-5" />
            </span>
            Manufacturing Operations & Inventory Reports
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time tracking of Day Stock, Production OK Quantity, PDI Rejections, Finished Goods & WIP Inventory Balances.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setPdiForm((prev) => ({
                ...prev,
                project_id: selectedProjectId || (productsList[0]?.project_id ? String(productsList[0].project_id) : ""),
                inspection_date: selectedDate
              }));
              setIsPdiModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 rounded-xl transition-all cursor-pointer shadow-2xs"
          >
            <ShieldAlert size={14} className="text-rose-600" />
            Log PDI Rejection
          </button>

          <button
            onClick={() => {
              setOpeningForm((prev) => ({
                ...prev,
                project_id: selectedProjectId || (productsList[0]?.project_id ? String(productsList[0].project_id) : ""),
                month_key: selectedMonth
              }));
              setIsOpeningModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 rounded-xl transition-all cursor-pointer shadow-2xs"
          >
            <SlidersHorizontal size={14} className="text-indigo-600" />
            Set Month Opening
          </button>

          <button
            onClick={fetchReports}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 shadow-2xs transition-all cursor-pointer"
          >
            <RefreshCw size={13} className={loading ? "animate-spin text-blue-600" : ""} />
            Refresh
          </button>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 shadow-2xs transition-all cursor-pointer"
          >
            <Download size={13} />
            Export CSV
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Printer size={13} />
            Print
          </button>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2 print:hidden">
        <button
          onClick={() => setActiveTab("daily-stock")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "daily-stock"
              ? "bg-blue-600 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Layers size={14} />
          Daily Stock & WIP Inventory
        </button>

        <button
          onClick={() => setActiveTab("projects")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "projects"
              ? "bg-blue-600 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Boxes size={14} />
          Product Status & Balance Sheet ({projectsData.length})
        </button>

        <button
          onClick={() => setActiveTab("machines")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "machines"
              ? "bg-blue-600 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Cpu size={14} />
          Machine Productivity ({machinesData.length})
        </button>

        <button
          onClick={() => setActiveTab("pdi-log")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "pdi-log"
              ? "bg-blue-600 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <ShieldAlert size={14} />
          PDI Rejections Log ({pdiLogData.length})
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: DAILY STOCK & WIP INVENTORY REPORT */}
      {/* ========================================================================= */}
      {activeTab === "daily-stock" && (
        <div className="space-y-6">
          {/* Formula Info Banner */}
          <div className="p-3.5 bg-gradient-to-r from-blue-50/90 via-indigo-50/60 to-purple-50/70 border border-blue-200/80 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div className="flex items-start gap-2.5">
              <span className="p-1.5 rounded-lg bg-blue-600 text-white mt-0.5 shrink-0 shadow-xs">
                <HelpCircle size={14} />
              </span>
              <div>
                <p className="font-bold text-slate-900">Inventory Calculation Rules & Flow:</p>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-slate-600 text-[11px] mt-0.5 font-medium">
                  <span className="font-semibold text-blue-700">Finished Good</span>
                  <span>= Day Stock + Production OK Qty - PDI Rejection</span>
                  <ArrowRight size={12} className="text-slate-400 inline" />
                  <span className="font-semibold text-purple-700">Tomorrow Day Stock</span>
                  <span>= Today's Finished Good / Available WIP</span>
                  <ArrowRight size={12} className="text-slate-400 inline" />
                  <span className="font-semibold text-emerald-700">WIP Inventory</span>
                  <span>= Finished Goods Added - Dispatched</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
              <span className="text-[11px] text-slate-500 font-semibold">Roll Mode:</span>
              <button
                type="button"
                onClick={() => setRollMode(rollMode === "wip" ? "gross_fg" : "wip")}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                  rollMode === "wip"
                    ? "bg-blue-600 text-white border-blue-600 shadow-2xs"
                    : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                }`}
                title="WIP deduction mode rolls tomorrow stock after deducting dispatches (Physically accurate warehouse balance)"
              >
                {rollMode === "wip" ? "Net Inventory (After Dispatch)" : "Gross Finished Good"}
              </button>
            </div>
          </div>

          {/* KPI Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
            {/* Card 1: Month Opening */}
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Month Opening
              </span>
              <div className="mt-1 text-base font-black text-slate-900 font-mono">
                {summary.total_month_opening.toLocaleString()}
              </div>
              <span className="text-[10px] text-slate-400">Baseline for {selectedMonth}</span>
            </div>

            {/* Card 2: Day Stock (Opening) */}
            <div className="bg-white p-3.5 rounded-2xl border border-blue-200/80 shadow-2xs bg-blue-50/20">
              <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">
                Day Stock (Opening)
              </span>
              <div className="mt-1 text-base font-black text-blue-700 font-mono">
                {summary.total_day_stock.toLocaleString()}
              </div>
              <span className="text-[10px] text-blue-500">Stock at start of day</span>
            </div>

            {/* Card 3: Production OK */}
            <div className="bg-white p-3.5 rounded-2xl border border-emerald-200/80 shadow-2xs bg-emerald-50/20">
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
                Production OK
              </span>
              <div className="mt-1 text-base font-black text-emerald-700 font-mono">
                +{summary.total_production_ok.toLocaleString()}
              </div>
              <span className="text-[10px] text-emerald-600">Produced OK today</span>
            </div>

            {/* Card 4: PDI Rejection */}
            <div className="bg-white p-3.5 rounded-2xl border border-rose-200/80 shadow-2xs bg-rose-50/20">
              <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider block">
                PDI Rej Qty
              </span>
              <div className="mt-1 text-base font-black text-rose-600 font-mono">
                -{summary.total_pdi_rejection.toLocaleString()}
              </div>
              <span className="text-[10px] text-rose-500">Defects removed</span>
            </div>

            {/* Card 5: Finished Good */}
            <div className="bg-white p-3.5 rounded-2xl border border-purple-200/80 shadow-2xs bg-purple-50/20">
              <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider block">
                Finished Good
              </span>
              <div className="mt-1 text-base font-black text-purple-700 font-mono">
                {summary.total_finished_good.toLocaleString()}
              </div>
              <span className="text-[10px] text-purple-500 font-medium">Day Stock + OK - PDI</span>
            </div>

            {/* Card 6: Dispatched */}
            <div className="bg-white p-3.5 rounded-2xl border border-amber-200/80 shadow-2xs bg-amber-50/20">
              <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">
                Dispatched Qty
              </span>
              <div className="mt-1 text-base font-black text-amber-700 font-mono">
                -{summary.total_dispatched.toLocaleString()}
              </div>
              <span className="text-[10px] text-amber-600">Delivered today</span>
            </div>

            {/* Card 7: WIP / Available Inventory Stock */}
            <div className="bg-white p-3.5 rounded-2xl border border-indigo-300 shadow-xs bg-indigo-50/40 col-span-2 sm:col-span-1">
              <span className="text-[10px] font-bold text-indigo-800 uppercase tracking-wider block">
                WIP / Inventory Stock
              </span>
              <div className="mt-1 text-base font-black text-indigo-900 font-mono">
                {summary.total_wip_stock.toLocaleString()}
              </div>
              <span className="text-[10px] text-indigo-600 font-semibold">Available in Factory</span>
            </div>
          </div>

          {/* Filter Bar & Sub-view Switcher */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3 print:hidden">
            <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
              {/* Date Input */}
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
                <Calendar size={13} className="text-slate-400" />
                <span className="text-[10px] font-bold text-slate-500 uppercase">Date:</span>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => handleDateChange(e.target.value)}
                  className="bg-transparent text-xs font-semibold text-slate-800 outline-none cursor-pointer"
                />
              </div>

              {/* Month Input */}
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Month:</span>
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="bg-transparent text-xs font-semibold text-slate-800 outline-none cursor-pointer"
                />
              </div>

              {/* Product Select */}
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
                <Package size={13} className="text-slate-400" />
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="bg-transparent text-xs font-semibold text-slate-800 outline-none cursor-pointer max-w-[150px] truncate"
                >
                  <option value="">All Products</option>
                  {productsList.map((pr) => (
                    <option key={pr.project_id} value={pr.project_id}>
                      {pr.project_name} ({pr.project_code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Search */}
              <div className="relative w-full sm:w-56">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter product/code..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            {/* Sub-view Switch: Overview vs Day-by-Day Sheet */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-end md:self-auto shrink-0">
              <button
                type="button"
                onClick={() => setStockSubView("overview")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  stockSubView === "overview"
                    ? "bg-white text-blue-600 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Today's Overview ({filteredProducts.length})
              </button>
              <button
                type="button"
                onClick={() => setStockSubView("ledger")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  stockSubView === "ledger"
                    ? "bg-white text-blue-600 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Day-by-Day Sheet (1-31 Days)
              </button>
            </div>
          </div>

          {/* Sub-view 1: Consolidated Overview Table */}
          {stockSubView === "overview" && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="p-3.5 border-b border-slate-200/80 flex items-center justify-between bg-slate-50/70">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <h3 className="font-bold text-slate-800 text-xs">
                    Consolidated Product Stock for Date:{" "}
                    <span className="text-blue-600 font-mono">{selectedDate}</span>
                  </h3>
                </div>
                <span className="text-[11px] text-slate-500 font-medium">
                  Showing {filteredProducts.length} Products
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                      <th className="py-3 px-3.5">Product & Code</th>
                      <th className="py-3 px-3">Client</th>
                      <th className="py-3 px-3 text-right">Month Opening</th>
                      <th className="py-3 px-3 text-right bg-blue-50/40 text-blue-900">
                        Day Stock (Opening)
                      </th>
                      <th className="py-3 px-3 text-right bg-emerald-50/40 text-emerald-900">
                        Production OK
                      </th>
                      <th className="py-3 px-3 text-right bg-rose-50/40 text-rose-900">
                        PDI Rejection
                      </th>
                      <th className="py-3 px-3 text-right bg-purple-50/40 text-purple-900">
                        Finished Good
                      </th>
                      <th className="py-3 px-3 text-right text-amber-800">Dispatched</th>
                      <th className="py-3 px-3 text-right bg-indigo-50/50 text-indigo-900 font-black">
                        WIP / Inventory Stock
                      </th>
                      <th className="py-3 px-3 text-right text-slate-700">Tomorrow Day Stock</th>
                      <th className="py-3 px-3 text-center print:hidden">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {loading ? (
                      <tr>
                        <td colSpan={11} className="py-12 text-center text-slate-400">
                          <RefreshCw className="animate-spin w-5 h-5 mx-auto mb-2 text-blue-500" />
                          Calculating daily stock & production sheets...
                        </td>
                      </tr>
                    ) : filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan={11} className="py-12 text-center text-slate-400">
                          No products found for selected criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredProducts.map((p) => (
                        <tr key={p.project_id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-2.5 px-3.5 font-semibold text-slate-900">
                            <div className="truncate max-w-[200px]" title={p.project_name}>
                              {p.project_name}
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono font-normal">
                              {p.project_code}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-600 font-medium truncate max-w-[130px]">
                            {p.client_name}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono text-slate-700">
                            {Number(p.month_opening_stock).toLocaleString()}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-blue-700 bg-blue-50/20">
                            {Number(p.day_stock).toLocaleString()}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700 bg-emerald-50/20">
                            {p.production_ok_quantity > 0 ? `+${Number(p.production_ok_quantity).toLocaleString()}` : "0"}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-rose-600 bg-rose-50/20">
                            {p.pdi_rejection_quantity > 0 ? `-${Number(p.pdi_rejection_quantity).toLocaleString()}` : "0"}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-black text-purple-700 bg-purple-50/20">
                            {Number(p.finished_good_quantity).toLocaleString()}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-semibold text-amber-700">
                            {p.dispatched_quantity > 0 ? `-${Number(p.dispatched_quantity).toLocaleString()}` : "0"}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-black text-indigo-900 bg-indigo-50/40">
                            <span className="px-2 py-0.5 rounded-md bg-indigo-100/70 border border-indigo-200">
                              {Number(p.wip_stock).toLocaleString()}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-semibold text-slate-700">
                            {Number(p.tomorrow_day_stock).toLocaleString()}
                          </td>
                          <td className="py-2.5 px-3 text-center print:hidden">
                            <button
                              onClick={() => {
                                setSelectedProjectId(String(p.project_id));
                                setStockSubView("ledger");
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-blue-700 hover:text-white hover:bg-blue-600 bg-blue-50 rounded-lg border border-blue-200 transition-colors cursor-pointer"
                              title="View continuous 1-31 day ledger sheet for this product"
                            >
                              <Eye size={12} />
                              Ledger
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                  {filteredProducts.length > 0 && (
                    <tfoot>
                      <tr className="bg-slate-100/80 font-black text-slate-900 border-t-2 border-slate-300">
                        <td colSpan={2} className="py-3 px-3.5 uppercase tracking-wider text-[11px]">
                          Grand Total ({filteredProducts.length} Items)
                        </td>
                        <td className="py-3 px-3 text-right font-mono">
                          {summary.total_month_opening.toLocaleString()}
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-blue-800">
                          {summary.total_day_stock.toLocaleString()}
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-emerald-800">
                          +{summary.total_production_ok.toLocaleString()}
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-rose-700">
                          -{summary.total_pdi_rejection.toLocaleString()}
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-purple-800">
                          {summary.total_finished_good.toLocaleString()}
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-amber-800">
                          -{summary.total_dispatched.toLocaleString()}
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-indigo-950 text-sm">
                          {summary.total_wip_stock.toLocaleString()}
                        </td>
                        <td className="py-3 px-3 text-right font-mono">
                          {summary.total_wip_stock.toLocaleString()}
                        </td>
                        <td className="py-3 px-3 print:hidden"></td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </div>
          )}

          {/* Sub-view 2: Monthly Day-by-Day Sheet (Day 1 to 31) */}
          {stockSubView === "ledger" && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="p-3.5 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50/70">
                <div>
                  <h3 className="font-bold text-slate-900 text-xs flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                    Continuous Monthly Ledger:{" "}
                    <span className="text-blue-700 font-bold">
                      {currentSelectedProject?.project_name || "Select Product"}
                    </span>
                    <span className="text-slate-400 font-mono text-[10px]">
                      ({currentSelectedProject?.project_code || "N/A"})
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Month Opening Stock:{" "}
                    <span className="font-mono font-bold text-slate-800">
                      {Number(currentSelectedProject?.month_opening_stock || 0).toLocaleString()}
                    </span>{" "}
                    | Selected Month:{" "}
                    <span className="font-mono font-bold text-slate-800">{selectedMonth}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 rounded-lg border border-emerald-200">
                    <CheckCircle2 size={12} />
                    Current Live Warehouse Inventory:{" "}
                    <b className="font-mono">{Number(currentSelectedProject?.live_store_inventory || 0).toLocaleString()}</b>
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                      <th className="py-3 px-3 text-center w-16">Day #</th>
                      <th className="py-3 px-3.5">Date</th>
                      <th className="py-3 px-3 text-right bg-blue-50/40 text-blue-900">
                        Day Stock (Opening)
                      </th>
                      <th className="py-3 px-3 text-right bg-emerald-50/40 text-emerald-900">
                        Production OK
                      </th>
                      <th className="py-3 px-3 text-right text-slate-500">Floor Rej</th>
                      <th className="py-3 px-3 text-right bg-rose-50/40 text-rose-900">
                        PDI Rejection
                      </th>
                      <th className="py-3 px-3 text-right bg-purple-50/40 text-purple-900 font-black">
                        Finished Good Stock
                      </th>
                      <th className="py-3 px-3 text-right text-amber-800">Dispatched</th>
                      <th className="py-3 px-3 text-right bg-indigo-50/50 text-indigo-900 font-black">
                        WIP / Closing Inventory
                      </th>
                      <th className="py-3 px-3 text-right text-slate-700">Tomorrow Day Stock</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {activeLedger.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="py-10 text-center text-slate-400">
                          No ledger records found for this product.
                        </td>
                      </tr>
                    ) : (
                      activeLedger.map((row) => (
                        <tr
                          key={row.day_number}
                          className={`transition-colors ${
                            row.is_selected_date
                              ? "bg-blue-50/70 font-semibold border-l-4 border-l-blue-600"
                              : "hover:bg-slate-50/60"
                          }`}
                        >
                          <td className="py-2 px-3 text-center font-mono font-bold text-slate-600">
                            {row.day_number}
                          </td>
                          <td className="py-2 px-3.5 font-mono text-slate-700">
                            <div className="flex items-center gap-1.5">
                              {row.date}
                              {row.is_selected_date && (
                                <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-blue-600 text-white uppercase tracking-tight">
                                  Selected
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-blue-700 bg-blue-50/20">
                            {Number(row.day_stock).toLocaleString()}
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-emerald-700 bg-emerald-50/20">
                            {row.production_ok_quantity > 0 ? (
                              <span className="text-emerald-700 font-black">
                                +{Number(row.production_ok_quantity).toLocaleString()}
                              </span>
                            ) : (
                              <span className="text-slate-300">0</span>
                            )}
                          </td>
                          <td className="py-2 px-3 text-right font-mono text-slate-400">
                            {row.production_floor_rejection > 0 ? (
                              Number(row.production_floor_rejection).toLocaleString()
                            ) : (
                              "0"
                            )}
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-rose-600 bg-rose-50/20">
                            {row.pdi_rejection_quantity > 0 ? (
                              <span className="text-rose-600 font-black">
                                -{Number(row.pdi_rejection_quantity).toLocaleString()}
                              </span>
                            ) : (
                              <span className="text-slate-300">0</span>
                            )}
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-black text-purple-700 bg-purple-50/20">
                            {Number(row.finished_good_quantity).toLocaleString()}
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-semibold text-amber-700">
                            {row.dispatched_quantity > 0 ? (
                              <span className="text-amber-700 font-bold">
                                -{Number(row.dispatched_quantity).toLocaleString()}
                              </span>
                            ) : (
                              <span className="text-slate-300">0</span>
                            )}
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-black text-indigo-900 bg-indigo-50/40">
                            <span className="px-2 py-0.5 rounded-md bg-indigo-100/70 border border-indigo-200">
                              {Number(row.wip_stock).toLocaleString()}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-semibold text-slate-700">
                            {Number(row.tomorrow_day_stock).toLocaleString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: PROJECTS STATUS & BALANCE SHEET (Legacy Tab Preserved) */}
      {/* ========================================================================= */}
      {activeTab === "projects" && (
        <div className="space-y-4">
          <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between print:hidden">
            <div className="relative w-full sm:w-80">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by project name, code, client..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
            <div className="text-xs text-slate-500 font-medium">
              Showing {filteredProjectsTab.length} project records
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                    <th className="py-3.5 px-4">Project</th>
                    <th className="py-3.5 px-4">Client</th>
                    <th className="py-3.5 px-4 text-right">Order Target</th>
                    <th className="py-3.5 px-4 text-right">Planned Qty</th>
                    <th className="py-3.5 px-4 text-right">Produced (OK)</th>
                    <th className="py-3.5 px-4 text-right">Rejections</th>
                    <th className="py-3.5 px-4 text-right">Delivered</th>
                    <th className="py-3.5 px-4 text-right">Balance Produce</th>
                    <th className="py-3.5 px-4 text-right">Balance Deliver</th>
                    <th className="py-3.5 px-4 w-36">Completion %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={10} className="py-12 text-center text-slate-400">
                        <RefreshCw className="animate-spin w-5 h-5 mx-auto mb-2 text-blue-500" />
                        Loading project balance sheets...
                      </td>
                    </tr>
                  ) : filteredProjectsTab.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-12 text-center text-slate-400">
                        No project records found.
                      </td>
                    </tr>
                  ) : (
                    filteredProjectsTab.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4 font-semibold text-slate-900">
                          <div>{p.project_name}</div>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {p.project_code || `PRJ-${p.id}`}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-700 font-medium">
                          {p.client_name || "Direct Client"}
                        </td>
                        <td className="py-3 px-4 text-right font-black text-slate-900 font-mono">
                          {Number(p.project_quantity).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-right font-semibold text-indigo-700 font-mono">
                          {Number(p.total_planned).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-emerald-700 font-mono">
                          {Number(p.total_produced).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-rose-600 font-mono">
                          {Number(p.total_rejections).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-blue-700 font-mono">
                          {Number(p.total_delivered).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-amber-700 font-mono">
                          {Number(p.balance_to_produce).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-purple-700 font-mono">
                          {Number(p.balance_to_deliver).toLocaleString()}
                        </td>
                        <td className="py-3 px-4">
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-[10px] font-semibold">
                              <span className="text-emerald-700">Prod: {p.production_progress_pct}%</span>
                              <span className="text-blue-700">Del: {p.delivery_progress_pct}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden flex">
                              <div
                                className="h-full bg-emerald-500"
                                style={{ width: `${Math.min(100, p.production_progress_pct)}%` }}
                              />
                              <div
                                className="h-full bg-blue-500"
                                style={{ width: `${Math.min(100, p.delivery_progress_pct)}%` }}
                              />
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: MACHINE EFFICIENCY REPORT (Legacy Tab Preserved) */}
      {/* ========================================================================= */}
      {activeTab === "machines" && (
        <div className="space-y-4">
          <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between print:hidden">
            <div className="relative w-full sm:w-80">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by machine name, code, type..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
            <div className="text-xs text-slate-500 font-medium">
              Showing {filteredMachinesTab.length} machines
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                    <th className="py-3.5 px-4">Machine</th>
                    <th className="py-3.5 px-4">Type & Location</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Runs Count</th>
                    <th className="py-3.5 px-4 text-right">Total Units Produced</th>
                    <th className="py-3.5 px-4 text-right">OK Parts</th>
                    <th className="py-3.5 px-4 text-right">Rejections</th>
                    <th className="py-3.5 px-4 text-right">Working Hours</th>
                    <th className="py-3.5 px-4 text-right">Avg Rate/Hour</th>
                    <th className="py-3.5 px-4 text-right">Avg Rejection %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={10} className="py-12 text-center text-slate-400">
                        <RefreshCw className="animate-spin w-5 h-5 mx-auto mb-2 text-blue-500" />
                        Loading machine floor analytics...
                      </td>
                    </tr>
                  ) : filteredMachinesTab.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-12 text-center text-slate-400">
                        No machine records found.
                      </td>
                    </tr>
                  ) : (
                    filteredMachinesTab.map((m) => (
                      <tr key={m.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4 font-semibold text-slate-900">
                          <div>{m.machine_name}</div>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {m.machine_code}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-700">
                          <div>{m.machine_type}</div>
                          <span className="text-[10px] text-slate-400">{m.location || "Floor 1"}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              m.status === "Running"
                                ? "bg-blue-100 text-blue-800 border-blue-300"
                                : m.status === "Available"
                                ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                                : "bg-rose-100 text-rose-800 border-rose-300"
                            }`}
                          >
                            {m.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-medium text-slate-700">
                          {m.total_jobs}
                        </td>
                        <td className="py-3 px-4 text-right font-black text-slate-900 font-mono">
                          {Number(m.total_units_produced).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-emerald-700 font-mono">
                          {Number(m.total_ok_units).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-rose-600 font-mono">
                          {Number(m.total_rejections).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-right font-semibold text-slate-700 font-mono">
                          {m.total_hours_run} Hrs
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-indigo-700 font-mono">
                          {m.avg_units_per_hour}/hr
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-rose-600 font-mono">
                          {m.avg_rejection_pct}%
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: PDI REJECTIONS LOG HISTORY */}
      {/* ========================================================================= */}
      {activeTab === "pdi-log" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
            <div>
              <h3 className="font-bold text-slate-900 text-xs">PDI (Pre-Delivery Inspection) Log History</h3>
              <p className="text-[11px] text-slate-500">
                Log of defect units removed during quality audit before dispatch.
              </p>
            </div>
            <button
              onClick={() => {
                setPdiForm((prev) => ({
                  ...prev,
                  project_id: selectedProjectId || (productsList[0]?.project_id ? String(productsList[0].project_id) : ""),
                  inspection_date: selectedDate
                }));
                setIsPdiModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-all cursor-pointer shadow-xs"
            >
              <Plus size={14} />
              Log New PDI Rejection
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                    <th className="py-3 px-4">Inspection Date</th>
                    <th className="py-3 px-4">Product</th>
                    <th className="py-3 px-4 text-right">Rejection Qty</th>
                    <th className="py-3 px-4">Reason / Defect</th>
                    <th className="py-3 px-4">Inspector</th>
                    <th className="py-3 px-4">Notes</th>
                    <th className="py-3 px-4 text-center print:hidden">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pdiLogData.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-slate-400">
                        No PDI rejection records found for {selectedMonth}.
                      </td>
                    </tr>
                  ) : (
                    pdiLogData.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4 font-mono font-semibold text-slate-800">
                          {item.inspection_date ? String(item.inspection_date).substring(0, 10) : "N/A"}
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-900">
                          <div>{item.project_name}</div>
                          <span className="text-[10px] text-slate-400 font-mono">{item.project_code}</span>
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-black text-rose-600">
                          {Number(item.rejection_quantity).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-slate-700">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                            {item.reason || "Defect"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-700 font-medium">
                          {item.inspected_by || "QC Inspector"}
                        </td>
                        <td className="py-3 px-4 text-slate-500 max-w-xs truncate">
                          {item.notes || "-"}
                        </td>
                        <td className="py-3 px-4 text-center print:hidden">
                          <button
                            onClick={() => handleDeletePdi(item.id)}
                            className="text-slate-400 hover:text-rose-600 p-1 rounded-lg transition-colors cursor-pointer"
                            title="Delete this record"
                          >
                            <X size={14} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: LOG PDI REJECTION */}
      {/* ========================================================================= */}
      {isPdiModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-rose-50/50">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-rose-600 text-white shadow-2xs">
                  <ShieldAlert size={16} />
                </span>
                <h3 className="font-bold text-slate-900 text-sm">Log PDI Rejection Quantity</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsPdiModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmitPdi} className="p-5 space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Product / Project <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={pdiForm.project_id}
                  onChange={(e) => setPdiForm({ ...pdiForm, project_id: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                >
                  <option value="">Select Product...</option>
                  {productsList.map((pr) => (
                    <option key={pr.project_id} value={pr.project_id}>
                      {pr.project_name} ({pr.project_code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Inspection Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={pdiForm.inspection_date}
                    onChange={(e) => setPdiForm({ ...pdiForm, inspection_date: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Rejection Qty <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    placeholder="e.g. 15"
                    value={pdiForm.rejection_quantity}
                    onChange={(e) => setPdiForm({ ...pdiForm, rejection_quantity: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 font-mono font-bold text-rose-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Defect Reason / Quality Parameter
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dimension tolerance defect, flash, visual damage"
                  value={pdiForm.reason}
                  onChange={(e) => setPdiForm({ ...pdiForm, reason: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Inspected By
                </label>
                <input
                  type="text"
                  placeholder="Inspector name or shift incharge"
                  value={pdiForm.inspected_by}
                  onChange={(e) => setPdiForm({ ...pdiForm, inspected_by: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Notes / Observations
                </label>
                <textarea
                  rows={2}
                  placeholder="Additional inspection notes..."
                  value={pdiForm.notes}
                  onChange={(e) => setPdiForm({ ...pdiForm, notes: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsPdiModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalSubmitting}
                  className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                >
                  {modalSubmitting ? <RefreshCw size={13} className="animate-spin" /> : <ShieldAlert size={14} />}
                  Save Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: SET MONTH OPENING STOCK */}
      {/* ========================================================================= */}
      {isOpeningModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-indigo-50/50">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-indigo-600 text-white shadow-2xs">
                  <SlidersHorizontal size={16} />
                </span>
                <h3 className="font-bold text-slate-900 text-sm">Set Product Month Opening Stock</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsOpeningModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmitOpening} className="p-5 space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Product / Project <span className="text-indigo-500">*</span>
                </label>
                <select
                  required
                  value={openingForm.project_id}
                  onChange={(e) => setOpeningForm({ ...openingForm, project_id: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                >
                  <option value="">Select Product...</option>
                  {productsList.map((pr) => (
                    <option key={pr.project_id} value={pr.project_id}>
                      {pr.project_name} ({pr.project_code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Month Period <span className="text-indigo-500">*</span>
                  </label>
                  <input
                    type="month"
                    required
                    value={openingForm.month_key}
                    onChange={(e) => setOpeningForm({ ...openingForm, month_key: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Opening Stock <span className="text-indigo-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    placeholder="e.g. 500"
                    value={openingForm.opening_stock}
                    onChange={(e) => setOpeningForm({ ...openingForm, opening_stock: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono font-bold text-indigo-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Notes / Audit Reference
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Physical inventory audit baseline"
                  value={openingForm.notes}
                  onChange={(e) => setOpeningForm({ ...openingForm, notes: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsOpeningModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalSubmitting}
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                >
                  {modalSubmitting ? <RefreshCw size={13} className="animate-spin" /> : <SlidersHorizontal size={14} />}
                  Save Opening Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
