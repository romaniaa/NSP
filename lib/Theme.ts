// Light or dark. Visitors who haven't chosen follow their system setting, through
// CSS alone (prefers-color-scheme in globals.css). Choosing stores the theme and
// sets data-theme on <html>, which overrides the system setting.

export type Theme = "light" | "dark";

export const THEME_KEY = "opn:theme";
export const THEME_EVENT = "opn:theme";

// Runs in <head> before the first paint, so a stored choice never flashes the
// other theme first.
export const THEME_SCRIPT = `try{var t=localStorage.getItem("${THEME_KEY}");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}`;
