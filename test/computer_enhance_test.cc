#include "../src/instruction.hh"
#include <fstream>
#include <gtest/gtest.h>
#include <iostream>

namespace computer_enhance {

auto read_binary_file(const std::string& filePath) -> std::vector<uint8_t> {
    std::ifstream file(filePath, std::ios::binary);

    if (!file.is_open()) {
        throw std::runtime_error("Unable to open file: " + filePath);
    }

    std::vector<char> buffer(std::istreambuf_iterator<char>(file), {});
    return {buffer.begin(), buffer.end()};
}

TEST(Decode_instruction, Mov_register_to_register) {
    auto data = read_binary_file("../computer_enhance_sources/perfaware/part1/"
                                 "listing_0037_single_register_mov");
    auto [decoded, rest] = Instruction::decode(data);
    auto reg_cx = std::make_unique<Register_operand>("cx");
    auto reg_bx = std::make_unique<Register_operand>("bx");
    /* EXPECT_EQ(decoded, Mov(reg_cx, reg_bx)); */
}

TEST(ParseInstruction, Mov_register_to_register) {
    auto [mov, rest] = Instruction::parse("mov cx, bx");
    auto reg_cx = std::make_unique<Register_operand>("cx");
    auto reg_bx = std::make_unique<Register_operand>("bx");
    /* EXPECT_EQ(mov, Mov(reg_cx, reg_bx)); */
}

}; // namespace computer_enhance
