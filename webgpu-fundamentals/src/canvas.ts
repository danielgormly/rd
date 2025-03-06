function setupCanvas(el: HTMLElement) {
  el.innerHTML = "";
  const canvas = document.createElement("canvas");
  el.appendChild(canvas);
  return canvas;
}

function debug(el: HTMLElement, ctx?: GPUCanvasContext) {
  const debug = document.createElement("div");
  debug.className = "debug";
  if (!ctx) {
    debug.innerHTML = `WebGPU not supported`;
  } else {
    const config = ctx.getConfiguration();
    debug.innerHTML = `canvas_resolution:${ctx.canvas.width}x${ctx.canvas.height};adapter:${config?.device.adapterInfo.vendor};arch:${config?.device.adapterInfo.architecture};color_space:${config?.colorSpace};format:${config?.format};`;
  }
  el.appendChild(debug);
}

async function wgpu(
  canvas: HTMLCanvasElement,
): Promise<[GPUCanvasContext, GPUDevice]> {
  const adapter = await navigator.gpu?.requestAdapter();
  const device = await adapter?.requestDevice();
  if (!device) {
    throw new Error("Cannot get device");
  }
  const ctx = canvas.getContext("webgpu");
  if (!ctx) {
    throw new Error("Cannot get webgpu context");
  }
  const format = navigator.gpu.getPreferredCanvasFormat();
  ctx.configure({
    device,
    format: format,
  });
  return [ctx, device];
}

export async function initWGPUCanvas(
  el: HTMLElement,
  showDebugEl?: boolean,
): Promise<[GPUCanvasContext, GPUDevice]> {
  const canvas = setupCanvas(el);
  const [ctx, device] = await wgpu(canvas);
  if (showDebugEl) debug(el, ctx);
  return [ctx, device];
}
