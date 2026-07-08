import { getInvoice } from '@/lib/data';
import { formatCurrency, formatDate } from '@/lib/utils';
import { notFound } from 'next/navigation';
import { Camera } from 'lucide-react';

export default async function ReceiptPage({ params }: { params: { id: string } }) {
  const invoice = await getInvoice(params.id);
  if (!invoice) notFound();

  const totalPaid = (invoice.payments || []).reduce((sum: number, p: any) => sum + p.amount, 0);

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="mx-auto mb-6 max-w-3xl px-6 print:hidden">
        <div className="flex gap-2">
          <button onClick={() => window.print()} className="btn btn-primary">🖨️ Print Receipt</button>
          <a href={`/admin/invoices/${invoice.id}`} className="btn btn-outline">← Back</a>
        </div>
      </div>
      <div className="mx-auto max-w-3xl px-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-10 shadow-sm print:shadow-none print:border-0">
          <div className="mb-8 flex items-start justify-between border-b border-gray-200 pb-8">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-primary">
                <Camera className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xl font-bold text-gray-900">Studio Photography</div>
                <div className="text-sm text-gray-500">Professional Photography Services</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">RECEIPT</div>
              <div className="mt-1 text-sm text-gray-500">{invoice.invoiceNumber}</div>
              <div className="text-sm text-gray-500">{formatDate(invoice.createdAt)}</div>
            </div>
          </div>
          <div className="mb-8 grid grid-cols-2 gap-8">
            <div>
              <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-400">Bill To</div>
              <div className="text-base font-semibold text-gray-900">{invoice.client?.name}</div>
              <div className="text-sm text-gray-500">{invoice.client?.email}</div>
              {invoice.client?.phone && <div className="text-sm text-gray-500">{invoice.client.phone}</div>}
              {invoice.client?.address && <div className="text-sm text-gray-500">{invoice.client.address}</div>}
            </div>
            <div className="text-right">
              <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-400">Payment Date</div>
              <div className="text-base font-semibold text-gray-900">{invoice.paidDate ? formatDate(invoice.paidDate) : formatDate(new Date())}</div>
              <div className="mt-2">
                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${invoice.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {invoice.status === 'paid' ? '✓ FULLY PAID' : 'PARTIAL PAYMENT'}
                </span>
              </div>
            </div>
          </div>
          <table className="mb-8 w-full">
            <thead><tr className="border-b-2 border-gray-900">
              <th className="pb-2 text-left text-xs font-bold uppercase text-gray-900">Description</th>
              <th className="pb-2 text-center text-xs font-bold uppercase text-gray-900">Qty</th>
              <th className="pb-2 text-right text-xs font-bold uppercase text-gray-900">Rate</th>
              <th className="pb-2 text-right text-xs font-bold uppercase text-gray-900">Amount</th>
            </tr></thead>
            <tbody>
              {(invoice.items || []).map((item: any) => (
                <tr key={item.id} className="border-b border-gray-100">
                  <td className="py-3 text-sm text-gray-900">{item.description}</td>
                  <td className="py-3 text-center text-sm text-gray-700">{item.quantity}</td>
                  <td className="py-3 text-right text-sm text-gray-700">{formatCurrency(item.rate)}</td>
                  <td className="py-3 text-right text-sm font-medium text-gray-900">{formatCurrency(item.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mb-8 flex justify-end">
            <div className="w-64 space-y-2 text-sm">
              <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>{formatCurrency(invoice.amount)}</span></div>
              <div className="flex justify-between text-gray-600"><span>Tax ({((invoice.taxRate || 0) * 100).toFixed(1)}%)</span><span>{formatCurrency(invoice.taxAmount || 0)}</span></div>
              <div className="flex justify-between border-t-2 border-gray-900 pt-2 text-lg font-bold text-gray-900"><span>Total</span><span>{formatCurrency(invoice.total)}</span></div>
              <div className="flex justify-between text-green-700"><span>Amount Paid</span><span className="font-semibold">{formatCurrency(totalPaid)}</span></div>
              <div className="flex justify-between border-t border-gray-200 pt-2 text-base font-bold text-gray-900"><span>Balance</span><span>{formatCurrency(invoice.total - totalPaid)}</span></div>
            </div>
          </div>
          {(invoice.payments || []).length > 0 && (
            <div className="mb-8 border-t border-gray-200 pt-6">
              <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">Payment Details</div>
              {(invoice.payments || []).map((payment: any) => (
                <div key={payment.id} className="flex items-center justify-between py-2 text-sm">
                  <div>
                    <span className="font-medium text-gray-900">{formatCurrency(payment.amount)}</span>
                    <span className="ml-2 text-gray-500">· {payment.method.replace('_', ' ')}</span>
                    {payment.reference && <span className="ml-2 text-gray-400">({payment.reference})</span>}
                  </div>
                  <span className="text-gray-500">{formatDate(payment.date)}</span>
                </div>
              ))}
            </div>
          )}
          <div className="border-t border-gray-200 pt-6 text-center text-xs text-gray-400">
            <p>Thank you for choosing Studio Photography!</p>
            <p className="mt-1">This is a computer-generated receipt. For questions, contact hello@studio.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}
