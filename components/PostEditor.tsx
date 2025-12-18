import React, { useState, useEffect } from 'react';
import { Save, Sparkles, ChevronLeft, Calendar, Tag, Folder, Eye, LayoutTemplate, ChevronDown } from 'lucide-react';
import { useCMS } from '../contexts/CMSContext';
import { ViewState, Post, PostStatus } from '../types';
import { generatePostContent, generatePostTitle } from '../services/geminiService';
import { templatesApi, TemplateResponse } from '../services/api';
import { useToast } from './Toast';
import { DataCard, DataCardHeader, DataCardBody } from './common/DataCard';

/**
 * NestPress Unified Post/Page Editor
 * 
 * WordPress-compatible editor that handles both posts and pages with the same interface.
 * The editor automatically adapts based on the post_type field.
 * 
 * WordPress Equivalents:
 * - wp-admin/post.php (Edit Post)
 * - wp-admin/post-new.php (Add New Post)
 * - wp-admin/edit.php?post_type=page (Edit Page)
 * 
 * Hook Points (WordPress-compatible):
 * - 'post_before_save' - Before saving post/page
 * - 'post_after_save' - After saving post/page
 * - 'post_content_filter' - Filter post content before display
 * - 'post_title_filter' - Filter post title
 * - 'post_meta_box' - Add custom meta boxes to sidebar
 * - 'post_editor_toolbar' - Add custom buttons to editor toolbar
 * 
 * Post Types:
 * - 'post' - Blog posts (has categories, tags)
 * - 'page' - Static pages (no categories/tags, hierarchical)
 */
