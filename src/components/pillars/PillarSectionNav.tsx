import { ArrowDown } from "lucide-react";
import styles from "./PillarSectionNav.module.css";

export type PillarSectionNavItem = {
  label: string;
  targetId: string;
  number?: string | number;
};

export type PillarSectionNavProps = {
  pageName: string;
  items: readonly PillarSectionNavItem[];
};

export default function PillarSectionNav({ pageName, items }: PillarSectionNavProps) {
  return (
    <nav
      aria-label={`Secciones de ${pageName}`}
      className={`${styles.navigation} border-b border-neutral-200/60 bg-[#F3F6F3]`}
    >
      <div className="mx-auto max-w-6xl px-6 py-5 sm:px-8 lg:flex lg:items-center lg:gap-10">
        <ul className="flex min-w-0 flex-col divide-y divide-neutral-200/70 lg:flex-1 lg:flex-row lg:gap-6 lg:divide-y-0">
          {items.map(({ label, targetId, number }) => (
            <li key={targetId} className="min-w-0 lg:flex-1">
              <a
                href={`#${targetId}`}
                className="flex min-h-11 items-center gap-3 rounded-sm py-3 text-sm font-semibold text-neutral-700 transition-colors hover:text-[#2A837C] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#2A837C]"
              >
                {number !== undefined && (
                  <span className="shrink-0 text-[11px] font-bold tabular-nums text-[#2A837C]">{number}</span>
                )}
                <span className="min-w-0">{label}</span>
                <ArrowDown className="ml-auto h-3.5 w-3.5 shrink-0 text-[#2A837C]" aria-hidden="true" />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
