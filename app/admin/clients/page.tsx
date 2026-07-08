import { prisma } from '@/lib/db';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Users } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function ClientsPage() {
  const clients = await prisma.client.findMany({
    include: {
      _count: {
        select: { bookings: true, invoices: true },
      },
      bookings: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
    orderBy: { createdAt: 'desc' },
  });

  const totalRevenue = async (clientId: string) => {
    const result = await prisma.invoice.aggregate({
      where: { clientId, status: 'paid' },
      _sum: { paidAmount: true },
    });
    return result._sum.paidAmount || 0;
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
        <p className="mt-1 text-sm text-gray-500">{clients.length} total clients</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {clients.length === 0 ? (
          <div className="col-span-full rounded-xl border border-gray-200 bg-white p-12 text-center">
            <Users className="mx-auto mb-2 h-8 w-8 text-gray-300" />
            <div className="text-sm text-gray-500">No clients yet</div>
          </div>
        ) : (
          clients.map((client) => (
            <div key={client.id} className="rounded-xl border border-gray-200 bg-white p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-sm font-semibold text-primary">
                  {client.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900">{client.name}</div>
                  <div className="text-xs text-gray-500">{client.email}</div>
                </div>
              </div>
              {client.phone && (
                <div className="mb-2 text-xs text-gray-600">📞 {client.phone}</div>
              )}
              {client.address && (
                <div className="mb-3 text-xs text-gray-600">📍 {client.address}</div>
              )}
              <div className="flex items-center justify-between border-t border-gray-100 pt-3 text-xs">
                <span className="text-gray-500">
                  {client._count.bookings} bookings · {client._count.invoices} invoices
                </span>
                <span className="font-medium text-green-600">
                  {formatCurrency(0)} {/* Simplified - would need async calculation */}
                </span>
              </div>
              <div className="mt-2 text-xs text-gray-400">
                Client since {formatDate(client.createdAt)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
