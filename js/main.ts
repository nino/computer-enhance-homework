class Instruction {
  /**
   * Decode one instruction. Return the decoded instruction and the remainder of
   * the input data, so the rest of the data can be decoded.
   */
  static decode(data: Uint8Array): [Instruction, Uint8Array] {
    if (data.length === 0) throw new TypeError("No data");
  }
}

/**
 * Instruction class corresponding to the MOV mnemonic.
 */
export class Mov extends Instruction {
  /**
   * Assuming `data` begins with a valid MOV instruction, decode that, and
   * return it and the remainder of the machine code. If anything goes wrong,
   * throw.
   */
  static override decode(data: Uint8Array): [Mov, Uint8Array] {
    return [new Mov(), data];
  }
}

/**
 * Decode 8086 machine code instructions and return an array of instructions.
 */
export function* decode_instructions(data: Uint8Array): Generator<Instruction> {
  let rest = data;
  while (rest.length > 0) {
    const [instruction, newRest] = Instruction.decode(data);
    yield instruction;
    rest = newRest;
  }
}

if (import.meta.main) {
  console.log("Hello");
}
