import React from 'react';
import { useCMS } from '../contexts/CMSContext';
import { ViewState, PostStatus, Post } from '../types';
import { DataTable, Column, StatusFilter, BulkAction, QuickEditField } from './common/DataTable';
import { useToast } from './Toast';
import { useModal } from './Modal';

/**
 * NestPress Unified Content List
 * 
 * WordPress-compatible list component that handles both posts and pages.
 * Automatically detects post_type and adapts the UI accordingly.
 * 
 * WordPress Equivalents:
 * - wp-admin/edit.php (Posts list)
 * - wp-admin/edit.php?post_type=page (Pages list)
 * 
 * Props:
 * - postType: 'post' | 'page' - Determines which content type to display
 */

interface PostListProps {
  postType?: 'post' | 'page';
}

const PostList: React.FC<PostListProps> = ({ postType = 'post' }) => {
  const { posts, pages, deletePost, setCurrentView, setEditingPostId, updatePost } = useCMS();
  const { success } = useToast();
  const { confirm } = useModal();

  // Get the correct data source based on post type
  const items = postType === 'page' ? pages : posts;
  const itemLabel = postType === 'page' ? 'Page' : 'Post';
  const itemLabelPlural = postType === 'page' ? 'Pages' : 'Posts';
  const editView = postType === 'page' ? ViewState.PAGE_EDIT : ViewState.POST_EDIT;

  const handleEdit = (item: Post) => {
    setEditingPostId(item.id);
    setCurrentView(editView);
  };

  const handleNew = () => {
    setEditingPostId(null);
    setCurrentView(editView);
  };

  const handleDelete = async (item: Post) => {
    const confirmed = await confirm({
      title: `Delete ${itemLabel}`,
      message: `Are you sure you want to delete "${item.title}"?`,
      confirmText: 'Delete',
      variant: 'warning'
    });
    
    if (confirmed) {
      try {
        await deletePost(item.id);
        // Toast shown by CMSContext
      } catch (err) {
        // Error toast shown by CMSContext
      }
    }
  };

  const handleQuickEdit = (item: Post, updates: Record<string, any>) => {
    updatePost(item.id, updates);
  };

  // Base columns (title, author, date) - same for both posts and pages
  const baseColumns: Column<Post>[] = [
    {
      key: 'title',
      label: 'Title',
      width: postType === 'page' ? 'w-1/2' : 'w-1/3',
      render: (item) => (
        <>
          {item.title}
          {item.status === PostStatus.DRAFT && <span className="text-gray-500 font-normal"> — Draft</span>}
        </>
      ),
    },
    { key: 'author', label: 'Author' },
  ];

  // Add categories/tags columns only for posts
  const columns: Column<Post>[] = postType === 'post' 
    ? [
        ...baseColumns,
        { key: 'categories', label: 'Categories', render: (item) => item.categories.join(', ') || '—' },
        { key: 'tags', label: 'Tags', render: (item) => item.tags.join(', ') || '—' },
        {
          key: 'date',
          label: 'Date',
          render: (item) => (
            <div>
              <div>{item.status}</div>
              <div className="text-xs text-gray-500">{new Date(item.date).toLocaleDateString()}</div>
            </div>
          ),
        },
      ]
    : [
        ...baseColumns,
        {
          key: 'date',
          label: 'Date',
          render: (item) => (
            <div>
              <div>{item.status}</div>
              <div className="text-xs text-gray-500">{new Date(item.date).toLocaleDateString()}</div>
            </div>
          ),
        },
      ];

  const statusFilters: StatusFilter[] = [
    { label: 'Published', value: PostStatus.PUBLISHED, count: items.filter(p => p.status === PostStatus.PUBLISHED).length },
    { label: 'Draft', value: PostStatus.DRAFT, count: items.filter(p => p.status === PostStatus.DRAFT).length },
    { label: 'Trash', value: PostStatus.TRASH, count: items.filter(p => p.status === PostStatus.TRASH).length },
  ];

  const bulkActions: BulkAction[] = [
    { 
      label: 'Move to Trash', 
      value: 'trash', 
      onExecute: async (ids) => {
        const confirmed = await confirm(
          `Are you sure you want to move ${ids.length} ${itemLabel.toLowerCase()}(s) to trash?`,
          'Move to Trash'
        );
        if (confirmed) {
          await Promise.all(ids.map(id => deletePost(id)));
          success(`${ids.length} ${itemLabel.toLowerCase()}(s) moved to trash`);
        }
      }
    },
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
        { label: 'Trash', value: PostStatus.TRASH },
      ],
    },
  ];

  return (
    <DataTable
      title={itemLabelPlural}
      data={items}
      columns={columns}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onNew={handleNew}
      newButtonLabel="Add New"
      statusFilters={statusFilters}
      searchPlaceholder={`Search ${itemLabelPlural.toLowerCase()}...`}
      bulkActions={bulkActions}
      quickEditFields={quickEditFields}
      onQuickEdit={handleQuickEdit}
      emptyMessage={`No ${itemLabelPlural.toLowerCase()} found. Create your first ${itemLabel.toLowerCase()}!`}
    />
  );
};

export default PostList;