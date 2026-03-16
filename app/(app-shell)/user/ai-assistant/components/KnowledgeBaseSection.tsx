import React from "react";

type KnowledgeTopic = {
  id: number;
  title: string;
  description: string;
  createdAt: string;
};

type KbForm = {
  id: number | null;
  title: string;
  description: string;
};

type Props = {
  isManagementBlocked: boolean;
  topicsLoading: boolean;
  topicsError: string | null;
  topics: KnowledgeTopic[];
  topicSaving: boolean;
  topicDeletingId: number | null;
  openNewTopicModal: () => void;
  openEditTopicModal: (topic: KnowledgeTopic) => void;
  handleTopicDelete: (id: number) => Promise<void>;
  isKbModalOpen: boolean;
  setIsKbModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  kbForm: KbForm;
  setKbForm: React.Dispatch<React.SetStateAction<KbForm>>;
  handleKbSubmit: (e: React.FormEvent) => Promise<void>;
};

export default function KnowledgeBaseSection({
  isManagementBlocked,
  topicsLoading,
  topicsError,
  topics,
  topicSaving,
  topicDeletingId,
  openNewTopicModal,
  openEditTopicModal,
  handleTopicDelete,
  isKbModalOpen,
  setIsKbModalOpen,
  kbForm,
  setKbForm,
  handleKbSubmit,
}: Props) {
  if (isManagementBlocked) return null;

  return (
    <>
      <section
        id="knowledge-base"
        className="bg-[#272727] rounded-2xl p-6 shadow-lg space-y-4"
      >
        <div className="flex items-center justify-between">
          <h3 className="font-semibold mb-2">AI Assistant Knowledge Base</h3>
          <button
            className="bg-blue-600 px-4 py-2 rounded-lg"
            onClick={openNewTopicModal}
            disabled={topicsLoading}
          >
            + Add New Topic
          </button>
        </div>

        {topicsError && <p className="text-sm text-red-400">{topicsError}</p>}

        <div className="space-y-3">
          {topicsLoading ? (
            <p className="text-sm text-gray-400">Loading topics...</p>
          ) : (
            topics.map((topic) => (
              <div
                key={topic.id}
                className="bg-gray-900 p-4 rounded-xl flex justify-between items-start gap-4"
              >
                <div>
                  <h4 className="font-semibold">{topic.title}</h4>
                  <p className="text-gray-400 text-sm mt-1">
                    {topic.description}
                  </p>
                  <p className="text-gray-500 text-xs mt-1">
                    Added:{" "}
                    {topic.createdAt
                      ? new Date(topic.createdAt).toLocaleDateString()
                      : "-"}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    className="bg-blue-500 px-3 py-1 rounded-lg text-xs disabled:opacity-60"
                    onClick={() => openEditTopicModal(topic)}
                    disabled={topicSaving || topicDeletingId === topic.id}
                  >
                    Edit
                  </button>
                  <button
                    className="bg-red-600 px-3 py-1 rounded-lg text-xs disabled:opacity-60"
                    onClick={() => void handleTopicDelete(topic.id)}
                    disabled={topicDeletingId === topic.id}
                  >
                    {topicDeletingId === topic.id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            ))
          )}

          {topics.length === 0 && (
            <p className="text-sm text-gray-400">
              No topics yet. Click &quot;Add New Topic&quot; to get started.
            </p>
          )}
        </div>
      </section>

      {isKbModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[#181818] rounded-2xl p-6 w-full max-w-lg space-y-4">
            <h3 className="text-lg font-semibold">
              {kbForm.id === null ? "Add New Topic" : "Edit Topic"}
            </h3>
            <form
              onSubmit={(e) => {
                void handleKbSubmit(e);
              }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <label className="text-sm text-gray-300">Subject</label>
                <input
                  className="bg-gray-900 p-3 rounded-lg w-full"
                  placeholder="Topic subject"
                  value={kbForm.title}
                  onChange={(e) =>
                    setKbForm((f) => ({ ...f, title: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-gray-300">Description</label>
                <textarea
                  className="bg-gray-900 p-3 rounded-lg w-full min-h-[120px]"
                  placeholder="Describe this topic so the AI can answer questions about it..."
                  value={kbForm.description}
                  onChange={(e) =>
                    setKbForm((f) => ({ ...f, description: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsKbModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-gray-800 text-sm"
                  disabled={topicSaving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 text-sm font-semibold"
                  disabled={topicSaving}
                >
                  {topicSaving
                    ? "Saving..."
                    : kbForm.id === null
                      ? "Add Topic"
                      : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
