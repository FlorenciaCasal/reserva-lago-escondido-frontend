"use client";
import { useId, useState } from "react";
import PoliciesModal from "./PoliciesModal";
import PoliciesContent from "./PoliciesContent";

export default function PolicyCheckbox({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  const [open, setOpen] = useState(false);
  const checkboxId = useId();

  return (
    <>
      <div className="flex items-start gap-3">
        <input
          id={checkboxId}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="mt-1"
        />
        <span className="text-sm">
          <label htmlFor={checkboxId} className="cursor-pointer">Acepto las</label>{" "}
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="underline text-primary"
          >
            políticas de visita
          </button>
        </span>
      </div>

      <PoliciesModal open={open} onClose={() => setOpen(false)}>
        <PoliciesContent />
      </PoliciesModal>
    </>
  );
}

