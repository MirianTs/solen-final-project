export const THEME_STORAGE_KEY = "solen-theme";

export type Theme = "light" | "dark";

/**
 * Inline script for the public page. Runs before the first paint and sets <html data-theme>.
 * Every visit starts dark; a switch to light is kept only for this tab (sessionStorage).
 * Also drops the old localStorage choice, so earlier visitors start dark too.
 */
export const THEME_SCRIPT = `(function(){var s=null;try{s=sessionStorage.getItem("${THEME_STORAGE_KEY}");localStorage.removeItem("${THEME_STORAGE_KEY}")}catch(e){}document.documentElement.dataset.theme=s==="light"?"light":"dark"})()`;
