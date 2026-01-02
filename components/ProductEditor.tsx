import React, { useState, useEffect } from 'react';
import { Save, ChevronLeft, Image as ImageIcon, Plus } from 'lucide-react';
import { useCMS } from '../contexts/CMSContext';
import { ViewState, Product } from '../types';
import { DataCard, DataCardHeader, DataCardBody } from './common/DataCard';

const ProductEditor: React.FC = () => {
  const { products, addProduct, updateProduct, setCurrentView, editingProductId } = useCMS();
  
  const [formData, setFormData] = useState<Partial<Product>>({
      name: '',
      description: '',
      price: 0,
      compareAtPrice: 0,
      inventory: 0,
      sku: '',
      status: 'active',
      images: [],
      vendor: '',
      category: ''
  });

  useEffect(() => {
    if (editingProductId) {
        const prod = products.find(p => p.id === editingProductId);
        if (prod) {
            setFormData(prod);
        }
    }
  }, [editingProductId, products]);

  const handleSave = () => {
    const finalProduct: Product = {
        id: editingProductId || `prod_${Date.now()}`,
        name: formData.name || 'Untitled Product',
        description: formData.description || '',
        price: Number(formData.price),
        compareAtPrice: Number(formData.compareAtPrice),
        inventory: Number(formData.inventory),
        sku: formData.sku || '',
        status: formData.status as 'Active' | 'Draft' | 'Archived',
        images: formData.images || [],
        vendor: formData.vendor || 'NestBrand',
        category: formData.category || 'Uncategorized'
    };

    if (editingProductId) {
        updateProduct(finalProduct);
    } else {
        addProduct(finalProduct);
    }
    setCurrentView(ViewState.PRODUCTS);
  };

  return (
    <div className="h-full flex flex-col animate-fade-in relative pb-10">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex justify-between items-center sticky top-0 z-10 mb-6">
        <div className="flex items-center gap-4">
            <button 
                onClick={() => setCurrentView(ViewState.PRODUCTS)}
                className="p-2 hover:bg-gray-100 rounded-full text-gray-500"
            >
                <ChevronLeft size={20} />
            </button>
            <h1 className="text-xl font-semibold text-gray-800">
                {editingProductId ? 'Edit Product' : 'Add New Product'}
            </h1>
        </div>
        <div className="flex items-center gap-3">
             <button className="text-red-600 hover:bg-red-50 px-3 py-1.5 rounded text-sm font-medium transition-colors">
                Discard
             </button>
            <button 
                onClick={handleSave}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm"
            >
                <Save size={16} className="mr-2" /> Save Product
            </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-6">
            
         {/* Main Column */}
         <div className="lg:col-span-2 space-y-6">
            <DataCard>
                <DataCardBody className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea 
                        rows={6}
                        value={formData.description}
                        onChange={e => setFormData({...formData, description: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    />
                </div>
                </DataCardBody>
            </DataCard>

            <DataCard>
                <DataCardHeader>Media</DataCardHeader>
                <DataCardBody>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center text-center hover:bg-gray-50 cursor-pointer transition-colors">
                    <ImageIcon className="text-gray-400 mb-2" size={32} />
                    <p className="text-sm text-blue-600 font-medium">Add files</p>
                    <p className="text-xs text-gray-500 mt-1">Accepts images, videos, or 3D models</p>
                </div>
                {formData.images && formData.images.length > 0 && (
                    <div className="grid grid-cols-4 gap-4 mt-4">
                        {formData.images.map((url, idx) => (
                            <div key={idx} className="relative aspect-square border border-gray-200 rounded overflow-hidden group">
                                <img src={url} alt="" className="w-full h-full object-cover" />
                            </div>
                        ))}
                    </div>
                )}
                </DataCardBody>
            </DataCard>

            <DataCard>
                <DataCardHeader>Pricing</DataCardHeader>
                <DataCardBody>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                            <input 
                                type="number" 
                                value={formData.price}
                                onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})}
                                className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Compare-at price</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                            <input 
                                type="number" 
                                value={formData.compareAtPrice}
                                onChange={e => setFormData({...formData, compareAtPrice: parseFloat(e.target.value)})}
                                className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
                            />
                        </div>
                    </div>
                </div>
                </DataCardBody>
            </DataCard>

            <DataCard>
                <DataCardHeader>Inventory</DataCardHeader>
                <DataCardBody>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">SKU (Stock Keeping Unit)</label>
                        <input 
                            type="text" 
                            value={formData.sku}
                            onChange={e => setFormData({...formData, sku: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                        <input 
                            type="number" 
                            value={formData.inventory}
                            onChange={e => setFormData({...formData, inventory: parseInt(e.target.value)})}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
                        />
                    </div>
                </div>
                </DataCardBody>
            </DataCard>
         </div>

         {/* Sidebar Column */}
         <div className="space-y-6">
            <DataCard>
                <DataCardHeader>Status</DataCardHeader>
                <DataCardBody>
                <select 
                    value={formData.status}
                    onChange={e => setFormData({...formData, status: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none bg-white"
                >
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                </select>
                </DataCardBody>
            </DataCard>

            <DataCard>
                <DataCardHeader>Product Organization</DataCardHeader>
                <DataCardBody>
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
                        <input 
                            type="text" 
                            value={formData.category}
                            onChange={e => setFormData({...formData, category: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Vendor</label>
                        <input 
                            type="text" 
                            value={formData.vendor}
                            onChange={e => setFormData({...formData, vendor: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
                        />
                    </div>
                </div>
                </DataCardBody>
            </DataCard>
         </div>

      </div>
    </div>
  );
};

export default ProductEditor;