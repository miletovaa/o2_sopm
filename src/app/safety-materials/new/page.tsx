import { NewSafetyMaterialForm } from "@/components/NewSafetyMaterialForm";

export default function NewSafetyMaterialPage() {
  return (
    <div className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-4 py-12">
      <h1 className="text-xl font-semibold text-black dark:text-zinc-50">
        Upload new safety material
      </h1>
      <NewSafetyMaterialForm />
    </div>
  );
}
