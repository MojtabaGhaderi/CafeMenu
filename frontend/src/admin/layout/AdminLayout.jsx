import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchMe } from "../api/api_admin";
import { clearToken } from "../auth/auth";
import Button from "../../components/ui/Button";
import clsx from "clsx";

export default function AdminLayout() {
    const nav = useNavigate();

    const { data } = useQuery({
        queryKey: ["me"],
        queryFn: fetchMe,
    });

    function logout() {
        clearToken();
        nav("/admin/login", { replace: true });
    }

    const tabs = [
        { to: "/admin/categories", label: "دسته‌بندی‌ها", end: false },
        { to: "/admin/items", label: "آیتم‌ها", end: false },
        { to: "/admin/settings", label: "تنظیمات" },
        { to: "/", label: "مشاهده منو", end: true },
    ];

    return (
        <div className="min-h-dvh bg-app-bg text-app-text">
            {/* Top Bar */}
            <header className="sticky top-0 z-40 border-b border-app-border bg-app-header/90 backdrop-blur">
                <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
                    {/* Branding */}
                    <div className="min-w-0">
                        <div className="text-lg font-semibold">پنل مدیریت</div>
                        {data?.email ? (
                            <div className="mt-1 truncate text-sm text-app-muted">{data.email}</div>
                        ) : null}
                    </div>

                    <Button variant="secondary" onClick={logout}>
                        خروج
                    </Button>
                </div>

                {/* Navigation Tabs */}
                <nav className="mx-auto max-w-5xl px-4 pb-3" aria-label="Admin navigation">
                    <div
                        className={clsx(
                            "flex gap-2 overflow-x-auto",
                            // Hide scrollbar without inline <style> or plugins
                            "[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                        )}
                    >
                        {tabs.map((tab) => (
                            <NavLink
                                key={tab.to}
                                to={tab.to}
                                end={tab.end}
                                className={({ isActive }) =>
                                    clsx(
                                        "whitespace-nowrap rounded-full border px-4 py-2 text-sm transition",
                                        isActive
                                            ? "border-app-primary bg-app-primary text-app-primaryText"
                                            : "border-app-border bg-app-surface text-app-text hover:border-black/20"
                                    )
                                }
                            >
                                {tab.label}
                            </NavLink>
                        ))}
                    </div>
                </nav>
            </header>

            {/* Main Content (layout owns spacing; pages own Cards) */}
            <main className="mx-auto max-w-5xl px-4 py-6 sm:py-8">
                <Outlet />
            </main>
        </div>
    );
}
