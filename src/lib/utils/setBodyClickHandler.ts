import { browser } from "$app/environment";
import type { GeneralFunction } from "$lib/types/common";

export default function setBodyClickHandler(func: GeneralFunction) {
  if (!browser) return;
  document.addEventListener('click', func);
  return () => { document.removeEventListener('click', func) }
}