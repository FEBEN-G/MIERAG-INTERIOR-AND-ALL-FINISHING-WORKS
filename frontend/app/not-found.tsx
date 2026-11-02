import { ErrorView } from "@/components/layout/ErrorView";
import { PublicChrome } from "@/components/layout/PublicChrome";

export const metadata = {
  title: "Page not found",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <PublicChrome>
      <ErrorView kind="notFound" />
    </PublicChrome>
  );
}
