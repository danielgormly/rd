import { triangle } from "./xps/00-triangle";
import { basicCompute } from "./xps/01-compute";
import "./style.css";
import { rainbowTriangle } from "./xps/02-rainbow-triangle";

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
      description: `Rendering a triangle (see <a href="https://webgpufundamentals.org/webgpu/lessons/webgpu-fundamentals.html" target="_blank" rel="noopener noreferrer">webgpufundamentals.com</a>)`,
      func: triangle,
    },
  ],
  [
    "compute",
    {
      title: "Basic Compute",
      description: `Running simple computations (see <a href="https://webgpufundamentals.org/webgpu/lessons/webgpu-fundamentals.html#a-run-computations-on-the-gpu" target="_blank" rel="noopener noreferrer">webgpufundamentals.com</a>)`,
      func: basicCompute,
    },
  ],
  [
    "tri",
    {
      title: "Rainbow Triangle",
      description: `Using an interstage variable to interpolate colours across a triangle (see <a href="https://webgpufundamentals.org/webgpu/lessons/webgpu-inter-stage-variables.html" target="_blank" rel="noopener noreferrer">webgpufundamentals.com</a>)`,
      func: rainbowTriangle,
    },
  ],
]);

function route(hash: string) {
  const board = document.getElementById("board");
  if (!board) return;
  if (hash) {
    const strippedHash = hash.slice(1);
    const exp = scenes.get(strippedHash);
    if (!exp) return;
    exp.func(board);
  } else {
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
  i++;
});

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div>
  <section id="board">
  </section>
  <div id="debug"></div>
  <ul>
    ${links.join("\n")}
  </ul>
  </div>
`;

route(window.location.hash);
