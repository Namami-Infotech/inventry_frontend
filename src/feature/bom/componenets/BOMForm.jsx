import React, { useEffect, useMemo, useState } from "react";
import { Calculator } from "lucide-react";

const emptyForm = {
    productId: "",
    description: "",
    items: []
};

const BOMForm = ({
    bom,
    boms = [],
    products = [],
    items = [],
    loading,
    onCreate,
    onUpdate,
    onClose
}) => {
    const [formData, setFormData] = useState(emptyForm);
    const [customMfgPrice, setCustomMfgPrice] = useState("");

    // Filter products: When creating a new BOM, exclude products that already have a BOM.
    // If editing an existing BOM, keep the product currently assigned to this BOM.
    const availableProducts = useMemo(() => {
        const existingBomProductIds = new Set(
            (boms || []).map((b) => Number(b.product_id || b.productId)).filter(Boolean)
        );

        const currentSelectedProductId = Number(bom?.product_id || bom?.productId || formData.productId);

        return (products || []).filter((product) => {
            const pid = Number(product.id);
            if (currentSelectedProductId && pid === currentSelectedProductId) {
                return true;
            }
            return !existingBomProductIds.has(pid);
        });
    }, [products, boms, bom, formData.productId]);

    // Filter items to strictly include only Raw Materials (excluding finished goods / products)
    const rawMaterialItems = useMemo(() => {
        const productNamesSet = new Set(
            (products || [])
                .map((p) => String(p.product_name || p.name || "").trim().toLowerCase())
                .filter(Boolean)
        );

        return (items || []).filter((item) => {
            const itemName = String(item.item_name || item.name || "").trim().toLowerCase();
            const category = String(item.category || "").trim().toLowerCase();
            const itemType = String(item.item_type || "").trim().toLowerCase();

            if (itemType === "finished_good" || itemType === "finished_goods") return false;
            if (category === "finished goods" || category === "finished good") return false;
            if (item.product_id) return false;
            if (productNamesSet.has(itemName)) return false;

            return true;
        });
    }, [items, products]);

    // Calculate total estimated raw materials cost
    const calculatedMfgPrice = useMemo(() => {
        let total = 0;
        (formData.items || []).forEach((it) => {
            const sItem = (items || []).find((i) => String(i.id) === String(it.itemId));
            const unitPrice = it.unit_cost !== undefined && it.unit_cost !== "" && !isNaN(parseFloat(it.unit_cost))
                ? parseFloat(it.unit_cost)
                : (parseFloat(sItem?.price) || 0);
            const qty = parseFloat(it.quantity) || 0;
            total += (unitPrice * qty);
        });
        return total;
    }, [formData.items, items]);

    const effectiveMfgPrice = customMfgPrice !== "" && !isNaN(parseFloat(customMfgPrice)) && parseFloat(customMfgPrice) >= 0
        ? parseFloat(customMfgPrice)
        : calculatedMfgPrice;

    // =====================================================
    // EDIT DATA SYNC
    // =====================================================
    useEffect(() => {
        if (bom) {
            setFormData({
                productId: bom.product_id || bom.productId || "",
                description: bom.description || "",
                items: bom.items?.map((item) => {
                    const sItem = (items || []).find((i) => String(i.id) === String(item.item_id || item.itemId));
                    const defaultUnitCost = item.unit_cost !== undefined && item.unit_cost !== null && item.unit_cost !== ""
                        ? String(item.unit_cost)
                        : (sItem?.price ? String(sItem.price) : "");
                    return {
                        itemId: item.item_id || item.itemId,
                        quantity: item.quantity,
                        unit_cost: defaultUnitCost,
                        remarks: item.remarks || ""
                    };
                }) || []
            });
            if (bom.manufactured_price !== undefined && bom.manufactured_price !== null) {
                setCustomMfgPrice(bom.manufactured_price > 0 ? String(bom.manufactured_price) : "");
            }
        } else {
            setFormData(emptyForm);
            setCustomMfgPrice("");
        }
    }, [bom, items]);

    // =====================================================
    // BASIC CHANGE
    // =====================================================
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    // =====================================================
    // ADD ITEM
    // =====================================================
    const handleAddItem = () => {
        setFormData((prev) => ({
            ...prev,
            items: [
                ...prev.items,
                {
                    itemId: "",
                    quantity: "",
                    unit_cost: "",
                    remarks: ""
                }
            ]
        }));
    };

    // =====================================================
    // REMOVE ITEM
    // =====================================================
    const handleRemoveItem = (index) => {
        setFormData((prev) => ({
            ...prev,
            items: prev.items.filter((_, itemIndex) => itemIndex !== index)
        }));
    };

    // =====================================================
    // ITEM CHANGE
    // =====================================================
    const handleItemChange = (index, field, value) => {
        setFormData((prev) => {
            const updatedItems = [...prev.items];
            if (field === "itemId") {
                const selected = items.find((i) => String(i.id) === String(value));
                const itemUnit = selected?.unit || selected?.uom || "Nos";
                const autoPrice = selected?.price ? String(selected.price) : "";

                updatedItems[index] = {
                    ...updatedItems[index],
                    itemId: value,
                    unit: itemUnit,
                    unit_cost: autoPrice
                };
            } else {
                updatedItems[index] = {
                    ...updatedItems[index],
                    [field]: value
                };
            }

            return {
                ...prev,
                items: updatedItems
            };
        });
    };

    // =====================================================
    // SUBMIT
    // =====================================================
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.productId) {
            alert("Product is required.");
            return;
        }

        if (!formData.items.length) {
            alert("Add at least one raw material item.");
            return;
        }

        const itemIds = formData.items.map((item) => item.itemId);
        if (new Set(itemIds).size !== itemIds.length) {
            alert("Duplicate items are not allowed in BOM.");
            return;
        }

        for (const item of formData.items) {
            if (!item.itemId) {
                alert("Please select an item for each row.");
                return;
            }

            if (!item.quantity || Number(item.quantity) <= 0) {
                alert("Quantity must be greater than 0.");
                return;
            }
        }

        const payload = {
            productId: Number(formData.productId),
            capacity: "Standard",
            description: formData.description,
            manufactured_price: parseFloat(effectiveMfgPrice.toFixed(2)) || 0,
            store_items_id: formData.items.map((item) => {
                const sItem = items.find((i) => String(i.id) === String(item.itemId));
                const unitCost = item.unit_cost !== undefined && item.unit_cost !== "" && !isNaN(parseFloat(item.unit_cost))
                    ? parseFloat(item.unit_cost)
                    : (parseFloat(sItem?.price) || 0);
                return {
                    itemId: Number(item.itemId),
                    quantity: Number(item.quantity),
                    unit_cost: unitCost,
                    remarks: item.remarks || null
                };
            })
        };

        let response;
        if (bom?.id) {
            response = await onUpdate(bom.id, payload);
        } else {
            response = await onCreate(payload);
        }

        if (response?.success) {
            onClose();
        } else {
            alert(response?.message || "Failed to save BOM.");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 text-slate-900">

            {/* =====================================================
                HEADER
            ===================================================== */}
            <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
                <div>
                    <h2 className="text-lg font-bold text-slate-900">
                        {bom ? "Edit BOM / BOQ" : "Create BOM / BOQ"}
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                        Define standard raw materials required and calculate manufacturing price.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={onClose}
                    className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 hover:text-slate-900 rounded-xl transition-all cursor-pointer"
                >
                    Back to List
                </button>
            </div>

            {/* =====================================================
                MANUFACTURED PRICE & COSTING ESTIMATION BANNER
            ===================================================== */}
            <div className="bg-linear-to-r from-blue-50/80 via-indigo-50/50 to-slate-50 border border-blue-200/80 rounded-2xl p-4 shadow-xs">
                <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                        <Calculator size={14} />
                    </div>
                    <span className="text-xs font-bold text-blue-950 uppercase tracking-wider">
                        BOM Costing & Manufactured Price Estimation
                    </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Auto-sum of Raw Materials */}
                    <div className="p-3.5 bg-white/90 backdrop-blur-xs rounded-xl border border-blue-100 shadow-2xs">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                            Raw Materials Cost (Auto-Sum)
                        </span>
                        <span className="text-xl font-extrabold text-blue-700 block mt-0.5 font-mono">
                            ₹{calculatedMfgPrice.toFixed(2)}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                            Sum of ({formData.items.length}) component items
                        </span>
                    </div>

                    {/* Final Manufactured Price (Cost to Produce) */}
                    <div className="p-3.5 bg-white/90 backdrop-blur-xs rounded-xl border border-indigo-200 shadow-2xs">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-bold text-indigo-900 uppercase tracking-wider block">
                                Manufactured Price (BOM Cost)
                            </span>
                            <span className="text-[9px] px-1.5 py-0.2 bg-indigo-50 text-indigo-700 font-bold rounded border border-indigo-200">
                                Saved with BOM
                            </span>
                        </div>
                        <div className="relative">
                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 font-mono">₹</span>
                            <input
                                type="text"
                                inputMode="decimal"
                                placeholder={calculatedMfgPrice > 0 ? calculatedMfgPrice.toFixed(2) : "0.00"}
                                value={customMfgPrice}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    if (val === "" || /^\d*\.?\d*$/.test(val)) {
                                        setCustomMfgPrice(val);
                                    }
                                }}
                                className="w-full bg-white text-slate-900 text-sm font-bold font-mono border border-indigo-300 rounded-lg pl-6 pr-2 py-1 outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium block mt-0.5">
                            {customMfgPrice ? "Customized manufacturing cost" : "Auto-calculated from raw materials"}
                        </span>
                    </div>
                </div>
            </div>

            {/* =====================================================
                PRODUCT SELECTION
            ===================================================== */}
            <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                    Product Selection
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* PRODUCT */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Product Name <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="productId"
                            value={formData.productId}
                            onChange={handleChange}
                            disabled={Boolean(bom?.id)}
                            className={`w-full bg-white text-slate-900 text-xs sm:text-sm border border-slate-300 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${Boolean(bom?.id) ? "bg-slate-100 cursor-not-allowed opacity-80" : ""}`}
                        >
                            <option value="" className="text-slate-900">
                                {availableProducts.length === 0 ? "No pending products (All have BOM)" : "Select Product"}
                            </option>
                            {availableProducts.map((product) => (
                                <option key={product.id} value={product.id} className="text-slate-900">
                                    {product.product_name}
                                </option>
                            ))}
                        </select>
                        {availableProducts.length === 0 && !bom?.id && (
                            <p className="text-[11px] text-amber-600 font-medium mt-1">
                                All available products already have a BOM prepared.
                            </p>
                        )}
                    </div>

                    {/* DESCRIPTION */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Description / Remarks
                        </label>
                        <input
                            type="text"
                            name="description"
                            value={formData.description || ""}
                            onChange={handleChange}
                            placeholder="Optional notes for this BOM..."
                            className="w-full bg-white text-slate-900 text-xs sm:text-sm border border-slate-300 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        />
                    </div>
                </div>
            </div>

            {/* =====================================================
                BOM ITEMS (RAW MATERIALS)
            ===================================================== */}
            <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs">
                <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                            Required Raw Materials & Components
                        </h3>
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                            {formData.items.length} {formData.items.length === 1 ? "Item" : "Items"}
                        </span>
                    </div>

                    <button
                        type="button"
                        onClick={handleAddItem}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                        + Add Raw Material
                    </button>
                </div>

                {/* ITEMS TABLE */}
                <div className="overflow-x-auto rounded-xl border border-gray-100">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-200 bg-slate-50 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                                <th className="py-2.5 px-3 w-8">#</th>
                                <th className="py-2.5 px-3 min-w-[220px]">Raw Material Item <span className="text-red-500">*</span></th>
                                <th className="py-2.5 px-3 text-center w-24">UOM</th>
                                <th className="py-2.5 px-3 text-right w-28">Unit Cost (₹)</th>
                                <th className="py-2.5 px-3 w-28">Qty Required <span className="text-red-500">*</span></th>
                                <th className="py-2.5 px-3 text-right w-28">Total Cost (₹)</th>
                                <th className="py-2.5 px-3 text-center w-20">Action</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100">
                            {formData.items.map((bomItem, index) => {
                                const selectedItem = items.find((item) => String(item.id) === String(bomItem.itemId));
                                const otherSelectedItemIds = new Set(
                                    formData.items
                                        .filter((_, i) => i !== index)
                                        .map((it) => String(it.itemId))
                                        .filter(Boolean)
                                );

                                const availableRawMaterials = rawMaterialItems.filter(
                                    (item) => !otherSelectedItemIds.has(String(item.id))
                                );

                                const unitPrice = bomItem.unit_cost !== undefined && bomItem.unit_cost !== "" && !isNaN(parseFloat(bomItem.unit_cost))
                                    ? parseFloat(bomItem.unit_cost)
                                    : (parseFloat(selectedItem?.price) || 0);
                                const qty = parseFloat(bomItem.quantity) || 0;
                                const lineTotal = unitPrice * qty;

                                return (
                                    <tr key={index} className="hover:bg-slate-50/60 transition-colors">
                                        <td className="py-2 px-3 text-xs text-slate-400 font-semibold w-8">
                                            {index + 1}
                                        </td>

                                        {/* ITEM */}
                                        <td className="py-2 px-3">
                                            <select
                                                value={bomItem.itemId}
                                                onChange={(e) => handleItemChange(index, "itemId", e.target.value)}
                                                className="w-full min-w-[200px] bg-white text-slate-900 text-xs sm:text-sm border border-slate-300 rounded-xl px-3 py-1.5 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                            >
                                                <option value="" className="text-slate-900">
                                                    -- Select Item --
                                                </option>

                                                {availableRawMaterials.map((item) => (
                                                    <option key={item.id} value={item.id} className="text-slate-900">
                                                        {item.item_name} {item.price ? `(₹${Number(item.price).toFixed(2)})` : ''}
                                                    </option>
                                                ))}

                                                {/* Preserve existing item in edit mode if not in filtered list */}
                                                {bomItem.itemId && !availableRawMaterials.some((i) => String(i.id) === String(bomItem.itemId)) && (() => {
                                                    const matched = (items || []).find((i) => String(i.id) === String(bomItem.itemId));
                                                    return matched ? (
                                                        <option key={matched.id} value={matched.id} className="text-slate-900">
                                                            {matched.item_name} {matched.price ? `(₹${Number(matched.price).toFixed(2)})` : ''}
                                                        </option>
                                                    ) : null;
                                                })()}
                                            </select>
                                        </td>

                                        {/* UOM */}
                                        <td className="py-2 px-3 text-center">
                                            <span className={`inline-block px-2 py-0.5 rounded-lg text-xs font-semibold ${selectedItem ? "bg-slate-100 text-slate-700 border border-slate-200" : "bg-slate-50 text-slate-400 border border-slate-200"}`}>
                                                {selectedItem ? (selectedItem.unit || selectedItem.uom || bomItem.unit || "Nos") : "—"}
                                            </span>
                                        </td>

                                        {/* UNIT COST (PREFILLED FROM PURCHASE / EDITABLE) */}
                                        <td className="py-2 px-3">
                                            <div className="relative min-w-[100px]">
                                                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 font-mono">₹</span>
                                                <input
                                                    type="text"
                                                    inputMode="decimal"
                                                    placeholder="0.00"
                                                    value={bomItem.unit_cost !== undefined ? bomItem.unit_cost : (selectedItem?.price ? String(selectedItem.price) : "")}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        if (val === "" || /^\d*\.?\d*$/.test(val)) {
                                                            handleItemChange(index, "unit_cost", val);
                                                        }
                                                    }}
                                                    className="w-full pl-6 pr-2.5 py-1.5 bg-slate-50 hover:bg-white focus:bg-white text-slate-900 text-xs sm:text-sm font-bold font-mono border border-slate-300 rounded-xl text-right outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition shadow-2xs"
                                                />
                                            </div>
                                        </td>

                                        {/* QUANTITY */}
                                        <td className="py-2 px-3">
                                            <input
                                                type="text"
                                                inputMode="decimal"
                                                placeholder="0.00"
                                                value={bomItem.quantity}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    if (val === "" || /^\d*\.?\d*$/.test(val)) {
                                                        handleItemChange(index, "quantity", val);
                                                    }
                                                }}
                                                className="w-full bg-white text-slate-900 text-xs sm:text-sm font-semibold border border-slate-300 rounded-xl px-3 py-1.5 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                            />
                                        </td>

                                        {/* LINE TOTAL */}
                                        <td className="py-2 px-3 text-right font-mono text-xs font-bold text-blue-700">
                                            ₹{lineTotal.toFixed(2)}
                                        </td>

                                        {/* ACTION */}
                                        <td className="py-2 px-3 text-center">
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveItem(index)}
                                                className="px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                                            >
                                                Remove
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {!formData.items.length && (
                    <div className="py-6 text-center text-xs text-slate-400 bg-slate-50/50 rounded-xl mt-2 border border-dashed border-slate-200">
                        No raw material items added. Click <strong className="text-blue-600">+ Add Raw Material</strong> above.
                    </div>
                )}
            </div>

            {/* =====================================================
                ACTIONS
            ===================================================== */}
            <div className="flex justify-end gap-2 pt-2">
                <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition cursor-pointer disabled:opacity-50"
                >
                    {loading ? "Saving..." : bom?.id ? "Update BOM" : "Save BOM"}
                </button>
            </div>
        </form>
    );
};

export default BOMForm;