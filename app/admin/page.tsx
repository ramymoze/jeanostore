"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Eye, EyeOff, Loader2 } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (data.success) {
        // Store a simple session flag (in a real app, use a proper session cookie / JWT)
        sessionStorage.setItem("admin_authenticated", "true");
        router.push("/admin/dashboard");
      } else {
        setError(data.message || "Login failed.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="admin-login-root">
      <div className="admin-login-card">
        {/* Header */}
        <div className="admin-login-header">
          <div className="admin-login-icon">
            <ShieldCheck size={32} />
          </div>
          <h1 className="admin-login-title">Admin Portal</h1>
          <p className="admin-login-subtitle">Jeanostar — Restricted Access</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="admin-login-form" id="admin-login-form">
          <div className="admin-input-group">
            <label htmlFor="admin-email" className="admin-label">
              Email / Username
            </label>
            <input
              id="admin-email"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="admin-input"
              placeholder="Enter admin email"
              required
              autoComplete="username"
            />
          </div>

          <div className="admin-input-group">
            <label htmlFor="admin-password" className="admin-label">
              Password
            </label>
            <div className="admin-password-wrapper">
              <input
                id="admin-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="admin-input"
                placeholder="Enter password"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                id="toggle-password-visibility"
                className="admin-eye-btn"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="admin-error" role="alert">
              {error}
            </div>
          )}

          <button
            id="admin-login-submit"
            type="submit"
            className="admin-submit-btn"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="admin-spinner" />
                Signing in…
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>
      </div>

      <style>{`
        .admin-login-root {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: radial-gradient(ellipse at top, #0f0f23 0%, #000000 60%);
          padding: 1.5rem;
        }

        .admin-login-card {
          width: 100%;
          max-width: 420px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 20px;
          padding: 2.5rem 2rem;
          backdrop-filter: blur(16px);
          box-shadow: 0 25px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08);
          animation: cardFadeIn 0.6s cubic-bezier(0.16,1,0.3,1) both;
        }

        @keyframes cardFadeIn {
          from { opacity: 0; transform: translateY(24px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)   scale(1); }
        }

        .admin-login-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .admin-login-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          margin-bottom: 1rem;
          box-shadow: 0 0 32px rgba(99,102,241,0.45);
          color: #fff;
        }

        .admin-login-title {
          font-size: 1.6rem;
          font-weight: 700;
          color: #fff;
          margin: 0 0 0.3rem;
          letter-spacing: -0.02em;
        }

        .admin-login-subtitle {
          font-size: 0.85rem;
          color: rgba(255,255,255,0.45);
          margin: 0;
        }

        .admin-login-form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .admin-input-group {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .admin-label {
          font-size: 0.82rem;
          font-weight: 500;
          color: rgba(255,255,255,0.6);
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }

        .admin-input {
          width: 100%;
          padding: 0.75rem 1rem;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 10px;
          color: #fff;
          font-size: 0.95rem;
          outline: none;
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
          box-sizing: border-box;
        }

        .admin-input::placeholder { color: rgba(255,255,255,0.25); }

        .admin-input:focus {
          border-color: #6366f1;
          background: rgba(99,102,241,0.08);
          box-shadow: 0 0 0 3px rgba(99,102,241,0.2);
        }

        .admin-password-wrapper {
          position: relative;
        }

        .admin-password-wrapper .admin-input {
          padding-right: 3rem;
        }

        .admin-eye-btn {
          position: absolute;
          right: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: rgba(255,255,255,0.4);
          cursor: pointer;
          padding: 0.25rem;
          display: flex;
          align-items: center;
          transition: color 0.2s;
        }

        .admin-eye-btn:hover { color: rgba(255,255,255,0.8); }

        .admin-error {
          background: rgba(239,68,68,0.12);
          border: 1px solid rgba(239,68,68,0.3);
          color: #fca5a5;
          font-size: 0.85rem;
          border-radius: 8px;
          padding: 0.65rem 1rem;
          text-align: center;
        }

        .admin-submit-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          width: 100%;
          padding: 0.85rem;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: #fff;
          border: none;
          border-radius: 10px;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
          box-shadow: 0 4px 20px rgba(99,102,241,0.4);
          margin-top: 0.5rem;
        }

        .admin-submit-btn:hover:not(:disabled) {
          opacity: 0.9;
          transform: translateY(-1px);
          box-shadow: 0 6px 28px rgba(99,102,241,0.55);
        }

        .admin-submit-btn:active:not(:disabled) { transform: scale(0.98); }
        .admin-submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        @keyframes spin { to { transform: rotate(360deg); } }
        .admin-spinner { animation: spin 0.8s linear infinite; }
      `}</style>
    </main>
  );
}
