"use client";

import { AdminConsole } from "@/components/admin/AdminConsole";
import { isApiConfigured } from "@/lib/api/client";

export default function AdminPage() {
  if (!isApiConfigured()) {
    return (
      <div className="admin-app grid min-h-svh place-items-center bg-ivory px-6 text-ink">
        <div className="max-w-md">
          <h1 className="text-2xl font-medium">Studio</h1>
          <p className="mt-3 text-sm leading-7 text-ink/75">
            The studio cannot reach the server yet. Start the backend, then open this page again.
          </p>
        </div>
      </div>
    );
  }

  return <AdminConsole />;
}
