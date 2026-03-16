import React from "react";

type OpeningSlot = {
  id: string | number;
  day: string;
  start: string;
  end: string;
};

type CompanyForm = {
  name: string;
  industry: string;
  description: string;
  address: string;
  city: string;
  country: string;
  website: string;
  greeting: string;
  concurrent_booking_limit: number;
};

type OpeningForm = {
  id: string | number | null;
  day: string;
  start: string;
  end: string;
};

type DayOption = {
  code: string;
  label: string;
};

type Props = {
  isBlocked: boolean;
  companyForm: CompanyForm;
  setCompanyForm: React.Dispatch<React.SetStateAction<CompanyForm>>;
  companyError: string | null;
  companyLoading: boolean;
  handleCompanyUpdate: () => Promise<void>;
  openingSlots: OpeningSlot[];
  openingLoading: boolean;
  openingError: string | null;
  openingForm: OpeningForm;
  setOpeningForm: React.Dispatch<React.SetStateAction<OpeningForm>>;
  handleOpeningSubmit: (e: React.FormEvent) => Promise<void>;
  handleOpeningEdit: (slot: OpeningSlot) => void;
  handleOpeningDelete: (id: string | number) => Promise<void>;
  dayOptions: readonly DayOption[];
  dayLabel: Record<string, string>;
};

export default function CompanyAndHoursSection({
  isBlocked,
  companyForm,
  setCompanyForm,
  companyError,
  companyLoading,
  handleCompanyUpdate,
  openingSlots,
  openingLoading,
  openingError,
  openingForm,
  setOpeningForm,
  handleOpeningSubmit,
  handleOpeningEdit,
  handleOpeningDelete,
  dayOptions,
  dayLabel,
}: Props) {
  if (isBlocked) return null;

  return (
    <section className="bg-[#272727] rounded-2xl p-6 shadow-lg space-y-6">
      <h2 className="text-xl font-semibold">AI Assistant</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          className="bg-gray-900 p-3 rounded-lg"
          placeholder="Company name here"
          value={companyForm.name}
          onChange={(e) =>
            setCompanyForm((f) => ({ ...f, name: e.target.value }))
          }
        />

        <input
          className="bg-gray-900 p-3 rounded-lg"
          placeholder="Industry (e.g. Healthcare)"
          value={companyForm.industry}
          onChange={(e) =>
            setCompanyForm((f) => ({ ...f, industry: e.target.value }))
          }
        />

        <textarea
          className="col-span-1 md:col-span-2 bg-gray-900 p-3 rounded-lg"
          placeholder="What does your company do?"
          value={companyForm.description}
          onChange={(e) =>
            setCompanyForm((f) => ({ ...f, description: e.target.value }))
          }
        />

        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-gray-300 ml-1">
            AI Greeting
          </label>
          <input
            className="bg-gray-900 p-3 rounded-lg"
            placeholder="e.g. Assalamu Alaikum"
            value={companyForm.greeting}
            onChange={(e) =>
              setCompanyForm((f) => ({ ...f, greeting: e.target.value }))
            }
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-gray-300 ml-1">
            Concurrent Booking Limit
          </label>
          <input
            type="number"
            min={1}
            className="bg-gray-900 p-3 rounded-lg"
            placeholder="1"
            value={companyForm.concurrent_booking_limit}
            onChange={(e) =>
              setCompanyForm((f) => ({
                ...f,
                concurrent_booking_limit: Number(e.target.value),
              }))
            }
          />
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-2">Location</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            className="bg-gray-900 p-3 rounded-lg"
            placeholder="Address"
            value={companyForm.address}
            onChange={(e) =>
              setCompanyForm((f) => ({ ...f, address: e.target.value }))
            }
          />
          <input
            className="bg-gray-900 p-3 rounded-lg"
            placeholder="City"
            value={companyForm.city}
            onChange={(e) =>
              setCompanyForm((f) => ({ ...f, city: e.target.value }))
            }
          />
          <input
            className="bg-gray-900 p-3 rounded-lg"
            placeholder="Country"
            value={companyForm.country}
            onChange={(e) =>
              setCompanyForm((f) => ({ ...f, country: e.target.value }))
            }
          />
        </div>

        <div className="mt-3">
          <h4 className="font-semibold mb-1 text-sm">Website URL</h4>
          <input
            className="bg-gray-900 p-3 rounded-lg w-full"
            placeholder="https://your-company.com"
            value={companyForm.website}
            onChange={(e) =>
              setCompanyForm((f) => ({ ...f, website: e.target.value }))
            }
          />
        </div>
      </div>

      {companyError && (
        <div className="text-sm text-red-400">{companyError}</div>
      )}

      <button
        type="button"
        onClick={() => void handleCompanyUpdate()}
        disabled={companyLoading}
        className="mt-2 bg-blue-600 px-6 py-2 rounded-lg disabled:opacity-60"
      >
        {companyLoading ? "Updating..." : "Update"}
      </button>

      <div>
        <h3 className="font-semibold mb-2">Opening Hours</h3>

        {openingError && (
          <div className="mb-3 text-sm text-red-400">{openingError}</div>
        )}

        <div className="flex flex-wrap gap-3 mb-4">
          {openingSlots.map((slot) => (
            <div
              key={slot.id}
              className="bg-gray-900 px-4 py-3 rounded-xl flex items-center gap-3"
            >
              <div>
                <div className="font-semibold">
                  {dayLabel[slot.day] ?? slot.day}
                </div>
                <div className="text-sm text-gray-300">
                  {slot.start} - {slot.end}
                </div>
              </div>
              <div className="flex gap-2 ml-4">
                <button
                  type="button"
                  onClick={() => handleOpeningEdit(slot)}
                  disabled={openingLoading}
                  className="text-xs bg-blue-600 px-3 py-1 rounded-lg"
                >
                  Update
                </button>
                <button
                  type="button"
                  onClick={() => void handleOpeningDelete(slot.id)}
                  disabled={openingLoading}
                  className="text-xs bg-red-600 px-3 py-1 rounded-lg"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}

          {!openingLoading && openingSlots.length === 0 && (
            <p className="text-sm text-gray-400">No opening hours added yet.</p>
          )}

          {openingLoading && (
            <p className="text-sm text-gray-400">Loading...</p>
          )}
        </div>

        <form
          onSubmit={(e) => {
            void handleOpeningSubmit(e);
          }}
          className="flex flex-wrap gap-3 items-center"
        >
          <select
            className="bg-gray-900 p-2 rounded-lg"
            value={openingForm.day}
            onChange={(e) =>
              setOpeningForm((f) => ({ ...f, day: e.target.value }))
            }
          >
            {dayOptions.map((d) => (
              <option key={d.code} value={d.code}>
                {d.label}
              </option>
            ))}
          </select>
          <input
            type="time"
            className="bg-gray-900 p-2 rounded-lg w-36"
            value={openingForm.start}
            onChange={(e) =>
              setOpeningForm((f) => ({ ...f, start: e.target.value }))
            }
            placeholder="Start"
          />
          <span>to</span>
          <input
            type="time"
            className="bg-gray-900 p-2 rounded-lg w-36"
            value={openingForm.end}
            onChange={(e) =>
              setOpeningForm((f) => ({ ...f, end: e.target.value }))
            }
            placeholder="End"
          />
          <button
            type="submit"
            disabled={openingLoading}
            className="bg-blue-600 px-4 py-2 rounded-lg text-sm font-semibold"
          >
            {openingLoading
              ? "Saving..."
              : openingForm.id === null
                ? "Add Slot"
                : "Save Changes"}
          </button>
        </form>
      </div>
    </section>
  );
}
