import { assertEquals } from "@std/assert";
import { decode_instructions, stringify_instruction } from "./main.ts";
import { assemble } from "./assemble.ts";

Deno.test(async function mov_single_register() {
  const original = await Deno.readFile(
    "/Users/Nino/code-friends/computer_enhance_sources/perfaware/part1/listing_0037_single_register_mov",
  );

  const assembly_lines: string[] = [];
  for (const instruction of decode_instructions(original)) {
    assembly_lines.push(stringify_instruction(instruction));
  }
  const asm = assembly_lines.join("\n");
  const reassembled = await assemble(asm);
  assertEquals(original, reassembled);
});

Deno.test(async function mov_many_registers() {
  const original = await Deno.readFile(
    "/Users/Nino/code-friends/computer_enhance_sources/perfaware/part1/listing_0038_many_register_mov",
  );

  const assembly_lines: string[] = [];
  for (const instruction of decode_instructions(original)) {
    assembly_lines.push(stringify_instruction(instruction));
  }
  const asm = assembly_lines.join("\n");
  const reassembled = await assemble(asm);
  assertEquals(original, reassembled);
});

Deno.test(async function more_movs() {
  const original = await Deno.readFile(
    "/Users/Nino/code-friends/computer_enhance_sources/perfaware/part1/listing_0039_more_movs",
  );

  const assembly_lines: string[] = [];
  for (const instruction of decode_instructions(original)) {
    assembly_lines.push(stringify_instruction(instruction));
  }
  const asm = assembly_lines.join("\n");
  const reassembled = await assemble(asm);
  assertEquals(original, reassembled);
});

Deno.test(async function up_to_listing_41() {
  const original = await Deno.readFile(
    "/Users/Nino/code-friends/computer_enhance_sources/perfaware/part1/listing_0041_add_sub_cmp_jnz",
  );

  const assembly_lines: string[] = [];
  for (const instruction of decode_instructions(original)) {
    assembly_lines.push(stringify_instruction(instruction));
  }
  const asm = assembly_lines.join("\n");
  const reassembled = await assemble(asm);
  assertEquals(original, reassembled);
});
