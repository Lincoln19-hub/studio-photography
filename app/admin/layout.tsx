'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Camera, LayoutDashboard, CalendarCheck, FileText, Users, ArrowLeft, Image as ImageIcon } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/bookings', label: 'Bookings', icon: CalendarCheck },
    { href: '/admin/invoices', label: 'Invoices', icon: FileText },
    { href: '/admin/galleries', label: 'Galleries', icon: ImageIcon },
    { href: '/admin/clients', label: 'Clients', icon: Users },
  ];

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="fixed left-0 top-0 bottom-0 z-40 w-64 border-r border-gray-200 bg-white">
        <div className="flex h-full flex-col">
          <div className="flex items-center gap-2.5 border-b border-gray-100 px-6 py-5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-primary">
              <Camera className="h-4 w-4" />
            </div>
            <span className="text-lg font-semibold">Studio Admin</span>
          </div>
          <nav className="flex-1 space-y-1 px-3 py-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive(item.href) ? 'bg-blue-50 text-primary' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="border-t border-gray-100 px-3 py-4">
            <a href="/" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900">
              <ArrowLeft className="h-4 w-4" /> Back to Site
            </a>
          </div>
        </div>
      </aside>
      <main className="ml-64 flex-1">
        <div className="mx-auto max-w-7xl px-8 py-8">{children}</div>
      </main>
    </div>
  );
}
