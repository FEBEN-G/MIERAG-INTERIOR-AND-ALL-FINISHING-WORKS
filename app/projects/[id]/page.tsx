import { Suspense } from "react";
import { ProjectDetailView } from "@/components/projects/ProjectDetailView";

async function ProjectDetailInner({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ProjectDetailView id={id} />;
}

export default function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<p className="px-6 py-32 text-sm text-muted">Loading project…</p>}>
      <ProjectDetailInner params={params} />
    </Suspense>
  );
}
