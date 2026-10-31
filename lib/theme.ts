export const THEME_STORAGE_KEY = "solen-theme";

export type Theme = "light" | "dark";

/**
 * Inline script for the public page. Runs before the first paint and sets <html data-theme>:
 * the visitor's saved choice, otherwise the system setting (followed live until they pick one).
 */
export const THEME_SCRIPT = `(function(){var d=document.documentElement,m=matchMedia("(prefers-color-scheme: light)");function a(){var s=null;try{s=localStorage.getItem("${THEME_STORAGE_KEY}")}catch(e){}d.dataset.theme=s==="light"||s==="dark"?s:m.matches?"light":"dark"}a();m.addEventListener("change",a)})()`;
