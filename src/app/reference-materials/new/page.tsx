import { prisma } from "@/lib/prisma";
import { NewReferenceMaterialForm } from "@/components/NewReferenceMaterialForm";

export default async function NewReferenceMaterialPage() {
  const sops = await prisma.sop.findMany({
    orderBy: { title: "asc" },
    select: { id: true, title: true },
  });

  return (
    <div className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-4 py-12">
      <h1 className="text-xl font-semibold text-black dark:text-zinc-50">
        Upload new reference file
      </h1>
      <NewReferenceMaterialForm sops={sops} />
    </div>
  );
}
