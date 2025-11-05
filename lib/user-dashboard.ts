export type Appointment = { time: string; name: string; status: "pending" | "confirm" | "done" };
export type Payment = { name: string; service: string; amount: number; status: "paid" | "pending" };
export type Channel = { name: string; status: "online" | "offline" };

export type UserDashboardData = {
  cards: {
    openChats: number;
    appointmentsToday: number;
    newAppointments: number;
    paymentsToday: number;
    paymentsAmount: number;
  };
  appointmentsToday: Appointment[];
  paymentsToday: Payment[];
  channels: Channel[];
  notifications: string[];
};

export const FAKE_USER_DASHBOARD: UserDashboardData = {
  cards: {
    openChats: 0,
    appointmentsToday: 10,
    newAppointments: 4,
    paymentsToday: 9,
    paymentsAmount: 1240,
  },
  appointmentsToday: [
    { time: "11:23 pm", name: "Courtney", status: "confirm" },
    { time: "10:41 pm", name: "Savannah", status: "confirm" },
    { time: "08:20 pm", name: "Giora", status: "confirm" },
    { time: "06:41 pm", name: "Colleen", status: "confirm" },
    { time: "02:30 pm", name: "Kristin", status: "pending" },
    { time: "02:20 pm", name: "Brande", status: "confirm" },
    { time: "10:41 am", name: "Jane", status: "confirm" },
  ],
  paymentsToday: [
    { name: "Cody", service: "Consultation", amount: 120, status: "paid" },
    { name: "Jacob", service: "Initial Visit", amount: 110, status: "pending" },
    { name: "Soham", service: "Consultation", amount: 150, status: "paid" },
    { name: "Ronald", service: "Service Package", amount: 520, status: "pending" },
    { name: "Brandon", service: "Initial Visit", amount: 220, status: "paid" },
    { name: "Leslie", service: "Consultation", amount: 100, status: "paid" },
  ],
  channels: [
    { name: "WhatsApp", status: "online" },
    { name: "Facebook", status: "online" },
    { name: "Instagram", status: "online" },
    { name: "Wechat", status: "online" },
  ],
  notifications: ["All systems normal"],
};
