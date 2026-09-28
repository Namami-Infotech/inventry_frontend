import React from 'react';
import { Users, X } from 'lucide-react';

export const EmployeeModal = ({
  isOpen,
  editingId,
  formData,
  formError,
  submitting,
  roles = [],
  onChange,
  onClose,
  onSubmit,
}) => {
  if (!isOpen) return null;

  const inputClass =
    'w-full border border-gray-300 rounded-xl p-2.5 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs';

  const selectClass =
    'w-full border border-gray-300 rounded-xl p-2.5 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs';

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex justify-center items-center p-4 z-50 animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden border border-gray-200 animate-in zoom-in-95 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex justify-between items-center px-5 py-4 bg-gray-900 text-white shrink-0">
          <h2 className="text-sm font-bold flex items-center gap-2">
            <Users size={16} />
            {editingId ? 'Edit Employee Details' : 'Register New Employee'}
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-800 transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} className="p-5 space-y-4 text-xs overflow-y-auto custom-scrollbar flex-1">
          
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Employee Code */}
            <div>
              <label className="block font-medium text-gray-700 mb-1">
                Employee Code {editingId ? '' : '(Auto-assigned)'}
              </label>
              <input
                type="text"
                name="employee_code"
                placeholder={editingId ? '' : 'Auto-generating...'}
                value={formData.employee_code || ''}
                readOnly
                disabled
                className={`${inputClass} bg-gray-100 text-gray-600 font-semibold cursor-not-allowed`}
              />
            </div>

            {/* Full Name */}
            <div>
              <label className="block font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                name="employee_name"
                placeholder="Full Name"
                value={formData.employee_name || ''}
                onChange={onChange}
                required
                className={inputClass}
              />
            </div>

            {/* Email */}
            <div>
              <label className="block font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                name="email_id"
                placeholder="email@company.com"
                value={formData.email_id || ''}
                required
                onChange={onChange}
                className={inputClass}
              />
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block font-medium text-gray-700 mb-1">
                Mobile Number *
              </label>
              <input
                type="text"
                name="mobile_number"
                placeholder="10-digit Mobile Number"
                value={formData.mobile_number || ''}
                required
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^\d{0,10}$/.test(value)) {
                    onChange(e);
                  }
                }}
                maxLength={10}
                inputMode="numeric"
                className={inputClass}
              />
            </div>

            {/* System Role */}
            <div>
              <label className="block font-medium text-gray-700 mb-1">
                System Role *
              </label>
              <select
                name="role"
                value={formData.role || ''}
                onChange={onChange}
                required
                className={selectClass}
              >
                <option value="">-- Select Role --</option>
                {roles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>

            {/* Department */}
            <div>
              <label className="block font-medium text-gray-700 mb-1">
                Department
              </label>
              <input
                type="text"
                name="department"
                placeholder="e.g. Production, Store, Sales, Operations"
                value={formData.department || ''}
                onChange={onChange}
                className={inputClass}
              />
            </div>

            {/* Designation */}
            <div>
              <label className="block font-medium text-gray-700 mb-1">
                Designation
              </label>
              <input
                type="text"
                name="designation"
                placeholder="e.g. Senior Shift Incharge, Quality Operator"
                value={formData.designation || ''}
                onChange={onChange}
                className={inputClass}
              />
            </div>

            {/* Joining Date */}
            <div>
              <label className="block font-medium text-gray-700 mb-1">
                Joining Date
              </label>
              <input
                type="date"
                name="joining_date"
                value={formData.joining_date ? String(formData.joining_date).split('T')[0] : ''}
                onChange={onChange}
                className={inputClass}
              />
            </div>

            {/* Address */}
            <div className="md:col-span-2">
              <label className="block font-medium text-gray-700 mb-1">
                Address
              </label>
              <textarea
                name="address"
                rows={2}
                placeholder="Residential or work location address"
                value={formData.address || ''}
                onChange={onChange}
                className={inputClass}
              />
            </div>

            {/* Password */}
            <div className="md:col-span-2">
              <label className="block font-medium text-gray-700 mb-1">
                {editingId
                  ? 'Password (Leave Blank to Keep Current)'
                  : 'Login Password'}
              </label>
              <input
                type="password"
                name="password_hash"
                placeholder="••••••••"
                value={formData.password_hash || ''}
                onChange={onChange}
                className={inputClass}
              />
              {!editingId && (
                <span className="text-[10px] text-gray-400 mt-0.5 block">
                  Defaults to 123456 if left blank
                </span>
              )}
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
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
              className="px-5 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 transition cursor-pointer"
            >
              {submitting
                ? 'Saving...'
                : editingId
                ? 'Update Employee'
                : 'Create Employee'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};