import React, { useState, useEffect, useCallback } from 'react';
import { MessageSquare, Check, X, AlertTriangle, Trash2, RefreshCw, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { commentsApi, ApiComment, CommentStatus, ModerationAction, CommentCounts } from '../services/api';
import { useModal } from './Modal';
import { DataCard, DataCardHeader, DataCardBody } from './common/DataCard';

// ============================================
// WordPress-like Comments Management
// Full moderation UI with API integration
// ============================================

const CommentsList: React.FC = () => {
  const [comments, setComments] = useState<ApiComment[]>([]);
  const [counts, setCounts] = useState<CommentCounts>({ pending: 0, approved: 0, spam: 0, trash: 0, all: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<CommentStatus | 'all'>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const limit = 20;

  // Fetch comments
  const fetchComments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params: any = { page, limit };
      if (activeFilter !== 'all') {
        params.status = activeFilter;
      }
      
      const response = await commentsApi.getAll(params);
      setComments(response.data || []);
      setTotalPages(Math.ceil((response.total || 0) / limit));
      
      // Also fetch counts
      const countsData = await commentsApi.getCounts();
      setCounts(countsData);
    } catch (err) {
      console.error('Failed to fetch comments:', err);
      setError('Failed to load comments. Make sure you are logged in as Admin/Editor.');
      // Fallback to mock data for demo
      setComments([
        {
          id: '1',
          postId: 'post-1',
          postTitle: 'Hello World',
          authorName: 'John Doe',
          authorEmail: 'john@example.com',
          content: 'Great article! Really enjoyed reading this.',
          status: 'approved',
          karma: 5,
          approved: true,
          type: 'comment',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '2',
          postId: 'post-1',
          postTitle: 'Hello World',
          authorName: 'Jane Smith',
          authorEmail: 'jane@example.com',
          content: 'Thanks for sharing this information!',
          status: 'pending',
          karma: 0,
          approved: false,
          type: 'comment',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]);
      setCounts({ pending: 1, approved: 1, spam: 0, trash: 0, all: 2 });
    } finally {
      setLoading(false);
    }
  }, [page, activeFilter]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  // Moderation handlers
  const handleModerate = async (id: string, action: ModerationAction) => {
    try {
      await commentsApi.moderate(id, action);
      fetchComments();
    } catch (err) {
      console.error('Moderation failed:', err);
      await alert({
        title: 'Error',
        message: 'Failed to moderate comment',
        variant: 'error'
      });
    }
  };

  const handleBulkModerate = async (action: ModerationAction) => {
    if (selectedIds.size === 0) return;
    
    try {
      await commentsApi.bulkModerate(Array.from(selectedIds), action);
      setSelectedIds(new Set());
      fetchComments();
    } catch (err) {
      console.error('Bulk moderation failed:', err);
      await alert({
        title: 'Error',
        message: 'Failed to moderate comments',
        variant: 'error'
      });
    }
  };

  const { confirm, alert } = useModal();

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Comment',
      message: 'Permanently delete this comment?',
      confirmText: 'Delete',
      variant: 'warning'
    });
    if (!confirmed) return;
    
    try {
      await commentsApi.delete(id);
      fetchComments();
    } catch (err) {
      console.error('Delete failed:', err);
      await alert({
        title: 'Error',
        message: 'Failed to delete comment',
        variant: 'error'
      });
    }
  };

  const handleEdit = async (id: string) => {
    try {
      await commentsApi.update(id, { content: editContent });
      setEditingId(null);
      setEditContent('');
      fetchComments();
    } catch (err) {
      console.error('Update failed:', err);
      await alert({
        title: 'Error',
        message: 'Failed to update comment',
        variant: 'error'
      });
    }
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === comments.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(comments.map(c => c.id)));
    }
  };

  // Filter display
  const filteredComments = searchQuery
    ? comments.filter(c =>
        c.authorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.authorEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : comments;

  const getStatusColor = (status: CommentStatus) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'spam': return 'bg-red-100 text-red-800';
      case 'trash': return 'bg-gray-100 text-gray-600';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MessageSquare className="text-blue-600" size={28} />
          <h1 className="text-2xl font-normal text-gray-800">Comments</h1>
        </div>
        <button
          onClick={fetchComments}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800 text-sm">
          {error}
        </div>
      )}

      <DataCard className="overflow-hidden">
        {/* Filter Tabs */}
        <div className="p-3 border-b border-gray-300 bg-gray-50 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-1 text-sm">
            <button
              onClick={() => { setActiveFilter('all'); setPage(1); }}
              className={`px-2 py-1 rounded ${activeFilter === 'all' ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              All ({counts.all})
            </button>
            <span className="text-gray-300">|</span>
            <button
              onClick={() => { setActiveFilter('pending'); setPage(1); }}
              className={`px-2 py-1 rounded ${activeFilter === 'pending' ? 'bg-yellow-100 text-yellow-700 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              Pending ({counts.pending})
            </button>
            <span className="text-gray-300">|</span>
            <button
              onClick={() => { setActiveFilter('approved'); setPage(1); }}
              className={`px-2 py-1 rounded ${activeFilter === 'approved' ? 'bg-green-100 text-green-700 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              Approved ({counts.approved})
            </button>
            <span className="text-gray-300">|</span>
            <button
              onClick={() => { setActiveFilter('spam'); setPage(1); }}
              className={`px-2 py-1 rounded ${activeFilter === 'spam' ? 'bg-red-100 text-red-700 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              Spam ({counts.spam})
            </button>
            <span className="text-gray-300">|</span>
            <button
              onClick={() => { setActiveFilter('trash'); setPage(1); }}
              className={`px-2 py-1 rounded ${activeFilter === 'trash' ? 'bg-gray-200 text-gray-700 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              Trash ({counts.trash})
            </button>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search comments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
            />
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedIds.size > 0 && (
          <div className="p-3 bg-blue-50 border-b border-blue-200 flex items-center gap-3">
            <span className="text-sm text-blue-700 font-medium">{selectedIds.size} selected</span>
            <div className="flex gap-2">
              <button
                onClick={() => handleBulkModerate('approve')}
                className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
              >
                Approve
              </button>
              <button
                onClick={() => handleBulkModerate('spam')}
                className="px-3 py-1 text-xs bg-orange-600 text-white rounded hover:bg-orange-700"
              >
                Mark Spam
              </button>
              <button
                onClick={() => handleBulkModerate('trash')}
                className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
              >
                Move to Trash
              </button>
            </div>
          </div>
        )}

        {/* Comments Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === comments.length && comments.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded border-gray-300"
                  />
                </th>
                <th className="px-4 py-3 w-48">Author</th>
                <th className="px-4 py-3">Comment</th>
                <th className="px-4 py-3 w-48">In Response To</th>
                <th className="px-4 py-3 w-40">Submitted</th>
                <th className="px-4 py-3 w-24">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    <RefreshCw className="animate-spin inline-block mr-2" size={16} />
                    Loading comments...
                  </td>
                </tr>
              ) : filteredComments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    No comments found
                  </td>
                </tr>
              ) : (
                filteredComments.map((comment) => (
                  <tr
                    key={comment.id}
                    className={`hover:bg-gray-50 group ${
                      comment.status === 'pending' ? 'bg-yellow-50/50' : ''
                    }`}
                  >
                    <td className="px-4 py-3 align-top">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(comment.id)}
                        onChange={() => toggleSelect(comment.id)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="px-4 py-3 align-top">
                      <div className="font-semibold text-blue-600 hover:underline cursor-pointer">
                        {comment.authorName}
                      </div>
                      <div className="text-xs text-gray-500">
                        <a href={`mailto:${comment.authorEmail}`} className="hover:underline">
                          {comment.authorEmail}
                        </a>
                      </div>
                      {comment.authorUrl && (
                        <div className="text-xs text-gray-400 truncate max-w-[180px]">
                          {comment.authorUrl}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 align-top">
                      {editingId === comment.id ? (
                        <div className="space-y-2">
                          <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                            rows={3}
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(comment.id)}
                              className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => { setEditingId(null); setEditContent(''); }}
                              className="px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="text-gray-800 mb-2 whitespace-pre-wrap">{comment.content}</div>
                          <div className="flex items-center gap-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                            {comment.status === 'pending' || comment.status === 'spam' ? (
                              <button
                                onClick={() => handleModerate(comment.id, 'approve')}
                                className="text-green-600 hover:underline flex items-center gap-1"
                              >
                                <Check size={12} /> Approve
                              </button>
                            ) : (
                              <button
                                onClick={() => handleModerate(comment.id, 'unapprove')}
                                className="text-yellow-600 hover:underline flex items-center gap-1"
                              >
                                <X size={12} /> Unapprove
                              </button>
                            )}
                            <span className="text-gray-300">|</span>
                            <button
                              onClick={() => { setEditingId(comment.id); setEditContent(comment.content); }}
                              className="text-blue-600 hover:underline"
                            >
                              Edit
                            </button>
                            <span className="text-gray-300">|</span>
                            <button
                              onClick={() => handleModerate(comment.id, 'spam')}
                              className="text-orange-600 hover:underline flex items-center gap-1"
                            >
                              <AlertTriangle size={12} /> Spam
                            </button>
                            <span className="text-gray-300">|</span>
                            {comment.status === 'trash' ? (
                              <button
                                onClick={() => handleDelete(comment.id)}
                                className="text-red-600 hover:underline flex items-center gap-1"
                              >
                                <Trash2 size={12} /> Delete Forever
                              </button>
                            ) : (
                              <button
                                onClick={() => handleModerate(comment.id, 'trash')}
                                className="text-red-600 hover:underline flex items-center gap-1"
                              >
                                <Trash2 size={12} /> Trash
                              </button>
                            )}
                          </div>
                        </>
                      )}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <div className="text-blue-600 hover:underline cursor-pointer font-medium">
                        {comment.postTitle || 'Unknown Post'}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        <a href="#" className="hover:underline">View Post</a>
                      </div>
                    </td>
                    <td className="px-4 py-3 align-top text-xs text-gray-500">
                      {new Date(comment.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                      <br />
                      {new Date(comment.createdAt).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(comment.status)}`}>
                        {comment.status.charAt(0).toUpperCase() + comment.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Page {page} of {totalPages}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              >
                <ChevronLeft size={16} /> Previous
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </DataCard>
    </div>
  );
};

export default CommentsList;
