export const themeStorageKey = "schema-studio:theme";
export const systemThemeQuery = "(prefers-color-scheme: dark)";
export const themeColors = { light: "#ffffff", dark: "#303138" } as const;

export const themeBootstrapScript = `(() => {
  let preference;
  try {
    preference = localStorage.getItem(${JSON.stringify(themeStorageKey)});
  } catch {
    // Follow the system theme when storage is unavailable.
  }
  const theme = preference === "light" || preference === "dark"
    ? preference
    : window.matchMedia(${JSON.stringify(systemThemeQuery)}).matches ? "dark" : "light";
  document.documentElement.dataset.theme = theme;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.content = ${JSON.stringify(themeColors)}[theme];
})();`;
