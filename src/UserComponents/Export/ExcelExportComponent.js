import React from 'react';
import * as _ from 'lodash';

const ExcelExportComponent = ({ headers = [], data = [], filename = "exported-data" }) => {
  // Function to generate Excel-compatible XML
  const generateExcel = () => {
    // Create XML header
    let excelContent = '<?xml version="1.0"?><?mso-application progid="Excel.Sheet"?>';
    excelContent += '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" ';
    excelContent += 'xmlns:o="urn:schemas-microsoft-com:office:office" ';
    excelContent += 'xmlns:x="urn:schemas-microsoft-com:office:excel" ';
    excelContent += 'xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet" ';
    excelContent += 'xmlns:html="http://www.w3.org/TR/REC-html40">';
    
    // Add styles for column widths
    excelContent += '<Styles><Style ss:ID="Default" ss:Name="Normal">';
    excelContent += '<Alignment ss:Vertical="Bottom"/>';
    excelContent += '<Borders/><Font/><Interior/><NumberFormat/><Protection/>';
    excelContent += '</Style></Styles>';

    // Create worksheet
    excelContent += '<Worksheet ss:Name="Sheet1">';
    excelContent += '<Table>';
    
    // Calculate column widths based on content (both headers and data)
    const columnWidths = {};
    
    // Process headers for width
    headers.forEach((header, index) => {
      const key = typeof header === 'object' ? header.key : index.toString();
      const headerText = typeof header === 'object' ? header.label : header;
      columnWidths[key] = headerText.length * 7; // Base width on character count
    });
    
    // Process data for width
    data.forEach(row => {
      headers.forEach((header, index) => {
        const key = typeof header === 'object' ? header.key : index.toString();
        const cellValue = typeof header === 'object' ? row[header.key] : row[index];
        const cellValueStr = String(cellValue || '');
        const cellWidth = cellValueStr.length * 7;
        
        // Update column width if this cell is wider
        columnWidths[key] = Math.max(columnWidths[key] || 0, cellWidth);
      });
    });
    
    // Add column width definitions
    headers.forEach((header, index) => {
      const key = typeof header === 'object' ? header.key : index.toString();
      const width = columnWidths[key] || 80; // Default width if none calculated
      excelContent += `<Column ss:Width="${width}" />`;
    });
    
    // Add header row
    excelContent += '<Row>';
    headers.forEach(header => {
      const headerText = typeof header === 'object' ? header.label : header;
      excelContent += `<Cell><Data ss:Type="String">${headerText}</Data></Cell>`;
    });
    excelContent += '</Row>';
    
    // Add data rows
    data.forEach(row => {
      excelContent += '<Row>';
      headers.forEach((header, index) => {
        const cellValue = typeof header === 'object' ? row[header.key] : row[index];
        
        // Determine data type
        let type = 'String';
        if (typeof cellValue === 'number') type = 'Number';
        else if (cellValue instanceof Date) type = 'DateTime';
        
        // Format the value based on type
        let formattedValue = cellValue;
        if (type === 'DateTime') {
          formattedValue = cellValue.toISOString();
        }
        
        excelContent += `<Cell><Data ss:Type="${type}">${formattedValue}</Data></Cell>`;
      });
      excelContent += '</Row>';
    });
    
    // Close tags
    excelContent += '</Table></Worksheet></Workbook>';
    
    return excelContent;
  };
  
  // Function to handle export button click
  const handleExport = () => {
    const excelContent = generateExcel();
    
    // Create a Blob with the Excel data
    const blob = new Blob([excelContent], { type: 'application/vnd.ms-excel' });
    
    // Create download link
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.xls`;
    link.click();
    
    // Clean up
    window.URL.revokeObjectURL(url);
  };
  
  return (
    <div className="flex flex-col p-4">
      <div className="overflow-x-auto mb-4">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              {headers.map((header, index) => (
                <th 
                  key={index} 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {typeof header === 'object' ? header.label : header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((row, rowIndex) => (
              <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                {headers.map((header, colIndex) => {
                  const cellValue = typeof header === 'object' ? row[header.key] : row[colIndex];
                  return (
                    <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {cellValue}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <button 
        className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md shadow-sm max-w-xs"
        onClick={handleExport}
      >
        Export to Excel
      </button>
    </div>
  );
};

export default ExcelExportComponent;