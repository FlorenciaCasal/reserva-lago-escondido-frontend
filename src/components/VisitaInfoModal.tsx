"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, type KeyboardEvent } from "react";

type Props = {
    open: boolean;
    onClose: () => void;
};

export default function VisitaInfoModal({ open, onClose }: Props) {
    const dialogRef = useRef<HTMLDivElement | null>(null);
    const previousFocusRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
        if (!open) {
            previousFocusRef.current?.focus();
            previousFocusRef.current = null;
            return;
        }

        previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        const dialog = dialogRef.current;
        const firstFocusable = dialog?.querySelector<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        (firstFocusable ?? dialog)?.focus();

        return () => {
            previousFocusRef.current?.focus();
        };
    }, [open]);

    function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
        if (event.key === "Escape") {
            event.preventDefault();
            onClose();
            return;
        }

        if (event.key !== "Tab") return;

        const focusable = Array.from(
            dialogRef.current?.querySelectorAll<HTMLElement>(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            ) ?? []
        ).filter((element) => !element.hasAttribute("disabled"));
        if (focusable.length === 0) {
            event.preventDefault();
            dialogRef.current?.focus();
            return;
        }

        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
        }
    }

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    className="fixed inset-0 z-50 flex items-center justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    {/* Overlay */}
                    <motion.div
                        className="absolute inset-0 bg-black/50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        ref={dialogRef}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="visita-info-title"
                        tabIndex={-1}
                        onKeyDown={handleKeyDown}
                        className="relative bg-white rounded-xl shadow-lg max-w-md w-[90vw] p-6 z-10"
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                    >
                        <h2 id="visita-info-title" className="text-[21px] font-bold text-primary mb-4">
                            ¿En qué consiste la visita?
                        </h2>

                        <div className="text-[12px] md:text-[14px] text-main leading-relaxed space-y-3">
                            <p>
                                Las visitas se realizan por la tarde, a las {" "} <strong>14:00 h.</strong>
                                <br />
                                Te pedimos llegar 15 minutos antes del horario indicado para comenzar de manera puntual.

                            </p>

                            <p>
                                Haremos un recorrido de {" "}
                                <strong>40 minutos</strong> de ida dentro de bosques milenarios que rodean al lago Escondido.

                            </p>

                            <p>
                                Descansaremos <strong>15 minutos</strong>  y emprenderemos la vuelta por el mismo recorrido
                            </p>

                            <p>
                                Se estima una duración de, aproximadamente, {" "}
                                <strong>dos horas</strong> por un terreno irregular de
                                montaña, con una dificultad <strong>baja–media</strong>.
                            </p>
                        </div>

                        <button
                            onClick={onClose}
                            className="
                mt-6 w-full
                px-4 py-2
                rounded-lg
                border-2 border-primary
                bg-white
                text-primary
                font-medium
                transition
                hover:bg-primary hover:text-white
              "
                        >
                            Entendido
                        </button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

