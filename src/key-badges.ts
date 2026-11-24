const keyBadges = [
  { flag: "primary", label: "PK", title: "Primary key", side: "left" },
  { flag: "foreign", label: "FK", title: "Foreign key", side: "left" },
  { flag: "unique", label: "UQ", title: "Unique", side: "right" },
  { flag: "notNull", label: "NN", title: "Not null", side: "right" },
] as const;

export type KeyFlags = Partial<Record<(typeof keyBadges)[number]["flag"], boolean>>;

export const keyBadgeGap = 4;
export const keyBadgeGroupGap = 8;
export const keyBadgePadding = 4;

export function getKeyBadges(flags: KeyFlags, side?: "left" | "right") {
  return keyBadges.filter((badge) => flags[badge.flag] && (!side || badge.side === side));
}
