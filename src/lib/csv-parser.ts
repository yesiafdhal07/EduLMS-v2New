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

/**
 * Parse CSV content to student data
 */
export function parseCSV(content: string): CSVParseResult {
    const lines = content.trim().split('\n');
    const result: CSVParseResult = {
        success: true,
        data: [],
        errors: [],
        warnings: [],
    };

    if (lines.length < 2) {
        result.success = false;
        result.errors.push({ row: 0, message: 'File harus memiliki header dan minimal 1 baris data' });
        return result;
    }

    // Parse header
    const headerLine = lines[0];
    const headers = parseCSVLine(headerLine).map(h => h.toLowerCase().trim());
    
    // Validate required columns
    const nameIndex = headers.findIndex(h => 
        ['nama lengkap', 'nama', 'name', 'full_name', 'fullname'].includes(h)
    );
    const emailIndex = headers.findIndex(h => 
        ['email', 'e-mail', 'email address'].includes(h)
    );
    const passwordIndex = headers.findIndex(h => 
        ['password', 'pass', 'kata sandi'].includes(h)
    );

    if (nameIndex === -1) {
        result.success = false;
        result.errors.push({ row: 1, message: 'Kolom "Nama Lengkap" tidak ditemukan' });
        return result;
    }

    if (emailIndex === -1) {
        result.success = false;
        result.errors.push({ row: 1, message: 'Kolom "Email" tidak ditemukan' });
        return result;
    }

    if (passwordIndex === -1) {
        result.warnings.push({ row: 1, message: 'Kolom "Password" tidak ditemukan, akan menggunakan password default' });
    }

    // Parse data rows
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue; // Skip empty lines

        const values = parseCSVLine(line);
        const rowNumber = i + 1;

        const fullName = values[nameIndex]?.trim();
        const email = values[emailIndex]?.trim();
        const password = passwordIndex >= 0 ? values[passwordIndex]?.trim() : undefined;

        // Validate name
        if (!fullName) {
            result.errors.push({ row: rowNumber, message: 'Nama tidak boleh kosong' });
            continue;
        }

        if (fullName.length < 2) {
            result.errors.push({ row: rowNumber, message: 'Nama terlalu pendek (min. 2 karakter)' });
            continue;
        }

        // Validate email
        if (!email) {
            result.errors.push({ row: rowNumber, message: 'Email tidak boleh kosong' });
            continue;
        }

        if (!isValidEmail(email)) {
            result.errors.push({ row: rowNumber, message: `Email tidak valid: ${email}` });
            continue;
        }

        // Check for duplicate emails
        if (result.data.some(s => s.email.toLowerCase() === email.toLowerCase())) {
            result.errors.push({ row: rowNumber, message: `Email duplikat: ${email}` });
            continue;
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
    }

    if (result.errors.length > 0) {
        result.success = false;
    }

    return result;
}

/**
 * Parse a single CSV line, handling quoted values
 */
function parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        const nextChar = line[i + 1];

        if (char === '"') {
            if (inQuotes && nextChar === '"') {
                // Escaped quote
                current += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
        } else if ((char === ',' || char === ';') && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }

    result.push(current.trim());
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
