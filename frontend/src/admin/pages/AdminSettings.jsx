import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

import StateLoading from "../../components/states/StateLoading";
import StateError from "../../components/states/StateError";

import { getShopProfile, updateShopProfile } from "../api/api_admin";

export default function AdminSettings() {
    const qc = useQueryClient();

    const { data, isLoading, error } = useQuery({
        queryKey: ["admin-shop-profile"],
        queryFn: getShopProfile,
    });

    const [form, setForm] = useState({
        name: "",
        address: "",
        hours: "",
        instagram: "",
    });

    const [err, setErr] = useState("");

    useEffect(() => {
        if (!data) return;
        setForm({
            name: data.name || "",
            address: data.address || "",
            hours: data.hours || "",
            instagram: data.instagram || "",
        });
    }, [data]);

    const dirty = useMemo(() => {
        return (
            (form.name || "") !== (data?.name || "") ||
            (form.address || "") !== (data?.address || "") ||
            (form.hours || "") !== (data?.hours || "") ||
            (form.instagram || "") !== (data?.instagram || "")
        );
    }, [form, data]);

    const saveMut = useMutation({
        mutationFn: (payload) => updateShopProfile(payload),
        onSuccess: async () => {
            await qc.invalidateQueries({ queryKey: ["admin-shop-profile"] });
            await qc.invalidateQueries({ queryKey: ["shop-profile"] });
            setErr("");
            console.log("[AdminSettings] saved OK");
        },
        onError: (e) => {
            const msg = String(e?.message || e);
            setErr(msg);
            console.error("[AdminSettings] save failed:", msg);
        },
    });

    if (isLoading) return <StateLoading />;

    if (error) {
        return (
            <StateError
                message={String(error)}
                onRetry={() => qc.invalidateQueries({ queryKey: ["admin-shop-profile"] })}
            />
        );
    }

    const onSave = () => {
        setErr("");
        const payload = {
            name: form.name.trim() || null,
            address: form.address.trim() || null,
            hours: form.hours.trim() || null,
            instagram: form.instagram.trim() || null,
        };

        console.log("[AdminSettings] SAVE CLICKED", { payload, dirty, form, data });
        saveMut.mutate(payload);
    };

    return (
        <div className="space-y-5">
            <div>
                <h2 className="text-lg font-semibold tracking-tight">تنظیمات کافه</h2>
                <p className="mt-1 text-sm text-app-muted">
                    اطلاعات نمایش داده‌شده در فوتر منو را مدیریت کنید.
                </p>
            </div>

            <Card className="space-y-4">
                <form
                    className="space-y-4"
                    onSubmit={(e) => {
                        e.preventDefault();
                        onSave();
                    }}
                >
                    <div className="flex items-center justify-between gap-4">
                        <div className="text-sm font-semibold">اطلاعات تماس</div>

                        <Button
                            type="submit"
                            variant="secondary"
                            disabled={saveMut.isPending} // IMPORTANT: don't gate by dirty yet
                        >
                            {saveMut.isPending ? "…" : "ذخیره"}
                        </Button>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                        <Input
                            label="نام کافه"
                            placeholder="مثلاً: کافه استریت"
                            value={form.name}
                            onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
                        />

                        <Input
                            label="اینستاگرام"
                            placeholder="مثلاً: street.cafe"
                            value={form.instagram}
                            onChange={(e) =>
                                setForm((s) => ({ ...s, instagram: e.target.value }))
                            }
                            dir="ltr"
                            inputMode="text"
                            className="text-left"
                        />

                        <div className="sm:col-span-2">
                            <Input
                                label="آدرس"
                                placeholder="مثلاً: تهران، ..."
                                value={form.address}
                                onChange={(e) =>
                                    setForm((s) => ({ ...s, address: e.target.value }))
                                }
                            />
                        </div>

                        <div className="sm:col-span-2">
                            <Input
                                label="ساعت کاری"
                                placeholder="مثلاً: هر روز ۹ تا ۲۳"
                                value={form.hours}
                                onChange={(e) =>
                                    setForm((s) => ({ ...s, hours: e.target.value }))
                                }
                            />
                        </div>
                    </div>

                    {err ? <div className="text-sm text-red-500">{err}</div> : null}
                </form>
            </Card>
        </div>
    );
}