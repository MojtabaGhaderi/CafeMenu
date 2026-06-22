const API_BASE = "/api" || "http://localhost:8000";

export async function fetchMenu() {
    const res = await fetch(`${API_BASE}/public/menu`);
    if (!res.ok) throw new Error(`API error ${res.status}`);
    return res.json();
}


export async function fetchShopProfile() {
    const res = await fetch(`${API_BASE}/public/shop-profile`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
}

export function resolveAssetUrl(url) {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    return `${API_BASE}${url}`;
}