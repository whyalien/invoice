import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Download, Filter } from "lucide-react";
import { formatNumber } from "@/lib/utils";
import { InvoiceWithPayments, DashboardSummary } from "@shared/schema";

export default function IncomeTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "paid" | "partial" | "pending">("all");

  const { data: invoices = [], isLoading: invoicesLoading } = useQuery<InvoiceWithPayments[]>({
    queryKey: ["/api/invoices"],
  });

  const { data: summary } = useQuery<DashboardSummary>({
    queryKey: ["/api/dashboard/summary"],
  });

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = 
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.investorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (invoice.projectName && invoice.projectName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (invoice.agreementNumber && invoice.agreementNumber.toLowerCase().includes(searchTerm.toLowerCase()));

    const remaining = parseFloat(invoice.remainingBalance);
    const paid = parseFloat(invoice.totalPaid);

    let matchesStatus = true;
    if (statusFilter === "paid") {
      matchesStatus = remaining === 0;
    } else if (statusFilter === "partial") {
      matchesStatus = paid > 0 && remaining > 0;
    } else if (statusFilter === "pending") {
      matchesStatus = paid === 0;
    }

    return matchesSearch && matchesStatus;
  });

  // Group invoices by project name
  const groupedInvoices = filteredInvoices.reduce((groups, invoice) => {
    const projectName = invoice.projectName || "No Project";
    if (!groups[projectName]) {
      groups[projectName] = [];
    }
    groups[projectName].push(invoice);
    return groups;
  }, {} as Record<string, InvoiceWithPayments[]>);

  const getStatusBadge = (invoice: InvoiceWithPayments) => {
    const remaining = parseFloat(invoice.remainingBalance);
    const paid = parseFloat(invoice.totalPaid);

    if (remaining === 0) {
      return <Badge className="bg-success text-white">Fully Paid</Badge>;
    } else if (paid > 0) {
      return <Badge className="bg-warning text-white">Partial Payment</Badge>;
    } else {
      return <Badge variant="outline">Pending</Badge>;
    }
  };

  const exportToCSV = () => {
    const headers = ['Invoice Number', 'Investor', 'Invoice Amount', 'Total Paid', 'Remaining Balance', 'Status', 'Invoice Date', 'Due Date'];
    const csvData = filteredInvoices.map(invoice => [
      invoice.invoiceNumber,
      invoice.investorName,
      invoice.amount,
      invoice.totalPaid,
      invoice.remainingBalance,
      parseFloat(invoice.remainingBalance) === 0 ? 'Fully Paid' : parseFloat(invoice.totalPaid) > 0 ? 'Partial Payment' : 'Pending',
      invoice.invoiceDate,
      invoice.dueDate
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `income-table-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (invoicesLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="h-64 bg-gray-100 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600">Total Invoices</div>
            <div className="text-2xl font-bold text-secondary">{summary?.totalInvoices || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600">Total Amount</div>
            <div className="text-2xl font-bold text-secondary">₽{summary?.totalAmount || "0.00"}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600">Amount Received</div>
            <div className="text-2xl font-bold text-success">₽{summary?.receivedAmount || "0.00"}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600">Outstanding</div>
            <div className="text-2xl font-bold text-warning">₽{summary?.outstandingAmount || "0.00"}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-semibold text-secondary">Income Table</h1>
        <Button 
          onClick={exportToCSV}
          variant="outline"
          className="border-primary text-primary hover:bg-primary hover:text-white"
        >
          <Download className="mr-2" size={16} />
          Export CSV
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <CardTitle>All Invoices & Payments</CardTitle>
            <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <Input
                  placeholder="Search invoices..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="paid">Fully Paid</option>
                <option value="partial">Partial Payment</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Agreement #</TableHead>
                  <TableHead>Investor</TableHead>
                  <TableHead>Invoice Amount</TableHead>
                  <TableHead>Total Paid</TableHead>
                  <TableHead>Remaining Balance</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Invoice Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Days Outstanding</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(groupedInvoices).map(([projectName, projectInvoices]) => (
                  <React.Fragment key={`project-${projectName}`}>
                    <TableRow className="bg-gray-50 hover:bg-gray-50">
                      <TableCell colSpan={10} className="font-bold text-primary py-3">
                        📁 {projectName.replace(/_/g, ' ')} ({projectInvoices.length} invoices)
                      </TableCell>
                    </TableRow>
                    {projectInvoices.map((invoice) => {
                      const daysOutstanding = Math.floor(
                        (new Date().getTime() - new Date(invoice.dueDate).getTime()) / (1000 * 60 * 60 * 24)
                      );
                      const isOverdue = daysOutstanding > 0 && parseFloat(invoice.remainingBalance) > 0;

                      return (
                        <TableRow key={invoice.id} className={isOverdue ? "bg-red-50" : ""}>
                          <TableCell className="font-medium pl-8">
                            {formatNumber(invoice.invoiceNumber)}
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">
                            {invoice.agreementNumber || 'N/A'}
                          </TableCell>
                          <TableCell>{invoice.investorName}</TableCell>
                          <TableCell className="font-mono">₽{invoice.amount}</TableCell>
                          <TableCell className="font-mono text-success">₽{invoice.totalPaid}</TableCell>
                          <TableCell className={`font-mono ${
                            parseFloat(invoice.remainingBalance) === 0 
                              ? 'text-success' 
                              : 'text-warning'
                          }`}>
                            ₽{invoice.remainingBalance}
                          </TableCell>
                          <TableCell>{getStatusBadge(invoice)}</TableCell>
                          <TableCell>{new Date(invoice.invoiceDate).toLocaleDateString()}</TableCell>
                          <TableCell className={isOverdue ? "text-red-600 font-medium" : ""}>
                            {new Date(invoice.dueDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell className={isOverdue ? "text-red-600 font-medium" : ""}>
                            {daysOutstanding > 0 ? `${daysOutstanding} days` : "-"}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </React.Fragment>
                ))}
                
                {Object.keys(groupedInvoices).length === 0 && (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-gray-600">
                      {searchTerm || statusFilter !== "all" 
                        ? "No invoices found matching your criteria" 
                        : "No invoices found"}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
