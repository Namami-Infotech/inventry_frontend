import React, { useState, useEffect } from 'react';
import {
    Store,
    Package,
    Box,
    Filter,
    Plus,
    AlertTriangle,
    CheckCircle2,
    Sliders,
    Trash2
} from 'lucide-react';
import { getStoreItems, deleteStoreItem } from '../services/storeItemService.jsx';
import { AddStoreItemModal } from '../component/AddStoreItemModal.jsx';
import { AdjustStockModal } from '../component/AdjustStockModal.jsx';
import Pagination from '../../../components/common/pagination';
import TableSearch from '../../../components/common/TableSearch.jsx';
import DeleteConfirmation from '../../../components/common/DeleteConfirmation.jsx';

export const StorePage = () => {
    const [activeTab, setActiveTab] = useState('raw_materials'); // 'raw_materials' | 'finished_goods'
    const [items, setItems] = useState([]);
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

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [adjustingItem, setAdjustingItem] = useState(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const rawRole = (currentUser.role || '').toLowerCase();
    const canManageStore = rawRole.includes('admin') || rawRole.includes('store') || rawRole.includes('manager');
    const isAdmin = rawRole.includes('admin');

    useEffect(() => {
        fetchItems();
    }, [activeTab, statusFilter, page, limit, search]);

    const handleSearchChange = (val) => {
        setSearch(val);
        setPage(1);
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setPage(1);
        setSearch('');
    };

    const fetchItems = async () => {
        setLoading(true);
        try {
            const itemType = activeTab === 'raw_materials' ? 'raw_material' : 'finished_good';
            const params = {
                item_type: itemType,
                status: statusFilter !== 'all' ? statusFilter : undefined,
                page,
                limit,
                search: search || undefined
            };
            const res = await getStoreItems(params);
            if (res.success) {
                setItems(res.data || []);
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
            console.error("Failed to load store items", e);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = (item) => {
        setSelectedItem(item);
        setDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!selectedItem) return;
        setDeleteLoading(true);
        try {
            const res = await deleteStoreItem(selectedItem.id);
            if (res.success) {
                setDeleteModalOpen(false);
                setSelectedItem(null);
                if (items.length === 1 && page > 1) {
                    setPage(prev => Math.max(1, prev - 1));
                } else {
                    fetchItems();
                }
            } else {
                alert(res.message || "Failed to delete item");
            }
        } catch (error) {
            console.error("Error deleting store item:", error);
            alert(error.response?.data?.message || "Cannot delete item with existing transaction history.");
        } finally {
            setDeleteLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        if (status === 'In Stock') {
            return <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5 w-max"><CheckCircle2 size={12} />In Stock</span>;
        }
        if (status === 'Low Stock') {
            return <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1.5 w-max"><AlertTriangle size={12} />Low Stock</span>;
        }
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1.5 w-max">Out of Stock</span>;
    };

    return (
        <div className="max-w-7xl mx-auto space-y-5 animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl shadow-xs border border-gray-200">
                <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/30">
                        <Store size={18} />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-gray-900 tracking-tight">Store & Inventory Management</h1>
                        <p className="text-xs text-gray-500">Raw materials inventory and finished goods catalog</p>
                    </div>
                </div>

                {canManageStore && (
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-semibold text-xs shadow-md shadow-blue-500/25 transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
                    >
                        <Plus size={16} />
                        Add {activeTab === 'raw_materials' ? 'Raw Material' : 'Finished Good'}
                    </button>
                )}
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-gray-200 bg-white px-4 pt-3 rounded-2xl border shadow-xs gap-2">
                <button
                    onClick={() => handleTabChange('raw_materials')}
                    className={`px-4 py-2.5 font-bold text-xs rounded-t-xl transition-all cursor-pointer flex items-center gap-2 ${
                        activeTab === 'raw_materials'
                            ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600 shadow-xs'
                            : 'text-gray-500 hover:text-gray-900'
                    }`}
                >
                    <Package size={15} />
                    Raw Materials
                </button>

                <button
                    onClick={() => handleTabChange('finished_goods')}
                    className={`px-4 py-2.5 font-bold text-xs rounded-t-xl transition-all cursor-pointer flex items-center gap-2 ${
                        activeTab === 'finished_goods'
                            ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600 shadow-xs'
                            : 'text-gray-500 hover:text-gray-900'
                    }`}
                >
                    <Box size={15} />
                    Finished Goods
                </button>
            </div>

            {/* Search and Filter */}
            <div className="bg-white p-3.5 rounded-2xl border border-gray-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="w-full sm:w-80">
                    <TableSearch
                        value={search}
                        onChange={handleSearchChange}
                        placeholder="Search by item name, code, category..."
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
                        <option value="In Stock">In Stock</option>
                        <option value="Low Stock">Low Stock</option>
                        <option value="Out of Stock">Out of Stock</option>
                    </select>
                </div>
            </div>

            {/* TAB CONTENT: RAW MATERIALS & FINISHED GOODS */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                        <thead>
                            <tr className="bg-slate-900 text-white font-semibold text-[11px] uppercase tracking-wider">
                                <th className="py-3.5 px-4">Code</th>
                                <th className="py-3.5 px-4">Item Name</th>
                                <th className="py-3.5 px-4">Category</th>
                                {activeTab === 'finished_goods' && <th className="py-3.5 px-4">Project</th>}
                                <th className="py-3.5 px-4 text-right">Current Stock</th>
                                <th className="py-3.5 px-4 text-right">Min Alert Threshold</th>
                                <th className="py-3.5 px-4 text-right">Valuation (₹)</th>
                                <th className="py-3.5 px-4 text-center">Status</th>
                                <th className="py-3.5 px-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={activeTab === 'finished_goods' ? 9 : 8} className="text-center py-12 text-gray-400 font-medium">
                                        Loading inventory items...
                                    </td>
                                </tr>
                            ) : items.length === 0 ? (
                                <tr>
                                    <td colSpan={activeTab === 'finished_goods' ? 9 : 8} className="text-center py-12 text-gray-400 font-medium">
                                        {search ? `No items found matching "${search}".` : `No ${activeTab === 'raw_materials' ? 'raw materials' : 'finished goods'} found.`}
                                    </td>
                                </tr>
                            ) : (
                                items.map(item => (
                                    <tr key={item.id} className="hover:bg-blue-50/30 transition-colors">
                                        <td className="py-3.5 px-4 font-mono font-bold text-gray-600">{item.item_code || `ITM-${item.id}`}</td>
                                        <td className="py-3.5 px-4 font-bold text-gray-900">{item.item_name}</td>
                                        <td className="py-3.5 px-4 text-gray-600">{item.category || 'General'}</td>
                                        {activeTab === 'finished_goods' && (
                                            <td className="py-3.5 px-4 font-medium text-blue-600">
                                                {item.project_name ? (
                                                    <span>
                                                        {item.project_name}
                                                        {item.project_code && item.project_code !== item.project_name && item.project_code !== '()' ? (
                                                            <span className="text-gray-400 font-normal text-[11px] ml-1">({item.project_code})</span>
                                                        ) : null}
                                                    </span>
                                                ) : 'General FG'}
                                            </td>
                                        )}
                                        <td className="py-3.5 px-4 text-right font-bold text-base text-gray-900">
                                            {Number(item.quantity).toLocaleString()} <span className="text-xs font-normal text-gray-500">{item.unit}</span>
                                        </td>
                                        <td className="py-3.5 px-4 text-right text-gray-500">
                                            {Number(item.min_threshold).toLocaleString()} {item.unit}
                                        </td>
                                        <td className="py-3.5 px-4 text-right text-gray-700 font-medium">
                                            ₹{Number(item.price || 0).toLocaleString()}
                                        </td>
                                        <td className="py-3.5 px-4 text-center">
                                            <div className="flex justify-center">{getStatusBadge(item.status)}</div>
                                        </td>
                                        <td className="py-3.5 px-4 text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                {canManageStore && (
                                                    <button
                                                        onClick={() => setAdjustingItem(item)}
                                                        className="px-2.5 py-1 text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1"
                                                    >
                                                        <Sliders size={13} />
                                                        Adjust Stock
                                                    </button>
                                                )}
                                                {isAdmin && (
                                                    <button
                                                        onClick={() => handleDeleteClick(item)}
                                                        title="Delete Item"
                                                        className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
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
            <AddStoreItemModal
                isOpen={isAddModalOpen}
                itemType={activeTab === 'finished_goods' ? 'finished_good' : 'raw_material'}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={fetchItems}
            />

            <AdjustStockModal
                isOpen={!!adjustingItem}
                item={adjustingItem}
                onClose={() => setAdjustingItem(null)}
                onSuccess={fetchItems}
            />

            <DeleteConfirmation
                isOpen={deleteModalOpen}
                onClose={() => {
                    setDeleteModalOpen(false);
                    setSelectedItem(null);
                }}
                onConfirm={handleConfirmDelete}
                title="Delete Store Item"
                itemName={selectedItem?.item_name}
                message="Are you sure you want to delete this store item? This action cannot be undone."
                loading={deleteLoading}
            />
        </div>
    );
};