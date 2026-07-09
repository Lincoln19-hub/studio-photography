"use client";

import { useState, useEffect } from "react";
import { Camera, Clock, Users, Image, MapPin, CheckCircle, Loader2, ArrowLeft } from "lucide-react";
import { cn, formatCurrency, calculateDeposit } from "@/lib/utils";
import type { SessionWithPackages, PackageWithFeatures } from "@/lib/types";
import Link from "next/link";

export function BookingPageClient() {
  const [sessions, setSessions] = useState<SessionWithPackages[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<SessionWithPackages | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<PackageWithFeatures | null>(null);

  useEffect(() => {
    fetch("/api/sessions")
      .then((r) => r.json())
      .then((data) => {
        setSessions(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  function selectSession(session: SessionWithPackages) {
    setSelectedSession(session);
    setSelectedPackage(null);
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 text-lg font-bold text-slate-900">
            <Camera className="h-6 w-6" />
            Studio Photography
          </Link>
          <Link
            href="/admin"
            className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-200"
          >
            Admin
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* Title */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">
            Book Your Session
          </h1>
          <p className="mt-2 text-slate-500">
            Choose your photography session type and select a package
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Step 1: Select Session */}
            <section>
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
                  1
                </span>
                Select Session Type
              </h2>

              {sessions.length === 0 ? (
                <div className="rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center">
                  <Camera className="mx-auto mb-3 h-10 w-10 text-slate-300" />
                  <p className="text-slate-500">No sessions available at the moment</p>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {sessions.map((session) => (
                    <button
                      key={session.id}
                      onClick={() => selectSession(session)}
                      className={cn(
                        "group relative overflow-hidden rounded-2xl border-2 p-0 text-left transition-all",
                        selectedSession?.id === session.id
                          ? "border-slate-900 shadow-lg"
                          : "border-slate-200 hover:border-slate-400 hover:shadow-md"
                      )}
                    >
                      {session.image ? (
                        <div className="h-32 w-full overflow-hidden">
                          <img
                            src={session.image}
                            alt={session.name}
                            className="h-full w-full object-cover transition-transform group-hover:scale-105"
                          />
                        </div>
                      ) : (
                        <div className="flex h-32 w-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
                          <Camera className="h-8 w-8 text-slate-400" />
                        </div>
                      )}
                      <div className="p-4">
                        <h3 className="font-semibold text-slate-900">{session.name}</h3>
                        {session.category && (
                          <p className="mt-0.5 text-xs text-slate-400">{session.category}</p>
                        )}
                        {session.description && (
                          <p className="mt-1 text-sm text-slate-500 line-clamp-2">
                            {session.description}
                          </p>
                        )}
                        <p className="mt-2 text-xs text-slate-400">
                          {session.packages.length} package{session.packages.length !== 1 ? "s" : ""} available
                        </p>
                      </div>
                      {selectedSession?.id === session.id && (
                        <div className="absolute right-3 top-3 rounded-full bg-slate-900 p-1">
                          <CheckCircle className="h-4 w-4 text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </section>

            {/* Step 2: Select Package */}
            {selectedSession && (
              <section>
                <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
                    2
                  </span>
                  Select Package
                </h2>

                {selectedSession.packages.length === 0 ? (
                  <div className="rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center">
                    <p className="text-slate-500">No packages available for this session</p>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                    {selectedSession.packages.map((pkg) => {
                      const price = Number(pkg.price);
                      const { deposit } = calculateDeposit(price, pkg.depositPercentage);
                      const isSelected = selectedPackage?.id === pkg.id;

                      return (
                        <button
                          key={pkg.id}
                          onClick={() => setSelectedPackage(pkg)}
                          className={cn(
                            "rounded-2xl border-2 p-6 text-left transition-all",
                            isSelected
                              ? "border-slate-900 bg-slate-50 shadow-lg"
                              : "border-slate-200 hover:border-slate-400 hover:shadow-md"
                          )}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-lg font-semibold text-slate-900">
                                {pkg.name}
                              </h3>
                              <p className="mt-1 text-2xl font-bold text-slate-900">
                                {formatCurrency(price)}
                              </p>
                            </div>
                            {isSelected && (
                              <CheckCircle className="h-6 w-6 text-slate-900" />
                            )}
                          </div>

                          {/* Quick details */}
                          <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {pkg.duration}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {pkg.maxPeople} {(pkg.maxPeople ?? 1) === 1 ? "person" : "people"}
                            </span>
                            <span className="flex items-center gap-1">
                              <Image className="h-3 w-3" />
                              {pkg.editedPhotos} photos
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {pkg.locations} {(pkg.locations ?? 1) === 1 ? "location" : "locations"}
                            </span>
                          </div>

                          {/* Features */}
                          {pkg.features.length > 0 && (
                            <div className="mt-4 space-y-1.5">
                              {pkg.features.map((f) => (
                                <div
                                  key={f.id}
                                  className="flex items-center gap-2 text-sm text-slate-600"
                                >
                                  <CheckCircle className="h-3.5 w-3.5 shrink-0 text-green-500" />
                                  {f.feature}
                                </div>
                              ))}
                            </div>
                          )}

                          <div className="mt-4 rounded-lg bg-slate-100 px-3 py-2 text-xs text-slate-500">
                            Deposit: {formatCurrency(deposit)} ({pkg.depositPercentage}%)
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </section>
            )}
          </div>

          {/* Booking Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 rounded-2xl bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900">
                Booking Summary
              </h3>

              {!selectedSession && !selectedPackage ? (
                <div className="mt-4 rounded-xl border-2 border-dashed border-slate-200 p-6 text-center">
                  <Camera className="mx-auto mb-2 h-8 w-8 text-slate-300" />
                  <p className="text-sm text-slate-400">
                    Select a session and package to see your booking summary
                  </p>
                </div>
              ) : (
                <div className="mt-4 space-y-4">
                  {/* Session */}
                  {selectedSession && (
                    <div className="rounded-xl bg-slate-50 p-4">
                      <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                        Session
                      </p>
                      <p className="mt-1 font-medium text-slate-900">
                        {selectedSession.name}
                      </p>
                    </div>
                  )}

                  {/* Package */}
                  {selectedPackage && (
                    <>
                      <div className="rounded-xl bg-slate-50 p-4">
                        <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                          Package
                        </p>
                        <p className="mt-1 font-medium text-slate-900">
                          {selectedPackage.name}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {selectedPackage.duration} • {selectedPackage.editedPhotos} edited photos
                        </p>
                      </div>

                      {/* Price breakdown */}
                      <div className="space-y-2 border-t pt-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-500">Package Price</span>
                          <span className="font-medium text-slate-900">
                            {formatCurrency(Number(selectedPackage.price))}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-500">
                            Deposit ({selectedPackage.depositPercentage}%)
                          </span>
                          <span className="font-semibold text-green-600">
                            {formatCurrency(
                              calculateDeposit(
                                Number(selectedPackage.price),
                                selectedPackage.depositPercentage
                              ).deposit
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between border-t pt-2 text-sm">
                          <span className="text-slate-500">Remaining Balance</span>
                          <span className="font-medium text-slate-900">
                            {formatCurrency(
                              calculateDeposit(
                                Number(selectedPackage.price),
                                selectedPackage.depositPercentage
                              ).balance
                            )}
                          </span>
                        </div>
                      </div>

                      {/* Delivery info */}
                      <div className="rounded-xl bg-blue-50 p-3 text-xs text-blue-700">
                        📷 Delivery in {selectedPackage.deliveryTime}
                      </div>

                      {selectedPackage.rescheduleAllowed && (
                        <div className="rounded-xl bg-green-50 p-3 text-xs text-green-700">
                          ✓ Free rescheduling (with {selectedPackage.rescheduleHours}h notice)
                        </div>
                      )}
                    </>
                  )}

                  {/* Book Button */}
                  <button
                    disabled={!selectedPackage}
                    className="w-full rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {selectedPackage
                      ? `Book Now — ${formatCurrency(
                          calculateDeposit(
                            Number(selectedPackage.price),
                            selectedPackage.depositPercentage
                          ).deposit
                        )} Deposit`
                      : "Select a Package to Book"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
