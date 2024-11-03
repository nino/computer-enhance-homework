class Instruction {
  /**
   * Decode one instruction. Return the decoded instruction and the remainder of
   * the input data, so the rest of the data can be decoded.
   */
  static decode(data: Uint8Array): [Instruction, Uint8Array] {
    if (data.length === 0) throw new TypeError("No data");

    if ((data[0] & 0b11111100) === 0b10001000) {
      return Mov_rm_to_from_r.decode(data);
    }

    throw new Error("Unrecognised opcode");
  }
}

/**
 * MOV instruction: Memory/register to/from register.
 */
export class Mov_rm_to_from_r extends Instruction {
  /**
   * Assuming `data` begins with a valid MOV instruction, decode that, and
   * return it and the remainder of the machine code. If anything goes wrong,
   * throw.
   */
  static override decode(data: Uint8Array): [Mov_rm_to_from_r, Uint8Array] {
    console.log(data, data.slice(1));
    return [new Mov_rm_to_from_r(), data.slice(1)];
  }
}

/**
 * Decode 8086 machine code and yield each instruction.
 */
export function* decode_instructions(data: Uint8Array): Generator<Instruction> {
  let rest = data;
  while (rest.length > 0) {
    const [instruction, newRest] = Instruction.decode(rest);
    yield instruction;
    rest = newRest;
  }
}

if (import.meta.main) {
  console.log("Hello");
}
