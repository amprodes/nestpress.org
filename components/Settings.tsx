/// <reference types="vite/client" />
import React, { useState } from 'react';
import { useConfig } from '../contexts/ConfigContext';
import { useCMS } from '../contexts/CMSContext';
import { useToast } from './Toast';
import { AlertTriangle, RefreshCw, Database, Sparkles, CreditCard, HardDrive, CheckCircle, XCircle, Save } from 'lucide-react';
import { SiteSettings } from '../types';
import { DataCard, DataCardHeader, DataCardBody } from './common/DataCard';

const Settings: React.FC = () => {
  const { systemConfig, resetWizard, apiConnected } = useConfig();
  const { siteSettings, updateSiteSettings } = useCMS();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('General');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [localSettings, setLocalSettings] = useState<SiteSettings>(siteSettings);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [showAIConfig, setShowAIConfig] = useState(false);
  const [showDatabaseConfig, setShowDatabaseConfig] = useState(false);
  const [showPaymentConfig, setShowPaymentConfig] = useState(false);
  const [showStorageConfig, setShowStorageConfig] = useState(false);
  const [aiSettings, setAiSettings] = useState({ provider: 'gemini', apiKey: '', model: '' });
  const [databaseSettings, setDatabaseSettings] = useState({ provider: 'mongodb', uri: '', projectId: '', region: '', apiKey: '' });
  const [paymentSettings, setPaymentSettings] = useState({ provider: 'stripe', publishableKey: '', secretKey: '', testMode: true });
  const [storageSettings, setStorageSettings] = useState({ provider: 's3', bucket: '', accessKey: '', secretKey: '', region: '' });
  const tabs = ['General', 'Writing', 'Reading', 'Discussion', 'Media', 'Permalinks', 'Privacy', 'System'];

  // Sync localSettings with siteSettings when it changes (e.g., after data load)
  React.useEffect(() => {
    setLocalSettings(siteSettings);
  }, [siteSettings]);

  const handleSave = async () => {
    setSaveStatus('saving');
    try {
      await updateSiteSettings(localSettings);
      setSaveStatus('saved');
      showToast('Settings saved successfully!', 'success');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      setSaveStatus('idle');
      showToast('Failed to save settings. Please try again.', 'error');
    }
  };

  const updateLocalSettings = (updates: Partial<SiteSettings>) => {
    setLocalSettings(prev => ({ ...prev, ...updates }));
  };

  // General Settings Tab
  const renderGeneralTab = () => (
    <div className="max-w-4xl">
      <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
              <label className="text-sm font-semibold text-gray-700 md:text-right">Site Title</label>
              <div className="md:col-span-3">
                  <input 
                    type="text" 
                    value={localSettings.siteName}
                    onChange={(e) => updateLocalSettings({ siteName: e.target.value })}
                    className="w-full md:w-1/2 px-3 py-2 border border-gray-400 rounded shadow-sm focus:outline-none focus:border-blue-500 text-gray-600" 
                  />
              </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
              <label className="text-sm font-semibold text-gray-700 md:text-right">Tagline</label>
              <div className="md:col-span-3">
                  <input 
                    type="text" 
                    value={localSettings.tagline}
                    onChange={(e) => updateLocalSettings({ tagline: e.target.value })}
                    className="w-full md:w-2/3 px-3 py-2 border border-gray-400 rounded shadow-sm focus:outline-none focus:border-blue-500 text-gray-600" 
                  />
                  <p className="mt-1 text-xs text-gray-500">In a few words, explain what this site is about.</p>
              </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
              <label className="text-sm font-semibold text-gray-700 md:text-right">WordPress Address (URL)</label>
              <div className="md:col-span-3">
                  <input 
                    type="url" 
                    value={localSettings.siteUrl}
                    onChange={(e) => updateLocalSettings({ siteUrl: e.target.value })}
                    className="w-full md:w-1/2 px-3 py-2 border border-gray-400 rounded shadow-sm focus:outline-none focus:border-blue-500 text-gray-600" 
                  />
                  <p className="mt-1 text-xs text-gray-500">Enter the full URL of your site.</p>
              </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
              <label className="text-sm font-semibold text-gray-700 md:text-right">Site Address (URL)</label>
              <div className="md:col-span-3">
                  <input 
                    type="url" 
                    value={localSettings.siteUrl}
                    onChange={(e) => updateLocalSettings({ siteUrl: e.target.value })}
                    className="w-full md:w-1/2 px-3 py-2 border border-gray-400 rounded shadow-sm focus:outline-none focus:border-blue-500 text-gray-600" 
                  />
                  <p className="mt-1 text-xs text-gray-500">Enter the address you want people to type in their browser to reach your site.</p>
              </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
              <label className="text-sm font-semibold text-gray-700 md:text-right">Administration Email Address</label>
              <div className="md:col-span-3">
                  <input 
                    type="email" 
                    defaultValue="admin@nestpress.local" 
                    className="w-full md:w-1/2 px-3 py-2 border border-gray-400 rounded shadow-sm focus:outline-none focus:border-blue-500 text-gray-600" 
                  />
                  <p className="mt-1 text-xs text-gray-500">This address is used for admin purposes. If you change this, an email will be sent at your new address to confirm it.</p>
              </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
              <label className="text-sm font-semibold text-gray-700 md:text-right pt-2">Membership</label>
              <div className="md:col-span-3">
                  <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                      <span className="text-sm text-gray-600">Anyone can register</span>
                  </label>
              </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
              <label className="text-sm font-semibold text-gray-700 md:text-right">New User Default Role</label>
              <div className="md:col-span-3">
                  <select className="border border-gray-400 rounded px-3 py-2 text-sm text-gray-600">
                      <option>Subscriber</option>
                      <option>Author</option>
                      <option>Editor</option>
                      <option>Administrator</option>
                  </select>
              </div>
          </div>

           <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
              <label className="text-sm font-semibold text-gray-700 md:text-right">Site Language</label>
              <div className="md:col-span-3">
                  <select className="border border-gray-400 rounded px-3 py-2 text-sm text-gray-600 w-1/2">
                      <option>English (United States)</option>
                      <option>Spanish (Spain)</option>
                      <option>French (France)</option>
                      <option>German (Germany)</option>
                      <option>Japanese (Japan)</option>
                  </select>
              </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
              <label className="text-sm font-semibold text-gray-700 md:text-right">Timezone</label>
              <div className="md:col-span-3">
                  <select className="border border-gray-400 rounded px-3 py-2 text-sm text-gray-600 w-1/2">
                      <option>UTC+0</option>
                      <option>America/New_York</option>
                      <option>America/Los_Angeles</option>
                      <option>Europe/London</option>
                      <option>Asia/Tokyo</option>
                  </select>
                  <p className="mt-1 text-xs text-gray-500">Choose either a city in the same timezone as you or a UTC timezone offset.</p>
              </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
              <label className="text-sm font-semibold text-gray-700 md:text-right">Date Format</label>
              <div className="md:col-span-3">
                  <div className="space-y-2">
                      <label className="flex items-center gap-2">
                          <input type="radio" name="dateFormat" defaultChecked className="text-blue-600" />
                          <span className="text-sm text-gray-600">December 14, 2025</span>
                      </label>
                      <label className="flex items-center gap-2">
                          <input type="radio" name="dateFormat" className="text-blue-600" />
                          <span className="text-sm text-gray-600">2025-12-14</span>
                      </label>
                      <label className="flex items-center gap-2">
                          <input type="radio" name="dateFormat" className="text-blue-600" />
                          <span className="text-sm text-gray-600">12/14/2025</span>
                      </label>
                      <label className="flex items-center gap-2">
                          <input type="radio" name="dateFormat" className="text-blue-600" />
                          <span className="text-sm text-gray-600">14/12/2025</span>
                      </label>
                  </div>
              </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
              <label className="text-sm font-semibold text-gray-700 md:text-right">Time Format</label>
              <div className="md:col-span-3">
                  <div className="space-y-2">
                      <label className="flex items-center gap-2">
                          <input type="radio" name="timeFormat" defaultChecked className="text-blue-600" />
                          <span className="text-sm text-gray-600">2:30 PM</span>
                      </label>
                      <label className="flex items-center gap-2">
                          <input type="radio" name="timeFormat" className="text-blue-600" />
                          <span className="text-sm text-gray-600">14:30</span>
                      </label>
                  </div>
              </div>
          </div>

          <div className="pt-6 border-t border-gray-200">
               <button 
                 type="submit" 
                 disabled={saveStatus === 'saving'}
                 className="flex items-center gap-2 px-5 py-2 bg-[#2271b1] text-white rounded hover:bg-[#135e96] transition-colors text-sm font-medium disabled:opacity-50"
               >
                 <Save className="w-4 h-4" />
                 {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved!' : 'Save Changes'}
               </button>
          </div>
      </form>
    </div>
  );

  // Writing Settings Tab
  const renderWritingTab = () => (
    <div className="max-w-4xl">
      <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
          <label className="text-sm font-semibold text-gray-700 md:text-right">Default Post Category</label>
          <div className="md:col-span-3">
            <select className="border border-gray-400 rounded px-3 py-2 text-sm text-gray-600">
              <option>Uncategorized</option>
              <option>Technology</option>
              <option>Lifestyle</option>
              <option>Business</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
          <label className="text-sm font-semibold text-gray-700 md:text-right">Default Post Format</label>
          <div className="md:col-span-3">
            <select className="border border-gray-400 rounded px-3 py-2 text-sm text-gray-600">
              <option>Standard</option>
              <option>Aside</option>
              <option>Gallery</option>
              <option>Video</option>
              <option>Quote</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
          <label className="text-sm font-semibold text-gray-700 md:text-right pt-2">Post via email</label>
          <div className="md:col-span-3">
            <p className="text-xs text-gray-500 mb-3">To post to NestPress by email you must set up a secret email account with POP3 access. Any mail received at this address will be posted, so it's a good idea to keep this address very secret.</p>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Mail Server</label>
                <input type="text" placeholder="mail.example.com" className="w-full md:w-1/2 px-3 py-2 border border-gray-400 rounded text-sm" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Port</label>
                <input type="number" defaultValue="110" className="w-32 px-3 py-2 border border-gray-400 rounded text-sm" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Login Name</label>
                <input type="text" placeholder="login@example.com" className="w-full md:w-1/2 px-3 py-2 border border-gray-400 rounded text-sm" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Password</label>
                <input type="password" className="w-full md:w-1/2 px-3 py-2 border border-gray-400 rounded text-sm" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
          <label className="text-sm font-semibold text-gray-700 md:text-right pt-2">Update Services</label>
          <div className="md:col-span-3">
            <p className="text-xs text-gray-500 mb-2">When you publish a new post, NestPress automatically notifies the following site update services. For more about this, see <a href="#" className="text-blue-600 hover:underline">Update Services</a>.</p>
            <textarea 
              rows={3} 
              className="w-full md:w-2/3 px-3 py-2 border border-gray-400 rounded text-sm"
              defaultValue="http://rpc.pingomatic.com/"
            />
          </div>
        </div>

        <div className="pt-6 border-t border-gray-200">
          <button type="submit" className="flex items-center gap-2 px-5 py-2 bg-[#2271b1] text-white rounded hover:bg-[#135e96] transition-colors text-sm font-medium">
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );

  // Reading Settings Tab
  // Reading Settings Tab with WordPress-compliant validation
  const renderReadingTab = () => {
    const { pages } = useCMS();
    // Get published pages (case-insensitive to handle both 'Published' and 'published' from API)
    const publishedPages = pages.filter(p => p.status?.toLowerCase() === 'published');
    
    // WordPress-style client-side validation
    const validateReadingSettings = (): boolean => {
      if (localSettings.homepageType === 'page') {
        if (!localSettings.homepageId) {
          showToast('Please select a homepage when using a static front page', 'error');
          return false;
        }
        
        // WordPress validates: homepage and posts page cannot be the same
        if (localSettings.homepageId === localSettings.postsPageId && localSettings.postsPageId) {
          showToast('Homepage and posts page cannot be the same page', 'error');
          return false;
        }
      }
      
      // Validate posts per page range (WordPress allows 1-100)
      const postsPerPage = localSettings.postsPerPage || 10;
      if (postsPerPage < 1 || postsPerPage > 100) {
        showToast('Blog pages must show between 1 and 100 posts', 'error');
        return false;
      }
      
      return true;
    };
    
    const handleReadingSave = async (e: React.FormEvent) => {
      e.preventDefault();
      
      // WordPress-style pre-submit validation
      if (!validateReadingSettings()) {
        return;
      }
      
      await handleSave();
    };
    
    return (
      <div className="max-w-4xl">
        <form className="space-y-6" onSubmit={handleReadingSave}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
            <label className="text-sm font-semibold text-gray-700 md:text-right pt-2">Your homepage displays</label>
            <div className="md:col-span-3">
              <div className="space-y-3">
                <label className="flex items-center gap-2">
                  <input 
                    type="radio" 
                    name="homepage" 
                    checked={localSettings.homepageType === 'posts'}
                    onChange={() => updateLocalSettings({ homepageType: 'posts' })}
                    className="text-blue-600" 
                  />
                  <span className="text-sm text-gray-600">Your latest posts</span>
                </label>
                <label className="flex items-start gap-2">
                  <input 
                    type="radio" 
                    name="homepage" 
                    checked={localSettings.homepageType === 'page'}
                    onChange={() => updateLocalSettings({ homepageType: 'page' })}
                    className="text-blue-600 mt-1" 
                  />
                  <div>
                    <span className="text-sm text-gray-600">A static page (select below)</span>
                    <div className="mt-2 space-y-2 ml-6">
                      <div>
                        <label className="text-xs text-gray-600 mr-2">Homepage:</label>
                        <select 
                          className={`border rounded px-2 py-1 text-xs ${
                            localSettings.homepageType !== 'page' 
                              ? 'border-gray-300 bg-gray-50 cursor-not-allowed' 
                              : 'border-gray-400'
                          }`}
                          value={localSettings.homepageId || ''}
                          onChange={(e) => updateLocalSettings({ homepageId: e.target.value })}
                          disabled={localSettings.homepageType !== 'page'}
                          required={localSettings.homepageType === 'page'}
                        >
                          <option value="">— Select —</option>
                          {publishedPages.map(page => (
                            <option 
                              key={page.id} 
                              value={page.id}
                              disabled={page.id === localSettings.postsPageId}
                            >
                              {page.title}
                              {page.id === localSettings.postsPageId ? ' (Currently set as Posts page)' : ''}
                            </option>
                          ))}
                        </select>
                        {localSettings.homepageType === 'page' && !localSettings.homepageId && (
                          <p className="mt-1 text-xs text-amber-600">⚠️ Homepage selection required</p>
                        )}
                      </div>
                      <div>
                        <label className="text-xs text-gray-600 mr-2">Posts page:</label>
                        <select 
                          className={`border rounded px-2 py-1 text-xs ${
                            localSettings.homepageType !== 'page' 
                              ? 'border-gray-300 bg-gray-50 cursor-not-allowed' 
                              : 'border-gray-400'
                          }`}
                          value={localSettings.postsPageId || ''}
                          onChange={(e) => updateLocalSettings({ postsPageId: e.target.value })}
                          disabled={localSettings.homepageType !== 'page'}
                        >
                          <option value="">— Select —</option>
                          {publishedPages.map(page => (
                            <option 
                              key={page.id} 
                              value={page.id}
                              disabled={page.id === localSettings.homepageId}
                            >
                              {page.title}
                              {page.id === localSettings.homepageId ? ' (Currently set as Homepage)' : ''}
                            </option>
                          ))}
                        </select>
                        {localSettings.homepageId === localSettings.postsPageId && localSettings.postsPageId && (
                          <p className="mt-1 text-xs text-red-600">❌ Cannot be the same as homepage</p>
                        )}
                      </div>
                    </div>
                    {publishedPages.length === 0 && (
                      <p className="mt-2 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded p-2">
                        ℹ️ You need to create at least one page to use this feature. <a href="#" className="underline hover:text-amber-800">Create a page</a>
                      </p>
                    )}
                  </div>
                </label>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
            <label className="text-sm font-semibold text-gray-700 md:text-right">Blog pages show at most</label>
            <div className="md:col-span-3">
              <div className="flex items-center gap-2">
                <input 
                  type="number" 
                  min="1"
                  max="100"
                  value={localSettings.postsPerPage || 10}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 10;
                    // WordPress-style absint validation with bounds
                    updateLocalSettings({ postsPerPage: Math.max(1, Math.min(100, val)) });
                  }}
                  onBlur={(e) => {
                    // Ensure valid value on blur (WordPress behavior)
                    const val = parseInt(e.target.value) || 10;
                    if (val < 1 || val > 100) {
                      updateLocalSettings({ postsPerPage: val < 1 ? 1 : 100 });
                    }
                  }}
                  className="w-20 px-3 py-2 border border-gray-400 rounded text-sm" 
                  required
                />
                <span className="text-sm text-gray-600">posts</span>
              </div>
              <p className="mt-1 text-xs text-gray-500">Range: 1-100 posts per page</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
            <label className="text-sm font-semibold text-gray-700 md:text-right">Syndication feeds show the most recent</label>
            <div className="md:col-span-3">
              <div className="flex items-center gap-2">
                <input 
                  type="number" 
                  min="1"
                  max="50"
                  value={localSettings.feedItemsCount || 10}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 10;
                    // WordPress-style absint validation with bounds
                    updateLocalSettings({ feedItemsCount: Math.max(1, Math.min(50, val)) });
                  }}
                  onBlur={(e) => {
                    // Ensure valid value on blur
                    const val = parseInt(e.target.value) || 10;
                    if (val < 1 || val > 50) {
                      updateLocalSettings({ feedItemsCount: val < 1 ? 1 : 50 });
                    }
                  }}
                  className="w-20 px-3 py-2 border border-gray-400 rounded text-sm" 
                  required
                />
                <span className="text-sm text-gray-600">items</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
            <label className="text-sm font-semibold text-gray-700 md:text-right pt-2">For each post in a feed, include</label>
            <div className="md:col-span-3">
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input 
                    type="radio" 
                    name="feedContent" 
                    checked={!localSettings.feedShowSummary}
                    onChange={() => updateLocalSettings({ feedShowSummary: false })}
                    className="text-blue-600" 
                  />
                  <span className="text-sm text-gray-600">Full text</span>
                </label>
                <label className="flex items-center gap-2">
                  <input 
                    type="radio" 
                    name="feedContent" 
                    checked={localSettings.feedShowSummary === true}
                    onChange={() => updateLocalSettings({ feedShowSummary: true })}
                    className="text-blue-600" 
                  />
                  <span className="text-sm text-gray-600">Summary</span>
                </label>
              </div>
          </div>
        </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
            <label className="text-sm font-semibold text-gray-700 md:text-right pt-2">Search Engine Visibility</label>
            <div className="md:col-span-3">
              <label className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  checked={localSettings.discourageCrawlers || false}
                  onChange={(e) => updateLocalSettings({ discourageCrawlers: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600" 
                />
                <span className="text-sm text-gray-600">Discourage search engines from indexing this site</span>
              </label>
              <p className="mt-1 text-xs text-gray-500">It is up to search engines to honor this request.</p>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-200">
            <button type="submit" className="flex items-center gap-2 px-5 py-2 bg-[#2271b1] text-white rounded hover:bg-[#135e96] transition-colors text-sm font-medium">
              <Save className="w-4 h-4" />
              Save Changes
            </button>
          </div>
        </form>
      </div>
    );
  };

  // Discussion Settings Tab
  const renderDiscussionTab = () => (
    <div className="max-w-4xl">
      <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
          <label className="text-sm font-semibold text-gray-700 md:text-right pt-2">Default post settings</label>
          <div className="md:col-span-3">
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600" />
                <span className="text-sm text-gray-600">Attempt to notify any blogs linked to from the post</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600" />
                <span className="text-sm text-gray-600">Allow link notifications from other blogs (pingbacks and trackbacks) on new posts</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600" />
                <span className="text-sm text-gray-600">Allow people to submit comments on new posts</span>
              </label>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
          <label className="text-sm font-semibold text-gray-700 md:text-right pt-2">Other comment settings</label>
          <div className="md:col-span-3">
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded border-gray-300 text-blue-600" />
                <span className="text-sm text-gray-600">Comment author must fill out name and email</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded border-gray-300 text-blue-600" />
                <span className="text-sm text-gray-600">Users must be registered and logged in to comment</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600" />
                <span className="text-sm text-gray-600">Automatically close comments on posts older than</span>
              </label>
              <div className="ml-6 flex items-center gap-2">
                <input type="number" defaultValue="14" className="w-20 px-3 py-2 border border-gray-400 rounded text-sm" />
                <span className="text-sm text-gray-600">days</span>
              </div>
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600" />
                <span className="text-sm text-gray-600">Enable threaded (nested) comments</span>
              </label>
              <div className="ml-6 flex items-center gap-2">
                <input type="number" defaultValue="5" className="w-20 px-3 py-2 border border-gray-400 rounded text-sm" />
                <span className="text-sm text-gray-600">levels deep</span>
              </div>
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600" />
                <span className="text-sm text-gray-600">Break comments into pages with</span>
              </label>
              <div className="ml-6 flex items-center gap-2">
                <input type="number" defaultValue="50" className="w-20 px-3 py-2 border border-gray-400 rounded text-sm" />
                <span className="text-sm text-gray-600">top level comments per page and the</span>
                <select className="border border-gray-400 rounded px-2 py-1 text-xs">
                  <option>last</option>
                  <option>first</option>
                </select>
                <span className="text-sm text-gray-600">page displayed by default</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
          <label className="text-sm font-semibold text-gray-700 md:text-right pt-2">Email me whenever</label>
          <div className="md:col-span-3">
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600" />
                <span className="text-sm text-gray-600">Anyone posts a comment</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600" />
                <span className="text-sm text-gray-600">A comment is held for moderation</span>
              </label>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
          <label className="text-sm font-semibold text-gray-700 md:text-right pt-2">Before a comment appears</label>
          <div className="md:col-span-3">
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded border-gray-300 text-blue-600" />
                <span className="text-sm text-gray-600">Comment must be manually approved</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600" />
                <span className="text-sm text-gray-600">Comment author must have a previously approved comment</span>
              </label>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
          <label className="text-sm font-semibold text-gray-700 md:text-right pt-2">Comment Moderation</label>
          <div className="md:col-span-3">
            <p className="text-xs text-gray-500 mb-2">Hold a comment in the queue if it contains</p>
            <div className="flex items-center gap-2 mb-2">
              <input type="number" defaultValue="2" className="w-20 px-3 py-2 border border-gray-400 rounded text-sm" />
              <span className="text-sm text-gray-600">or more links. (A common characteristic of comment spam is a large number of hyperlinks.)</span>
            </div>
            <p className="text-xs text-gray-500 mb-2">When a comment contains any of these words in its content, author name, URL, email, IP address, or browser's user agent string, it will be held in the moderation queue. One word or IP address per line. It will match inside words, so "press" will match "NestPress".</p>
            <textarea rows={8} className="w-full px-3 py-2 border border-gray-400 rounded text-sm font-mono" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
          <label className="text-sm font-semibold text-gray-700 md:text-right pt-2">Comment Disallowed List</label>
          <div className="md:col-span-3">
            <p className="text-xs text-gray-500 mb-2">When a comment contains any of these words in its content, author name, URL, email, IP address, or browser's user agent string, it will be put in the Trash. One word or IP address per line. It will match inside words, so "press" will match "NestPress".</p>
            <textarea rows={8} className="w-full px-3 py-2 border border-gray-400 rounded text-sm font-mono" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
          <label className="text-sm font-semibold text-gray-700 md:text-right pt-2">Avatars</label>
          <div className="md:col-span-3">
            <label className="flex items-center gap-2 mb-4">
              <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600" />
              <span className="text-sm text-gray-600">Show Avatars</span>
            </label>
            <p className="text-xs font-semibold text-gray-600 mb-2">Maximum Rating</p>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input type="radio" name="avatarRating" defaultChecked className="text-blue-600" />
                <span className="text-sm text-gray-600">G — Suitable for all audiences</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="avatarRating" className="text-blue-600" />
                <span className="text-sm text-gray-600">PG — Possibly offensive, usually for audiences 13 and above</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="avatarRating" className="text-blue-600" />
                <span className="text-sm text-gray-600">R — Intended for adult audiences above 17</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="avatarRating" className="text-blue-600" />
                <span className="text-sm text-gray-600">X — Even more mature than above</span>
              </label>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-200">
          <button type="submit" className="flex items-center gap-2 px-5 py-2 bg-[#2271b1] text-white rounded hover:bg-[#135e96] transition-colors text-sm font-medium">
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );

  // Media Settings Tab
  const renderMediaTab = () => (
    <div className="max-w-4xl">
      <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
          <label className="text-sm font-semibold text-gray-700 md:text-right pt-2">Image sizes</label>
          <div className="md:col-span-3">
            <p className="text-xs text-gray-500 mb-4">The sizes listed below determine the maximum dimensions in pixels to use when adding an image to the Media Library.</p>
            
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-gray-600 mb-2">Thumbnail size</p>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-gray-600">Width</label>
                  <input type="number" defaultValue="150" className="w-20 px-2 py-1 border border-gray-400 rounded text-sm" />
                  <label className="text-xs text-gray-600 ml-4">Height</label>
                  <input type="number" defaultValue="150" className="w-20 px-2 py-1 border border-gray-400 rounded text-sm" />
                </div>
                <label className="flex items-center gap-2 mt-2">
                  <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600" />
                  <span className="text-xs text-gray-600">Crop thumbnail to exact dimensions (normally thumbnails are proportional)</span>
                </label>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-600 mb-2">Medium size</p>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-gray-600">Max Width</label>
                  <input type="number" defaultValue="300" className="w-20 px-2 py-1 border border-gray-400 rounded text-sm" />
                  <label className="text-xs text-gray-600 ml-4">Max Height</label>
                  <input type="number" defaultValue="300" className="w-20 px-2 py-1 border border-gray-400 rounded text-sm" />
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-600 mb-2">Large size</p>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-gray-600">Max Width</label>
                  <input type="number" defaultValue="1024" className="w-24 px-2 py-1 border border-gray-400 rounded text-sm" />
                  <label className="text-xs text-gray-600 ml-4">Max Height</label>
                  <input type="number" defaultValue="1024" className="w-24 px-2 py-1 border border-gray-400 rounded text-sm" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
          <label className="text-sm font-semibold text-gray-700 md:text-right pt-2">Uploading Files</label>
          <div className="md:col-span-3">
            <label className="flex items-center gap-2">
              <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600" />
              <span className="text-sm text-gray-600">Organize my uploads into month- and year-based folders</span>
            </label>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-200">
          <button type="submit" className="flex items-center gap-2 px-5 py-2 bg-[#2271b1] text-white rounded hover:bg-[#135e96] transition-colors text-sm font-medium">
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );

  // Permalinks Settings Tab
  const renderPermalinksTab = () => (
    <div className="max-w-4xl">
      <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
          <label className="text-sm font-semibold text-gray-700 md:text-right pt-2">Permalink structure</label>
          <div className="md:col-span-3">
            <div className="space-y-3">
              <label className="flex items-start gap-2">
                <input type="radio" name="permalink" className="text-blue-600 mt-1" />
                <div>
                  <span className="text-sm text-gray-600">Plain</span>
                  <p className="text-xs text-gray-500 mt-1">http://nestpress.local/?p=123</p>
                </div>
              </label>
              <label className="flex items-start gap-2">
                <input type="radio" name="permalink" className="text-blue-600 mt-1" />
                <div>
                  <span className="text-sm text-gray-600">Day and name</span>
                  <p className="text-xs text-gray-500 mt-1">http://nestpress.local/2025/12/14/sample-post/</p>
                </div>
              </label>
              <label className="flex items-start gap-2">
                <input type="radio" name="permalink" className="text-blue-600 mt-1" />
                <div>
                  <span className="text-sm text-gray-600">Month and name</span>
                  <p className="text-xs text-gray-500 mt-1">http://nestpress.local/2025/12/sample-post/</p>
                </div>
              </label>
              <label className="flex items-start gap-2">
                <input type="radio" name="permalink" className="text-blue-600 mt-1" />
                <div>
                  <span className="text-sm text-gray-600">Numeric</span>
                  <p className="text-xs text-gray-500 mt-1">http://nestpress.local/archives/123</p>
                </div>
              </label>
              <label className="flex items-start gap-2">
                <input type="radio" name="permalink" defaultChecked className="text-blue-600 mt-1" />
                <div>
                  <span className="text-sm text-gray-600">Post name</span>
                  <p className="text-xs text-gray-500 mt-1">http://nestpress.local/sample-post/</p>
                </div>
              </label>
              <label className="flex items-start gap-2">
                <input type="radio" name="permalink" className="text-blue-600 mt-1" />
                <div className="flex-1">
                  <span className="text-sm text-gray-600">Custom Structure</span>
                  <input 
                    type="text" 
                    placeholder="/archives/%year%/%monthnum%/%day%/%postname%/" 
                    className="w-full mt-2 px-3 py-2 border border-gray-400 rounded text-sm"
                  />
                </div>
              </label>
            </div>
            <p className="text-xs text-gray-500 mt-3">Available tags: %year%, %monthnum%, %day%, %hour%, %minute%, %second%, %post_id%, %postname%, %category%, %author%</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
          <label className="text-sm font-semibold text-gray-700 md:text-right pt-2">Optional</label>
          <div className="md:col-span-3">
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Category base</label>
                <input type="text" placeholder="category" className="w-full md:w-1/2 px-3 py-2 border border-gray-400 rounded text-sm" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Tag base</label>
                <input type="text" placeholder="tag" className="w-full md:w-1/2 px-3 py-2 border border-gray-400 rounded text-sm" />
              </div>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-200">
          <button type="submit" className="flex items-center gap-2 px-5 py-2 bg-[#2271b1] text-white rounded hover:bg-[#135e96] transition-colors text-sm font-medium">
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );

  // Privacy Settings Tab
  const renderPrivacyTab = () => (
    <div className="max-w-4xl">
      <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
          <label className="text-sm font-semibold text-gray-700 md:text-right pt-2">Privacy Policy page</label>
          <div className="md:col-span-3">
            <select className="border border-gray-400 rounded px-3 py-2 text-sm text-gray-600 w-full md:w-1/2">
              <option>— Select —</option>
              <option>Privacy Policy</option>
              <option>Legal</option>
            </select>
            <p className="mt-2 text-xs text-gray-500">
              Select a page to act as this site's privacy policy. If you don't have a privacy policy yet, you can <a href="#" className="text-blue-600 hover:underline">create one here</a>.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
          <label className="text-sm font-semibold text-gray-700 md:text-right pt-2">Policy Information</label>
          <div className="md:col-span-3">
            <div className="bg-blue-50 border border-blue-200 rounded p-4">
              <p className="text-sm text-gray-700 mb-2">As a website owner, you may need to follow national or international privacy laws. For example, you may need to create and display a Privacy Policy.</p>
              <p className="text-sm text-gray-700 mb-2">If you already have a Privacy Policy page, please select it below. If not, please create one.</p>
              <p className="text-sm text-gray-700">The new page will include help and suggestions for your privacy policy.</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
          <label className="text-sm font-semibold text-gray-700 md:text-right pt-2">Data Collection</label>
          <div className="md:col-span-3">
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600" />
                <span className="text-sm text-gray-600">Allow data collection for analytics</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded border-gray-300 text-blue-600" />
                <span className="text-sm text-gray-600">Enable third-party cookies</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600" />
                <span className="text-sm text-gray-600">Show cookie consent banner</span>
              </label>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
          <label className="text-sm font-semibold text-gray-700 md:text-right pt-2">GDPR Compliance</label>
          <div className="md:col-span-3">
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600" />
                <span className="text-sm text-gray-600">Enable "Right to be Forgotten" requests</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600" />
                <span className="text-sm text-gray-600">Allow users to export their data</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded border-gray-300 text-blue-600" />
                <span className="text-sm text-gray-600">Anonymize IP addresses in logs</span>
              </label>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-200">
          <button type="submit" className="flex items-center gap-2 px-5 py-2 bg-[#2271b1] text-white rounded hover:bg-[#135e96] transition-colors text-sm font-medium">
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );

  // System Configuration Tab
  const renderSystemTab = () => (
    <div className="max-w-4xl space-y-8">
      {/* Connection Status */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Backend Connection</h2>
        <div className={`flex items-center gap-3 p-4 rounded-lg ${apiConnected ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
          {apiConnected ? (
            <>
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-medium text-green-800">Connected to Backend</p>
                <p className="text-sm text-green-600">Configuration is synced with the server</p>
              </div>
            </>
          ) : (
            <>
              <XCircle className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="font-medium text-yellow-800">Offline Mode</p>
                <p className="text-sm text-yellow-600">Using local storage. Start the backend to enable sync.</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Database Seeding */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Database Setup</h2>
        <p className="text-sm text-gray-600 mb-4">
          Initialize your site with default pages (Home, About, Contact, Blog).
        </p>
        <button
          onClick={async () => {
            try {
              const token = localStorage.getItem('nestpress_access_token');
              const response = await fetch('http://localhost:4000/api/v1/posts/seed/default-pages', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
              });
              
              if (response.ok) {
                showToast('Default pages created successfully!', 'success');
              } else {
                const error = await response.json();
                showToast(error.message || 'Failed to create default pages', 'error');
              }
            } catch (error) {
              showToast('Error creating default pages. Make sure the backend is running.', 'error');
            }
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium"
        >
          <Database className="w-4 h-4" />
          Seed Default Pages
        </button>
      </div>

      {/* Provider Configuration Status */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Service Providers</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div onClick={() => setShowDatabaseConfig(true)} className="cursor-pointer">
            <ProviderCard
              icon={<Database className="w-5 h-5" />}
              name="Database"
              provider={systemConfig.database.provider}
              configured={systemConfig.database.configured}
              enabled={systemConfig.database.enabled}
            />
          </div>
          <div onClick={() => setShowAIConfig(true)} className="cursor-pointer">
            <ProviderCard
              icon={<Sparkles className="w-5 h-5" />}
              name="AI Services"
              provider={systemConfig.ai.provider}
              configured={systemConfig.ai.configured}
              enabled={systemConfig.ai.enabled}
            />
          </div>
          <div onClick={() => setShowPaymentConfig(true)} className="cursor-pointer">
            <ProviderCard
              icon={<CreditCard className="w-5 h-5" />}
              name="Payments"
              provider={systemConfig.payment.provider}
              configured={systemConfig.payment.configured}
              enabled={systemConfig.payment.enabled}
            />
          </div>
          <div onClick={() => setShowStorageConfig(true)} className="cursor-pointer">
            <ProviderCard
              icon={<HardDrive className="w-5 h-5" />}
              name="Storage"
              provider={systemConfig.storage.provider}
              configured={systemConfig.storage.configured}
              enabled={systemConfig.storage.enabled}
            />
          </div>
        </div>
      </div>

      {/* Reset Setup */}
      <div className="bg-white rounded-lg border border-red-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Danger Zone</h2>
        <p className="text-sm text-gray-600 mb-4">
          Reset the setup wizard to reconfigure all services. This will not delete any content.
        </p>
        
        {showResetConfirm ? (
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-red-800">Are you sure?</p>
                <p className="text-sm text-red-600 mb-4">
                  This will reset the setup wizard and you'll need to reconfigure your services.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      resetWizard();
                      setShowResetConfirm(false);
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm font-medium"
                  >
                    Yes, Reset Setup
                  </button>
                  <button
                    onClick={() => setShowResetConfirm(false)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowResetConfirm(true)}
            className="flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded hover:bg-red-50 text-sm font-medium"
          >
            <RefreshCw className="w-4 h-4" />
            Reset Setup Wizard
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-normal text-gray-800">
        {activeTab === 'System' ? 'System Configuration' : `${activeTab} Settings`}
      </h1>

      {/* Tabs */}
      <div className="border-b border-gray-300">
        <nav className="-mb-px flex space-x-6 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm
                ${activeTab === tab
                  ? 'border-blue-500 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
              `}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'General' && renderGeneralTab()}
      {activeTab === 'Writing' && renderWritingTab()}
      {activeTab === 'Reading' && renderReadingTab()}
      {activeTab === 'Discussion' && renderDiscussionTab()}
      {activeTab === 'Media' && renderMediaTab()}
      {activeTab === 'Permalinks' && renderPermalinksTab()}
      {activeTab === 'Privacy' && renderPrivacyTab()}
      {activeTab === 'System' && renderSystemTab()}

      {/* AI Configuration Modal */}
      {showAIConfig && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowAIConfig(false)}>
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-semibold mb-4">AI Services Configuration</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Provider</label>
                <select
                  value={aiSettings.provider}
                  onChange={(e) => setAiSettings({ ...aiSettings, provider: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                >
                  <option value="gemini">Google Gemini</option>
                  <option value="openai">OpenAI</option>
                  <option value="anthropic">Anthropic Claude</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  API Key {aiSettings.provider === 'gemini' && '(GEMINI_API_KEY)'}
                  {aiSettings.provider === 'openai' && '(OPENAI_API_KEY)'}
                  {aiSettings.provider === 'anthropic' && '(ANTHROPIC_API_KEY)'}
                </label>
                <input
                  type="password"
                  value={aiSettings.apiKey}
                  onChange={(e) => setAiSettings({ ...aiSettings, apiKey: e.target.value })}
                  placeholder="Enter your API key"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
                <p className="mt-1 text-xs text-gray-500">
                  {aiSettings.provider === 'gemini' && 'Get your key from https://aistudio.google.com/apikey'}
                  {aiSettings.provider === 'openai' && 'Get your key from https://platform.openai.com/api-keys'}
                  {aiSettings.provider === 'anthropic' && 'Get your key from https://console.anthropic.com/'}
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-800">
                  <strong>Note:</strong> Add this to your <code className="bg-blue-100 px-1 rounded">backend/.env</code> file:
                </p>
                <code className="block mt-2 text-xs bg-blue-100 p-2 rounded">
                  {aiSettings.provider === 'gemini' && `GEMINI_API_KEY=${aiSettings.apiKey || 'your-key-here'}`}
                  {aiSettings.provider === 'openai' && `OPENAI_API_KEY=${aiSettings.apiKey || 'your-key-here'}`}
                  {aiSettings.provider === 'anthropic' && `ANTHROPIC_API_KEY=${aiSettings.apiKey || 'your-key-here'}`}
                  <br />
                  AI_PROVIDER={aiSettings.provider}
                </code>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={async () => {
                  if (!aiSettings.apiKey) {
                    showToast('Please enter an API key', 'error');
                    return;
                  }
                  try {
                    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';
                    const token = localStorage.getItem('nestpress_access_token');
                    const response = await fetch(`${API_BASE_URL}/system-config/ai-credentials`, {
                      method: 'PATCH',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                      },
                      body: JSON.stringify({
                        provider: aiSettings.provider,
                        apiKey: aiSettings.apiKey,
                      }),
                    });
                    const result = await response.json();
                    if (result.success) {
                      showToast('AI credentials saved successfully!', 'success');
                      setShowAIConfig(false);
                      setAiSettings({ provider: 'gemini', apiKey: '' });
                      // Reload system config to reflect changes
                      window.location.reload();
                    } else {
                      showToast('Failed to save credentials', 'error');
                    }
                  } catch (error) {
                    showToast('Error saving credentials', 'error');
                  }
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Save Credentials
              </button>
              <button
                onClick={() => setShowAIConfig(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Database Configuration Modal */}
      {showDatabaseConfig && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">Database Configuration</h3>
              <p className="text-sm text-gray-600 mt-1">Configure your database connection</p>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Database Provider</label>
                <select
                  value={databaseSettings.provider}
                  onChange={(e) => setDatabaseSettings({ ...databaseSettings, provider: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="mongodb">MongoDB</option>
                  <option value="firebase">Firebase Firestore</option>
                  <option value="dynamodb">AWS DynamoDB</option>
                  <option value="supabase">Supabase (PostgreSQL)</option>
                </select>
              </div>

              {databaseSettings.provider === 'mongodb' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">MongoDB Connection URI</label>
                  <input
                    type="text"
                    value={databaseSettings.uri}
                    onChange={(e) => setDatabaseSettings({ ...databaseSettings, uri: e.target.value })}
                    placeholder="mongodb://localhost:27017/nestpress"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Get MongoDB Atlas free tier: <a href="https://www.mongodb.com/cloud/atlas/register" target="_blank" className="text-blue-600 hover:underline">mongodb.com/cloud/atlas</a>
                  </p>
                </div>
              )}

              {databaseSettings.provider === 'firebase' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Firebase Project ID</label>
                  <input
                    type="text"
                    value={databaseSettings.projectId}
                    onChange={(e) => setDatabaseSettings({ ...databaseSettings, projectId: e.target.value })}
                    placeholder="my-firebase-project"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Get Firebase project: <a href="https://console.firebase.google.com" target="_blank" className="text-blue-600 hover:underline">console.firebase.google.com</a>
                  </p>
                </div>
              )}

              {databaseSettings.provider === 'dynamodb' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">AWS Region</label>
                  <input
                    type="text"
                    value={databaseSettings.region}
                    onChange={(e) => setDatabaseSettings({ ...databaseSettings, region: e.target.value })}
                    placeholder="us-east-1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Get AWS account: <a href="https://aws.amazon.com/dynamodb/" target="_blank" className="text-blue-600 hover:underline">aws.amazon.com/dynamodb</a>
                  </p>
                </div>
              )}

              {databaseSettings.provider === 'supabase' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Supabase URL</label>
                    <input
                      type="text"
                      value={databaseSettings.uri}
                      onChange={(e) => setDatabaseSettings({ ...databaseSettings, uri: e.target.value })}
                      placeholder="https://xxx.supabase.co"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Supabase API Key</label>
                    <input
                      type="password"
                      value={databaseSettings.apiKey}
                      onChange={(e) => setDatabaseSettings({ ...databaseSettings, apiKey: e.target.value })}
                      placeholder="Your Supabase anon/service key"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Get free Supabase account: <a href="https://supabase.com" target="_blank" className="text-blue-600 hover:underline">supabase.com</a>
                    </p>
                  </div>
                </>
              )}
            </div>
            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={async () => {
                  const hasRequiredField = 
                    (databaseSettings.provider === 'mongodb' && databaseSettings.uri) ||
                    (databaseSettings.provider === 'firebase' && databaseSettings.projectId) ||
                    (databaseSettings.provider === 'dynamodb' && databaseSettings.region) ||
                    (databaseSettings.provider === 'supabase' && databaseSettings.uri && databaseSettings.apiKey);

                  if (!hasRequiredField) {
                    showToast('Please fill in all required fields', 'error');
                    return;
                  }

                  try {
                    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';
                    const token = localStorage.getItem('nestpress_access_token');
                    const response = await fetch(`${API_BASE_URL}/system-config/database-credentials`, {
                      method: 'PATCH',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                      },
                      body: JSON.stringify(databaseSettings),
                    });
                    const result = await response.json();
                    if (result.success) {
                      showToast('Database credentials saved successfully!', 'success');
                      setShowDatabaseConfig(false);
                      setDatabaseSettings({ provider: 'mongodb', uri: '', projectId: '', region: '', apiKey: '' });
                      window.location.reload();
                    } else {
                      showToast('Failed to save credentials', 'error');
                    }
                  } catch (error) {
                    showToast('Error saving credentials', 'error');
                  }
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Save Credentials
              </button>
              <button
                onClick={() => setShowDatabaseConfig(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Configuration Modal */}
      {showPaymentConfig && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">Payment Configuration</h3>
              <p className="text-sm text-gray-600 mt-1">Configure your payment gateway</p>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Provider</label>
                <select
                  value={paymentSettings.provider}
                  onChange={(e) => setPaymentSettings({ ...paymentSettings, provider: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="stripe">Stripe</option>
                  <option value="paypal">PayPal</option>
                  <option value="square">Square</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {paymentSettings.provider === 'stripe' ? 'Publishable Key' : 
                   paymentSettings.provider === 'paypal' ? 'Client ID' : 'Application ID'}
                </label>
                <input
                  type="text"
                  value={paymentSettings.publishableKey}
                  onChange={(e) => setPaymentSettings({ ...paymentSettings, publishableKey: e.target.value })}
                  placeholder={paymentSettings.provider === 'stripe' ? 'pk_test_...' : 'Your client/app ID'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {paymentSettings.provider === 'stripe' ? 'Secret Key' : 
                   paymentSettings.provider === 'paypal' ? 'Client Secret' : 'Access Token'}
                </label>
                <input
                  type="password"
                  value={paymentSettings.secretKey}
                  onChange={(e) => setPaymentSettings({ ...paymentSettings, secretKey: e.target.value })}
                  placeholder={paymentSettings.provider === 'stripe' ? 'sk_test_...' : 'Your secret/token'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="testMode"
                  checked={paymentSettings.testMode}
                  onChange={(e) => setPaymentSettings({ ...paymentSettings, testMode: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="testMode" className="text-sm text-gray-700">
                  Test mode (use test credentials)
                </label>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-xs text-blue-800">
                  {paymentSettings.provider === 'stripe' && (
                    <>Get your API keys: <a href="https://dashboard.stripe.com/test/apikeys" target="_blank" className="underline">dashboard.stripe.com/test/apikeys</a></>
                  )}
                  {paymentSettings.provider === 'paypal' && (
                    <>Get your credentials: <a href="https://developer.paypal.com/dashboard" target="_blank" className="underline">developer.paypal.com/dashboard</a></>
                  )}
                  {paymentSettings.provider === 'square' && (
                    <>Get your credentials: <a href="https://developer.squareup.com/apps" target="_blank" className="underline">developer.squareup.com/apps</a></>
                  )}
                </p>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={async () => {
                  if (!paymentSettings.publishableKey || !paymentSettings.secretKey) {
                    showToast('Please fill in all required fields', 'error');
                    return;
                  }

                  try {
                    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';
                    const token = localStorage.getItem('nestpress_access_token');
                    const response = await fetch(`${API_BASE_URL}/system-config/payment-credentials`, {
                      method: 'PATCH',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                      },
                      body: JSON.stringify(paymentSettings),
                    });
                    const result = await response.json();
                    if (result.success) {
                      showToast('Payment credentials saved successfully!', 'success');
                      setShowPaymentConfig(false);
                      setPaymentSettings({ provider: 'stripe', publishableKey: '', secretKey: '', testMode: true });
                      window.location.reload();
                    } else {
                      showToast('Failed to save credentials', 'error');
                    }
                  } catch (error) {
                    showToast('Error saving credentials', 'error');
                  }
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Save Credentials
              </button>
              <button
                onClick={() => setShowPaymentConfig(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Storage Configuration Modal */}
      {showStorageConfig && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">Storage Configuration</h3>
              <p className="text-sm text-gray-600 mt-1">Configure your file storage provider</p>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Storage Provider</label>
                <select
                  value={storageSettings.provider}
                  onChange={(e) => setStorageSettings({ ...storageSettings, provider: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="local">Local Storage</option>
                  <option value="s3">AWS S3</option>
                  <option value="cloudinary">Cloudinary</option>
                  <option value="firebase-storage">Firebase Storage</option>
                </select>
              </div>

              {storageSettings.provider === 's3' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">S3 Bucket Name</label>
                    <input
                      type="text"
                      value={storageSettings.bucket}
                      onChange={(e) => setStorageSettings({ ...storageSettings, bucket: e.target.value })}
                      placeholder="my-bucket-name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">AWS Access Key ID</label>
                    <input
                      type="text"
                      value={storageSettings.accessKey}
                      onChange={(e) => setStorageSettings({ ...storageSettings, accessKey: e.target.value })}
                      placeholder="AKIAIOSFODNN7EXAMPLE"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">AWS Secret Access Key</label>
                    <input
                      type="password"
                      value={storageSettings.secretKey}
                      onChange={(e) => setStorageSettings({ ...storageSettings, secretKey: e.target.value })}
                      placeholder="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">AWS Region</label>
                    <input
                      type="text"
                      value={storageSettings.region}
                      onChange={(e) => setStorageSettings({ ...storageSettings, region: e.target.value })}
                      placeholder="us-east-1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    Get AWS S3: <a href="https://aws.amazon.com/s3/" target="_blank" className="text-blue-600 hover:underline">aws.amazon.com/s3</a>
                  </p>
                </>
              )}

              {storageSettings.provider === 'cloudinary' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Cloud Name</label>
                    <input
                      type="text"
                      value={storageSettings.bucket}
                      onChange={(e) => setStorageSettings({ ...storageSettings, bucket: e.target.value })}
                      placeholder="my-cloud-name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">API Key</label>
                    <input
                      type="text"
                      value={storageSettings.accessKey}
                      onChange={(e) => setStorageSettings({ ...storageSettings, accessKey: e.target.value })}
                      placeholder="123456789012345"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">API Secret</label>
                    <input
                      type="password"
                      value={storageSettings.secretKey}
                      onChange={(e) => setStorageSettings({ ...storageSettings, secretKey: e.target.value })}
                      placeholder="Your API secret"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    Get free Cloudinary account: <a href="https://cloudinary.com/users/register/free" target="_blank" className="text-blue-600 hover:underline">cloudinary.com</a>
                  </p>
                </>
              )}

              {storageSettings.provider === 'firebase-storage' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Storage Bucket</label>
                    <input
                      type="text"
                      value={storageSettings.bucket}
                      onChange={(e) => setStorageSettings({ ...storageSettings, bucket: e.target.value })}
                      placeholder="my-project.appspot.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    Get Firebase Storage: <a href="https://console.firebase.google.com" target="_blank" className="text-blue-600 hover:underline">console.firebase.google.com</a>
                  </p>
                </>
              )}

              {storageSettings.provider === 'local' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    Local storage uses the server's file system. No additional configuration required.
                  </p>
                </div>
              )}
            </div>
            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={async () => {
                  if (storageSettings.provider !== 'local') {
                    const hasRequiredFields = 
                      (storageSettings.provider === 's3' && storageSettings.bucket && storageSettings.accessKey && storageSettings.secretKey && storageSettings.region) ||
                      (storageSettings.provider === 'cloudinary' && storageSettings.bucket && storageSettings.accessKey && storageSettings.secretKey) ||
                      (storageSettings.provider === 'firebase-storage' && storageSettings.bucket);

                    if (!hasRequiredFields) {
                      showToast('Please fill in all required fields', 'error');
                      return;
                    }
                  }

                  try {
                    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';
                    const token = localStorage.getItem('nestpress_access_token');
                    const response = await fetch(`${API_BASE_URL}/system-config/storage-credentials`, {
                      method: 'PATCH',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                      },
                      body: JSON.stringify(storageSettings),
                    });
                    const result = await response.json();
                    if (result.success) {
                      showToast('Storage credentials saved successfully!', 'success');
                      setShowStorageConfig(false);
                      setStorageSettings({ provider: 's3', bucket: '', accessKey: '', secretKey: '', region: '' });
                      window.location.reload();
                    } else {
                      showToast('Failed to save credentials', 'error');
                    }
                  } catch (error) {
                    showToast('Error saving credentials', 'error');
                  }
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Save Credentials
              </button>
              <button
                onClick={() => setShowStorageConfig(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Provider Card Component
const ProviderCard: React.FC<{
  icon: React.ReactNode;
  name: string;
  provider: string;
  configured: boolean;
  enabled: boolean;
}> = ({ icon, name, provider, configured, enabled }) => (
  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
      enabled && configured ? 'bg-green-100 text-green-600' : 
      enabled ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-200 text-gray-500'
    }`}>
      {icon}
    </div>
    <div className="flex-1">
      <p className="font-medium text-gray-900">{name}</p>
      <p className="text-sm text-gray-500 capitalize">
        {provider === 'none' ? 'Not configured' : provider}
      </p>
    </div>
    {enabled && (
      <div className={`px-2 py-1 rounded text-xs font-medium ${
        configured ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
      }`}>
        {configured ? 'Ready' : 'Pending'}
      </div>
    )}
  </div>
);

export default Settings;