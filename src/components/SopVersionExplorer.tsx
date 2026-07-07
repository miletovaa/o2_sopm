"use client";

import { useState } from "react";
import { DocxViewer } from "@/components/DocxViewer";

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
  const currentVersionNumber = versions[0].versionNumber;
  const [selectedVersionNumber, setSelectedVersionNumber] =
    useState(currentVersionNumber);

  const selected =
    versions.find((v) => v.versionNumber === selectedVersionNumber) ??
    versions[0];
  const fileUrl = `/api/sops/${sopId}/versions/${selected.versionNumber}/file`;

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
        <a
          href={fileUrl}
          className="rounded border border-black/10 px-3 py-1 text-xs font-medium text-black hover:bg-black/5 dark:border-white/10 dark:text-zinc-50 dark:hover:bg-white/10"
        >
          Download this version (.docx)
        </a>
      </div>

      <DocxViewer src={fileUrl} />

      {showHistory && (
        <div className="mt-4 flex flex-col gap-2">
          <h2 className="text-sm font-semibold text-black dark:text-zinc-50">
            Version history
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Click a version to view it above.
          </p>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-black/10 text-xs uppercase text-zinc-500 dark:border-white/10 dark:text-zinc-400">
                <th className="py-2 pr-4">Version</th>
                <th className="py-2 pr-4">Date</th>
                <th className="py-2 pr-4">Author</th>
                <th className="py-2 pr-4">Change note</th>
                <th className="py-2">Download</th>
              </tr>
            </thead>
            <tbody>
              {versions.map((version) => {
                const isSelected =
                  version.versionNumber === selected.versionNumber;
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
                    <td className="py-2">
                      <a
                        href={`/api/sops/${sopId}/versions/${version.versionNumber}/file`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-black hover:underline dark:text-zinc-50"
                      >
                        Download
                      </a>
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
