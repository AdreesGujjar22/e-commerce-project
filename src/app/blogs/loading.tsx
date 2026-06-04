import GlobalLoading from "@/src/components/ui/GlobalLoading";

export default function Loading() {
  return (
    <div>
      <GlobalLoading content={<span className="text-sm text-neutral-500">Loading blog posts...</span>} />
    </div>
  );
}