import { BookingPageClient } from "@/components/booking/BookingPageClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Book a Session | Studio Photography",
  description: "Choose your photography session and package to book your shoot.",
};

export default function BookingPage() {
  return <BookingPageClient />;
}
