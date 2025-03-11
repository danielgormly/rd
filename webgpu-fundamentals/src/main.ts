import { triangle } from "./xps/00-triangle";
import { basicCompute } from "./xps/01-compute";
import "./style.css";
import { rgbTriangle } from "./xps/02-rgb-triangle";
import { checkerboardTriangle } from "./xps/03-checkerboard";

interface Scene {
  title: string;
  description: string;
  func: (el: HTMLElement) => Promise<void> | Promise<() => void>;
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
    "rgb-triangle",
    {
      title: "RGB Triangle",
      description: `Using an interstage variable to interpolate colours across a triangle (see <a href="https://webgpufundamentals.org/webgpu/lessons/webgpu-inter-stage-variables.html" target="_blank" rel="noopener noreferrer">webgpufundamentals.com</a>)`,
      func: rgbTriangle,
    },
  ],
  [
    "checkerboard-triangle",
    {
      title: "Checkerboard Triangle",
      description: `Checkerboard defined with reference to pixel values - so doesn't scale with the screen! (see <a href="https://webgpufundamentals.org/webgpu/lessons/webgpu-inter-stage-variables.html" target="_blank" rel="noopener noreferrer">webgpufundamentals.com</a>)`,
      func: checkerboardTriangle,
    },
  ],
]);

let destroyFuncs: (() => void)[] = [];

async function route(hash: string) {
  const board = document.getElementById("board");
  if (!board) return;
  const destroy = destroyFuncs.shift();
  if (destroy) destroy();
  const id = hash ? hash.slice(1) : "triangle";
  const exp = scenes.get(id);
  if (!exp) return;
  const destroyFunc = await exp.func(board);
  if (destroyFunc) destroyFuncs.push(destroyFunc);
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
