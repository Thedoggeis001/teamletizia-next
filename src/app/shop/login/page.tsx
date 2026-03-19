"use client";

import { useState } from "react";
import { storeLogin, getStoreMe } from "@/lib/storeAuth";

export default function ShopLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userInfo, setUserInfo] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    try {
      await storeLogin(email, password);
      const user = await getStoreMe();
      setUserInfo(user);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    }
  }

  return (
    <div
      className="container"
      style={{
        minHeight: "70vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        className="card"
        style={{
          width: "100%",
          maxWidth: 420,
          padding: 28,
        }}
      >
        <h1 style={{ marginTop: 0, marginBottom: 20, textAlign: "center" }}>
          Store Login
        </h1>

        <form
          onSubmit={handleLogin}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <input
            className="input"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            className="input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button className="btn btn-primary">Login</button>
        </form>

        {error && (
          <p
            style={{
              color: "crimson",
              marginTop: 16,
              textAlign: "center",
            }}
          >
            {error}
          </p>
        )}

        {userInfo && (
          <div style={{ marginTop: 20 }}>
            <h2 style={{ textAlign: "center" }}>Logged user</h2>
            <pre
              style={{
                background: "rgba(255,255,255,0.05)",
                padding: 12,
                borderRadius: 10,
                fontSize: 13,
                overflow: "auto",
              }}
            >
              {JSON.stringify(userInfo, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}