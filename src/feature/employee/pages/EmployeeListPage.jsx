import React, { useState } from 'react';
import { useEmployee } from '../hooks/useEmployee';
import { EmployeeHeader } from '../components/employeeHeader.jsx';
import { EmployeeFilter } from '../components/employeeFilter.jsx';
import { EmployeeTable } from '../components/employeeTable.jsx';
import { EmployeeModal } from '../components/EmployeeModal';
import { EmployeeViewModal } from '../components/employeeViewModal';
import Pagination from '../../../components/common/pagination';
import DeleteConfirmation from '../../../components/common/DeleteConfirmation.jsx';

export const EmployeeListPage = () => {
  const {
    employees,
    loading,
    roles,
    rolesLoading,
    searchTerm,
    setSearchTerm,
    roleFilter,
    setRoleFilter,
    statusFilter,
    setStatusFilter,
    handleClearFilters,
    page,
    setPage,
    limit,
    setLimit,
    pagination,
    isModalOpen,
    editingId,
    formData,
    formError,
    submitting,
    statusUpdatingId,
    handleFormChange,
    handleOpenModal,
    handleCloseModal,
    handleSubmit,
    handleToggleStatus,
    handleDelete,
    isViewModalOpen,
    viewingEmployee,
    handleOpenViewModal,
    handleCloseViewModal,
  } = useEmployee();

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleDeleteClick = (emp) => {
    setSelectedEmployee(emp);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedEmployee) return;
    setDeleteLoading(true);
    try {
      await handleDelete(selectedEmployee.id);
      setDeleteModalOpen(false);
      setSelectedEmployee(null);
    } catch (error) {
      alert(error.response?.data?.message || 'Error deleting employee');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
      <EmployeeHeader onAddNew={() => handleOpenModal()} />

      <EmployeeFilter
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        roleFilter={roleFilter}
        setRoleFilter={setRoleFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        roles={roles}
        onClearFilters={handleClearFilters}
      />

      <EmployeeTable
        employees={employees}
        loading={loading}
        onEdit={handleOpenModal}
        onView={handleOpenViewModal}
        onDelete={handleDeleteClick}
        onToggleStatus={handleToggleStatus}
        statusUpdatingId={statusUpdatingId}
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
      </EmployeeTable>

      <EmployeeModal
        isOpen={isModalOpen}
        editingId={editingId}
        formData={formData}
        formError={formError}
        submitting={submitting}
        roles={roles}
        onChange={handleFormChange}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
      />
      
      <EmployeeViewModal
        isOpen={isViewModalOpen}
        onClose={handleCloseViewModal}
        employee={viewingEmployee}
      />

      <DeleteConfirmation
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSelectedEmployee(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Employee"
        itemName={selectedEmployee?.employee_name}
        message="Are you sure you want to delete this employee? This action cannot be undone."
        loading={deleteLoading}
      />
    </div>
  );
};