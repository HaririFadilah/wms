"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/auth-context";
import { useState } from "react";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message || "Login gagal.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-border bg-card p-8 shadow-lg">
          <div className="flex flex-col items-center mb-7">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary shadow-md mb-4">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white">
                <rect x="2" y="7" width="20" height="14" rx="2" />
                <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
                <line x1="12" y1="11" x2="12" y2="17" />
                <line x1="9" y1="14" x2="15" y2="14" />
              </svg>
            </div>
            <h1 className="font-heading text-2xl font-bold text-foreground">
              W<span className="text-primary">M</span>S
            </h1>
            <p className="text-sm text-text2 mt-1">Warehouse Management System</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-text2 uppercase tracking-wider">Email</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@wms.test"
                required
                className="rounded-xl bg-muted/50 border-border focus:border-primary h-11 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-text2 uppercase tracking-wider">Password</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="password"
                required
                className="rounded-xl bg-muted/50 border-border focus:border-primary h-11 text-sm"
              />
            </div>
            <Button
              type="submit"
              className="w-full rounded-xl bg-primary text-white font-semibold h-11 hover:bg-green-600 transition-all shadow-md"
              disabled={loading}
            >
              {loading ? "Masuk..." : "Masuk"}
            </Button>
            <div className="text-xs text-center text-text3 space-y-1 pt-1">
              <p>Demo: admin@wms.test / password</p>
              <p>Demo: staff@wms.test / password</p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
