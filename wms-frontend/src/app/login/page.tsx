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
        <div className="rounded-[20px] border border-border bg-card backdrop-blur-[10px] p-7">
          {/* Logo */}
          <div className="flex flex-col items-center mb-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary mb-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-primary-foreground">
                <path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2zm-9 9H7v-4h4v4zm6 0h-4v-4h4v4zM20 7H4V5a2 2 0 012-2h12a2 2 0 012 2v2z" />
              </svg>
            </div>
            <h1 className="font-heading text-2xl font-bold text-foreground">
              W<span className="text-primary">M</span>S
            </h1>
            <p className="text-sm text-text2 mt-1">
              Warehouse Management System
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-[10px] bg-[rgba(248,113,113,0.15)] border border-[rgba(248,113,113,0.25)] p-3 text-sm text-destructive">
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
                className="rounded-[10px] bg-accent border-input focus:border-primary focus:ring-lime-glow h-10 text-sm"
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
                className="rounded-[10px] bg-accent border-input focus:border-primary focus:ring-lime-glow h-10 text-sm"
              />
            </div>
            <Button
              type="submit"
              className="w-full rounded-[10px] bg-primary text-primary-foreground font-semibold h-10 hover:bg-[#b5f03e] hover:-translate-y-px hover:shadow-[0_4px_16px_rgba(163,230,53,0.3)] transition-all"
              disabled={loading}
            >
              {loading ? "Masuk..." : "Masuk"}
            </Button>
            <div className="text-xs text-center text-text3 space-y-1">
              <p>Demo: admin@wms.test / password</p>
              <p>Demo: staff@wms.test / password</p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
