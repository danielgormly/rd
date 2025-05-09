import "./style.css";
import { triangleScene } from "./xps/00-triangle";
import { computeScene } from "./xps/01-compute";
import { rgbTriScene } from "./xps/02-rgb-triangle";
import { checkerboardTriScene } from "./xps/03-checkerboard";
import { manyTriScene } from "./xps/04-many-triangles";
import { manyRingsScene } from "./xps/05-many-rings";
import { fakeBallsScene } from "./xps/06-fake-balls";
import { texturesScene } from "./xps/07-textures";

export interface Scene {
  title: string;
  description: string;
  func: (el: HTMLElement) => Promise<void> | Promise<() => void>;
}

const scenes = new Map<string, Scene>([
  ["triangle", triangleScene],
  ["compute", computeScene],
  ["rgb-triangle", rgbTriScene],
  ["checkerboard-triangle", checkerboardTriScene],
  ["many-triangles", manyTriScene],
  ["many-rings", manyRingsScene],
  ["fake-balls", fakeBallsScene],
  ["textures", texturesScene],
]);

let destroyFuncs: (() => void)[] = [];

async function route(hash: string) {
  const board = document.getElementById("board");
  if (!board) return;
  const destroy = destroyFuncs.shift();
  if (destroy) destroy();
  board.innerHTML = "";
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
