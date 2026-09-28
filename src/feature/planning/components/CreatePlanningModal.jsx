import React, { useState, useEffect } from 'react';
import { ClipboardList, Plus, Trash2, X, AlertCircle, Sparkles } from 'lucide-react';
import { createPlanning, getNextPlanningCode } from '../services/planningService.js';
import { getRawMaterials } from '../../storeItems/services/storeItemService.jsx';
import { getProducts } from '@/feature/project/services/productService.js';

export const CreatePlanningModal = ({ isOpen, onClose, onSuccess }) => {
    const [projects, setProjects] = useState([]);
    const [rawMaterialsList, setRawMaterialsList] = useState([]);

    const [loadingCode, setLoadingCode] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        planning_code: '',
        project_id: '',
        planned_quantity: '',
        rm_dispatch_date: '',
        remarks: '',
        materials: [
            { raw_material_id: '', raw_material_name: '', required_quantity: '', unit: 'KG' }
        ]
    });

    useEffect(() => {
        if (isOpen) {
            setError('');
            fetchInitialData();
        }
    }, [isOpen]);

    const fetchInitialData = async () => {
        setLoadingCode(true);
        try {
            const [codeRes, projRes, rmRes] = await Promise.all([
                getNextPlanningCode(),
                getProducts({ status: 'Active', all: true }),
                getRawMaterials({ all: true })
            ]);

            if (codeRes.success) {
                setFormData(prev => ({
                    ...prev,
                    planning_code: codeRes.planning_code
                }));
            }

            setProjects(projRes.data || []);
            const onlyRawMaterials = (rmRes.data || []).filter(rm =>
                (rm.item_type || 'raw_material').toLowerCase() === 'raw_material' &&
                (rm.category || '').toLowerCase() !== 'finished good'
            );
            setRawMaterialsList(onlyRawMaterials);
        } catch (e) {
            console.error("Failed to load planning dependencies", e);
        } finally {
            setLoadingCode(false);
        }
    };

    const handleFieldChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleMaterialChange = (index, field, value) => {
        const updated = [...formData.materials];
        updated[index][field] = value;

        if (field === 'raw_material_id') {
            const selected = rawMaterialsList.find(rm => Number(rm.id) === Number(value));
            if (selected) {
                updated[index].raw_material_name = selected.item_name;
                updated[index].unit = selected.unit || 'KG';
            }
        }

        setFormData(prev => ({ ...prev, materials: updated }));
    };

    const addMaterialRow = () => {
        setFormData(prev => ({
            ...prev,
            materials: [
                ...prev.materials,
                { raw_material_id: '', raw_material_name: '', required_quantity: '', unit: 'KG' }
            ]
        }));
    };

    const removeMaterialRow = (index) => {
        if (formData.materials.length <= 1) return;
        setFormData(prev => ({
            ...prev,
            materials: prev.materials.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.project_id) {
            setError('Please select a Target Project / Product.');
            return;
        }
        if (!formData.planned_quantity || Number(formData.planned_quantity) <= 0) {
            setError('Planned Production Qty must be greater than 0.');
            return;
        }

        const validMaterials = formData.materials.filter(m => (m.raw_material_id || m.raw_material_name.trim()) && Number(m.required_quantity) > 0);
        if (validMaterials.length === 0) {
            setError('Please specify at least one valid Raw Material requirement with quantity greater than 0.');
            return;
        }

        setSubmitting(true);
        try {
            const res = await createPlanning({
                ...formData,
                materials: validMaterials
            });

            if (res.success) {
                onSuccess?.();
                onClose();
            } else {
                setError(res.message || 'Failed to submit planning.');
            }
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Server error creating planning.');
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    const inputClass = "w-full border border-gray-300 rounded-xl p-2.5 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 text-xs";
    const selectClass = "w-full border border-gray-300 rounded-xl p-2.5 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 text-xs";

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex justify-center items-center p-4 z-50 animate-in fade-in">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden border border-gray-200 animate-in zoom-in-95 max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center px-5 py-4 bg-gray-900 text-white shrink-0">
                    <h2 className="text-sm font-bold flex items-center gap-2">
                        <ClipboardList size={16} className="text-purple-400" />
                        Create Production Planning
                    </h2>
                    <button type="button" onClick={onClose} className="p-1 rounded-lg hover:bg-gray-800 transition cursor-pointer">
                        <X size={18} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-5 overflow-y-auto custom-scrollbar flex-1 space-y-4 text-xs">
                    {error && (
                        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-2">
                            <AlertCircle size={15} className="shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        {/* Planning Code */}
                        <div>
                            <label className="block font-medium text-gray-700 mb-1">Planning Id</label>
                            <input
                                type="text"
                                name="planning_code"
                                value={formData.planning_code}
                                readOnly
                                disabled
                                className={`${inputClass} bg-gray-100 text-gray-600 font-semibold cursor-not-allowed`}
                            />
                        </div>

                        {/* Target Project */}
                        <div>
                            <label className="block font-medium text-gray-700 mb-1">Target Product*</label>
                            <select
                                name="project_id"
                                value={formData.project_id}
                                onChange={handleFieldChange}
                                required
                                className={selectClass}
                            >
                                <option value="">-- Select Project / Product --</option>
                                {projects.map(p => (
                                    <option key={p.id} value={p.id}>
                                        {p.product_name || p.project_name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Planned Production Qty */}
                        <div>
                            <label className="block font-medium text-gray-700 mb-1">Planned Production Qty *</label>
                            <input
                                type="number"
                                name="planned_quantity"
                                placeholder="e.g. 1000"
                                min="1"
                                value={formData.planned_quantity}
                                onChange={handleFieldChange}
                                required
                                className={inputClass}
                            />
                        </div>

                        {/* RM Dispatch Date */}
                        <div>
                            <label className="block font-medium text-gray-700 mb-1">RM Dispatch Date</label>
                            <input
                                type="date"
                                name="rm_dispatch_date"
                                value={formData.rm_dispatch_date}
                                onChange={handleFieldChange}
                                className={inputClass}
                            />
                        </div>
                    </div>

                    {/* Raw Material Requirements (Child Table) */}
                    <div className="space-y-2.5 pt-2 border-t border-gray-100">
                        <div className="flex items-center justify-between">
                            <label className="block font-bold text-gray-900 text-xs">
                                Required Raw Materials Requirement *
                            </label>
                            <button
                                type="button"
                                onClick={addMaterialRow}
                                className="flex items-center gap-1 text-purple-600 font-bold hover:text-purple-700 cursor-pointer text-xs"
                            >
                                <Plus size={14} /> Add Raw Material
                            </button>
                        </div>

                        <div className="space-y-2">
                            {formData.materials.map((mat, idx) => (
                                <div key={idx} className="flex flex-col sm:flex-row items-center gap-2 p-2.5 bg-gray-50 rounded-xl border border-gray-200">
                                    <div className="flex-1 w-full sm:w-auto">
                                        <select
                                            value={mat.raw_material_id}
                                            onChange={(e) => handleMaterialChange(idx, 'raw_material_id', e.target.value)}
                                            required
                                            className={selectClass}
                                        >
                                            <option value="">-- Select Raw Material --</option>
                                            {rawMaterialsList
                                                .filter(rm => (rm.item_type || 'raw_material').toLowerCase() === 'raw_material' && (rm.category || '').toLowerCase() !== 'finished good')
                                                .map(rm => (
                                                    <option key={rm.id} value={rm.id}>
                                                        {rm.item_name} (In Store: {rm.quantity} {rm.unit})
                                                    </option>
                                                ))}
                                        </select>
                                    </div>

                                    <div className="w-full sm:w-36 flex items-center gap-1">
                                        <input
                                            type="number"
                                            min="0.01"
                                            step="0.01"
                                            placeholder="Req Qty"
                                            value={mat.required_quantity}
                                            onChange={(e) => handleMaterialChange(idx, 'required_quantity', e.target.value)}
                                            required
                                            className={inputClass}
                                        />
                                        <span className="text-gray-500 font-bold px-1">{mat.unit || 'KG'}</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeMaterialRow(idx)}
                                        disabled={formData.materials.length <= 1}
                                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg disabled:opacity-30 cursor-pointer"
                                    >
                                        <Trash2 size={15} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Planning Remarks */}
                    <div>
                        <label className="block font-medium text-gray-700 mb-1">Planning Remarks</label>
                        <input
                            type="text"
                            name="remarks"
                            placeholder="e.g. Priority run for line assembly"
                            value={formData.remarks}
                            onChange={handleFieldChange}
                            className={inputClass}
                        />
                    </div>

                    {/* Auto Material Request Notice */}
                    {/* <div className="bg-purple-50/70 p-3 rounded-xl border border-purple-200 text-purple-800 text-[11px] flex items-center gap-2">
                        <Sparkles size={16} className="text-purple-600 shrink-0" />
                        <span>
                            Submitting this Planning will <strong>automatically generate a Material Request</strong> for the Store Manager. Stock is NOT reduced until Store Manager dispatches the material.
                        </span>
                    </div> */}

                    {/* Footer */}
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
                            disabled={submitting || loadingCode}
                            className="px-5 py-2 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 disabled:opacity-50 transition cursor-pointer shadow-md shadow-purple-600/20"
                        >
                            {submitting ? 'Submitting Planning...' : 'Submit planning'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

