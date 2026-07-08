'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, Calendar, Clock, MapPin, User, Mail, Phone, MessageSquare, Sparkles } from 'lucide-react';

export default function BookPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: 'Portrait',
    eventDate: '',
    duration: '2',
    location: '',
    budget: '',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setSuccess(true);
      } else {
        throw new Error('Failed to create booking');
      }
    } catch (error) {
      console.error('Booking error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-6">
        <div className="max-w-md rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-600">
            <svg className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
          </div>
          <h2 className="mb-2 text-xl font-bold text-gray-900">Booking Request Sent!</h2>
          <p className="mb-6 text-sm text-gray-500">
            Thank you for your booking request. We'll review it and get back to you within 24 hours.
          </p>
          <div className="flex gap-2 justify-center">
            <a href="/" className="btn btn-outline">Back to Home</a>
            <button
              onClick={() => { setSuccess(false); setFormData({ name: '', email: '', phone: '', service: 'Portrait', eventDate: '', duration: '2', location: '', budget: '', notes: '' }); }}
              className="btn btn-primary"
            >
              New Booking
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <a href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-primary">
              <Camera className="h-4 w-4" />
            </div>
            <span className="text-lg font-semibold">Studio</span>
          </a>
          <a href="/" className="text-sm text-gray-500 hover:text-gray-900">← Back to site</a>
        </div>
      </header>

      {/* Form */}
      <main className="mx-auto max-w-3xl px-6 py-12">
        <div className="mb-8 text-center">
          <div className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-primary">
            <Sparkles className="h-4 w-4" />
            Book a Session
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Tell Us About Your Shoot</h1>
          <p className="mt-2 text-gray-500">Fill in the details below and we'll confirm your booking within 24 hours.</p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          {/* Personal Info */}
          <div className="mb-8">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-900">Personal Information</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="label"><User className="mr-1 inline h-3.5 w-3.5" /> Full Name</label>
                <input
                  type="text"
                  required
                  className="input"
                  placeholder="e.g. Sarah Mensah"
                  value={formData.name}
                  onChange={(e) => updateField('name', e.target.value)}
                />
              </div>
              <div>
                <label className="label"><Mail className="mr-1 inline h-3.5 w-3.5" /> Email</label>
                <input
                  type="email"
                  required
                  className="input"
                  placeholder="sarah@email.com"
                  value={formData.email}
                  onChange={(e) => updateField('email', e.target.value)}
                />
              </div>
              <div>
                <label className="label"><Phone className="mr-1 inline h-3.5 w-3.5" /> Phone</label>
                <input
                  type="tel"
                  className="input"
                  placeholder="+233 24 000 0000"
                  value={formData.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Booking Details */}
          <div className="mb-8 border-t border-gray-100 pt-8">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-900">Booking Details</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="label"><Camera className="mr-1 inline h-3.5 w-3.5" /> Service</label>
                <select
                  className="input"
                  value={formData.service}
                  onChange={(e) => updateField('service', e.target.value)}
                >
                  <option value="Wedding">Wedding</option>
                  <option value="Portrait">Portrait</option>
                  <option value="Event">Event</option>
                  <option value="Commercial">Commercial</option>
                </select>
              </div>
              <div>
                <label className="label"><Calendar className="mr-1 inline h-3.5 w-3.5" /> Event Date</label>
                <input
                  type="date"
                  required
                  className="input"
                  value={formData.eventDate}
                  onChange={(e) => updateField('eventDate', e.target.value)}
                />
              </div>
              <div>
                <label className="label"><Clock className="mr-1 inline h-3.5 w-3.5" /> Duration (hours)</label>
                <select
                  className="input"
                  value={formData.duration}
                  onChange={(e) => updateField('duration', e.target.value)}
                >
                  {[1,2,3,4,6,8,10,12].map((h) => (
                    <option key={h} value={h}>{h} {h === 1 ? 'hour' : 'hours'}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label"><MapPin className="mr-1 inline h-3.5 w-3.5" /> Location</label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g. La Palm Beach Hotel"
                  value={formData.location}
                  onChange={(e) => updateField('location', e.target.value)}
                />
              </div>
              <div className="md:col-span-2">
                <label className="label">Budget (GHS, optional)</label>
                <input
                  type="number"
                  className="input"
                  placeholder="e.g. 2000"
                  value={formData.budget}
                  onChange={(e) => updateField('budget', e.target.value)}
                />
              </div>
              <div className="md:col-span-2">
                <label className="label"><MessageSquare className="mr-1 inline h-3.5 w-3.5" /> Additional Notes</label>
                <textarea
                  className="input min-h-[100px] resize-y"
                  placeholder="Tell us about your vision, special requests, or anything we should know..."
                  value={formData.notes}
                  onChange={(e) => updateField('notes', e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-lg flex-1"
            >
              {loading ? 'Submitting...' : 'Submit Booking Request'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
