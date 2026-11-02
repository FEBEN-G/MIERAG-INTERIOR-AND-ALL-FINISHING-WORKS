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
    <Suspense fallback={<div className="min-h-[70svh]" />}>
      <ProjectDetailInner params={params} />
    </Suspense>
  );
}
