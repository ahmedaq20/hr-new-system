/**
 * Utility to manage a session marker cookie.
 * This cookie will not have an Expires or Max-Age attribute,
 * making it a session cookie that the browser deletes when closed.
 */

const SESSION_COOKIE_NAME = 'auth_session_active';

export const setSessionMarker = () => {
    document.cookie = `${SESSION_COOKIE_NAME}=true; path=/; SameSite=Strict`;
};

export const hasSessionMarker = () => {
    return document.cookie.split(';').some((item) => item.trim().startsWith(`${SESSION_COOKIE_NAME}=`));
};

export const clearSessionMarker = () => {
    document.cookie = `${SESSION_COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict`;
};
