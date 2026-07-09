import { db } from "@/db";
import { sessions, packages } from "@/db/schema";
import { isNull, eq, and, sql } from "drizzle-orm";
import { Camera, Package, Activity, Star } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [sessionStats] = await db
    .select({
      total: sql<number>`count(*)::int`,
      active: sql<number>`count(*) filter (where ${sessions.active} = true AND ${sessions.deletedAt} IS NULL)::int`,
    })
    .from(sessions);

  const [packageStats] = await db
    .select({
      total: sql<number>`count(*)::int`,
      active: sql<number>`count(*) filter (where ${packages.active} = true AND ${packages.deletedAt} IS NULL)::int`,
    })
    .from(packages);

  const stats = [
    {
      label: "Total Sessions",
      value: sessionStats.total,
      icon: Camera,
      color: "bg-blue-50 text-blue-600",
      href: "/admin/sessions",
    },
    {
      label: "Active Sessions",
      value: sessionStats.active,
      icon: Activity,
      color: "bg-green-50 text-green-600",
      href: "/admin/sessions",
    },
    {
      label: "Total Packages",
      value: packageStats.total,
      icon: Package,
      color: "bg-purple-50 text-purple-600",
      href: "/admin/packages",
    },
    {
      label: "Active Packages",
      value: packageStats.active,
      icon: Star,
      color: "bg-amber-50 text-amber-600",
      href: "/admin/packages",
    },
  ];

  return (
    <div className="px-4 py-8 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">Overview of your photography studio</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="rounded-2xl bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex items-center gap-4">
              <div className={`rounded-xl p-3 ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-slate-500">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Quick Actions</h2>
          <div className="mt-4 space-y-3">
            <Link
              href="/admin/sessions"
              className="flex items-center gap-3 rounded-lg border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              <Camera className="h-4 w-4" />
              Manage Sessions
            </Link>
            <Link
              href="/admin/packages"
              className="flex items-center gap-3 rounded-lg border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              <Package className="h-4 w-4" />
              Manage Packages
            </Link>
            <Link
              href="/booking"
              className="flex items-center gap-3 rounded-lg border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              <Activity className="h-4 w-4" />
              View Booking Page
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
