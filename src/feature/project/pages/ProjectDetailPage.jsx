import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Briefcase,
    ArrowLeft,
    Building2,
    Calendar,
    CheckCircle2,
    Clock,
    Truck,
    PackageCheck,
    Cpu,
    ClipboardList,
    AlertCircle,
    UserCheck,
    ChevronRight,
    TrendingUp
} from 'lucide-react';
import { getProjectById } from '../services/projectService.js';

export const ProjectDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [projectData, setProjectData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('production'); // 'production' | 'plannings' | 'deliveries'

    useEffect(() => {
        if (id) {
            fetchProject();
        }
    }, [id]);

    const fetchProject = async () => {
        setLoading(true);
        try {
            const res = await getProjectById(id);
            if (res.success && res.data) {
                setProjectData(res.data);
            }
        } catch (e) {
            console.error("Failed to load project details", e);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto py-12 text-center text-gray-500 font-medium">
                Loading product details...
            </div>
        );
    }

    if (!projectData) {
        return (
            <div className="max-w-7xl mx-auto py-12 text-center space-y-3">
                <p className="text-gray-500 font-medium">Product not found.</p>
                <button
                    onClick={() => navigate('/pages/mainModule/projects')}
                    className="inline-flex items-center gap-2 text-blue-600 font-semibold text-xs hover:underline cursor-pointer"
                >
                    <ArrowLeft size={14} /> Back to Products
                </button>
            </div>
        );
    }

    const summary = projectData.summary || {};
    const prjQty = Number(projectData.project_quantity) || 0;
    const producedQty = Number(summary.total_produced_quantity) || 0;
    const deliveredQty = Number(summary.total_delivered_quantity) || 0;
    const balanceToProduce = Number(summary.balance_to_produce) || 0;
    const balanceToDeliver = Number(summary.balance_to_deliver) || 0;
    const inStockFG = Number(summary.balance_finished_goods) || 0;

    const producedPct = prjQty > 0 ? Math.min(100, Math.round((producedQty / prjQty) * 100)) : 0;
    const deliveredPct = prjQty > 0 ? Math.min(100, Math.round((deliveredQty / prjQty) * 100)) : 0;

    return (
        <div className="max-w-7xl mx-auto space-y-5 animate-in fade-in duration-300">
            {/* Top Navigation Back */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => navigate('/pages/mainModule/projects')}
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 font-semibold text-xs transition cursor-pointer"
                >
                    <ArrowLeft size={15} /> Back to Product List
                </button>

                <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold bg-slate-900 text-white px-3 py-1 rounded-lg">
                        {projectData.project_code}
                    </span>
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                        projectData.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                        projectData.status === 'Active' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                        {projectData.status}
                    </span>
                </div>
            </div>

            {/* Product Master Card */}
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-4">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-gray-100 pb-4">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <Briefcase size={22} className="text-blue-600" />
                            {projectData.project_name}
                        </h1>
                        <p className="text-xs text-gray-500 mt-1 max-w-2xl">
                            {projectData.project_description || 'No detailed product description specified.'}
                        </p>
                    </div>

                    <div className="flex items-center gap-4 bg-gray-50 p-3 rounded-xl border border-gray-200 shrink-0">
                        <div>
                            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Target Qty</p>
                            <p className="text-lg font-bold text-gray-900">{prjQty.toLocaleString()} <span className="text-xs font-normal text-gray-500">units</span></p>
                        </div>
                        <div className="h-8 w-px bg-gray-200" />
                        <div>
                            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Product Value</p>
                            <p className="text-lg font-bold text-gray-900">₹{Number(projectData.project_price || 0).toLocaleString()}</p>
                        </div>
                    </div>
                </div>

                {/* Meta details grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                    <div>
                        <p className="text-[11px] text-gray-400 font-medium flex items-center gap-1.5"><Building2 size={13} /> Client</p>
                        <p className="font-semibold text-gray-900 mt-0.5">{projectData.client_name || 'N/A'}</p>
                        <p className="text-[10px] text-gray-500">{projectData.client_phone || ''}</p>
                    </div>

                    <div>
                        <p className="text-[11px] text-gray-400 font-medium flex items-center gap-1.5"><Calendar size={13} /> Start Date</p>
                        <p className="font-semibold text-gray-900 mt-0.5">{projectData.start_date ? String(projectData.start_date).split('T')[0] : 'N/A'}</p>
                    </div>

                    <div>
                        <p className="text-[11px] text-gray-400 font-medium flex items-center gap-1.5"><Calendar size={13} /> Expected Completion</p>
                        <p className="font-semibold text-gray-900 mt-0.5">{projectData.expected_completion_date ? String(projectData.expected_completion_date).split('T')[0] : 'N/A'}</p>
                    </div>

                    <div>
                        <p className="text-[11px] text-gray-400 font-medium flex items-center gap-1.5"><UserCheck size={13} /> Created By</p>
                        <p className="font-semibold text-gray-900 mt-0.5">{projectData.created_by_name || 'Admin'}</p>
                    </div>
                </div>
            </div>

            {/* Quantity Flow Metrics Progress */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5 sm:gap-4">
                {/* Planned */}
                <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs space-y-2">
                    <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                            <ClipboardList size={15} className="text-purple-600" /> Planned Qty
                        </span>
                        <span className="font-bold text-gray-900">{Number(summary.total_planned_quantity || 0).toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                        <div
                            className="bg-purple-600 h-full rounded-full"
                            style={{ width: `${prjQty > 0 ? Math.min(100, (Number(summary.total_planned_quantity || 0) / prjQty) * 100) : 0}%` }}
                        />
                    </div>
                    <p className="text-[10px] text-gray-400">{summary.plannings_count || (projectData.plannings || []).length} Planning Sessions</p>
                </div>

                {/* Produced OK */}
                <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs space-y-2">
                    <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                            <PackageCheck size={15} className="text-emerald-600" /> Produced (OK)
                        </span>
                        <span className="font-bold text-emerald-600">{producedQty.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                        <div
                            className="bg-emerald-500 h-full rounded-full"
                            style={{ width: `${producedPct}%` }}
                        />
                    </div>
                    <p className="text-[10px] text-emerald-600 font-medium">{producedPct}% of product target achieved</p>
                </div>

                {/* Finished Goods in Store */}
                <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs space-y-2">
                    <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                            <TrendingUp size={15} className="text-blue-600" /> In Finished Stock
                        </span>
                        <span className="font-bold text-blue-600">{inStockFG.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                        <div
                            className="bg-blue-500 h-full rounded-full"
                            style={{ width: `${producedQty > 0 ? Math.min(100, (inStockFG / producedQty) * 100) : 0}%` }}
                        />
                    </div>
                    <p className="text-[10px] text-gray-400">Ready for delivery to client</p>
                </div>

                {/* Delivered */}
                <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs space-y-2">
                    <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                            <Truck size={15} className="text-indigo-600" /> Delivered to Client
                        </span>
                        <span className="font-bold text-indigo-600">{deliveredQty.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                        <div
                            className="bg-indigo-600 h-full rounded-full"
                            style={{ width: `${deliveredPct}%` }}
                        />
                    </div>
                    <p className="text-[10px] text-indigo-600 font-medium">{deliveredPct}% delivered (Balance: {balanceToDeliver.toLocaleString()})</p>
                </div>
            </div>

            {/* History Tabs Navigation */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
                <div className="flex border-b border-gray-200 px-4 pt-3 gap-2 bg-gray-50/50">
                    <button
                        onClick={() => setActiveTab('production')}
                        className={`px-4 py-2.5 font-bold text-xs rounded-t-xl transition-all cursor-pointer flex items-center gap-2 ${
                            activeTab === 'production'
                                ? 'bg-white text-blue-600 border-t-2 border-blue-600 shadow-xs'
                                : 'text-gray-500 hover:text-gray-900'
                        }`}
                    >
                        <Cpu size={15} />
                        Production History ({projectData.productions?.length || 0})
                    </button>

                    <button
                        onClick={() => setActiveTab('plannings')}
                        className={`px-4 py-2.5 font-bold text-xs rounded-t-xl transition-all cursor-pointer flex items-center gap-2 ${
                            activeTab === 'plannings'
                                ? 'bg-white text-blue-600 border-t-2 border-blue-600 shadow-xs'
                                : 'text-gray-500 hover:text-gray-900'
                        }`}
                    >
                        <ClipboardList size={15} />
                        Planning History ({projectData.plannings?.length || 0})
                    </button>

                    <button
                        onClick={() => setActiveTab('deliveries')}
                        className={`px-4 py-2.5 font-bold text-xs rounded-t-xl transition-all cursor-pointer flex items-center gap-2 ${
                            activeTab === 'deliveries'
                                ? 'bg-white text-blue-600 border-t-2 border-blue-600 shadow-xs'
                                : 'text-gray-500 hover:text-gray-900'
                        }`}
                    >
                        <Truck size={15} />
                        Delivery History ({projectData.deliveries?.length || 0})
                    </button>
                </div>

                {/* Tab Contents */}
                <div className="p-4">
                    {/* PRODUCTION HISTORY TAB */}
                    {activeTab === 'production' && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                    <tr className="bg-slate-900 text-white font-semibold text-[11px] uppercase">
                                        <th className="py-3 px-3.5">Code</th>
                                        <th className="py-3 px-3.5">Date & Shift</th>
                                        <th className="py-3 px-3.5">Machine</th>
                                        <th className="py-3 px-3.5">Shift Incharges</th>
                                        <th className="py-3 px-3.5 text-right">Actual Qty</th>
                                        <th className="py-3 px-3.5 text-right">OK Qty</th>
                                        <th className="py-3 px-3.5 text-right">Rejection %</th>
                                        <th className="py-3 px-3.5 text-right">Prod/Hr</th>
                                        <th className="py-3 px-3.5 text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {(projectData.productions || []).length === 0 ? (
                                        <tr>
                                            <td colSpan="9" className="text-center py-8 text-gray-400">
                                                No production runs recorded for this product yet.
                                            </td>
                                        </tr>
                                    ) : (
                                        projectData.productions.map(pr => (
                                            <tr key={pr.id} className="hover:bg-gray-50">
                                                <td className="py-3 px-3.5 font-mono font-semibold text-blue-600">{pr.production_code}</td>
                                                <td className="py-3 px-3.5">
                                                    <div>{String(pr.production_date).split('T')[0]}</div>
                                                    <span className="text-[10px] text-gray-400 font-medium">{pr.shift} Shift</span>
                                                </td>
                                                <td className="py-3 px-3.5 font-medium">{pr.machine_name}</td>
                                                <td className="py-3 px-3.5 text-gray-600">
                                                    <div>{pr.shift_incharge_1_name}</div>
                                                    {pr.shift_incharge_2_name && <div className="text-[10px] text-gray-400">{pr.shift_incharge_2_name}</div>}
                                                </td>
                                                <td className="py-3 px-3.5 text-right font-semibold">{Number(pr.actual_production_quantity).toLocaleString()}</td>
                                                <td className="py-3 px-3.5 text-right font-bold text-emerald-600">{Number(pr.ok_quantity).toLocaleString()}</td>
                                                <td className="py-3 px-3.5 text-right font-semibold text-rose-600">{pr.rejection_percentage}%</td>
                                                <td className="py-3 px-3.5 text-right font-semibold text-blue-600">{pr.production_per_hour}/hr</td>
                                                <td className="py-3 px-3.5 text-center">
                                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                        {pr.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* PLANNING HISTORY TAB */}
                    {activeTab === 'plannings' && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                    <tr className="bg-slate-900 text-white font-semibold text-[11px] uppercase">
                                        <th className="py-3 px-3.5">Planning Code</th>
                                        <th className="py-3 px-3.5">Planning Date</th>
                                        <th className="py-3 px-3.5">Shift</th>
                                        <th className="py-3 px-3.5">Machine</th>
                                        <th className="py-3 px-3.5">Shift Incharge</th>
                                        <th className="py-3 px-3.5 text-right">Planned Qty</th>
                                        <th className="py-3 px-3.5 text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {(projectData.plannings || []).length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="text-center py-8 text-gray-400">
                                                No planning records created for this product yet.
                                            </td>
                                        </tr>
                                    ) : (
                                        projectData.plannings.map(pp => (
                                            <tr key={pp.id} className="hover:bg-gray-50">
                                                <td className="py-3 px-3.5 font-mono font-semibold text-purple-600">{pp.planning_code}</td>
                                                <td className="py-3 px-3.5">{String(pp.planning_date).split('T')[0]}</td>
                                                <td className="py-3 px-3.5">{pp.shift}</td>
                                                <td className="py-3 px-3.5 font-medium">{pp.machine_name}</td>
                                                <td className="py-3 px-3.5 text-gray-700">{pp.shift_incharge_name}</td>
                                                <td className="py-3 px-3.5 text-right font-bold text-gray-900">{Number(pp.planned_quantity).toLocaleString()}</td>
                                                <td className="py-3 px-3.5 text-center">
                                                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                                                        {pp.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* DELIVERIES HISTORY TAB */}
                    {activeTab === 'deliveries' && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                    <tr className="bg-slate-900 text-white font-semibold text-[11px] uppercase">
                                        <th className="py-3 px-3.5">Delivery Number</th>
                                        <th className="py-3 px-3.5">Delivery Date</th>
                                        <th className="py-3 px-3.5">Vehicle Details</th>
                                        <th className="py-3 px-3.5">Delivery Person</th>
                                        <th className="py-3 px-3.5 text-right">Quantity Delivered</th>
                                        <th className="py-3 px-3.5 text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {(projectData.deliveries || []).length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="text-center py-8 text-gray-400">
                                                No deliveries dispatched for this product yet.
                                            </td>
                                        </tr>
                                    ) : (
                                        projectData.deliveries.map(del => (
                                            <tr key={del.id} className="hover:bg-gray-50">
                                                <td className="py-3 px-3.5 font-mono font-semibold text-indigo-600">{del.delivery_number}</td>
                                                <td className="py-3 px-3.5">{String(del.delivery_date).split('T')[0]}</td>
                                                <td className="py-3 px-3.5">{del.vehicle_details || 'N/A'}</td>
                                                <td className="py-3 px-3.5">{del.delivery_person || 'N/A'}</td>
                                                <td className="py-3 px-3.5 text-right font-bold text-indigo-600">{Number(del.total_delivery_qty || 0).toLocaleString()}</td>
                                                <td className="py-3 px-3.5 text-center">
                                                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                                                        {del.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
