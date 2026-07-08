'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Download, Camera, Lock, Image as ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react';

export default function PublicGalleryPage() {
  const { token } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPhoto, setCurrentPhoto] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  useEffect(() => {
    fetch(`/api/gallery-access/${token}`)
      .then((r) => r.json())
      .then((result) => {
        setData(result);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load gallery');
        setLoading(false);
      });
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-sm text-gray-500">Loading gallery...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
            <Lock className="h-7 w-7 text-red-600" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Gallery Not Available</h1>
          <p className="mt-2 text-sm text-gray-500">{error || 'This gallery does not exist or has been removed.'}</p>
        </div>
      </div>
    );
  }

  const { gallery, client, paymentStatus } = data;
  const photos = gallery.photos || [];

  // Not paid - show payment reminder
  if (!paymentStatus.isPaid) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="border-b border-gray-200 bg-white">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-primary">
                <Camera className="h-4 w-4" />
              </div>
              <span className="text-lg font-semibold">Studio</span>
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-2xl px-6 py-16">
          <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-yellow-100">
              <Lock className="h-7 w-7 text-yellow-600" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">Gallery Locked</h1>
            <p className="mt-2 text-sm text-gray-700">
              Hi <strong>{client.name}</strong>, your photos are ready! However, your gallery will be unlocked once the remaining balance is paid.
            </p>

            <div className="mt-6 rounded-lg bg-white border border-yellow-200 p-4">
              <div className="text-sm text-gray-600">Invoice</div>
              <div className="text-lg font-bold text-gray-900">{paymentStatus.invoiceNumber}</div>
              <div className="mt-3 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total</span>
                  <span className="font-medium">GHS {paymentStatus.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Paid</span>
                  <span className="font-medium text-green-600">GHS {paymentStatus.paid.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-2">
                  <span className="font-medium">Balance Due</span>
                  <span className="font-bold text-red-600">GHS {paymentStatus.balance.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <p className="mt-6 text-sm text-gray-600">
              Please contact us to complete your payment and unlock your gallery.
            </p>
            <div className="mt-4 flex gap-2 justify-center">
              <a href="mailto:hello@studio.com" className="btn btn-primary">Contact Us</a>
              <a href="/" className="btn btn-outline">Home</a>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Paid - show gallery
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-primary">
              <Camera className="h-4 w-4" />
            </div>
            <span className="text-lg font-semibold">Studio Gallery</span>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium text-gray-900">{client.name}</div>
            <div className="text-xs text-green-600">✓ Paid in Full</div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{gallery.title}</h1>
          {gallery.description && <p className="mt-1 text-sm text-gray-500">{gallery.description}</p>}
          <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
            <span>{photos.length} photo{photos.length !== 1 ? 's' : ''}</span>
            <span>·</span>
            <span>Delivered {new Date(gallery.createdAt).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>

        {/* Photo Grid */}
        {photos.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
            <ImageIcon className="mx-auto mb-3 h-12 w-12 text-gray-300" />
            <div className="text-sm text-gray-500">No photos in this gallery yet.</div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {photos.map((photo: any, index: number) => (
              <div
                key={photo.id}
                className="group relative aspect-square cursor-pointer overflow-hidden rounded-lg bg-gray-200"
                onClick={() => { setCurrentPhoto(index); setLightbox(true); }}
              >
                <img
                  src={photo.url}
                  alt={photo.caption || ''}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/30" />
                <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between bg-gradient-to-t from-black/60 to-transparent p-3 opacity-0 transition-opacity group-hover:opacity-100">
                  <span className="text-xs text-white truncate">{photo.caption || `Photo ${index + 1}`}</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); window.open(photo.url, '_blank'); }}
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-gray-900 hover:bg-white"
                    title="Download"
                  >
                    <Download className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Download All */}
        {photos.length > 0 && (
          <div className="mt-8 rounded-xl border border-blue-200 bg-blue-50 p-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <div className="font-semibold text-gray-900">Download Your Photos</div>
                <div className="text-sm text-gray-600">{photos.length} photo{photos.length !== 1 ? 's' : ''} available for download</div>
              </div>
              <div className="flex gap-2">
                {photos.map((photo: any, i: number) => (
                  <a
                    key={photo.id}
                    href={photo.url}
                    download
                    className="btn btn-primary btn-sm"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Download className="h-3.5 w-3.5" /> Photo {i + 1}
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Lightbox */}
      {lightbox && photos.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4" onClick={() => setLightbox(false)}>
          <button
            className="absolute top-4 right-4 text-white/80 hover:text-white text-2xl"
            onClick={() => setLightbox(false)}
          >
            ✕
          </button>

          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
            onClick={(e) => { e.stopPropagation(); setCurrentPhoto((currentPhoto - 1 + photos.length) % photos.length); }}
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          <div className="max-h-[85vh] max-w-5xl" onClick={(e) => e.stopPropagation()}>
            <img
              src={photos[currentPhoto].url}
              alt={photos[currentPhoto].caption || ''}
              className="max-h-[80vh] max-w-full object-contain"
            />
            {photos[currentPhoto].caption && (
              <div className="mt-3 text-center text-sm text-white/80">{photos[currentPhoto].caption}</div>
            )}
            <div className="mt-3 flex justify-center gap-3">
              <a
                href={photos[currentPhoto].url}
                download
                className="btn btn-primary btn-sm"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Download className="h-3.5 w-3.5" /> Download
              </a>
            </div>
          </div>

          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
            onClick={(e) => { e.stopPropagation(); setCurrentPhoto((currentPhoto + 1) % photos.length); }}
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-sm text-white/60">
            {currentPhoto + 1} / {photos.length}
          </div>
        </div>
      )}
    </div>
  );
}