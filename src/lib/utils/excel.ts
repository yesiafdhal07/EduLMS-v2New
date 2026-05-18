import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

/**
 * Interface for Excel Column Configuration
 */
export interface ExcelColumn {
    header: string;
    key: string;
    width?: number;
}

/**
 * Interface for a Worksheet Configuration
 */
export interface ExcelSheetConfig {
    name: string;
    columns: ExcelColumn[];
    data: any[];
}

/**
 * Universal Excel Export Utility
 * 
 * Replaces 'xlsx' with 'exceljs' for better security (remediates CVEs)
 * and providing a more modern API with styling support.
 */
export async function exportToExcel(
    dataOrSheets: any[] | ExcelSheetConfig[],
    columnsOrFilename: ExcelColumn[] | string,
    filenameOrUndefined?: string,
    sheetName: string = 'Sheet1'
) {
    try {
        const workbook = new ExcelJS.Workbook();
        
        // Determine if we are handling multiple sheets or a single one
        const isMultiSheet = Array.isArray(dataOrSheets) && dataOrSheets.length > 0 && 'columns' in dataOrSheets[0];
        const sheets: ExcelSheetConfig[] = isMultiSheet 
            ? (dataOrSheets as ExcelSheetConfig[])
            : [{
                name: sheetName,
                columns: columnsOrFilename as ExcelColumn[],
                data: dataOrSheets as any[]
            }];
        
        const finalFilename = isMultiSheet 
            ? (columnsOrFilename as string) 
            : (filenameOrUndefined as string);

        for (const sheetConfig of sheets) {
            const worksheet = workbook.addWorksheet(sheetConfig.name);

            // 1. Setup Columns
            worksheet.columns = sheetConfig.columns.map(col => ({
                header: col.header,
                key: col.key,
                width: col.width || 20
            }));

            // 2. Style Header Row
            const headerRow = worksheet.getRow(1);
            headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
            headerRow.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF4F46E5' } // Indigo-600 matching Guru universe
            };
            headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

            // 3. Add Data Rows
            worksheet.addRows(sheetConfig.data);

            // 4. Auto-filter
            worksheet.autoFilter = {
                from: { row: 1, column: 1 },
                to: { row: 1, column: sheetConfig.columns.length }
            };
        }

        // 5. Generate Buffer and Download
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { 
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
        });
        
        saveAs(blob, finalFilename.endsWith('.xlsx') ? finalFilename : `${finalFilename}.xlsx`);
        
        return true;
    } catch (error) {
        console.error('[Excel Utils] Export failed:', error);
        return false;
    }
}
