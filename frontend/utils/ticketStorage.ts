export interface SupportTicket {
  id: string;
  name: string;
  email: string;
  role: "client" | "worker";
  category: "payment" | "scheduling" | "quality" | "safety" | "technical" | "other";
  subject: string;
  description: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "open" | "in_progress" | "resolved";
  createdAt: string;
}

const PRE_SEEDED_TICKETS: SupportTicket[] = [
  {
    id: "TKT-4921",
    name: "Anjali Menon",
    email: "anjali.menon@outlook.com",
    role: "client",
    category: "payment",
    subject: "Paid cash but booking status shows pending",
    description: "I booked Ramesh K. for electrical wiring. The service was excellent and I paid him ₹800 in cash. However, the app still shows the booking as pending/in-progress and has not been updated. Please verify.",
    priority: "high",
    status: "open",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2h ago
  },
  {
    id: "TKT-3829",
    name: "Karthik Pillai",
    email: "karthik.p.plumber@gmail.com",
    role: "worker",
    category: "scheduling",
    subject: "Client cancelled last minute without informing",
    description: "I traveled 12km to the client's location in Kochi. Right when I reached the gate, the client cancelled the booking. There was no response to calls. I spent money on transport and lost other potential bookings today.",
    priority: "medium",
    status: "in_progress",
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1d ago
  },
  {
    id: "TKT-5112",
    name: "Suresh Kumar",
    email: "sureshkumar@gmail.com",
    role: "client",
    category: "safety",
    subject: "Aggressive behavior from professional",
    description: "The cleaning worker got extremely rude and aggressive when I pointed out that the kitchen corner was not cleaned properly. He raised his voice in front of my family. I had to pay him and ask him to leave immediately.",
    priority: "urgent",
    status: "open",
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3h ago
  },
  {
    id: "TKT-1082",
    name: "Devika Raj",
    email: "devika.raj@gmail.com",
    role: "client",
    category: "technical",
    subject: "App freezing on booking confirmation",
    description: "Every time I click the 'Confirm Booking' button, the screen freezes and nothing happens. I have to force close the app and restart. My phone is an iPhone 14 Pro.",
    priority: "low",
    status: "resolved",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3d ago
  }
];

export const getTickets = (): SupportTicket[] => {
  if (typeof window === "undefined") return PRE_SEEDED_TICKETS;
  const stored = localStorage.getItem("fework_support_tickets");
  if (!stored) {
    localStorage.setItem("fework_support_tickets", JSON.stringify(PRE_SEEDED_TICKETS));
    return PRE_SEEDED_TICKETS;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return PRE_SEEDED_TICKETS;
  }
};

export const saveTickets = (tickets: SupportTicket[]) => {
  if (typeof window === "undefined") return;
  localStorage.setItem("fework_support_tickets", JSON.stringify(tickets));
};

export const raiseTicket = (ticket: Omit<SupportTicket, "id" | "status" | "createdAt">): SupportTicket => {
  const tickets = getTickets();
  const id = `TKT-${Math.floor(1000 + Math.random() * 9000)}`;
  const newTicket: SupportTicket = {
    ...ticket,
    id,
    status: "open",
    createdAt: new Date().toISOString(),
  };
  const updated = [newTicket, ...tickets];
  saveTickets(updated);
  return newTicket;
};
