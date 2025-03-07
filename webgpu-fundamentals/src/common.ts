function setupCanvas(el: HTMLElement) {
  el.innerHTML = "";
  const canvas = document.createElement("canvas");
  el.appendChild(canvas);
  return canvas;
}

export function debug(ctx?: GPUCanvasContext | string) {
  const debug = document.getElementById("debug");
  if (!debug) {
    console.warn("debug target not found");
    return;
  }
  if (typeof ctx === "string") {
    debug.innerHTML = ctx;
    return;
  }
  if (!ctx) {
    debug.innerHTML = `WebGPU not supported`;
  } else {
    const config = ctx.getConfiguration();
    debug.innerHTML = `canvas_resolution:${ctx.canvas.width}x${ctx.canvas.height};adapter:${config?.device.adapterInfo.vendor};arch:${config?.device.adapterInfo.architecture};color_space:${config?.colorSpace};format:${config?.format};`;
  }
}

async function wgpu(
  canvas: HTMLCanvasElement,
): Promise<[GPUCanvasContext, GPUDevice, GPUTextureFormat]> {
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
    format,
  });
  return [ctx, device, format];
}

export async function initWGPUCanvas(
  el: HTMLElement,
  showDebugEl?: boolean,
): Promise<[GPUCanvasContext, GPUDevice, GPUTextureFormat]> {
  const canvas = setupCanvas(el);
  try {
    const [ctx, device, format] = await wgpu(canvas);
    if (showDebugEl) debug(ctx);
    return [ctx, device, format];
  } catch (err) {
    debug();
  }
  throw new Error("failed");
}

// TODO: Combine
export async function getDevice() {
  const adapter = await navigator.gpu?.requestAdapter();
  const device = await adapter?.requestDevice();
  if (!device) {
    debug("need a browser that supports WebGPU");
    return;
  }
  return device;
}

export function resizeCanvas(
  canvas: HTMLCanvasElement,
  device: GPUDevice,
  cb?: () => void,
) {
  function resize(entry: ResizeObserverEntry) {
    const canvas = entry.target;
    const width = entry.contentBoxSize[0].inlineSize;
    const height = entry.contentBoxSize[0].blockSize;
    canvas.width = Math.max(
      1, // Ensures we don't hit 0 & cause problems
      Math.min(width, device.limits.maxTextureDimension2D),
    );
    canvas.height = Math.max(
      1, // Ensures we don't hit 0 & cause problems
      Math.min(height, device.limits.maxTextureDimension2D),
    );
  }
  const observer = new ResizeObserver((entries) => {
    for (const entry of entries) {
      resize(entry);
    }
    // re-render
    if (cb) cb();
  });
  return observer.observe(canvas);
}
