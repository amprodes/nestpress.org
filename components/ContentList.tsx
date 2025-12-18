import React from 'react';
import { ImageIcon } from 'lucide-react';
import { useCMS } from '../contexts/CMSContext';
import { ViewState, PostStatus, Post, Product } from '../types';
import { DataTable, Column, StatusFilter, BulkAction, QuickEditField } from './common/DataTable';
import { useToast } from './Toast';
import { useModal } from './Modal';

/**
 * NestPress Unified Content List (WordPress-Style)
 * 
 * Single component that handles all post types - just like WordPress.
 * In WordPress, wp-admin/edit.php handles both posts and pages via the 
 * post_type parameter. This component follows the same pattern.
 * 
 * WordPress Equivalents:
 * - wp-admin/edit.php → ContentList with postType="post"
 * - wp-admin/edit.php?post_type=page → ContentList with postType="page"
 * - wp-admin/edit.php?post_type=product → ContentList with postType="product" (WooCommerce)
 * 
 * Key Features:
 * - Automatic data source selection (posts/pages/products)
 * - Conditional columns based on post_type:
 *   - Posts: categories, tags
 *   - Pages: hierarchical structure
 *   - Products: image, price, inventory, vendor
 * - Dynamic labels (Post/Page/Product)
 * - Unified bulk actions and quick edit
 * - WordPress-style status filters
 * 
 * Props:
 * - postType: 'post' | 'page' | 'product' - Determines which content type to display
 * 
 * WordPress Action Hooks (future):
 * - 'manage_{post_type}_posts_columns' - Customize columns
 * - 'post_row_actions' - Add custom row actions
 * - 'bulk_actions-edit-{post_type}' - Add custom bulk actions
 */

interface ContentListProps {
  postType?: 'post' | 'page' | 'product';
}

