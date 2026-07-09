"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { Plus, Trash2, Loader2, GripVertical } from "lucide-react";
import type { PackageWithFeatures, Session } from "@/lib/types";

interface Props {
  open: boolean;
  pkg: PackageWithFeatures | null;
  sessions: Session[];
  onClose: () => void;
  onSaved: () => void;
}

interface FeatureRow {
  id: string;
  feature: string;
}

const defaultForm = {
  sessionId: 0,
  name: "",
  description: "",
  price: "",
  duration: "1 hour",
  maxPeople: 1,
  editedPhotos: 10,
  outfitChanges: 1,
  locations: 1,
  deliveryTime: "3 Days",
  onlineGallery: false,
  rawImages: false,
  printing: false,
  transportation: false,
  droneCoverage: false,
  priorityEditing: false,
  depositPercentage: 50,
  rescheduleAllowed: true,
  rescheduleHours: 48,
  displayOrder: 0,
  active: true,
};

const durations = ["1 hour", "2 hours", "3 hours", "Half Day", "Full Day"];
const deliveryTimes = ["1 Day", "2 Days", "3 Days", "5 Days", "7 Days", "14 Days"];

export function PackageFormModal({ open, pkg, sessions, onClose, onSaved }: Props) {
  const { toast } = useToast();
  const isEdit = !!pkg;

  const [form, setForm] = useState(defaultForm);
  const [features, setFeatures] = useState<FeatureRow[]>([]);
  const [saving, setSaving] = useState(false);
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  useEffect(() => {
    if (open) {
      if (pkg) {
        setForm({
          sessionId: pkg.sessionId,
          name: pkg.name,
          description: pkg.description || "",
          price: String(pkg.price),
          duration: pkg.duration,
          maxPeople: pkg.maxPeople ?? 1,
          editedPhotos: pkg.editedPhotos ?? 0,
          outfitChanges: pkg.outfitChanges ?? 1,
          locations: pkg.locations ?? 1,
          deliveryTime: pkg.deliveryTime || "3 Days",
          onlineGallery: pkg.onlineGallery,
          rawImages: pkg.rawImages,
          printing: pkg.printing,
          transportation: pkg.transportation,
          droneCoverage: pkg.droneCoverage,
          priorityEditing: pkg.priorityEditing,
          depositPercentage: pkg.depositPercentage,
          rescheduleAllowed: pkg.rescheduleAllowed,
          rescheduleHours: pkg.rescheduleHours ?? 48,
          displayOrder: pkg.displayOrder,
          active: pkg.active,
        });
        setFeatures(
          pkg.features.map((f) => ({
            id: String(f.id),
            feature: f.feature,
          }))
        );
      } else {
        setForm({
          ...defaultForm,
          sessionId: sessions[0]?.id ?? 0,
        });
        setFeatures([]);
      }
    }
  }, [open, pkg, sessions]);

  function addFeature() {
    setFeatures((prev) => [
      ...prev,
      { id: `new-${Date.now()}`, feature: "" },
    ]);
  }

  function removeFeature(id: string) {
    setFeatures((prev) => prev.filter((f) => f.id !== id));
  }

  function updateFeature(id: string, value: string) {
    setFeatures((prev) =>
      prev.map((f) => (f.id === id ? { ...f, feature: value } : f))
    );
  }

  function handleDragStart(idx: number) {
    setDragIdx(idx);
  }

  function handleDragOver(e: React.DragEvent, idx: number) {
    e.preventDefault();
    if (dragIdx === null || dragIdx === idx) return;
    setFeatures((prev) => {
      const updated = [...prev];
      const [moved] = updated.splice(dragIdx, 1);
      updated.splice(idx, 0, moved);
      return updated;
    });
    setDragIdx(idx);
  }

  function handleDragEnd() {
    setDragIdx(null);
  }

  function setField<K extends keyof typeof defaultForm>(key: K, value: (typeof defaultForm)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.name.trim()) {
      toast("error", "Package Name is required");
      return;
    }
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0) {
      toast("error", "Price is required and must be greater than 0");
      return;
    }
    if (!form.duration) {
      toast("error", "Duration is required");
      return;
    }
    if (!form.sessionId) {
      toast("error", "Please select a session");
      return;
    }
    if (form.depositPercentage < 0 || form.depositPercentage > 100) {
      toast("error", "Deposit percentage must be 0-100");
      return;
    }

    const validFeatures = features
      .filter((f) => f.feature.trim())
      .map((f, i) => ({ feature: f.feature.trim(), displayOrder: i }));

    setSaving(true);
    try {
      const url = isEdit
        ? `/api/admin/packages/${pkg.id}`
        : "/api/admin/packages";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, price: Number(form.price), features: validFeatures }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to save");
      }

      toast("success", isEdit ? "Package updated" : "Package created");
      onSaved();
    } catch (e) {
      toast("error", e instanceof Error ? e.message : "Failed to save package");
    }
    setSaving(false);
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Package" : "New Package"}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="max-h-[70vh] space-y-5 overflow-y-auto pr-2">
        {/* Session */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Session <span className="text-red-500">*</span>
          </label>
          <select
            value={form.sessionId}
            onChange={(e) => setField("sessionId", parseInt(e.target.value))}
            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
          >
            <option value={0}>Select session</option>
            {sessions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* Name & Price */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Package Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setField("name", e.target.value)}
              placeholder="e.g. Basic, Standard, Premium"
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Price (GH₵) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={form.price}
              onChange={(e) => setField("price", e.target.value)}
              placeholder="400"
              min="0"
              step="0.01"
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
            />
          </div>
        </div>

        {/* Duration & Delivery Time */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Duration <span className="text-red-500">*</span>
            </label>
            <select
              value={form.duration}
              onChange={(e) => setField("duration", e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
            >
              {durations.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Delivery Time
            </label>
            <select
              value={form.deliveryTime}
              onChange={(e) => setField("deliveryTime", e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
            >
              {deliveryTimes.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Number fields */}
        <div className="grid gap-4 sm:grid-cols-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Max People
            </label>
            <input
              type="number"
              value={form.maxPeople}
              onChange={(e) => setField("maxPeople", parseInt(e.target.value) || 1)}
              min="1"
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Edited Photos
            </label>
            <input
              type="number"
              value={form.editedPhotos}
              onChange={(e) => setField("editedPhotos", parseInt(e.target.value) || 0)}
              min="0"
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Outfit Changes
            </label>
            <input
              type="number"
              value={form.outfitChanges}
              onChange={(e) => setField("outfitChanges", parseInt(e.target.value) || 1)}
              min="0"
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Locations
            </label>
            <input
              type="number"
              value={form.locations}
              onChange={(e) => setField("locations", parseInt(e.target.value) || 1)}
              min="1"
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
            />
          </div>
        </div>

        {/* Checkboxes */}
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Included Services
          </label>
          <div className="grid gap-2 sm:grid-cols-3">
            {([
              ["onlineGallery", "Online Gallery"],
              ["rawImages", "Raw Images"],
              ["printing", "Printing"],
              ["transportation", "Transportation"],
              ["droneCoverage", "Drone Coverage"],
              ["priorityEditing", "Priority Editing"],
            ] as const).map(([key, label]) => (
              <label key={key} className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2">
                <input
                  type="checkbox"
                  checked={form[key] as boolean}
                  onChange={(e) => setField(key, e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm text-slate-700">{label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Deposit & Reschedule */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Deposit % <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={form.depositPercentage}
              onChange={(e) => setField("depositPercentage", parseInt(e.target.value) || 0)}
              min="0"
              max="100"
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
            />
          </div>
          <div>
            <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-slate-700">
              <input
                type="checkbox"
                checked={form.rescheduleAllowed}
                onChange={(e) => setField("rescheduleAllowed", e.target.checked)}
                className="rounded"
              />
              Rescheduling Allowed
            </label>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Reschedule Notice (Hours)
            </label>
            <input
              type="number"
              value={form.rescheduleHours}
              onChange={(e) => setField("rescheduleHours", parseInt(e.target.value) || 0)}
              min="0"
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Package Description
          </label>
          <textarea
            value={form.description}
            onChange={(e) => setField("description", e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
            placeholder="Describe this package..."
          />
        </div>

        {/* Display Order & Status */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Display Order
            </label>
            <input
              type="number"
              value={form.displayOrder}
              onChange={(e) => setField("displayOrder", parseInt(e.target.value) || 0)}
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Status
            </label>
            <select
              value={form.active ? "active" : "inactive"}
              onChange={(e) => setField("active", e.target.value === "active")}
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Features */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-sm font-medium text-slate-700">
              Package Features
            </label>
            <button
              type="button"
              onClick={addFeature}
              className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200"
            >
              <Plus className="h-3 w-3" />
              Add Feature
            </button>
          </div>
          <div className="space-y-2">
            {features.map((f, idx) => (
              <div
                key={f.id}
                draggable
                onDragStart={() => handleDragStart(idx)}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDragEnd={handleDragEnd}
                className="flex items-center gap-2"
              >
                <GripVertical className="h-4 w-4 shrink-0 cursor-grab text-slate-400" />
                <span className="shrink-0 text-green-500">✓</span>
                <input
                  type="text"
                  value={f.feature}
                  onChange={(e) => updateFeature(f.id, e.target.value)}
                  placeholder="e.g. 10 Edited Images"
                  className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => removeFeature(f.id)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            {features.length === 0 && (
              <p className="text-xs text-slate-400 italic">
                No features added yet. Click &quot;Add Feature&quot; to add one.
              </p>
            )}
          </div>
        </div>

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
            {saving ? "Saving..." : "Save Package"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
