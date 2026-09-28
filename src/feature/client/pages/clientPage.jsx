// src/features/clients/pages/ClientListPage.jsx

import React from 'react';
import { useClients } from '../hooks/useClient';
import { ClientFilters } from '../componenets/clientFilter';
import { ClientTable } from '../componenets/clientTable';
import { ClientQuickDrawer } from '../componenets/clientQuickDrawer';
import { ClientFormModal } from '../componenets/clientFormodel';
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import Pagination from '../../../components/common/pagination';

export const ClientListPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    clients,
    searchQuery,
    setSearchQuery,
    inlineFilters,
    setInlineFilter,
    clearInlineFilters,
    page,
    setPage,
    limit,
    setLimit,
    pagination,
    selectedClient,
    isDrawerOpen,
    isModalOpen,
    editingClient,
    handleOpenDrawer,
    handleCloseDrawer,
    handleOpenCreateModal,
    handleOpenEditModal,
    handleCloseModal,
    handleSaveClient,
  } = useClients();

  useEffect(() => {
    if(location.state?.fromDrawer && location.state.clientId){
      const client = clients.find(
        c => c.id === location.state.clientId
      );

      if(client){
        handleOpenDrawer(client);
      }
    }
  }, [location, clients]);

  const handleNavigateToDetail = (clientId) => {
    navigate(`/pages/mainModule/clients/${clientId}`);
  };

  const hasAnyFilter = Boolean(
    searchQuery ||
    inlineFilters?.companyName ||
    inlineFilters?.role ||
    inlineFilters?.gstIn ||
    inlineFilters?.contactPerson ||
    inlineFilters?.status
  );

  const handleClearAllFilters = () => {
    setSearchQuery('');
    clearInlineFilters();
    setPage(1);
  };

  return (
    <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Clients & Vendors</h1>
          <p className="text-xs sm:text-sm text-gray-500">Manage client and vendor business profiles, GSTIN, and contact details.</p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg text-xs sm:text-sm font-semibold hover:bg-blue-700 shadow-sm transition text-center cursor-pointer"
        >
          + Add Client / Vendor
        </button>
      </div>

      {/* Global Filter Bar */}
      <ClientFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        hasActiveFilters={hasAnyFilter}
        onClearAll={handleClearAllFilters}
      />

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col overflow-hidden">
        {/* Main Table with Inline Header Filters */}
        <div className="flex-1 min-h-0">
          <ClientTable
            clients={clients}
            inlineFilters={inlineFilters}
            setInlineFilter={setInlineFilter}
            clearInlineFilters={clearInlineFilters}
            onRowClick={handleOpenDrawer}
            onEditClick={handleOpenEditModal}
          >
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              totalItems={pagination.totalItems}
              pageSize={pagination.pageSize}
              onPageChange={setPage}
              onPageSizeChange={(newSize) => {
                setLimit(newSize);
                setPage(1);
              }}
            />
          </ClientTable>
        </div>
      </div>

      {/* Slide-over Side Drawer */}
      <ClientQuickDrawer
        isOpen={isDrawerOpen}
        client={selectedClient}
        onClose={handleCloseDrawer}
        onViewFullProfile={handleNavigateToDetail}
      />

      {/* Form Modal */}
      <ClientFormModal
        isOpen={isModalOpen}
        initialData={editingClient}
        onClose={handleCloseModal}
        onSubmit={handleSaveClient}
      />
    </div>
  );
};