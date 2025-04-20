type Operand =
  | { type: "IMMEDIATE"; value: Uint8Array }
  | { type: "MEMORY"; value: bigint }
  | { type: "REGISTER"; name: string };

type InstructionName = "MOV" | "ADD";

type Instruction = {
  name: InstructionName;
  leftOperand?: Operand;
  rightOperand?: Operand;
};

/**
 * Decode one instruction. Return the decoded instruction and the remainder of
 * the input data, so the rest of the data can be decoded.
 */
function decodeInstruction(data: Uint8Array): [Instruction, Uint8Array] {
  if (data.length === 0) throw new TypeError("No data");
  const flipOperands = parseIsFlipped(data[0]);
  const instruction = {
    name: parseInstructionName(data[0]),
  };

  if ((data[0] & 0b11111100) === 0b10001000) {
    return decodeMovMemoryOrRegisterToOrFromRegister(data);
  }

  throw new Error("Unrecognised opcode");
}

function parseIsFlipped(bits: number): boolean {
  return (bits & 0b11111110) === 0b10001010 ||
    (bits & 0b1111111) === 0b00000010;
}

export function parseInstructionName(bits: number): InstructionName {
  const isMov = (bits & 0b11111100) === 0b10001000 ||
    (bits & 0b11111110) === 0b11000110 || (bits & 0b11110000) === 0b10110000;
  if (isMov) {
    return "MOV";
  }
  throw new Error("Unrecognised opcode");
}

function parseRegister(bits: number, isWord: boolean): string {
  const threeBits = bits & 0b111;
  switch (threeBits) {
    case 0b000:
      return isWord ? "AX" : "AL";
    case 0b001:
      return isWord ? "CX" : "CL";
    case 0b010:
      return isWord ? "DX" : "DL";
    case 0b011:
      return isWord ? "BX" : "BL";
    case 0b100:
      return isWord ? "SP" : "AH";
    case 0b101:
      return isWord ? "BP" : "CH";
    case 0b110:
      return isWord ? "SI" : "DH";
    case 0b111:
      return isWord ? "DI" : "BH";
    default:
      throw new Error("Invalid register bits");
  }
}

/** MOV instruction: Memory/register to/from register. */
const parsers = {
  0b1001000: function decodeMovByteMemoryFromRegister(
    data: Uint8Array,
  ): [Instruction, Uint8Array] {

  },
  0b1001010: function decodeMovByteMemoryToRegister(
    data: Uint8Array,
  ): [Instruction, Uint8Array] {

  },
  0b1001001: function decodeMovWordMemoryFromRegister(
    data: Uint8Array,
  ): [Instruction, Uint8Array] {

  },
  0b1001011: function decodeMovWordMemoryToRegister(
    data: Uint8Array,
  ): [Instruction, Uint8Array] {

  }
}

/**
 * Decode 8086 machine code and yield each instruction.
 */
export function* decode_instructions(
  data: Uint8Array,
): Generator<Instruction> {
  let rest = data;
  while (rest.length > 0) {
    const [instruction, newRest] = decodeInstruction(rest);
    yield instruction;
    rest = newRest;
  }
}

if (import.meta.main) {
  console.log("Hello");
}
