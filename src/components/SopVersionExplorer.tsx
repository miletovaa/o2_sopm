"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PdfViewer } from "@/components/PdfViewer";

export type VersionSummary = {
  versionNumber: number;
  uploadedAt: string;
  uploadedByUsername: string;
  changeNote: string | null;
};

export function SopVersionExplorer({
  sopId,
  versions,
  showHistory,
}: {
  sopId: string;
  versions: VersionSummary[];
  showHistory: boolean;
}) {
  const router = useRouter();
  const currentVersionNumber = versions[0].versionNumber;
  const [selectedVersionNumber, setSelectedVersionNumber] =
    useState(currentVersionNumber);
  const [deletingVersionNumber, setDeletingVersionNumber] = useState<
    number | null
  >(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const selected =
    versions.find((v) => v.versionNumber === selectedVersionNumber) ??
    versions[0];
  const fileUrl = `/api/sops/${sopId}/versions/${selected.versionNumber}/file`;
  const pdfUrl = `/api/sops/${sopId}/versions/${selected.versionNumber}/pdf`;

  async function handleDeleteVersion(versionNumber: number) {
    if (
      !confirm(`Delete version ${versionNumber}? This cannot be undone.`)
    ) {
      return;
    }
    setDeletingVersionNumber(versionNumber);
    setDeleteError(null);
    const response = await fetch(
      `/api/sops/${sopId}/versions/${versionNumber}`,
      { method: "DELETE" },
    );
    if (response.ok) {
      router.refresh();
    } else {
      const body = await response.json().catch(() => ({}));
      setDeleteError(body.error ?? "Failed to delete version.");
    }
    setDeletingVersionNumber(null);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Version {selected.versionNumber}
          {selected.versionNumber !== currentVersionNumber && " (superseded)"}
          {" — uploaded "}
          {new Date(selected.uploadedAt).toLocaleString()} by{" "}
          {selected.uploadedByUsername}
        </p>
        <div className="flex items-center gap-2">
          Download this version: 
          <a
            href={pdfUrl}
            download
            className="rounded border border-black/10 px-3 py-1 text-xs font-medium text-black hover:bg-black/5 dark:border-white/10 dark:text-zinc-50 dark:hover:bg-white/10"
          >
            PDF
          </a>
          <a
            href={fileUrl}
            className="rounded border border-black/10 px-3 py-1 text-xs font-medium text-black hover:bg-black/5 dark:border-white/10 dark:text-zinc-50 dark:hover:bg-white/10"
          >
            DOCX
          </a>
        </div>
      </div>

      <PdfViewer src={pdfUrl} />

      {showHistory && (
        <div className="mt-4 flex flex-col gap-2">
          <h2 className="text-sm font-semibold text-black dark:text-zinc-50">
            Version history
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Click a version to view it above.
          </p>
          {deleteError && (
            <p className="text-xs text-red-600 dark:text-red-400">
              {deleteError}
            </p>
          )}
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-black/10 text-xs uppercase text-zinc-500 dark:border-white/10 dark:text-zinc-400">
                <th className="py-2 pr-4">Version</th>
                <th className="py-2 pr-4">Date</th>
                <th className="py-2 pr-4">Author</th>
                <th className="py-2 pr-4">Change note</th>
                <th className="py-2 pr-4">Download</th>
                <th className="py-2">Delete</th>
              </tr>
            </thead>
            <tbody>
              {versions.map((version) => {
                const isSelected =
                  version.versionNumber === selected.versionNumber;
                const isOnlyVersion = versions.length <= 1;
                const isDeleting =
                  deletingVersionNumber === version.versionNumber;
                return (
                  <tr
                    key={version.versionNumber}
                    onClick={() =>
                      setSelectedVersionNumber(version.versionNumber)
                    }
                    aria-selected={isSelected}
                    className={`cursor-pointer border-b border-black/5 dark:border-white/5 ${
                      isSelected
                        ? "bg-zinc-100 dark:bg-zinc-800"
                        : "hover:bg-zinc-50 dark:hover:bg-zinc-900"
                    }`}
                  >
                    <td className="py-2 pr-4 text-zinc-700 dark:text-zinc-300">
                      v{version.versionNumber}
                      {version.versionNumber === currentVersionNumber && (
                        <span className="ml-2 rounded bg-zinc-200 px-1.5 py-0.5 text-xs text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200">
                          current
                        </span>
                      )}
                    </td>
                    <td className="py-2 pr-4 text-zinc-700 dark:text-zinc-300">
                      {new Date(version.uploadedAt).toLocaleString()}
                    </td>
                    <td className="py-2 pr-4 text-zinc-700 dark:text-zinc-300">
                      {version.uploadedByUsername}
                    </td>
                    <td className="py-2 pr-4 text-zinc-700 dark:text-zinc-300">
                      {version.changeNote ?? "—"}
                    </td>
                    <td className="py-2 pr-4">
                      <div className="flex items-center gap-2">
                        <a
                          href={`/api/sops/${sopId}/versions/${version.versionNumber}/pdf`}
                          download
                          onClick={(e) => e.stopPropagation()}
                          className="rounded border border-black/10 px-2 py-0.5 text-xs font-medium text-black hover:bg-black/5 dark:border-white/10 dark:text-zinc-50 dark:hover:bg-white/10"
                        >
                          PDF
                        </a>
                        <a
                          href={`/api/sops/${sopId}/versions/${version.versionNumber}/file`}
                          onClick={(e) => e.stopPropagation()}
                          className="rounded border border-black/10 px-2 py-0.5 text-xs font-medium text-black hover:bg-black/5 dark:border-white/10 dark:text-zinc-50 dark:hover:bg-white/10"
                        >
                          DOCX
                        </a>
                      </div>
                    </td>
                    <td className="py-2">
                      <button
                        type="button"
                        disabled={isOnlyVersion || isDeleting}
                        title={
                          isOnlyVersion
                            ? "Can't delete the only version — delete the SOP instead"
                            : undefined
                        }
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteVersion(version.versionNumber);
                        }}
                        className="text-red-600 hover:underline disabled:cursor-not-allowed disabled:text-zinc-400 disabled:no-underline dark:text-red-400 dark:disabled:text-zinc-600"
                      >
                        {isDeleting ? "Deleting…" : "Delete"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
