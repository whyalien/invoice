import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { parseExcelFile, convertToInsertInvoice } from "@/lib/excel-utils";
import { CloudUpload, FileSpreadsheet, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ExcelImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ExcelImportModal({ open, onOpenChange }: ExcelImportModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const importInvoicesMutation = useMutation({
    mutationFn: async (file: File) => {
      setIsProcessing(true);
      setUploadProgress(0);

      // Parse Excel file
      const excelData = await parseExcelFile(file);
      
      // Convert to invoice format and create each invoice
      const totalInvoices = excelData.length;
      let processedCount = 0;

      for (const excelRow of excelData) {
        const invoiceData = convertToInsertInvoice(excelRow);
        await apiRequest("POST", "/api/invoices", invoiceData);
        
        processedCount++;
        setUploadProgress((processedCount / totalInvoices) * 100);
      }

      return { count: totalInvoices };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/summary"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/recent-transactions"] });
      
      toast({
        title: "Success",
        description: `${result.count} invoices imported successfully`,
      });
      
      onOpenChange(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Import Failed",
        description: error.message || "Failed to import invoices",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsProcessing(false);
      setUploadProgress(0);
    },
  });

  const resetForm = () => {
    setSelectedFile(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleSubmit = () => {
    if (selectedFile) {
      importInvoicesMutation.mutate(selectedFile);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-secondary">
            Import Invoices from Excel
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* File Upload Area */}
          <div 
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <CloudUpload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h4 className="text-lg font-medium text-secondary mb-2">
              {selectedFile ? selectedFile.name : "Drop your Excel file here"}
            </h4>
            <p className="text-gray-600 mb-4">or click to browse files</p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button 
              type="button"
              className="bg-primary text-white hover:bg-primary/90"
            >
              Choose File
            </Button>
          </div>

          {/* File Requirements */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Excel File Requirements:</strong>
              <ul className="mt-2 space-y-1 text-sm">
                <li>• Column A: Invoice Number</li>
                <li>• Column B: Investor Name</li>
                <li>• Column C: Amount</li>
                <li>• Column D: Invoice Date</li>
                <li>• Column E: Due Date</li>
                <li>• Column F: Description (optional)</li>
              </ul>
            </AlertDescription>
          </Alert>

          {/* Upload Progress */}
          {isProcessing && (
            <div className="space-y-2">
              <Progress value={uploadProgress} className="w-full" />
              <p className="text-sm text-gray-600 text-center">
                Processing file... {Math.round(uploadProgress)}%
              </p>
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button 
              type="button"
              onClick={handleSubmit}
              disabled={!selectedFile || isProcessing}
              className="bg-success text-white hover:bg-success/90"
            >
              {isProcessing ? "Importing..." : "Import Invoices"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
