import React, { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { LoadingSpinner, CheckIcon } from '@/components/icons/Icons';

export const SettingsView: React.FC = () => {
  const { businessProfile, updateBusinessProfile, categories } = useApp();
  
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [formData, setFormData] = useState({
    business_name: businessProfile?.business_name || '',
    address: businessProfile?.address || '',
    city: businessProfile?.city || '',
    state: businessProfile?.state || '',
    zip: businessProfile?.zip || '',
    phone: businessProfile?.phone || '',
    email: businessProfile?.email || '',
    website: businessProfile?.website || ''
  });

  const handleSave = async () => {
    setLoading(true);
    await updateBusinessProfile(formData);
    setLoading(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-gray-400">Manage your business profile and preferences</p>
      </div>

      {/* Business Profile */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Business Profile</h2>
        <p className="text-sm text-gray-400 mb-6">This information appears on your invoices and quotes</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-300 mb-1">Business Name</label>
            <input
              type="text"
              value={formData.business_name}
              onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
              placeholder="Your Business Name"
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-300 mb-1">Address</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
              placeholder="Street address"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">City</label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">State</label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">ZIP</label>
              <input
                type="text"
                value={formData.zip}
                onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Phone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
              placeholder="(555) 123-4567"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
              placeholder="contact@business.com"
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-300 mb-1">Website</label>
            <input
              type="text"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
              placeholder="www.yourbusiness.com"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-4 mt-6">
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50"
          >
            {loading ? <LoadingSpinner size={18} /> : saved ? <CheckIcon size={18} /> : null}
            {saved ? 'Saved!' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Expense Categories */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Expense Categories</h2>
        <p className="text-sm text-gray-400 mb-6">Categories used for organizing expenses and tax reporting</p>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {categories.map(category => (
            <div
              key={category.id}
              className="p-3 bg-gray-700/50 rounded-lg"
            >
              <p className="text-white font-medium">{category.name}</p>
              {category.is_tax_deductible && (
                <span className="text-xs text-green-400">Tax Deductible</span>
              )}
              {category.irs_category && (
                <p className="text-xs text-gray-500 mt-1">IRS: {category.irs_category}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Data Management */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Data & Storage</h2>
        <p className="text-sm text-gray-400 mb-6">Your data is securely stored in the cloud</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-700/50 rounded-lg">
            <p className="text-2xl font-bold text-purple-400">Cloud</p>
            <p className="text-sm text-gray-400">Storage Type</p>
          </div>
          <div className="p-4 bg-gray-700/50 rounded-lg">
            <p className="text-2xl font-bold text-green-400">Encrypted</p>
            <p className="text-sm text-gray-400">Data Security</p>
          </div>
          <div className="p-4 bg-gray-700/50 rounded-lg">
            <p className="text-2xl font-bold text-blue-400">5 Years</p>
            <p className="text-sm text-gray-400">Receipt Retention</p>
          </div>
        </div>
      </div>

      {/* About */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">About SparkReceipt</h2>
        <p className="text-gray-400">
          SparkReceipt is an AI-powered receipt scanner and expense tracking platform designed for small businesses, 
          freelancers, and accountants. Automate receipt scanning, expense tracking, categorization, and reporting.
        </p>
        <div className="mt-4 pt-4 border-t border-gray-700">
          <p className="text-sm text-gray-500">Version 1.0.0</p>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
