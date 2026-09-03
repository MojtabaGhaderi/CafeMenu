import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchMenu, fetchShopProfile, resolveAssetUrl } from "./api/api";
import logo from "../assets/logo.PNG";

import StateError from "../components/states/StateError";

function slugifyId(input) {
    const s = String(input ?? "").trim();
    if (!s) return "cat";
    return (
        "cat-" +
        s
            .replaceAll(/\s+/g, "-")
            .replaceAll(/[^\p{L}\p{N}\-_]+/gu, "")
            .slice(0, 40)
    );
}

function classNames(...xs) {
    return xs.filter(Boolean).join(" ");
}

function toFaDigits(input) {
    const s = String(input ?? "");
    const map = { 0: "۰", 1: "۱", 2: "۲", 3: "۳", 4: "۴", 5: "۵", 6: "۶", 7: "۷", 8: "۸", 9: "۹" };
    return s.replace(/[0-9]/g, (d) => map[d]);
}

function formatToman(price) {
    const n = Number(price);
    if (!Number.isFinite(n) || n <= 0) return "";
    const withSep = new Intl.NumberFormat("en-US").format(n);
    return `${toFaDigits(withSep)} تومان`;
}

function getItemImage(item) {
    const imgs = Array.isArray(item?.images) ? item.images : [];
    if (!imgs.length) return null;
    const best = [...imgs].sort((a, b) => (a.sort_order ?? 999) - (b.sort_order ?? 999))[0];
    return best?.url ?? null;
}

