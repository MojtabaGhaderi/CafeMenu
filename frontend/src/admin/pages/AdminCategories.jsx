import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    createCategory,
    deleteCategory,
    listCategories,
    updateCategory,
} from "../api/api_admin";

import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

import StateLoading from "../../components/states/StateLoading";
import StateError from "../../components/states/StateError";
import StateEmpty from "../../components/states/StateEmpty";

function classNames(...xs) {
    return xs.filter(Boolean).join(" ");
}

export default function AdminCategories() {
    const qc = useQueryClient();
    const { data: cats, isLoading, error } = useQuery({
        queryKey: ["admin-categories"],
        queryFn: listCategories,
    });

    const [title, setTitle] = useState("");
    const [sortOrder, setSortOrder] = useState(0);
    const [err, setErr] = useState("");

    const createMut = useMutation({
        mutationFn: (payload) => createCategory(payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["admin-categories"] });
            setTitle("");
            setSortOrder(0);
        },
        onError: (e) => setErr(String(e.message || e)),
    });

    const delMut = useMutation({
        mutationFn: (id) => deleteCategory(id),
        onSuccess: () =>
            qc.invalidateQueries({ queryKey: ["admin-categories"] }),
        onError: (e) => setErr(String(e.message || e)),
    });

    const rows = useMemo(
        () =>
            (cats || [])
                .slice()
                .sort(
                    (a, b) => (a.sort_order - b.sort_order) || (a.id - b.id)
                ),
        [cats]
    );

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h2 className="text-lg font-semibold tracking-tight">
                        دسته‌بندی‌ها
                    </h2>
                    <p className="mt-1 text-sm text-app-muted">
                        ترتیب نمایش در منو با <span className="font-medium">Sort</span>{" "}
                        مشخص می‌شود.
                    </p>
                </div>
            </div>

            {/* Create */}
            <Card className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                    <div className="text-sm font-semibold">افزودن دسته‌بندی</div>
                    {createMut.isPending ? (
                        <div className="text-xs text-app-muted">در حال افزودن…</div>
                    ) : null}
                </div>

                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        setErr("");
                        const t = title.trim();
                        if (!t) return;
                        createMut.mutate({
                            title: t,
                            sort_order: Number(sortOrder),
                            is_active: true,
                        });
                    }}
                    className="grid gap-3 sm:grid-cols-[1fr_140px_auto]"
                >
                    <div className="space-y-1">
                        <div className="text-xs font-medium text-app-muted">عنوان</div>
                        <Input
                            placeholder="مثلا: صبحانه"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>

                    <div className="space-y-1">
                        <div className="text-xs font-medium text-app-muted">Sort</div>
                        <Input
                            type="number"
                            value={sortOrder}
                            onChange={(e) => setSortOrder(e.target.value)}
                            inputMode="numeric"
                        />
                    </div>

                    <div className="flex items-end">
                        <Button
                            type="submit"
                            disabled={createMut.isPending || !title.trim()}
                            className="w-full sm:w-auto"
                        >
                            افزودن
                        </Button>
                    </div>
                </form>

                {err ? (
                    <div className="text-sm text-red-500">{err}</div>
                ) : null}
            </Card>

            {/* List */}
            <div className="space-y-3">
                {isLoading ? (
                    <StateLoading />
                ) : error ? (
                    <StateError
                        message={String(error)}
                        onRetry={() =>
                            qc.invalidateQueries({ queryKey: ["admin-categories"] })
                        }
                    />
                ) : rows.length === 0 ? (
                    <StateEmpty title="هنوز دسته‌بندی‌ای ثبت نشده است." />
                ) : (
                    rows.map((c) => (
                        <CategoryRow
                            key={c.id}
                            cat={c}
                            onDelete={() => {
                                const ok = window.confirm("این دسته‌بندی حذف شود؟");
                                if (!ok) return;
                                delMut.mutate(c.id);
                            }}
                        />
                    ))
                )}
            </div>
        </div>
    );
}

function CategoryRow({ cat, onDelete }) {
    const qc = useQueryClient();

    const [editTitle, setEditTitle] = useState(cat.title);
    const [editSort, setEditSort] = useState(cat.sort_order);
    const [editActive, setEditActive] = useState(cat.is_active);
    const [err, setErr] = useState("");

    const dirty =
        editTitle.trim() !== (cat.title ?? "").trim() ||
        Number(editSort) !== Number(cat.sort_order) ||
        Boolean(editActive) !== Boolean(cat.is_active);

    const updMut = useMutation({
        mutationFn: (payload) => updateCategory(cat.id, payload),
        onSuccess: () =>
            qc.invalidateQueries({ queryKey: ["admin-categories"] }),
        onError: (e) => setErr(String(e.message || e)),
    });

    return (
        <Card className="space-y-4">
            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                    <div className="text-sm font-semibold text-app-text truncate">
                        #{cat.id} — {cat.title}
                    </div>
                    <div className="mt-1 text-xs text-app-muted">
                        وضعیت:{" "}
                        <span className={classNames(editActive ? "text-app-text" : "text-app-muted")}>
                            {editActive ? "فعال" : "غیرفعال"}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="secondary"
                        onClick={() => {
                            setErr("");
                            updMut.mutate({
                                title: editTitle.trim(),
                                sort_order: Number(editSort),
                                is_active: editActive,
                            });
                        }}
                        disabled={updMut.isPending || !dirty || !editTitle.trim()}
                    >
                        {updMut.isPending ? "…" : "ذخیره"}
                    </Button>

                    <Button variant="danger" onClick={onDelete}>
                        حذف
                    </Button>
                </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-[1fr_140px_auto]">
                <div className="space-y-1">
                    <div className="text-xs font-medium text-app-muted">عنوان</div>
                    <Input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                    />
                </div>

                <div className="space-y-1">
                    <div className="text-xs font-medium text-app-muted">Sort</div>
                    <Input
                        type="number"
                        value={editSort}
                        onChange={(e) => setEditSort(e.target.value)}
                        inputMode="numeric"
                    />
                </div>

                <div className="flex items-end">
                    <label className="inline-flex items-center gap-2 text-sm">
                        <input
                            type="checkbox"
                            checked={editActive}
                            onChange={(e) => setEditActive(e.target.checked)}
                            className="h-4 w-4 rounded border-app-border accent-app-primary"
                        />
                        فعال
                    </label>
                </div>
            </div>

            {err ? <div className="text-sm text-red-500">{err}</div> : null}
        </Card>
    );
}
