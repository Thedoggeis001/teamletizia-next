"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  clearStoreToken,
  getStoreMe,
  getStoreToken,
  storeLogin,
  storeLogout,
  storeRegister,
  type StoreUser,
} from "@/lib/storeAuth";

type Mode = "login" | "register";

export default function ShopAuthPanel() {
  const [mode, setMode] = useState<Mode>("login");
  const [loading, setLoading] = useState(false);
  const [booting, setBooting] = useState(true);
  const [user, setUser] = useState<StoreUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      if (!getStoreToken()) {
        if (mounted) setBooting(false);
        return;
      }

      try {
        const me = await getStoreMe();
        if (mounted) setUser(me);
      } catch {
        clearStoreToken();
        if (mounted) setUser(null);
      } finally {
        if (mounted) setBooting(false);
      }
    }

    loadUser();

    return () => {
      mounted = false;
    };
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      await storeLogin(email, password);
      const me = await getStoreMe();
      setUser(me);
      setPassword("");
      setMessage("Login effettuato con successo.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login fallito.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      await storeRegister(name, email, password, passwordConfirmation);
      const me = await getStoreMe();
      setUser(me);
      setPassword("");
      setPasswordConfirmation("");
      setMessage("Account creato con successo.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registrazione fallita.");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      await storeLogout();
      setUser(null);
      setMessage("Logout effettuato.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Logout fallito.");
    } finally {
      setLoading(false);
    }
  }

  if (booting) {
    return (
      <section className="relative overflow-hidden rounded-[32px] border border-white/10 bg-[#0b0b10] p-6 shadow-[0_18px_44px_rgba(0,0,0,0.45)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(233,30,99,0.22),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.06),transparent_26%)]" />
        <div className="absolute inset-[1px] rounded-[31px] border border-pink-500/15" />
        <div className="relative">
          <p className="text-sm text-white/70">Caricamento account...</p>
        </div>
      </section>
    );
  }

  if (user) {
    return (
      <section className="relative overflow-hidden rounded-[32px] border border-pink-500/20 bg-[#0b0b10] p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.03),0_18px_44px_rgba(0,0,0,0.45),0_0_40px_rgba(233,30,99,0.12)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(233,30,99,0.22),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.06),transparent_26%)]" />
        <div className="absolute inset-[1px] rounded-[31px] border border-pink-500/15" />

        <div className="relative">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-pink-500/30 bg-pink-500/12 text-xl font-bold text-white shadow-[0_12px_30px_rgba(233,30,99,0.25)]">
              {user.name?.slice(0, 1).toUpperCase() || "U"}
            </div>

            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/45">
                Account
              </p>
              <h3 className="mt-2 text-3xl font-bold text-white">{user.name}</h3>
              <p className="mt-1 break-all text-sm text-white/65">{user.email}</p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Link
              href="/account/orders"
              className="group relative overflow-hidden rounded-[24px] border border-pink-500/25 bg-gradient-to-br from-pink-500/16 to-pink-500/6 p-4 transition duration-200 hover:-translate-y-0.5 hover:border-pink-400/40 hover:shadow-[0_16px_30px_rgba(233,30,99,0.18)]"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.08),transparent_35%)] opacity-70" />
              <div className="relative">
                <div className="text-sm font-semibold text-white">I miei ordini</div>
                <div className="mt-1 text-xs leading-5 text-white/60">
                  Visualizza acquisti, dettagli e key digitali
                </div>
              </div>
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              disabled={loading}
              className="group relative overflow-hidden rounded-[24px] border border-white/12 bg-white/[0.03] p-4 text-left transition duration-200 hover:-translate-y-0.5 hover:bg-white/[0.06] disabled:opacity-60"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.05),transparent_35%)] opacity-70" />
              <div className="relative">
                <div className="text-sm font-semibold text-white">
                  {loading ? "Uscita..." : "Logout"}
                </div>
                <div className="mt-1 text-xs leading-5 text-white/60">
                  Esci dal tuo account store in sicurezza
                </div>
              </div>
            </button>
          </div>

          {message ? (
            <div className="mt-5 rounded-2xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-300">
              {message}
            </div>
          ) : null}

          {error ? (
            <div className="mt-5 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          ) : null}
        </div>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden rounded-[32px] border border-pink-500/20 bg-[#0b0b10] p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.03),0_18px_44px_rgba(0,0,0,0.45),0_0_40px_rgba(233,30,99,0.12)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(233,30,99,0.22),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.06),transparent_26%)]" />
      <div className="absolute inset-[1px] rounded-[31px] border border-pink-500/15" />

      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/45">
              Team Letizia Store
            </p>

            <h3 className="mt-3 text-3xl font-bold text-white">
              {mode === "login" ? "Bentornato" : "Crea il tuo account"}
            </h3>

            <p className="mt-3 max-w-md text-sm leading-7 text-white/65">
              Accedi per acquistare prodotti, visualizzare i tuoi ordini e gestire
              le key digitali del tuo profilo.
            </p>
          </div>

          <div className="hidden h-16 w-16 items-center justify-center rounded-2xl border border-pink-500/30 bg-pink-500/12 text-white shadow-[0_12px_30px_rgba(233,30,99,0.25)] sm:flex">
            <span className="text-xl font-bold">L</span>
          </div>
        </div>

        <div className="mt-6 inline-flex rounded-2xl border border-white/10 bg-black/25 p-1">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setError(null);
              setMessage(null);
            }}
            className={`rounded-xl px-5 py-2.5 text-sm font-semibold transition ${
              mode === "login"
                ? "bg-pink-600 text-white shadow-[0_10px_24px_rgba(233,30,99,0.28)]"
                : "text-white/75 hover:bg-white/10"
            }`}
          >
            Login
          </button>

          <button
            type="button"
            onClick={() => {
              setMode("register");
              setError(null);
              setMessage(null);
            }}
            className={`rounded-xl px-5 py-2.5 text-sm font-semibold transition ${
              mode === "register"
                ? "bg-pink-600 text-white shadow-[0_10px_24px_rgba(233,30,99,0.28)]"
                : "text-white/75 hover:bg-white/10"
            }`}
          >
            Register
          </button>
        </div>

        {mode === "login" ? (
          <form onSubmit={handleLogin} className="mt-6 grid gap-4">
            <div className="grid gap-2">
              <label className="text-xs font-medium uppercase tracking-[0.18em] text-white/45">
                Email
              </label>
              <input
                type="email"
                placeholder="tuamail@dominio.it"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-[22px] border border-white/10 bg-black/28 px-4 py-3.5 text-white outline-none placeholder:text-white/30 focus:border-pink-500/50"
                required
              />
            </div>

            <div className="grid gap-2">
              <label className="text-xs font-medium uppercase tracking-[0.18em] text-white/45">
                Password
              </label>
              <input
                type="password"
                placeholder="Inserisci la password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded-[22px] border border-white/10 bg-black/28 px-4 py-3.5 text-white outline-none placeholder:text-white/30 focus:border-pink-500/50"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-1 rounded-[22px] bg-pink-600 px-4 py-3.5 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(233,30,99,0.28)] transition hover:opacity-90 disabled:opacity-60"
            >
              {loading ? "Accesso..." : "Accedi"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="mt-6 grid gap-4">
            <div className="grid gap-2">
              <label className="text-xs font-medium uppercase tracking-[0.18em] text-white/45">
                Nome
              </label>
              <input
                type="text"
                placeholder="Il tuo nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded-[22px] border border-white/10 bg-black/28 px-4 py-3.5 text-white outline-none placeholder:text-white/30 focus:border-pink-500/50"
                required
              />
            </div>

            <div className="grid gap-2">
              <label className="text-xs font-medium uppercase tracking-[0.18em] text-white/45">
                Email
              </label>
              <input
                type="email"
                placeholder="tuamail@dominio.it"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-[22px] border border-white/10 bg-black/28 px-4 py-3.5 text-white outline-none placeholder:text-white/30 focus:border-pink-500/50"
                required
              />
            </div>

            <div className="grid gap-2">
              <label className="text-xs font-medium uppercase tracking-[0.18em] text-white/45">
                Password
              </label>
              <input
                type="password"
                placeholder="Crea una password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded-[22px] border border-white/10 bg-black/28 px-4 py-3.5 text-white outline-none placeholder:text-white/30 focus:border-pink-500/50"
                required
              />
            </div>

            <div className="grid gap-2">
              <label className="text-xs font-medium uppercase tracking-[0.18em] text-white/45">
                Conferma password
              </label>
              <input
                type="password"
                placeholder="Ripeti la password"
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                className="rounded-[22px] border border-white/10 bg-black/28 px-4 py-3.5 text-white outline-none placeholder:text-white/30 focus:border-pink-500/50"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-1 rounded-[22px] bg-pink-600 px-4 py-3.5 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(233,30,99,0.28)] transition hover:opacity-90 disabled:opacity-60"
            >
              {loading ? "Registrazione..." : "Crea account"}
            </button>
          </form>
        )}

        {message ? (
          <div className="mt-5 rounded-2xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-300">
            {message}
          </div>
        ) : null}

        {error ? (
          <div className="mt-5 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        ) : null}
      </div>
    </section>
  );
}