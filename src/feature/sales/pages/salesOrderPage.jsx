import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useSalesOrder } from '../hooks/useSalesOrder';
import { SalesOrderFilter } from '../component/salesOrderFilter';
import { SalesOrderTable } from '../component/salesOrderTable';
import { getClients } from "../../client/services/clientService";
import { createSalesOrder } from '../../client/services/salesOrderService';
import Pagination from '../../../components/common/pagination';
import { ViewSalesOrderItemsModal } from '../../client/componenets/ViewSalesOrderItemsModal';
import { exportSalesOrdersReport } from '../../../utils/exportReport';

// REUSING YOUR MODAL FROM CLIENT SECTION HERE:
import { AddSalesOrderModal } from '../../client/componenets/AddSalesOrderModal';

export const SalesOrderPage = () => {
  const location = useLocation();
  const {
    orders,
    loading,
    searchQuery,
    setSearchQuery,
    inlineFilters,
    setInlineFilter,
    clearInlineFilters,
    resetFilters,
    addOrder,
    updateOrderStatus,
    page,
    setPage,
    limit,
    setLimit,
    pagination,
  } = useSalesOrder();

  // Listen to navigation state filter (e.g. from Dashboard click on Confirmed or Pending)
  useEffect(() => {
    if (location.state?.status) {
      clearInlineFilters();
      setInlineFilter('status', location.state.status);
      setSearchQuery('');
    }
  }, [location.key, location.state]);

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userRole = user.role || user.Role || '';

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [clients, setClients] = useState([]);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await getClients({ role: 'client', limit: 100 });
        const list = Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : [];
        const clientsOnly = list.filter(c => (c?.role ?? '').toString().trim().toLowerCase() === 'client');
        setClients(clientsOnly);
      } catch (err) {
        console.error('Error fetching clients for sales order:', err);
      }
    };

    fetchClients();
  }, []);

  const handleSelectOrder = (order) => {
    setSelectedOrder(order);
    setIsViewModalOpen(true);
  };

  const handleCreateSubmit = async (formData) => {
    try {
      const response = await createSalesOrder(formData);
      const createdOrder = response?.data ?? response;

      if (response?.success && response.data) {
        addOrder(response.data);
      } else if (createdOrder && typeof createdOrder === 'object') {
        addOrder(createdOrder);
      }

      setIsCreateModalOpen(false);
    } catch (error) {
      console.error('Failed to create sales order:', error);
    }
  };

  const hasAnyFilter = Boolean(
    searchQuery ||
    inlineFilters?.orderId ||
    inlineFilters?.clientName ||
    inlineFilters?.projectIncharge ||
    inlineFilters?.poDate ||
    inlineFilters?.poNo ||
    inlineFilters?.status
  );

  return (
    <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Sales Orders</h1>
          <p className="text-xs text-gray-500">Manage, track, and process customer sales orders</p>
        </div>
      </div>

      {/* Filter Component (Global Client Search + Clear All) */}
      <SalesOrderFilter
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        hasActiveFilters={hasAnyFilter}
        onClearAll={resetFilters}
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
        onDownloadReport={() => exportSalesOrdersReport(orders)}
      />

      {/* Table Component */}
      {loading ? (
        <div className="p-6 text-center text-xs text-gray-500">Loading sales orders...</div>
      ) : (
        <>
          <SalesOrderTable
            orders={orders}
            inlineFilters={inlineFilters}
            setInlineFilter={setInlineFilter}
            clearInlineFilters={clearInlineFilters}
            onSelectOrder={handleSelectOrder}
            onQuickView={handleSelectOrder}
            onStatusChange={updateOrderStatus}
            userRole={userRole}
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
          </SalesOrderTable>
        </>
      )}

      {/* Reused Create Sales Order Modal from client directory */}
      <AddSalesOrderModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateSubmit}
        clients={clients}
      />

      {/* View Sales Order Items Modal */}
      <ViewSalesOrderItemsModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        order={selectedOrder}
      />

      {/* View Sales Order Details Modal */}
      {/* <ViewSalesOrderModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        order={selectedOrder}
      /> */}
    </div>
  );
};