import { triangle } from "./01-triangle";
import "./style.css";

interface Scene {
  title: string;
  description: string;
  func: (el: HTMLElement) => void;
}

const scenes = new Map<string, Scene>([
  [
    "triangle",
    {
      title: "Triangle",
      description: "Rendering a triangle",
      func: triangle,
    },
  ],
]);

function route(hash: string) {
  const board = document.getElementById("board");
  if (!board) return;
  if (!hash) {
    const exp = scenes.get("triangle");
    if (!exp) return;
    exp.func(board);
  }
}

window.addEventListener("hashchange", (event) => {
  const { hash } = new URL(event.newURL);
  route(hash);
});

const links: string[] = [];
let i = 0;
scenes.forEach((exp, key) => {
  links.push(
    `<li><a href="#${key}">${i.toString().padStart(2, "0")} ${exp.title}</a>: ${exp.description}</li>`,
  );
});

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div>
  <h1>WebGPU Experiments</h1>
  <section id="board">
  </section>
  <ul>
    ${links.join("\n")}
  </ul>
  </div>
`;

route(window.location.hash);
