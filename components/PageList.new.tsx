import React from 'react';
import { useCMS } from '../contexts/CMSContext';
import { ViewState, PostStatus, Post } from '../types';
import { DataTable, Column, StatusFilter, BulkAction, QuickEditField } from './common/DataTable';

const PageList: React.FC = () => {
  const { pages, deletePost, setCurrentView, setEditingPostId, updatePost } = useCMS();

  const handleEdit = (page: Post) => {
    setEditingPostId(page.id);
    setCurrentView(ViewState.POST_EDIT);
  };

  const handleNew = () => {
    setEditingPostId(null);
    setCurrentView(ViewState.POST_EDIT);
  };

  const handleDelete = (page: Post) => {
    if (confirm(`Are you sure you want to delete "${page.title}"?`)) {
      deletePost(page.id);
    }
  };

  const handleQuickEdit = (page: Post, updates: Record<string, any>) => {
    updatePost(page.id, updates);
  };

  const columns: Column<Post>[] = [
    {
      key: 'title',
      label: 'Title',
      width: 'w-1/2',
      render: (page) => (
        <>
          {page.title}
          {page.status === PostStatus.DRAFT && <span className="text-gray-500 font-normal"> — Draft</span>}
        </>
      ),
    },
    { key: 'author', label: 'Author' },
    {
      key: 'date',
      label: 'Date',
      render: (page) => (
        <div>
          <div className="text-gray-500">{page.status}</div>
          <div className="text-xs">{new Date(page.date).toLocaleDateString()}</div>
        </div>
      ),
    },
  ];

  const statusFilters: StatusFilter[] = [
    {
      label: 'Published',
      value: PostStatus.PUBLISHED,
      count: pages.filter(p => p.status === PostStatus.PUBLISHED).length,
    },
  ];

  const bulkActions: BulkAction[] = [
    { label: 'Move to Trash', value: 'trash', onExecute: (ids) => ids.forEach(id => deletePost(id)) },
  ];

  const quickEditFields: QuickEditField[] = [
    { key: 'title', label: 'Title', type: 'text' },
    { key: 'author', label: 'Author', type: 'text' },
    {
      key: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { label: 'Published', value: PostStatus.PUBLISHED },
        { label: 'Draft', value: PostStatus.DRAFT },
      ],
    },
  ];

  return (
    <DataTable
      title="Pages"
      data={pages}
      columns={columns}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onNew={handleNew}
      newButtonLabel="Add New"
      statusFilters={statusFilters}
      searchPlaceholder="Search pages..."
      bulkActions={bulkActions}
      quickEditFields={quickEditFields}
      onQuickEdit={handleQuickEdit}
      emptyMessage="No pages found. Create your first page!"
    />
  );
};

export default PageList;
