import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    createItem,
    deleteItem,
    listCategories,
    listItems,
    updateItem,
    addItemImage,
    deleteItemImage,
    listItemImages,
    uploadItemImage,
    resolveAssetUrl,
} from "../api/api_admin";

import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

import StateLoading from "../../components/states/StateLoading";
import StateError from "../../components/states/StateError";
import StateEmpty from "../../components/states/StateEmpty";

function cn(...xs) {
    return xs.filter(Boolean).join(" ");
}

export default function AdminItems() {
    const qc = useQueryClient();

    const { data: cats, isLoading: catsLoading, error: catsErr } = useQuery({
        queryKey: ["admin-categories"],
        queryFn: listCategories,
    });

    const [filterCatId, setFilterCatId] = useState("");

    const { data: items, isLoading: itemsLoading, error: itemsErr } = useQuery({
        queryKey: ["admin-items", filterCatId || null],
        queryFn: () => listItems(filterCatId ? Number(filterCatId) : null),
        enabled: true,
    });

    const [err, setErr] = useState("");

    const createMut = useMutation({
        mutationFn: (payload) => createItem(payload),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-items"] }),
        onError: (e) => setErr(String(e.message || e)),
    });

    const delMut = useMutation({
        mutationFn: (id) => deleteItem(id),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-items"] }),
        onError: (e) => setErr(String(e.message || e)),
    });

    const rows = useMemo(() => (items || []).slice(), [items]);

    if (catsLoading) {
        return <StateLoading />;
    }

    if (catsErr) {
        return (
            <StateError
                message={String(catsErr)}
                onRetry={() => qc.invalidateQueries({ queryKey: ["admin-categories"] })}
            />
        );
    }

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h2 className="text-lg font-semibold tracking-tight">آیتم‌ها</h2>
                    <p className="mt-1 text-sm text-app-muted">
                        آیتم‌ها را مدیریت کنید: قیمت، موجودی، انتشار و تصاویر.
                    </p>
                </div>
            </div>

            {/* Filter + quick stats */}
            <Card className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                    <div className="text-sm font-semibold">فیلتر</div>
                    <div className="text-xs text-app-muted">
                        {itemsLoading ? "در حال بارگذاری…" : `${rows.length} آیتم`}
                    </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
                    <div className="space-y-1">
                        <div className="text-xs font-medium text-app-muted">دسته‌بندی</div>
                        <select
                            value={filterCatId}
                            onChange={(e) => setFilterCatId(e.target.value)}
                            className="w-full rounded-xl border border-app-border bg-app-surface px-3 py-2 text-sm outline-none transition focus:border-app-primary focus:ring-2 focus:ring-app-primary/20"
                        >
                            <option value="">همه</option>
                            {cats?.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.title}
                                </option>
                            ))}
                        </select>
                    </div>

                    <Button
                        variant="secondary"
                        onClick={() => setFilterCatId("")}
                        className="w-full sm:w-auto"
                        disabled={!filterCatId}
                    >
                        پاک کردن فیلتر
                    </Button>
                </div>

                {err ? <div className="text-sm text-red-500">{err}</div> : null}
            </Card>

            {/* Create */}
            <CreateItemCard
                cats={cats || []}
                isPending={createMut.isPending}
                onCreate={(p) => {
                    setErr("");
                    createMut.mutate(p);
                }}
            />

            {/* List */}
            <div className="space-y-3">
                {itemsLoading ? (
                    <StateLoading label="در حال بارگذاری آیتم‌ها…" />
                ) : itemsErr ? (
                    <StateError
                        message={String(itemsErr)}
                        onRetry={() =>
                            qc.invalidateQueries({ queryKey: ["admin-items", filterCatId || null] })
                        }
                    />
                ) : rows.length === 0 ? (
                    <StateEmpty title="آیتمی برای نمایش وجود ندارد." />
                ) : (
                    rows.map((it) => (
                        <ItemCard
                            key={it.id}
                            item={it}
                            cats={cats || []}
                            onDelete={() => {
                                const ok = window.confirm("این آیتم حذف شود؟");
                                if (!ok) return;
                                delMut.mutate(it.id);
                            }}
                        />
                    ))
                )}
            </div>
        </div>
    );
}

