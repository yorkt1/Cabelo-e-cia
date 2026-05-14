import { create } from "zustand";
import { persist } from "zustand/middleware";
import dayjs from "dayjs";

export type Role = "owner" | "admin" | "receptionist" | "professional";

export interface Salon {
  id: string;
  name: string;
  logo?: string;
  phone: string;
  address: string;
  plan: "starter" | "pro" | "premium";
  active: boolean;
}

export interface Professional {
  id: string;
  salonId: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  specialties: string[];
  commission: number;
  color: string;
}

export interface Client {
  id: string;
  salonId: string;
  name: string;
  phone: string;
  email: string;
  birthday?: string;
  notes?: string;
  avatar?: string;
  visits: number;
  codigo?: string;
}

export interface Service {
  id: string;
  salonId: string;
  name: string;
  category: string;
  durationMin: number;
  price: number;
  commission: number;
  active: boolean;
}

export type AppointmentStatus = "scheduled" | "confirmed" | "completed" | "cancelled" | "no_show";

export interface Appointment {
  id: string;
  salonId: string;
  clientId: string;
  professionalId: string;
  serviceIds: string[];
  start: string; // ISO
  end: string;
  status: AppointmentStatus;
  notes?: string;
  total: number;
}

export interface Transaction {
  id: string;
  salonId: string;
  type: "income" | "expense";
  category: string;
  amount: number;
  date: string;
  description: string;
}

const id = () => Math.random().toString(36).slice(2, 10);

const SPECIALTIES = [
  "Corte",
  "Coloração",
  "Manicure",
  "Pedicure",
  "Lash",
  "Sobrancelha",
  "Estética",
  "Massagem",
];
const CATEGORIES = ["Cabelo", "Unhas", "Estética", "Sobrancelha"];
const COLORS = ["#E8B4B8", "#D8A7B1", "#C9ADA7", "#B5838D", "#E5989B", "#F4A6A6"];

