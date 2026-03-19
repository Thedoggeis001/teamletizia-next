import { ReactNode } from "react";
import { requireAdminForPage } from "@/lib/admin-auth";

export default async function AdminProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireAdminForPage();

  return <>{children}</>;
}
