import React, { useState, useEffect, useCallback } from 'react';
import {
  Tag,
  FolderTree,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertCircle,
  X,
  Layers,
  Hash
} from 'lucide-react';
import {
  getAllBrands,
  getNextBrandCode,
  createBrand,
  updateBrand,
  toggleBrandStatus,
  deleteBrand
} from '../services/brandService';
import {
  getAllCategories,
  getNextCategoryCode,
  createCategory,
  updateCategory,
  toggleCategoryStatus,
  deleteCategory
} from '../services/categoryService';
import Pagination from '../../../components/common/pagination';
import TableSearch from '../../../components/common/TableSearch.jsx';
import DeleteConfirmation from '../../../components/common/DeleteConfirmation.jsx';

export const BrandListPage = () => {
  // Active Main Tab: 'brands' or 'categories'
  const [activeTab, setActiveTab] = useState('brands');

  // --- Brands State ---
  const [brands, setBrands] = useState([]);
  const [loadingBrands, setLoadingBrands] = useState(true);
  const [brandSearch, setBrandSearch] = useState('');
  const [brandStatusFilter, setBrandStatusFilter] = useState('');
  const [brandPage, setBrandPage] = useState(1);
  const [brandLimit, setBrandLimit] = useState(10);
  const [brandPagination, setBrandPagination] = useState({
    currentPage: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 1
  });

  // Brand Modal State
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const [brandCodeInput, setBrandCodeInput] = useState('');
  const [brandNameInput, setBrandNameInput] = useState('');
  const [submittingBrand, setSubmittingBrand] = useState(false);
  const [brandFormError, setBrandFormError] = useState('');
  const [brandStatusUpdatingId, setBrandStatusUpdatingId] = useState(null);

  // --- Categories State ---
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [categorySearch, setCategorySearch] = useState('');
  const [categoryStatusFilter, setCategoryStatusFilter] = useState('');
  const [categoryPage, setCategoryPage] = useState(1);
  const [categoryLimit, setCategoryLimit] = useState(10);
  const [categoryPagination, setCategoryPagination] = useState({
    currentPage: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 1
  });

  // Category Modal State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryCodeInput, setCategoryCodeInput] = useState('');
  const [categoryNameInput, setCategoryNameInput] = useState('');
  const [submittingCategory, setSubmittingCategory] = useState(false);
  const [categoryFormError, setCategoryFormError] = useState('');
  const [categoryStatusUpdatingId, setCategoryStatusUpdatingId] = useState(null);

  // Delete Confirmation State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleteType, setDeleteType] = useState('brand');
  const [deleteLoading, setDeleteLoading] = useState(false);

  // ==========================================
  // FETCH BRANDS
  // ==========================================
  const fetchBrands = useCallback(async () => {
    try {
      setLoadingBrands(true);
      const res = await getAllBrands({
        page: brandPage,
        limit: brandLimit,
        search: brandSearch || undefined,
        status: brandStatusFilter || undefined,
      });
      if (res && res.data) {
        setBrands(res.data);
        if (res.pagination) {
          setBrandPagination(res.pagination);
        } else {
          setBrandPagination({
            currentPage: brandPage,
            pageSize: brandLimit,
            totalItems: res.data.length,
            totalPages: Math.ceil(res.data.length / brandLimit) || 1
          });
        }
      } else if (Array.isArray(res)) {
        setBrands(res);
        setBrandPagination({
          currentPage: brandPage,
          pageSize: brandLimit,
          totalItems: res.length,
          totalPages: Math.ceil(res.length / brandLimit) || 1
        });
      } else {
        setBrands([]);
      }
    } catch (err) {
      console.error('Error fetching brands:', err);
    } finally {
      setLoadingBrands(false);
    }
  }, [brandPage, brandLimit, brandSearch, brandStatusFilter]);

  // ==========================================
  // FETCH CATEGORIES
  // ==========================================
  const fetchCategories = useCallback(async () => {
    try {
      setLoadingCategories(true);
      const res = await getAllCategories({
        page: categoryPage,
        limit: categoryLimit,
        search: categorySearch || undefined,
        status: categoryStatusFilter || undefined,
      });
      if (res && res.data) {
        setCategories(res.data);
        if (res.pagination) {
          setCategoryPagination(res.pagination);
        } else {
          setCategoryPagination({
            currentPage: categoryPage,
            pageSize: categoryLimit,
            totalItems: res.data.length,
            totalPages: Math.ceil(res.data.length / categoryLimit) || 1
          });
        }
      } else if (Array.isArray(res)) {
        setCategories(res);
        setCategoryPagination({
          currentPage: categoryPage,
          pageSize: categoryLimit,
          totalItems: res.length,
          totalPages: Math.ceil(res.length / categoryLimit) || 1
        });
      } else {
        setCategories([]);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    } finally {
      setLoadingCategories(false);
    }
  }, [categoryPage, categoryLimit, categorySearch, categoryStatusFilter]);

  useEffect(() => {
    if (activeTab === 'brands') {
      fetchBrands();
    } else {
      fetchCategories();
    }
  }, [activeTab, fetchBrands, fetchCategories]);

  // ==========================================
  // BRAND HANDLERS
  // ==========================================
  const handleOpenBrandModal = async (brand = null) => {
    setBrandFormError('');
    if (brand) {
      setEditingBrand(brand);
      setBrandCodeInput(brand.brand_code || `BRD${String(brand.brand_id).padStart(3, '0')}`);
      setBrandNameInput(brand.brand_name || '');
    } else {
      setEditingBrand(null);
      setBrandNameInput('');
      try {
        const nextRes = await getNextBrandCode();
        setBrandCodeInput(nextRes?.brand_code || 'BRD001');
      } catch (err) {
        setBrandCodeInput(`BRD${String(brands.length + 1).padStart(3, '0')}`);
      }
    }
    setIsBrandModalOpen(true);
  };

  const handleCloseBrandModal = () => {
    setIsBrandModalOpen(false);
    setEditingBrand(null);
    setBrandCodeInput('');
    setBrandNameInput('');
    setBrandFormError('');
  };

  const handleBrandNameChange = (e) => {
    const rawVal = e.target.value;
    // Allow only alphanumeric characters, spaces, and & . -
    const cleanVal = rawVal.replace(/[^a-zA-Z0-9\s&.-]/g, '');
    setBrandNameInput(cleanVal);
    if (brandFormError) setBrandFormError('');
  };

  const handleBrandCodeChange = (e) => {
    const rawVal = e.target.value;
    // Allow uppercase alphanumeric, hyphens, and underscores
    const cleanVal = rawVal.toUpperCase().replace(/[^A-Z0-9_-]/g, '');
    setBrandCodeInput(cleanVal);
  };

  const handleBrandSubmit = async (e) => {
    e.preventDefault();
    const trimmedName = brandNameInput.trim();
    const trimmedCode = brandCodeInput.trim();

    if (!trimmedName) {
      setBrandFormError('Brand Name is required.');
      return;
    }

    if (trimmedName.length < 2) {
      setBrandFormError('Brand Name must be at least 2 characters long.');
      return;
    }

    if (!/^[a-zA-Z0-9\s&.-]+$/.test(trimmedName)) {
      setBrandFormError('Brand Name contains invalid special characters. Only letters, numbers, spaces, and & . - are allowed.');
      return;
    }

    // Check for duplicate brand name (case-insensitive)
    const isDuplicate = brands.some(
      (b) =>
        b.brand_name?.trim().toLowerCase() === trimmedName.toLowerCase() &&
        (!editingBrand || Number(b.brand_id) !== Number(editingBrand.brand_id))
    );
    if (isDuplicate) {
      setBrandFormError(`A brand named "${trimmedName}" already exists.`);
      return;
    }

    try {
      setSubmittingBrand(true);
      setBrandFormError('');

      if (editingBrand) {
        await updateBrand(editingBrand.brand_id, {
          brand_code: trimmedCode,
          brand_name: trimmedName,
          status: editingBrand.status || 'Active',
        });
      } else {
        await createBrand({
          brand_code: trimmedCode,
          brand_name: trimmedName,
          status: 'Active',
        });
      }

      handleCloseBrandModal();
      fetchBrands();
    } catch (err) {
      console.error('Error saving brand:', err);
      const msg = err.response?.data?.message || 'Failed to save brand. Please try again.';
      setBrandFormError(msg);
    } finally {
      setSubmittingBrand(false);
    }
  };

  const handleToggleBrandStatus = async (brand) => {
    try {
      setBrandStatusUpdatingId(brand.brand_id);
      await toggleBrandStatus(brand.brand_id, brand.status);
      fetchBrands();
    } catch (err) {
      console.error('Error updating brand status:', err);
      alert('Failed to update brand status.');
    } finally {
      setBrandStatusUpdatingId(null);
    }
  };

  const handleDeleteBrand = (brand) => {
    setItemToDelete(brand);
    setDeleteType('brand');
    setDeleteModalOpen(true);
  };

  // ==========================================
  // CATEGORY HANDLERS
  // ==========================================
  const handleOpenCategoryModal = async (cat = null) => {
    setCategoryFormError('');
    if (cat) {
      setEditingCategory(cat);
      setCategoryCodeInput(cat.category_code || `CAT${String(cat.category_id).padStart(3, '0')}`);
      setCategoryNameInput(cat.category_name || '');
    } else {
      setEditingCategory(null);
      setCategoryNameInput('');
      try {
        const nextRes = await getNextCategoryCode();
        setCategoryCodeInput(nextRes?.category_code || 'CAT001');
      } catch (err) {
        setCategoryCodeInput(`CAT${String(categories.length + 1).padStart(3, '0')}`);
      }
    }
    setIsCategoryModalOpen(true);
  };

  const handleCloseCategoryModal = () => {
    setIsCategoryModalOpen(false);
    setEditingCategory(null);
    setCategoryCodeInput('');
    setCategoryNameInput('');
    setCategoryFormError('');
  };

  const handleCategoryNameChange = (e) => {
    const rawVal = e.target.value;
    const cleanVal = rawVal.replace(/[^a-zA-Z0-9\s&.-]/g, '');
    setCategoryNameInput(cleanVal);
    if (categoryFormError) setCategoryFormError('');
  };

  const handleCategoryCodeChange = (e) => {
    const rawVal = e.target.value;
    const cleanVal = rawVal.toUpperCase().replace(/[^A-Z0-9_-]/g, '');
    setCategoryCodeInput(cleanVal);
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    const trimmedName = categoryNameInput.trim();
    const trimmedCode = categoryCodeInput.trim();

    if (!trimmedName) {
      setCategoryFormError('Category Name is required.');
      return;
    }

    if (trimmedName.length < 2) {
      setCategoryFormError('Category Name must be at least 2 characters long.');
      return;
    }

    if (!/^[a-zA-Z0-9\s&.-]+$/.test(trimmedName)) {
      setCategoryFormError('Category Name contains invalid special characters. Only letters, numbers, spaces, and & . - are allowed.');
      return;
    }

    const isDuplicate = categories.some(
      (c) =>
        c.category_name?.trim().toLowerCase() === trimmedName.toLowerCase() &&
        (!editingCategory || Number(c.category_id) !== Number(editingCategory.category_id))
    );
    if (isDuplicate) {
      setCategoryFormError(`A category named "${trimmedName}" already exists.`);
      return;
    }

    try {
      setSubmittingCategory(true);
      setCategoryFormError('');

      if (editingCategory) {
        await updateCategory(editingCategory.category_id, {
          category_code: trimmedCode,
          category_name: trimmedName,
          status: editingCategory.status || 'Active',
        });
      } else {
        await createCategory({
          category_code: trimmedCode,
          category_name: trimmedName,
          status: 'Active',
        });
      }

      handleCloseCategoryModal();
      fetchCategories();
    } catch (err) {
      console.error('Error saving category:', err);
      const msg = err.response?.data?.message || 'Failed to save category. Please try again.';
      setCategoryFormError(msg);
    } finally {
      setSubmittingCategory(false);
    }
  };

  const handleToggleCategoryStatus = async (cat) => {
    try {
      setCategoryStatusUpdatingId(cat.category_id);
      await toggleCategoryStatus(cat.category_id, cat.status);
      fetchCategories();
    } catch (err) {
      console.error('Error updating category status:', err);
      alert('Failed to update category status.');
    } finally {
      setCategoryStatusUpdatingId(null);
    }
  };

  const handleDeleteCategory = (cat) => {
    setItemToDelete(cat);
    setDeleteType('category');
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    setDeleteLoading(true);
    try {
      if (deleteType === 'brand') {
        await deleteBrand(itemToDelete.brand_id);
        setDeleteModalOpen(false);
        setItemToDelete(null);
        if (brands.length === 1 && brandPage > 1) {
          setBrandPage((prev) => Math.max(1, prev - 1));
        } else {
          fetchBrands();
        }
      } else {
        await deleteCategory(itemToDelete.category_id);
        setDeleteModalOpen(false);
        setItemToDelete(null);
        if (categories.length === 1 && categoryPage > 1) {
          setCategoryPage((prev) => Math.max(1, prev - 1));
        } else {
          fetchCategories();
        }
      }
    } catch (err) {
      alert(err.response?.data?.message || `Failed to delete ${deleteType}.`);
    } finally {
      setDeleteLoading(false);
    }
  };

  // Counters
  const totalBrands = brandPagination.totalItems || brands.length;
  const activeBrands = brands.filter((b) => (b.status || '').toLowerCase() === 'active').length;
  const inactiveBrands = totalBrands - activeBrands;

  const totalCategories = categoryPagination.totalItems || categories.length;
  const activeCategories = categories.filter((c) => (c.status || '').toLowerCase() === 'active').length;
  const inactiveCategories = totalCategories - activeCategories;

  return (
    <div className="max-w-7xl mx-auto space-y-4 sm:space-y-5 text-xs">
      {/* 🌟 1. PAGE HEADER */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shrink-0">
            {activeTab === 'brands' ? <Tag className="w-5 h-5" /> : <FolderTree className="w-5 h-5" />}
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
              {activeTab === 'brands' ? 'Brand Master' : 'Category Master'}
              <span className="text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
                {activeTab === 'brands' ? `${totalBrands} Brands` : `${totalCategories} Categories`}
              </span>
            </h1>
            <p className="text-xs text-gray-500">
              {activeTab === 'brands'
                ? 'Manage product brand catalog, unique brand codes, and active status'
                : 'Manage store item categories, category codes, and active status'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap sm:flex-nowrap">
          {/* Main Sub-Tabs Switcher */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs">
            <button
              onClick={() => setActiveTab('brands')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                activeTab === 'brands'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Tag size={13} />
              <span>Brands</span>
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                activeTab === 'categories'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FolderTree size={13} />
              <span>Categories</span>
            </button>
          </div>

          <button
            onClick={() => (activeTab === 'brands' ? handleOpenBrandModal() : handleOpenCategoryModal())}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all duration-200 active:scale-[0.98] cursor-pointer shrink-0"
          >
            <Plus size={15} />
            {activeTab === 'brands' ? 'Add Brand' : 'Add Category'}
          </button>
        </div>
      </div>

      {/* 🌟 2. STATS & FILTERS BAR */}
      <div className="bg-white p-3 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        {/* Quick Stats Badges */}
        <div className="flex items-center gap-2 overflow-x-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-medium whitespace-nowrap">
            <Layers className="w-3.5 h-3.5 text-blue-600" />
            <span>Total:</span>
            <strong className="text-gray-900 font-bold">
              {activeTab === 'brands' ? totalBrands : totalCategories}
            </strong>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-medium whitespace-nowrap">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Active:</span>
            <strong className="text-emerald-700 font-bold">
              {activeTab === 'brands' ? activeBrands : activeCategories}
            </strong>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 font-medium whitespace-nowrap">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            <span>Inactive:</span>
            <strong className="text-rose-700 font-bold">
              {activeTab === 'brands' ? inactiveBrands : inactiveCategories}
            </strong>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-2 flex-1 md:max-w-md md:justify-end">
          <div className="flex-1">
            <TableSearch
              value={activeTab === 'brands' ? brandSearch : categorySearch}
              onChange={(val) => {
                if (activeTab === 'brands') {
                  setBrandSearch(val);
                  setBrandPage(1);
                } else {
                  setCategorySearch(val);
                  setCategoryPage(1);
                }
              }}
              placeholder={activeTab === 'brands' ? 'Search by brand name or code...' : 'Search by category name or code...'}
            />
          </div>

          <select
            value={activeTab === 'brands' ? brandStatusFilter : categoryStatusFilter}
            onChange={(e) => {
              if (activeTab === 'brands') {
                setBrandStatusFilter(e.target.value);
                setBrandPage(1);
              } else {
                setCategoryStatusFilter(e.target.value);
                setCategoryPage(1);
              }
            }}
            className="text-xs bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 font-medium shrink-0 cursor-pointer"
          >
            <option value="">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* 🌟 3. DATA TABLE (BRANDS OR CATEGORIES) */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[700px]">
            <thead className="bg-slate-50 text-gray-600 font-bold uppercase tracking-wider text-[10px] border-b border-gray-200">
              <tr>
                <th className="py-3.5 px-4 w-[8%] text-center">#</th>
                <th className="py-3.5 px-4 w-[20%]">{activeTab === 'brands' ? 'Brand Code' : 'Category Code'}</th>
                <th className="py-3.5 px-4 w-[34%]">{activeTab === 'brands' ? 'Brand Name' : 'Category Name'}</th>
                <th className="py-3.5 px-4 w-[18%]">Status</th>
                <th className="py-3.5 px-4 w-[12%]">Created Date</th>
                <th className="py-3.5 px-4 w-[8%] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {activeTab === 'brands' ? (
                loadingBrands ? (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-gray-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                        <p className="font-medium text-xs">Loading brands...</p>
                      </div>
                    </td>
                  </tr>
                ) : brands.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-gray-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Tag className="w-8 h-8 text-gray-300" />
                        <p className="font-semibold text-gray-600">No brands found</p>
                        <p className="text-[11px] text-gray-400">
                          {brandSearch || brandStatusFilter
                            ? 'Try clearing your filters'
                            : 'Click "+ Add Brand" above to register your first brand'}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  brands.map((brand, idx) => {
                    const isActive = (brand.status || '').toLowerCase() === 'active';
                    const isUpdatingThis = brandStatusUpdatingId === brand.brand_id;
                    const code = brand.brand_code || `BRD${String(brand.brand_id).padStart(3, '0')}`;
                    const displayIndex = (brandPage - 1) * brandLimit + idx + 1;

                    return (
                      <tr key={brand.brand_id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 text-center font-mono text-gray-400 text-[11px]">
                          {displayIndex}
                        </td>
                        <td className="py-3.5 px-4 truncate">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200/80 font-mono font-bold text-xs">
                            <Hash className="w-3 h-3 text-blue-500" />
                            {code}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-gray-900 truncate">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                              {(brand.brand_name?.[0] || 'B').toUpperCase()}
                            </div>
                            <span className="text-sm font-semibold text-gray-900 truncate" title={brand.brand_name}>
                              {brand.brand_name}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleToggleBrandStatus(brand)}
                              disabled={isUpdatingThis}
                              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                isActive ? 'bg-emerald-500' : 'bg-slate-300'
                              } ${isUpdatingThis ? 'opacity-50 cursor-wait' : ''}`}
                              title={isActive ? 'Click to make Inactive' : 'Click to make Active'}
                            >
                              <span
                                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                                  isActive ? 'translate-x-4' : 'translate-x-0'
                                }`}
                              />
                            </button>
                            <span
                              className={`text-xs font-semibold ${
                                isActive ? 'text-emerald-700' : 'text-slate-500'
                              }`}
                            >
                              {isUpdatingThis ? 'Updating...' : brand.status || (isActive ? 'Active' : 'Inactive')}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-gray-500 text-xs truncate">
                          {brand.created_At || brand.created_at
                            ? new Date(brand.created_At || brand.created_at).toLocaleDateString('en-IN', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })
                            : '—'}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenBrandModal(brand)}
                              className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                              title="Edit Brand"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteBrand(brand)}
                              className="p-1.5 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                              title="Delete Brand"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )
              ) : (
                /* CATEGORIES TABLE */
                loadingCategories ? (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-gray-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                        <p className="font-medium text-xs">Loading categories...</p>
                      </div>
                    </td>
                  </tr>
                ) : categories.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-gray-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <FolderTree className="w-8 h-8 text-gray-300" />
                        <p className="font-semibold text-gray-600">No categories found</p>
                        <p className="text-[11px] text-gray-400">
                          {categorySearch || categoryStatusFilter
                            ? 'Try clearing your filters'
                            : 'Click "+ Add Category" above to register your first category'}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  categories.map((cat, idx) => {
                    const isActive = (cat.status || '').toLowerCase() === 'active';
                    const isUpdatingThis = categoryStatusUpdatingId === cat.category_id;
                    const code = cat.category_code || `CAT${String(cat.category_id).padStart(3, '0')}`;
                    const displayIndex = (categoryPage - 1) * categoryLimit + idx + 1;

                    return (
                      <tr key={cat.category_id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 text-center font-mono text-gray-400 text-[11px]">
                          {displayIndex}
                        </td>
                        <td className="py-3.5 px-4 truncate">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200/80 font-mono font-bold text-xs">
                            <Hash className="w-3 h-3 text-indigo-500" />
                            {code}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-gray-900 truncate">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                              {(cat.category_name?.[0] || 'C').toUpperCase()}
                            </div>
                            <span className="text-sm font-semibold text-gray-900 truncate" title={cat.category_name}>
                              {cat.category_name}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleToggleCategoryStatus(cat)}
                              disabled={isUpdatingThis}
                              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                isActive ? 'bg-emerald-500' : 'bg-slate-300'
                              } ${isUpdatingThis ? 'opacity-50 cursor-wait' : ''}`}
                              title={isActive ? 'Click to make Inactive' : 'Click to make Active'}
                            >
                              <span
                                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                                  isActive ? 'translate-x-4' : 'translate-x-0'
                                }`}
                              />
                            </button>
                            <span
                              className={`text-xs font-semibold ${
                                isActive ? 'text-emerald-700' : 'text-slate-500'
                              }`}
                            >
                              {isUpdatingThis ? 'Updating...' : cat.status || (isActive ? 'Active' : 'Inactive')}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-gray-500 text-xs truncate">
                          {cat.created_At || cat.created_at
                            ? new Date(cat.created_At || cat.created_at).toLocaleDateString('en-IN', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })
                            : '—'}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenCategoryModal(cat)}
                              className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                              title="Edit Category"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteCategory(cat)}
                              className="p-1.5 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                              title="Delete Category"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {activeTab === 'brands' && !loadingBrands && brandPagination.totalItems > 0 && (
          <Pagination
            currentPage={brandPagination.currentPage}
            totalPages={brandPagination.totalPages}
            totalItems={brandPagination.totalItems}
            pageSize={brandPagination.pageSize}
            onPageChange={(page) => setBrandPage(page)}
            onPageSizeChange={(limit) => {
              setBrandLimit(limit);
              setBrandPage(1);
            }}
          />
        )}
        {activeTab === 'categories' && !loadingCategories && categoryPagination.totalItems > 0 && (
          <Pagination
            currentPage={categoryPagination.currentPage}
            totalPages={categoryPagination.totalPages}
            totalItems={categoryPagination.totalItems}
            pageSize={categoryPagination.pageSize}
            onPageChange={(page) => setCategoryPage(page)}
            onPageSizeChange={(limit) => {
              setCategoryLimit(limit);
              setCategoryPage(1);
            }}
          />
        )}
      </div>

      {/* 🌟 4. ADD / EDIT BRAND MODAL */}
      {isBrandModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                  <Tag className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">
                    {editingBrand ? 'Edit Brand' : 'Add New Brand'}
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    {editingBrand ? 'Update brand details' : 'Register brand with auto-active status'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleCloseBrandModal}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleBrandSubmit} className="p-6 space-y-4 text-xs">
              {brandFormError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span className="font-medium leading-relaxed">{brandFormError}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-700">Brand Code</label>
                <div className="relative">
                  <Hash className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="e.g. BRD001"
                    value={brandCodeInput}
                    onChange={handleBrandCodeChange}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-gray-900 font-mono font-bold transition uppercase"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-700">
                  Brand Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Tata, Finolex, Havells, Schneider"
                  value={brandNameInput}
                  onChange={handleBrandNameChange}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-gray-900 font-medium transition"
                  autoFocus
                />
              </div>

              {!editingBrand && (
                <div className="p-2.5 bg-emerald-50/60 border border-emerald-200/60 rounded-xl text-[11px] text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>New brands will be created as <strong>Active</strong> by default.</span>
                </div>
              )}

              <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleCloseBrandModal}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingBrand}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-sm transition disabled:opacity-50 cursor-pointer"
                >
                  {submittingBrand && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingBrand ? 'Save Changes' : 'Create Brand'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🌟 5. ADD / EDIT CATEGORY MODAL */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
                  <FolderTree className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">
                    {editingCategory ? 'Edit Category' : 'Add New Category'}
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    {editingCategory ? 'Update category details' : 'Register category with auto-active status'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleCloseCategoryModal}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCategorySubmit} className="p-6 space-y-4 text-xs">
              {categoryFormError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span className="font-medium leading-relaxed">{categoryFormError}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-700">Category Code</label>
                <div className="relative">
                  <Hash className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="e.g. CAT001"
                    value={categoryCodeInput}
                    onChange={handleCategoryCodeChange}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-gray-900 font-mono font-bold transition uppercase"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-700">
                  Category Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Electronics, Hardware, Cables, Sanitary"
                  value={categoryNameInput}
                  onChange={handleCategoryNameChange}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-gray-900 font-medium transition"
                  autoFocus
                />
              </div>

              {!editingCategory && (
                <div className="p-2.5 bg-emerald-50/60 border border-emerald-200/60 rounded-xl text-[11px] text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>New categories will be created as <strong>Active</strong> by default.</span>
                </div>
              )}

              <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleCloseCategoryModal}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingCategory}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-sm transition disabled:opacity-50 cursor-pointer"
                >
                  {submittingCategory && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingCategory ? 'Save Changes' : 'Create Category'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🌟 5. DELETE CONFIRMATION MODAL */}
      <DeleteConfirmation
        isOpen={deleteModalOpen}
        onClose={() => {
          if (!deleteLoading) {
            setDeleteModalOpen(false);
            setItemToDelete(null);
          }
        }}
        onConfirm={handleConfirmDelete}
        title={deleteType === 'brand' ? 'Delete Brand?' : 'Delete Category?'}
        itemName={
          deleteType === 'brand'
            ? itemToDelete?.brand_name
            : itemToDelete?.category_name
        }
        message={`Are you sure you want to delete this ${deleteType}? This action cannot be undone.`}
        loading={deleteLoading}
      />
    </div>
  );
};
