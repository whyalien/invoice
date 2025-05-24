import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, FileSpreadsheet, Trash2, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatNumber } from "@/lib/utils";
import { InvoiceWithPayments } from "@shared/schema";
import NewInvoiceModal from "@/components/modals/new-invoice-modal";
import ExcelImportModal from "@/components/modals/excel-import-modal";

export default function Invoices() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [showNewInvoiceModal, setShowNewInvoiceModal] = useState(false);
  const [showExcelImportModal, setShowExcelImportModal] = useState(false);

  const { data: invoices = [], isLoading } = useQuery<InvoiceWithPayments[]>({
    queryKey: ["/api/invoices"],
  });

  const deleteInvoiceMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/invoices/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/summary"] });
      toast({
        title: "Success",
        description: "Invoice deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete invoice",
        variant: "destructive",
      });
    },
  });

  const filteredInvoices = invoices.filter(invoice =>
    invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.investorName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (invoice: InvoiceWithPayments) => {
    const remaining = parseFloat(invoice.remainingBalance);
    const total = parseFloat(invoice.amount);
    const paid = parseFloat(invoice.totalPaid);

    if (remaining === 0) {
      return <Badge className="bg-success text-white">Paid</Badge>;
    } else if (paid > 0) {
      return <Badge className="bg-warning text-white">Partial</Badge>;
    } else {
      return <Badge variant="outline">Pending</Badge>;
    }
  };

  if (isLoading) {
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
    <>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-semibold text-secondary">Invoices</h1>
          <div className="flex gap-2">
            <Button 
              onClick={() => setShowExcelImportModal(true)}
              variant="outline"
              className="border-success text-success hover:bg-success hover:text-white"
            >
              <FileSpreadsheet className="mr-2" size={16} />
              Import Excel
            </Button>
            <Button 
              onClick={() => setShowNewInvoiceModal(true)}
              className="bg-primary text-white hover:bg-primary/90"
            >
              <Plus className="mr-2" size={16} />
              New Invoice
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <CardTitle>All Invoices</CardTitle>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <Input
                  placeholder="Search invoices..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Agreement #</TableHead>
                    <TableHead>Investor</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Balance</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">
                        {formatNumber(invoice.invoiceNumber)}
                      </TableCell>
                      <TableCell className="font-medium">
                        {invoice.projectName?.replace(/_/g, ' ') || 'N/A'}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {invoice.agreementNumber || 'N/A'}
                      </TableCell>
                      <TableCell>{invoice.investorName}</TableCell>
                      <TableCell className="font-mono">₽{invoice.amount}</TableCell>
                      <TableCell>{new Date(invoice.invoiceDate).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(invoice.dueDate).toLocaleDateString()}</TableCell>
                      <TableCell>{getStatusBadge(invoice)}</TableCell>
                      <TableCell className="font-mono">₽{invoice.remainingBalance}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              // View invoice details
                              toast({
                                title: "Invoice Details",
                                description: `${invoice.invoiceNumber} - ${invoice.description || 'No description'}`,
                              });
                            }}
                          >
                            <Eye size={16} />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => deleteInvoiceMutation.mutate(invoice.id)}
                            disabled={deleteInvoiceMutation.isPending}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  
                  {filteredInvoices.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-gray-600">
                        {searchTerm ? "No invoices found matching your search" : "No invoices found"}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <NewInvoiceModal 
        open={showNewInvoiceModal}
        onOpenChange={setShowNewInvoiceModal}
      />
      <ExcelImportModal 
        open={showExcelImportModal}
        onOpenChange={setShowExcelImportModal}
      />
    </>
  );
}
