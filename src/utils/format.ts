import dayjs from "dayjs";
import "dayjs/locale/pt-br";
dayjs.locale("pt-br");

export const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const fmtDate = (d: string | Date, p = "DD/MM/YYYY") => dayjs(d).format(p);
export const fmtTime = (d: string | Date) => dayjs(d).format("HH:mm");
export const fmtDateTime = (d: string | Date) => dayjs(d).format("DD/MM/YYYY HH:mm");

export const initials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0])
    .join("")
    .toUpperCase();

export { dayjs };
