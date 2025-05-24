import SummaryCards from "@/components/dashboard/summary-cards";
import QuickActions from "@/components/dashboard/quick-actions";
import RecentTransactions from "@/components/dashboard/recent-transactions";
import IncomeTablePreview from "@/components/dashboard/income-table-preview";

export default function Dashboard() {
  return (
    <div>
      <SummaryCards />
      <QuickActions />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentTransactions />
        <IncomeTablePreview />
      </div>
    </div>
  );
}
