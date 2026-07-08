'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Image as ImageIcon, Plus, Copy, Check, ExternalLink, Trash2, GripVertical } from 'lucide-react';

export default function ManageGalleryPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [gallery, setGallery] = useState<any>(null);
  const [photos, setPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [newPhotoCaption, setNewPhotoCaption] = useState('');
  const [addingPhoto, setAddingPhoto] = useState(false);

  const shareLink = typeof window !== 'undefined' 
    ? `${window.location.origin}/gallery/${gallery?.accessToken}` 
    : '';

  useEffect(() => {
    fetch(`/api/galleries/${params.id}`)
      .then((r) => r.json())
      .then((data) => {
        setGallery(data);
        setPhotos(data.photos || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params.id]);

  const copyLink = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const addPhoto = async () => {
    if (!newPhotoUrl.trim()) return;
    setAddingPhoto(true);

    try {
      const res = await fetch(`/api/galleries/${params.id}/photos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: newPhotoUrl.trim(),
          caption: newPhotoCaption.trim() || null,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setPhotos([...photos, data.photo]);
        setNewPhotoUrl('');
        setNewPhotoCaption('');
      } else {
        alert('Failed to add photo');
      }
    } catch (error) {
      console.error(error);
      alert('Failed to add photo');
    } finally {
      setAddingPhoto(false);
    }
  };

  const deletePhoto = async (photoId: string) => {
    if (!confirm('Delete this photo?')) return;

    try {
      await fetch(`/api/galleries/${params.id}/photos/${photoId}`, {
        method: 'DELETE',
      });
      setPhotos(photos.filter((p) => p.id !== photoId));
    } catch (error) {
      alert('Failed to delete photo');
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!gallery) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
        <ImageIcon className="mx-auto mb-3 h-12 w-12 text-gray-300" />
        <div className="text-sm text-gray-500">Gallery not found</div>
        <Link href="/admin/galleries" className="mt-4 btn btn-outline">Back to Galleries</Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link href="/admin/galleries" className="text-sm text-gray-500 hover:text-gray-900">← Galleries</Link>
          <h1 className="mt-2 text-2xl font-bold text-gray-900">{gallery.title}</h1>
          <p className="mt-1 text-sm text-gray-500">
            {photos.length} photo{photos.length !== 1 ? 's' : ''} · Client: {gallery.client?.name}
          </p>
        </div>
        <Link href={shareLink} target="_blank" className="btn btn-outline">
          <ExternalLink className="h-4 w-4" /> Preview
        </Link>
      </div>

      {/* Share Link */}
      <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 p-5">
        <div className="text-sm font-semibold text-blue-900 mb-2">🔗 Shareable Link</div>
        <div className="flex gap-2">
          <input
            type="text"
            readOnly
            value={shareLink}
            className="input flex-1 font-mono text-xs bg-white"
          />
          <button onClick={copyLink} className="btn btn-primary whitespace-nowrap">
            {copied ? <><Check className="h-4 w-4" /> Copied!</> : <><Copy className="h-4 w-4" /> Copy Link</>}
          </button>
        </div>
        <p className="mt-2 text-xs text-blue-700">
          Clients can view and download their photos using this link. Works only when invoice is fully paid.
        </p>
      </div>

      {/* Add Photo */}
      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5">
        <h3 className="mb-3 text-sm font-semibold text-gray-900">Add Photo</h3>
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Photo URL (e.g. from Cloudinary, Imgur, Google Drive direct link)"
            className="input"
            value={newPhotoUrl}
            onChange={(e) => setNewPhotoUrl(e.target.value)}
          />
          <input
            type="text"
            placeholder="Caption (optional)"
            className="input"
            value={newPhotoCaption}
            onChange={(e) => setNewPhotoCaption(e.target.value)}
          />
          <button
            onClick={addPhoto}
            disabled={addingPhoto || !newPhotoUrl.trim()}
            className="btn btn-primary"
          >
            <Plus className="h-4 w-4" /> {addingPhoto ? 'Adding...' : 'Add Photo'}
          </button>
        </div>
      </div>

      {/* Photo Grid */}
      {photos.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">
          <ImageIcon className="mx-auto mb-3 h-12 w-12 text-gray-300" />
          <div className="text-sm font-medium text-gray-700">No photos yet</div>
          <div className="mt-1 text-xs text-gray-500">Add photos above to get started</div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {photos.map((photo, index) => (
            <div key={photo.id} className="group relative aspect-square overflow-hidden rounded-lg border border-gray-200 bg-gray-100">
              <img src={photo.url} alt={photo.caption || ''} className="h-full w-full object-cover" />
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  onClick={() => deletePhoto(photo.id)}
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600"
                  title="Delete"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                <div className="text-xs text-white truncate">{photo.caption || `Photo ${index + 1}`}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}