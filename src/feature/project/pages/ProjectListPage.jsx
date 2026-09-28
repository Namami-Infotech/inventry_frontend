import React, { useState, useEffect, useCallback } from 'react';
import {
    Package,
    Boxes,
    Plus,
    Search,
    Edit2,
    Trash2,
    IndianRupee,
    FileText
} from 'lucide-react';
import { getProducts, deleteProduct } from '../services/productService.js';
import { AddProjectModal } from '../components/AddProjectModal.jsx';
import { EditProjectModal } from '../components/EditProjectModal.jsx';
import Pagination from '../../../components/common/pagination';
import TableSearch from '../../../components/common/TableSearch';
import DeleteConfirmation from '../../../components/common/DeleteConfirmation';

export const ProjectListPage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Pagination state
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        pageSize: 10,
        totalItems: 0,
        totalPages: 1
    });

    const [isAddOpen, setIsAddOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    // Delete confirmation modal state
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const rawRole = (currentUser.role || '').toLowerCase();
    const canManage = rawRole.includes('admin') || rawRole.includes('sales') || rawRole.includes('manager');

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const params = {
                page,
                limit,
                search: searchTerm ? searchTerm.trim() : undefined
            };
            const res = await getProducts(params);
            if (res.success) {
                const list = res.data || [];
                setProducts(list);
                if (res.pagination) {
                    setPagination(res.pagination);
                } else {
                    setPagination({
                        currentPage: page,
                        pageSize: limit,
                        totalItems: list.length,
                        totalPages: Math.ceil(list.length / limit) || 1
                    });
                }
            }
        } catch (e) {
            console.error("Failed to load products", e);
        } finally {
            setLoading(false);
        }
    }, [page, limit, searchTerm]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const handleSearchChange = (val) => {
        setSearchTerm(val);
        setPage(1);
    };

    const handlePageSizeChange = (newLimit) => {
        setLimit(newLimit);
        setPage(1);
    };

    const handleOpenDelete = (product) => {
        setProductToDelete(product);
        setDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!productToDelete) return;
        try {
            setDeleteLoading(true);
            const res = await deleteProduct(productToDelete.id);
            if (res.success) {
                setDeleteModalOpen(false);
                setProductToDelete(null);

                // Edge case: if last record on page > 1, shift back
                if (page > 1 && products.length <= 1) {
                    setPage((prev) => Math.max(1, prev - 1));
                } else {
                    fetchProducts();
                }
            } else {
                alert(res.message || 'Failed to delete product.');
            }
        } catch (err) {
            alert(err.response?.data?.message || err.message || 'Error deleting product.');
        } finally {
            setDeleteLoading(false);
        }
    };

    const totalProducts = pagination.totalItems || products.length;
    const pricedCount = products.filter(p => Number(p.price || p.sale_price || 0) > 0).length;
    const withDescCount = products.filter(p => p.description && p.description.trim()).length;
    const avgPrice = products.length > 0
        ? (products.reduce((acc, p) => acc + Number(p.price || p.sale_price || 0), 0) / products.length)
        : 0;

    return (
        <div className="max-w-7xl mx-auto space-y-5 animate-in fade-in duration-300">
            {/* Top Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl shadow-xs border border-gray-200">
                <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/30">
                            <Boxes size={18} />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-gray-900 tracking-tight">Product Management</h1>
                            <p className="text-xs text-gray-500">Manage products with name, price, and description</p>
                        </div>
                    </div>
                </div>

                {canManage && (
                    <button
                        onClick={() => setIsAddOpen(true)}
                        className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-semibold text-xs shadow-md shadow-blue-500/25 transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
                    >
                        <Plus size={16} />
                        New Product
                    </button>
                )}
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
                <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                        <Boxes size={20} />
                    </div>
                    <div>
                        <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">Total Products</p>
                        <p className="text-lg font-bold text-gray-900">{totalProducts}</p>
                        <p className="text-[10px] text-gray-400 font-medium">In catalog</p>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                        <IndianRupee size={20} />
                    </div>
                    <div>
                        <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">Priced Products</p>
                        <p className="text-lg font-bold text-emerald-600">{pricedCount}</p>
                        <p className="text-[10px] text-emerald-600 font-medium">With defined price</p>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                        <FileText size={20} />
                    </div>
                    <div>
                        <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">Descriptions</p>
                        <p className="text-lg font-bold text-blue-600">{withDescCount}</p>
                        <p className="text-[10px] text-blue-600 font-medium">With specifications</p>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                        <Package size={20} />
                    </div>
                    <div>
                        <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">Avg Price</p>
                        <p className="text-lg font-bold text-amber-600">₹{avgPrice.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
                        <p className="text-[10px] text-gray-400 font-medium">Average across items</p>
                    </div>
                </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="bg-white p-3.5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between gap-3">
                <TableSearch
                    value={searchTerm}
                    onChange={handleSearchChange}
                    placeholder="Search by product name or description..."
                    className="w-full sm:w-96"
                />
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                        <thead>
                            <tr className="bg-slate-900 text-white font-semibold text-[11px] uppercase tracking-wider">
                                <th className="py-3.5 px-4 w-12 text-center">#</th>
                                <th className="py-3.5 px-4">Product Name</th>
                                <th className="py-3.5 px-4 text-right w-36">Price</th>
                                <th className="py-3.5 px-4">Description</th>
                                <th className="py-3.5 px-4 text-right w-24">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-12 text-gray-400 font-medium">
                                        Loading products...
                                    </td>
                                </tr>
                            ) : products.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-12 text-gray-400 font-medium">
                                        {searchTerm ? `No matching products found for "${searchTerm}".` : 'No products found. Click "New Product" to add one.'}
                                    </td>
                                </tr>
                            ) : (
                                products.map((p, idx) => {
                                    const priceNum = Number(p.price ?? p.sale_price ?? 0);
                                    const serialNum = (pagination.currentPage - 1) * pagination.pageSize + idx + 1;

                                    return (
                                        <tr
                                            key={p.id}
                                            className="hover:bg-blue-50/40 transition-colors group"
                                        >
                                            <td className="py-3.5 px-4 text-gray-400 font-mono text-center">{serialNum}</td>

                                            <td className="py-3.5 px-4">
                                                <div className="font-bold text-gray-900 flex items-center gap-2">
                                                    <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                                                        <Package size={14} />
                                                    </div>
                                                    <span>{p.product_name}</span>
                                                </div>
                                            </td>

                                            <td className="py-3.5 px-4 text-right">
                                                {priceNum > 0 ? (
                                                    <span className="font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2.5 py-1 rounded-lg text-xs font-mono inline-block">
                                                        ₹{priceNum.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400 font-mono text-xs">₹0.00</span>
                                                )}
                                            </td>

                                            <td className="py-3.5 px-4 max-w-[300px]" title={p.description || ''}>
                                                <div className="text-gray-600 truncate">
                                                    {p.description || <span className="italic text-gray-300">—</span>}
                                                </div>
                                            </td>

                                            <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                                                <div className="flex items-center justify-end gap-1">
                                                    {canManage && (
                                                        <>
                                                            <button
                                                                onClick={() => setEditingProduct(p)}
                                                                title="Edit Product"
                                                                className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                                                            >
                                                                <Edit2 size={15} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleOpenDelete(p)}
                                                                title="Delete Product"
                                                                className="p-1.5 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                                            >
                                                                <Trash2 size={15} />
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

                {/* Common Pagination */}
                <Pagination
                    currentPage={pagination.currentPage}
                    totalPages={pagination.totalPages}
                    totalItems={pagination.totalItems}
                    pageSize={pagination.pageSize}
                    onPageChange={setPage}
                    onPageSizeChange={handlePageSizeChange}
                />
            </div>

            {/* Common Delete Confirmation */}
            <DeleteConfirmation
                open={deleteModalOpen}
                title="Delete Product?"
                itemName={productToDelete?.product_name}
                onConfirm={handleConfirmDelete}
                onCancel={() => {
                    setDeleteModalOpen(false);
                    setProductToDelete(null);
                }}
                loading={deleteLoading}
            />

            {/* Modals */}
            <AddProjectModal
                isOpen={isAddOpen}
                onClose={() => setIsAddOpen(false)}
                onSuccess={fetchProducts}
            />

            <EditProjectModal
                isOpen={!!editingProduct}
                project={editingProduct}
                onClose={() => setEditingProduct(null)}
                onSuccess={fetchProducts}
            />
        </div>
    );
};
