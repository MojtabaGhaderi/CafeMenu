export default function Card({ children, className = "" }) {
    return (
        <div
            className={`rounded-2xl border border-app-border bg-app-surface p-5 ${className}`}
        >
            {children}
        </div>
    );
}
