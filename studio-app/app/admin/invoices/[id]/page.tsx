import { prisma } from '@/lib/db';
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { FileText, Download, Plus, Printer } from 'lucide-react';

export default async function InvoiceDetailPage({ params }: { params: { id: string } }) {
  const invoice = await prisma.invoice.findUnique({
    where: { id: params.id },
    include: {
      client: true,
      booking: true,
      items: true,
      payments: { orderBy: { date: 'desc' } },
    },
  });

  if (!invoice) notFound();

  const totalPaid = invoice.payments.reduce((sum, p) => sum + p.amount, 0);
  const balance = invoice.total - totalPaid;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Link href="/admin/invoices" className="text-sm text-gray-500 hover:text-gray-900">← Invoices</Link>
          </div>
          <h1 className="mt-2 text-2xl font-bold text-gray-900">{invoice.invoiceNumber}</h1>
          <p className="mt-1 text-sm text-gray-500">
            Created {formatDate(invoice.createdAt)} · Due {formatDate(invoice.dueDate)}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={`/admin/invoices/${invoice.id}/receipt`} className="btn btn-outline">
            <Printer className="h-4 w-4" /> Print Receipt
          </Link>
          <button className="btn btn-primary">
            <Plus className="h-4 w-4" /> Record Payment
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Invoice Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Client Info */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Bill To</h3>
            <div className="text-lg font-semibold text-gray-900">{invoice.client.name}</div>
            <div className="text-sm text-gray-500">{invoice.client.email}</div>
            {invoice.client.phone && <div className="text-sm text-gray-500">{invoice.client.phone}</div>}
            {invoice.client.address && <div className="text-sm text-gray-500">{invoice.client.address}</div>}
            {invoice.booking && (
              <div className="mt-4 rounded-lg bg-blue-50 p-3">
                <div className="text-xs font-medium text-primary">Linked Booking</div>
                <div className="mt-1 text-sm text-gray-700">
                  {invoice.booking.service} · {formatDate(invoice.booking.eventDate)} · {invoice.booking.duration}h
                </div>
                {invoice.booking.location && (
                  <div className="text-xs text-gray-500">{invoice.booking.location}</div>
                )}
              </div>
            )}
          </div>

          {/* Items Table */}
          <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
            <table className="w-full">
              <thead className="border-b border-gray-100 bg-gray-50/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500">Description</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold uppercase text-gray-500">Qty</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase text-gray-500">Rate</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase text-gray-500">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {invoice.items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 text-sm text-gray-900">{item.description}</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-700">{item.quantity}</td>
                    <td className="px-6 py-4 text-right text-sm text-gray-700">{formatCurrency(item.rate)}</td>
                    <td className="px-6 py-4 text-right text-sm font-medium text-gray-900">{formatCurrency(item.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="border-t border-gray-100 bg-gray-50/30 px-6 py-4">
              <div className="space-y-1 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatCurrency(invoice.amount)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax ({(invoice.taxRate * 100).toFixed(1)}%)</span>
                  <span>{formatCurrency(invoice.taxAmount)}</span>
                </div>
                <div className="mt-2 flex justify-between border-t border-gray-200 pt-2 text-base font-bold text-gray-900">
                  <span>Total</span>
                  <span>{formatCurrency(invoice.total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">Notes</h3>
              <p className="text-sm text-gray-700">{invoice.notes}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Status</h3>
            <span className={`badge text-sm ${getStatusColor(invoice.status)}`}>{invoice.status}</span>
            {invoice.paidDate && (
              <div className="mt-3 text-xs text-gray-500">
                Paid on {formatDate(invoice.paidDate)}
              </div>
            )}
          </div>

          {/* Payment Summary */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Payment Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Invoice Total</span>
                <span className="font-medium">{formatCurrency(invoice.total)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Amount Paid</span>
                <span className="font-medium text-green-600">{formatCurrency(totalPaid)}</span>
              </div>
              <div className="flex justify-between border-t border-gray-100 pt-2">
                <span className="font-medium">Balance Due</span>
                <span className={`font-bold ${balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {formatCurrency(balance)}
                </span>
              </div>
            </div>
          </div>

          {/* Payments */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Payment History</h3>
            {invoice.payments.length === 0 ? (
              <div className="py-4 text-center text-sm text-gray-500">No payments recorded</div>
            ) : (
              <div className="space-y-3">
                {invoice.payments.map((payment) => (
                  <div key={payment.id} className="rounded-lg border border-gray-100 p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900">{formatCurrency(payment.amount)}</span>
                      <span className="badge bg-blue-50 text-blue-700">{payment.method.replace('_', ' ')}</span>
                    </div>
                    <div className="mt-1 text-xs text-gray-500">{formatDate(payment.date)}</div>
                    {payment.reference && (
                      <div className="mt-1 text-xs text-gray-400">Ref: {payment.reference}</div>
                    )}
                    {payment.notes && (
                      <div className="mt-1 text-xs text-gray-500">{payment.notes}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
