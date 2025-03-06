export function setupCanvas(el: HTMLElement) {
  el.innerHTML = "";
  const canvas = document.createElement("canvas");
  el.appendChild(canvas);
  return canvas;
}
