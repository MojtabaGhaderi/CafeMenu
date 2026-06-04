export default function StateLoading({ label = "در حال بارگذاری…" }) {
    return (
        <div className="rounded-2xl border border-app-border bg-app-surface p-4">
            <div className="flex items-center gap-3">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-app-border border-t-app-primary" />
                <div className="text-sm text-app-muted">{label}</div>
            </div>
        </div>
    );
}