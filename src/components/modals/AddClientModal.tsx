import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { useApp } from '@/contexts/AppContext';
import { LoadingSpinner, PlusIcon, TrashIcon } from '@/components/icons/Icons';
import { ServiceItem } from '@/types';

export const AddClientModal: React.FC = () => {
  const { 
    showAddClientModal, 
    setShowAddClientModal, 
    addClient,
    updateClient,
    selectedClient,
    setSelectedClient
  } = useApp();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    event_date: '',
    event_type: 'Wedding',
    venue: '',
    ceremony_time: '',
    notes: ''
  });
  
  const [services, setServices] = useState<ServiceItem[]>([]);

  useEffect(() => {
    if (selectedClient) {
      setFormData({
        name: selectedClient.name || '',
        email: selectedClient.email || '',
        phone: selectedClient.phone || '',
        address: selectedClient.address || '',
        city: selectedClient.city || '',
        state: selectedClient.state || '',
        zip: selectedClient.zip || '',
        event_date: selectedClient.event_date || '',
        event_type: selectedClient.event_type || 'Wedding',
        venue: selectedClient.venue || '',
        ceremony_time: selectedClient.ceremony_time || '',
        notes: selectedClient.notes || ''
      });
      setServices(selectedClient.services_booked || []);
    } else {
      resetForm();
    }
  }, [selectedClient]);

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zip: '',
      event_date: '',
      event_type: 'Wedding',
      venue: '',
      ceremony_time: '',
      notes: ''
    });
    setServices([]);
  };

  const addService = () => {
    setServices([...services, { name: '', description: '', quantity: 1, rate: 0, amount: 0 }]);
  };

  const updateService = (index: number, field: keyof ServiceItem, value: any) => {
    const updated = [...services];
    updated[index] = { ...updated[index], [field]: value };
    if (field === 'quantity' || field === 'rate') {
      updated[index].amount = updated[index].quantity * updated[index].rate;
    }
    setServices(updated);
  };

  const removeService = (index: number) => {
    setServices(services.filter((_, i) => i !== index));
  };

  const totalAmount = services.reduce((sum, s) => sum + s.amount, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const clientData = {
      ...formData,
      services_booked: services,
      contract_amount: totalAmount,
      balance_due: totalAmount,
      payment_status: 'pending' as const
    };
    
    if (selectedClient) {
      await updateClient(selectedClient.id, clientData);
    } else {
      await addClient(clientData);
    }
    
    setLoading(false);
    handleClose();
  };

  const handleClose = () => {
    setShowAddClientModal(false);
    setSelectedClient(null);
    resetForm();
  };

  return (
    <Modal
      isOpen={showAddClientModal}
      onClose={handleClose}
      title={selectedClient ? 'Edit Client' : 'New Client'}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Contact Info */}
        <div>
          <h3 className="text-lg font-medium text-white mb-4">Contact Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-1">Client Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                placeholder="e.g., John & Jane Smith"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                placeholder="email@example.com"
              />
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
          </div>
        </div>
        
        {/* Event Info */}
        <div>
          <h3 className="text-lg font-medium text-white mb-4">Event Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Event Date</label>
              <input
                type="date"
                value={formData.event_date}
                onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Event Type</label>
              <select
                value={formData.event_type}
                onChange={(e) => setFormData({ ...formData, event_type: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
              >
                <option value="Wedding">Wedding</option>
                <option value="Corporate">Corporate Event</option>
                <option value="Birthday">Birthday Party</option>
                <option value="Anniversary">Anniversary</option>
                <option value="Graduation">Graduation</option>
                <option value="Other">Other</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Venue</label>
              <input
                type="text"
                value={formData.venue}
                onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                placeholder="Venue name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Ceremony Time</label>
              <input
                type="time"
                value={formData.ceremony_time}
                onChange={(e) => setFormData({ ...formData, ceremony_time: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        </div>
        
        {/* Services */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-white">Services Booked</h3>
            <button
              type="button"
              onClick={addService}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <PlusIcon size={16} />
              Add Service
            </button>
          </div>
          
          {services.length > 0 ? (
            <div className="space-y-3">
              {services.map((service, index) => (
                <div key={index} className="p-4 bg-gray-800 rounded-lg">
                  <div className="grid grid-cols-12 gap-3">
                    <div className="col-span-12 md:col-span-4">
                      <input
                        type="text"
                        value={service.name}
                        onChange={(e) => updateService(index, 'name', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm"
                        placeholder="Service name"
                      />
                    </div>
                    <div className="col-span-4 md:col-span-2">
                      <input
                        type="number"
                        value={service.quantity}
                        onChange={(e) => updateService(index, 'quantity', parseInt(e.target.value) || 1)}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm"
                        placeholder="Qty"
                        min="1"
                      />
                    </div>
                    <div className="col-span-4 md:col-span-2">
                      <div className="relative">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                        <input
                          type="number"
                          value={service.rate}
                          onChange={(e) => updateService(index, 'rate', parseFloat(e.target.value) || 0)}
                          className="w-full pl-6 pr-2 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm"
                          placeholder="Rate"
                          step="0.01"
                        />
                      </div>
                    </div>
                    <div className="col-span-3 md:col-span-3 flex items-center">
                      <span className="text-white font-medium">${service.amount.toFixed(2)}</span>
                    </div>
                    <div className="col-span-1 flex items-center justify-end">
                      <button
                        type="button"
                        onClick={() => removeService(index)}
                        className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-colors"
                      >
                        <TrashIcon size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="flex justify-end p-4 bg-purple-500/20 rounded-lg">
                <span className="text-lg font-semibold text-white">
                  Total: ${totalAmount.toFixed(2)}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-gray-400 text-center py-4">No services added yet</p>
          )}
        </div>
        
        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Notes</label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
            rows={3}
            placeholder="Additional notes..."
          />
        </div>
        
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
          <button
            type="button"
            onClick={handleClose}
            className="px-6 py-2.5 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {loading && <LoadingSpinner size={18} />}
            {selectedClient ? 'Update Client' : 'Add Client'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddClientModal;
