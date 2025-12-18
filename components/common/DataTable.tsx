/**
 * DataTable - WordPress-like Reusable Table Component
 * Building block for all listing pages (Posts, Pages, Products, Orders, Users, etc.)
 * 
 * Features:
 * - Bulk actions
 * - Search & filtering
 * - Quick edit inline
 * - Row actions (Edit, Delete, View)
 * - Status filters
 * - Pagination
 * - Responsive design
 */

import React, { useState, useMemo } from 'react';
import { Search, Filter, ChevronDown, Edit, Trash2, Eye, X } from 'lucide-react';
import { DataCard } from './DataCard';

export interface Column<T> {
  key: string;
  label: string;
  width?: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
}

export interface StatusFilter {
  label: string;
  value: string;
  count: number;
  filterFn?: <T>(item: T) => boolean; // Custom filter function for complex filters
}

export interface RowAction<T> {
  label: string;
  onClick: (item: T) => void;
  className?: string;
  show?: (item: T) => boolean;
}

export interface BulkAction {
  label: string;
  value: string;
  onExecute: (selectedIds: string[]) => void;
}

export interface QuickEditField {
  key: string;
  label: string;
  type: 'text' | 'select' | 'number' | 'date';
  options?: { label: string; value: string }[];
}

export interface DataTableProps<T> {
  title: string;
  data: T[];
  columns: Column<T>[];
  idField?: string;
  onRowClick?: (item: T) => void;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  onView?: (item: T) => void;
  onNew?: () => void;
  newButtonLabel?: string;
  statusFilters?: StatusFilter[];
  filterField?: string; // Field to filter on (default: 'status', can be 'role', 'type', etc.)
  searchPlaceholder?: string;
  bulkActions?: BulkAction[];
  rowActions?: RowAction<T>[];
  quickEditFields?: QuickEditField[];
  onQuickEdit?: (item: T, updates: Record<string, any>) => void;
  emptyMessage?: string;
  showCheckboxes?: boolean;
  additionalButtons?: React.ReactNode;
}

