import Button from "../ui/Button";

export default function StateEmpty({
    title = "چیزی برای نمایش وجود ندارد",
    message,
    actionLabel,
    onAction,
}) {
    return (
        <div className="rounded-2xl border border-app-border bg-app-surface p-4 text-center">
            <div className="text-sm font-semibold text-app-text">{title}</div>
            {message ? <div className="mt-1 text-sm text-app-muted">{message}</div> : null}

            {actionLabel && onAction ? (
                <div className="mt-3 flex justify-center">
                    <Button variant="secondary" onClick={onAction}>
                        {actionLabel}
                    </Button>
                </div>
            ) : null}
        </div>
    );
}