function seed() {
  const salonId = "salon_demo";
  const salons: Salon[] = [
    {
      id: salonId,
      name: "Cabelos e Cia",
      logo: "",
      phone: "(11) 99999-0000",
      address: "Rua das Flores, 123",
      plan: "pro",
      active: true,
    },
    {
      id: "salon_2",
      name: "Rosé Atelier",
      phone: "(11) 98888-1111",
      address: "Av. Paulista, 200",
      plan: "starter",
      active: true,
    },
    {
      id: "salon_3",
      name: "Nude Beauty",
      phone: "(11) 97777-2222",
      address: "Rua Augusta, 50",
      plan: "premium",
      active: false,
    },
  ];

  const professionals: Professional[] = Array.from({ length: 5 }).map((_, i) => ({
    id: `pro_${i + 1}`,
    salonId,
    name: ["Camila Souza", "Bruna Lima", "Marina Alves", "Helena Castro", "Júlia Rocha"][i],
    email: "leandroleandri36@gmail.com",
    phone: "55519987569",
    specialties: [SPECIALTIES[i % SPECIALTIES.length], SPECIALTIES[(i + 2) % SPECIALTIES.length]],
    commission: 30 + i * 5,
    color: COLORS[i % COLORS.length],
  }));

  const firstNames = [
    "Ana",
    "Beatriz",
    "Carla",
    "Daniela",
    "Eduarda",
    "Fernanda",
    "Gabriela",
    "Helena",
    "Isabela",
    "Joana",
    "Karina",
    "Larissa",
    "Mariana",
    "Natália",
    "Olívia",
    "Patrícia",
    "Rafaela",
    "Sabrina",
    "Tatiana",
    "Vanessa",
  ];
  const lastNames = [
    "Silva",
    "Souza",
    "Costa",
    "Lima",
    "Pereira",
    "Almeida",
    "Ribeiro",
    "Castro",
    "Mendes",
    "Rocha",
  ];

  const clients: Client[] = Array.from({ length: 32 }).map((_, i) => ({
    id: `cli_${i + 1}`,
    salonId,
    name: `${firstNames[i % firstNames.length]} ${lastNames[i % lastNames.length]}`,
    phone: `(11) 9${(8000 + i).toString()}-${(1000 + i * 7).toString().slice(0, 4)}`,
    email: `cliente${i + 1}@email.com`,
    birthday: dayjs()
      .subtract(20 + (i % 30), "year")
      .subtract(i, "day")
      .format("YYYY-MM-DD"),
    notes: i % 4 === 0 ? "Prefere atendimento à tarde" : undefined,
    visits: (i * 3) % 25,
    codigo: `A${1000 + i}`,
  }));

  const services: Service[] = [
    {
      id: "srv_1",
      salonId,
      name: "Corte Feminino",
      category: "Cabelo",
      durationMin: 60,
      price: 90,
      commission: 40,
      active: true,
    },
    {
      id: "srv_2",
      salonId,
      name: "Escova",
      category: "Cabelo",
      durationMin: 45,
      price: 70,
      commission: 40,
      active: true,
    },
    {
      id: "srv_3",
      salonId,
      name: "Coloração",
      category: "Cabelo",
      durationMin: 120,
      price: 220,
      commission: 35,
      active: true,
    },
    {
      id: "srv_4",
      salonId,
      name: "Hidratação",
      category: "Cabelo",
      durationMin: 60,
      price: 110,
      commission: 35,
      active: true,
    },
    {
      id: "srv_5",
      salonId,
      name: "Manicure",
      category: "Unhas",
      durationMin: 45,
      price: 50,
      commission: 50,
      active: true,
    },
    {
      id: "srv_6",
      salonId,
      name: "Pedicure",
      category: "Unhas",
      durationMin: 60,
      price: 60,
      commission: 50,
      active: true,
    },
    {
      id: "srv_7",
      salonId,
      name: "Esmaltação em Gel",
      category: "Unhas",
      durationMin: 75,
      price: 90,
      commission: 45,
      active: true,
    },
    {
      id: "srv_8",
      salonId,
      name: "Design de Sobrancelha",
      category: "Sobrancelha",
      durationMin: 30,
      price: 45,
      commission: 50,
      active: true,
    },
    {
      id: "srv_9",
      salonId,
      name: "Lash Extension",
      category: "Estética",
      durationMin: 90,
      price: 180,
      commission: 40,
      active: true,
    },
    {
      id: "srv_10",
      salonId,
      name: "Limpeza de Pele",
      category: "Estética",
      durationMin: 90,
      price: 160,
      commission: 35,
      active: true,
    },
    {
      id: "srv_11",
      salonId,
      name: "Massagem Relaxante",
      category: "Estética",
      durationMin: 60,
      price: 140,
      commission: 40,
      active: true,
    },
    {
      id: "srv_12",
      salonId,
      name: "Henna Sobrancelha",
      category: "Sobrancelha",
      durationMin: 45,
      price: 65,
      commission: 45,
      active: false,
    },
  ];

  const appointments: Appointment[] = [];
  for (let d = -7; d < 14; d++) {
    const day = dayjs().add(d, "day");
    if (day.day() === 0) continue;
    const count = 3 + (Math.abs(d) % 4);
    for (let i = 0; i < count; i++) {
      const pro = professionals[i % professionals.length];
      const svc = services[(i + Math.abs(d)) % services.length];
      const cli = clients[(i * 3 + Math.abs(d)) % clients.length];
      const start = day
        .hour(9 + i * 2)
        .minute(0)
        .second(0);
      const end = start.add(svc.durationMin, "minute");
      const status: AppointmentStatus =
        d < 0
          ? i % 6 === 0
            ? "cancelled"
            : i % 7 === 0
              ? "no_show"
              : "completed"
          : i % 3 === 0
            ? "confirmed"
            : "scheduled";
      appointments.push({
        id: id(),
        salonId,
        clientId: cli.id,
        professionalId: pro.id,
        serviceIds: [svc.id],
        start: start.toISOString(),
        end: end.toISOString(),
        status,
        total: svc.price,
      });
    }
  }

  const incomes: Transaction[] = appointments
    .filter((a) => a.status === "completed")
    .map((a) => ({
      id: id(),
      salonId,
      type: "income" as const,
      category: "Serviço",
      amount: a.total,
      date: a.end,
      description: "Atendimento",
    }));
  const expenses: Transaction[] = [
    {
      id: id(),
      salonId,
      type: "expense",
      category: "Produtos",
      amount: 320,
      date: dayjs().subtract(2, "day").toISOString(),
      description: "Compra de esmaltes",
    },
    {
      id: id(),
      salonId,
      type: "expense",
      category: "Aluguel",
      amount: 2200,
      date: dayjs().startOf("month").toISOString(),
      description: "Aluguel mensal",
    },
    {
      id: id(),
      salonId,
      type: "expense",
      category: "Marketing",
      amount: 450,
      date: dayjs().subtract(5, "day").toISOString(),
      description: "Anúncios Instagram",
    },
  ];
  const transactions: Transaction[] = [...incomes, ...expenses];

  return { salons, professionals, clients, services, appointments, transactions };
}

