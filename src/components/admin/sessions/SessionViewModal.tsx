"use client";

import { Modal } from "@/components/ui/Modal";
import { Camera } from "lucide-react";
import type { SessionWithPackageCount } from "@/lib/types";

interface Props {
  session: SessionWithPackageCount | null;
  onClose: () => void;
}

export function SessionViewModal({ session, onClose }: Props) {
  if (!session) return null;

  return (
    <Modal open={!!session} onClose={onClose} title={session.name} size="lg">
      <div className="space-y-4">
        {/* Image */}
        {session.image ? (
          <img
            src={session.image}
            alt={session.name}
            className="h-48 w-full rounded-xl object-cover"
          />
        ) : (
          <div className="flex h-48 items-center justify-center rounded-xl bg-slate-100">
            <Camera className="h-12 w-12 text-slate-300" />
          </div>
        )}

        {/* Details */}
        <div className="grid gap-3 sm:grid-cols-2">
          <Detail label="Session Name" value={session.name} />
          <Detail label="Slug" value={session.slug} />
          <Detail label="Category" value={session.category || "—"} />
          <Detail label="Display Order" value={String(session.displayOrder)} />
          <Detail
            label="Status"
            value={session.active ? "Active" : "Inactive"}
          />
          <Detail label="Featured" value={session.featured ? "Yes" : "No"} />
          <Detail label="Packages" value={String(session.packageCount)} />
          <Detail
            label="Created"
            value={new Date(session.createdAt).toLocaleDateString()}
          />
        </div>

        {session.description && (
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
              Description
            </p>
            <p className="mt-1 text-sm text-slate-600 whitespace-pre-wrap">{session.description}</p>
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
