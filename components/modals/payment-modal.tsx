import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { InsertPayment, InvoiceWithPayments } from "@shared/schema";

interface PaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function PaymentModal({ open, onOpenChange }: PaymentModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<InsertPayment & { invoiceNumber: string }>({
    invoiceId: 0,
    invoiceNumber: "",
    amount: "",
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: "bank_transfer",
    notes: "",
  });

  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceWithPayments | null>(null);

  // Fetch invoices for dropdown
  const { data: invoices = [] } = useQuery<InvoiceWithPayments[]>({
    queryKey: ["/api/invoices"],
  });

  const createPaymentMutation = useMutation({
    mutationFn: async (data: InsertPayment) => {
      const response = await apiRequest("POST", "/api/payments", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      queryClient.invalidateQueries({ queryKey: ["/api/payments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/summary"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/recent-transactions"] });
      
      toast({
        title: "Success",
        description: "Payment recorded successfully",
      });
      
      onOpenChange(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to record payment",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      invoiceId: 0,
      invoiceNumber: "",
      amount: "",
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMethod: "bank_transfer",
      notes: "",
    });
    setSelectedInvoice(null);
  };

  const handleInvoiceSelect = (invoiceNumber: string) => {
    const invoice = invoices.find(inv => inv.invoiceNumber === invoiceNumber);
    if (invoice) {
      setSelectedInvoice(invoice);
      setFormData(prev => ({
        ...prev,
        invoiceId: invoice.id,
        invoiceNumber: invoiceNumber,
        amount: invoice.remainingBalance === "0.00" ? "" : invoice.remainingBalance,
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedInvoice) {
      toast({
        title: "Error",
        description: "Please select an invoice",
        variant: "destructive",
      });
      return;
    }

    const paymentAmount = parseFloat(formData.amount);
    const remainingBalance = parseFloat(selectedInvoice.remainingBalance);

    if (paymentAmount > remainingBalance) {
      toast({
        title: "Error",
        description: "Payment amount cannot exceed remaining balance",
        variant: "destructive",
      });
      return;
    }

    const { invoiceNumber, ...paymentData } = formData;
    createPaymentMutation.mutate(paymentData);
  };

  // Filter invoices to show only those with remaining balance
  const availableInvoices = invoices.filter(invoice => 
    parseFloat(invoice.remainingBalance) > 0
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-secondary">
            Record Payment
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="invoiceNumber" className="text-sm font-medium text-gray-700">
                Invoice Number
              </Label>
              <Select value={formData.invoiceNumber} onValueChange={handleInvoiceSelect}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select invoice..." />
                </SelectTrigger>
                <SelectContent>
                  {availableInvoices.map(invoice => (
                    <SelectItem key={invoice.id} value={invoice.invoiceNumber}>
                      {invoice.invoiceNumber} - ₽{invoice.amount}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="paymentDate" className="text-sm font-medium text-gray-700">
                Payment Date
              </Label>
              <Input
                id="paymentDate"
                type="date"
                value={formData.paymentDate}
                onChange={(e) => setFormData(prev => ({ ...prev, paymentDate: e.target.value }))}
                required
                className="mt-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="amount" className="text-sm font-medium text-gray-700">
                Amount Received
              </Label>
              <div className="relative mt-2">
                <span className="absolute left-3 top-2 text-gray-500">₽</span>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="0.00"
                  required
                  className="pl-8"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="paymentMethod" className="text-sm font-medium text-gray-700">
                Payment Method
              </Label>
              <Select 
                value={formData.paymentMethod} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, paymentMethod: value }))}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="check">Check</SelectItem>
                  <SelectItem value="wire">Wire Transfer</SelectItem>
                  <SelectItem value="ach">ACH</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Payment Summary */}
          {selectedInvoice && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h5 className="font-medium text-secondary mb-3">Payment Summary</h5>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Invoice Amount</p>
                  <p className="font-semibold">₽{selectedInvoice.amount}</p>
                </div>
                <div>
                  <p className="text-gray-600">Previously Paid</p>
                  <p className="font-semibold">₽{selectedInvoice.totalPaid}</p>
                </div>
                <div>
                  <p className="text-gray-600">Remaining Balance</p>
                  <p className="font-semibold text-warning">₽{selectedInvoice.remainingBalance}</p>
                </div>
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="notes" className="text-sm font-medium text-gray-700">
              Payment Notes
            </Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Optional payment notes"
              rows={3}
              className="mt-2"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createPaymentMutation.isPending}
              className="bg-success text-white hover:bg-success/90"
            >
              {createPaymentMutation.isPending ? "Recording..." : "Record Payment"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
