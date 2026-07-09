import { db } from "@/db";
import { sql } from "drizzle-orm";
import Link from "next/link";
import { Camera, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  await db.execute(sql`select 1`);

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-2 text-lg font-bold text-slate-900">
            <Camera className="h-6 w-6" />
            Studio Photography
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/booking"
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              Book Now
            </Link>
            <Link
              href="/admin"
              className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
            >
              Admin
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-slate-500">
            Professional Photography Studio
          </p>
          <h1 className="mt-4 text-4xl font-bold leading-tight text-slate-900 sm:text-5xl lg:text-6xl">
            Capture Your Most
            <br />
            <span className="text-slate-600">Precious Moments</span>
          </h1>
          <p className="mt-6 text-lg text-slate-500">
            From stunning portraits to unforgettable events, we bring your vision to life
            with professional photography services tailored to your needs.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/booking"
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-8 py-3.5 text-sm font-semibold text-white shadow-lg hover:bg-slate-800"
            >
              Book a Session
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-8 py-3.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Admin Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        <div className="grid gap-6 sm:grid-cols-3">
          {[
            {
              title: "Session Management",
              desc: "Create and manage photography sessions with categories, images, and display settings.",
              icon: "📷",
            },
            {
              title: "Package Builder",
              desc: "Build detailed packages with pricing, features, deposit settings, and more.",
              icon: "📦",
            },
            {
              title: "Dynamic Booking",
              desc: "Clients see live data from the database — no code changes needed for updates.",
              icon: "🗓️",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl bg-white p-8 shadow-sm"
            >
              <div className="text-3xl">{feature.icon}</div>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm text-slate-500">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