const ContentList: React.FC<ContentListProps> = ({ postType = 'post' }) => {
  const { 
    posts, 
    pages, 
    products,
    deletePost, 
    deleteProduct,
    setCurrentView, 
    setEditingPostId,
    setEditingProductId,
    updatePost,
    updateProduct 
  } = useCMS();
  const { success } = useToast();
  const { confirm } = useModal();

  // Get the correct data source based on post type
  const items = postType === 'page' ? pages : postType === 'product' ? products : posts;
  const itemLabel = postType === 'page' ? 'Page' : postType === 'product' ? 'Product' : 'Post';
  const itemLabelPlural = postType === 'page' ? 'Pages' : postType === 'product' ? 'Products' : 'Posts';
  const editView = postType === 'page' ? ViewState.PAGE_EDIT : postType === 'product' ? ViewState.PRODUCT_EDIT : ViewState.POST_EDIT;

  const handleEdit = (item: Post | Product) => {
    if (postType === 'product') {
      setEditingProductId(item.id);
    } else {
      setEditingPostId(item.id);
    }
    setCurrentView(editView);
  };

  const handleNew = () => {
    if (postType === 'product') {
      setEditingProductId(null);
    } else {
      setEditingPostId(null);
    }
    setCurrentView(editView);
  };

  const handleDelete = async (item: Post | Product) => {
    const confirmed = await confirm({
      title: `Delete ${itemLabel}`,
      message: `Are you sure you want to delete "${item.title}"?`,
      confirmText: 'Delete',
      variant: 'warning'
    });
    
    if (confirmed) {
      try {
        if (postType === 'product') {
          await deleteProduct(item.id);
        } else {
          await deletePost(item.id);
        }
        // Toast shown by CMSContext
      } catch (err) {
        // Error toast shown by CMSContext
      }
    }
  };

  const handleQuickEdit = (item: Post | Product, updates: Record<string, any>) => {
    if (postType === 'product') {
      updateProduct(item.id, updates);
    } else {
      updatePost(item.id, updates);
    }
  };

  // Product columns - completely different structure
  const productColumns: Column<Product>[] = [
    {
      key: 'image',
      label: 'Image',
      width: 'w-16',
      render: (product) => (
        <div className="w-10 h-10 rounded bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden">
          {product.images?.length > 0 ? (
            <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
          ) : (
            <ImageIcon size={16} className="text-gray-400" />
          )}
        </div>
      ),
    },
    {
      key: 'name',
      label: 'Product',
      width: 'w-1/3',
      render: (product) => (
        <button
          onClick={() => {
            setEditingProductId(product.id);
            setCurrentView(ViewState.PRODUCT_EDITOR);
          }}
          className="text-blue-600 hover:text-blue-800 hover:underline text-left font-medium"
        >
          {product.name}
        </button>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (product) => (
        <span
          className={`px-2 py-0.5 rounded-full text-xs font-medium border ${
            product.status === 'Active'
              ? 'bg-green-100 text-green-800 border-green-200'
              : product.status === 'Draft'
              ? 'bg-gray-100 text-gray-800 border-gray-200'
              : 'bg-yellow-100 text-yellow-800 border-yellow-200'
          }`}
        >
          {product.status}
        </span>
      ),
    },
    {
      key: 'inventory',
      label: 'Inventory',
      render: (product) => (
        <div>
          <div className={product.inventory <= 0 ? 'text-red-600 font-medium' : 'text-gray-600'}>
            {product.inventory} in stock
          </div>
          {product.inventory > 0 && product.inventory < 10 && (
            <div className="text-xs text-orange-600">Low stock</div>
          )}
        </div>
      ),
    },
    { key: 'category', label: 'Category' },
    { key: 'vendor', label: 'Vendor' },
    {
      key: 'price',
      label: 'Price',
      render: (product) => `$${product.price.toFixed(2)}`,
    },
  ];

  // Base columns (title, author, date) - for posts and pages
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

  // Determine columns based on post_type
  const columns: Column<any>[] = postType === 'product'
    ? productColumns
    : postType === 'post' 
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

  const statusFilters: StatusFilter[] = postType === 'product'
    ? [
        { label: 'Active', value: 'Active', count: (items as Product[]).filter((p) => p.status === 'Active').length },
        { label: 'Draft', value: 'Draft', count: (items as Product[]).filter((p) => p.status === 'Draft').length },
        { label: 'Archived', value: 'Archived', count: (items as Product[]).filter((p) => p.status === 'Archived').length },
      ]
    : [
        { label: 'Published', value: PostStatus.PUBLISHED, count: (items as Post[]).filter(p => p.status === PostStatus.PUBLISHED).length },
        { label: 'Draft', value: PostStatus.DRAFT, count: (items as Post[]).filter(p => p.status === PostStatus.DRAFT).length },
        { label: 'Trash', value: PostStatus.TRASH, count: (items as Post[]).filter(p => p.status === PostStatus.TRASH).length },
      ];

  const bulkActions: BulkAction[] = postType === 'product'
    ? [
        { 
          label: 'Set to Active', 
          value: 'active', 
          onExecute: async (ids) => {
            await Promise.all(ids.map((id) => updateProduct(id, { status: 'Active' })));
            success(`${ids.length} product(s) set to active`);
          }
        },
        { 
          label: 'Set to Draft', 
          value: 'draft', 
          onExecute: async (ids) => {
            await Promise.all(ids.map((id) => updateProduct(id, { status: 'Draft' })));
            success(`${ids.length} product(s) set to draft`);
          }
        },
        { 
          label: 'Delete', 
          value: 'delete', 
          onExecute: async (ids) => {
            const confirmed = await confirm(
              `Are you sure you want to delete ${ids.length} product(s)? This action cannot be undone.`,
              'Delete Products'
            );
            if (confirmed) {
              await Promise.all(ids.map((id) => deleteProduct(id)));
              success(`${ids.length} product(s) deleted`);
            }
          }
        },
      ]
    : [
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

  const quickEditFields: QuickEditField[] = postType === 'product'
    ? [
        { key: 'title', label: 'Title', type: 'text' },
        { key: 'price', label: 'Price', type: 'number' },
        { key: 'inventory', label: 'Inventory', type: 'number' },
        {
          key: 'status',
          label: 'Status',
          type: 'select',
          options: [
            { label: 'Active', value: 'Active' },
            { label: 'Draft', value: 'Draft' },
            { label: 'Archived', value: 'Archived' },
          ],
        },
        { key: 'category', label: 'Category', type: 'text' },
        { key: 'vendor', label: 'Vendor', type: 'text' },
      ]
    : [
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

export default ContentList;