import { setupCanvas } from "./canvas";

export function triangle(el: HTMLElement) {
  setupCanvas(el);
}

export const Triangle = {
  title: "Triangle",
  description: "Rendering a triangle",
  func: triangle,
};
