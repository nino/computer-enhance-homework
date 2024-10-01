class Instruction {
  /**
   * Decode one instruction. Return the decoded instruction and the remainder of
   * the input data, so the rest of the data can be decoded.
   */
  static decode(_data: Uint8Array): [Instruction, Uint8Array] {
    throw new Error("not implemented");
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
  static decode(data: Uint8Array): [Mov, Uint8Array] {
    return [new Mov(), data];
  }
}

/**
 * Decode 8086 machine code instructions and return an array of instructions.
 */
export function decode_instructions(data: Uint8Array): Array<Instruction> {
  let rest = data;
  const instructions: Array<Instruction> = [];
  while (rest.length > 0) {
    const [instruction, newRest] = Instruction.decode(data);
    instructions.push(instruction);
    rest = newRest;
  }
  return instructions;
}

if (import.meta.main) {
  console.log("Hello");
}
