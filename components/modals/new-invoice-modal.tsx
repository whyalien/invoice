import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { InsertInvoice } from "@shared/schema";

interface NewInvoiceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function NewInvoiceModal({ open, onOpenChange }: NewInvoiceModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<InsertInvoice>({
    invoiceNumber: "",
    projectName: "",
    agreementNumber: "",
    investorName: "",
    amount: "",
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: "",
    description: "",
  });

  const createInvoiceMutation = useMutation({
    mutationFn: async (data: InsertInvoice) => {
      const response = await apiRequest("POST", "/api/invoices", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/summary"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/recent-transactions"] });
      
      toast({
        title: "Success",
        description: "Invoice created successfully",
      });
      
      onOpenChange(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create invoice",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      invoiceNumber: "",
      projectName: "",
      agreementNumber: "",
      investorName: "",
      amount: "",
      invoiceDate: new Date().toISOString().split('T')[0],
      dueDate: "",
      description: "",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createInvoiceMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-secondary">
            Create New Invoice
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="invoiceNumber" className="text-sm font-medium text-gray-700">
                Invoice Number
              </Label>
              <Input
                id="invoiceNumber"
                value={formData.invoiceNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, invoiceNumber: e.target.value }))}
                placeholder="INV-2024-001"
                required
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="projectName" className="text-sm font-medium text-gray-700">
                Project Name
              </Label>
              <select
                id="projectName"
                value={formData.projectName}
                onChange={(e) => setFormData(prev => ({ ...prev, projectName: e.target.value }))}
                required
                className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Select Project</option>
                <option value="AGHK_KPP">AGHK KPP</option>
                <option value="VIKSA">VIKSA</option>
                <option value="UST_LUGA">UST LUGA</option>
                <option value="AMUR_SNGI">AMUR SNGI</option>
                <option value="AMUR_RHI">AMUR RHI</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="agreementNumber" className="text-sm font-medium text-gray-700">
                Agreement Number
              </Label>
              <Input
                id="agreementNumber"
                value={formData.agreementNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, agreementNumber: e.target.value }))}
                placeholder="AGR-2024-001"
                required
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="invoiceDate" className="text-sm font-medium text-gray-700">
                Invoice Date
              </Label>
              <Input
                id="invoiceDate"
                type="date"
                value={formData.invoiceDate}
                onChange={(e) => setFormData(prev => ({ ...prev, invoiceDate: e.target.value }))}
                required
                className="mt-2"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="investorName" className="text-sm font-medium text-gray-700">
              Investor Name
            </Label>
            <Input
              id="investorName"
              value={formData.investorName}
              onChange={(e) => setFormData(prev => ({ ...prev, investorName: e.target.value }))}
              placeholder="Enter investor name"
              required
              className="mt-2"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="amount" className="text-sm font-medium text-gray-700">
                Amount
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
              <Label htmlFor="dueDate" className="text-sm font-medium text-gray-700">
                Due Date
              </Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                required
                className="mt-2"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description" className="text-sm font-medium text-gray-700">
              Description
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Invoice description or notes"
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
              disabled={createInvoiceMutation.isPending}
              className="bg-primary text-white hover:bg-primary/90"
            >
              {createInvoiceMutation.isPending ? "Creating..." : "Create Invoice"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
