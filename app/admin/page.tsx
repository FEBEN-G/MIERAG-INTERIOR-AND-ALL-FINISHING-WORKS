"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  adminLogout,
  getAdminApplications,
  getAdminMe,
  updateApplicationStatus,
  type AdminApplication,
} from "@/lib/api/applications";
import { APPLICATION_STATUSES } from "@/types";
import { Button } from "@/components/ui/ButtonLink";
import { formatDate } from "@/lib/utils";

export default function AdminPage() {
  const router = useRouter();
  const [rows, setRows] = useState<AdminApplication[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAdminMe()
      .then(() => getAdminApplications().then(setRows))
      .catch(() => router.replace("/admin/login"));
  }, [router]);

  return (
    <div className="px-6 py-28 md:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between gap-4">
          <h1 className="font-display text-4xl font-light">Applications</h1>
          <Button
            variant="line"
            onClick={async () => {
              await adminLogout().catch(() => undefined);
              router.push("/admin/login");
            }}
          >
            Sign out
          </Button>
        </div>
        {error ? <p className="mt-6 text-sm text-error">{error}</p> : null}
        <div className="mt-10 overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="text-[11px] uppercase tracking-[0.16em] text-muted">
              <tr>
                <th className="py-3">Applicant</th>
                <th>Project</th>
                <th>Skill</th>
                <th>Rate</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-t border-line">
                  <td className="py-4">
                    {row.fullName}
                    <div className="text-muted">{row.phoneNumber}</div>
                    <div className="text-[11px] text-muted">{formatDate(row.createdAt)}</div>
                  </td>
                  <td>
                    {row.site.name}
                    <div className="text-muted">{row.site.address}</div>
                  </td>
                  <td>{row.skill.name}</td>
                  <td>{row.expectedRate} ETB</td>
                  <td>
                    <select
                      value={row.status}
                      className="field"
                      onChange={async (event) => {
                        try {
                          await updateApplicationStatus(row.id, event.target.value as AdminApplication["status"]);
                          setRows((current) =>
                            current.map((item) =>
                              item.id === row.id
                                ? { ...item, status: event.target.value as AdminApplication["status"] }
                                : item,
                            ),
                          );
                        } catch (err) {
                          setError(err instanceof Error ? err.message : "Status could not be updated.");
                        }
                      }}
                    >
                      {APPLICATION_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
