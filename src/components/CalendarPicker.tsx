'use client';
import { useState, useEffect, useRef } from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { addMonths, subMonths, isBefore, startOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import { getMinimumVisitDateISO } from '@/utils/date';

type Props = {
    selectedISO?: string;                         // "YYYY-MM-DD"
    onSelectISO: (iso: string) => void;           // callback al seleccionar
};

function toISO(d: Date) {
    // YYYY-MM-DD (sin hora)
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

// --- fetch disponibilidad de un mes ---
type DayDTO = {
    availableDate: string;              // "YYYY-MM-DD"
    totalCapacity: number | null;
    remainingCapacity: number | null;
};


export default function CalendarPicker({ selectedISO, onSelectISO }: Props) {
    const [isMobile, setIsMobile] = useState(false);
    const [month, setMonth] = useState(new Date());
    // const [monthsToShow, setMonthsToShow] = useState(6);
    const [monthsToShow, setMonthsToShow] = useState(3);

    const fetchedMonthsRef = useRef<Set<string>>(new Set());
    const todayRef = useRef<Date>(new Date());

    function fromISODateLocal(iso: string) {
        const [y, m, d] = iso.split('-').map(Number);
        return new Date(y, m - 1, d);
    }
    // días deshabilitados combinados (de todos los meses visibles)
    const [disabledSet, setDisabledSet] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState<boolean>(false);

    const selectedDate = selectedISO ? fromISODateLocal(selectedISO) : undefined;
    const minimumVisitDateISO = getMinimumVisitDateISO();

    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 768);
        check();
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, []);

    const fetchDisabledForMonth = async (
        year: number,
        month: number
    ): Promise<Set<string>> => {
        const key = `${year}-${String(month).padStart(2, '0')}`;
        // Ya pedido / en progreso: no lo volvemos a pedir
        if (fetchedMonthsRef.current.has(key)) {
            return new Set();
        }
        // Marcamos ANTES de fetchear (lock)
        fetchedMonthsRef.current.add(key);
        try {
            const res = await fetch(`/api/availability-proxy?month=${key}`, {
                cache: 'no-store',
            });

            if (!res.ok) {
                throw new Error(`No se pudo cargar disponibilidad (${res.status})`);
            }

            const data: DayDTO[] = await res.json();

            return new Set(
                data
                    .filter(d => (d.totalCapacity ?? 0) <= 0 || (d.remainingCapacity ?? 0) <= 0)
                    .map(d => d.availableDate)
            );
        } catch (err) {
            // Si falló, liberamos para poder reintentar
            fetchedMonthsRef.current.delete(key);
            throw err;
        }
    };


    useEffect(() => {
        let cancelled = false;

        const months: Date[] = isMobile
            ? Array.from({ length: monthsToShow }, (_, i) => addMonths(todayRef.current, i))
            : [month, addMonths(month, 1)];

        setLoading(true);

        Promise.allSettled(
            months.map(d => fetchDisabledForMonth(d.getFullYear(), d.getMonth() + 1))
        )
            .then(results => {
                if (cancelled) return;

                setDisabledSet(prev => {
                    const merged = new Set(prev);

                    for (const r of results) {
                        if (r.status === "fulfilled") {
                            for (const iso of r.value) merged.add(iso);
                        }
                    }

                    return merged;
                });
            })
            .finally(() => !cancelled && setLoading(false));

        return () => {
            cancelled = true;
        };
    }, [isMobile, monthsToShow, month]);




    const handleSelect = (date: Date | undefined) => {
        if (!date) return;
        const normalized = new Date(date);
        normalized.setHours(0, 0, 0, 0);
        const iso = toISO(normalized);
        // si el día está deshabilitado, no dejamos seleccionar
        if (disabledSet.has(iso)) return;
        onSelectISO(iso);
    };

    const goPrevious = () => {
        const prev = subMonths(month, 1);
        if (!isBefore(prev, startOfMonth(new Date()))) setMonth(prev);
    };

    const goNext = () => setMonth(addMonths(month, 1));

    const isPrevDisabled = isBefore(subMonths(month, 1), startOfMonth(new Date()));

    // matcher función para react-day-picker
    const isDisabledMatcher = (d: Date) => disabledSet.has(toISO(d));
    const isBeforeMinimumVisitDate = (d: Date) => toISO(d) < minimumVisitDateISO;

    return (
        <div className="flex justify-center">
            <div
                className={`
          bg-white rounded-xl w-[80vw] 
          ${isMobile ? 'px-4 overflow-y-scroll h-[80vh] [&_.rdp-weekday]:hidden' : 'p-4 flex items-center justify-center gap-1 overflow-x-hidden'}
        `}
            >
                {isMobile ? (
                    <>
                        {Array.from({ length: monthsToShow }, (_, i) => {
                            // const thisMonth = addMonths(new Date(), i);
                            const thisMonth = addMonths(todayRef.current, i);
                            return (
                                <div key={i} className="flex bg-white justify-center relative max-w-full sm:max-w-md">
                                    <DayPicker
                                        className="custom-daypicker"
                                        mode="single"
                                        selected={selectedDate}
                                        onSelect={handleSelect}
                                        month={thisMonth}
                                        showOutsideDays
                                        components={{ Nav: () => <></> }}
                                        locale={es}
                                        disabled={[
                                            isBeforeMinimumVisitDate,
                                            { before: new Date() },
                                            { dayOfWeek: [0, 6] }, // fds
                                            isDisabledMatcher,      // 👈 cupo 0 desde backend
                                        ]}
                                    />
                                </div>
                            );
                        })}
                        <div className="flex justify-center w-full mt-4">
                            <button
                                onClick={() => setMonthsToShow(prev => prev + 3)}
                                className="px-4 pt-2 pb-16 w-full max-w-xs rounded-lg cursor-pointer bg-white text-gray-900 hover:opacity-90 transition"
                                disabled={loading}
                            >
                                {loading ? 'Cargando…' : 'Cargar más fechas'}
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <button
                            onClick={goPrevious}
                            aria-label="Mes anterior"
                            className={`p-2 ${isPrevDisabled ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-gray-200'}`}
                            disabled={isPrevDisabled}
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>

                        <DayPicker
                            mode="single"
                            selected={selectedDate}
                            onSelect={handleSelect}
                            numberOfMonths={2}
                            month={month}
                            onMonthChange={setMonth}
                            showOutsideDays
                            pagedNavigation
                            components={{ Nav: () => <></> }}
                            className="custom-daypicker"
                            locale={es}
                            disabled={[
                                isBeforeMinimumVisitDate,
                                { before: new Date() },
                                { dayOfWeek: [0, 6] },
                                isDisabledMatcher,        // 👈 cupo 0 desde backend
                            ]}
                        />

                        <button
                            onClick={goNext}
                            aria-label="Mes siguiente"
                            className="p-2 hover:bg-gray-200"
                        >
                            <ChevronRight className="w-6 h-6" />
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
