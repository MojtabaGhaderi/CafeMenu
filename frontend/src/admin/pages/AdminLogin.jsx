import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api/api_admin";
import { setToken } from "../auth/auth";

import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

export default function AdminLogin() {
    const nav = useNavigate();
    const [email, setEmail] = useState("admin@cafe.com");
    const [password, setPassword] = useState("admin1234");
    const [err, setErr] = useState("");

    async function onSubmit(e) {
        e.preventDefault();
        setErr("");

        try {
            const { access_token } = await login(email, password);
            setToken(access_token);
            nav("/admin", { replace: true });
        } catch (e2) {
            setErr(String(e2.message || e2));
        }
    }

    return (
        <div className="min-h-dvh flex items-center justify-center bg-app-bg px-4">
            <div className="w-full max-w-md">
                <Card className="space-y-6">

                    {/* Title */}
                    <div className="text-center">
                        <h1 className="text-xl font-semibold">ورود به پنل مدیریت</h1>
                        <p className="text-sm text-app-muted mt-2">
                            لطفاً اطلاعات ورود خود را وارد کنید
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={onSubmit} className="space-y-4">
                        <Input
                            label="ایمیل"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            type="email"
                            required
                        />

                        <Input
                            label="رمز عبور"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            type="password"
                            required
                        />

                        {err && (
                            <div className="text-sm text-red-500 text-center">
                                {err}
                            </div>
                        )}

                        <Button type="submit" fullWidth>
                            ورود
                        </Button>
                    </form>

                </Card>
            </div>
        </div>
    );
}
