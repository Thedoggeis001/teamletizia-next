import NewsFormClient from "../news-form-client";

export default function AdminNewsNewPage() {
  return (
    <div style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <h1>New News</h1>
      <NewsFormClient />
    </div>
  );
}
