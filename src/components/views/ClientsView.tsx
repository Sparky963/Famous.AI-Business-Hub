import React, { useState, useMemo } from 'react';
import { useApp } from '@/contexts/AppContext';
import {
  SearchIcon,
  PlusIcon,
  EditIcon,
  TrashIcon,
  MailIcon,
  PhoneIcon,
  CalendarIcon,
  DollarIcon,
  EyeIcon,
  FilterIcon
} from '@/components/icons/Icons';
import { Client } from '@/types';

export const ClientsView: React.FC = () => {
  const {
    clients,
    invoices,
    expenses,
    deleteClient,
    setShowAddClientModal,
    setSelectedClient,
    setCurrentView
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedClientDetail, setSelectedClientDetail] = useState<Client | null>(null);

  const filteredClients = useMemo(() => {
    return clients.filter(client => {
      const matchesSearch = 
        client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.phone?.includes(searchQuery);
      
      const matchesStatus = statusFilter === 'all' || client.payment_status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [clients, searchQuery, statusFilter]);

  const getClientInvoices = (clientId: string) => {
    return invoices.filter(i => i.client_id === clientId);
  };

  const getClientExpenses = (clientId: string) => {
    return expenses.filter(e => e.client_id === clientId);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleEdit = (client: Client) => {
    setSelectedClient(client);
    setShowAddClientModal(true);
  };

  const handleDelete = async (client: Client) => {
    if (confirm(`Are you sure you want to delete ${client.name}?`)) {
      await deleteClient(client.id);
      if (selectedClientDetail?.id === client.id) {
        setSelectedClientDetail(null);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-500/20 text-green-400';
      case 'partial': return 'bg-yellow-500/20 text-yellow-400';
      default: return 'bg-red-500/20 text-red-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Clients</h1>
          <p className="text-gray-400">{clients.length} total clients</p>
        </div>
        
        <button
          onClick={() => {
            setSelectedClient(null);
            setShowAddClientModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all"
        >
          <PlusIcon size={20} />
          Add Client
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search clients..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
        >
          <option value="all">All Status</option>
          <option value="paid">Paid</option>
          <option value="partial">Partial</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Client List */}
        <div className={`${selectedClientDetail ? 'lg:col-span-2' : 'lg:col-span-3'} space-y-4`}>
          {filteredClients.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredClients.map(client => (
                <div
                  key={client.id}
                  className={`p-5 bg-gray-800/50 border rounded-xl transition-all cursor-pointer ${
                    selectedClientDetail?.id === client.id
                      ? 'border-purple-500'
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                  onClick={() => setSelectedClientDetail(client)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{client.name}</h3>
                      <span className={`inline-block px-2 py-0.5 text-xs rounded-full ${getStatusColor(client.payment_status)}`}>
                        {client.payment_status.charAt(0).toUpperCase() + client.payment_status.slice(1)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleEdit(client); }}
                        className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        <EditIcon size={16} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(client); }}
                        className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                      >
                        <TrashIcon size={16} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    {client.email && (
                      <div className="flex items-center gap-2 text-gray-400">
                        <MailIcon size={14} />
                        <span>{client.email}</span>
                      </div>
                    )}
                    {client.phone && (
                      <div className="flex items-center gap-2 text-gray-400">
                        <PhoneIcon size={14} />
                        <span>{client.phone}</span>
                      </div>
                    )}
                    {client.event_date && (
                      <div className="flex items-center gap-2 text-gray-400">
                        <CalendarIcon size={14} />
                        <span>{formatDate(client.event_date)} - {client.event_type}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-700 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500">Contract</p>
                      <p className="text-white font-medium">{formatCurrency(client.contract_amount)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Balance</p>
                      <p className={`font-medium ${client.balance_due > 0 ? 'text-red-400' : 'text-green-400'}`}>
                        {formatCurrency(client.balance_due)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-800/50 border border-gray-700 rounded-xl">
              <ClientsIcon className="mx-auto text-gray-600 mb-4" size={48} />
              <p className="text-gray-400">No clients found</p>
              <button
                onClick={() => setShowAddClientModal(true)}
                className="mt-4 text-purple-400 hover:text-purple-300"
              >
                Add your first client
              </button>
            </div>
          )}
        </div>

        {/* Client Detail Panel */}
        {selectedClientDetail && (
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-5 h-fit sticky top-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Client Details</h3>
              <button
                onClick={() => setSelectedClientDetail(null)}
                className="text-gray-400 hover:text-white"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-xl font-bold text-white">{selectedClientDetail.name}</h4>
                <span className={`inline-block px-2 py-0.5 text-xs rounded-full ${getStatusColor(selectedClientDetail.payment_status)}`}>
                  {selectedClientDetail.payment_status.charAt(0).toUpperCase() + selectedClientDetail.payment_status.slice(1)}
                </span>
              </div>
              
              <div className="space-y-2">
                {selectedClientDetail.email && (
                  <a href={`mailto:${selectedClientDetail.email}`} className="flex items-center gap-2 text-gray-300 hover:text-purple-400">
                    <MailIcon size={16} />
                    {selectedClientDetail.email}
                  </a>
                )}
                {selectedClientDetail.phone && (
                  <a href={`tel:${selectedClientDetail.phone}`} className="flex items-center gap-2 text-gray-300 hover:text-purple-400">
                    <PhoneIcon size={16} />
                    {selectedClientDetail.phone}
                  </a>
                )}
              </div>
              
              {selectedClientDetail.event_date && (
                <div className="p-3 bg-purple-500/10 rounded-lg">
                  <p className="text-sm text-gray-400">Event</p>
                  <p className="text-white font-medium">{selectedClientDetail.event_type}</p>
                  <p className="text-sm text-gray-300">{formatDate(selectedClientDetail.event_date)}</p>
                  {selectedClientDetail.venue && (
                    <p className="text-sm text-gray-400 mt-1">{selectedClientDetail.venue}</p>
                  )}
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-gray-700/50 rounded-lg">
                  <p className="text-xs text-gray-500">Contract</p>
                  <p className="text-lg font-bold text-white">{formatCurrency(selectedClientDetail.contract_amount)}</p>
                </div>
                <div className="p-3 bg-gray-700/50 rounded-lg">
                  <p className="text-xs text-gray-500">Paid</p>
                  <p className="text-lg font-bold text-green-400">{formatCurrency(selectedClientDetail.amount_paid)}</p>
                </div>
              </div>
              
              {selectedClientDetail.balance_due > 0 && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <p className="text-xs text-gray-400">Balance Due</p>
                  <p className="text-xl font-bold text-red-400">{formatCurrency(selectedClientDetail.balance_due)}</p>
                </div>
              )}
              
              {/* Services */}
              {selectedClientDetail.services_booked && selectedClientDetail.services_booked.length > 0 && (
                <div>
                  <p className="text-sm text-gray-400 mb-2">Services Booked</p>
                  <div className="space-y-2">
                    {selectedClientDetail.services_booked.map((service, idx) => (
                      <div key={idx} className="flex justify-between text-sm p-2 bg-gray-700/50 rounded">
                        <span className="text-gray-300">{service.name}</span>
                        <span className="text-white">{formatCurrency(service.amount)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Linked Invoices */}
              {getClientInvoices(selectedClientDetail.id).length > 0 && (
                <div>
                  <p className="text-sm text-gray-400 mb-2">Invoices</p>
                  <div className="space-y-2">
                    {getClientInvoices(selectedClientDetail.id).map(invoice => (
                      <div key={invoice.id} className="flex justify-between text-sm p-2 bg-gray-700/50 rounded">
                        <span className="text-gray-300">{invoice.invoice_number}</span>
                        <span className={invoice.status === 'paid' ? 'text-green-400' : 'text-yellow-400'}>
                          {formatCurrency(invoice.total)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex gap-2 pt-4">
                <button
                  onClick={() => handleEdit(selectedClientDetail)}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Edit Client
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientsView;
