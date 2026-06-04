import { Routes, Route, Navigate } from "react-router-dom";

import MenuPage from "./public/MenuPage.jsx";
import AdminLogin from "./admin/pages/AdminLogin.jsx";
import AdminLayout from "./admin/layout/AdminLayout.jsx";
import AdminCategories from "./admin/pages/AdminCategories.jsx";
import AdminItems from "./admin/pages/AdminItems.jsx";
import AdminGuard from "./admin/layout/AdminGuard.jsx";
import AdminSettings from "./admin/pages/AdminSettings.jsx";

export default function App() {
    return (
        <Routes>
            <Route path="/" element={<MenuPage />} />

            <Route path="/admin/login" element={<AdminLogin />} />

            {/* Protected admin area */}
            <Route element={<AdminGuard />}>
                <Route path="/admin" element={<AdminLayout />}>
                    <Route path="settings" element={<AdminSettings />} />
                    <Route index element={<Navigate to="categories" replace />} />
                    <Route path="categories" element={<AdminCategories />} />
                    <Route path="items" element={<AdminItems />} />
                </Route>
            </Route>

            {/* optional: 404 */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}
