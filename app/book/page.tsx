'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, Calendar, Clock, MapPin, User, Mail, Phone, MessageSquare, Sparkles, Lock } from 'lucide-react';

declare global {
  interface Window {
    PaystackPop: any;
  }
}

const SERVICE_PRICES: Record<string, number> = {
  Wedding: 5000,
  Portrait: 500,
  Event: 2000,
  Commercial: 3000,
};

const DEPOSIT_PERCENTAGE = 50;

export default function BookPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [paystackLoading, setPaystackLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [bookingResult, setBookingResult] = useState<any>(null);
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

  // Load Paystack script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const selectedPrice = formData.budget
    ? parseFloat(formData.budget)
    : SERVICE_PRICES[formData.service] || 1000;

  const depositAmount = (selectedPrice * DEPOSIT_PERCENTAGE) / 100;
  const balanceAmount = selectedPrice - depositAmount;

  const handlePaystackPayment = () => {
    if (!window.PaystackPop) {
      alert('Payment system loading, please try again in a moment.');
      return;
    }

    if (!formData.name || !formData.email || !formData.eventDate) {
      alert('Please fill in your name, email, and event date.');
      return;
    }

    setPaystackLoading(true);

    const reference = `STD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const handler = window.PaystackPop.setup({
      key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || 'pk_test_xxx',
      email: formData.email,
      amount: depositAmount * 100, // Paystack uses pesewas/kobo
      currency: 'GHS',
      ref: reference,
      metadata: {
        custom_fields: [
          { display_name: 'Service', variable_name: 'service', value: formData.service },
          { display_name: 'Event Date', variable_name: 'event_date', value: formData.eventDate },
          { display_name: 'Deposit', variable_name: 'deposit', value: `${DEPOSIT_PERCENTAGE}%` },
        ],
      },
      callback: async (response: any) => {
        try {
          setLoading(true);
          const res = await fetch('/api/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              reference: response.reference,
              bookingData: formData,
            }),
          });

          const data = await res.json();

          if (res.ok) {
            setBookingResult(data.booking);
            setSuccess(true);
          } else {
            alert(data.error || 'Payment verification failed');
          }
        } catch (error) {
          console.error(error);
          alert('Something went wrong. Your payment was received — contact us to confirm.');
        } finally {
          setLoading(false);
          setPaystackLoading(false);
        }
      },
      onClose: () => {
        setPaystackLoading(false);
      },
    });

    handler.openIframe();
  };

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <div className="max-w-md rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-600">
            <svg className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="mb-2 text-xl font-bold text-gray-900">Booking Confirmed! 🎉</h2>
          <p className="mb-6 text-sm text-gray-500">
            Your {DEPOSIT_PERCENTAGE}% deposit has been received. We'll contact you within 24 hours.
          </p>

          {bookingResult && (
            <div className="mb-6 rounded-lg bg-blue-50 p-4 text-left text-sm">
              <div className="mb-2 font-semibold text-primary">Booking Details</div>
              <div className="space-y-1 text-gray-700">
                <div>Invoice: <span className="font-medium">{bookingResult.invoiceNumber}</span></div>
                <div>Deposit Paid: <span className="font-medium">GHS {bookingResult.amountPaid.toFixed(2)}</span></div>
                <div>Balance Due: <span className="font-medium text-orange-600">GHS {bookingResult.balance.toFixed(2)}</span></div>
              </div>
            </div>
          )}

          <div className="flex gap-2 justify-center">
            <a href="/" className="btn btn-outline">Back to Home</a>
            <button
              onClick={() => {
                setSuccess(false);
                setBookingResult(null);
                setFormData({
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
              }}
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
          <p className="mt-2 text-gray-500">
            Fill in the details below and pay a <span className="font-semibold text-primary">{DEPOSIT_PERCENTAGE}% deposit</span> to confirm your booking.
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handlePaystackPayment();
          }}
          className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm"
        >
          {/* Personal Info */}
          <div className="mb-8">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-900">
              Personal Information
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="label">
                  <User className="mr-1 inline h-3.5 w-3.5" /> Full Name
                </label>
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
                <label className="label">
                  <Mail className="mr-1 inline h-3.5 w-3.5" /> Email
                </label>
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
                <label className="label">
                  <Phone className="mr-1 inline h-3.5 w-3.5" /> Phone
                </label>
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
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-900">
              Booking Details
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="label">
                  <Camera className="mr-1 inline h-3.5 w-3.5" /> Service
                </label>
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
                <label className="label">
                  <Calendar className="mr-1 inline h-3.5 w-3.5" /> Event Date
                </label>
                <input
                  type="date"
                  required
                  className="input"
                  value={formData.eventDate}
                  onChange={(e) => updateField('eventDate', e.target.value)}
                />
              </div>
              <div>
                <label className="label">
                  <Clock className="mr-1 inline h-3.5 w-3.5" /> Duration (hours)
                </label>
                <select
                  className="input"
                  value={formData.duration}
                  onChange={(e) => updateField('duration', e.target.value)}
                >
                  {[1, 2, 3, 4, 6, 8, 10, 12].map((h) => (
                    <option key={h} value={h}>
                      {h} {h === 1 ? 'hour' : 'hours'}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">
                  <MapPin className="mr-1 inline h-3.5 w-3.5" /> Location
                </label>
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
                  placeholder="Leave blank to use default pricing"
                  value={formData.budget}
                  onChange={(e) => updateField('budget', e.target.value)}
                />
              </div>
              <div className="md:col-span-2">
                <label className="label">
                  <MessageSquare className="mr-1 inline h-3.5 w-3.5" /> Additional Notes
                </label>
                <textarea
                  className="input min-h-[100px] resize-y"
                  placeholder="Tell us about your vision, special requests, or anything we should know..."
                  value={formData.notes}
                  onChange={(e) => updateField('notes', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="mb-6 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 p-6">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-primary flex items-center gap-2">
              <Lock className="h-4 w-4" /> Payment Summary
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-700">
                <span>Total Package Price</span>
                <span className="font-semibold">GHS {selectedPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Deposit ({DEPOSIT_PERCENTAGE}%)</span>
                <span className="font-bold text-primary text-base">GHS {depositAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-500 pt-2 border-t border-blue-200">
                <span>Balance Due (on event day)</span>
                <span>GHS {balanceAmount.toFixed(2)}</span>
              </div>
            </div>
            <p className="mt-3 text-xs text-gray-500">
              🔒 Secure payment powered by Paystack. Card, Mobile Money, and Bank Transfer accepted.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || paystackLoading}
            className="btn btn-primary btn-lg w-full justify-center"
          >
            {paystackLoading ? (
              'Processing Payment...'
            ) : loading ? (
              'Confirming Booking...'
            ) : (
              <>
                <Lock className="h-4 w-4" />
                Pay GHS {depositAmount.toFixed(2)} Deposit & Book Now
              </>
            )}
          </button>

          <p className="mt-4 text-center text-xs text-gray-500">
            By booking, you agree to our terms. Deposit is non-refundable within 48 hours of event.
          </p>
        </form>
      </main>
    </div>
  );
}
