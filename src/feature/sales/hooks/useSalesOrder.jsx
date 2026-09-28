import { useState, useEffect, useMemo } from 'react';
import { fetchSalesOrders, updateSalesOrder } from '../../client/services/salesOrderService';

export const useSalesOrder = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 1
  });

  // Global Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Inline Column Header Filters state
  const [inlineFilters, setInlineFilters] = useState({
    orderId: '',
    clientName: '',
    projectIncharge: '',
    poDate: '',
    poNo: '',
    status: '',
  });

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await fetchSalesOrders({
        page,
        limit,
        search: searchQuery || undefined
      });
      const data = res?.data ?? res;
      setOrders(Array.isArray(data) ? data : []);
      if (res?.pagination) {
        setPagination(res.pagination);
      } else {
        setPagination({
          currentPage: page,
          pageSize: limit,
          totalItems: Array.isArray(data) ? data.length : 0,
          totalPages: Math.ceil((Array.isArray(data) ? data.length : 0) / limit) || 1
        });
      }
    } catch (err) {
      console.error('Error fetching sales orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [page, limit, searchQuery]);

  const handleSearchChange = (query) => {
    setSearchQuery(query);
    setPage(1);
  };

  const setInlineFilter = (field, value) => {
    setInlineFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const clearInlineFilters = () => {
    setInlineFilters({
      orderId: '',
      clientName: '',
      projectIncharge: '',
      poDate: '',
      poNo: '',
      status: '',
    });
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // 1. Global Search: Strictly Search by Client Name
      const q = searchQuery.toLowerCase().trim();
      const clientName = (order.clientName ?? '').toString().toLowerCase();
      if (q && !clientName.includes(q)) {
        return false;
      }

      // 2. Inline Column Header Filters
      // Order ID (e.g. "12", "SO-12")
      if (inlineFilters.orderId) {
        const targetId = inlineFilters.orderId.toLowerCase().replace(/^so-?/i, '').trim();
        const orderIdStr = String(order.Id ?? order.orderId ?? '').toLowerCase();
        const formattedSo = `so-${orderIdStr}`;
        if (!orderIdStr.includes(targetId) && !formattedSo.includes(inlineFilters.orderId.toLowerCase().trim())) {
          return false;
        }
      }

      // Client Name
      if (inlineFilters.clientName) {
        const targetClient = inlineFilters.clientName.toLowerCase().trim();
        if (!clientName.includes(targetClient)) {
          return false;
        }
      }

      // Order Type
      if (inlineFilters.orderType) {
        const targetType = inlineFilters.orderType.toLowerCase().trim();
        const oType = String(order.orderType || order.order_type || '').toLowerCase();
        const pName = String(order.projectName || order.project_name || '').toLowerCase();
        const incharge = String(order.projectIncharge || '').toLowerCase();

        let isInHouse = false;
        if (oType === 'in_house' || pName.startsWith('in-house') || incharge.includes('in-house') || Boolean(order.is_in_house_manufacturing)) {
          isInHouse = true;
        } else {
          const items = Array.isArray(order.items) ? order.items : [];
          let hasInHouseItem = false;
          let hasSiteItem = false;
          items.forEach((it) => {
            const mode = String(it.fulfilment_mode || it.fulfilmentMode || '').toLowerCase();
            const name = String(it.productName || it.item_name || it.itemName || '').toLowerCase();
            if (mode === 'in_house_manufacturing' || mode === 'in_house' || name.includes('pump') || name.includes('light') || name.includes('keyboard')) {
              hasInHouseItem = true;
            } else if (mode === 'site_assembly' || name.includes('solar system') || name.includes('laptop') || name.includes('pc') || name.includes('water system') || name.includes('123445')) {
              hasSiteItem = true;
            }
          });
          if (hasInHouseItem && !hasSiteItem) {
            isInHouse = true;
          }
        }
        const typeLabel = isInHouse ? 'in-house' : 'site project';
        if (!typeLabel.includes(targetType)) {
          return false;
        }
      }

      // Site Engineer / Project Incharge
      if (inlineFilters.siteEngineer || inlineFilters.projectIncharge) {
        const targetIncharge = (inlineFilters.siteEngineer || inlineFilters.projectIncharge).toLowerCase().trim();
        const inchargeName = (order.projectIncharge ?? '').toString().toLowerCase();
        if (!inchargeName.includes(targetIncharge)) {
          return false;
        }
      }

      // PO Date
      if (inlineFilters.poDate) {
        const targetDate = inlineFilters.poDate.toLowerCase().trim();
        const rawDate = (order.poDate ?? '').toString();
        const formattedDate = order.poDate ? new Date(order.poDate).toLocaleDateString('en-GB') : '';
        if (!rawDate.includes(targetDate) && !formattedDate.toLowerCase().includes(targetDate)) {
          return false;
        }
      }

      // PO Number
      if (inlineFilters.poNo) {
        const targetPo = inlineFilters.poNo.toLowerCase().trim();
        const poNo = (order.poNo ?? order.poNumber ?? '').toString().toLowerCase();
        if (!poNo.includes(targetPo)) {
          return false;
        }
      }

      // Status
      if (inlineFilters.status) {
        const targetStatus = inlineFilters.status.toLowerCase().trim();
        const status = (order.status ?? '').toString().toLowerCase();
        if (!status.includes(targetStatus)) {
          return false;
        }
      }

      return true;
    });
  }, [orders, searchQuery, inlineFilters]);

  const addOrder = (newOrder) => {
    setOrders((prev) => [newOrder, ...prev]);
  };

  const updateOrderStatus = async (orderId, status) => {
    const previousOrders = orders;

    setOrders((prev) => prev.map((order) => (
      (order.Id ?? order.orderId) === orderId ? { ...order, status } : order
    )));

    try {
      await updateSalesOrder(orderId, { status });
    } catch (err) {
      setOrders(previousOrders);
      console.error('Error updating sales order status:', err);
    }
  };

  const resetFilters = () => {
    setSearchQuery('');
    clearInlineFilters();
    setPage(1);
  };

  return {
    orders: filteredOrders,
    rawOrders: orders,
    loading,
    searchQuery,
    setSearchQuery: handleSearchChange,
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
    loadOrders,
  };
};