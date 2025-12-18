import React, { useState, useEffect } from 'react';
import { Plus, GripVertical, Trash2, Save, X, Settings as SettingsIcon } from 'lucide-react';
import { Widget } from '../../types';
import { tokenManager } from '../../services/api';
import { useModal } from '../Modal';
import { DataCard, DataCardHeader, DataCardBody } from '../common/DataCard';

const API_BASE = 'http://localhost:4000/api/v1';

const AppearanceWidgets: React.FC = () => {
  const { confirm, alert } = useModal();
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [activeArea, setActiveArea] = useState<string>('sidebar');
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingWidget, setEditingWidget] = useState<Widget | null>(null);
  const [widgetType, setWidgetType] = useState('text');
  const [widgetTitle, setWidgetTitle] = useState('');
  const [widgetContent, setWidgetContent] = useState('');

  const areas = [
    { id: 'sidebar', label: 'Sidebar', color: 'blue' },
    { id: 'footer', label: 'Footer', color: 'green' },
    { id: 'header', label: 'Header', color: 'purple' },
  ];

  const availableWidgetTypes = [
    { id: 'text', label: 'Text', description: 'Arbitrary text or HTML' },
    { id: 'search', label: 'Search', description: 'A search form for your site' },
    { id: 'categories', label: 'Categories', description: 'A list of categories' },
    { id: 'recent-posts', label: 'Recent Posts', description: 'Your site\'s most recent posts' },
    { id: 'menu', label: 'Menu', description: 'A custom navigation menu' },
    { id: 'html', label: 'Custom HTML', description: 'Arbitrary HTML code' },
  ];

  useEffect(() => {
    fetchWidgets();
  }, []);

  const fetchWidgets = async () => {
    try {
      const token = tokenManager.getAccessToken();
      const response = await fetch(`${API_BASE}/appearance/widgets`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      // Ensure data is an array
      const widgetsArray = Array.isArray(data) ? data : (data?.data || []);
      setWidgets(widgetsArray);
    } catch (error) {
      console.error('Failed to fetch widgets:', error);
      setWidgets([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddWidget = async () => {
    if (!widgetTitle.trim()) return;

    const newWidget: Widget = {
      id: `widget_${Date.now()}`,
      type: widgetType,
      title: widgetTitle,
      content: widgetContent,
      area: activeArea,
      order: widgets.filter(w => w.area === activeArea).length,
      isActive: true,
    };

    try {
      const token = tokenManager.getAccessToken();
      const response = await fetch(`${API_BASE}/appearance/widgets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newWidget),
      });

      if (response.ok) {
        await fetchWidgets();
        setShowAddDialog(false);
        setWidgetTitle('');
        setWidgetContent('');
        setWidgetType('text');
        await alert({
          title: 'Success',
          message: 'Widget added successfully!',
          variant: 'success'
        });
      }
    } catch (error) {
      console.error('Failed to add widget:', error);
      await alert({
        title: 'Error',
        message: 'Failed to add widget. Please try again.',
        variant: 'error'
      });
    }
  };

  const handleUpdateWidget = async () => {
    if (!editingWidget || !widgetTitle.trim()) return;

    const updatedWidget = {
      ...editingWidget,
      title: widgetTitle,
      content: widgetContent,
      type: widgetType,
    };

    try {
      const token = tokenManager.getAccessToken();
      const response = await fetch(`${API_BASE}/appearance/widgets/${editingWidget.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedWidget),
      });

      if (response.ok) {
        await fetchWidgets();
        setShowEditDialog(false);
        setEditingWidget(null);
        setWidgetTitle('');
        setWidgetContent('');
        setWidgetType('text');
        await alert({
          title: 'Success',
          message: 'Widget updated successfully!',
          variant: 'success'
        });
      }
    } catch (error) {
      console.error('Failed to update widget:', error);
      await alert({
        title: 'Error',
        message: 'Failed to update widget. Please try again.',
        variant: 'error'
      });
    }
  };

  const handleDeleteWidget = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Widget',
      message: 'Are you sure you want to delete this widget?',
      confirmText: 'Delete',
      variant: 'warning'
    });
    
    if (!confirmed) return;

    try {
      const token = tokenManager.getAccessToken();
      const response = await fetch(`${API_BASE}/appearance/widgets/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        await fetchWidgets();
        await alert({
          title: 'Success',
          message: 'Widget deleted successfully!',
          variant: 'success'
        });
      }
    } catch (error) {
      console.error('Failed to delete widget:', error);
      await alert({
        title: 'Error',
        message: 'Failed to delete widget. Please try again.',
        variant: 'error'
      });
    }
  };

  const openEditDialog = (widget: Widget) => {
    setEditingWidget(widget);
    setWidgetTitle(widget.title);
    setWidgetContent(widget.content || '');
    setWidgetType(widget.type);
    setShowEditDialog(true);
  };

  const areaWidgets = widgets.filter((w) => w.area === activeArea && w.isActive);

  if (loading) {
    return <div className="text-center py-12">Loading widgets...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Area Tabs */}
      <div className="flex gap-2">
        {areas.map((area) => (
          <button
            key={area.id}
            onClick={() => setActiveArea(area.id)}
            className={`px-4 py-2 rounded font-medium transition-colors ${
              activeArea === area.id
                ? `bg-${area.color}-600 text-white`
                : `bg-gray-100 text-gray-700 hover:bg-gray-200`
            }`}
          >
            {area.label}
          </button>
        ))}
      </div>

      {/* Widgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Available Widgets */}
        <DataCard>
          <DataCardHeader>Available Widgets</DataCardHeader>
          <DataCardBody className="space-y-2">
            {availableWidgetTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => {
                  setWidgetType(type.id);
                  setWidgetTitle(type.label);
                  setShowAddDialog(true);
                }}
                className="w-full text-left px-3 py-2 bg-gray-50 rounded hover:bg-blue-50 hover:text-blue-700 transition-colors"
              >
                <div className="font-medium">{type.label}</div>
                <div className="text-xs text-gray-500">{type.description}</div>
              </button>
            ))}
          </DataCardBody>
        </DataCard>

        {/* Active Widgets */}
        <DataCard className="md:col-span-2">
          <DataCardHeader actions={
            <button 
              onClick={() => setShowAddDialog(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-sm hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              Add Widget
            </button>
          }>
            {areas.find((a) => a.id === activeArea)?.label} Widgets
          </DataCardHeader>

          <DataCardBody>
          {areaWidgets.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="mb-2">No widgets in this area</p>
              <p className="text-sm">Drag widgets here or click "Add Widget"</p>
            </div>
          ) : (
            <div className="space-y-3">
              {areaWidgets.map((widget) => (
                <div
                  key={widget.id}
                  className="flex items-start gap-3 p-4 bg-gray-50 rounded border border-gray-200"
                >
                  <GripVertical className="w-5 h-5 text-gray-400 cursor-move mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{widget.title}</h4>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => openEditDialog(widget)}
                          className="text-xs px-2 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteWidget(widget.id)}
                          className="p-1 text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      <span className="inline-block px-2 py-0.5 bg-gray-200 rounded text-xs">
                        {widget.type}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          </DataCardBody>
        </DataCard>
      </div>

      {/* Add Widget Dialog */}
      {showAddDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Add Widget</h3>
              <button
                onClick={() => {
                  setShowAddDialog(false);
                  setWidgetTitle('');
                  setWidgetContent('');
                  setWidgetType('text');
                }}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Widget Type</label>
                <select
                  value={widgetType}
                  onChange={(e) => setWidgetType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {availableWidgetTypes.map(type => (
                    <option key={type.id} value={type.id}>{type.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={widgetTitle}
                  onChange={(e) => setWidgetTitle(e.target.value)}
                  placeholder="Widget Title"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                <textarea
                  value={widgetContent}
                  onChange={(e) => setWidgetContent(e.target.value)}
                  placeholder="Widget content..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Area</label>
                <select
                  value={activeArea}
                  onChange={(e) => setActiveArea(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {areas.map(area => (
                    <option key={area.id} value={area.id}>{area.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAddDialog(false);
                  setWidgetTitle('');
                  setWidgetContent('');
                  setWidgetType('text');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddWidget}
                disabled={!widgetTitle.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Widget
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Widget Dialog */}
      {showEditDialog && editingWidget && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Edit Widget</h3>
              <button
                onClick={() => {
                  setShowEditDialog(false);
                  setEditingWidget(null);
                  setWidgetTitle('');
                  setWidgetContent('');
                  setWidgetType('text');
                }}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Widget Type</label>
                <select
                  value={widgetType}
                  onChange={(e) => setWidgetType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {availableWidgetTypes.map(type => (
                    <option key={type.id} value={type.id}>{type.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={widgetTitle}
                  onChange={(e) => setWidgetTitle(e.target.value)}
                  placeholder="Widget Title"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                <textarea
                  value={widgetContent}
                  onChange={(e) => setWidgetContent(e.target.value)}
                  placeholder="Widget content..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowEditDialog(false);
                  setEditingWidget(null);
                  setWidgetTitle('');
                  setWidgetContent('');
                  setWidgetType('text');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateWidget}
                disabled={!widgetTitle.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Update Widget
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppearanceWidgets;
