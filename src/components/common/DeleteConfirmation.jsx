// src/components/common/DeleteConfirmation.jsx
import React from 'react';
import { AlertTriangle, Trash2, Loader2, X } from 'lucide-react';

export const DeleteConfirmation = ({
  open,
  isOpen,
  title = 'Confirm Deletion',
  itemName = '',
  message,
  onConfirm,
  onCancel,
  loading = false,
  isDeleting,
  confirmText = 'Delete',
  cancelText = 'Cancel'
}) => {
  const isVisible = open !== undefined ? open : isOpen;
  const isLoading = loading || isDeleting;

  if (!isVisible) return null;

  const defaultMessage = itemName ? (
    <>
      Are you sure you want to delete <span className="font-semibold text-gray-900">"{itemName}"</span>? This action cannot be undone.
    </>
  ) : (
    'Are you sure you want to delete this record? This action cannot be undone.'
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden transform transition-all border border-gray-100"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 shrink-0">
              <AlertTriangle size={20} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900">
                {title}
              </h3>
              <p className="text-xs text-gray-500">Please confirm your action</p>
            </div>
          </div>
          {!isLoading && (
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition cursor-pointer"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="p-4 sm:p-5 text-sm text-gray-600">
          {message || defaultMessage}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-4 sm:px-5 py-3.5 bg-gray-50 border-t border-gray-100">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition disabled:opacity-60 shadow-sm cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 size={16} />
                <span>{confirmText}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmation;
