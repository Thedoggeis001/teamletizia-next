"use client";

import styles from "./page.module.css";
import { useRef, useState } from "react";
import { useI18n } from "@/i18n/I18nProvider";

type Status = "idle" | "loading" | "success" | "error";

export default function ContactClient() {
  const { t } = useI18n();
  const formRef = useRef<HTMLFormElement | null>(null);

  const [status, setStatus] = useState<Status>("idle");
  const [errorText, setErrorText] = useState<string>("");

  const title = t?.contact?.title ?? "Contact Us";
  const subtitle = t?.contact?.subtitle ?? "Get in touch with Team Letizia";
  const sectionTitle = t?.contact?.sectionTitle ?? "Send a Message";

  const namePlaceholder = t?.contact?.namePlaceholder ?? "Your Name";
  const emailPlaceholder = t?.contact?.emailPlaceholder ?? "Your Email";
  const messagePlaceholder = t?.contact?.messagePlaceholder ?? "Your Message";
  const sendLabel = t?.contact?.send ?? "Send";

  const successMsg = t?.contact?.success ?? "Message sent successfully!";
  const errorMsg = t?.contact?.error ?? "Error sending message. Please try again.";
  const rateLimitMsg =
    (t as any)?.contact?.rateLimit ?? "Too many requests. Please wait and try again.";

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "loading") return;

    setStatus("loading");
    setErrorText("");

    const form = e.currentTarget;
    const fd = new FormData(form);

    const payload = {
      name: String(fd.get("name") ?? ""),
      email: String(fd.get("email") ?? ""),
      message: String(fd.get("message") ?? ""),
      website: String(fd.get("website") ?? ""), // honeypot
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data?.ok) {
        if (res.status === 429) {
          setStatus("error");
          setErrorText(rateLimitMsg);
          return;
        }
        setStatus("error");
        setErrorText(data?.error ?? errorMsg);
        return;
      }

      setStatus("success");
      formRef.current?.reset();
    } catch {
      setStatus("error");
      setErrorText(errorMsg);
    }
  }

  return (
    <div className={styles.page}>
      <section className="page-header">
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </section>

      <section className="contact-section">
        <h2>{sectionTitle}</h2>

        <form ref={formRef} onSubmit={onSubmit}>
          {/* Honeypot (campo invisibile) */}
          <div className="hp-wrap" aria-hidden="true">
            <label htmlFor="website">Website</label>
            <input
              id="website"
              name="website"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              className="hp-field"
            />
          </div>

          <input type="text" name="name" placeholder={namePlaceholder} required />
          <input type="email" name="email" placeholder={emailPlaceholder} required />
          <textarea name="message" rows={6} placeholder={messagePlaceholder} required />

          <button type="submit" disabled={status === "loading"}>
            {status === "loading" ? "Sending..." : sendLabel}
          </button>

          <div className="form-status" aria-live="polite">
            {status === "success" && <p className="success">{successMsg}</p>}
            {status === "error" && <p className="error">{errorText}</p>}
          </div>
        </form>

        <div className="social-links">
          <a href="https://x.com/Teamletizia" target="_blank" rel="noreferrer">
            <i className="fab fa-x-twitter"></i>
          </a>
          <a
            href="https://www.youtube.com/@KontemplativerMystiker"
            target="_blank"
            rel="noreferrer"
          >
            <i className="fab fa-youtube"></i>
          </a>
        </div>
      </section>
    </div>
  );
}
