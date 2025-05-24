import { Button } from "@/components/ui/button";
import { Menu, Plus, User } from "lucide-react";
import { useState } from "react";
import NewInvoiceModal from "@/components/modals/new-invoice-modal";

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const [showNewInvoiceModal, setShowNewInvoiceModal] = useState(false);

  return (
    <>
      <header className="bg-white shadow-sm border-b border-gray-200 p-4 lg:p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button 
              className="lg:hidden mr-4 text-gray-600"
              onClick={onMenuClick}
            >
              <Menu size={24} />
            </button>
            <h2 className="text-2xl font-semibold text-secondary">Dashboard</h2>
          </div>
          <div className="flex items-center space-x-4">
            <Button 
              onClick={() => setShowNewInvoiceModal(true)}
              className="bg-primary text-white hover:bg-primary/90 font-medium"
            >
              <Plus className="mr-2" size={16} />
              New Invoice
            </Button>
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                <User size={20} className="text-gray-600" />
              </div>
            </div>
          </div>
        </div>
      </header>

      <NewInvoiceModal 
        open={showNewInvoiceModal}
        onOpenChange={setShowNewInvoiceModal}
      />
    </>
  );
}
