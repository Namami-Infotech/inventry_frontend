import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  ShoppingBag,
  Package,
  Truck,
  UserCheck,
  ClipboardList,
  Cpu,
  Boxes,
  FileText,
  X,
  ChevronDown,
  ChevronRight,
  Store,
  Box,
  ScrollText,
  RotateCcw,
  BarChart3,
  Layers,
  Building2,
  CalendarCheck
} from "lucide-react";
import { useNavigate, useLocation, Routes, Route, Navigate } from "react-router-dom";
import { Navbar } from "../components/Navbar";

// Core Modules
import { DashboardPage } from "../feature/dashboard/pages/DashboardPage";
import { ReportsPage } from "../feature/dashboard/pages/ReportsPage";
import { ProjectListPage } from "../feature/project/pages/ProjectListPage";
import { ProjectDetailPage } from "../feature/project/pages/ProjectDetailPage";
import { MachineListPage } from "../feature/machine/pages/MachineListPage";
import { PlanningListPage } from "../feature/planning/pages/PlanningListPage";
import { MaterialRequestListPage } from "../feature/materialRequest/pages/MaterialRequestListPage";
import { MaterialDispatchListPage } from "../feature/materialDispatch/pages/MaterialDispatchListPage";
import { ProductionListPage } from "../feature/production/pages/ProductionListPage";
import { DeliveryList } from "../feature/delivery/pages/DeliveryList";
import { CreateDeliveryPage } from "../feature/delivery/pages/CreateDeliveryPage";
import { PurchaseListPage } from "../feature/purchase/pages/PurchaseListPage";
import { PurchaseEntryPage } from "../feature/purchase/pages/purchaseEntryPage";
import { StorePage } from "../feature/storeItems/pages/storePage";
import { ClientListPage } from "../feature/client/pages/clientPage";
import { ClientDetailPage } from "../feature/client/pages/clientDetailsPage";
import { EmployeeListPage } from "../feature/employee/pages/EmployeeListPage";
import { UserProfilePage } from "../feature/employee/pages/UserProfilePage";

// Auxiliary / Backward Compatibility
import { QuotationListPage } from "../feature/quotation/pages/QuotationListPage";
import { SalesOrderPage } from "../feature/sales/pages/salesOrderPage";
import { ChallanListPage } from "../feature/challan/pages/ChallanListPage";
import { CreateChallanPage } from "../feature/challan/pages/CreateChallanPage";
import { BrandListPage } from "../feature/brand/pages/BrandListPage";

