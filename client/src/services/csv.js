/**
 * Role Mining UI - CSV Service
 *
 * Client-side CSV validation using PapaParse
 * Validates file size, extension, and schema before upload
 */

import Papa from 'papaparse';

// ============================================================================
// CONSTANTS
// ============================================================================

const REQUIRED_COLUMNS = {
    identities: ['USR_ID', 'department', 'jobcode', 'location_country', 'manager'],
    assignments: ['USR_ID', 'APP_ID', 'ENT_ID'],
    entitlements: ['APP_ID', 'ENT_ID', 'ENT_NAME']
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const FILE_TYPE_LABELS = {
    identities: 'Identities',
    assignments: 'Assignments',
    entitlements: 'Entitlements'
};

// ============================================================================
// BASIC FILE VALIDATION
// ============================================================================

/**
 * Validate file size and extension before parsing
 * @param {File} file - File object from input
 * @param {string} fileType - One of: identities, assignments, entitlements
 * @returns {string[]} Array of error messages (empty if valid)
 */
export function validateCSVFile(file, fileType) {
    const errors = [];

    // Check file exists
    if (!file) {
        errors.push('No file selected');
        return errors;
    }

    // Check file type is valid
    if (!REQUIRED_COLUMNS[fileType]) {
        errors.push(`Invalid file type: ${fileType}`);
        return errors;
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
        const sizeMB = (file.size / 1024 / 1024).toFixed(1);
        errors.push(`File size exceeds 10MB limit (${sizeMB}MB)`);
    }

    // Check file extension
    if (!file.name.endsWith('.csv')) {
        errors.push('File must be a CSV file (.csv extension)');
    }

    // Check file is not empty
    if (file.size === 0) {
        errors.push('File is empty (0 bytes)');
    }

    return errors;
}

// ============================================================================
// CSV PARSING
// ============================================================================

/**
 * Parse CSV file using PapaParse
 * @param {File} file - File object to parse
 * @returns {Promise<Object>} PapaParse results object
 */
export function parseCSV(file) {
    return new Promise((resolve, reject) => {
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            trimHeaders: true,
            transformHeader: (header) => header.trim(),
            complete: (results) => {
                if (results.errors.length > 0) {
                    const firstError = results.errors[0];
                    reject(new Error(`CSV parsing error on row ${firstError.row}: ${firstError.message}`));
                } else {
                    resolve(results);
                }
            },
            error: (error) => {
                reject(new Error(`Failed to parse CSV: ${error.message}`));
            }
        });
    });
}

// ============================================================================
// SCHEMA VALIDATION
// ============================================================================

/**
 * Validate CSV structure (columns and data)
 * @param {File} file - File object to validate
 * @param {string} fileType - One of: identities, assignments, entitlements
 * @returns {Promise<Object>} Validation result with errors, rowCount, columns
 */
export async function validateCSVStructure(file, fileType) {
    const errors = [];

    try {
        const results = await parseCSV(file);
        const columns = results.meta.fields || [];
        const requiredColumns = REQUIRED_COLUMNS[fileType];

        // Check required columns exist
        const missingColumns = requiredColumns.filter(col => !columns.includes(col));
        if (missingColumns.length > 0) {
            errors.push(`Missing required columns: ${missingColumns.join(', ')}`);
        }

        // Check for data rows
        if (results.data.length === 0) {
            errors.push('CSV file contains no data rows');
        }

        // Check for duplicate columns
        const columnCounts = {};
        columns.forEach(col => {
            columnCounts[col] = (columnCounts[col] || 0) + 1;
        });
        const duplicates = Object.keys(columnCounts).filter(col => columnCounts[col] > 1);
        if (duplicates.length > 0) {
            errors.push(`Duplicate columns found: ${duplicates.join(', ')}`);
        }

        // Type-specific validation
        const typeErrors = validateFileTypeSpecifics(results.data, fileType);
        errors.push(...typeErrors);

        return {
            valid: errors.length === 0,
            errors,
            rowCount: results.data.length,
            columns,
            sample: results.data.slice(0, 5) // First 5 rows for preview
        };
    } catch (error) {
        return {
            valid: false,
            errors: [error.message],
            rowCount: 0,
            columns: []
        };
    }
}

// ============================================================================
// TYPE-SPECIFIC VALIDATION
// ============================================================================

/**
 * Perform file-type specific validation
 * @param {Array} data - Parsed CSV rows
 * @param {string} fileType - File type
 * @returns {string[]} Array of error messages
 */
function validateFileTypeSpecifics(data, fileType) {
    const errors = [];

    if (data.length === 0) return errors;

    switch (fileType) {
        case 'identities':
            errors.push(...validateIdentities(data));
            break;
        case 'assignments':
            errors.push(...validateAssignments(data));
            break;
        case 'entitlements':
            errors.push(...validateEntitlements(data));
            break;
    }

    return errors;
}

/**
 * Validate identities data
 */
function validateIdentities(data) {
    const errors = [];
    const sample = data.slice(0, 10);

    // Check for empty USR_ID
    const emptyUserIds = sample.filter(row => !row.USR_ID || row.USR_ID.trim() === '');
    if (emptyUserIds.length > 0) {
        errors.push('Some rows have empty USR_ID values');
    }

    return errors;
}

/**
 * Validate assignments data
 */
function validateAssignments(data) {
    const errors = [];
    const sample = data.slice(0, 10);

    // Check for empty required fields
    const emptyFields = sample.filter(row =>
        !row.USR_ID || !row.APP_ID || !row.ENT_ID ||
        row.USR_ID.trim() === '' || row.APP_ID.trim() === '' || row.ENT_ID.trim() === ''
    );

    if (emptyFields.length > 0) {
        errors.push('Some rows have empty USR_ID, APP_ID, or ENT_ID values');
    }

    return errors;
}

/**
 * Validate entitlements data
 */
function validateEntitlements(data) {
    const errors = [];
    const sample = data.slice(0, 10);

    // Check for empty required fields
    const emptyFields = sample.filter(row =>
        !row.APP_ID || !row.ENT_ID || !row.ENT_NAME ||
        row.APP_ID.trim() === '' || row.ENT_ID.trim() === '' || row.ENT_NAME.trim() === ''
    );

    if (emptyFields.length > 0) {
        errors.push('Some rows have empty APP_ID, ENT_ID, or ENT_NAME values');
    }

    return errors;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get user-friendly file type label
 * @param {string} fileType - File type key
 * @returns {string} Human-readable label
 */
export function getFileTypeLabel(fileType) {
    return FILE_TYPE_LABELS[fileType] || fileType;
}

/**
 * Get required columns for a file type
 * @param {string} fileType - File type key
 * @returns {string[]} Array of required column names
 */
export function getRequiredColumns(fileType) {
    return REQUIRED_COLUMNS[fileType] || [];
}

/**
 * Format file size for display
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted size (e.g., "2.3 MB")
 */
export function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Full validation pipeline - combines basic and structure validation
 * @param {File} file - File to validate
 * @param {string} fileType - File type
 * @returns {Promise<Object>} Combined validation result
 */
export async function validateFile(file, fileType) {
    // Basic validation first
    const basicErrors = validateCSVFile(file, fileType);

    if (basicErrors.length > 0) {
        return {
            valid: false,
            errors: basicErrors,
            rowCount: 0,
            columns: []
        };
    }

    // Structure validation
    const structureResult = await validateCSVStructure(file, fileType);

    return structureResult;
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
    validateCSVFile,
    parseCSV,
    validateCSVStructure,
    validateFile,
    getFileTypeLabel,
    getRequiredColumns,
    formatFileSize
};