interface DbState {
  salons: Salon[];
  professionals: Professional[];
  clients: Client[];
  services: Service[];
  appointments: Appointment[];
  transactions: Transaction[];

  addClient: (c: Omit<Client, "id" | "visits">) => Client;
  updateClient: (id: string, c: Partial<Client>) => void;
  removeClient: (id: string) => void;

  addProfessional: (p: Omit<Professional, "id">) => Professional;
  updateProfessional: (id: string, p: Partial<Professional>) => void;
  removeProfessional: (id: string) => void;

  addService: (s: Omit<Service, "id">) => Service;
  updateService: (id: string, s: Partial<Service>) => void;
  removeService: (id: string) => void;

  addAppointment: (a: Omit<Appointment, "id">) => Appointment;
  updateAppointment: (id: string, a: Partial<Appointment>) => void;
  removeAppointment: (id: string) => void;

  addTransaction: (t: Omit<Transaction, "id">) => Transaction;
  updateSalon: (id: string, s: Partial<Salon>) => void;
}

export const useDb = create<DbState>()(
  persist(
    (set) => ({
      ...seed(),
      addClient: (c) => {
        const lastCode = useDb
          .getState()
          .clients.find((cli) => cli.codigo?.startsWith("A"))?.codigo;
        const lastNum = lastCode ? parseInt(lastCode.substring(1)) : 1000;
        const newCode = `A${lastNum + 1 + Math.floor(Math.random() * 5)}`; // Incremento com um pouco de aleatoriedade para parecer real

        const item: Client = { ...c, id: id(), visits: 0, codigo: newCode };
        set((s) => ({ clients: [item, ...s.clients] }));
        return item;
      },
      updateClient: (idv, c) =>
        set((s) => ({ clients: s.clients.map((x) => (x.id === idv ? { ...x, ...c } : x)) })),
      removeClient: (idv) => set((s) => ({ clients: s.clients.filter((x) => x.id !== idv) })),

      addProfessional: (p) => {
        const item: Professional = { ...p, id: id() };
        set((s) => ({ professionals: [item, ...s.professionals] }));
        return item;
      },
      updateProfessional: (idv, p) =>
        set((s) => ({
          professionals: s.professionals.map((x) => (x.id === idv ? { ...x, ...p } : x)),
        })),
      removeProfessional: (idv) =>
        set((s) => ({ professionals: s.professionals.filter((x) => x.id !== idv) })),

      addService: (sv) => {
        const item: Service = { ...sv, id: id() };
        set((s) => ({ services: [item, ...s.services] }));
        return item;
      },
      updateService: (idv, sv) =>
        set((s) => ({ services: s.services.map((x) => (x.id === idv ? { ...x, ...sv } : x)) })),
      removeService: (idv) => set((s) => ({ services: s.services.filter((x) => x.id !== idv) })),

      addAppointment: (a) => {
        const item: Appointment = { ...a, id: id() };
        set((s) => ({ appointments: [item, ...s.appointments] }));
        return item;
      },
      updateAppointment: (idv, a) =>
        set((s) => ({
          appointments: s.appointments.map((x) => (x.id === idv ? { ...x, ...a } : x)),
        })),
      removeAppointment: (idv) =>
        set((s) => ({ appointments: s.appointments.filter((x) => x.id !== idv) })),

      addTransaction: (t) => {
        const item: Transaction = { ...t, id: id() };
        set((s) => ({ transactions: [item, ...s.transactions] }));
        return item;
      },
      updateSalon: (idv, sv) =>
        set((s) => ({ salons: s.salons.map((x) => (x.id === idv ? { ...x, ...sv } : x)) })),
    }),
    { name: "belle-mock-db", version: 1 },
  ),
);
