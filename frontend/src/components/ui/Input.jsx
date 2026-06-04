import clsx from "clsx";

export default function Input({ className = "", ...props }) {
    return (
        <input
            className={clsx(
                "w-full rounded-xl border border-app-border bg-app-surface px-3 py-2 text-sm outline-none transition",
                "focus:border-app-primary focus:ring-2 focus:ring-app-primary/20",
                className
            )}
            {...props}
        />
    );
}