const PostEditor: React.FC = () => {
  const { posts, pages, addPost, updatePost, setCurrentView, editingPostId, currentUser, currentView } = useCMS();
  const { success, error } = useToast();
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState<PostStatus>(PostStatus.DRAFT);
  const [categories, setCategories] = useState('');
  const [tags, setTags] = useState('');
  const [postType, setPostType] = useState<'post' | 'page'>('post');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [showAiModal, setShowAiModal] = useState(false);
  
  // Templates state
  const [templates, setTemplates] = useState<TemplateResponse[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [showTemplateDropdown, setShowTemplateDropdown] = useState(false);

  // Fetch templates on mount
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setLoadingTemplates(true);
        const data = await templatesApi.getAll({ status: 'active' });
        setTemplates(data);
        
        // Set default template if none selected
        const defaultTemplate = data.find(t => t.isDefault && t.type === postType);
        if (defaultTemplate && !selectedTemplateId) {
          setSelectedTemplateId(defaultTemplate.id);
        }
      } catch (err) {
        console.error('Failed to load templates:', err);
      } finally {
        setLoadingTemplates(false);
      }
    };
    fetchTemplates();
  }, [postType]);

  // Filter templates by post type
  const availableTemplates = templates.filter(t => 
    t.type === postType || t.type === 'single' || t.type === 'page'
  );

  const selectedTemplate = templates.find(t => t.id === selectedTemplateId);

  useEffect(() => {
    if (editingPostId) {
      const post = posts.find(p => p.id === editingPostId);
      const page = pages.find(p => p.id === editingPostId);
      const target = post || page;
      
      if (target) {
        setTitle(target.title);
        setContent(target.content);
        setStatus(target.status);
        setCategories(target.categories.join(', '));
        setTags(target.tags.join(', '));
        setPostType(target.type);
        setSelectedTemplateId(target.templateId || '');
      }
    } else {
        // Reset for new post/page - determine type from currentView
        setTitle('');
        setContent('');
        setStatus(PostStatus.DRAFT);
        setCategories('Uncategorized');
        setTags('');
        setPostType(currentView === ViewState.PAGE_EDIT ? 'page' : 'post');
        setSelectedTemplateId('');
    }
  }, [editingPostId, posts, pages, currentView]);

  const handleSave = async () => {
    if (!currentUser) {
      error('User not authenticated. Please log in.');
      return;
    }

    const newPost: Post = {
      id: editingPostId || Date.now().toString(),
      title: title || '(Untitled)',
      content,
      author: currentUser.name,
      status,
      categories: categories.split(',').map(c => c.trim()).filter(Boolean),
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      date: new Date().toISOString(),
      excerpt: content.substring(0, 100).replace(/<[^>]*>?/gm, '') + '...',
      type: postType,
      templateId: selectedTemplateId || undefined,
    };

    try {
      if (editingPostId) {
        await updatePost(newPost);
      } else {
        await addPost(newPost);
      }
      // Show success toast and navigate after successful save
      success(editingPostId ? `${postType === 'page' ? 'Page' : 'Post'} updated successfully!` : `${postType === 'page' ? 'Page' : 'Post'} created successfully!`);
      setCurrentView(postType === 'page' ? ViewState.PAGES_LIST : ViewState.POSTS_LIST);
    } catch (err) {
      console.error('Failed to save post/page:', err);
      error('Failed to save. Please try again.');
    }
  };

  const handleGenerateContent = async () => {
    if (!aiPrompt && !title) return;
    setIsGenerating(true);
    try {
        const generatedContent = await generatePostContent(title || aiPrompt, aiPrompt);
        setContent(prev => prev + '\n' + generatedContent);
        setShowAiModal(false);
        setAiPrompt('');
        success('AI content generated successfully!');
    } catch (e) {
        error('Failed to generate content. Please try again.');
    } finally {
        setIsGenerating(false);
    }
  };
  
  const handleAutoTitle = async () => {
      if(!content && !aiPrompt) return;
      setIsGenerating(true);
      try {
          const newTitle = await generatePostTitle(content.substring(0, 500) || aiPrompt);
          setTitle(newTitle);
      } catch(e) {
          // ignore
      } finally {
          setIsGenerating(false);
      }
  }

  return (
    <div className="h-full flex flex-col animate-fade-in relative">
      {/* Top Bar for Editor */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-4">
            <button 
                onClick={() => setCurrentView(postType === 'page' ? ViewState.PAGES_LIST : ViewState.POSTS_LIST)}
                className="p-2 hover:bg-gray-100 rounded-full text-gray-500"
            >
                <ChevronLeft size={20} />
            </button>
            <h1 className="text-xl font-semibold text-gray-800">
                {editingPostId ? 'Edit ' + (postType === 'page' ? 'Page' : 'Post') : 'Add New ' + (postType === 'page' ? 'Page' : 'Post')}
            </h1>
        </div>
        <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 hidden sm:inline">{status === PostStatus.PUBLISHED ? 'Published' : 'Draft saved'}</span>
            <button 
                onClick={() => setShowAiModal(true)}
                className="flex items-center px-4 py-2 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors text-sm font-medium"
            >
                <Sparkles size={16} className="mr-2" /> AI Assistant
            </button>
            <button 
                onClick={handleSave}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm"
            >
                <Save size={16} className="mr-2" /> {editingPostId ? 'Update' : 'Publish'}
            </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-gray-100 p-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Main Editor Area */}
            <div className="lg:col-span-2 space-y-4">
                <input 
                    type="text" 
                    placeholder="Add title" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full text-4xl font-bold bg-transparent border-none placeholder-gray-400 focus:ring-0 px-0 text-gray-800"
                />
                
                {/* Simulated WYSIWYG Toolbar */}
                <DataCard className="min-h-[500px] flex flex-col">
                    <div className="border-b border-gray-300 p-2 flex gap-1 flex-wrap bg-gray-50">
                        {['Bold', 'Italic', 'Link', 'H1', 'H2', 'List', 'Quote'].map((tool) => (
                            <button key={tool} className="p-1.5 hover:bg-gray-200 rounded text-gray-600 text-xs font-medium">
                                {tool}
                            </button>
                        ))}
                    </div>
                    <textarea 
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Start writing or type / to choose a block"
                        className="flex-1 w-full p-6 resize-none focus:outline-none font-serif text-lg leading-relaxed text-gray-800"
                    />
                </DataCard>
            </div>

            {/* Sidebar Settings */}
            <div className="space-y-6">
                
                {/* Publish Meta */}
                <DataCard>
                    <DataCardHeader>Publish</DataCardHeader>
                    <DataCardBody className="space-y-3 text-sm">
                        <div className="flex justify-between items-center text-gray-600">
                            <span className="flex items-center gap-2"><Eye size={14}/> Visibility:</span>
                            <span className="font-medium text-blue-600 cursor-pointer">Public</span>
                        </div>
                        <div className="flex justify-between items-center text-gray-600">
                            <span className="flex items-center gap-2"><Calendar size={14}/> Publish:</span>
                            <span className="font-medium text-blue-600 cursor-pointer">Immediately</span>
                        </div>
                        <div className="pt-2 border-t border-gray-100">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    checked={status === PostStatus.PUBLISHED}
                                    onChange={(e) => setStatus(e.target.checked ? PostStatus.PUBLISHED : PostStatus.DRAFT)}
                                    className="rounded text-blue-600 focus:ring-blue-500" 
                                />
                                <span className="text-gray-700">Publish immediately</span>
                            </label>
                        </div>
                    </DataCardBody>
                </DataCard>

                {/* Categories - Only show for posts */}
                {postType === 'post' && (
                  <DataCard>
                      <DataCardHeader>
                          <span className="flex items-center gap-2"><Folder size={14} /> Categories</span>
                      </DataCardHeader>
                      <DataCardBody>
                      <input 
                          type="text" 
                          value={categories}
                          onChange={(e) => setCategories(e.target.value)}
                          placeholder="Separate with commas"
                          className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500"
                      />
                      <p className="text-xs text-gray-400 mt-1">e.g. Tech, Lifestyle, News</p>
                      </DataCardBody>
                  </DataCard>
                )}

                {/* Tags - Only show for posts */}
                {postType === 'post' && (
                  <DataCard>
                      <DataCardHeader>
                          <span className="flex items-center gap-2"><Tag size={14} /> Tags</span>
                      </DataCardHeader>
                      <DataCardBody>
                      <input 
                          type="text" 
                          value={tags}
                          onChange={(e) => setTags(e.target.value)}
                          placeholder="Add new tag"
                          className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500"
                      />
                      </DataCardBody>
                  </DataCard>
                )}

                {/* Template Selector */}
                <DataCard>
                    <DataCardHeader>
                        <span className="flex items-center gap-2"><LayoutTemplate size={14} /> Template</span>
                    </DataCardHeader>
                    <DataCardBody>
                    <div className="relative">
                        <button
                            onClick={() => setShowTemplateDropdown(!showTemplateDropdown)}
                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500 text-left flex items-center justify-between"
                        >
                            <span className="truncate">
                                {loadingTemplates 
                                    ? 'Loading...' 
                                    : selectedTemplate?.name || 'Default Template'
                                }
                            </span>
                            <ChevronDown size={14} className={`transition-transform ${showTemplateDropdown ? 'rotate-180' : ''}`} />
                        </button>
                        
                        {showTemplateDropdown && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                <div 
                                    className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 ${!selectedTemplateId ? 'bg-blue-50 text-blue-600' : ''}`}
                                    onClick={() => {
                                        setSelectedTemplateId('');
                                        setShowTemplateDropdown(false);
                                    }}
                                >
                                    <div className="font-medium">Default Template</div>
                                    <div className="text-xs text-gray-400">Uses theme default</div>
                                </div>
                                {availableTemplates.map(template => (
                                    <div 
                                        key={template.id}
                                        className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 ${selectedTemplateId === template.id ? 'bg-blue-50 text-blue-600' : ''}`}
                                        onClick={() => {
                                            setSelectedTemplateId(template.id);
                                            setShowTemplateDropdown(false);
                                        }}
                                    >
                                        <div className="font-medium flex items-center gap-2">
                                            {template.name}
                                            {template.isDefault && (
                                                <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded">Default</span>
                                            )}
                                        </div>
                                        <div className="text-xs text-gray-400 flex gap-2">
                                            <span>{template.settings?.layout}</span>
                                            {template.settings?.showSidebar && (
                                                <span>• Sidebar {template.settings.sidebarPosition}</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    {selectedTemplate && (
                        <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-500">
                            <div className="flex gap-2 flex-wrap">
                                <span>{selectedTemplate.settings?.layout}</span>
                                {selectedTemplate.settings?.showHeader && <span>• Header</span>}
                                {selectedTemplate.settings?.showFooter && <span>• Footer</span>}
                                {selectedTemplate.settings?.showSidebar && <span>• Sidebar ({selectedTemplate.settings.sidebarPosition})</span>}
                            </div>
                        </div>
                    )}
                    </DataCardBody>
                </DataCard>
            </div>
        </div>
      </div>

      {/* AI Modal */}
      {showAiModal && (
        <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in-up">
                <div className="bg-purple-600 p-4 flex justify-between items-center">
                    <h3 className="text-white font-semibold flex items-center gap-2">
                        <Sparkles size={18} /> NestPress AI Assistant
                    </h3>
                    <button onClick={() => setShowAiModal(false)} className="text-white/80 hover:text-white">&times;</button>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">What do you want to write about?</label>
                        <textarea 
                            value={aiPrompt}
                            onChange={(e) => setAiPrompt(e.target.value)}
                            placeholder="e.g. 'Top 10 features of React 19' or 'A recipe for chocolate cake'"
                            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent min-h-[100px]"
                        />
                    </div>
                    <div className="flex gap-3">
                        <button 
                            onClick={handleGenerateContent}
                            disabled={isGenerating}
                            className="flex-1 bg-purple-600 text-white py-2 rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 flex justify-center items-center"
                        >
                            {isGenerating ? 'Thinking...' : 'Generate Draft'}
                        </button>
                        <button 
                            onClick={handleAutoTitle}
                            disabled={isGenerating}
                            className="flex-1 bg-white border border-gray-300 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50"
                        >
                            Generate Title
                        </button>
                    </div>
                </div>
                <div className="px-6 py-4 bg-gray-50 text-xs text-gray-500 border-t border-gray-100">
                    Powered by Google Gemini 2.5 Flash. AI can make mistakes.
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default PostEditor;