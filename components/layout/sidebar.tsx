import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  BarChart3, 
  FileText, 
  CreditCard, 
  Table, 
  TrendingUp,
  X
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navigationItems = [
  { href: "/dashboard", icon: BarChart3, label: "Dashboard" },
  { href: "/invoices", icon: FileText, label: "Invoices" },
  { href: "/payments", icon: CreditCard, label: "Payments" },
  { href: "/income-table", icon: Table, label: "Income Table" },
  { href: "/reports", icon: TrendingUp, label: "Reports" },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [location] = useLocation();

  const sidebarContent = (
    <>
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-secondary">
            <BarChart3 className="inline mr-2 text-primary" />
            InvoiceFlow
          </h1>
          <button 
            onClick={onClose}
            className="lg:hidden text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>
      </div>
      <nav className="mt-6">
        <div className="px-4 space-y-2">
          {navigationItems.map(({ href, icon: Icon, label }) => {
            const isActive = location === href || (href === "/dashboard" && location === "/");
            
            return (
              <Link key={href} href={href}>
                <div
                  className={cn(
                    "flex items-center px-4 py-3 rounded-lg font-medium transition-colors cursor-pointer",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-gray-600 hover:bg-gray-50"
                  )}
                  onClick={() => onClose()}
                >
                  <Icon className="mr-3" size={20} />
                  {label}
                </div>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="bg-white shadow-lg w-64 hidden lg:block fixed h-full z-30">
        {sidebarContent}
      </div>

      {/* Mobile Sidebar */}
      <div className={cn(
        "fixed left-0 top-0 h-full w-64 bg-white shadow-lg z-50 transform transition-transform duration-300 lg:hidden",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {sidebarContent}
      </div>
    </>
  );
}
