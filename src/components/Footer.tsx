import Link from "next/link";

export default function Footer() {
  return (
    <footer className="site-footer">
      © 2025 Team Letizia — All Rights Reserved {" | "}
      <Link href="/privacy">Privacy Policy</Link>
    </footer>
  );
}
