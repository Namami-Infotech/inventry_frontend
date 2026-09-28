import React, { useState, useEffect } from 'react';
import {
    ShoppingCart,
    Plus,
    Filter,
    ArrowUpRight,
    Eye,
    CheckCircle2,
    Clock,
    AlertCircle,
    Building2,
    XCircle
} from 'lucide-react';
import { getPurchases, cancelPurchase } from '../services/purchaseService.jsx';
import { ReceivePurchaseModal } from '../component/ReceivePurchaseModal.jsx';
import { ViewPurchaseModal } from '../component/viewPurchaseModal.jsx';
import { useNavigate } from 'react-router-dom';
import Pagination from '../../../components/common/pagination';
import TableSearch from '../../../components/common/TableSearch.jsx';
import DeleteConfirmation from '../../../components/common/DeleteConfirmation.jsx';

export const PurchaseListPage = ({ onOpenCreate }) => {
    const navigate = useNavigate();
    const [purchases, setPurchases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        pageSize: 10,
        totalItems: 0,
        totalPages: 1
    });

    const [receivingPurchaseId, setReceivingPurchaseId] = useState(null);
    const [viewingPurchaseId, setViewingPurchaseId] = useState(null);
    const [cancelModalOpen, setCancelModalOpen] = useState(false);
    const [selectedPurchase, setSelectedPurchase] = useState(null);
    const [cancelLoading, setCancelLoading] = useState(false);

    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const rawRole = (currentUser.role || '').toLowerCase();
    const canManagePurchases = rawRole.includes('admin') || rawRole.includes('store') || rawRole.includes('manager');

    useEffect(() => {
        fetchPurchases();
    }, [page, limit, search, statusFilter]);

    const handleSearchChange = (val) => {
        setSearch(val);
        setPage(1);
    };

    const fetchPurchases = async () => {
        setLoading(true);
        try {
            const params = {
                page,
                limit,
                search: search || undefined,
                status: statusFilter !== 'all' ? statusFilter : undefined
            };
            const res = await getPurchases(params);
            if (res.success) {
                setPurchases(res.data || []);
                if (res.pagination) {
                    setPagination(res.pagination);
                } else {
                    setPagination({
                        currentPage: page,
                        pageSize: limit,
                        totalItems: res.data?.length || 0,
                        totalPages: Math.ceil((res.data?.length || 0) / limit) || 1
                    });
                }
            }
        } catch (e) {
            console.error("Failed to load purchases", e);
        } finally {
            setLoading(false);
        }
    };

    const handleCancelClick = (p) => {
        setSelectedPurchase(p);
        setCancelModalOpen(true);
    };

    const handleConfirmCancel = async () => {
        if (!selectedPurchase) return;
        setCancelLoading(true);
        try {
            const res = await cancelPurchase(selectedPurchase.id);
            if (res.success) {
                setCancelModalOpen(false);
                setSelectedPurchase(null);
                if (purchases.length === 1 && page > 1) {
                    setPage(prev => Math.max(1, prev - 1));
                } else {
                    fetchPurchases();
                }
            } else {
                alert(res.message || "Failed to cancel purchase");
            }
        } catch (error) {
            console.error("Error cancelling purchase:", error);
            alert(error.response?.data?.message || "Error cancelling purchase");
        } finally {
            setCancelLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        if (status === 'Received') {
            return <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5 w-max"><CheckCircle2 size={12} />Received</span>;
        }
        if (status === 'Partially Received') {
            return <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1.5 w-max"><Clock size={12} />Partially Received</span>;
        }
        if (status === 'Ordered') {
            return <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1.5 w-max"><span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>Ordered</span>;
        }
        if (status === 'Cancelled') {
            return <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1.5 w-max"><AlertCircle size={12} />Cancelled</span>;
        }
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-700 border border-gray-200 flex items-center gap-1.5 w-max">Draft</span>;
    };

    return (
        <div className="max-w-7xl mx-auto space-y-5 animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl shadow-xs border border-gray-200">
                <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/30">
                        <ShoppingCart size={18} />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-gray-900 tracking-tight">Raw Material Purchases</h1>
                        <p className="text-xs text-gray-500">Procure raw materials from vendors and receive stock into store inventory</p>
                    </div>
                </div>

                {canManagePurchases && (
                    <button
                        onClick={onOpenCreate || (() => navigate('/pages/mainModule/purchase/new'))}
                        className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-semibold text-xs shadow-md shadow-blue-500/25 transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
                    >
                        <Plus size={16} />
                        New Purchase Entry
                    </button>
                )}
            </div>

            {/* Filters */}
            <div className="bg-white p-3.5 rounded-2xl border border-gray-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="w-full sm:w-80">
                    <TableSearch
                        value={search}
                        onChange={handleSearchChange}
                        placeholder="Search PO number, vendor, invoice..."
                    />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Filter size={15} className="text-gray-400" />
                    <select
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value);
                            setPage(1);
                        }}
                        className="border border-gray-300 rounded-xl px-3 py-2 text-xs bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                    >
                        <option value="all">All Statuses</option>
                        <option value="Ordered">Ordered (Pending)</option>
                        <option value="Partially Received">Partially Received</option>
                        <option value="Received">Received (Completed)</option>
                        <option value="Draft">Draft</option>
                        <option value="Cancelled">Cancelled</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                        <thead>
                            <tr className="bg-slate-900 text-white font-semibold text-[11px] uppercase tracking-wider">
                                <th className="py-3.5 px-4">PO Number</th>
                                <th className="py-3.5 px-4">Vendor</th>
                                <th className="py-3.5 px-4">Invoice No</th>
                                <th className="py-3.5 px-4">Date</th>
                                <th className="py-3.5 px-4 text-right">Items / Qty</th>
                                <th className="py-3.5 px-4 text-right">Received Qty</th>
                                <th className="py-3.5 px-4 text-right">Grand Total (₹)</th>
                                <th className="py-3.5 px-4 text-center">Status</th>
                                <th className="py-3.5 px-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="9" className="text-center py-12 text-gray-400 font-medium">
                                        Loading purchases...
                                    </td>
                                </tr>
                            ) : purchases.length === 0 ? (
                                <tr>
                                    <td colSpan="9" className="text-center py-12 text-gray-400 font-medium">
                                        {search ? `No purchase orders found matching "${search}".` : "No purchase orders found."}
                                    </td>
                                </tr>
                            ) : (
                                purchases.map(p => {
                                    const totalQty = Number(p.total_quantity) || 0;
                                    const recvQty = Number(p.total_received_quantity) || 0;
                                    const isFullyReceived = p.status === 'Received';
                                    const isCancelled = p.status === 'Cancelled';

                                    return (
                                        <tr key={p.id} className="hover:bg-blue-50/30 transition-colors">
                                            <td className="py-3.5 px-4 font-mono font-bold text-blue-600">{p.purchase_number}</td>
                                            <td className="py-3.5 px-4">
                                                <div className="font-bold text-gray-900 flex items-center gap-1.5">
                                                    <Building2 size={13} className="text-gray-400" />
                                                    {p.vendor_name}
                                                </div>
                                                {p.vendor_phone && <div className="text-[10px] text-gray-400">{p.vendor_phone}</div>}
                                            </td>
                                            <td className="py-3.5 px-4 font-mono text-gray-700 font-semibold">{p.invoice_number}</td>
                                            <td className="py-3.5 px-4 text-gray-600 font-medium">{String(p.purchase_date).split('T')[0]}</td>
                                            <td className="py-3.5 px-4 text-right font-bold text-gray-900">
                                                {totalQty.toLocaleString()} <span className="text-[10px] text-gray-400 font-normal">({p.total_items_count || 1} items)</span>
                                            </td>
                                            <td className="py-3.5 px-4 text-right font-bold text-emerald-600">
                                                {recvQty.toLocaleString()}
                                            </td>
                                            <td className="py-3.5 px-4 text-right font-bold text-gray-900">
                                                ₹{Number(p.grand_total || 0).toLocaleString()}
                                            </td>
                                            <td className="py-3.5 px-4 text-center">
                                                <div className="flex justify-center">{getStatusBadge(p.status)}</div>
                                            </td>
                                            <td className="py-3.5 px-4 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <button
                                                        onClick={() => setViewingPurchaseId(p.id)}
                                                        title="View Details"
                                                        className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                                                    >
                                                        <Eye size={15} />
                                                    </button>

                                                    {canManagePurchases && !isFullyReceived && !isCancelled && (
                                                        <>
                                                            <button
                                                                onClick={() => setReceivingPurchaseId(p.id)}
                                                                className="px-2.5 py-1 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1"
                                                            >
                                                                <ArrowUpRight size={13} />
                                                                Receive
                                                            </button>
                                                            <button
                                                                onClick={() => handleCancelClick(p)}
                                                                title="Cancel Purchase"
                                                                className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                                            >
                                                                <XCircle size={15} />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                <Pagination
                    currentPage={pagination.currentPage}
                    totalPages={pagination.totalPages}
                    totalItems={pagination.totalItems}
                    pageSize={pagination.pageSize}
                    onPageChange={setPage}
                    onPageSizeChange={(newSize) => {
                        setLimit(newSize);
                        setPage(1);
                    }}
                />
            </div>

            {/* Modals */}
            <ReceivePurchaseModal
                isOpen={!!receivingPurchaseId}
                purchaseId={receivingPurchaseId}
                onClose={() => setReceivingPurchaseId(null)}
                onSuccess={fetchPurchases}
            />

            <ViewPurchaseModal
                isOpen={!!viewingPurchaseId}
                purchaseId={viewingPurchaseId}
                onClose={() => setViewingPurchaseId(null)}
            />

            <DeleteConfirmation
                isOpen={cancelModalOpen}
                onClose={() => {
                    setCancelModalOpen(false);
                    setSelectedPurchase(null);
                }}
                onConfirm={handleConfirmCancel}
                title="Cancel Purchase Order"
                itemName={selectedPurchase?.purchase_number}
                message="Are you sure you want to cancel this purchase order? This action cannot be undone."
                confirmText="Cancel PO"
                loading={cancelLoading}
            />
        </div>
    );
};
