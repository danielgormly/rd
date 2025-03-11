import { getDevice, debug } from "../common";
import { Scene } from "../main";

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
    "<div class='text-board'>Attempting to run compute shader</div>";
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
  const input = new Float32Array(10);
  for (let i = 0; i < input.byteLength; i++) {
    input[i] = Math.random() * 10;
  }
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
  performance.mark("pre-command");
  // Write the data to the device
  device.queue.writeBuffer(workBuffer, 0, input);
  // Create out buffer on the GPU
  const resultBuffer = device.createBuffer({
    label: "result buffer",
    size: input.byteLength, // 12 again
    usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST,
  });
  // bindgroup to bind buffer to shader
  const bindGroup = device.createBindGroup({
    label: "bindGroup for work buffer",
    layout: pipeline.getBindGroupLayout(0),
    entries: [{ binding: 0, resource: { buffer: workBuffer } }],
  });
  // encode & run
  const encoder = device.createCommandEncoder({
    label: "doubling encoder",
  });
  const pass = encoder.beginComputePass({
    label: "doubling compute pass",
  });
  pass.setPipeline(pipeline);
  pass.setBindGroup(0, bindGroup);
  pass.dispatchWorkgroups(input.length);
  pass.end();
  encoder.copyBufferToBuffer(workBuffer, 0, resultBuffer, 0, resultBuffer.size);
  const commandBuffer = encoder.finish();
  // Start!
  device.queue.submit([commandBuffer]);
  // Read the results
  await resultBuffer.mapAsync(GPUMapMode.READ);
  const result = new Float32Array(resultBuffer.getMappedRange());
  performance.mark("read-result");
  const measure = performance.measure("duration", "pre-command", "read-result");
  const board = document.getElementsByClassName("text-board")[0];
  if (!board) throw new Error();
  board.innerHTML = `Doubling 10xfp32 via webgpu:<br>input: ${input}<br>result: ${result}<br>Round trip: ${measure.duration.toFixed(2)}ms`;
  resultBuffer.unmap();
}

export const computeScene: Scene = {
  title: "Basic Compute",
  description: `Running simple computations (see <a href="https://webgpufundamentals.org/webgpu/lessons/webgpu-fundamentals.html#a-run-computations-on-the-gpu" target="_blank" rel="noopener noreferrer">webgpufundamentals.com</a>)`,
  func: basicCompute,
};
