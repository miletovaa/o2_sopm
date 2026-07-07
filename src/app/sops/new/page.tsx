import { prisma } from "@/lib/prisma";
import { NewSopForm } from "@/components/NewSopForm";

export default async function NewSopPage() {
  const [analysisTypes, foodCategories] = await Promise.all([
    prisma.analysisType.findMany({ orderBy: { name: "asc" } }),
    prisma.foodCategory.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-4 py-12">
      <h1 className="text-xl font-semibold text-black dark:text-zinc-50">
        Upload new SOP
      </h1>
      <NewSopForm
        analysisTypes={analysisTypes.map((a) => a.name)}
        foodCategories={foodCategories.map((f) => f.name)}
      />
    </div>
  );
}
