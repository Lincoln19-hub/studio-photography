import { PackagesPageClient } from "@/components/admin/packages/PackagesPageClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Packages | Admin Dashboard",
};

export default function PackagesPage() {
  return <PackagesPageClient />;
}
