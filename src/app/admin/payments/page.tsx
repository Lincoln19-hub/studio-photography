import { CreditCard } from "lucide-react";

export default function PaymentsPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
      <CreditCard className="mb-4 h-12 w-12 text-slate-300" />
      <h1 className="text-xl font-semibold text-slate-700">Payments</h1>
      <p className="mt-2 text-sm text-slate-400">Coming soon</p>
    </div>
  );
}
