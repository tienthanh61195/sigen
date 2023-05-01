// import { browser } from "$app/environment";

// export default function clickOutsideElement(node: HTMLElement) {
//   if (!browser) return;
//   const handleKeyDown = (event: KeyboardEvent) => {
//     node.dispatchEvent(new CustomEvent("keydown", event));
//   };

//   document.addEventListener("keydown", handleKeyDown, true);

//   return {
//     destroy() {
//       document.removeEventListener("keydown", handleKeyDown, true);
//     }
//   };
// }