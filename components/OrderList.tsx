import React from 'react';
import { useCMS } from '../contexts/CMSContext';
import { Order } from '../types';
import { DataTable, Column, StatusFilter, BulkAction, QuickEditField } from './common/DataTable';
import { useToast } from './Toast';
import { useModal } from './Modal';

const OrderList: React.FC = () => {
  const { orders, updateOrder, deleteOrder } = useCMS();
  const { success } = useToast();
  const { confirm } = useModal();

  const handleEdit = (order: Order) => {
    // TODO: Navigate to order detail view
    console.log('Edit order:', order.id);
  };

  const handleDelete = async (order: Order) => {
    await deleteOrder(order.id);
  };

  const handleQuickEdit = (order: Order, updates: Record<string, any>) => {
    updateOrder(order.id, updates);
  };

  const columns: Column<Order>[] = [
    { key: 'id', label: 'Order', width: 'w-32', render: (order) => <span className="font-semibold">{order.id}</span> },
    {
      key: 'date',
      label: 'Date',
      render: (order) => (
        <div>
          <div>{new Date(order.date).toLocaleDateString()}</div>
          <div className="text-xs text-gray-500">{new Date(order.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
        </div>
      ),
    },
    { key: 'customerName', label: 'Customer', render: (order) => <span className="font-medium">{order.customerName}</span> },
    { key: 'total', label: 'Total', render: (order) => <span className="font-medium">${order.total.toFixed(2)}</span> },
    {
      key: 'status',
      label: 'Payment',
      render: (order) => (
        <span
          className={`px-2 py-0.5 rounded-full text-xs font-medium border ${
            order.status === 'Paid'
              ? 'bg-gray-100 text-gray-800 border-gray-200'
              : order.status === 'Pending'
              ? 'bg-yellow-50 text-yellow-800 border-yellow-200'
              : 'bg-red-50 text-red-800 border-red-200'
          }`}
        >
          {order.status}
        </span>
      ),
    },
    {
      key: 'fulfillment',
      label: 'Fulfillment',
      render: (order) => (
        <span
          className={`px-2 py-0.5 rounded-full text-xs font-medium border ${
            order.fulfillment === 'Fulfilled'
              ? 'bg-gray-100 text-gray-800 border-gray-200'
              : 'bg-yellow-50 text-yellow-800 border-yellow-200'
          }`}
        >
          {order.fulfillment}
        </span>
      ),
    },
    { key: 'itemsCount', label: 'Items', render: (order) => `${order.itemsCount} items` },
  ];

  const statusFilters: StatusFilter[] = [
    { 
      label: 'Unfulfilled', 
      value: 'Unfulfilled', 
      count: orders.filter((o) => o.fulfillment === 'Unfulfilled').length,
      filterFn: (o: Order) => o.fulfillment === 'Unfulfilled'
    },
    { 
      label: 'Unpaid', 
      value: 'Pending', 
      count: orders.filter((o) => o.status === 'Pending').length,
      filterFn: (o: Order) => o.status === 'Pending'
    },
    { 
      label: 'Open', 
      value: 'Open', 
      count: orders.filter((o) => o.status !== 'Refunded').length,
      filterFn: (o: Order) => o.status !== 'Refunded'
    },
  ];

  const bulkActions: BulkAction[] = [
    { 
      label: 'Mark as Fulfilled', 
      value: 'fulfill', 
      onExecute: async (ids) => {
        await Promise.all(ids.map((id) => updateOrder(id, { fulfillment: 'Fulfilled' })));
        success(`${ids.length} order(s) marked as fulfilled`);
      }
    },
    { 
      label: 'Mark as Paid', 
      value: 'paid', 
      onExecute: async (ids) => {
        await Promise.all(ids.map((id) => updateOrder(id, { status: 'Paid' })));
        success(`${ids.length} order(s) marked as paid`);
      }
    },
    { 
      label: 'Delete', 
      value: 'delete', 
      onExecute: async (ids) => {
        const confirmed = await confirm(
          `Are you sure you want to delete ${ids.length} order(s)? This action cannot be undone.`,
          'Delete Orders'
        );
        if (confirmed) {
          await Promise.all(ids.map((id) => deleteOrder(id)));
          success(`${ids.length} order(s) deleted`);
        }
      }
    },
  ];

  const quickEditFields: QuickEditField[] = [
    { key: 'customerName', label: 'Customer', type: 'text' },
    {
      key: 'status',
      label: 'Payment Status',
      type: 'select',
      options: [
        { label: 'Paid', value: 'Paid' },
        { label: 'Pending', value: 'Pending' },
        { label: 'Refunded', value: 'Refunded' },
      ],
    },
    {
      key: 'fulfillment',
      label: 'Fulfillment',
      type: 'select',
      options: [
        { label: 'Fulfilled', value: 'Fulfilled' },
        { label: 'Unfulfilled', value: 'Unfulfilled' },
        { label: 'Partial', value: 'Partial' },
      ],
    },
  ];

  return (
    <DataTable
      title="Orders"
      data={orders}
      columns={columns}
      onEdit={handleEdit}
      onDelete={handleDelete}
      statusFilters={statusFilters}
      searchPlaceholder="Search orders..."
      bulkActions={bulkActions}
      quickEditFields={quickEditFields}
      onQuickEdit={handleQuickEdit}
      emptyMessage="No orders found."
    />
  );
};

export default OrderList;