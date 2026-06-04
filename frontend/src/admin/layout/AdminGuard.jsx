import { Navigate, Outlet, useLocation } from "react-router-dom";
import { isAuthed } from "../auth/auth.js";

export default function AdminGuard() {
    const loc = useLocation();

    if (!isAuthed()) {
        const from = loc.pathname + loc.search + loc.hash;
        return <Navigate to="/admin/login" replace state={{ from }} />;
    }

    return <Outlet />;
}
