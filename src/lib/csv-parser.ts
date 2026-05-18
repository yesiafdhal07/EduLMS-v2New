/**
 * CSV Parser Utility
 * Parse and validate CSV files for student bulk import
 */

export interface ParsedStudent {
    fullName: string;
    email: string;
    password?: string;
    rowNumber: number;
}

export interface CSVParseResult {
    success: boolean;
    data: ParsedStudent[];
    errors: { row: number; message: string }[];
    warnings: { row: number; message: string }[];
}

import Papa from 'papaparse';

/**
 * Parse CSV content to student data using PapaParse
 */
export function parseCSV(content: string): CSVParseResult {
    const result: CSVParseResult = {
        success: true,
        data: [],
        errors: [],
        warnings: [],
    };

    const parsed = Papa.parse<Record<string, string>>(content, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => header.toLowerCase().trim()
    });

    if (parsed.data.length === 0) {
        result.success = false;
        result.errors.push({ row: 0, message: 'File harus memiliki header dan minimal 1 baris data' });
        return result;
    }

    if (parsed.errors.length > 0) {
        result.success = false;
        parsed.errors.forEach(err => {
            result.errors.push({ row: err.row || 0, message: err.message });
        });
        return result;
    }

    const headers = parsed.meta.fields || [];

    // Find correct column names based on common variants
    const nameField = headers.find(h => ['nama lengkap', 'nama', 'name', 'full_name', 'fullname'].includes(h));
    const emailField = headers.find(h => ['email', 'e-mail', 'email address'].includes(h));
    const passwordField = headers.find(h => ['password', 'pass', 'kata sandi'].includes(h));

    if (!nameField) {
        result.success = false;
        result.errors.push({ row: 1, message: 'Kolom "Nama Lengkap" tidak ditemukan' });
        return result;
    }

    if (!emailField) {
        result.success = false;
        result.errors.push({ row: 1, message: 'Kolom "Email" tidak ditemukan' });
        return result;
    }

    if (!passwordField) {
        result.warnings.push({ row: 1, message: 'Kolom "Password" tidak ditemukan, akan menggunakan password default' });
    }

    // Process rows
    parsed.data.forEach((row, index) => {
        const rowNumber = index + 2; // +1 for 0-index, +1 for header row
        
        const fullName = row[nameField]?.trim();
        const email = row[emailField]?.trim();
        const password = passwordField ? row[passwordField]?.trim() : undefined;

        // Validate name
        if (!fullName) {
            result.errors.push({ row: rowNumber, message: 'Nama tidak boleh kosong' });
            return; // equivalent to continue in forEach
        }

        if (fullName.length < 2) {
            result.errors.push({ row: rowNumber, message: 'Nama terlalu pendek (min. 2 karakter)' });
            return;
        }

        // Validate email
        if (!email) {
            result.errors.push({ row: rowNumber, message: 'Email tidak boleh kosong' });
            return;
        }

        if (!isValidEmail(email)) {
            result.errors.push({ row: rowNumber, message: `Email tidak valid: ${email}` });
            return;
        }

        // Check for duplicate emails within the file
        if (result.data.some(s => s.email.toLowerCase() === email.toLowerCase())) {
            result.errors.push({ row: rowNumber, message: `Email duplikat: ${email}` });
            return;
        }

        // Validate password if provided
        if (password && password.length < 6) {
            result.warnings.push({ row: rowNumber, message: 'Password kurang dari 6 karakter' });
        }

        result.data.push({
            fullName,
            email,
            password: password || undefined,
            rowNumber,
        });
    });

    if (result.errors.length > 0) {
        result.success = false;
    }

    return result;
}

/**
 * Email validation
 */
function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Generate CSV template for download
 */
export function generateCSVTemplate(): string {
    const headers = ['Nama Lengkap', 'Email', 'Password'];
    const exampleRow = ['Ahmad Rizki', 'ahmad@siswa.com', 'siswa123'];
    
    return [
        headers.join(','),
        exampleRow.join(','),
    ].join('\n');
}

/**
 * Download CSV template
 */
export function downloadCSVTemplate() {
    const template = generateCSVTemplate();
    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'template_import_siswa.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
