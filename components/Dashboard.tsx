import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FileText, MessageSquare, Eye, Clock, Package, ShoppingCart, Users, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { useCMS } from '../contexts/CMSContext';
import { healthApi, pluginsApi } from '../services/api';
import { DataCard, DataCardHeader, DataCardBody } from './common/DataCard';

interface HealthStatus {
  status: string;
  timestamp: string;
  version?: string;
  uptime?: number;
  database?: { status: string };
}

interface DashboardWidget {
  id: string;
  title: string;
  content: string | React.ReactNode;
  position?: 'main' | 'side';
}

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode; color: string; isLoading?: boolean }> = ({ 
  title, value, icon, color, isLoading 
}) => (
  <DataCard>
    <DataCardBody className="flex items-center justify-between">
    <div>
      <p className="text-gray-500 text-sm font-medium">{title}</p>
      {isLoading ? (
        <div className="h-8 w-12 bg-gray-200 animate-pulse rounded mt-1" />
      ) : (
        <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
      )}
    </div>
    <div className={`p-3 rounded-full ${color}`}>
      {icon}
    </div>
    </DataCardBody>
  </DataCard>
);

const Dashboard: React.FC = () => {
  const { posts, pages, comments, products, orders, users, isLoading, error, apiStatus, refetchData } = useCMS();
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  const [healthLoading, setHealthLoading] = useState(true);
  const [pluginWidgets, setPluginWidgets] = useState<DashboardWidget[]>([]);

  // Load plugin widgets
  const loadWidgets = async () => {
    try {
      const widgets = await pluginsApi.getDashboardWidgets();
      setPluginWidgets(widgets);
    } catch (err) {
      console.error('Failed to load plugin widgets:', err);
      setPluginWidgets([]);
    }
  };

  // Fetch health status
  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const health = await healthApi.getStatus();
        setHealthStatus(health);
      } catch (err) {
        console.error('Failed to fetch health status:', err);
      } finally {
        setHealthLoading(false);
      }
    };
    fetchHealth();
  }, []);

  // Load plugin dashboard widgets - refresh whenever component is in view
  useEffect(() => {
    loadWidgets();
    
    const handleFocus = () => loadWidgets();
    window.addEventListener('focus', handleFocus);
    
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  // Format uptime
  const formatUptime = (seconds?: number): string => {
    if (!seconds) return 'N/A';
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  // Calculate stats
  const totalPosts = posts.length + pages.length;
  const pendingComments = comments.filter(c => c.status === 'Pending').length;
  const activeProducts = products.filter(p => p.status === 'Active').length;
  const pendingOrders = orders.filter(o => o.status === 'Pending').length;
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-800">Dashboard</h1>
        <button 
          onClick={() => {
            refetchData();
            loadWidgets();
          }}
          disabled={isLoading}
          className="flex items-center px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
        >
          <RefreshCw size={16} className={`mr-2 ${isLoading ? 'animate-spin' : ''}`} /> 
          Refresh
        </button>
      </div>

      {/* API Status Banner */}
      {apiStatus !== 'connected' && (
        <div className={`p-4 rounded-lg flex items-center gap-3 ${
          apiStatus === 'connecting' ? 'bg-yellow-50 border border-yellow-200' :
          apiStatus === 'error' ? 'bg-red-50 border border-red-200' :
          'bg-orange-50 border border-orange-200'
        }`}>
          {apiStatus === 'connecting' ? (
            <Loader2 className="w-5 h-5 text-yellow-600 animate-spin" />
          ) : (
            <AlertCircle className={`w-5 h-5 ${apiStatus === 'error' ? 'text-red-600' : 'text-orange-600'}`} />
          )}
          <div>
            <p className={`font-medium ${
              apiStatus === 'connecting' ? 'text-yellow-800' :
              apiStatus === 'error' ? 'text-red-800' : 'text-orange-800'
            }`}>
              {apiStatus === 'connecting' ? 'Connecting to API...' :
               apiStatus === 'error' ? 'API Connection Error' : 'API Offline'}
            </p>
            {error && <p className="text-sm text-gray-600">{error}</p>}
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Content" 
          value={totalPosts.toString()} 
          icon={<FileText className="text-blue-600" size={24} />} 
          color="bg-blue-100"
          isLoading={isLoading}
        />
        <StatCard 
          title="Pending Comments" 
          value={pendingComments.toString()} 
          icon={<MessageSquare className="text-green-600" size={24} />} 
          color="bg-green-100"
          isLoading={isLoading}
        />
        <StatCard 
          title="Active Products" 
          value={activeProducts.toString()} 
          icon={<Package className="text-purple-600" size={24} />} 
          color="bg-purple-100"
          isLoading={isLoading}
        />
        <StatCard 
          title="System Uptime" 
          value={formatUptime(healthStatus?.uptime)} 
          icon={<Clock className="text-orange-600" size={24} />} 
          color="bg-orange-100"
          isLoading={healthLoading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DataCard>
          <DataCardHeader>At a Glance</DataCardHeader>
          <DataCardBody>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-6 bg-gray-100 animate-pulse rounded" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center text-gray-600">
                <FileText size={16} className="mr-2" />
                <span className="font-semibold mr-1">{posts.length}</span> Posts
              </div>
              <div className="flex items-center text-gray-600">
                <FileText size={16} className="mr-2" />
                <span className="font-semibold mr-1">{pages.length}</span> Pages
              </div>
              <div className="flex items-center text-gray-600">
                <MessageSquare size={16} className="mr-2" />
                <span className="font-semibold mr-1">{pendingComments}</span> Comments in moderation
              </div>
              <div className="flex items-center text-gray-600">
                <Package size={16} className="mr-2" />
                <span className="font-semibold mr-1">{products.length}</span> Products
              </div>
              <div className="flex items-center text-gray-600">
                <ShoppingCart size={16} className="mr-2" />
                <span className="font-semibold mr-1">{pendingOrders}</span> Pending Orders
              </div>
              <div className="flex items-center text-gray-600">
                <Users size={16} className="mr-2" />
                <span className="font-semibold mr-1">{users.length}</span> Users
              </div>
            </div>
          )}
          <div className="mt-4 pt-4 border-t border-gray-100 text-sm text-gray-500">
            NestPress {healthStatus?.version || '1.0.0'} • API Status: {' '}
            <span className={apiStatus === 'connected' ? 'text-green-600' : 'text-red-600'}>
              {apiStatus === 'connected' ? 'Connected' : apiStatus}
            </span>
          </div>
          </DataCardBody>
        </DataCard>

        <DataCard>
          <DataCardHeader>Recent Orders</DataCardHeader>
          <DataCardBody>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-12 bg-gray-100 animate-pulse rounded" />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <p className="text-gray-500 text-sm">No orders yet</p>
          ) : (
            <div className="space-y-3">
              {orders.slice(0, 5).map(order => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium text-gray-800">{order.id}</p>
                    <p className="text-sm text-gray-500">{order.customerName}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-800">${order.total.toFixed(2)}</p>
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      order.status === 'Paid' ? 'bg-green-100 text-green-800' :
                      order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
          </DataCardBody>
        </DataCard>
      </div>

      <DataCard>
        <DataCardHeader>Content Overview</DataCardHeader>
        <DataCardBody>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-100 animate-pulse rounded" />
            ))}
          </div>
        ) : comments.length === 0 ? (
          <p className="text-gray-500 text-sm">No comments yet</p>
        ) : (
          <div className="space-y-3">
            {comments.slice(0, 5).map(comment => (
              <div key={comment.id} className="p-3 bg-gray-50 rounded">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-medium text-gray-800">{comment.author}</p>
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    comment.status === 'Approved' ? 'bg-green-100 text-green-800' :
                    comment.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {comment.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2">{comment.content}</p>
                <p className="text-xs text-gray-400 mt-1">on "{comment.postTitle}"</p>
              </div>
            ))}
          </div>
        )}
        </DataCardBody>
      </DataCard>

      {/* Plugin Dashboard Widgets */}
      {pluginWidgets.length > 0 && (
        <DataCard>
          <h2 className="text-lg font-medium text-gray-800 mb-4">Plugin Widgets</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pluginWidgets.map(widget => (
              <div 
                key={widget.id} 
                className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg"
              >
                <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
                  <span className="text-blue-600 mr-2">👋</span>
                  {widget.title}
                </h3>
                <div className="text-gray-700 text-sm">
                  {typeof widget.content === 'string' ? (
                    <p>{widget.content}</p>
                  ) : (
                    widget.content
                  )}
                </div>
              </div>
            ))}
          </div>
        </DataCard>
      )}
    </div>
  );
};

export default Dashboard;