function CreateItemCard({ cats, onCreate, isPending }) {
    const [categoryId, setCategoryId] = useState(cats[0]?.id || "");
    const [title, setTitle] = useState("");
    const [price, setPrice] = useState(0);
    const [description, setDescription] = useState("");
    const [sortOrder, setSortOrder] = useState(0);

    const canSubmit = Boolean(categoryId) && title.trim().length > 0;

    return (
        <Card className="space-y-4">
            <div className="flex items-center justify-between gap-4">
                <div className="text-sm font-semibold">افزودن آیتم</div>
                {isPending ? (
                    <div className="text-xs text-app-muted">در حال افزودن…</div>
                ) : null}
            </div>

            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    if (!canSubmit) return;

                    onCreate({
                        category_id: Number(categoryId),
                        title: title.trim(),
                        price: Number(price),
                        description: description.trim() ? description.trim() : null,
                        sort_order: Number(sortOrder),
                        is_published: true,
                        is_available: true,
                    });

                    setTitle("");
                    setPrice(0);
                    setDescription("");
                    setSortOrder(0);
                }}
                className="space-y-4"
            >
                <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1">
                        <div className="text-xs font-medium text-app-muted">دسته‌بندی</div>
                        <select
                            value={categoryId}
                            onChange={(e) => setCategoryId(e.target.value)}
                            className="w-full rounded-xl border border-app-border bg-app-surface px-3 py-2 text-sm outline-none transition focus:border-app-primary focus:ring-2 focus:ring-app-primary/20"
                        >
                            {cats.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.title}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-1">
                        <div className="text-xs font-medium text-app-muted">عنوان</div>
                        <Input
                            placeholder="مثلا: لاته"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>

                    <div className="space-y-1">
                        <div className="text-xs font-medium text-app-muted">قیمت</div>
                        <Input
                            type="number"
                            inputMode="numeric"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            placeholder="مثلا: 98000"
                        />
                    </div>

                    <div className="space-y-1">
                        <div className="text-xs font-medium text-app-muted">Sort</div>
                        <Input
                            type="number"
                            inputMode="numeric"
                            value={sortOrder}
                            onChange={(e) => setSortOrder(e.target.value)}
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <div className="text-xs font-medium text-app-muted">توضیحات</div>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="اختیاری…"
                        className="w-full min-h-[90px] rounded-xl border border-app-border bg-app-surface px-3 py-2 text-sm outline-none transition focus:border-app-primary focus:ring-2 focus:ring-app-primary/20"
                    />
                </div>

                <Button type="submit" disabled={!canSubmit || isPending} className="w-full sm:w-auto">
                    افزودن
                </Button>
            </form>
        </Card>
    );
}

function ItemCard({ item, cats, onDelete }) {
    const qc = useQueryClient();

    const [title, setTitle] = useState(item.title);
    const [price, setPrice] = useState(item.price);
    const [description, setDescription] = useState(item.description || "");
    const [sortOrder, setSortOrder] = useState(item.sort_order);
    const [categoryId, setCategoryId] = useState(item.category_id);
    const [isPublished, setIsPublished] = useState(item.is_published);
    const [isAvailable, setIsAvailable] = useState(item.is_available);
    const [err, setErr] = useState("");

    const dirty =
        title.trim() !== (item.title ?? "").trim() ||
        Number(price) !== Number(item.price) ||
        (description.trim() || "") !== ((item.description ?? "").trim() || "") ||
        Number(sortOrder) !== Number(item.sort_order) ||
        Number(categoryId) !== Number(item.category_id) ||
        Boolean(isPublished) !== Boolean(item.is_published) ||
        Boolean(isAvailable) !== Boolean(item.is_available);

    const updMut = useMutation({
        mutationFn: (payload) => updateItem(item.id, payload),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-items"] }),
        onError: (e) => setErr(String(e.message || e)),
    });

    return (
        <Card className="space-y-4">
            {/* header row */}
            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                    <div className="text-sm font-semibold truncate">
                        #{item.id} — {item.title}
                    </div>
                    <div className="mt-1 text-xs text-app-muted">
                        {isPublished ? "منتشر" : "پیش‌نویس"} • {isAvailable ? "موجود" : "ناموجود"}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="secondary"
                        disabled={updMut.isPending || !dirty || !title.trim()}
                        onClick={() => {
                            setErr("");
                            updMut.mutate({
                                category_id: Number(categoryId),
                                title: title.trim(),
                                price: Number(price),
                                description: description.trim() ? description.trim() : null,
                                sort_order: Number(sortOrder),
                                is_published: isPublished,
                                is_available: isAvailable,
                            });
                        }}
                    >
                        {updMut.isPending ? "…" : "ذخیره"}
                    </Button>

                    <Button variant="danger" onClick={onDelete}>
                        حذف
                    </Button>
                </div>
            </div>

            {/* fields */}
            <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                    <div className="text-xs font-medium text-app-muted">دسته‌بندی</div>
                    <select
                        value={categoryId}
                        onChange={(e) => setCategoryId(Number(e.target.value))}
                        className="w-full rounded-xl border border-app-border bg-app-surface px-3 py-2 text-sm outline-none transition focus:border-app-primary focus:ring-2 focus:ring-app-primary/20"
                    >
                        {cats.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.title}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="space-y-1">
                    <div className="text-xs font-medium text-app-muted">عنوان</div>
                    <Input value={title} onChange={(e) => setTitle(e.target.value)} />
                </div>

                <div className="space-y-1">
                    <div className="text-xs font-medium text-app-muted">قیمت</div>
                    <Input
                        type="number"
                        inputMode="numeric"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                    />
                </div>

                <div className="space-y-1">
                    <div className="text-xs font-medium text-app-muted">Sort</div>
                    <Input
                        type="number"
                        inputMode="numeric"
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value)}
                    />
                </div>
            </div>

            <div className="space-y-1">
                <div className="text-xs font-medium text-app-muted">توضیحات</div>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full min-h-[80px] rounded-xl border border-app-border bg-app-surface px-3 py-2 text-sm outline-none transition focus:border-app-primary focus:ring-2 focus:ring-app-primary/20"
                />
            </div>

            {/* toggles */}
            <div className="flex flex-wrap items-center gap-4">
                <label className="inline-flex items-center gap-2 text-sm">
                    <input
                        type="checkbox"
                        checked={isPublished}
                        onChange={(e) => setIsPublished(e.target.checked)}
                        className="h-4 w-4 rounded border-app-border accent-app-primary"
                    />
                    منتشر
                </label>

                <label className="inline-flex items-center gap-2 text-sm">
                    <input
                        type="checkbox"
                        checked={isAvailable}
                        onChange={(e) => setIsAvailable(e.target.checked)}
                        className="h-4 w-4 rounded border-app-border accent-app-primary"
                    />
                    موجود
                </label>
            </div>

            <ItemImages itemId={item.id} />

            {err ? <div className="text-sm text-red-500">{err}</div> : null}
        </Card>
    );
}

