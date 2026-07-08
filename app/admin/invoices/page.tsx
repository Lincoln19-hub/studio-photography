import { getAllInvoices } from '@/lib/data';
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils';
import Link from 'next/link';
import { FileText, Plus } from 'lucide-react';

export default async function InvoicesPage() {
  const invoices = await getAllInvoices();

  const totalPaid = invoices.filter((inv: any) => inv.status === 'paid').reduce((sum: number, inv: any) => sum + inv.total, 0);
  const totalUnpaid = invoices.filter((inv: any) => inv.status === 'unpaid').reduce((sum: number, inv: any) => sum + inv.total, 0);

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
          <p className="mt-1 text-sm text-gray-500">
            {invoices.length} total · {formatCurrency(totalPaid)} collected · {formatCurrency(totalUnpaid)} outstanding
          </p>
        </div>
        <Link href="/admin/invoices/new" className="btn btn-primary">
          <Plus className="h-4 w-4" /> Create Invoice
        </Link>
      </div>

      {/* Summary */}
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <div className="stat-card">
          <div className="stat-label">Total Invoiced</div>
          <div className="stat-value">{formatCurrency(invoices.reduce((s: number, i: any) => s + i.total, 0))}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Collected</div>
          <div className="stat-value text-green-600">{formatCurrency(totalPaid)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Outstanding</div>
          <div className="stat-value text-red-600">{formatCurrency(totalUnpaid)}</div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <table className="w-full">
          <thead className="border-b border-gray-100 bg-gray-50/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Invoice #</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Client</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Due Date</th>
              <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Status</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {invoices.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500">
                  <FileText className="mx-auto mb-2 h-8 w-8 text-gray-300" />
                  No invoices yet
                </td>
              </tr>
            ) : (
              invoices.map((invoice: any) => (
                <tr key={invoice.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="text-sm font-semibold text-primary">{invoice.invoiceNumber}</div>
                    {invoice.booking && (
                      <div className="text-xs text-gray-500">{invoice.booking.service}</div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{invoice.client?.name}</div>
                    <div className="text-xs text-gray-500">{invoice.client?.email}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">{formatDate(invoice.dueDate)}</td>
                  <td className="px-6 py-4 text-right text-sm font-medium text-gray-900">{formatCurrency(invoice.total)}</td>
                  <td className="px-6 py-4">
                    <span className={`badge ${getStatusColor(invoice.status)}`}>{invoice.status}</span>
                  </td>
                  <td className="px-6 py-4">
                    <Link href={`/admin/invoices/${invoice.id}`} className="text-xs font-medium text-primary hover:text-primary-800">View →</Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
