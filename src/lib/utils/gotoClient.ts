import { browser } from "$app/environment";
import { goto } from "$app/navigation";

export default function gotoClient(route: string) {
  if (browser) goto(route)
}