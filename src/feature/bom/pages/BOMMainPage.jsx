import React, { useState } from "react";
import { Boxes, FileSpreadsheet } from "lucide-react";

import BOMManagementPage from "./BOMManagementPage";
import BOMPreparationPage from "../../bomPreparation/pages/BOMPreparationPage";

const BOMMainPage = () => {
    const [activeTab, setActiveTab] = useState("master");

    return (
        <div className="space-y-3">
            {/* PAGE TABS */}
            <div className="flex items-center gap-1 bg-white p-1.5 rounded-2xl border border-gray-200 shadow-xs overflow-x-auto">
                {/* BOM MASTER */}
                <button
                    type="button"
                    onClick={() => setActiveTab("master")}
                    className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                        activeTab === "master"
                            ? "bg-blue-600 text-white shadow-xs"
                            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                >
                    <Boxes size={15} />
                    <span>BOM Master</span>
                </button>

                {/* BOM PREPARATION */}
                <button
                    type="button"
                    onClick={() => setActiveTab("preparation")}
                    className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                        activeTab === "preparation"
                            ? "bg-indigo-600 text-white shadow-xs"
                            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                >
                    <FileSpreadsheet size={15} />
                    <span>BOM Preparation</span>
                </button>
            </div>

            {/* TAB CONTENT */}
            <div>
                {activeTab === "master" && (
                    <BOMManagementPage />
                )}

                {activeTab === "preparation" && (
                    <BOMPreparationPage />
                )}

            </div>

        </div>
    );
};

export default BOMMainPage;