export function DataTable<T extends Record<string, any>>({
  title,
  data,
  columns,
  idField = 'id',
  onRowClick,
  onEdit,
  onDelete,
  onView,
  onNew,
  newButtonLabel = 'Add New',
  statusFilters = [],
  filterField = 'status', // Default to 'status' field
  searchPlaceholder = 'Search...',
  bulkActions = [],
  rowActions = [],
  quickEditFields = [],
  onQuickEdit,
  emptyMessage = 'No items found.',
  showCheckboxes = true,
  additionalButtons,
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [quickEditId, setQuickEditId] = useState<string | null>(null);
  const [quickEditData, setQuickEditData] = useState<Record<string, any>>({});
  const [bulkActionValue, setBulkActionValue] = useState('');

  // Filter, search, sort, and paginate data
  const filteredData = useMemo(() => {
    let result = [...data];

    // Apply status filter
    if (activeFilter !== 'all' && statusFilters.length > 0) {
      const filterConfig = statusFilters.find(f => f.value === activeFilter);
      if (filterConfig) {
        if (filterConfig.filterFn) {
          // Use custom filter function if provided
          result = result.filter(filterConfig.filterFn);
        } else {
          // Default: filter by field value
          result = result.filter(item => {
            const fieldValue = item[filterField];
            return fieldValue === activeFilter;
          });
        }
      }
    }

    // Apply search
    if (searchTerm) {
      result = result.filter(item =>
        Object.values(item).some(val =>
          String(val).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Apply sorting
    if (sortColumn) {
      result.sort((a, b) => {
        const aVal = a[sortColumn];
        const bVal = b[sortColumn];
        
        if (aVal === bVal) return 0;
        
        const comparison = aVal > bVal ? 1 : -1;
        return sortDirection === 'asc' ? comparison : -comparison;
      });
    }

    return result;
  }, [data, activeFilter, searchTerm, statusFilters, filterField, sortColumn, sortDirection]);

  // Paginate filtered data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startItem = filteredData.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, filteredData.length);

  // Reset to first page when filters/search changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter, searchTerm]);

  // Select all toggle (current page only)
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(paginatedData.map(item => item[idField]));
    } else {
      setSelectedIds([]);
    }
  };

  // Handle column sort
  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      // Toggle direction if same column
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new column with ascending
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
  };

  // Select individual row
  const handleSelectRow = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
    }
  };

  // Execute bulk action
  const handleBulkAction = () => {
    if (!bulkActionValue || selectedIds.length === 0) return;
    const action = bulkActions.find(a => a.value === bulkActionValue);
    if (action) {
      action.onExecute(selectedIds);
      setSelectedIds([]);
      setBulkActionValue('');
    }
  };

  // Quick edit handlers
  const handleQuickEditOpen = (item: T) => {
    setQuickEditId(item[idField]);
    const initialData: Record<string, any> = {};
    quickEditFields.forEach(field => {
      initialData[field.key] = item[field.key];
    });
    setQuickEditData(initialData);
  };

  const handleQuickEditSave = () => {
    if (quickEditId && onQuickEdit) {
      const item = data.find(d => d[idField] === quickEditId);
      if (item) {
        onQuickEdit(item, quickEditData);
      }
    }
    setQuickEditId(null);
    setQuickEditData({});
  };

  const handleQuickEditCancel = () => {
    setQuickEditId(null);
    setQuickEditData({});
  };

  // Default row actions
  const defaultRowActions: RowAction<T>[] = [
    ...(onEdit ? [{
      label: 'Edit',
      onClick: onEdit,
      className: 'text-blue-600 hover:text-blue-800',
    }] : []),
    ...(quickEditFields.length > 0 ? [{
      label: 'Quick Edit',
      onClick: handleQuickEditOpen,
      className: 'text-blue-600 hover:text-blue-800',
    }] : []),
    ...(onDelete ? [{
      label: 'Trash',
      onClick: onDelete,
      className: 'text-red-600 hover:text-red-800',
    }] : []),
    ...(onView ? [{
      label: 'View',
      onClick: onView,
      className: 'text-blue-600 hover:text-blue-800',
    }] : []),
    ...rowActions,
  ];

  const allSelected = selectedIds.length === paginatedData.length && paginatedData.length > 0;
  const someSelected = selectedIds.length > 0 && selectedIds.length < paginatedData.length;

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-semibold text-gray-800">{title}</h1>
        <div className="flex gap-2">
          {additionalButtons}
          {onNew && (
            <button
              onClick={onNew}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors shadow-sm"
            >
              {newButtonLabel}
            </button>
          )}
        </div>
      </div>

      <DataCard className="overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-300 flex flex-col sm:flex-row gap-4 justify-between bg-gray-50">
          {/* Status Filters */}
          <div className="flex items-center space-x-2">
            <span
              onClick={() => setActiveFilter('all')}
              className={`text-sm cursor-pointer ${
                activeFilter === 'all'
                  ? 'text-gray-600'
                  : 'text-blue-600 hover:underline'
              }`}
            >
              All ({data.length})
            </span>
            {statusFilters.map((filter, idx) => (
              <React.Fragment key={filter.value}>
                <span className="text-gray-300">|</span>
                <span
                  onClick={() => setActiveFilter(filter.value)}
                  className={`text-sm cursor-pointer ${
                    activeFilter === filter.value
                      ? 'text-gray-600'
                      : 'text-blue-600 hover:underline'
                  }`}
                >
                  {filter.label} ({filter.count})
                </span>
              </React.Fragment>
            ))}
          </div>

          {/* Search */}
          <div className="flex gap-2">
            <div className="relative">
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500 w-48"
              />
            </div>
          </div>
        </div>

        {/* Bulk Actions Bar */}
        {bulkActions.length > 0 && selectedIds.length === 0 && (
          <div className="px-4 py-2 border-b border-gray-300 flex items-center gap-2 bg-gray-50">
            <select
              value={bulkActionValue}
              onChange={(e) => setBulkActionValue(e.target.value)}
              className="px-2 py-1 border border-gray-300 text-sm rounded focus:outline-none focus:border-blue-500"
            >
              <option value="">Bulk actions</option>
              {bulkActions.map(action => (
                <option key={action.value} value={action.value}>
                  {action.label}
                </option>
              ))}
            </select>
            <button
              onClick={handleBulkAction}
              disabled={!bulkActionValue || selectedIds.length === 0}
              className="px-3 py-1 border border-gray-300 text-sm text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed rounded"
            >
              Apply
            </button>
          </div>
        )}
        {bulkActions.length > 0 && selectedIds.length > 0 && (
          <div className="px-4 py-2 border-b border-gray-300 flex items-center gap-2 bg-blue-50">
            <select
              value={bulkActionValue}
              onChange={(e) => setBulkActionValue(e.target.value)}
              className="px-2 py-1 border border-gray-300 text-sm rounded focus:outline-none focus:border-blue-500"
            >
              <option value="">Bulk actions</option>
              {bulkActions.map(action => (
                <option key={action.value} value={action.value}>
                  {action.label}
                </option>
              ))}
            </select>
            <button
              onClick={handleBulkAction}
              disabled={!bulkActionValue}
              className="px-3 py-1 border border-gray-300 text-sm text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed rounded"
            >
              Apply
            </button>
            <span className="text-sm text-gray-700 font-medium">
              {selectedIds.length} {selectedIds.length === 1 ? 'item' : 'items'} selected
            </span>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 border-b border-gray-300">
              <tr>
                {showCheckboxes && (
                  <th className="px-4 py-3 w-10">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      ref={input => {
                        if (input) input.indeterminate = someSelected;
                      }}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="border-gray-300 rounded"
                    />
                  </th>
                )}
                {columns.map((col) => (
                  <th 
                    key={col.key} 
                    className={`px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider ${col.width || ''} ${col.sortable !== false ? 'cursor-pointer hover:bg-gray-100' : ''}`}
                    onClick={() => col.sortable !== false && handleSort(col.key)}
                  >
                    <div className="flex items-center gap-1">
                      {col.label}
                      {col.sortable !== false && sortColumn === col.key && (
                        <span className="text-blue-600">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {paginatedData.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + (showCheckboxes ? 1 : 0)}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                paginatedData.map((item) => {
                  const itemId = item[idField];
                  const isSelected = selectedIds.includes(itemId);
                  const isQuickEditing = quickEditId === itemId;

                  if (isQuickEditing) {
                    // Quick Edit Row
                    return (
                      <tr key={itemId} className="bg-yellow-50">
                        <td colSpan={columns.length + (showCheckboxes ? 1 : 0)} className="px-4 py-4">
                          <div className="space-y-3">
                            <div className="flex justify-between items-center border-b pb-2">
                              <h3 className="font-semibold text-gray-800">Quick Edit</h3>
                              <button onClick={handleQuickEditCancel} className="text-gray-500 hover:text-gray-700">
                                <X size={18} />
                              </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {quickEditFields.map((field) => (
                                <div key={field.key}>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {field.label}
                                  </label>
                                  {field.type === 'select' ? (
                                    <select
                                      value={quickEditData[field.key] || ''}
                                      onChange={(e) =>
                                        setQuickEditData({ ...quickEditData, [field.key]: e.target.value })
                                      }
                                      className="w-full px-2 py-1 border border-gray-400 rounded focus:outline-none focus:border-[#2271b1]"
                                    >
                                      {field.options?.map((opt) => (
                                        <option key={opt.value} value={opt.value}>
                                          {opt.label}
                                        </option>
                                      ))}
                                    </select>
                                  ) : (
                                    <input
                                      type={field.type}
                                      value={quickEditData[field.key] || ''}
                                      onChange={(e) =>
                                        setQuickEditData({ ...quickEditData, [field.key]: e.target.value })
                                      }
                                      className="w-full px-2 py-1 border border-gray-400 rounded focus:outline-none focus:border-[#2271b1]"
                                    />
                                  )}
                                </div>
                              ))}
                            </div>
                            <div className="flex gap-2 pt-2">
                              <button
                                onClick={handleQuickEditSave}
                                className="px-4 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                              >
                                Update
                              </button>
                              <button
                                onClick={handleQuickEditCancel}
                                className="px-4 py-1 border border-gray-300 text-sm text-gray-700 rounded hover:bg-gray-50"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  }

                  // Normal Row
                  return (
                    <tr
                      key={itemId}
                      className={`hover:bg-gray-50 group transition-colors ${
                        onRowClick ? 'cursor-pointer' : ''
                      }`}
                      onClick={() => onRowClick && onRowClick(item)}
                    >
                      {showCheckboxes && (
                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => handleSelectRow(itemId, e.target.checked)}
                            className="border-gray-300 rounded"
                          />
                        </td>
                      )}
                      {columns.map((col, idx) => (
                        <td key={col.key} className="px-4 py-3">
                          {idx === 0 && defaultRowActions.length > 0 ? (
                            <div>
                              <div className="font-semibold text-blue-600 hover:text-blue-800 cursor-pointer">
                                {col.render ? col.render(item) : item[col.key]}
                              </div>
                              <div className="flex items-center gap-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                                {defaultRowActions.map((action, actionIdx) => {
                                  if (action.show && !action.show(item)) return null;
                                  return (
                                    <React.Fragment key={actionIdx}>
                                      {actionIdx > 0 && <span className="text-gray-300">|</span>}
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          action.onClick(item);
                                        }}
                                        className={action.className || 'text-[#2271b1] hover:text-[#135e96]'}
                                      >
                                        {action.label}
                                      </button>
                                    </React.Fragment>
                                  );
                                })}
                              </div>
                            </div>
                          ) : col.render ? (
                            col.render(item)
                          ) : (
                            item[col.key]
                          )}
                        </td>
                      ))}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer - WordPress style */}
        {filteredData.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-300 flex flex-col sm:flex-row items-center justify-between gap-3 bg-gray-50">
            {/* Items per page selector */}
            <div className="flex items-center gap-2">
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1); // Reset to first page
                }}
                className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500"
              >
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span className="text-sm text-gray-600">items per page</span>
            </div>

            {/* Item count */}
            <div className="text-sm text-gray-600">
              {startItem}-{endItem} of {filteredData.length} items
            </div>

            {/* Page navigation */}
            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="px-2 py-1 border border-gray-300 rounded text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ««
                </button>
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-2 py-1 border border-gray-300 rounded text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ‹
                </button>
                
                <span className="px-3 py-1 text-sm text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>
                
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-2 py-1 border border-gray-300 rounded text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ›
                </button>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="px-2 py-1 border border-gray-300 rounded text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  »»
                </button>
              </div>
            )}
          </div>
        )}
      </DataCard>
    </div>
  );
}
