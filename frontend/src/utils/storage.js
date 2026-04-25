import { API_BASE_URL } from '../config/api';

/**
 * Returns the absolute URL for a file stored on the backend storage.
 * @param {string} path - The relative path of the file in the storage directory.
 * @returns {string} The full absolute URL.
 */
export const getStorageUrl = (path) => {
    if (!path) return '';
    // If path is already a full URL, return as-is
    if (path.startsWith('http://') || path.startsWith('https://')) {
        return path;
    }
    // Remove the trailing /api/v1 or /api/v1/ to get the base domain
    const baseUrl = API_BASE_URL.replace(/\/api\/v1\/?$/, '');
    return `${baseUrl}/storage/${path}`;
};
