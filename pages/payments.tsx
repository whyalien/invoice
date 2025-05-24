import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Payment, InvoiceWithPayments } from "@shared/schema";
import PaymentModal from "@/components/modals/payment-modal";

export default function Payments() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const { data: payments = [], isLoading: paymentsLoading } = useQuery<Payment[]>({
    queryKey: ["/api/payments"],
  });

  const { data: invoices = [] } = useQuery<InvoiceWithPayments[]>({
    queryKey: ["/api/invoices"],
  });

  const deletePaymentMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/payments/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/summary"] });
      toast({
        title: "Success",
        description: "Payment deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete payment",
        variant: "destructive",
      });
    },
  });

  // Enhanced payments with invoice information
  const enhancedPayments = payments.map(payment => {
    const invoice = invoices.find(inv => inv.id === payment.invoiceId);
    return {
      ...payment,
      invoiceNumber: invoice?.invoiceNumber || `Invoice #${payment.invoiceId}`,
      investorName: invoice?.investorName || 'Unknown',
    };
  });

  const filteredPayments = enhancedPayments.filter(payment =>
    payment.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.investorName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPaymentMethodBadge = (method: string) => {
    const badgeMap: Record<string, { label: string; className: string }> = {
      bank_transfer: { label: "Bank Transfer", className: "bg-blue-100 text-blue-800" },
      check: { label: "Check", className: "bg-green-100 text-green-800" },
      wire: { label: "Wire Transfer", className: "bg-purple-100 text-purple-800" },
      ach: { label: "ACH", className: "bg-orange-100 text-orange-800" },
    };

    const config = badgeMap[method] || { label: method, className: "bg-gray-100 text-gray-800" };
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  if (paymentsLoading) {
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
          <h1 className="text-2xl font-semibold text-secondary">Payments</h1>
          <Button 
            onClick={() => setShowPaymentModal(true)}
            className="bg-success text-white hover:bg-success/90"
          >
            <Plus className="mr-2" size={16} />
            Record Payment
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <CardTitle>All Payments</CardTitle>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <Input
                  placeholder="Search payments..."
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
                    <TableHead>Payment ID</TableHead>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Investor</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">#{payment.id}</TableCell>
                      <TableCell>{payment.invoiceNumber}</TableCell>
                      <TableCell>{payment.investorName}</TableCell>
                      <TableCell className="font-mono text-success">+₽{payment.amount}</TableCell>
                      <TableCell>{new Date(payment.paymentDate).toLocaleDateString()}</TableCell>
                      <TableCell>{getPaymentMethodBadge(payment.paymentMethod)}</TableCell>
                      <TableCell className="max-w-32 truncate">
                        {payment.notes || '-'}
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => deletePaymentMutation.mutate(payment.id)}
                          disabled={deletePaymentMutation.isPending}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  
                  {filteredPayments.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-gray-600">
                        {searchTerm ? "No payments found matching your search" : "No payments found"}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <PaymentModal 
        open={showPaymentModal}
        onOpenChange={setShowPaymentModal}
      />
    </>
  );
}
