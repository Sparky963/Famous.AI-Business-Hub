import React, { useState, useMemo } from 'react';
import { useApp } from '@/contexts/AppContext';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  EditIcon,
  TrashIcon,
  CalendarIcon
} from '@/components/icons/Icons';
import { Modal } from '@/components/ui/Modal';
import { CalendarEvent } from '@/types';

export const CalendarView: React.FC = () => {
  const {
    events,
    clients,
    invoices,
    addEvent,
    updateEvent,
    deleteEvent
  } = useApp();

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_date: '',
    start_time: '',
    end_time: '',
    event_type: 'Event',
    client_id: '',
    location: '',
    color: '#8B5CF6',
    is_payment_due: false
  });

  // Calendar logic
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPadding = firstDay.getDay();
    const days: { date: Date; isCurrentMonth: boolean; events: CalendarEvent[] }[] = [];

    // Previous month padding
    for (let i = startPadding - 1; i >= 0; i--) {
      const date = new Date(year, month, -i);
      days.push({ date, isCurrentMonth: false, events: [] });
    }

    // Current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const date = new Date(year, month, i);
      const dateStr = date.toISOString().split('T')[0];
      const dayEvents = events.filter(e => e.event_date === dateStr);
      
      // Add invoice due dates
      const dueInvoices = invoices.filter(inv => inv.due_date === dateStr && inv.status !== 'paid');
      const invoiceEvents: CalendarEvent[] = dueInvoices.map(inv => ({
        id: `inv-${inv.id}`,
        title: `Payment Due: ${inv.invoice_number}`,
        event_date: inv.due_date!,
        color: inv.status === 'partial' ? '#F59E0B' : '#EF4444',
        is_payment_due: true,
        status: 'scheduled',
        created_at: inv.created_at
      }));
      
      days.push({
        date,
        isCurrentMonth: true,
        events: [...dayEvents, ...invoiceEvents]
      });
    }

    // Next month padding
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      const date = new Date(year, month + 1, i);
      days.push({ date, isCurrentMonth: false, events: [] });
    }

    return days;
  }, [currentMonth, events, invoices]);

  const selectedDateEvents = useMemo(() => {
    if (!selectedDate) return [];
    return calendarDays.find(d => d.date.toISOString().split('T')[0] === selectedDate)?.events || [];
  }, [selectedDate, calendarDays]);

  const upcomingEvents = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return events
      .filter(e => e.event_date >= today)
      .sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime())
      .slice(0, 10);
  }, [events]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const handleAddEvent = (date?: string) => {
    setEditingEvent(null);
    setFormData({
      title: '',
      description: '',
      event_date: date || new Date().toISOString().split('T')[0],
      start_time: '',
      end_time: '',
      event_type: 'Event',
      client_id: '',
      location: '',
      color: '#8B5CF6',
      is_payment_due: false
    });
    setShowEventModal(true);
  };

  const handleEditEvent = (event: CalendarEvent) => {
    if (event.id.startsWith('inv-')) return; // Can't edit invoice events
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description || '',
      event_date: event.event_date,
      start_time: event.start_time || '',
      end_time: event.end_time || '',
      event_type: event.event_type || 'Event',
      client_id: event.client_id || '',
      location: event.location || '',
      color: event.color,
      is_payment_due: event.is_payment_due
    });
    setShowEventModal(true);
  };

  const handleSaveEvent = async () => {
    if (editingEvent) {
      await updateEvent(editingEvent.id, formData);
    } else {
      await addEvent(formData as any);
    }
    setShowEventModal(false);
  };

  const handleDeleteEvent = async (event: CalendarEvent) => {
    if (event.id.startsWith('inv-')) return;
    if (confirm('Are you sure you want to delete this event?')) {
      await deleteEvent(event.id);
    }
  };

  const colorOptions = [
    '#8B5CF6', '#EC4899', '#EF4444', '#F59E0B', 
    '#10B981', '#3B82F6', '#6366F1', '#14B8A6'
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Calendar</h1>
          <p className="text-gray-400">Events, bookings, and payment due dates</p>
        </div>
        
        <button
          onClick={() => handleAddEvent()}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all"
        >
          <PlusIcon size={20} />
          Add Event
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-3 bg-gray-800/50 border border-gray-700 rounded-xl p-5">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white">
              {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ChevronLeftIcon className="text-gray-400" size={20} />
              </button>
              <button
                onClick={() => setCurrentMonth(new Date())}
                className="px-3 py-1.5 text-sm text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
              >
                Today
              </button>
              <button
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ChevronRightIcon className="text-gray-400" size={20} />
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-7 gap-1">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-sm text-gray-500 py-2 font-medium">{day}</div>
            ))}
            
            {calendarDays.map((day, idx) => {
              const dateStr = day.date.toISOString().split('T')[0];
              const isToday = day.date.toDateString() === new Date().toDateString();
              const isSelected = selectedDate === dateStr;
              
              return (
                <div
                  key={idx}
                  onClick={() => day.isCurrentMonth && setSelectedDate(dateStr)}
                  className={`min-h-[100px] p-2 rounded-lg border transition-all cursor-pointer ${
                    day.isCurrentMonth
                      ? isSelected
                        ? 'bg-purple-500/20 border-purple-500'
                        : isToday
                          ? 'bg-blue-500/10 border-blue-500/50'
                          : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
                      : 'bg-gray-900/30 border-transparent cursor-default'
                  }`}
                >
                  <span className={`text-sm font-medium ${
                    day.isCurrentMonth 
                      ? isToday ? 'text-blue-400' : 'text-white' 
                      : 'text-gray-600'
                  }`}>
                    {day.date.getDate()}
                  </span>
                  
                  <div className="mt-1 space-y-1">
                    {day.events.slice(0, 3).map((event, i) => (
                      <div
                        key={i}
                        className="text-xs px-1.5 py-0.5 rounded truncate"
                        style={{ backgroundColor: `${event.color}30`, color: event.color }}
                      >
                        {event.title}
                      </div>
                    ))}
                    {day.events.length > 3 && (
                      <div className="text-xs text-gray-500 px-1">+{day.events.length - 3} more</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Selected Date Events */}
          {selectedDate && (
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">
                  {new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </h3>
                <button
                  onClick={() => handleAddEvent(selectedDate)}
                  className="p-1.5 text-purple-400 hover:bg-purple-500/20 rounded-lg transition-colors"
                >
                  <PlusIcon size={18} />
                </button>
              </div>
              
              {selectedDateEvents.length > 0 ? (
                <div className="space-y-3">
                  {selectedDateEvents.map(event => {
                    const client = clients.find(c => c.id === event.client_id);
                    return (
                      <div
                        key={event.id}
                        className="p-3 rounded-lg"
                        style={{ backgroundColor: `${event.color}15`, borderLeft: `3px solid ${event.color}` }}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-white font-medium">{event.title}</p>
                            {client && <p className="text-sm text-gray-400">{client.name}</p>}
                            {event.start_time && (
                              <p className="text-xs text-gray-500 mt-1">
                                {event.start_time}{event.end_time && ` - ${event.end_time}`}
                              </p>
                            )}
                            {event.location && (
                              <p className="text-xs text-gray-500">{event.location}</p>
                            )}
                          </div>
                          {!event.id.startsWith('inv-') && (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleEditEvent(event)}
                                className="p-1 text-gray-400 hover:text-white"
                              >
                                <EditIcon size={14} />
                              </button>
                              <button
                                onClick={() => handleDeleteEvent(event)}
                                className="p-1 text-gray-400 hover:text-red-400"
                              >
                                <TrashIcon size={14} />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No events</p>
              )}
            </div>
          )}

          {/* Upcoming Events */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-5">
            <h3 className="text-lg font-semibold text-white mb-4">Upcoming</h3>
            {upcomingEvents.length > 0 ? (
              <div className="space-y-3">
                {upcomingEvents.map(event => {
                  const client = clients.find(c => c.id === event.client_id);
                  return (
                    <div
                      key={event.id}
                      className="p-3 bg-gray-700/50 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors"
                      onClick={() => setSelectedDate(event.event_date)}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: event.color }}
                        />
                        <span className="text-white font-medium text-sm">{event.title}</span>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-gray-400">
                          {new Date(event.event_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                        {client && <span className="text-xs text-gray-500">{client.name}</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No upcoming events</p>
            )}
          </div>

          {/* Legend */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-3">Legend</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-sm text-gray-400">Paid</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <span className="text-sm text-gray-400">Partial Payment</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-sm text-gray-400">Payment Due</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-500" />
                <span className="text-sm text-gray-400">Event</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Event Modal */}
      <Modal
        isOpen={showEventModal}
        onClose={() => setShowEventModal(false)}
        title={editingEvent ? 'Edit Event' : 'Add Event'}
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
              placeholder="Event title"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Date *</label>
              <input
                type="date"
                value={formData.event_date}
                onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Event Type</label>
              <select
                value={formData.event_type}
                onChange={(e) => setFormData({ ...formData, event_type: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
              >
                <option value="Event">Event</option>
                <option value="Wedding">Wedding</option>
                <option value="Corporate">Corporate</option>
                <option value="Birthday">Birthday</option>
                <option value="Meeting">Meeting</option>
                <option value="Reminder">Reminder</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Start Time</label>
              <input
                type="time"
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">End Time</label>
              <input
                type="time"
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Client</label>
            <select
              value={formData.client_id}
              onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
            >
              <option value="">No client</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>{client.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Location</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
              placeholder="Event location"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Color</label>
            <div className="flex items-center gap-2">
              {colorOptions.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData({ ...formData, color })}
                  className={`w-8 h-8 rounded-full transition-all ${
                    formData.color === color ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-900' : ''
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
              rows={3}
              placeholder="Event details..."
            />
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={() => setShowEventModal(false)}
              className="px-6 py-2.5 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveEvent}
              className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all"
            >
              {editingEvent ? 'Update Event' : 'Add Event'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CalendarView;
