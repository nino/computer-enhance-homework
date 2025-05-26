type Operand =
  | { type: "IMMEDIATE"; value: bigint }
  | { type: "REGISTER"; name: string }
  | { type: "MEMORY_ADDRESS"; value: bigint }
  | { type: "EFFECTIVE_ADDRESS"; registers: string[] }
  | { type: "EFFECTIVE_ADDRESS+8"; registers: string[]; disp: number }
  | { type: "EFFECTIVE_ADDRESS+16"; registers: string[]; disp: number };

type InstructionName = "MOV" | "ADD" | "SUB" | "PUSH";

type Instruction = {
  name: InstructionName;
  size_modifier?: "BYTE" | "WORD";
  dest_operand?: Operand;
  source_operand?: Operand;
};

function todo(): never {
  throw new Error("TODO");
}

function shouldNeverHappen(): never {
  throw new Error("This should never happen");
}

function immediate(val: number | bigint): Operand {
  return {
    type: "IMMEDIATE",
    value: typeof val === "number" ? BigInt(val) : val,
  };
}

function reg(name: string): Operand {
  return { type: "REGISTER", name };
}

function maybe_flip_operands(
  doFlip: boolean,
  instruction: Instruction,
): Instruction {
  if (doFlip) {
    return {
      name: instruction.name,
      source_operand: instruction.dest_operand,
      dest_operand: instruction.source_operand,
    };
  }
  return instruction;
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
      return shouldNeverHappen();
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

const typcial_pattern_opcode_mnemonics: Record<number, InstructionName> = {
  0b00000000: "ADD",
  0b10001000: "MOV",
  0b11000100: "MOV",
} as const;

function decode_instruction2(data: Uint8Array): [Instruction, Uint8Array] {
  let mnemonic: InstructionName;
  let bytes_eaten = 1;

  // Check for 1-byte instructions
  if ((data[0] & 0b11111000) === 0b01010000) {
    return [
      {
        name: "PUSH",
        source_operand: {
          type: "REGISTER",
          name: parseRegister(data[0] & 0b00000111, false),
        },
      },
      data.subarray(bytes_eaten),
    ];
  }

  if (
    (data[0] & 0b11111110) === 0b00000100 ||
    (data[0] & 0b11111110) === 0b00101100
  ) {
    mnemonic = (data[0] & 0b11111110) === 0b00000100 ? "ADD" : "SUB";
    const f_w = Boolean(data[0] & 0b00000001);
    let value = BigInt(data[1]);
    bytes_eaten = 2;
    if (f_w) {
      value += BigInt(data[2]) << 8n;
      bytes_eaten = 3;
    }
    return [
      {
        name: mnemonic,
        dest_operand: f_w ? reg("AX") : reg("AL"),
        source_operand: immediate(value),
      },
      data.subarray(bytes_eaten),
    ];
  }

  // Check for immediate-to-register stuff
  if ((data[0] & 0b11110000) === 0b10110000) {
    mnemonic = "MOV";
    const f_w = Boolean(data[0] & 0b00001000);
    const f_reg = data[0] & 0b00000111;
    const register = parseRegister(f_reg, f_w);
    let value = BigInt(data[1]);
    bytes_eaten = 2;
    if (f_w) {
      value += BigInt(data[2] << 8);
      bytes_eaten = 3;
    }
    return [
      {
        name: mnemonic,
        dest_operand: reg(register),
        source_operand: immediate(value),
      },
      data.subarray(bytes_eaten),
    ];
  }

  const opcode = data[0] & 0b11111100;

  // Check for [opcode, s, w] [mod, extra, r/m] (disp-lo) (disp-hi) (data-lo) (data-hi)

  if (opcode === 0b10000000 && (data[1] & 0b00111000) === 0b00000000) {
    // Immediate to register/memory
    mnemonic = "ADD";
    const f_s = Boolean(data[0] & 0b00000010);
    const f_w = Boolean(data[0] & 0b00000001);
    const f_mod = (data[1] & 0b11000000) >> 6;
    const f_rm = (data[1] & 0b00000111) >> 0;
    const register = parseRegister(f_rm, f_w);
    bytes_eaten = 2;

    switch (f_mod) {
      case 0b00: { // Memory mode (no displacement, except if R/M=110, then 16-bit displacement)
        if (f_rm !== 0b110) {
          let value = BigInt(data[2]);
          bytes_eaten = 3;
          if (f_w) {
            value += BigInt(data[3] << 8);
            bytes_eaten = 4;
          }

          return [
            {
              name: mnemonic,
              size_modifier: f_w ? "WORD" : "BYTE",
              dest_operand: reg(register),
              source_operand: immediate(value),
            },
            data.subarray(bytes_eaten),
          ];
        } else {
          let value = BigInt(data[4]);
          bytes_eaten = 5;
          if (f_w) {
            value += BigInt(data[5] << 8);
            bytes_eaten = 6;
          }

          return [
            {
              name: mnemonic,
              size_modifier: f_w ? "WORD" : "BYTE",
              source_operand: immediate(value),
              dest_operand: {
                type: "EFFECTIVE_ADDRESS",
                registers: parseEffectiveAddress(f_rm),
              },
            },
            data.subarray(bytes_eaten),
          ];
        }
      }
      case 0b01: // Memory mode (8-bit displacement)
      {
        const disp = data[2];
        return [
          {
            name: mnemonic,
            size_modifier: f_w ? "WORD" : "BYTE",
            source_operand: { type: "REGISTER", name: register },
            dest_operand: {
              type: "EFFECTIVE_ADDRESS+8",
              registers: parseEffectiveAddress(f_rm),
              disp,
            },
          },
          data.subarray(3),
        ];
      }
      case 0b10: // Memory mode (16-bit displacement)
      {
        const disp = data[2] + (data[3] << 8);
        let value = BigInt(data[4]);
        bytes_eaten = 5;
        if (!f_s && f_w) {
          value += BigInt(data[5]) << 8n;
          bytes_eaten = 6;
        }
        return [
          {
            name: mnemonic,
            size_modifier: f_w ? "WORD" : "BYTE",
            source_operand: immediate(value),
            dest_operand: {
              type: "EFFECTIVE_ADDRESS+16",
              registers: parseEffectiveAddress(f_rm),
              disp,
            },
          },
          data.subarray(bytes_eaten),
        ];
      }
      case 0b11: // Register mode (no displacement)
      {
        let value = BigInt(data[2]);
        bytes_eaten = 3;
        if (!f_s && f_w) {
          value += BigInt(data[3] << 8);
          bytes_eaten = 4;
        }
        return [
          {
            name: mnemonic,
            size_modifier: f_w ? "WORD" : "BYTE",
            source_operand: { type: "IMMEDIATE", value },
            dest_operand: { type: "REGISTER", name: register },
          },
          data.subarray(bytes_eaten),
        ];
      }
      default:
        return shouldNeverHappen();
    }
  }

  // Check for the typical pattern of
  // [ . . . . . . . . ] [ . . . . . . . . ] ( . . . . . . . . ) ( . . . . . . . . ) ( . . . . . . . . ) ( . . . . . . . . )
  //   --OP-CODE-- D W     MOD -REG- -R/M-      low disp/data      high disp/data         low data            high data
  const f_d = Boolean(data[0] & 0b00000010);
  const f_w = Boolean(data[0] & 0b00000001);
  const f_mod = (data[1] & 0b11000000) >> 6;
  const f_reg = (data[1] & 0b00111000) >> 3;
  const f_rm = (data[1] & 0b00000111) >> 0;
  bytes_eaten = 2;
  if (opcode in typcial_pattern_opcode_mnemonics) {
    mnemonic = typcial_pattern_opcode_mnemonics[opcode];
  } else {throw new Error(
      `Unknown data: ${binary_to_string(data.subarray(0, 5))}`,
    );}
  const register = parseRegister(f_reg, f_w);
  switch (f_mod) {
    case 0b00: { // Memory mode (no displacement, except if R/M=110, then 16-bit displacement)
      if (f_rm === 0b110) {
        const mem_addr = data[1] + (data[2] << 8);
        return [
          maybe_flip_operands(f_d, {
            name: mnemonic,
            dest_operand: { type: "REGISTER", name: register },
            source_operand: { type: "MEMORY_ADDRESS", value: BigInt(mem_addr) },
          }),
          data.subarray(4),
        ];
      } else {
        return [
          maybe_flip_operands(f_d, {
            name: mnemonic,
            source_operand: { type: "REGISTER", name: register },
            dest_operand: {
              type: "EFFECTIVE_ADDRESS",
              registers: parseEffectiveAddress(f_rm),
            },
          }),
          data.subarray(2),
        ];
      }
    }
    case 0b01: // Memory mode (8-bit displacement)
    {
      const disp = data[2];
      return [
        maybe_flip_operands(f_d, {
          name: mnemonic,
          source_operand: { type: "REGISTER", name: register },
          dest_operand: {
            type: "EFFECTIVE_ADDRESS+8",
            registers: parseEffectiveAddress(f_rm),
            disp,
          },
        }),
        data.subarray(3),
      ];
    }
    case 0b10: // Memory mode (16-bit displacement)
    {
      const disp = data[2] + (data[3] << 8);
      return [
        maybe_flip_operands(f_d, {
          name: mnemonic,
          source_operand: { type: "REGISTER", name: register },
          dest_operand: {
            type: "EFFECTIVE_ADDRESS+8",
            registers: parseEffectiveAddress(f_rm),
            disp,
          },
        }),
        data.subarray(4),
      ];
    }
    case 0b11: // Register mode (no displacement)
      return [
        maybe_flip_operands(f_d, {
          name: mnemonic,
          source_operand: { type: "REGISTER", name: register },
          dest_operand: {
            type: "REGISTER",
            name: parseRegister(f_rm, f_w),
          },
        }),
        data.subarray(2),
      ];
    default:
      return shouldNeverHappen();
  }
}

/**
 * Decode 8086 machine code and yield each instruction.
 */
export function* decode_instructions(data: Uint8Array): Generator<Instruction> {
  let rest = data;
  while (rest.length > 0) {
    const [instruction, newRest] = decode_instruction2(rest);
    console.log(stringify_instruction(instruction));
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
    case "MEMORY_ADDRESS":
      return todo();
    case "EFFECTIVE_ADDRESS":
      return `[${operand.registers.join(" + ")}]`;
    case "EFFECTIVE_ADDRESS+8":
    case "EFFECTIVE_ADDRESS+16":
      return `[${[...operand.registers, operand.disp.toString()].join(" + ")}]`;
    default:
      return todo();
  }
}

export function stringify_instruction(instruction: Instruction): string {
  const operands = [];
  if (instruction.dest_operand) {
    operands.push(stringify_operand(instruction.dest_operand));
  }
  if (instruction.source_operand) {
    operands.push(stringify_operand(instruction.source_operand));
  }
  const result: Array<string> = [instruction.name];
  if (instruction.size_modifier) result.push(instruction.size_modifier);
  result.push(operands.join(", "));
  return result.join(" ");
}

function binary_to_string(data: Uint8Array): string {
  const str_builder: Array<string> = [];
  for (const num of data) {
    str_builder.push(num.toString(2).padStart(8, "0"));
  }
  return str_builder.join(" ");
}

if (import.meta.main) {
  console.log("Hello");
}
