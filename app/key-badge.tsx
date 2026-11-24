import { cva } from "class-variance-authority";
import { getKeyBadges, type KeyFlags } from "../src/key-badges";

const keyBadgeStyles = cva(
  "rounded-[3px] bg-(--diagram-badge) px-1 font-editor text-[9px]/[14px] font-bold whitespace-nowrap text-(color:--diagram-badgeInk) no-underline",
);

export default function KeyBadge(flags: KeyFlags) {
  const badges = getKeyBadges(flags);
  if (!badges.length) return null;

  return (
    <span className="inline-flex shrink-0 items-center gap-1">
      {badges.map(({ label, title }) => (
        <abbr key={label} title={title} className={keyBadgeStyles()}>
          {label}
        </abbr>
      ))}
    </span>
  );
}
