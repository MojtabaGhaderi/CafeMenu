import clsx from "clsx";

export default function Button({
    children,
    variant = "primary",
    className = "",
    ...props
}) {
    const base =
        "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition";

    const variants = {
        primary:
            "bg-app-primary text-app-primaryText border border-app-primary hover:opacity-90",
        secondary:
            "bg-app-surface text-app-text border border-app-border hover:bg-black/5",
        danger:
            "bg-red-600 text-white border border-red-600 hover:opacity-90",
    };

    return (
        <button
            className={clsx(base, variants[variant], className)}
            {...props}
        >
            {children}
        </button>
    );
}