export default function MenuPage() {
    const { data, isLoading, isError } = useQuery({
        queryKey: ["menu"],
        queryFn: fetchMenu,
    });

    const { data: profile } = useQuery({
        queryKey: ["shop-profile"],
        queryFn: fetchShopProfile,
    });

    const categories = useMemo(() => {
        const list = Array.isArray(data) ? data : [];
        return [...list]
            .sort((a, b) => (a.sort_order ?? 999) - (b.sort_order ?? 999))
            .map((c) => ({
                ...c,
                _anchorId: slugifyId(c.title || c.id),
                title: c.title ?? "دسته‌بندی",
                items: Array.isArray(c.items) ? c.items : [],
            }));
    }, [data]);

    const [activeId, setActiveId] = useState("");
    const [isFooterOpen, setIsFooterOpen] = useState(false);
    const [showFloatingBar, setShowFloatingBar] = useState(false);

    // Logo overlay state
    const [showLogoOverlay, setShowLogoOverlay] = useState(true);
    const [logoFading, setLogoFading] = useState(false);
    const hasFadedRef = useRef(false);
    const timerRef = useRef(null); // <-- ref for the auto‑hide timeout

    const footerRef = useRef(null);

    // Set initial active category
    useEffect(() => {
        if (!activeId && categories.length) {
            setActiveId(categories[0]._anchorId);
        }
    }, [categories, activeId]);

    // Click handler
    const scrollToCategory = useCallback((anchorId) => {
        setActiveId(anchorId);
        const el = document.getElementById(anchorId);
        if (!el) return;
        const topOffset = 96;
        const y = el.getBoundingClientRect().top + window.scrollY - topOffset;
        window.scrollTo({ top: y, behavior: "smooth" });
    }, []);

    // Scroll-spy (throttled)
    useEffect(() => {
        if (!categories.length) return;

        let ticking = false;

        const handleScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    const headerHeight = 96;
                    let closest = null;
                    let closestDist = Infinity;

                    categories.forEach(cat => {
                        const el = document.getElementById(cat._anchorId);
                        if (!el) return;
                        const rect = el.getBoundingClientRect();
                        const dist = rect.top - headerHeight;
                        if (dist >= 0 && dist < closestDist) {
                            closestDist = dist;
                            closest = cat._anchorId;
                        }
                    });

                    if (closest === null && categories.length > 0) {
                        // Bottom of page: pick the last category
                        setActiveId(categories[categories.length - 1]._anchorId);
                    } else if (closest !== null) {
                        setActiveId(closest);
                    }

                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll(); // run once

        return () => window.removeEventListener('scroll', handleScroll);
    }, [categories]);

    // Footer observer (unchanged)
    useEffect(() => {
        if (!footerRef.current) return;
        const observer = new IntersectionObserver(
            ([entry]) => setShowFloatingBar(!entry.isIntersecting),
            { threshold: 0.05 }
        );
        observer.observe(footerRef.current);
        return () => observer.disconnect();
    }, []);

    // Logo overlay: fade out on scroll or after 4 seconds (StrictMode‑safe)
    useEffect(() => {
        if (isLoading) return;

        const handleScroll = () => {
            if (window.scrollY > 50 && !hasFadedRef.current) {
                hasFadedRef.current = true;
                setLogoFading(true);
                clearTimeout(timerRef.current);
                setTimeout(() => setShowLogoOverlay(false), 600);
            }
        };

        // Auto‑hide after 4 seconds if the user never scrolls
        timerRef.current = setTimeout(() => {
            if (!hasFadedRef.current) {
                hasFadedRef.current = true;
                setLogoFading(true);
                setTimeout(() => setShowLogoOverlay(false), 600);
            }
        }, 4000);

        window.addEventListener("scroll", handleScroll, { passive: true });

        return () => {
            window.removeEventListener("scroll", handleScroll);
            clearTimeout(timerRef.current);
        };
    }, [isLoading]);

    // ========== FULL-SCREEN LOADING LOGO ==========
    if (isLoading) {
        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-app-bg">
                <img
                    src={logo}
                    alt="Loading..."
                    className="w-80 object-contain animate-pulse"
                />
            </div>
        );
    }

    return (
        <div dir="rtl" lang="fa" className="relative min-h-dvh bg-app-bg text-app-text">
            {/* Background logo (faint, always visible behind content) */}
            <img
                src={logo}
                alt=""
                aria-hidden="true"
                className="pointer-events-none fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] opacity-[0.1] object-contain z-0"
            />

            {/* ========== LOGO OVERLAY (on top, fades on scroll or after 4s) ========== */}
            {showLogoOverlay && (
                <div
                    className={classNames(
                        "fixed inset-0 z-[90] flex flex-col items-center justify-center bg-app-bg transition-opacity duration-500 ease-out",
                        logoFading ? "opacity-0 pointer-events-none" : "opacity-100"
                    )}
                >
                    <img
                        src={logo}
                        alt="Logo"
                        className="w-[90vw] object-contain animate-pulse"
                    />

                    {/* Scroll hint — 3 arrows pointing UP, no text */}
                    <div className="absolute bottom-16 flex flex-col items-center gap-1">
                        <svg className="w-8 h-8 text-[#111827] animate-bounce-slow" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                        </svg>
                        <svg className="w-8 h-8 text-[#111827] animate-bounce-slow delay-150" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                        </svg>
                        <svg className="w-8 h-8 text-[#111827] animate-bounce-slow delay-300" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                        </svg>
                    </div>
                </div>
            )}

            {/* Sticky Category Tabs */}
            <header className="relative sticky top-0 z-30 border-b border-app-border bg-app-header/85 backdrop-blur">
                <div className="mx-auto max-w-xl px-4 py-3">
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                        {categories.map((c) => {
                            const isActive = activeId === c._anchorId;
                            return (
                                <button
                                    key={c._anchorId}
                                    type="button"
                                    onClick={() => scrollToCategory(c._anchorId)}
                                    className={classNames(
                                        "whitespace-nowrap rounded-full px-3 py-2 text-sm border transition",
                                        isActive
                                            ? "bg-app-primary text-app-primaryText border-app-primary"
                                            : "bg-app-surface text-app-text border-app-border hover:border-black/20"
                                    )}
                                >
                                    {c.title}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="relative z-10 mx-auto max-w-xl px-4 py-6 pb-28">
                {isError ? (
                    <StateError />
                ) : (
                    <div className="space-y-10">
                        {categories.map((cat) => (
                            <section key={cat._anchorId}>
                                <div id={cat._anchorId} className="scroll-mt-32 h-px" />

                                {/* Category Box with reduced opacity */}
                                <div className="rounded-3xl bg-app-surface/70 border border-app-border/60 p-5 shadow-sm backdrop-blur-sm">
                                    <div className="mb-6">
                                        <div className="text-xl font-semibold text-app-text">{cat.title}</div>
                                    </div>

                                    <div className="space-y-4">
                                        {[...cat.items]
                                            .sort((a, b) => {
                                                const avA = a?.is_available !== false;
                                                const avB = b?.is_available !== false;
                                                if (avA !== avB) return avA ? -1 : 1;
                                                return (a?.sort_order ?? 999) - (b?.sort_order ?? 999);
                                            })
                                            .map((item) => (
                                                <MenuItemCard key={item.id} item={item} />
                                            ))}
                                    </div>
                                </div>
                            </section>
                        ))}
                    </div>
                )}
            </main>

            {/* ==================== REAL FOOTER (at bottom of content) ==================== */}
            <footer ref={footerRef} className="mx-auto max-w-xl px-4 pb-8">
                <div className="rounded-2xl border border-app-border bg-app-surface p-5">
                    <div className="flex items-center justify-between gap-4">
                        <div className="min-w-0">
                            <div className="text-sm font-semibold text-app-text">
                                {profile?.name ? profile.name : "اطلاعات تماس"}
                            </div>
                            <div className="mt-2 space-y-1 text-sm text-app-muted">
                                {profile?.address ? <div>آدرس: {profile.address}</div> : <div>آدرس: …</div>}
                                {profile?.hours ? <div>ساعت کاری: {profile.hours}</div> : <div>ساعت کاری: …</div>}
                                {profile?.instagram ? (
                                    <div>
                                        اینستاگرام:{" "}
                                        <a
                                            href={`https://instagram.com/${profile.instagram.replace(/^@/, "")}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            dir="ltr"
                                            className="font-medium text-app-text hover:underline"
                                        >
                                            @{profile.instagram.replace(/^@/, "")}
                                        </a>
                                    </div>
                                ) : (
                                    <div>اینستاگرام: …</div>
                                )}
                            </div>
                        </div>

                        <img
                            src={profile?.logo_url ? resolveAssetUrl(profile.logo_url) : logo}
                            alt={profile?.name || "لوگو"}
                            className="h-28 w-28 shrink-0 object-contain opacity-90"
                            loading="lazy"
                        />
                    </div>
                </div>
            </footer>

            {/* ==================== FLOATING BOTTOM BAR ==================== */}
            {showFloatingBar && (
                <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#374151] border-t border-gray-700 shadow-2xl text-white">
                    <div
                        className="mx-auto max-w-xl px-4 py-3.5 flex items-center justify-between cursor-pointer active:bg-[#2a2a2a]"
                        onClick={() => setIsFooterOpen(!isFooterOpen)}
                    >
                        <div className="flex items-center gap-3">
                            <img
                                src={profile?.logo_url ? resolveAssetUrl(profile.logo_url) : logo}
                                alt={profile?.name || "کافه"}
                                className="h-9 w-9 object-contain rounded-lg"
                            />
                            <div>
                                <div className="font-semibold">
                                    {profile?.name || "کافه موج"}
                                </div>
                                {!isFooterOpen && (
                                    <div className="text-xs text-gray-400">اطلاعات کافه</div>
                                )}
                            </div>
                        </div>

                        <div className={classNames(
                            "transition-transform duration-300 text-xl",
                            isFooterOpen && "rotate-180"
                        )}>
                            ▼
                        </div>
                    </div>

                    {/* Expanded Dropdown */}
                    <div className={classNames(
                        "overflow-hidden transition-all duration-300 border-t border-gray-700",
                        isFooterOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                    )}>
                        <div className="px-4 pb-6">
                            <div className="rounded-2xl border border-gray-700 bg-[#3c4759] p-5 text-white">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="min-w-0">
                                        <div className="text-sm font-semibold">
                                            {profile?.name ? profile.name : "اطلاعات تماس"}
                                        </div>
                                        <div className="mt-2 space-y-1 text-sm text-gray-400">
                                            {profile?.address && <div>آدرس: {profile.address}</div>}
                                            {profile?.hours && <div>ساعت کاری: {profile.hours}</div>}
                                            {profile?.instagram && (
                                                <div>
                                                    اینستاگرام:{" "}
                                                    <a
                                                        href={`https://instagram.com/${profile.instagram.replace(/^@/, "")}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        dir="ltr"
                                                        className="text-blue-400 hover:underline"
                                                    >
                                                        @{profile.instagram.replace(/^@/, "")}
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <img
                                        src={profile?.logo_url ? resolveAssetUrl(profile.logo_url) : logo}
                                        alt={profile?.name || "لوگو"}
                                        className="h-28 w-28 shrink-0 object-contain opacity-90"
                                        loading="lazy"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

                @keyframes bounce-slow {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(12px); }
                }
                .animate-bounce-slow {
                    animation: bounce-slow 1.2s ease-in-out infinite;
                }
                .delay-150 {
                    animation-delay: 150ms;
                }
                .delay-300 {
                    animation-delay: 300ms;
                }
            `}</style>
        </div>
    );
}

function StatusCard({ title, desc }) {
    return (
        <div className="rounded-2xl border border-app-border bg-app-surface p-4 shadow-sm">
            <div className="text-base font-semibold text-app-text">{title}</div>
            {desc ? <div className="mt-2 text-sm leading-6 text-app-muted">{desc}</div> : null}
        </div>
    );
}

function MenuItemCard({ item }) {
    const title = item?.title ?? "آیتم";
    const desc = item?.description ?? "";
    const priceText = formatToman(item?.price);
    const img = getItemImage(item);
    const available = item?.is_available !== false;

    return (
        <article
            className={classNames(
                "rounded-2xl border bg-app-surface p-4 transition-all",
                available ? "border-app-border" : "border-app-border opacity-60"
            )}
        >
            <div className="flex gap-4">
                {/* Image - Right side (standard for RTL) */}
                <div className="shrink-0 w-24 sm:w-28">
                    <div className="overflow-hidden rounded-xl bg-black/5">
                        {img ? (
                            <img
                                src={resolveAssetUrl(img)}
                                alt={title}
                                className={classNames(
                                    "h-24 w-full object-cover sm:h-28",
                                    available ? "" : "grayscale"
                                )}
                                loading="lazy"
                            />
                        ) : (
                            <div className="h-24 w-full sm:h-28" />
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col">
                    <div className="flex-1">
                        <div className="flex items-start justify-between">
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                    <div className="truncate text-base font-semibold text-app-text">
                                        {title}
                                    </div>
                                    {!available && (
                                        <span className="shrink-0 rounded-full border border-app-border bg-app-soft px-2 py-0.5 text-xs text-app-muted">
                                            ناموجود
                                        </span>
                                    )}
                                </div>

                                {desc && (
                                    <div className="mt-1.5 text-sm leading-6 text-app-muted">
                                        {desc}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Price - Forced to Bottom LEFT */}
                    {priceText && (
                        <div className="mt-auto pt-4 text-left">
                            <div className="text-sm font-semibold tabular-nums text-app-text">
                                {priceText}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </article>
    );
}
