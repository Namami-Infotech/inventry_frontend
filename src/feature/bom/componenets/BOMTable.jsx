import React, { useState } from "react";
import { Eye, Edit3, Trash2, PlusCircle, CheckCircle2, AlertCircle } from "lucide-react";
import { Pagination } from "../../../components/common/pagination";

const BOMTable = ({
    products = [],
    loading,
    onEdit,
    onDelete,
    onView
}) => {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    if (loading) {
        return (
            <div className="border border-slate-200 rounded-2xl p-8 text-center text-slate-500 text-xs bg-white shadow-xs">
                Loading products and BOMs...
            </div>
        );
    }

    if (!products.length) {
        return (
            <div className="border border-slate-200 rounded-2xl p-8 text-center bg-white shadow-xs">
                <p className="text-gray-500 text-xs font-medium">
                    No products found.
                </p>
            </div>
        );
    }

    const totalItems = products.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
    const paginatedProducts = products.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
                <table className="w-full border-collapse min-w-[650px]">
                    <thead className="bg-slate-50 text-[11px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200">
                        <tr>
                            <th className="py-2.5 px-4 text-left">Product Name</th>
                            <th className="py-2.5 px-4 text-center">BOM Status</th>
                            <th className="py-2.5 px-4 text-right">Raw Materials Cost (₹)</th>
                            <th className="py-2.5 px-4 text-right">Manufactured Cost (₹)</th>
                            <th className="py-2.5 px-4 text-left">Description</th>
                            <th className="py-2.5 px-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                        {paginatedProducts.map((row) => {
                            const hasBOM = Boolean(row.hasBOM && row.bom);
                            const itemCount = Array.isArray(row.bom?.items) ? row.bom.items.length : 0;
                            const rawMaterialsTotal = Array.isArray(row.bom?.items)
                                ? row.bom.items.reduce((acc, it) => {
                                    const uPrice = parseFloat(it.unit_cost || it.unit_price || it.price) || 0;
                                    const q = parseFloat(it.quantity || it.qty) || 0;
                                    return acc + (uPrice * q);
                                }, 0)
                                : 0;
                            const mfgCost = parseFloat(row.bom?.manufactured_price) || (rawMaterialsTotal > 0 ? rawMaterialsTotal : 0);

                            return (
                                <tr
                                    key={row.id}
                                    className="hover:bg-blue-50/30 text-xs transition-colors"
                                >
                                    <td className="py-2.5 px-4 font-bold text-slate-900">
                                        {row.product_name}
                                    </td>
                                    <td className="py-2.5 px-4 text-center">
                                        {hasBOM ? (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                <CheckCircle2 size={11} /> Configured ({itemCount} item{itemCount === 1 ? '' : 's'})
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                                <AlertCircle size={11} /> No BOM
                                            </span>
                                        )}
                                    </td>
                                    <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-800">
                                        {hasBOM && rawMaterialsTotal > 0 ? `₹${rawMaterialsTotal.toFixed(2)}` : <span className="text-slate-400 font-normal">—</span>}
                                    </td>
                                    <td className="py-2.5 px-4 text-right font-mono font-bold text-blue-700">
                                        {hasBOM && mfgCost > 0 ? `₹${mfgCost.toFixed(2)}` : <span className="text-slate-400 font-normal">—</span>}
                                    </td>
                                    <td className="py-2.5 px-4 text-slate-600 text-[11px] font-normal max-w-xs truncate">
                                        {row.description || "—"}
                                    </td>
                                    <td className="py-2.5 px-4 text-right">
                                        <div className="flex justify-end items-center gap-1">
                                            {/* VIEW BUTTON */}
                                            {hasBOM && (
                                                <button
                                                    onClick={() => onView(row.bom)}
                                                    className="p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                                                    title="View BOM Details"
                                                    type="button"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                            )}

                                            {/* EDIT / CREATE BUTTON */}
                                            <button
                                                onClick={() => onEdit(row.bom, row.id)}
                                                className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition cursor-pointer"
                                                title={hasBOM ? "Edit BOM" : "Create BOM for this product"}
                                                type="button"
                                            >
                                                {hasBOM ? <Edit3 size={15} /> : <PlusCircle size={15} className="text-blue-600" />}
                                            </button>

                                            {/* DELETE BUTTON */}
                                            {hasBOM && (
                                                <button
                                                    onClick={() => onDelete(row.bom.id)}
                                                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                                                    title="Delete BOM"
                                                    type="button"
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
            />
        </div>
    );
};

export default BOMTable;