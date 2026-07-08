import { prisma } from '@/lib/db';
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils';
import Link from 'next/link';
import { CalendarCheck, Plus } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function BookingsPage() {
  const bookings = await prisma.booking.findMany({
    include: { client: true, invoice: true },
    orderBy: { eventDate: 'desc' },
  });

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
          <p className="mt-1 text-sm text-gray-500">{bookings.length} total bookings</p>
        </div>
        <Link href="/book" className="btn btn-primary">
          <Plus className="h-4 w-4" /> New Booking
        </Link>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <table className="w-full">
          <thead className="border-b border-gray-100 bg-gray-50/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Client</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Service</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Date</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Duration</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Budget</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {bookings.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500">
                  <CalendarCheck className="mx-auto mb-2 h-8 w-8 text-gray-300" />
                  No bookings yet
                </td>
              </tr>
            ) : (
              bookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{booking.client.name}</div>
                    <div className="text-xs text-gray-500">{booking.client.email}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">{booking.service}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{formatDate(booking.eventDate)}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{booking.duration}h</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{booking.budget ? formatCurrency(booking.budget) : '—'}</td>
                  <td className="px-6 py-4">
                    <span className={`badge ${getStatusColor(booking.status)}`}>{booking.status}</span>
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
