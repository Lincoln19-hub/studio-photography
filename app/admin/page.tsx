import { getDashboardData } from '@/lib/data';
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils';
import { TrendingUp, CalendarCheck, FileText, Users, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import Link from 'next/link';

const iconMap: Record<string, any> = { TrendingUp, CalendarCheck, FileText, Users };

export default async function DashboardPage() {
  const { stats, recentBookings, recentInvoices } = await getDashboardData();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Overview of your studio performance.</p>
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = iconMap[stat.icon] || TrendingUp;
          return (
            <div key={stat.label} className="stat-card">
              <div className="flex items-center justify-between">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className={`inline-flex items-center gap-1 text-xs font-medium ${stat.trendUp ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.trendUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {stat.trend}
                </span>
              </div>
              <div className="mt-4">
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Bookings */}
        <div className="rounded-xl border border-gray-200 bg-white">
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
            <h3 className="font-semibold text-gray-900">Recent Bookings</h3>
            <Link href="/admin/bookings" className="text-xs font-medium text-primary hover:text-primary-800">View all →</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentBookings.length === 0 ? (
              <div className="px-6 py-8 text-center text-sm text-gray-500">No bookings yet</div>
            ) : (
              recentBookings.map((booking: any) => (
                <div key={booking.id} className="flex items-center justify-between px-6 py-4">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{booking.client?.name}</div>
                    <div className="text-xs text-gray-500">{booking.service} · {formatDate(booking.eventDate)}</div>
                  </div>
                  <span className={`badge ${getStatusColor(booking.status)}`}>{booking.status}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Invoices */}
        <div className="rounded-xl border border-gray-200 bg-white">
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
            <h3 className="font-semibold text-gray-900">Recent Invoices</h3>
            <Link href="/admin/invoices" className="text-xs font-medium text-primary hover:text-primary-800">View all →</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentInvoices.length === 0 ? (
              <div className="px-6 py-8 text-center text-sm text-gray-500">No invoices yet</div>
            ) : (
              recentInvoices.map((invoice: any) => (
                <div key={invoice.id} className="flex items-center justify-between px-6 py-4">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{invoice.invoiceNumber}</div>
                    <div className="text-xs text-gray-500">{invoice.client?.name} · {formatCurrency(invoice.total)}</div>
                  </div>
                  <span className={`badge ${getStatusColor(invoice.status)}`}>{invoice.status}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <Link href="/book" className="rounded-xl border border-gray-200 bg-white p-6 text-center transition-all hover:border-primary/30 hover:shadow-md">
          <CalendarCheck className="mx-auto mb-2 h-8 w-8 text-primary" />
          <div className="text-sm font-semibold text-gray-900">New Booking</div>
          <div className="mt-1 text-xs text-gray-500">Create a booking from the public form</div>
        </Link>
        <Link href="/admin/invoices/new" className="rounded-xl border border-gray-200 bg-white p-6 text-center transition-all hover:border-primary/30 hover:shadow-md">
          <FileText className="mx-auto mb-2 h-8 w-8 text-primary" />
          <div className="text-sm font-semibold text-gray-900">Create Invoice</div>
          <div className="mt-1 text-xs text-gray-500">Generate a new invoice</div>
        </Link>
        <Link href="/admin/clients" className="rounded-xl border border-gray-200 bg-white p-6 text-center transition-all hover:border-primary/30 hover:shadow-md">
          <Users className="mx-auto mb-2 h-8 w-8 text-primary" />
          <div className="text-sm font-semibold text-gray-900">Manage Clients</div>
          <div className="mt-1 text-xs text-gray-500">View all client records</div>
        </Link>
      </div>
    </div>
  );
}
