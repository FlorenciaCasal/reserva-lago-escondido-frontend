const ARGENTINA_TIME_ZONE = "America/Argentina/Buenos_Aires";

function toISODate(year: number, month: number, day: number) {
    return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function getTodayISOInArgentina(now = new Date()) {
    const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: ARGENTINA_TIME_ZONE,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).formatToParts(now);

    const year = Number(parts.find(part => part.type === "year")?.value);
    const month = Number(parts.find(part => part.type === "month")?.value);
    const day = Number(parts.find(part => part.type === "day")?.value);

    return toISODate(year, month, day);
}

function addCalendarDaysISO(dateISO: string, days: number) {
    const [year, month, day] = dateISO.split("-").map(Number);
    const date = new Date(Date.UTC(year, month - 1, day + days));
    return toISODate(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate());
}

export function getMinimumVisitDateISO(now = new Date()) {
    return addCalendarDaysISO(getTodayISOInArgentina(now), 7);
}

export function hasMin7CalendarDays(dateISO: string, now = new Date()) {
    return dateISO >= getMinimumVisitDateISO(now);
}
