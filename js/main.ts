type Operand =
  | { type: "IMMEDIATE"; value: bigint }
  | { type: "REGISTER"; name: string }
  | { type: "MEMORY_ADDRESS"; value: bigint }
  | { type: "EFFECTIVE_ADDRESS"; registers: string[] }
  | { type: "EFFECTIVE_ADDRESS+8"; registers: string[]; disp: number }
  | { type: "EFFECTIVE_ADDRESS+16"; registers: string[]; disp: number };

type InstructionName = "MOV" | "ADD";

type Instruction = {
  name: InstructionName;
  leftOperand?: Operand;
  rightOperand?: Operand;
};

function todo(): never {
  throw new Error("TODO");
}

function shouldNeverHappen(): never {
  throw new Error("This should never happen");
}

function maybeFlipOperands(
  doFlip: boolean,
  instruction: Instruction,
): Instruction {
  if (doFlip) {
    return {
      name: instruction.name,
      leftOperand: instruction.rightOperand,
      rightOperand: instruction.leftOperand,
    };
  }
  return instruction;
}

function decodeMov(
  data: Uint8Array,
  flip: boolean,
  isWord: boolean,
): [Instruction, Uint8Array] {
  const f_mod = (data[1] & 0b11000000) >> 6;
  const f_reg = (data[1] & 0b00111000) >> 3;
  const register = parseRegister(f_reg, isWord);
  const f_rm = data[1] & 0b00000111;
  switch (f_mod) {
    case 0b00: { // Memory mode (no displacement, except if R/M=110, then 16-bit displacement)
      todo();
      if (f_rm === 0b110) {
      } else {
      }
      break;
    }
    case 0b01: // Memory mode (8-bit displacement)
      todo();
      break;
    case 0b10: // Memory mode (16-bit displacement)
      todo();
      break;
    case 0b11: // Register mode (no displacement)
      return [
        maybeFlipOperands(flip, {
          name: "MOV",
          leftOperand: { type: "REGISTER", name: register },
          rightOperand: { type: "REGISTER", name: parseRegister(f_rm, isWord) },
        }),
        data.slice(2),
      ];
    default:
      shouldNeverHappen();
  }
}

/**
 * Decode one instruction. Return the decoded instruction and the remainder of
 * the input data, so the rest of the data can be decoded.
 */
function decodeInstruction(data: Uint8Array): [Instruction, Uint8Array] {
  if (data.length === 0) throw new TypeError("No data");
  if ((data[0] & 0b11111100) === 0b10001000) {
    const flip = Boolean(data[0] & 0b00000010);
    const isWord = Boolean(data[0] & 0b00000001);
    return decodeMov(data, flip, isWord);
  }

  throw new Error(`not implemented or bad opcode ${data[0].toString(2)}`);
}

/** Returns register names */
function parseEffectiveAddress(bits: number): string[] {
  switch (bits) {
    case 0b000:
      return ["BX", "SI"];
    case 0b001:
      return ["BX", "DI"];
    case 0b010:
      return ["BP", "SI"];
    case 0b011:
      return ["BP", "DI"];
    case 0b100:
      return ["SI"];
    case 0b101:
      return ["DI"];
    case 0b110:
      return ["BP"];
    case 0b111:
      return ["BX"];
    default:
      shouldNeverHappen();
  }
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

/**
 * Decode 8086 machine code and yield each instruction.
 */
export function* decode_instructions(data: Uint8Array): Generator<Instruction> {
  let rest = data;
  while (rest.length > 0) {
    const [instruction, newRest] = decodeInstruction(rest);
    console.log({ instruction });
    yield instruction;
    rest = newRest;
  }
}

export function stringify_operand(operand: Operand): string {
  switch (operand.type) {
    case "IMMEDIATE":
      return operand.value.toString();
    case "REGISTER":
      return operand.name;
    default:
      todo();
  }
}

export function stringify_instruction(instruction: Instruction): string {
  const operands = [];
  if (instruction.rightOperand) {
    operands.push(stringify_operand(instruction.rightOperand));
  }
  if (instruction.leftOperand) {
    operands.push(stringify_operand(instruction.leftOperand));
  }
  return [instruction.name, operands.join(", ")].join(" ");
}

if (import.meta.main) {
  console.log("Hello");
}
