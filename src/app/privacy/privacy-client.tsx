"use client";

import { useI18n } from "@/i18n/I18nProvider";

export default function PrivacyClient() {
  const { t } = useI18n();

  const title = t?.privacyPage?.title ?? "Privacy Policy";
  const note =
    t?.privacyPage?.note ??
    "This page is provided in English as the authoritative version. Translations may be added for convenience.";
  const lastUpdatedLabel = t?.privacyPage?.lastUpdated ?? "Last updated";

  return (
    <main style={{ padding: "120px 40px", maxWidth: "900px", margin: "0 auto" }}>
      <h1 style={{ marginBottom: "16px" }}>{title}</h1>

      <p style={{ fontSize: "14px", opacity: 0.75, marginBottom: "28px" }}>
        {note}
      </p>

      {/* --- Corpo LEGAL: lo lasciamo in inglese (autorevole) --- */}
      <p>
        This website (“Team Letizia”) respects your privacy and is committed to protecting
        your personal data in accordance with applicable data protection laws,
        including the General Data Protection Regulation (GDPR) and the Swiss Federal Act
        on Data Protection (nFADP).
      </p>

      <h2 style={{ marginTop: "40px" }}>1. Data Controller</h2>
      <p>
        Controller: [Simone Castaldo]<br />
        Contact email: [videogamesland4@gmail.com]<br />
        Country: Italy / Switzerland
      </p>

      <h2 style={{ marginTop: "40px" }}>2. Personal Data Collected</h2>
      <p>
        This website does not collect personal data for profiling, marketing,
        or advertising purposes.
      </p>
      <p>
        Personal data may only be processed when voluntarily provided by the user,
        for example through a contact form or direct email communication.
      </p>

      <h2 style={{ marginTop: "40px" }}>3. Cookies and Technical Data</h2>
      <p>
        This website uses only strictly necessary technical cookies required
        for proper functionality.
      </p>

      <h3 style={{ marginTop: "20px" }}>Language Preference Cookie</h3>
      <ul>
        <li>Name: <strong>tl_lang</strong></li>
        <li>Purpose: Stores the selected language preference</li>
        <li>Duration: Up to 12 months</li>
        <li>Legal basis: Legitimate interest (Art. 6(1)(f) GDPR)</li>
      </ul>

      <p>
        This cookie does not track users, does not collect personal information,
        and is not used for profiling.
      </p>

      <h3 style={{ marginTop: "20px" }}>Security and Session Cookies</h3>
      <p>
        The website may use technical session cookies necessary for security,
        authentication (if applicable), and protection against unauthorized access.
      </p>

      <h2 style={{ marginTop: "40px" }}>4. No Profiling or Tracking</h2>
      <p>This website does not use:</p>
      <ul>
        <li>Analytics tools with invasive tracking</li>
        <li>Advertising or marketing cookies</li>
        <li>Third-party tracking pixels</li>
        <li>Remarketing technologies</li>
      </ul>

      <h2 style={{ marginTop: "40px" }}>5. Data Retention</h2>
      <p>
        Personal data voluntarily provided by users will be retained only for the time
        necessary to respond to inquiries or fulfill the requested service,
        unless a longer retention period is required by law.
      </p>

      <h2 style={{ marginTop: "40px" }}>6. Your Rights</h2>
      <p>Under applicable data protection laws, you have the right to:</p>
      <ul>
        <li>Access your personal data</li>
        <li>Request correction or deletion</li>
        <li>Restrict or object to processing</li>
        <li>Request data portability (where applicable)</li>
      </ul>

      <p>
        To exercise these rights, please contact the Data Controller using the email address above.
      </p>

      <h2 style={{ marginTop: "40px" }}>7. Changes to This Policy</h2>
      <p>
        This Privacy Policy may be updated from time to time to reflect legal or technical changes.
        Any updates will be published on this page.
      </p>

      <p style={{ marginTop: "60px", fontSize: "14px", opacity: 0.7 }}>
        {lastUpdatedLabel}: {new Date().getFullYear()}
      </p>
    </main>
  );
}
