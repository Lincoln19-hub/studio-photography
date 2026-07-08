'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { DollarSign } from 'lucide-react';

export default function RecordPaymentPage() {
  const router = useRouter();
  const params = useParams();
  const invoiceId = params.id as string;

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    method: 'bank_transfer',
    reference: '',
    notes: '',
    date: new Date().toISOString().split('T')[0],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`/api/payments/${invoiceId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        router.push(`/admin/invoices/${invoiceId}`);
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
        <a href={`/admin/invoices/${invoiceId}`} className="text-sm text-gray-500 hover:text-gray-900">← Back to Invoice</a>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">Record Payment</h1>
        <p className="mt-1 text-sm text-gray-500">Record a payment against this invoice.</p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-lg">
        <div className="rounded-xl border border-gray-200 bg-white p-8">
          <div className="mb-6">
            <label className="label">Amount (GHS) *</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></span>
              <input
                type="number"
                required
                step="0.01"
                min="0"
                className="input pl-7"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData((prev) => ({ ...prev, amount: e.target.value }))}
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="label">Payment Method *</label>
            <select
              className="input"
              value={formData.method}
              onChange={(e) => setFormData((prev) => ({ ...prev, method: e.target.value }))}
            >
              <option value="bank_transfer">Bank Transfer</option>
              <option value="card">Card</option>
              <option value="cash">Cash</option>
              <option value="mobile_money">Mobile Money</option>
              <option value="cheque">Cheque</option>
            </select>
          </div>

          <div className="mb-6">
            <label className="label">Reference / Transaction ID</label>
            <input
              type="text"
              className="input"
              placeholder="e.g. TXN-123456"
              value={formData.reference}
              onChange={(e) => setFormData((prev) => ({ ...prev, reference: e.target.value }))}
            />
          </div>

          <div className="mb-6">
            <label className="label">Payment Date</label>
            <input
              type="date"
              className="input"
              value={formData.date}
              onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
            />
          </div>

          <div className="mb-6">
            <label className="label">Notes (optional)</label>
            <textarea
              className="input min-h-[80px] resize-y"
              placeholder="Any additional notes about this payment..."
              value={formData.notes}
              onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-lg flex-1"
            >
              <DollarSign className="h-4 w-4" />
              {loading ? 'Recording...' : 'Record Payment'}
            </button>
            <a href={`/admin/invoices/${invoiceId}`} className="btn btn-outline btn-lg">Cancel</a>
          </div>
        </div>
      </form>
    </div>
  );
}
