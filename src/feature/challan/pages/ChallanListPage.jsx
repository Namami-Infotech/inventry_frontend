import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Eye, Printer, Search, Filter, Calendar, X, FileText, Truck, Package, Factory, CheckCircle2, Clock, AlertTriangle, Layers } from 'lucide-react';
import { getAllChallans, getChallanById } from '../services/challanService';
import { ViewChallanModal } from '../components/ViewChallanModal';
import { Pagination } from '../../../components/common/pagination';

export const ChallanListPage = ({ onOpenCreate }) => {
  const [challans, setChallans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedChallan, setSelectedChallan] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewLoading, setViewLoading] = useState(false);

  // Tabs: 'all' | 'site_material' | 'in_house'
  const [activeTab, setActiveTab] = useState('all');

  // Filters state
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    receiptStatus: '',
    dispatchDate: '',
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchChallans();
  }, []);

  const fetchChallans = async () => {
    try {
      setLoading(true);
      const res = await getAllChallans();
      if (res?.data) {
        setChallans(res.data);
      } else if (Array.isArray(res)) {
        setChallans(res);
      }
    } catch (err) {
      console.error('Failed to fetch challans:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      status: '',
      receiptStatus: '',
      dispatchDate: '',
    });
    setCurrentPage(1);
  };

  const hasActiveFilters = Boolean(
    filters.search || filters.status || filters.receiptStatus || filters.dispatchDate
  );

  const getLocalDateString = (dateInput) => {
    if (!dateInput) return '';
    if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}/.test(dateInput)) {
      return dateInput.substring(0, 10);
    }
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return '';
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    if (typeof dateStr === 'string' && /^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
      const parts = dateStr.substring(0, 10).split('-');
      return `${parseInt(parts[2], 10)}/${parseInt(parts[1], 10)}/${parts[0]}`;
    }
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '-';
    return d.toLocaleDateString('en-IN');
  };

  // Counts per tab
  const siteChallansCount = useMemo(() => {
    return challans.filter((c) => {
      const isInHouse = c.challan_type === 'in_house' || c.delivery_type === 'in_house' || c.receipt_status === 'Direct Delivery';
      return !isInHouse;
    }).length;
  }, [challans]);

  const directChallansCount = useMemo(() => {
    return challans.filter((c) => {
      const isInHouse = c.challan_type === 'in_house' || c.delivery_type === 'in_house' || c.receipt_status === 'Direct Delivery';
      return isInHouse;
    }).length;
  }, [challans]);

  // Filtered challans list according to active tab and search filters
  const filteredChallans = useMemo(() => {
    return challans.filter((item) => {
      const isInHouse = item.challan_type === 'in_house' || item.delivery_type === 'in_house' || item.receipt_status === 'Direct Delivery';
      if (activeTab === 'site_material' && isInHouse) return false;
      if (activeTab === 'in_house' && !isInHouse) return false;

      const q = filters.search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        (item.challan_no && item.challan_no.toLowerCase().includes(q)) ||
        (item.delivery_no && item.delivery_no.toLowerCase().includes(q)) ||
        (item.customer_name && item.customer_name.toLowerCase().includes(q)) ||
        (item.site_engineer_name && item.site_engineer_name.toLowerCase().includes(q)) ||
        (item.vehicle_no && item.vehicle_no.toLowerCase().includes(q)) ||
        (item.transporter_name && item.transporter_name.toLowerCase().includes(q)) ||
        (item.po_number && String(item.po_number).toLowerCase().includes(q)) ||
        (item.customer_phone && String(item.customer_phone).includes(q));

      const matchesStatus =
        !filters.status || item.status === filters.status;

      const matchesReceiptStatus =
        !filters.receiptStatus || item.receipt_status === filters.receiptStatus;

      let matchesDate = true;
      if (filters.dispatchDate) {
        const itemDateStr = getLocalDateString(item.dispatch_date || item.created_at);
        matchesDate = itemDateStr === filters.dispatchDate;
      }

      return matchesSearch && matchesStatus && matchesReceiptStatus && matchesDate;
    });
  }, [challans, filters, activeTab]);

  const handleViewChallan = async (challan) => {
    try {
      setViewLoading(true);
      const res = await getChallanById(challan.id);
      if (res?.data) {
        setSelectedChallan(res.data);
      } else {
        setSelectedChallan(challan);
      }
      setIsViewModalOpen(true);
    } catch (err) {
      console.warn('Could not fetch full challan details, using table record:', err);
      setSelectedChallan(challan);
      setIsViewModalOpen(true);
    } finally {
      setViewLoading(false);
    }
  };

  // Pagination calculations
  const totalItems = filteredChallans.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const paginatedChallans = filteredChallans.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FileText size={22} className="text-blue-600" />
            Delivery Challan Module
          </h1>
          <p className="text-xs text-gray-500">Generate, view, track and print official Delivery Challans for outward shipments</p>
        </div>

        <button
          onClick={onOpenCreate}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-sm transition cursor-pointer"
        >
          <Plus size={16} /> Create Challan
        </button>
      </div>

      {/* TABS & COUNTS */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 pb-3">
        <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs">
          <button
            type="button"
            onClick={() => { setActiveTab('all'); setCurrentPage(1); }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
              activeTab === 'all'
                ? 'bg-white text-blue-600 shadow-sm border border-gray-200/60'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Layers size={14} />
            <span>All Challans</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              activeTab === 'all' ? 'bg-blue-100 text-blue-800' : 'bg-gray-200 text-gray-700'
            }`}>
              {challans.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('site_material'); setCurrentPage(1); }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
              activeTab === 'site_material'
                ? 'bg-white text-blue-600 shadow-sm border border-gray-200/60'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Package size={14} />
            <span>Site Challan (Items)</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              activeTab === 'site_material' ? 'bg-blue-100 text-blue-800' : 'bg-gray-200 text-gray-700'
            }`}>
              {siteChallansCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('in_house'); setCurrentPage(1); }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
              activeTab === 'in_house'
                ? 'bg-white text-purple-600 shadow-sm border border-gray-200/60'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Factory size={14} />
            <span>Direct Product Challan (Finished Goods)</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              activeTab === 'in_house' ? 'bg-purple-100 text-purple-800' : 'bg-gray-200 text-gray-700'
            }`}>
              {directChallansCount}
            </span>
          </button>
        </div>

        <span className="text-xs text-gray-500">
          Showing <strong className="text-gray-800 font-semibold">{filteredChallans.length}</strong> Challans
        </span>
      </div>

      {/* FILTER BAR CARD */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* SEARCH INPUT */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
              Search Challan
            </label>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                placeholder="Challan No, Customer, PO..."
                className="w-full bg-white text-slate-800 text-xs border border-slate-300 rounded-xl pl-9 pr-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              />
            </div>
          </div>

          {/* DISPATCH STATUS FILTER */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
              Dispatch Status
            </label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="w-full bg-white text-slate-800 text-xs border border-slate-300 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            >
              <option value="">All Dispatch Statuses</option>
              <option value="Partially Delivered">Partially Delivered</option>
              <option value="Fully Delivered">Fully Delivered</option>
            </select>
          </div>

          {/* RECEIPT STATUS */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
              Site Receipt Status
            </label>
            <select
              name="receiptStatus"
              value={filters.receiptStatus}
              onChange={handleFilterChange}
              className="w-full bg-white text-slate-800 text-xs border border-slate-300 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            >
              <option value="">All Receipt Statuses</option>
              <option value="Pending Receipt">Pending Receipt</option>
              <option value="Partially Received">Partially Received</option>
              <option value="Fully Received">Fully Received</option>
              <option value="Direct Delivery">Direct Delivery</option>
            </select>
          </div>

          {/* DISPATCH DATE FILTER */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
              Challan Date
            </label>
            <input
              type="date"
              name="dispatchDate"
              value={filters.dispatchDate}
              onChange={handleFilterChange}
              className="w-full bg-white text-slate-800 text-xs border border-slate-300 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
          </div>
        </div>

        {/* CLEAR FILTERS */}
        {hasActiveFilters && (
          <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-100">
            <span className="text-[11px] text-slate-500">
              Filtered: <strong className="text-slate-800">{filteredChallans.length}</strong> of {challans.length} records
            </span>
            <button
              type="button"
              onClick={handleClearFilters}
              className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-800 transition cursor-pointer"
            >
              <X size={13} /> Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* TABLE CARD */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500">Loading challans...</div>
        ) : filteredChallans.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            {hasActiveFilters
              ? 'No challans match the selected filters.'
              : 'No challans found. Click "+ Create Challan" to generate one.'}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs min-w-[900px]">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-gray-200">
                  <tr>
                    <th className="py-2.5 px-3.5 whitespace-nowrap">Challan No</th>
                    <th className="py-2.5 px-3.5 whitespace-nowrap">Customer</th>
                    <th className="py-2.5 px-3.5 whitespace-nowrap">SO / PO Ref</th>
                    <th className="py-2.5 px-3.5 whitespace-nowrap">Challan Date</th>
                    <th className="py-2.5 px-3.5 whitespace-nowrap">Transporter</th>
                    <th className="py-2.5 px-3.5 whitespace-nowrap">Vehicle No</th>
                    <th className="py-2.5 px-3.5 text-right whitespace-nowrap">Dispatched Qty</th>
                    <th className="py-2.5 px-3.5 text-center whitespace-nowrap">Status</th>
                    <th className="py-2.5 px-3.5 text-center w-16 whitespace-nowrap">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedChallans.map((item) => {
                    const isFullyDelivered =
                      item.status === 'Fully Delivered' ||
                      item.status === 'Delivered';

                    let itemsList = item.items || item.delivery_items || [];
                    if (typeof itemsList === 'string') {
                      try {
                        itemsList = JSON.parse(itemsList);
                      } catch (e) {
                        itemsList = [];
                      }
                    }
                    const rowDeliveredQty = Array.isArray(itemsList)
                      ? itemsList.reduce(
                          (acc, curr) => acc + Number(curr.delivered_qty ?? curr.this_challan_qty ?? curr.qty ?? 0),
                          0
                        )
                      : Number(item.total_delivered_qty || 0);

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-2 px-3.5 whitespace-nowrap">
                          <button
                            onClick={() => handleViewChallan(item)}
                            className="font-bold text-blue-600 font-mono hover:underline text-left cursor-pointer flex items-center gap-1.5"
                          >
                            <FileText size={13} className="text-blue-500 shrink-0" />
                            <span>{item.challan_no}</span>
                          </button>
                        </td>

                        <td className="py-2 px-3.5 whitespace-nowrap">
                          <span className="font-semibold text-slate-800">
                            {item.customer_name || 'Customer'}
                          </span>
                        </td>

                        <td className="py-2 px-3.5 font-semibold text-slate-700 whitespace-nowrap">
                          {item.po_number ? `PO: ${item.po_number}` : (item.order_id ? `SO #${item.order_id}` : '-')}
                        </td>

                        <td className="py-2 px-3.5 text-slate-600 whitespace-nowrap">
                          {formatDate(item.dispatch_date || item.created_at)}
                        </td>

                        <td className="py-2 px-3.5 text-slate-700 font-medium whitespace-nowrap">
                          {item.transporter_name || 'Self / By Hand'}
                        </td>

                        <td className="py-2 px-3.5 whitespace-nowrap">
                          {item.vehicle_no ? (
                            <span className="font-mono text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 uppercase">
                              {item.vehicle_no}
                            </span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>

                        <td className="py-2 px-3.5 text-right whitespace-nowrap">
                          <div className="font-mono font-bold text-slate-900 text-xs">
                            {rowDeliveredQty}
                          </div>
                        </td>

                        <td className="py-2 px-3.5 text-center whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border whitespace-nowrap ${
                              isFullyDelivered
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isFullyDelivered ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                            <span>{item.status || 'Dispatched'}</span>
                          </span>
                        </td>

                        <td className="py-2 px-3.5 text-center whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => handleViewChallan(item)}
                            title="View Challan"
                            className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all cursor-pointer inline-flex items-center justify-center"
                          >
                            <Eye size={15} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>

      {/* View Challan Modal */}
      <ViewChallanModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedChallan(null);
        }}
        challan={selectedChallan}
      />
    </div>
  );
};
