import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { InvoiceWithPayments, DashboardSummary } from "@shared/schema";

export default function Reports() {
  const { data: invoices = [], isLoading: invoicesLoading } = useQuery<InvoiceWithPayments[]>({
    queryKey: ["/api/invoices"],
  });

  const { data: summary } = useQuery<DashboardSummary>({
    queryKey: ["/api/dashboard/summary"],
  });

  // Prepare chart data
  const statusData = [
    { 
      name: "Fully Paid", 
      value: invoices.filter(inv => parseFloat(inv.remainingBalance) === 0).length,
      color: "#388E3C"
    },
    { 
      name: "Partial Payment", 
      value: invoices.filter(inv => parseFloat(inv.totalPaid) > 0 && parseFloat(inv.remainingBalance) > 0).length,
      color: "#F57C00"
    },
    { 
      name: "Pending", 
      value: invoices.filter(inv => parseFloat(inv.totalPaid) === 0).length,
      color: "#D32F2F"
    },
  ];

  // Monthly data (simplified for demo)
  const monthlyData = [
    { month: "Jan", invoices: 12, amount: 45000 },
    { month: "Feb", invoices: 15, amount: 52000 },
    { month: "Mar", invoices: 18, amount: 61000 },
    { month: "Apr", invoices: 22, amount: 73000 },
    { month: "May", invoices: 25, amount: 82000 },
    { month: "Jun", invoices: 28, amount: 95000 },
  ];

  // Top investors by amount
  const investorData = invoices.reduce((acc, invoice) => {
    const existing = acc.find(item => item.name === invoice.investorName);
    if (existing) {
      existing.amount += parseFloat(invoice.amount);
      existing.invoices += 1;
    } else {
      acc.push({
        name: invoice.investorName,
        amount: parseFloat(invoice.amount),
        invoices: 1,
      });
    }
    return acc;
  }, [] as Array<{ name: string; amount: number; invoices: number }>)
  .sort((a, b) => b.amount - a.amount)
  .slice(0, 5);

  if (invoicesLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-secondary">Reports & Analytics</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600">Collection Rate</div>
            <div className="text-2xl font-bold text-success">
              {summary ? 
                Math.round((parseFloat(summary.receivedAmount) / parseFloat(summary.totalAmount)) * 100) 
                : 0}%
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600">Average Invoice</div>
            <div className="text-2xl font-bold text-secondary">
              ${summary && summary.totalInvoices > 0 ? 
                Math.round(parseFloat(summary.totalAmount) / summary.totalInvoices).toLocaleString()
                : "0"}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600">Active Investors</div>
            <div className="text-2xl font-bold text-secondary">
              {new Set(invoices.map(inv => inv.investorName)).size}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600">Overdue Invoices</div>
            <div className="text-2xl font-bold text-error">
              {invoices.filter(inv => {
                const isOverdue = new Date(inv.dueDate) < new Date();
                const hasBalance = parseFloat(inv.remainingBalance) > 0;
                return isOverdue && hasBalance;
              }).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Invoice Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Invoice Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Monthly Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Invoice Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value, name) => [
                  name === 'amount' ? `$${value.toLocaleString()}` : value,
                  name === 'amount' ? 'Amount' : 'Invoices'
                ]} />
                <Line type="monotone" dataKey="invoices" stroke="#1976D2" strokeWidth={2} />
                <Line type="monotone" dataKey="amount" stroke="#388E3C" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Investors */}
        <Card>
          <CardHeader>
            <CardTitle>Top Investors by Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={investorData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={80} />
                <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Amount']} />
                <Bar dataKey="amount" fill="#1976D2" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Invoice Count by Investor */}
        <Card>
          <CardHeader>
            <CardTitle>Invoice Count by Investor</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={investorData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="invoices" fill="#388E3C" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
