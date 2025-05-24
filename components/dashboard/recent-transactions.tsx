import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowDown, ArrowUp, FileText } from "lucide-react";
import { Link } from "wouter";
import { Invoice, Payment } from "@shared/schema";

interface Transaction {
  type: 'invoice' | 'payment';
  data: Invoice | Payment;
  timestamp: Date;
}

export default function RecentTransactions() {
  const { data: transactions = [], isLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/dashboard/recent-transactions"],
    select: (data) => data.map(t => ({
      ...t,
      timestamp: new Date(t.timestamp)
    }))
  });

  if (isLoading) {
    return (
      <Card className="bg-white shadow-sm border border-gray-100">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-secondary">
            Recent Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse p-3 bg-gray-50 rounded-lg">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };

  return (
    <Card className="bg-white shadow-sm border border-gray-100">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-secondary">
            Recent Transactions
          </CardTitle>
          <Link href="/income-table">
            <Button variant="link" className="text-primary hover:text-primary/80 text-sm font-medium p-0">
              View All
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions.slice(0, 5).map((transaction, index) => {
            const isPayment = transaction.type === 'payment';
            const data = transaction.data;
            
            // For payments, we need to get the invoice number
            const displayText = isPayment 
              ? `Payment received`
              : `Invoice created`;
            
            const amount = isPayment 
              ? `+$${(data as Payment).amount}`
              : `$${(data as Invoice).amount}`;

            const identifier = isPayment
              ? `Payment #${data.id}`
              : (data as Invoice).invoiceNumber;

            return (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className={`p-2 rounded-lg mr-3 ${
                    isPayment 
                      ? 'bg-success/10' 
                      : 'bg-primary/10'
                  }`}>
                    {isPayment ? (
                      <ArrowDown className="text-success text-sm" size={16} />
                    ) : (
                      <FileText className="text-primary text-sm" size={16} />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-secondary text-sm">{identifier}</p>
                    <p className="text-xs text-gray-600">{displayText}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${
                    isPayment ? 'text-success' : 'text-secondary'
                  }`}>
                    {amount}
                  </p>
                  <p className="text-xs text-gray-600">
                    {formatTimeAgo(transaction.timestamp)}
                  </p>
                </div>
              </div>
            );
          })}
          
          {transactions.length === 0 && (
            <p className="text-gray-600 text-center py-4">No recent transactions</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
