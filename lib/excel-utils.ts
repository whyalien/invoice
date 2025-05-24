import * as XLSX from 'xlsx';
import { InsertInvoice } from '@shared/schema';

export interface ExcelInvoiceRow {
  invoiceNumber: string;
  investorName: string;
  amount: string;
  invoiceDate: string;
  dueDate: string;
  description?: string;
}

export function parseExcelFile(file: File): Promise<ExcelInvoiceRow[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Get the first worksheet
        const worksheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[worksheetName];
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        // Skip header row and process data
        const rows = jsonData.slice(1) as any[][];
        
        const invoices: ExcelInvoiceRow[] = rows
          .filter(row => row.length >= 5 && row[0]) // Must have at least 5 columns and invoice number
          .map(row => ({
            invoiceNumber: String(row[0] || '').trim(),
            investorName: String(row[1] || '').trim(),
            amount: String(row[2] || '0').trim(),
            invoiceDate: formatExcelDate(row[3]),
            dueDate: formatExcelDate(row[4]),
            description: String(row[5] || '').trim(),
          }))
          .filter(invoice => 
            invoice.invoiceNumber && 
            invoice.investorName && 
            parseFloat(invoice.amount) > 0
          );
        
        resolve(invoices);
      } catch (error) {
        reject(new Error('Failed to parse Excel file. Please check the format.'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsArrayBuffer(file);
  });
}

function formatExcelDate(value: any): string {
  if (!value) return new Date().toISOString().split('T')[0];
  
  // If it's already a date string
  if (typeof value === 'string') {
    const date = new Date(value);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
  }
  
  // If it's an Excel date number
  if (typeof value === 'number') {
    const date = XLSX.SSF.parse_date_code(value);
    if (date) {
      return new Date(date.y, date.m - 1, date.d).toISOString().split('T')[0];
    }
  }
  
  return new Date().toISOString().split('T')[0];
}

export function convertToInsertInvoice(excelRow: ExcelInvoiceRow): InsertInvoice {
  return {
    invoiceNumber: excelRow.invoiceNumber,
    investorName: excelRow.investorName,
    amount: excelRow.amount,
    invoiceDate: excelRow.invoiceDate,
    dueDate: excelRow.dueDate,
    description: excelRow.description || '',
  };
}
