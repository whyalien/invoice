import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, DollarSign, CheckCircle, AlertTriangle } from "lucide-react";
import { DashboardSummary } from "@shared/schema";

export default function SummaryCards() {
  const { data: summary, isLoading } = useQuery<DashboardSummary>({
    queryKey: ["/api/dashboard/summary"],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-20 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: "Total Invoices",
      value: summary?.totalInvoices || 0,
      icon: FileText,
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
      change: "+12%",
      changeText: "from last month",
      changeColor: "text-success",
    },
    {
      title: "Total Amount",
      value: `₽${summary?.totalAmount || "0.00"}`,
      icon: DollarSign,
      iconBg: "bg-success/10",
      iconColor: "text-success",
      change: "+8.2%",
      changeText: "from last month",
      changeColor: "text-success",
    },
    {
      title: "Received",
      value: `₽${summary?.receivedAmount || "0.00"}`,
      icon: CheckCircle,
      iconBg: "bg-success/10",
      iconColor: "text-success",
      change: "78.7%",
      changeText: "collection rate",
      changeColor: "text-success",
    },
    {
      title: "Outstanding",
      value: `₽${summary?.outstandingAmount || "0.00"}`,
      icon: AlertTriangle,
      iconBg: "bg-warning/10",
      iconColor: "text-warning",
      change: "21.3%",
      changeText: "pending collection",
      changeColor: "text-warning",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, index) => (
        <Card key={index} className="bg-white shadow-sm border border-gray-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">{card.title}</p>
                <p className="text-2xl font-bold text-secondary mt-1">{card.value}</p>
              </div>
              <div className={`${card.iconBg} p-3 rounded-lg`}>
                <card.icon className={`${card.iconColor} text-xl`} size={24} />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className={`${card.changeColor} font-medium`}>{card.change}</span>
              <span className="text-gray-600 ml-1">{card.changeText}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
