import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Link } from "wouter";
import { formatNumber } from "@/lib/utils";
import { InvoiceWithPayments } from "@shared/schema";

export default function IncomeTablePreview() {
  const { data: invoices = [], isLoading } = useQuery<InvoiceWithPayments[]>({
    queryKey: ["/api/invoices"],
  });

  if (isLoading) {
    return (
      <Card className="bg-white shadow-sm border border-gray-100">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-secondary">
            Income Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-100 rounded mb-2"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white shadow-sm border border-gray-100">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-secondary">
            Income Overview
          </CardTitle>
          <Link href="/income-table">
            <Button variant="link" className="text-primary hover:text-primary/80 text-sm font-medium p-0">
              View Details
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invoice #
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Received
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Balance
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="bg-white divide-y divide-gray-200">
              {invoices.slice(0, 5).map((invoice) => {
                const isFullyPaid = parseFloat(invoice.remainingBalance) === 0;
                const hasPartialPayment = parseFloat(invoice.totalPaid) > 0 && !isFullyPaid;
                
                return (
                  <TableRow key={invoice.id}>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium text-secondary">
                      {formatNumber(invoice.invoiceNumber)}
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                      ₽{invoice.amount}
                    </TableCell>
                    <TableCell className={`px-6 py-4 whitespace-nowrap text-sm font-mono ${
                      isFullyPaid ? 'text-success' : 'text-gray-900'
                    }`}>
                      ₽{invoice.totalPaid}
                    </TableCell>
                    <TableCell className={`px-6 py-4 whitespace-nowrap text-sm font-mono ${
                      isFullyPaid 
                        ? 'text-success' 
                        : hasPartialPayment 
                          ? 'text-warning' 
                          : 'text-warning'
                    }`}>
                      ₽{invoice.remainingBalance}
                    </TableCell>
                  </TableRow>
                );
              })}
              
              {invoices.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="px-6 py-4 text-center text-gray-600">
                    No invoices found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
