import React from 'react';
import { useCMS } from '../contexts/CMSContext';
import { User } from '../types';
import { DataTable, Column, StatusFilter, BulkAction, QuickEditField } from './common/DataTable';
import { useToast } from './Toast';
import { useModal } from './Modal';

const UserList: React.FC = () => {
  const { users, updateUser, deleteUser } = useCMS();
  const { success } = useToast();
  const { confirm } = useModal();

  const handleEdit = (user: User) => {
    // TODO: Navigate to user edit view
    console.log('Edit user:', user.id);
  };

  const handleDelete = async (user: User) => {
    const confirmed = await confirm(
      `Are you sure you want to delete user "${user.name}"? This action cannot be undone.`,
      'Delete User'
    );
    if (confirmed) {
      deleteUser(user.id);
    }
  };

  const handleQuickEdit = (user: User, updates: Record<string, any>) => {
    updateUser(user.id, updates);
  };

  const columns: Column<User>[] = [
    {
      key: 'username',
      label: 'Username',
      width: 'w-1/4',
      render: (user) => (
        <div className="flex items-center gap-2">
          <img src={user.avatar} alt="" className="w-8 h-8 rounded bg-gray-200" />
          <span>{user.name}</span>
        </div>
      ),
    },
    { key: 'name', label: 'Name' },
    {
      key: 'email',
      label: 'Email',
      render: (user) => (
        <a href={`mailto:${user.email}`} className="text-blue-600 hover:underline">
          {user.email}
        </a>
      ),
    },
    { key: 'role', label: 'Role' },
    { key: 'posts', label: 'Posts' },
  ];

  const statusFilters: StatusFilter[] = [
    { label: 'Administrator', value: 'Administrator', count: users.filter((u) => u.role === 'Administrator').length },
    { label: 'Editor', value: 'Editor', count: users.filter((u) => u.role === 'Editor').length },
    { label: 'Author', value: 'Author', count: users.filter((u) => u.role === 'Author').length },
    { label: 'Subscriber', value: 'Subscriber', count: users.filter((u) => u.role === 'Subscriber').length },
  ];

  const bulkActions: BulkAction[] = [
    { 
      label: 'Delete', 
      value: 'delete', 
      onExecute: async (ids) => {
        const confirmed = await confirm(
          `Are you sure you want to delete ${ids.length} user(s)? This action cannot be undone.`,
          'Delete Users'
        );
        if (confirmed) {
          await Promise.all(ids.map(id => deleteUser(id)));
          success(`${ids.length} user(s) deleted`);
        }
      }
    },
  ];

  const quickEditFields: QuickEditField[] = [
    { key: 'name', label: 'Name', type: 'text' },
    { key: 'email', label: 'Email', type: 'text' },
    {
      key: 'role',
      label: 'Role',
      type: 'select',
      options: [
        { label: 'Administrator', value: 'Administrator' },
        { label: 'Editor', value: 'Editor' },
        { label: 'Author', value: 'Author' },
        { label: 'Subscriber', value: 'Subscriber' },
      ],
    },
  ];

  return (
    <DataTable
      title="Users"
      data={users}
      columns={columns}
      onEdit={handleEdit}
      onDelete={handleDelete}
      newButtonLabel="Add New User"
      statusFilters={statusFilters}
      filterField="role" // Filter by role field instead of status
      searchPlaceholder="Search users..."
      bulkActions={bulkActions}
      quickEditFields={quickEditFields}
      onQuickEdit={handleQuickEdit}
      emptyMessage="No users found."
    />
  );
};

export default UserList;