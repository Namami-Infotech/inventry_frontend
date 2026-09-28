import React, { useState, useEffect } from 'react';
import { Package, X, AlertCircle } from 'lucide-react';
import { updateProduct } from '../services/productService.js';

export const EditProjectModal = ({ isOpen, project, onClose, onSuccess }) => {
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        product_name: '',
        price: '',
        description: ''
    });

    useEffect(() => {
        if (isOpen && project) {
            setError('');
            const currentPrice = project.price ?? project.sale_price ?? project.selling_price ?? '';
            setFormData({
                product_name: project.product_name || '',
                price: currentPrice !== null && currentPrice !== undefined ? String(currentPrice) : '',
                description: project.description || ''
            });
        }
    }, [isOpen, project]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.product_name.trim()) {
            setError('Product Name is required.');
            return;
        }

        setSubmitting(true);
        try {
            const res = await updateProduct(project.id, {
                product_name: formData.product_name.trim(),
                price: formData.price !== '' ? Number(formData.price) : 0,
                sale_price: formData.price !== '' ? Number(formData.price) : 0,
                selling_price: formData.price !== '' ? Number(formData.price) : 0,
                description: formData.description.trim() || null
            });
            if (res.success) {
                onSuccess?.();
                onClose();
            } else {
                setError(res.message || 'Failed to update product.');
            }
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Server error updating product.');
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen || !project) return null;

    const inputClass = "w-full border border-gray-300 rounded-xl p-2.5 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs";

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex justify-center items-center p-4 z-50 animate-in fade-in">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden border border-gray-200 animate-in zoom-in-95 max-h-[90vh] flex flex-col">

                {/* Header */}
                <div className="flex justify-between items-center px-5 py-4 bg-gray-900 text-white shrink-0">
                    <h2 className="text-sm font-bold flex items-center gap-2">
                        <Package size={16} className="text-blue-400" />
                        Edit Product (ID: {project.id})
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1 rounded-lg hover:bg-gray-800 transition cursor-pointer"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} autoComplete="off" className="p-5 space-y-4 text-xs overflow-y-auto custom-scrollbar flex-1">
                    {error && (
                        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-2">
                            <AlertCircle size={15} className="shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="grid grid-cols-1 gap-4">

                        {/* Product Name */}
                        <div>
                            <label className="block font-medium text-gray-700 mb-1">
                                Product Name *
                            </label>
                            <input
                                type="text"
                                name="product_name"
                                value={formData.product_name}
                                onChange={handleChange}
                                required
                                className={inputClass}
                            />
                        </div>

                        {/* Price */}
                        <div>
                            <label className="block font-medium text-gray-700 mb-1">
                                Price (₹)
                            </label>
                            <input
                                type="number"
                                name="price"
                                min="0"
                                step="0.01"
                                value={formData.price}
                                onChange={handleChange}
                                placeholder="0.00"
                                className={inputClass}
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block font-medium text-gray-700 mb-1">
                                Description
                            </label>
                            <textarea
                                name="description"
                                rows={3}
                                placeholder="Enter product description or specifications..."
                                value={formData.description}
                                onChange={handleChange}
                                className={inputClass}
                            />
                        </div>

                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-100 transition cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-5 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 transition cursor-pointer shadow-md shadow-blue-500/20"
                        >
                            {submitting ? 'Saving...' : 'Update Product'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

