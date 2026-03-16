import React from "react";

type Service = {
  id: number;
  name: string;
  description: string;
  price: string;
  start_time: string;
  end_time: string;
  duration?: number | null;
};

type ServiceForm = {
  id: number | null;
  name: string;
  description: string;
  price: string;
  start_time: string;
  end_time: string;
  duration: string;
};

type Props = {
  isBlocked: boolean;
  servicesError: string | null;
  servicesLoading: boolean;
  services: Service[];
  serviceForm: ServiceForm;
  setServiceForm: React.Dispatch<React.SetStateAction<ServiceForm>>;
  handleServiceSubmit: (e: React.FormEvent) => Promise<void>;
  handleServiceEdit: (service: Service) => void;
  handleServiceDelete: (id: number) => Promise<void>;
};

export default function ServicesSection({
  isBlocked,
  servicesError,
  servicesLoading,
  services,
  serviceForm,
  setServiceForm,
  handleServiceSubmit,
  handleServiceEdit,
  handleServiceDelete,
}: Props) {
  if (isBlocked) return null;

  return (
    <section className="bg-[#272727] rounded-2xl p-6 shadow-lg space-y-4">
      <h2 className="text-xl font-semibold">Prices & Services (Optional)</h2>

      {servicesError ? (
        <p className="text-sm text-red-400">{servicesError}</p>
      ) : null}

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-gray-400 border-b border-gray-900">
              <th className="py-2">Service Name</th>
              <th className="py-2">Description</th>
              <th className="py-2">Price</th>
              <th className="py-2">Start Time</th>
              <th className="py-2">End Time</th>
              <th className="py-2">Duration (min)</th>
              <th className="py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {servicesLoading && (
              <tr>
                <td
                  colSpan={7}
                  className="py-4 text-center text-gray-400 text-sm"
                >
                  Loading services...
                </td>
              </tr>
            )}

            {services.map((service) => (
              <tr key={service.id} className="border-b border-gray-900 text-sm">
                <td className="py-2">{service.name}</td>
                <td className="py-2">{service.description || "-"}</td>
                <td className="py-2">${service.price}</td>
                <td className="py-2">{service.start_time}</td>
                <td className="py-2">{service.end_time}</td>
                <td className="py-2">
                  {typeof service.duration === "number"
                    ? service.duration
                    : "-"}
                </td>
                <td className="py-2">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleServiceEdit(service)}
                      disabled={servicesLoading}
                      className="text-xs bg-blue-600 px-3 py-1 rounded-lg"
                    >
                      Update
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleServiceDelete(service.id)}
                      disabled={servicesLoading}
                      className="text-xs bg-red-600 px-3 py-1 rounded-lg"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {!servicesLoading && services.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="py-4 text-center text-gray-400 text-sm"
                >
                  No services added yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <form
        onSubmit={(e) => {
          void handleServiceSubmit(e);
        }}
        className="grid grid-cols-1 md:grid-cols-7 gap-3 pt-3"
      >
        <input
          className="bg-gray-900 p-2 rounded-lg"
          placeholder="Service Name"
          value={serviceForm.name}
          onChange={(e) =>
            setServiceForm((f) => ({ ...f, name: e.target.value }))
          }
        />
        <input
          className="bg-gray-900 p-2 rounded-lg"
          placeholder="Description"
          value={serviceForm.description}
          onChange={(e) =>
            setServiceForm((f) => ({ ...f, description: e.target.value }))
          }
        />
        <input
          className="bg-gray-900 p-2 rounded-lg"
          placeholder="Price ($)"
          value={serviceForm.price}
          onChange={(e) =>
            setServiceForm((f) => ({ ...f, price: e.target.value }))
          }
        />
        <input
          className="bg-gray-900 p-2 rounded-lg"
          placeholder="Start Time (e.g., 11:00 am)"
          value={serviceForm.start_time}
          onChange={(e) =>
            setServiceForm((f) => ({ ...f, start_time: e.target.value }))
          }
        />
        <input
          className="bg-gray-900 p-2 rounded-lg"
          placeholder="End Time (e.g., 6:00 pm)"
          value={serviceForm.end_time}
          onChange={(e) =>
            setServiceForm((f) => ({ ...f, end_time: e.target.value }))
          }
        />
        <input
          type="number"
          min={0}
          className="bg-gray-900 p-2 rounded-lg"
          placeholder="Duration (min)"
          value={serviceForm.duration}
          onChange={(e) =>
            setServiceForm((f) => ({
              ...f,
              duration: e.target.value,
            }))
          }
        />
        <button
          type="submit"
          disabled={servicesLoading}
          className="bg-blue-600 px-4 py-2 rounded-lg text-sm font-semibold"
        >
          {servicesLoading
            ? "Saving..."
            : serviceForm.id === null
              ? "+ Add"
              : "Save Changes"}
        </button>
      </form>
    </section>
  );
}
