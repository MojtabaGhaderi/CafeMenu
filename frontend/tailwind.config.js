/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
    theme: {
        extend: {
            colors: {
                app: {
                    bg: "#374151",        // darker elephant
                    surface: "#FAFAFA",   // light cards

                    text: "#111827",
                    muted: "#6B7280",

                    border: "rgba(0,0,0,0.10)",

                    primary: "#374151",
                    primaryText: "#FFFFFF",

                    soft: "rgba(0,0,0,0.05)",
                },
            },
            fontFamily: {
                sans: ["Iran Sans", "sans-serif"],
            },

        },
    },
    plugins: [],
};
