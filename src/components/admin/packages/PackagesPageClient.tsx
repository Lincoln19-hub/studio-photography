"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus, Search, Eye, Pencil, Trash2, ToggleLeft, ToggleRight,
  Package, Filter, Loader2, Copy,
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { PackageFormModal } from "./PackageFormModal";
import { PackageViewModal } from "./PackageViewModal";
import type { PackageWithFeatures } from "@/lib/types";
import type { Session } from "@/lib/types";

export function PackagesPageClient() {
  const { toast } = useToast();
  const [packages, setPackages] = useState<PackageWithFeatures[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");
  const [sessionFilter, setSessionFilter] = useState<string>("");

  const [formOpen, setFormOpen] = useState(false);
  const [editPkg, setEditPkg] = useState<PackageWithFeatures | null>(null);
  const [viewPkg, setViewPkg] = useState<PackageWithFeatures | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<PackageWithFeatures | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchPackages = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (sessionFilter) params.set("sessionId", sessionFilter);
      const res = await fetch(`/api/admin/packages?${params.toString()}`);
      const data = await res.json();
      setPackages(data);
    } catch {
      toast("error", "Failed to load packages");
    }
    setLoading(false);
  }, [sessionFilter, toast]);

  const fetchSessions = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/sessions");
      const data = await res.json();
      setSessions(data);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  useEffect(() => {
    fetchPackages();
  }, [fetchPackages]);

  const filtered = packages.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === "all" ||
      (filter === "active" && p.active) ||
      (filter === "inactive" && !p.active);
    return matchSearch && matchFilter;
  });

  function getSessionName(sessionId: number) {
    return sessions.find((s) => s.id === sessionId)?.name || "Unknown";
  }

  async function handleToggle(pkg: PackageWithFeatures) {
    try {
      const res = await fetch(`/api/admin/packages/${pkg.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !pkg.active }),
      });
      if (!res.ok) throw new Error();
      toast("success", `Package ${pkg.active ? "deactivated" : "activated"}`);
      fetchPackages();
    } catch {
      toast("error", "Failed to toggle status");
    }
  }

  async function handleDelete() {
    if (!deleteConfirm) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/packages/${deleteConfirm.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      toast("success", "Package deleted");
      setDeleteConfirm(null);
      fetchPackages();
    } catch {
      toast("error", "Failed to delete package");
    }
    setActionLoading(false);
  }

  async function handleDuplicate(pkg: PackageWithFeatures) {
    try {
      const body = {
        sessionId: pkg.sessionId,
        name: `${pkg.name} (Copy)`,
        description: pkg.description,
        price: pkg.price,
        duration: pkg.duration,
        maxPeople: pkg.maxPeople,
        editedPhotos: pkg.editedPhotos,
        outfitChanges: pkg.outfitChanges,
        locations: pkg.locations,
        deliveryTime: pkg.deliveryTime,
        onlineGallery: pkg.onlineGallery,
        rawImages: pkg.rawImages,
        printing: pkg.printing,
        transportation: pkg.transportation,
        droneCoverage: pkg.droneCoverage,
        priorityEditing: pkg.priorityEditing,
        depositPercentage: pkg.depositPercentage,
        rescheduleAllowed: pkg.rescheduleAllowed,
        rescheduleHours: pkg.rescheduleHours,
        displayOrder: pkg.displayOrder + 1,
        active: false,
        features: pkg.features.map((f) => ({
          feature: f.feature,
          displayOrder: f.displayOrder,
        })),
      };
      const res = await fetch("/api/admin/packages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error();
      toast("success", "Package duplicated");
      fetchPackages();
    } catch {
      toast("error", "Failed to duplicate package");
    }
  }

  return (
    <div className="px-4 py-8 lg:px-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Packages</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage packages across all sessions
          </p>
        </div>
        <button
          onClick={() => {
            setEditPkg(null);
            setFormOpen(true);
          }}
          className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
        >
          <Plus className="h-4 w-4" />
          New Package
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search packages..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-300 py-2 pl-10 pr-4 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
          />
        </div>
        <select
          value={sessionFilter}
          onChange={(e) => setSessionFilter(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
        >
          <option value="">All Sessions</option>
          {sessions.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400" />
          {(["all", "active", "inactive"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-medium capitalize",
                filter === f
                  ? "bg-slate-900 text-white"
                  : "bg-white text-slate-600 border border-slate-300 hover:bg-slate-50"
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Package className="mb-3 h-10 w-10" />
            <p className="text-sm">No packages found</p>
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                <th className="px-6 py-3">Package</th>
                <th className="px-6 py-3">Session</th>
                <th className="px-6 py-3">Price</th>
                <th className="hidden px-6 py-3 md:table-cell">Duration</th>
                <th className="hidden px-6 py-3 lg:table-cell">Deposit</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((p) => (
                <tr
                  key={p.id}
                  className={cn(
                    "transition-colors hover:bg-slate-50",
                    p.deletedAt && "opacity-50"
                  )}
                >
                  <td className="px-6 py-4">
                    <p className="font-medium text-slate-900">{p.name}</p>
                    <p className="text-xs text-slate-400">
                      {p.features.length} feature{p.features.length !== 1 ? "s" : ""}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {getSessionName(p.sessionId)}
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-900">
                    {formatCurrency(Number(p.price))}
                  </td>
                  <td className="hidden px-6 py-4 text-slate-600 md:table-cell">
                    {p.duration}
                  </td>
                  <td className="hidden px-6 py-4 text-slate-600 lg:table-cell">
                    {p.depositPercentage}%
                  </td>
                  <td className="px-6 py-4">
                    {p.active ? (
                      <span className="inline-flex rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-600">
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex rounded-full bg-yellow-50 px-2.5 py-0.5 text-xs font-medium text-yellow-600">
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setViewPkg(p)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                        title="View"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          setEditPkg(p);
                          setFormOpen(true);
                        }}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-blue-50 hover:text-blue-600"
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDuplicate(p)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-purple-50 hover:text-purple-600"
                        title="Duplicate"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleToggle(p)}
                        className={cn(
                          "rounded-lg p-1.5",
                          p.active
                            ? "text-green-500 hover:bg-green-50"
                            : "text-slate-400 hover:bg-slate-100"
                        )}
                        title={p.active ? "Deactivate" : "Activate"}
                      >
                        {p.active ? (
                          <ToggleRight className="h-4 w-4" />
                        ) : (
                          <ToggleLeft className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(p)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modals */}
      <PackageFormModal
        open={formOpen}
        pkg={editPkg}
        sessions={sessions}
        onClose={() => {
          setFormOpen(false);
          setEditPkg(null);
        }}
        onSaved={() => {
          setFormOpen(false);
          setEditPkg(null);
          fetchPackages();
        }}
      />

      <PackageViewModal
        pkg={viewPkg}
        sessionName={viewPkg ? getSessionName(viewPkg.sessionId) : ""}
        onClose={() => setViewPkg(null)}
      />

      <ConfirmDialog
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
        title="Delete Package"
        message={`Are you sure you want to delete "${deleteConfirm?.name}"?`}
        confirmText="Delete"
        loading={actionLoading}
      />
    </div>
  );
}
