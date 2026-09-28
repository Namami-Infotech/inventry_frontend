import React, { useState, useEffect } from 'react';
import { Package, X, AlertCircle } from 'lucide-react';
import { createStoreItem } from '../services/storeItemService.jsx';
import { getProjects } from '../../project/services/projectService.js';

const UOM_OPTIONS = [
    'KG',
    'Gram',
    'Nos',
    'Meter',
    'Litre',
    'Piece',
    'Box',
    'Pkt',
    'Roll',
    'Set',
    'Sq.Ft',
    'Cu.Mtr'
];

export const AddStoreItemModal = ({ isOpen, itemType = 'raw_material', onClose, onSuccess }) => {
    const [projects, setProjects] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const isRawMaterial = itemType === 'raw_material';

    const [formData, setFormData] = useState({
        item_code: '',
        item_name: '',
        category: isRawMaterial ? 'Raw Material' : 'Finished Good',
        item_type: itemType,
        project_id: '',
        unit: isRawMaterial ? 'KG' : 'Nos',
        quantity: 0,
        min_threshold: 10,
        price: 0
    });

    useEffect(() => {
        if (isOpen) {
            setError('');
            setFormData({
                item_code: '',
                item_name: '',
                category: isRawMaterial ? 'Raw Material' : 'Finished Good',
                item_type: itemType,
                project_id: '',
                unit: isRawMaterial ? 'KG' : 'Nos',
                quantity: 0,
                min_threshold: 10,
                price: 0
            });
            if (!isRawMaterial) {
                fetchProjects();
            }
        }
    }, [isOpen, itemType]);

    const fetchProjects = async () => {
        try {
            const res = await getProjects();
            if (res.success) {
                setProjects(res.data || []);
            }
        } catch (e) {
            console.error("Failed to load projects", e);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.item_name.trim()) {
            setError('Item Name is required.');
            return;
        }

        setSubmitting(true);
        try {
            const res = await createStoreItem(formData);
            if (res.success) {
                onSuccess?.();
                onClose();
            } else {
                setError(res.message || 'Failed to add item.');
            }
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Server error creating store item.');
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    const inputClass = "w-full border border-gray-300 rounded-xl p-2.5 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs";
    const selectClass = "w-full border border-gray-300 rounded-xl p-2.5 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs";

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex justify-center items-center p-4 z-50 animate-in fade-in">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-gray-200 animate-in zoom-in-95">
                <div className="flex justify-between items-center px-5 py-4 bg-gray-900 text-white shrink-0">
                    <h2 className="text-sm font-bold flex items-center gap-2">
                        <Package size={16} className="text-blue-400" />
                        Add {isRawMaterial ? 'Raw Material' : 'Finished Good'}
                    </h2>
                    <button type="button" onClick={onClose} className="p-1 rounded-lg hover:bg-gray-800 transition cursor-pointer">
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} autoComplete="off" className="p-5 space-y-4 text-xs">
                    {error && (
                        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-2">
                            <AlertCircle size={15} className="shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div>
                            <label className="block font-medium text-gray-700 mb-1">Item Code</label>
                            <input
                                type="text"
                                name="item_code"
                                placeholder={isRawMaterial ? "e.g. RM-001" : "e.g. FG-PRJ01"}
                                value={formData.item_code}
                                onChange={handleChange}
                                className={inputClass}
                            />
                        </div>

                        <div>
                            <label className="block font-medium text-gray-700 mb-1">Item Name *</label>
                            <input
                                type="text"
                                name="item_name"
                                placeholder={isRawMaterial ? "e.g. PP Granules Grade A" : "e.g. Bumper Shell Assembly"}
                                value={formData.item_name}
                                onChange={handleChange}
                                required
                                className={inputClass}
                            />
                        </div>


                        <div>
                            <label className="block font-medium text-gray-700 mb-1">Unit of Measurement (UOM)</label>
                            <select
                                name="unit"
                                value={formData.unit}
                                onChange={handleChange}
                                className={selectClass}
                            >
                                <option value="">-- Select UOM --</option>
                                {UOM_OPTIONS.map((uom) => (
                                    <option key={uom} value={uom}>
                                        {uom}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {!isRawMaterial && (
                            <div className="sm:col-span-2">
                                <label className="block font-medium text-gray-700 mb-1">Associated Project</label>
                                <select
                                    name="project_id"
                                    value={formData.project_id}
                                    onChange={handleChange}
                                    className={selectClass}
                                >
                                    <option value="">-- No Project (General Finished Good) --</option>
                                    {projects.map(p => (
                                        <option key={p.id} value={p.id}>
                                            {p.project_name} ({p.project_code || `PRJ-${p.id}`})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div>
                            <label className="block font-medium text-gray-700 mb-1">Initial Stock Intake</label>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                name="quantity"
                                value={formData.quantity}
                                onChange={handleChange}
                                className={inputClass}
                            />
                        </div>

                        <div>
                            <label className="block font-medium text-gray-700 mb-1">Minimum Alert Threshold</label>
                            <input
                                type="number"
                                min="0"
                                name="min_threshold"
                                value={formData.min_threshold}
                                onChange={handleChange}
                                className={inputClass}
                            />
                        </div>

                        <div>
                            <label className="block font-medium text-gray-700 mb-1">Unit Price / Valuation (₹)</label>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                className={inputClass}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-3 border-t border-gray-200">
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
                            {submitting ? 'Saving...' : 'Create Item'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
