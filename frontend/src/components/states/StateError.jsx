import Button from "../ui/Button";

export default function StateError({
  title = "مشکلی پیش آمد",
  message = "لطفاً دوباره تلاش کنید.",
  onRetry,
}) {
  return (
    <div className="rounded-2xl border border-app-border bg-app-surface p-4">
      <div className="text-sm font-semibold text-app-text">{title}</div>
      <div className="mt-1 text-sm text-app-muted">{message}</div>

      {onRetry ? (
        <div className="mt-3">
          <Button variant="secondary" onClick={onRetry}>
            تلاش مجدد
          </Button>
        </div>
      ) : null}
    </div>
  );
}