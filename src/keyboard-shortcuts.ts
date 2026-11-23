export type PrimaryShortcut = {
  key: string;
  shift?: boolean;
};

export const exportImageShortcut = { key: "E", shift: true } satisfies PrimaryShortcut;

export function isMacPlatform() {
  return navigator.platform.startsWith("Mac");
}
