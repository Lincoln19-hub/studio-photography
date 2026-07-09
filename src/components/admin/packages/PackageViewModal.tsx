"use client";

import { Modal } from "@/components/ui/Modal";
import { formatCurrency, calculateDeposit } from "@/lib/utils";
import { CheckCircle } from "lucide-react";
import type { PackageWithFeatures } from "@/lib/types";

interface Props {
  pkg: PackageWithFeatures | null;
  sessionName: string;
  onClose: () => void;
}

export function PackageViewModal({ pkg, sessionName, onClose }: Props) {
  if (!pkg) return null;

  const price = Number(pkg.price);
  const { deposit, balance } = calculateDeposit(price, pkg.depositPercentage);

  return (
    <Modal open={!!pkg} onClose={onClose} title={pkg.name} size="lg">
      <div className="space-y-5">
        {/* Price */}
        <div className="rounded-xl bg-slate-50 p-4 text-center">
          <p className="text-3xl font-bold text-slate-900">
            {formatCurrency(price)}
          </p>
          <p className="mt-1 text-sm text-slate-500">{pkg.duration}</p>
        </div>

        {/* Details */}
        <div className="grid gap-3 sm:grid-cols-2">
          <Detail label="Session" value={sessionName} />
          <Detail label="Status" value={pkg.active ? "Active" : "Inactive"} />
          <Detail label="Max People" value={String(pkg.maxPeople ?? 1)} />
          <Detail label="Edited Photos" value={String(pkg.editedPhotos ?? 0)} />
          <Detail label="Outfit Changes" value={String(pkg.outfitChanges ?? 1)} />
          <Detail label="Locations" value={String(pkg.locations ?? 1)} />
          <Detail label="Delivery Time" value={pkg.deliveryTime || "—"} />
          <Detail label="Display Order" value={String(pkg.displayOrder)} />
        </div>

        {/* Pricing */}
        <div className="rounded-xl border border-slate-200 p-4">
          <h3 className="mb-2 text-sm font-semibold text-slate-700">Pricing Breakdown</h3>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Package Price</span>
              <span className="font-medium">{formatCurrency(price)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Deposit ({pkg.depositPercentage}%)</span>
              <span className="font-medium text-green-600">{formatCurrency(deposit)}</span>
            </div>
            <div className="flex justify-between border-t pt-1">
              <span className="text-slate-500">Balance</span>
              <span className="font-medium">{formatCurrency(balance)}</span>
            </div>
          </div>
        </div>

        {/* Included */}
        <div>
          <h3 className="mb-2 text-sm font-semibold text-slate-700">Included Services</h3>
          <div className="grid gap-1 sm:grid-cols-2 text-sm">
            {[
              ["Online Gallery", pkg.onlineGallery],
              ["Raw Images", pkg.rawImages],
              ["Printing", pkg.printing],
              ["Transportation", pkg.transportation],
              ["Drone Coverage", pkg.droneCoverage],
              ["Priority Editing", pkg.priorityEditing],
              ["Rescheduling", pkg.rescheduleAllowed],
            ].map(([label, included]) => (
              <p
                key={label as string}
                className={included ? "text-green-600" : "text-slate-400"}
              >
                {included ? "✓" : "✗"} {label as string}
              </p>
            ))}
          </div>
        </div>

        {/* Features */}
        {pkg.features.length > 0 && (
          <div>
            <h3 className="mb-2 text-sm font-semibold text-slate-700">Features</h3>
            <div className="space-y-1.5">
              {pkg.features.map((f) => (
                <div key={f.id} className="flex items-center gap-2 text-sm text-slate-600">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  {f.feature}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Description */}
        {pkg.description && (
          <div>
            <h3 className="mb-1 text-sm font-semibold text-slate-700">Description</h3>
            <p className="text-sm text-slate-600 whitespace-pre-wrap">{pkg.description}</p>
          </div>
        )}
      </div>
    </Modal>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <p className="mt-0.5 text-sm font-medium text-slate-700">{value}</p>
    </div>
  );
}
