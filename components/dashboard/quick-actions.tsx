import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, FileSpreadsheet, CreditCard } from "lucide-react";
import NewInvoiceModal from "@/components/modals/new-invoice-modal";
import ExcelImportModal from "@/components/modals/excel-import-modal";
import PaymentModal from "@/components/modals/payment-modal";

export default function QuickActions() {
  const [showNewInvoiceModal, setShowNewInvoiceModal] = useState(false);
  const [showExcelImportModal, setShowExcelImportModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const actions = [
    {
      title: "Create Invoice",
      description: "Add new invoice manually",
      icon: Plus,
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
      onClick: () => setShowNewInvoiceModal(true),
    },
    {
      title: "Import Excel",
      description: "Bulk import invoices",
      icon: FileSpreadsheet,
      iconBg: "bg-success/10",
      iconColor: "text-success",
      onClick: () => setShowExcelImportModal(true),
    },
    {
      title: "Record Payment",
      description: "Add investor payment",
      icon: CreditCard,
      iconBg: "bg-warning/10",
      iconColor: "text-warning",
      onClick: () => setShowPaymentModal(true),
    },
  ];

  return (
    <>
      <Card className="bg-white shadow-sm border border-gray-100 mb-8">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-secondary">
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {actions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                className="flex items-center p-4 h-auto justify-start border border-gray-200 hover:bg-gray-50"
                onClick={action.onClick}
              >
                <div className={`${action.iconBg} p-3 rounded-lg mr-4`}>
                  <action.icon className={action.iconColor} size={20} />
                </div>
                <div className="text-left">
                  <p className="font-medium text-secondary">{action.title}</p>
                  <p className="text-sm text-gray-600">{action.description}</p>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <NewInvoiceModal 
        open={showNewInvoiceModal}
        onOpenChange={setShowNewInvoiceModal}
      />
      <ExcelImportModal 
        open={showExcelImportModal}
        onOpenChange={setShowExcelImportModal}
      />
      <PaymentModal 
        open={showPaymentModal}
        onOpenChange={setShowPaymentModal}
      />
    </>
  );
}
