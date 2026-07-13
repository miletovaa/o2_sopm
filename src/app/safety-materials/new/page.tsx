import { NewSafetyMaterialForm } from "@/components/NewSafetyMaterialForm";

export default function NewSafetyMaterialPage() {
  return (
    <div className="mx-auto my-8 flex w-full max-w-5xl flex-1 flex-col gap-4 px-4">
      <h1 className="text-xl font-semibold text-heading">
        Upload new safety material
      </h1>
      <div className="rounded-lg bg-white p-6 shadow-sm sm:p-8 dark:bg-zinc-900">
        <NewSafetyMaterialForm />
      </div>
    </div>
  );
}
