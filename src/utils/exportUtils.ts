/**
 * Utility functions for exporting data in various formats
 */

/**
 * Convert data to CSV format
 * @param data - Array of objects to convert
 * @param headers - Optional custom headers (uses object keys if not provided)
 * @returns CSV string
 */
export const convertToCSV = <T extends Record<string, any>>(
  data: T[],
  headers?: string[]
): string => {
  if (!data || data.length === 0) return '';

  // Use provided headers or extract from first data item
  const headerRow = headers || Object.keys(data[0]);
  
  // Create CSV header row
  let csvContent = headerRow.join(',') + '\n';
  
  // Add data rows
  data.forEach(item => {
    const row = headerRow.map(header => {
      // Get value from data using header as key
      const value = header.includes('.')
        ? getNestedValue(item, header)
        : item[header];
      
      // Format value for CSV (handle strings with commas, quotes, etc.)
      return formatCSVValue(value);
    });
    
    csvContent += row.join(',') + '\n';
  });
  
  return csvContent;
};

/**
 * Get nested value from object using dot notation
 * @param obj - Object to extract value from
 * @param path - Path to value using dot notation (e.g., 'user.profile.name')
 * @returns Value at the specified path
 */
const getNestedValue = (obj: Record<string, any>, path: string): any => {
  return path.split('.').reduce((o, key) => (o ? o[key] : ''), obj);
};

/**
 * Format value for CSV (handle strings with commas, quotes, etc.)
 * @param value - Value to format
 * @returns Formatted value
 */
const formatCSVValue = (value: any): string => {
  if (value === null || value === undefined) return '';
  
  const stringValue = typeof value === 'object' 
    ? JSON.stringify(value)
    : String(value);
  
  // Escape quotes and wrap in quotes if contains commas, quotes, or newlines
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  
  return stringValue;
};

/**
 * Download data as a file
 * @param content - File content
 * @param fileName - File name
 * @param contentType - Content type (MIME type)
 */
export const downloadFile = (
  content: string,
  fileName: string,
  contentType: string
): void => {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  
  URL.revokeObjectURL(url);
};

/**
 * Export data as CSV file
 * @param data - Data to export
 * @param fileName - File name (without extension)
 * @param headers - Optional custom headers
 */
export const exportAsCSV = <T extends Record<string, any>>(
  data: T[],
  fileName: string,
  headers?: string[]
): void => {
  const csvContent = convertToCSV(data, headers);
  downloadFile(csvContent, `${fileName}.csv`, 'text/csv;charset=utf-8;');
};

/**
 * Export data as JSON file
 * @param data - Data to export
 * @param fileName - File name (without extension)
 */
export const exportAsJSON = <T>(data: T, fileName: string): void => {
  const jsonContent = JSON.stringify(data, null, 2);
  downloadFile(jsonContent, `${fileName}.json`, 'application/json;charset=utf-8;');
};

/**
 * Export data as Excel file (XLSX)
 * Note: This is a simplified version that creates a CSV which Excel can open
 * For a proper Excel file, you would need to use a library like xlsx or exceljs
 * @param data - Data to export
 * @param fileName - File name (without extension)
 * @param headers - Optional custom headers
 */
export const exportAsExcel = <T extends Record<string, any>>(
  data: T[],
  fileName: string,
  headers?: string[]
): void => {
  // For now, we'll just create a CSV that Excel can open
  exportAsCSV(data, fileName, headers);
};

/**
 * Format date for file names
 * @returns Formatted date string (YYYY-MM-DD)
 */
export const getFormattedDate = (): string => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};
