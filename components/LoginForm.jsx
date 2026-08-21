"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "./LoginForm.module.css";

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.get("email"), password: form.get("password"), remember: form.get("remember") === "on" }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to sign in.");
      const requestedPath = searchParams.get("next");
      const destination = requestedPath?.startsWith("/dashboard") && !requestedPath.startsWith("//") ? requestedPath : "/dashboard";
      router.replace(destination);
      router.refresh();
    } catch (requestError) {
      setError(requestError.message || "Unable to sign in.");
      setSubmitting(false);
    }
  }

  return (
    <main className={`login-page-root ${styles.page}`}>
      <section className={styles.formSide}>
        <Link className={styles.brand} href="/" aria-label="MADX Sports home">
          <Image
            src="/images/common/logo2.png"
            alt="MADX Sports"
            width={210}
            height={84}
            priority
          />
        </Link>

        <div className={styles.formWrap}>
          <div className={styles.eyebrow}>
            <span /> Secure admin portal
          </div>
          <h1>Welcome back.</h1>
          <p className={styles.intro}>Sign in to manage your products, enquiries, and customer relationships.</p>

          <form className={styles.form} onSubmit={handleSubmit}>
            <label htmlFor="email">Email address</label>
            <div className={styles.field}>
              <Mail size={18} aria-hidden="true" />
              <input id="email" name="email" type="email" placeholder="admin@madxsports.com" autoComplete="email" required />
            </div>

            <div className={styles.passwordLabel}>
              <label htmlFor="password">Password</label>
              <Link href="/contact">Forgot password?</Link>
            </div>
            <div className={styles.field}>
              <LockKeyhole size={18} aria-hidden="true" />
              <input id="password" name="password" type={showPassword ? "text" : "password"} placeholder="Enter your password" autoComplete="current-password" required />
              <button type="button" className={styles.reveal} onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Hide password" : "Show password"}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <label className={styles.remember}>
              <input type="checkbox" name="remember" />
              <span>Keep me signed in on this device</span>
            </label>

            {error && <p className={styles.error} role="alert">{error}</p>}

            <button className={styles.submit} type="submit" disabled={submitting}>
              {submitting ? "Signing in…" : "Sign in to dashboard"} <ArrowRight size={18} />
            </button>
          </form>

          <div className={styles.help}>
            Having trouble signing in? <Link href="/contact">Contact support</Link>
          </div>
        </div>

        <Link className={styles.back} href="/">
          <ArrowLeft size={16} /> Back to madxsports.com
        </Link>
      </section>

      <aside className={styles.visual} aria-label="MADX Sports manufacturing">
        <div className={styles.grid} />
        <div className={styles.slash} />
        <div className={styles.visualContent}>
          <span className={styles.visualTag}>MADX operations</span>
          <blockquote>Built for fighters.<br />Managed with precision.</blockquote>
          <p>Your central command for products, clients, and global enquiries.</p>
        </div>
        <div className={styles.stats}>
          <div><strong>25+</strong><span>Years of craft</span></div>
          <div><strong>40+</strong><span>Global markets</span></div>
          <div><strong>100%</strong><span>Private label</span></div>
        </div>
      </aside>
    </main>
  );
}
