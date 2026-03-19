"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function logout() {
    setLoading(true);
    await fetch("/api/admin/logout", { method: "POST" });
    setLoading(false);
    router.push("/admin/login");
    router.refresh();
  }

  return <button onClick={logout} disabled={loading}>{loading ? "..." : "Logout"}</button>;
}
