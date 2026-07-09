"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { slugify } from "@/lib/utils";
import { Upload, Loader2, X } from "lucide-react";
import type { SessionWithPackageCount } from "@/lib/types";

interface Props {
  open: boolean;
  session: SessionWithPackageCount | null;
  onClose: () => void;
  onSaved: () => void;
}

const categories = [
  "Portrait",
  "Wedding",
  "Event",
  "Commercial",
  "Family",
  "Graduation",
  "Corporate",
  "Other",
];

export function SessionFormModal({ open, session, onClose, onSaved }: Props) {
  const { toast } = useToast();
  const isEdit = !!session;

  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    category: "",
    image: "",
    featured: false,
    displayOrder: 0,
    active: true,
  });

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [slugManual, setSlugManual] = useState(false);

  useEffect(() => {
    if (open) {
      if (session) {
        setForm({
          name: session.name,
          slug: session.slug,
          description: session.description || "",
          category: session.category || "",
          image: session.image || "",
          featured: session.featured,
          displayOrder: session.displayOrder,
          active: session.active,
        });
        setSlugManual(true);
      } else {
        setForm({
          name: "",
          slug: "",
          description: "",
          category: "",
          image: "",
          featured: false,
          displayOrder: 0,
          active: true,
        });
        setSlugManual(false);
      }
    }
  }, [open, session]);

  function handleNameChange(name: string) {
    setForm((prev) => ({
      ...prev,
      name,
      slug: slugManual ? prev.slug : slugify(name),
    }));
  }

  async function handleImageUpload(file: File) {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setForm((prev) => ({ ...prev, image: data.url }));
    } catch {
      toast("error", "Failed to upload image");
    }
    setUploading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      toast("error", "Session Name is required");
      return;
    }

    setSaving(true);
    try {
      const url = isEdit
        ? `/api/admin/sessions/${session.id}`
        : "/api/admin/sessions";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to save");
      }

      toast("success", isEdit ? "Session updated" : "Session created");
      onSaved();
    } catch (e) {
      toast("error", e instanceof Error ? e.message : "Failed to save session");
    }
    setSaving(false);
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Session" : "New Session"}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Name */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Session Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="e.g. Outdoor Portrait"
            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
          />
        </div>

        {/* Slug */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            SEO Slug
          </label>
          <input
            type="text"
            value={form.slug}
            onChange={(e) => {
              setSlugManual(true);
              setForm((prev) => ({ ...prev, slug: e.target.value }));
            }}
            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
          />
          <p className="mt-1 text-xs text-slate-400">Auto-generated from name. Click to edit manually.</p>
        </div>

        {/* Category */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Category
          </label>
          <select
            value={form.category}
            onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
          >
            <option value="">Select category</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Description
          </label>
          <textarea
            value={form.description}
            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
            rows={4}
            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
            placeholder="Describe this photography session..."
          />
        </div>

        {/* Image */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Session Image
          </label>
          {form.image ? (
            <div className="relative inline-block">
              <img
                src={form.image}
                alt="Preview"
                className="h-32 w-48 rounded-lg object-cover"
              />
              <button
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, image: "" }))}
                className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ) : (
            <label className="flex cursor-pointer items-center gap-2 rounded-lg border-2 border-dashed border-slate-300 p-6 hover:border-slate-400">
              {uploading ? (
                <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
              ) : (
                <Upload className="h-5 w-5 text-slate-400" />
              )}
              <span className="text-sm text-slate-500">
                {uploading ? "Uploading..." : "Click to upload image"}
              </span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageUpload(file);
                }}
              />
            </label>
          )}
        </div>

        {/* Display Order & Status */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Display Order
            </label>
            <input
              type="number"
              value={form.displayOrder}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  displayOrder: parseInt(e.target.value) || 0,
                }))
              }
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Status
            </label>
            <select
              value={form.active ? "active" : "inactive"}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  active: e.target.value === "active",
                }))
              }
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Featured */}
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.featured}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, featured: e.target.checked }))
            }
            className="rounded"
          />
          <span className="text-sm text-slate-700">Featured Session</span>
        </label>

        {/* Actions */}
        <div className="flex justify-end gap-3 border-t pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {saving ? "Saving..." : "Save Session"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
