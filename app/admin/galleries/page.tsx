'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Copy, Check, ExternalLink, Plus, Image as ImageIcon } from 'lucide-react';

export default function GalleriesPage() {
  const router = useRouter();
  const [galleries, setGalleries] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState('');
  const [galleryTitle, setGalleryTitle] = useState('');
  const [creating, setCreating] = useState(false);
  const [copiedId, setCopiedId] = useState('');

  useEffect(() => {
    Promise.all([
      fetch('/api/galleries').then((r) => r.json()),
      fetch('/api/invoices').then((r) => r.json()),
    ])
      .then(([gals, invs]) => {
        setGalleries(Array.isArray(gals) ? gals : []);
        setInvoices(Array.isArray(invs) ? invs.filter((i: any) => i.status === 'paid') : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const createGallery = async () => {
    if (!selectedInvoice) return;
    setCreating(true);

    try {
      const res = await fetch('/api/galleries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceId: selectedInvoice,
          title: galleryTitle || undefined,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setGalleries([data.gallery, ...galleries]);
        setShowCreate(false);
        setSelectedInvoice('');
        setGalleryTitle('');
        router.push(`/admin/galleries/${data.gallery.id}`);
      } else {
        alert(data.error || 'Failed to create gallery');
      }
    } catch (error) {
      console.error(error);
      alert('Failed to create gallery');
    } finally {
      setCreating(false);
    }
  };

  const copyLink = (gallery: any) => {
    const link = `${window.location.origin}/gallery/${gallery.accessToken}`;
    navigator.clipboard.writeText(link);
    setCopiedId(gallery.id);
    setTimeout(() => setCopiedId(''), 2000);
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Client Galleries</h1>
          <p className="mt-1 text-sm text-gray-500">{galleries.length} galleries · Share photos with clients</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn btn-primary">
          <Plus className="h-4 w-4" /> New Gallery
        </button>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowCreate(false)}>
          <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="mb-4 text-lg font-bold text-gray-900">Create Gallery</h2>
            <p className="mb-4 text-sm text-gray-500">
              Create a shareable gallery for a paid invoice. Clients can download their photos.
            </p>

            {invoices.length === 0 ? (
              <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4 text-sm text-yellow-800">
                No paid invoices available. Galleries can only be created for fully paid invoices.
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <label className="label">Invoice *</label>
                  <select
                    className="input"
                    value={selectedInvoice}
                    onChange={(e) => setSelectedInvoice(e.target.value)}
                  >
                    <option value="">Select invoice...</option>
                    {invoices.map((inv: any) => (
                      <option key={inv.id} value={inv.id}>
                        {inv.invoiceNumber} - {inv.client?.name} ({inv.total})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="label">Gallery Title (optional)</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g. Mensah Wedding Photos"
                    value={galleryTitle}
                    onChange={(e) => setGalleryTitle(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={createGallery}
                    disabled={creating || !selectedInvoice}
                    className="btn btn-primary flex-1"
                  >
                    {creating ? 'Creating...' : 'Create Gallery'}
                  </button>
                  <button onClick={() => setShowCreate(false)} className="btn btn-outline">
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Galleries Grid */}
      {galleries.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">
          <ImageIcon className="mx-auto mb-3 h-12 w-12 text-gray-300" />
          <div className="text-sm font-medium text-gray-700">No galleries yet</div>
          <div className="mt-1 text-xs text-gray-500">Create a gallery from a paid invoice to share photos with clients</div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {galleries.map((gallery) => {
            const shareLink = `${window.location.origin}/gallery/${gallery.accessToken}`;
            return (
              <div key={gallery.id} className="rounded-xl border border-gray-200 bg-white p-5">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900 truncate">{gallery.title}</h3>
                      <span className={`badge ${gallery.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {gallery.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="mt-1 text-xs text-gray-500">
                      {gallery.client?.name} · {gallery._count?.photos || 0} photos
                    </div>
                    <div className="mt-2 flex items-center gap-1 text-xs text-gray-400 font-mono truncate">
                      <span>{shareLink}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => copyLink(gallery)}
                    className="ml-3 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50"
                    title="Copy link"
                  >
                    {copiedId === gallery.id ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
                <div className="mt-3 flex gap-2">
                  <Link href={`/admin/galleries/${gallery.id}`} className="btn btn-sm btn-primary flex-1 justify-center">
                    Manage Photos
                  </Link>
                  <a href={shareLink} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline">
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}