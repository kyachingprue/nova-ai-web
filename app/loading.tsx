import BrandMark from "@/components/BrandMark";

export default function Loading() {
  return (
    <main className="route-loading" role="status" aria-label="Loading page">
      <BrandMark />
      <span className="route-loading-name">Nova AI</span>
      <span className="route-loading-indicator" />
      <span className="sr-only">Loading page…</span>
    </main>
  );
}
