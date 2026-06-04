import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchMenu, fetchShopProfile, resolveAssetUrl } from "./api/api";
import logo from "../assets/logo.PNG";

import StateLoading from "../components/states/StateLoading";
import StateError from "../components/states/StateError";
import StateEmpty from "../components/states/StateEmpty";

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
    const best = [...imgs].sort(
        (a, b) => (a.sort_order ?? 999) - (b.sort_order ?? 999)
    )[0];
    return best?.url ?? null;
}

export default function MenuPage() {
    const { data, isLoading, isError } = useQuery({
        queryKey: ["menu"],
        queryFn: fetchMenu,
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


    useEffect(() => {
        if (!activeId && categories.length) setActiveId(categories[0]._anchorId);
    }, [categories, activeId]);


    const { data: profile } = useQuery({
        queryKey: ["shop-profile"],
        queryFn: fetchShopProfile,
    });

    const scrollToCategory = useCallback((anchorId) => {
        const el = document.getElementById(anchorId);
        if (!el) return;
        const topOffset = 96;
        const y = el.getBoundingClientRect().top + window.scrollY - topOffset;
        window.scrollTo({ top: y, behavior: "smooth" });
    }, []);

    useEffect(() => {
        const els = categories
            .map((c) => document.getElementById(c._anchorId))
            .filter(Boolean);

        if (!els.length) return;

        const headerLine = 120; // px from top of viewport (tune if needed)

        const onScroll = () => {
            // last section whose top is above the headerLine
            let currentId = els[0].id;

            for (const el of els) {
                const top = el.getBoundingClientRect().top;
                if (top <= headerLine) currentId = el.id;
                else break; // sections are in order
            }

            // if at very bottom, force last active
            const nearBottom =
                window.innerHeight + window.scrollY >=
                document.documentElement.scrollHeight - 8;

            if (nearBottom) currentId = els[els.length - 1].id;

            setActiveId(currentId);
        };

        onScroll(); // initialize on load
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, [categories]);


    return (
        <div dir="rtl" lang="fa" className="relative min-h-dvh bg-app-bg text-app-text">
            {/* Background logo (true background layer) */}
            <img
                src={logo}
                alt=""
                aria-hidden="true"
                className="pointer-events-none fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] opacity-[0.1]  object-contain z-0"
            />

            {/* Sticky Header + Tabs */}
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

            {/* Main */}
            <main className="relative z-10 mx-auto max-w-xl px-4 py-6 pb-24">
                {isLoading ? (
                    <StatusCard title="در حال بارگذاری منو…" desc="لطفاً چند لحظه صبر کنید." />
                ) : isError ? (
                    <StatusCard title="مشکلی پیش آمد." desc="لطفاً اینترنت را بررسی کنید و دوباره تلاش کنید." />
                ) : (
                    <div className="space-y-10">
                        {categories.map((cat) => (
                            <section key={cat._anchorId}>
                                <div id={cat._anchorId} className="scroll-mt-32 h-px" />

                                <div className="mb-4">
                                    <div className="text-xl font-semibold text-app-text">{cat.title}</div>
                                </div>

                                <div className="space-y-3">
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
                            </section>
                        ))}
                    </div>
                )}

                {/* Footer with logo on LEFT */}
                <footer className="mt-12 rounded-2xl border border-app-border bg-app-surface p-5">
                    <div className="flex items-center justify-between gap-4">
                        {/* Right side text (RTL) */}
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
                                            className="font-medium text-app-text inline-block text-left hover:underline"
                                        >
                                            @{profile.instagram.replace(/^@/, "")}
                                        </a>
                                    </div>
                                ) : (
                                    <div>اینستاگرام: …</div>
                                )}
                            </div>
                        </div>

                        {/* Left logo */}
                        <img
                            src={
                                profile?.logo_url
                                    ? resolveAssetUrl(profile.logo_url)
                                    : logo
                            }
                            alt={profile?.name || "لوگو"}
                            className="h-30 w-30 shrink-0 object-contain opacity-90"
                            loading="lazy"
                        />
                    </div>
                </footer>
            </main>

            <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
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
                "rounded-2xl border bg-app-surface p-4 transition",
                available ? "border-app-border" : "border-app-border opacity-60"
            )}
        >
            <div className="flex items-stretch gap-4">
                {/* Image on RIGHT (RTL) */}
                <div className="shrink-0 w-24 sm:w-28">
                    <div className="h-full w-full overflow-hidden rounded-xl bg-black/5">
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

                {/* Text + Price */}
                <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                            <div className="flex items-center gap-2">
                                <div className="truncate text-base font-semibold text-app-text">{title}</div>
                                {!available ? (
                                    <span className="shrink-0 rounded-full border border-app-border bg-app-soft px-2 py-0.5 text-xs text-app-muted">
                                        ناموجود
                                    </span>
                                ) : null}
                            </div>

                            {desc ? (
                                <div className="mt-1 text-sm leading-6 text-app-muted">{desc}</div>
                            ) : null}
                        </div>

                        {priceText ? (
                            <div className="shrink-0 self-center text-sm font-semibold tabular-nums text-app-text">
                                {priceText}
                            </div>
                        ) : (
                            <div className="shrink-0 self-center text-sm text-app-muted"></div>
                        )}
                    </div>
                </div>
            </div>
        </article>
    );
}
