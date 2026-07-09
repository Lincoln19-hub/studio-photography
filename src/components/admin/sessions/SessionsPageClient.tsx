"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus, Search, Eye, Pencil, Trash2, ToggleLeft, ToggleRight,
  Camera, Filter, Loader2, RotateCcw, Copy,
} from "lucide-react";
import { cn, slugify } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { SessionFormModal } from "./SessionFormModal";
import { SessionViewModal } from "./SessionViewModal";
import type { SessionWithPackageCount } from "@/lib/types";

export function SessionsPageClient() {
  const { toast } = useToast();
  const [sessions, setSessions] = useState<SessionWithPackageCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");
  const [showDeleted, setShowDeleted] = useState(false);

  // Modals
  const [formOpen, setFormOpen] = useState(false);
  const [editSession, setEditSession] = useState<SessionWithPackageCount | null>(null);
  const [viewSession, setViewSession] = useState<SessionWithPackageCount | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ session: SessionWithPackageCount; force: boolean } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/sessions?includeDeleted=${showDeleted}`);
      const data = await res.json();
      setSessions(data);
    } catch {
      toast("error", "Failed to load sessions");
    }
    setLoading(false);
  }, [showDeleted, toast]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const filtered = sessions.filter((s) => {
    const matchSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.category || "").toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === "all" ||
      (filter === "active" && s.active) ||
      (filter === "inactive" && !s.active);
    return matchSearch && matchFilter;
  });

  async function handleToggle(session: SessionWithPackageCount) {
    try {
      const res = await fetch(`/api/admin/sessions/${session.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !session.active }),
      });
      if (!res.ok) throw new Error();
      toast("success", `Session ${session.active ? "deactivated" : "activated"}`);
      fetchSessions();
    } catch {
      toast("error", "Failed to toggle session status");
    }
  }

  async function handleDelete() {
    if (!deleteConfirm) return;
    setActionLoading(true);
    try {
      const url = `/api/admin/sessions/${deleteConfirm.session.id}${deleteConfirm.force ? "?force=true" : ""}`;
      const res = await fetch(url, { method: "DELETE" });
      const data = await res.json();

      if (!res.ok) {
        if (data.hasPackages) {
          setDeleteConfirm({ ...deleteConfirm, force: true });
          setActionLoading(false);
          return;
        }
        throw new Error(data.error);
      }

      toast("success", "Session deleted");
      setDeleteConfirm(null);
      fetchSessions();
    } catch (e) {
      toast("error", e instanceof Error ? e.message : "Failed to delete session");
    }
    setActionLoading(false);
  }

  async function handleRestore(session: SessionWithPackageCount) {
    try {
      const res = await fetch(`/api/admin/sessions/${session.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ restore: true }),
      });
      if (!res.ok) throw new Error();
      toast("success", "Session restored");
      fetchSessions();
    } catch {
      toast("error", "Failed to restore session");
    }
  }

  async function handleDuplicate(session: SessionWithPackageCount) {
    try {
      const res = await fetch("/api/admin/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${session.name} (Copy)`,
          slug: slugify(`${session.name} copy`),
          description: session.description,
          category: session.category,
          image: session.image,
          featured: session.featured,
          displayOrder: session.displayOrder + 1,
          active: false,
        }),
      });
      if (!res.ok) throw new Error();
      toast("success", "Session duplicated");
      fetchSessions();
    } catch {
      toast("error", "Failed to duplicate session");
    }
  }

  return (
    <div className="px-4 py-8 lg:px-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Sessions</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage your photography sessions
          </p>
        </div>
        <button
          onClick={() => {
            setEditSession(null);
            setFormOpen(true);
          }}
          className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
        >
          <Plus className="h-4 w-4" />
          New Session
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search sessions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-300 py-2 pl-10 pr-4 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
          />
        </div>
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
          <label className="ml-2 flex items-center gap-1.5 text-xs text-slate-500">
            <input
              type="checkbox"
              checked={showDeleted}
              onChange={(e) => setShowDeleted(e.target.checked)}
              className="rounded"
            />
            Show deleted
          </label>
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
            <Camera className="mb-3 h-10 w-10" />
            <p className="text-sm">No sessions found</p>
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                <th className="px-6 py-3">Session</th>
                <th className="px-6 py-3">Category</th>
                <th className="hidden px-6 py-3 md:table-cell">Order</th>
                <th className="px-6 py-3">Status</th>
                <th className="hidden px-6 py-3 lg:table-cell">Packages</th>
                <th className="hidden px-6 py-3 xl:table-cell">Created</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((s) => (
                <tr
                  key={s.id}
                  className={cn(
                    "transition-colors hover:bg-slate-50",
                    s.deletedAt && "opacity-50"
                  )}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {s.image ? (
                        <img
                          src={s.image}
                          alt={s.name}
                          className="h-10 w-10 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-400">
                          <Camera className="h-4 w-4" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-slate-900">{s.name}</p>
                        <p className="text-xs text-slate-400">{s.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{s.category || "—"}</td>
                  <td className="hidden px-6 py-4 text-slate-600 md:table-cell">
                    {s.displayOrder}
                  </td>
                  <td className="px-6 py-4">
                    {s.deletedAt ? (
                      <span className="inline-flex rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-600">
                        Deleted
                      </span>
                    ) : s.active ? (
                      <span className="inline-flex rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-600">
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex rounded-full bg-yellow-50 px-2.5 py-0.5 text-xs font-medium text-yellow-600">
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="hidden px-6 py-4 text-slate-600 lg:table-cell">
                    {s.packageCount}
                  </td>
                  <td className="hidden px-6 py-4 text-slate-500 xl:table-cell">
                    {new Date(s.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1">
                      {s.deletedAt ? (
                        <button
                          onClick={() => handleRestore(s)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-green-50 hover:text-green-600"
                          title="Restore"
                        >
                          <RotateCcw className="h-4 w-4" />
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => setViewSession(s)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                            title="View"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              setEditSession(s);
                              setFormOpen(true);
                            }}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-blue-50 hover:text-blue-600"
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDuplicate(s)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-purple-50 hover:text-purple-600"
                            title="Duplicate"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleToggle(s)}
                            className={cn(
                              "rounded-lg p-1.5",
                              s.active
                                ? "text-green-500 hover:bg-green-50"
                                : "text-slate-400 hover:bg-slate-100"
                            )}
                            title={s.active ? "Deactivate" : "Activate"}
                          >
                            {s.active ? (
                              <ToggleRight className="h-4 w-4" />
                            ) : (
                              <ToggleLeft className="h-4 w-4" />
                            )}
                          </button>
                          <button
                            onClick={() => setDeleteConfirm({ session: s, force: false })}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Form Modal */}
      <SessionFormModal
        open={formOpen}
        session={editSession}
        onClose={() => {
          setFormOpen(false);
          setEditSession(null);
        }}
        onSaved={() => {
          setFormOpen(false);
          setEditSession(null);
          fetchSessions();
        }}
      />

      {/* View Modal */}
      <SessionViewModal
        session={viewSession}
        onClose={() => setViewSession(null)}
      />

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
        title="Delete Session"
        message={
          deleteConfirm?.force
            ? `"${deleteConfirm.session.name}" has ${deleteConfirm.session.packageCount} package(s). All packages will also be deleted. Continue?`
            : `Are you sure you want to delete "${deleteConfirm?.session.name}"? This action can be reversed.`
        }
        confirmText={deleteConfirm?.force ? "Delete with Packages" : "Delete"}
        loading={actionLoading}
      />
    </div>
  );
}
