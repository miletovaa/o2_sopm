import { prisma } from "@/lib/prisma";

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
      <form
        action="/api/sops"
        method="post"
        encType="multipart/form-data"
        className="flex flex-col gap-4"
      >
        <label className="flex flex-col gap-1 text-sm text-zinc-700 dark:text-zinc-300">
          Title
          <input
            name="title"
            type="text"
            required
            className="rounded border border-black/10 bg-transparent px-3 py-2 text-black outline-none focus:border-black/40 dark:border-white/10 dark:text-zinc-50 dark:focus:border-white/40"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-zinc-700 dark:text-zinc-300">
          Analysis type
          <input
            name="analysisType"
            type="text"
            list="analysis-type-options"
            required
            placeholder="e.g. Isotope Analysis"
            className="rounded border border-black/10 bg-transparent px-3 py-2 text-black outline-none focus:border-black/40 dark:border-white/10 dark:text-zinc-50 dark:focus:border-white/40"
          />
          <datalist id="analysis-type-options">
            {analysisTypes.map((analysisType) => (
              <option key={analysisType.id} value={analysisType.name} />
            ))}
          </datalist>
          <span className="text-xs text-zinc-500">
            Pick an existing type or type a new one to create it.
          </span>
        </label>
        <label className="flex flex-col gap-1 text-sm text-zinc-700 dark:text-zinc-300">
          Food category
          <input
            name="foodCategory"
            type="text"
            list="food-category-options"
            required
            placeholder="e.g. Meat"
            className="rounded border border-black/10 bg-transparent px-3 py-2 text-black outline-none focus:border-black/40 dark:border-white/10 dark:text-zinc-50 dark:focus:border-white/40"
          />
          <datalist id="food-category-options">
            {foodCategories.map((foodCategory) => (
              <option key={foodCategory.id} value={foodCategory.name} />
            ))}
          </datalist>
          <span className="text-xs text-zinc-500">
            Pick an existing category or type a new one to create it.
          </span>
        </label>
        <label className="flex flex-col gap-1 text-sm text-zinc-700 dark:text-zinc-300">
          Word document (.docx)
          <input
            name="file"
            type="file"
            accept=".docx"
            required
            className="rounded border border-black/10 bg-transparent px-3 py-2 text-black outline-none focus:border-black/40 dark:border-white/10 dark:text-zinc-50 dark:focus:border-white/40"
          />
        </label>
        <button
          type="submit"
          className="mt-2 rounded bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
        >
          Upload
        </button>
      </form>
    </div>
  );
}
