import { getToken } from "../auth/auth";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

async function request(path, { method = "GET", body } = {}) {
    const token = getToken();
    const res = await fetch(`${API_BASE}${path}`, {
        method,
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
        let detail = `HTTP ${res.status}`;
        try {
            const data = await res.json();
            detail = data.detail ? JSON.stringify(data.detail) : JSON.stringify(data);
        } catch { }
        throw new Error(detail);
    }
    return res.status === 204 ? null : res.json();
}

export async function login(email, password) {
    return request("/auth/login", { method: "POST", body: { email, password } });
}

export async function fetchMe() {
    return request("/admin/me");
}

export async function listCategories() {
    return request("/admin/categories");
}

export async function createCategory(payload) {
    return request("/admin/categories", { method: "POST", body: payload });
}

export async function updateCategory(id, payload) {
    return request(`/admin/categories/${id}`, { method: "PATCH", body: payload });
}

export async function deleteCategory(id) {
    return request(`/admin/categories/${id}`, { method: "DELETE" });
}

export async function listItems(categoryId) {
    const q = categoryId ? `?category_id=${categoryId}` : "";
    return request(`/admin/items${q}`);
}
export async function createItem(payload) {
    return request("/admin/items", { method: "POST", body: payload });
}
export async function updateItem(id, payload) {
    return request(`/admin/items/${id}`, { method: "PATCH", body: payload });
}
export async function deleteItem(id) {
    return request(`/admin/items/${id}`, { method: "DELETE" });
}

export async function listItemImages(itemId) {
    return request(`/admin/items/${itemId}/images`);
}
export async function addItemImage(itemId, payload) {
    return request(`/admin/items/${itemId}/images`, { method: "POST", body: payload });
}
export async function updateItemImage(imageId, payload) {
    return request(`/admin/item-images/${imageId}`, { method: "PATCH", body: payload });
}
export async function deleteItemImage(imageId) {
    return request(`/admin/item-images/${imageId}`, { method: "DELETE" });
}

export async function uploadItemImage(itemId, { file, sort_order = 1 }) {
    const token = getToken();

    const fd = new FormData();
    fd.append("file", file);
    fd.append("sort_order", String(sort_order));

    const res = await fetch(`${API_BASE}/admin/items/${itemId}/images/upload`, {
        method: "POST",
        headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            // DO NOT set Content-Type for FormData
        },
        body: fd,
    });

    if (!res.ok) {
        let detail = `HTTP ${res.status}`;
        try {
            const data = await res.json();
            detail = data.detail ? JSON.stringify(data.detail) : JSON.stringify(data);
        } catch {
            try {
                detail = await res.text();
            } catch { }
        }
        throw new Error(detail);
    }

    return res.json();
}

export function resolveAssetUrl(url) {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    return `${API_BASE}${url}`;
}

export function getShopProfile() {
    return request("/admin/shop-profile");
}

export function updateShopProfile(payload) {
    return request("/admin/shop-profile", { method: "PATCH", body: payload });
}