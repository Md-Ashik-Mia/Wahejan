import React from "react";

type TrainingFile = {
  id: number;
  file: string;
  uploaded_at: string | null;
  company: number | null;
};

type Props = {
  isManagementBlocked: boolean;
  toneInput: string;
  setToneInput: React.Dispatch<React.SetStateAction<string>>;
  toneSaving: boolean;
  companyLoading: boolean;
  handleToneSave: () => Promise<void>;
  handleFileClick: () => void;
  handleDragOverFiles: (e: React.DragEvent<HTMLDivElement>) => void;
  handleDropFiles: (e: React.DragEvent<HTMLDivElement>) => void;
  trainingUploading: boolean;
  trainingError: string | null;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleFilesSelected: (e: React.ChangeEvent<HTMLInputElement>) => void;
  trainingFiles: TrainingFile[];
  trainingFilesLoading: boolean;
  trainingFilesError: string | null;
  trainingFileDeletingId: number | null;
  handleDeleteTrainingFile: (id: number) => Promise<void>;
  filenameFromPath: (path: string) => string;
};

export default function ToneTrainingSection({
  isManagementBlocked,
  toneInput,
  setToneInput,
  toneSaving,
  companyLoading,
  handleToneSave,
  handleFileClick,
  handleDragOverFiles,
  handleDropFiles,
  trainingUploading,
  trainingError,
  fileInputRef,
  handleFilesSelected,
  trainingFiles,
  trainingFilesLoading,
  trainingFilesError,
  trainingFileDeletingId,
  handleDeleteTrainingFile,
  filenameFromPath,
}: Props) {
  if (isManagementBlocked) return null;

  return (
    <section className="bg-[#272727] rounded-2xl p-6 shadow-lg grid md:grid-cols-2 gap-6">
      <div>
        <h3 className="font-semibold mb-2">Tone & Personality</h3>
        <p className="text-sm text-gray-300">
          Enter how the AI should speak for your brand.
        </p>

        <div className="mt-3 flex gap-2">
          <input
            className="bg-gray-900 p-3 rounded-lg w-full"
            placeholder="e.g. formal, friendly, polite"
            value={toneInput}
            onChange={(e) => setToneInput(e.target.value)}
            disabled={toneSaving || companyLoading}
          />
          <button
            type="button"
            onClick={() => void handleToneSave()}
            disabled={toneSaving || companyLoading}
            className="bg-blue-600 px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-60"
          >
            {toneSaving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-2">Train AI</h3>
        <p className="text-sm text-gray-300">
          Upload files to train your assistant.
        </p>

        <div
          onClick={handleFileClick}
          onDragOver={handleDragOverFiles}
          onDrop={handleDropFiles}
          className="mt-3 border-2 border-dashed border-gray-900 rounded-xl p-6 cursor-pointer hover:bg-gray-900/40"
        >
          <div className="text-center">
            <p className="font-medium">Drag files here, or click to browse</p>
            <p className="text-gray-400 text-sm mt-2">
              Supports PDF, DOCX, CSV (max 10MB each)
            </p>
            {trainingUploading && (
              <p className="text-gray-400 text-sm mt-2">Uploading...</p>
            )}
            {trainingError && (
              <p className="text-red-400 text-sm mt-2">{trainingError}</p>
            )}
          </div>
        </div>

        <input
          type="file"
          multiple
          ref={fileInputRef}
          onChange={handleFilesSelected}
          accept=".pdf,.doc,.docx,.csv"
          className="hidden"
        />

        <div className="mt-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-200">
              Uploaded files
            </p>
            <p className="text-xs text-gray-400">{trainingFiles.length}</p>
          </div>

          {trainingFilesError && (
            <p className="text-sm text-red-400 mt-2">{trainingFilesError}</p>
          )}

          <div className="mt-3 rounded-xl bg-gray-900">
            {trainingFilesLoading ? (
              <p className="text-sm text-gray-400 p-4">Loading...</p>
            ) : trainingFiles.length === 0 ? (
              <p className="text-sm text-gray-400 p-4">
                No files uploaded yet.
              </p>
            ) : (
              <div className="max-h-56 overflow-y-auto">
                <table className="w-full text-left text-sm">
                  <thead className="sticky top-0 bg-gray-900">
                    <tr className="text-gray-400 border-b border-gray-800">
                      <th className="py-2 px-3">File</th>
                      <th className="py-2 px-3 whitespace-nowrap">Uploaded</th>
                      <th className="py-2 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trainingFiles.map((tf) => (
                      <tr key={tf.id} className="border-b border-gray-800">
                        <td className="py-2 px-3">
                          <p className="text-gray-200 truncate" title={tf.file}>
                            {filenameFromPath(tf.file)}
                          </p>
                        </td>
                        <td className="py-2 px-3 whitespace-nowrap text-gray-400">
                          {tf.uploaded_at
                            ? new Date(tf.uploaded_at).toLocaleDateString()
                            : "-"}
                        </td>
                        <td className="py-2 px-3">
                          <div className="flex justify-end">
                            <button
                              type="button"
                              disabled={trainingFileDeletingId === tf.id}
                              onClick={() =>
                                void handleDeleteTrainingFile(tf.id)
                              }
                              className="text-xs bg-red-600 px-3 py-1 rounded-lg"
                            >
                              {trainingFileDeletingId === tf.id
                                ? "Deleting..."
                                : "Delete"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
