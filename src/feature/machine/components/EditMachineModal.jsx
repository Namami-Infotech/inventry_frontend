import React, { useState, useEffect } from 'react';
import { Cpu, X, AlertCircle } from 'lucide-react';
import { updateMachine } from '../services/machineService.js';

export const EditMachineModal = ({ isOpen, machine, onClose, onSuccess }) => {
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        machine_code: '',
        machine_name: '',
        machine_type: 'Injection Molding',
        capacity: '',
        location: '',
        description: '',
        status: 'Available'
    });

    useEffect(() => {
        if (isOpen && machine) {
            setError('');
            setFormData({
                machine_code: machine.machine_code || '',
                machine_name: machine.machine_name || '',
                machine_type: machine.machine_type || 'Injection Molding',
                capacity: machine.capacity || '',
                location: machine.location || '',
                description: machine.description || '',
                status: machine.status || 'Available'
            });
        }
    }, [isOpen, machine]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.machine_name.trim()) {
            setError('Machine Name is required.');
            return;
        }

        setSubmitting(true);
        try {
            const res = await updateMachine(machine.id, formData);
            if (res.success) {
                onSuccess?.();
                onClose();
            } else {
                setError(res.message || 'Failed to update machine.');
            }
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Server error updating machine.');
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen || !machine) return null;

    const inputClass = "w-full border border-gray-300 rounded-xl p-2.5 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs";
    const selectClass = "w-full border border-gray-300 rounded-xl p-2.5 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs";

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex justify-center items-center p-4 z-50 animate-in fade-in">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-gray-200 animate-in zoom-in-95">
                <div className="flex justify-between items-center px-5 py-4 bg-gray-900 text-white shrink-0">
                    <h2 className="text-sm font-bold flex items-center gap-2">
                        <Cpu size={16} className="text-cyan-400" />
                        Edit Machine ({machine.machine_code})
                    </h2>
                    <button type="button" onClick={onClose} className="p-1 rounded-lg hover:bg-gray-800 transition cursor-pointer">
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
                    {error && (
                        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-2">
                            <AlertCircle size={15} className="shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div>
                            <label className="block font-medium text-gray-700 mb-1">Machine Code</label>
                            <input
                                type="text"
                                name="machine_code"
                                value={formData.machine_code}
                                readOnly
                                disabled
                                className={`${inputClass} bg-gray-100 text-gray-600 font-semibold cursor-not-allowed`}
                            />
                        </div>

                        <div>
                            <label className="block font-medium text-gray-700 mb-1">Machine Name *</label>
                            <input
                                type="text"
                                name="machine_name"
                                value={formData.machine_name}
                                onChange={handleChange}
                                required
                                className={inputClass}
                            />
                        </div>

                        <div>
                            <label className="block font-medium text-gray-700 mb-1">Machine Type *</label>
                            <select
                                name="machine_type"
                                value={formData.machine_type}
                                onChange={handleChange}
                                className={selectClass}
                            >
                                <option value="Injection Molding">Injection Molding</option>
                                <option value="CNC Milling">CNC Milling</option>
                                <option value="CNC Lathe">CNC Lathe</option>
                                <option value="Hydraulic Press">Hydraulic Press</option>
                                <option value="Extrusion">Extrusion</option>
                                <option value="Assembly Station">Assembly Station</option>
                                <option value="Laser Cutting">Laser Cutting</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        <div>
                            <label className="block font-medium text-gray-700 mb-1">Production Capacity</label>
                            <input
                                type="text"
                                name="capacity"
                                value={formData.capacity}
                                onChange={handleChange}
                                className={inputClass}
                            />
                        </div>

                        <div>
                            <label className="block font-medium text-gray-700 mb-1">Shop Floor Location</label>
                            <input
                                type="text"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                className={inputClass}
                            />
                        </div>

                        <div>
                            <label className="block font-medium text-gray-700 mb-1">Status</label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className={selectClass}
                            >
                                <option value="Available">Available</option>
                                <option value="Running">Running</option>
                                <option value="Maintenance">Maintenance</option>
                                <option value="Inactive">Inactive</option>
                            </select>
                        </div>

                        <div className="sm:col-span-2">
                            <label className="block font-medium text-gray-700 mb-1">Machine Description</label>
                            <textarea
                                name="description"
                                rows={2}
                                value={formData.description}
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
                            className="px-5 py-2 bg-cyan-600 text-white rounded-xl font-semibold hover:bg-cyan-700 disabled:opacity-50 transition cursor-pointer shadow-md shadow-cyan-600/20"
                        >
                            {submitting ? 'Saving...' : 'Update Machine'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