const MainModule = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState({ Store: true });

  const getStoredUser = () => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch (e) {
      return null;
    }
  };

  const currentUser = getStoredUser();
  const rawRole = (currentUser?.role || currentUser?.Role || "").trim();
  const rawLower = rawRole.toLowerCase();

  // Normalize role
  let normalizedRole = "operator";
  if (rawLower.includes("admin")) normalizedRole = "admin";
  else if (rawLower === "manager") normalizedRole = "manager";
  else if (rawLower.includes("sales") || rawLower.includes("order")) normalizedRole = "sales manager";
  else if (rawLower.includes("store") || rawLower.includes("warehouse")) normalizedRole = "store manager";
  else if (rawLower.includes("shift") || rawLower.includes("incharge") || rawLower.includes("engineer")) normalizedRole = "shift incharge";
  else if (rawLower.includes("operator")) normalizedRole = "operator";

  const displayRole = currentUser?.role || "User";

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const user = getStoredUser();

    if (!token || !user) {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  // Auto-close sidebar on route changes on mobile
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  // Complete Menu definition matching 6 Roles
  const menuItems = [
    {
      name: "Dashboard",
      path: "dashboard",
      icon: LayoutDashboard,
      allowedRoles: ["admin", "manager", "sales manager", "store manager", "shift incharge", "operator"]
    },
    {
      name: "Products",
      path: "projects",
      icon: Boxes,
      allowedRoles: ["admin", "manager", "sales manager", "shift incharge"]
    },
    {
      name: "Planning",
      path: "planning",
      icon: CalendarCheck,
      allowedRoles: ["admin", "manager", "shift incharge"]
    },
    {
      name: "Material Requests",
      path: "material-requests",
      icon: ClipboardList,
      allowedRoles: ["admin", "manager", "store manager", "shift incharge"]
    },
    // {
    //   name: "Material Dispatch",
    //   path: "material-dispatches",
    //   icon: Truck,
    //   allowedRoles: ["admin", "manager", "store manager", "shift incharge"]
    // },
    {
      name: "Production",
      path: "production",
      icon: Cpu,
      allowedRoles: ["admin", "manager", "shift incharge", "operator"]
    },
    {
      name: "Delivery",
      path: "delivery",
      icon: Truck,
      allowedRoles: ["admin", "manager", "sales manager", "store manager"]
    },
    {
      name: "Machines",
      path: "machines",
      icon: Cpu,
      allowedRoles: ["admin", "manager", "shift incharge", "operator"]
    },
    {
      name: "Purchase",
      path: "purchase",
      icon: ShoppingCart,
      allowedRoles: ["admin", "manager", "store manager"]
    },
    {
      name: "Store & Inventory",
      path: "store",
      icon: Store,
      allowedRoles: ["admin", "manager", "store manager"]
    },
    {
      name: "Clients & Vendors",
      path: "clients",
      icon: Users,
      allowedRoles: ["admin", "manager", "sales manager", "store manager"]
    },
    {
      name: "Sales Orders",
      path: "sales-orders",
      icon: ShoppingBag,
      allowedRoles: ["admin", "manager", "sales manager", "store manager"]
    },
    // {
    //   name: "Challans",
    //   path: "challan",
    //   icon: ScrollText,
    //   allowedRoles: ["admin", "manager", "sales manager", "store manager"]
    // },
    {
      name: "Reports",
      path: "reports",
      icon: BarChart3,
      allowedRoles: ["admin", "manager", "sales manager"]
    },
    {
      name: "Employees",
      path: "employees",
      icon: UserCheck,
      allowedRoles: ["admin"]
    }
  ];

  // Filter menu items by user role (admin sees all, case-insensitive check)
  const visibleMenuItems = menuItems.filter((item) => {
    if (normalizedRole === "admin") return true;
    if (!item.allowedRoles || item.allowedRoles.length === 0) return true;
    return item.allowedRoles.some(r => (r || "").toLowerCase().trim() === normalizedRole.toLowerCase().trim());
  });

  const currentSubPath = location.pathname.replace(/^\/pages\/mainModule\/?/, "");
  const isProfileActive = currentSubPath === "profile" || location.pathname.endsWith("/profile");

  const toggleSubMenu = (menuName) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [menuName]: !prev[menuName]
    }));
  };

  const getActiveTabTitle = () => {
    if (
      location.pathname === "/pages/mainModule" ||
      location.pathname === "/pages/mainModule/"
    ) {
      return "Dashboard";
    }
    if (isProfileActive) return "User Profile";

    for (const item of menuItems) {
      if (
        item.path &&
        (currentSubPath === item.path || currentSubPath.startsWith(`${item.path}/`))
      ) {
        return item.name;
      }
    }
    return "Dashboard";
  };

  const activeTab = getActiveTabTitle();

  return (
    <div className="flex h-screen overflow-hidden bg-slate-900 text-xs">
      {/* Mobile Drawer Backdrop Overlay */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 lg:hidden transition-opacity duration-300"
        />
      )}

      {/* Sidebar Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 sm:w-72 lg:w-64 bg-slate-900 text-white p-3.5 flex flex-col h-screen border-r border-slate-800 shrink-0 transform transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${isSidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
          }`}
      >
        {/* Sidebar Header */}
        <div className="px-2.5 py-3 mb-2 shrink-0 flex items-center justify-between border-b border-slate-800/80">
          <div>
            <h2 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></span>
              Manufacturing ERP
            </h2>
            <p className="text-[10px] text-slate-400 font-medium">Production & Operations</p>
          </div>

          {/* Close button on mobile */}
          <button
            type="button"
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Menu Items */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-1 min-h-0 custom-scrollbar">
          {visibleMenuItems.map((item) => {
            const Icon = item.icon;
            const isParentActive =
              currentSubPath === item.path ||
              currentSubPath.startsWith(`${item.path}/`);

            return (
              <button
                key={item.name}
                type="button"
                onClick={() => {
                  navigate(`/pages/mainModule/${item.path}`);
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer text-xs font-semibold ${isParentActive
                  ? "bg-blue-600 text-white shadow-md shadow-blue-900/40"
                  : "hover:bg-slate-800 text-slate-300 hover:text-white"
                  }`}
              >
                <Icon size={16} className={isParentActive ? "text-white" : "text-slate-400"} />
                <span className="truncate">{item.name}</span>
              </button>
            );
          })}
        </div>

        {/* Sidebar Bottom Profile Card */}
        {currentUser && (
          <div
            onClick={() => {
              navigate("/pages/mainModule/profile");
              setIsSidebarOpen(false);
            }}
            className={`mt-2 pt-2.5 border-t border-slate-800/80 cursor-pointer p-2 rounded-xl transition-all shrink-0 ${isProfileActive
              ? "bg-blue-600/25 border-blue-500/40 ring-1 ring-blue-500/50"
              : "hover:bg-slate-800/60"
              }`}
            title="Click to view User Profile"
          >
            <div className="flex items-center gap-2.5">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-xs shrink-0 shadow-md ${isProfileActive
                  ? "bg-blue-500 ring-2 ring-white/30"
                  : "bg-gradient-to-br from-blue-500 to-indigo-600"
                  }`}
              >
                {(currentUser.employee_name || currentUser.name || "U")[0]?.toUpperCase()}
              </div>
              <div className="overflow-hidden space-y-0.5 min-w-0">
                <p className="text-xs font-semibold text-white truncate">
                  {currentUser.employee_name || currentUser.name || "Employee"}
                </p>
                <p className="text-[10px] text-blue-400 font-medium truncate capitalize">
                  {displayRole}
                </p>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden bg-gray-50 text-slate-800">
        {/* Top Header Navbar */}
        <Navbar
          activeTab={activeTab}
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
          isSidebarOpen={isSidebarOpen}
        />

        {/* Viewport Content */}
        <div className="flex-1 p-3.5 sm:p-5 md:p-6 overflow-y-auto overflow-x-hidden">
          <Routes>
            <Route index element={<Navigate to="dashboard" replace />} />

            {/* Core Manufacturing Workflow Routes */}
            <Route path="dashboard" element={<DashboardPage />} />

            {/* Product Management */}
            <Route path="projects" element={<ProjectListPage />} />
            <Route path="projects/:id" element={<ProjectDetailPage />} />
            <Route path="products" element={<ProjectListPage />} />
            <Route path="products/:id" element={<ProjectDetailPage />} />

            {/* Production Planning */}
            <Route path="planning" element={<PlanningListPage />} />

            {/* Material Requisition & Dispatch */}
            <Route path="material-requests" element={<MaterialRequestListPage />} />
            <Route path="material-dispatches" element={<MaterialDispatchListPage />} />

            {/* Production Floor */}
            <Route path="production" element={<ProductionListPage />} />

            {/* Delivery Management */}
            <Route
              path="delivery"
              element={
                <DeliveryList
                  onAddNew={() => navigate("/pages/mainModule/delivery/new")}
                />
              }
            />
            <Route
              path="delivery/new"
              element={
                <CreateDeliveryPage
                  onBack={() => navigate("/pages/mainModule/delivery")}
                  onSuccess={() => navigate("/pages/mainModule/delivery")}
                />
              }
            />

            {/* Machines Management */}
            <Route path="machines" element={<MachineListPage />} />

            {/* Purchase Management */}
            <Route
              path="purchase"
              element={
                <PurchaseListPage
                  onOpenCreate={() => navigate("/pages/mainModule/purchase/new")}
                />
              }
            />
            <Route
              path="purchase/new"
              element={
                <PurchaseEntryPage
                  onCancel={() => navigate("/pages/mainModule/purchase")}
                  onSaveSuccess={() => navigate("/pages/mainModule/purchase")}
                />
              }
            />

            {/* Store & Inventory */}
            <Route path="store" element={<StorePage />} />
            <Route path="store/store-master" element={<StorePage />} />
            <Route path="store/finished-goods" element={<StorePage />} />

            {/* Clients & Vendors */}
            <Route path="clients" element={<ClientListPage />} />
            <Route path="clients/:clientId" element={<ClientDetailPage />} />

            {/* Reports */}
            <Route path="reports" element={<ReportsPage />} />

            {/* Employees */}
            <Route path="employees" element={<EmployeeListPage />} />

            {/* Quotations & Sales Orders (Auxiliary / Backward Compatibility) */}
            <Route path="quotations" element={<QuotationListPage />} />
            <Route path="sales-orders" element={<SalesOrderPage />} />
            <Route
              path="challan"
              element={
                <ChallanListPage
                  onOpenCreate={() => navigate("/pages/mainModule/challan/new")}
                />
              }
            />
            <Route
              path="challan/new"
              element={
                <CreateChallanPage
                  onBack={() => navigate("/pages/mainModule/challan")}
                  onSuccess={() => navigate("/pages/mainModule/challan")}
                />
              }
            />
            <Route path="brands" element={<BrandListPage />} />

            {/* User Profile */}
            <Route path="profile" element={<UserProfilePage />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default MainModule;