import { SessionsPageClient } from "@/components/admin/sessions/SessionsPageClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Sessions | Admin Dashboard",
};

export default function SessionsPage() {
  return <SessionsPageClient />;
}
