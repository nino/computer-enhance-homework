/**
 * Assemble `assembly` using `nasm` and return the generated binary.
 * This function sets `bits 16` on the code before assembling.
 */
export async function assemble(assembly: string): Promise<Uint8Array> {
  const tmp_source = await Deno.makeTempFile({ suffix: ".asm" });
  const tmp_output = await Deno.makeTempFile({ suffix: ".bin" });

  await Deno.writeTextFile(tmp_source, "bits 16\n" + assembly);

  try {
    const process = new Deno.Command("nasm", {
      args: ["-f", "bin", tmp_source, "-o", tmp_output],
      stderr: "piped",
    });

    const { success, stderr } = await process.output();

    if (!success) {
      throw new Error(
        `NASM assembly failed: ${new TextDecoder().decode(stderr)}`,
      );
    }

    const binary = await Deno.readFile(tmp_output);
    return new Uint8Array(binary);
  } finally {
    await Deno.remove(tmp_source);
    await Deno.remove(tmp_output);
  }
}

// Example usage:
// const source = `
//   BITS 64
//   mov rax, 60  ; exit syscall
//   mov rdi, 42  ; exit code
//   syscall
// `;

// try {
//   const binary = await assembleNasm(source);
//   console.log("Assembled binary:", binary);
// } catch (error) {
//   console.error("Assembly failed:", error);
// }
