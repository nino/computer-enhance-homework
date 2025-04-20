import { assertEquals, assertThrows } from "@std/assert";
import { decode_instructions, parseInstructionName } from "./main.ts";
import { assemble } from "./assemble.ts";

Deno.test(async function mov_single_register() {
  const original = await Deno.readFile(
    "/Users/Nino/code-friends/computer_enhance_sources/perfaware/part1/listing_0037_single_register_mov",
  );
  const asm = Array.from(decode_instructions(original)).join("\n");
  const reassembled = await assemble(asm);
  assertEquals(original, reassembled);
});

Deno.test(function instructionNameMov() {
  assertEquals(parseInstructionName(0b10001011), "MOV");
  assertEquals(parseInstructionName(0b10001000), "MOV");
  assertEquals(parseInstructionName(0b10001001), "MOV");
  assertEquals(parseInstructionName(0b10001010), "MOV");
  assertThrows(() => parseInstructionName(0b00000000));
});
