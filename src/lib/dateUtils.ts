/**
 * Date Formatting Utilities
 * Provides consistent date formatting across the application
 */

/**
 * Formats a date to DD/MM/YYYY format
 * @param date - Date object, string, or timestamp
 * @returns Formatted date string in DD/MM/YYYY format
 */
export const formatDateDDMMYYYY = (date: Date | string | number): string => {
    if (!date) return '-';

    const d = new Date(date);
    if (isNaN(d.getTime())) return '-';

    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();

    return `${day}/${month}/${year}`;
};

/**
 * Formats a date to DD/MM/YYYY HH:MM format
 * @param date - Date object, string, or timestamp
 * @returns Formatted date string with time
 */
export const formatDateTimeDDMMYYYY = (date: Date | string | number): string => {
    if (!date) return '-';

    const d = new Date(date);
    if (isNaN(d.getTime())) return '-';

    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');

    return `${day}/${month}/${year} ${hours}:${minutes}`;
};

// Aliases for cleaner usage
export const formatDate = formatDateDDMMYYYY;
export const formatDateTime = formatDateTimeDDMMYYYY;