function ItemImages({ itemId }) {
    const qc = useQueryClient();
    const [url, setUrl] = useState("");
    const [file, setFile] = useState(null);
    const [err, setErr] = useState("");

    const { data, isLoading } = useQuery({
        queryKey: ["item-images", itemId],
        queryFn: () => listItemImages(itemId),
    });

    const uploadMut = useMutation({
        mutationFn: (payload) => uploadItemImage(itemId, payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["item-images", itemId] });
            setFile(null);
        },
        onError: (e) => setErr(String(e.message || e)),
    });

    const addMut = useMutation({
        mutationFn: (payload) => addItemImage(itemId, payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["item-images", itemId] });
            setUrl("");
        },
        onError: (e) => setErr(String(e.message || e)),
    });

    const delMut = useMutation({
        mutationFn: (imageId) => deleteItemImage(imageId),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["item-images", itemId] }),
        onError: (e) => setErr(String(e.message || e)),
    });

    return (
        <div className="pt-3 border-t border-app-border/60 space-y-3">
            <div className="flex items-center justify-between gap-4">
                <div className="text-sm font-semibold">تصاویر</div>
                {isLoading ? <div className="text-xs text-app-muted">…</div> : null}
            </div>

            {/* Upload */}
            <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
                <div className="space-y-1">
                    <div className="text-xs font-medium text-app-muted">آپلود تصویر</div>
                    <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                        className="block w-full text-sm text-app-muted file:ml-3 file:rounded-xl file:border file:border-app-border file:bg-app-surface file:px-3 file:py-2 file:text-sm file:text-app-text"
                    />
                    {file ? (
                        <div className="text-xs text-app-muted">انتخاب شد: {file.name}</div>
                    ) : null}
                </div>

                <Button
                    variant="secondary"
                    onClick={() => {
                        setErr("");
                        if (!file) return;
                        uploadMut.mutate({ file, sort_order: 1 });
                    }}
                    disabled={!file || uploadMut.isPending}
                    className="w-full sm:w-auto"
                >
                    {uploadMut.isPending ? "در حال آپلود…" : "آپلود"}
                </Button>
            </div>

            {/* URL (optional, keep it) */}
            <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
                <div className="space-y-1">
                    <div className="text-xs font-medium text-app-muted">Image URL</div>
                    <Input
                        placeholder="https://..."
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                    />
                </div>

                <Button
                    variant="secondary"
                    onClick={() => {
                        setErr("");
                        const u = url.trim();
                        if (!u) return;
                        addMut.mutate({ url: u, sort_order: 1 });
                    }}
                    disabled={!url.trim() || addMut.isPending}
                    className="w-full sm:w-auto"
                >
                    افزودن
                </Button>
            </div>

            {err ? <div className="text-sm text-red-500">{err}</div> : null}

            <div className="flex flex-wrap gap-3">
                {(data || []).map((img) => (
                    <div
                        key={img.id}
                        className="w-[150px] rounded-xl border border-app-border bg-app-surface p-2"
                    >
                        <img
                            src={resolveAssetUrl(img.url)}
                            alt=""
                            className="h-[96px] w-full rounded-lg object-cover"
                            loading="lazy"
                        />
                        <Button
                            variant="danger"
                            className="mt-2 w-full"
                            onClick={() => delMut.mutate(img.id)}
                        >
                            حذف
                        </Button>
                    </div>
                ))}
            </div>
        </div>
    );
}
