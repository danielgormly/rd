import { getDevice, debug } from "../common";

const code = `
  // Creating a variable called data of type storage, readable and writeable
  // an array of 32 floating point vals in group[0]->binding[0]
  @group(0) @binding(0) var<storage, read_write> data: array<f32>;

  // compute shader - nfi what a workgroup is yet
  // vec3u = 3x 32bit unsigned integers
  @compute @workgroup_size(1) fn computeSomething(
    @builtin(global_invocation_id) id: vec3u
  ) {
    let i = id.x;
    data[i] = data[i] * 2;
  }
`;

export async function basicCompute(el: HTMLElement) {
  el.innerHTML =
    "<div class='text-board'>Nothing to see here. This is a compute only shader.</div>";
  const device = await getDevice();
  if (!device) {
    debug(`Failed to get WGPU device`);
    return;
  }
  debug(`wgpu:${device.adapterInfo.vendor}`);
  const module = device?.createShaderModule({
    label: "doubling compute module",
    code,
  });
  if (!module) {
    debug("Shader module failed");
    return;
  }
  const pipeline = device?.createComputePipeline({
    label: "doubling compute pipeline",
    layout: "auto",
    compute: {
      module,
    },
  });
  const input = new Float32Array([1, 3, 5]);
  const workBuffer = device?.createBuffer({
    label: "work buffer",
    size: input.byteLength, // 12 bytes (4*3)
    usage:
      GPUBufferUsage.STORAGE |
      GPUBufferUsage.COPY_SRC |
      GPUBufferUsage.COPY_DST,
  }); // we need to copy data in, out and store it! (also storage flag makes it compatible with our storage var above)
  if (!workBuffer) {
    debug("Workbuffer failed to be created");
    return;
  }
  // Write the data to the device
  device.queue.writeBuffer(workBuffer, 0, input);
  // Create out buffer on the GPU
  const resultBuffer = device.createBuffer({
    label: "result buffer",
    size: input.byteLength, // 12 again
    usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST,
  });
  // bindgroup to bind buffer to shader
}
