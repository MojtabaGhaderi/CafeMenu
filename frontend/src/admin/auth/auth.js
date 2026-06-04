const KEY = "coffee_menu_token";

export function setToken(token) {
    localStorage.setItem(KEY, String(token || ""));
}

export function getToken() {
    const t = localStorage.getItem(KEY);
    if (!t) return null;

    const s = t.trim();
    if (!s || s === "null" || s === "undefined") return null;

    return s;
}

export function clearToken() {
    localStorage.removeItem(KEY);
}

export function isAuthed() {
    return Boolean(getToken());
}
