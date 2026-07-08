'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Plus, Trash2 } from 'lucide-react';

interface Client {
  id: string;
  name: string;
  email: string;
}

interface Booking {
  id: string;
  service: string;
  eventDate: string;
  clientName: string;
}

export default function NewInvoicePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [formData, setFormData] = useState({
    clientId: '',
    bookingId: '',
    items: [{ description: '', quantity: '1', rate: '' }],
    taxRate: '12.5',
    dueDate: '',
    notes: '',
  });

  useEffect(() => {
    fetch('/api/clients').then((r) => r.json()).then(setClients).catch(() => {});
    fetch('/api/bookings-list').then((r) => r.json()).then(setBookings).catch(() => {});
  }, []);

  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, { description: '', quantity: '1', rate: '' }],
    }));
  };

  const removeItem = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const updateItem = (index: number, field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const subtotal = formData.items.reduce(
    (sum, item) => sum + (parseFloat(item.rate) || 0) * (parseInt(item.quantity) || 0),
    0
  );
  const taxAmount = subtotal * ((parseFloat(formData.taxRate) || 0) / 100);
  const total = subtotal + taxAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const data = await res.json();
        router.push(`/admin/invoices/${data.invoice.id}`);
      } else {
        throw new Error('Failed');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Create Invoice</h1>
        <p className="mt-1 text-sm text-gray-500">Generate a new invoice for a client.</p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-3xl">
        <div className="rounded-xl border border-gray-200 bg-white p-8">
          {/* Client & Booking */}
          <div className="mb-6 grid gap-4 md:grid-cols-2">
            <div>
              <label className="label">Client *</label>
              <select
                required
                className="input"
                value={formData.clientId}
                onChange={(e) => setFormData((prev) => ({ ...prev, clientId: e.target.value }))}
              >
                <option value="">Select client...</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Linked Booking (optional)</label>
              <select
                className="input"
                value={formData.bookingId}
                onChange={(e) => setFormData((prev) => ({ ...prev, bookingId: e.target.value }))}
              >
                <option value="">No booking</option>
                {bookings.map((b) => (
                  <option key={b.id} value={b.id}>{b.service} - {b.clientName}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Line Items */}
          <div className="mb-6">
            <div className="mb-3 flex items-center justify-between">
              <label className="label mb-0">Line Items</label>
              <button type="button" onClick={addItem} className="btn btn-sm btn-secondary">
                <Plus className="h-3 w-3" /> Add Item
              </button>
            </div>
            <div className="space-y-3">
              {formData.items.map((item, index) => (
                <div key={index} className="flex gap-3">
                  <input
                    type="text"
                    placeholder="Description"
                    className="input flex-1"
                    value={item.description}
                    onChange={(e) => updateItem(index, 'description', e.target.value)}
                    required
                  />
                  <input
                    type="number"
                    placeholder="Qty"
                    className="input w-20"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                    required
                    min="1"
                  />
                  <input
                    type="number"
                    placeholder="Rate"
                    className="input w-28"
                    value={item.rate}
                    onChange={(e) => updateItem(index, 'rate', e.target.value)}
                    required
                    min="0"
                    step="0.01"
                  />
                  {formData.items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:border-red-300 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="mb-6 rounded-lg bg-gray-50 p-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span className="font-medium">GHS {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-gray-600">
                <div className="flex items-center gap-2">
                  <span>Tax</span>
                  <input
                    type="number"
                    className="input w-16 py-1 text-right"
                    value={formData.taxRate}
                    onChange={(e) => setFormData((prev) => ({ ...prev, taxRate: e.target.value }))}
                    step="0.1"
                    min="0"
                  />
                  <span>%</span>
                </div>
                <span className="font-medium">GHS {taxAmount.toFixed(2)}</span>
              </div>
              <div className="mt-2 flex justify-between border-t border-gray-200 pt-2 text-base font-bold text-gray-900">
                <span>Total</span>
                <span>GHS {total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Due Date & Notes */}
          <div className="mb-6 grid gap-4 md:grid-cols-2">
            <div>
              <label className="label">Due Date *</label>
              <input
                type="date"
                required
                className="input"
                value={formData.dueDate}
                onChange={(e) => setFormData((prev) => ({ ...prev, dueDate: e.target.value }))}
              />
            </div>
            <div className="md:col-span-2">
              <label className="label">Notes (optional)</label>
              <textarea
                className="input min-h-[80px] resize-y"
                placeholder="Payment terms, special instructions..."
                value={formData.notes}
                onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-lg flex-1"
            >
              {loading ? 'Creating...' : 'Create Invoice'}
            </button>
            <a href="/admin/invoices" className="btn btn-outline btn-lg">Cancel</a>
          </div>
        </div>
      </form>
    </div>
  );
}
