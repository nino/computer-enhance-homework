import { assertEquals } from "@std/assert";
import { decode_instructions } from "./main.ts";
import { assemble } from "./assemble.ts";

Deno.test(async function mov_single_register() {
  const original = await Deno.readFile(
    "/Users/Nino/code-friends/computer_enhance_sources/perfaware/part1/listing_0037_single_register_mov",
  );
  const asm = Array.from(decode_instructions(original)).join('\n');
  const reassembled = await assemble(asm);
  assertEquals(original, reassembled);
});
