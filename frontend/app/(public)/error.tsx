"use client";

import { ErrorView } from "@/components/layout/ErrorView";

export default function PublicError({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return <ErrorView kind="error" onRetry={retry} />;
}
