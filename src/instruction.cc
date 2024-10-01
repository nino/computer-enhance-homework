#include "instruction.hh"
#include "util.hh"
#include <cassert>
#include <utility>

namespace computer_enhance {

auto Instruction::decode(std::span<uint8_t const> const& data)
    -> std::pair<std::unique_ptr<Instruction>, std::span<uint8_t const> const> {
    switch (at(data, 0) & 0b11111100U) {
    case 0b10001000U: { // Mov
        return {std::make_unique<Mov>(std::make_unique<Register_operand>("cx"),
                                      std::make_unique<Register_operand>("bx")),
                data};
    }
    default:
        throw std::runtime_error("aaaaaaa");
    }
}

Register_operand::Register_operand(std::string name_)
    : name(std::move(name_)) {}

auto Instruction::parse(std::string_view const& assembly)
    -> std::pair<std::unique_ptr<Instruction>, std::string_view const> {
    throw std::runtime_error("aadb");
}

Mov::Mov(std::unique_ptr<Operand> src_, std::unique_ptr<Operand> dest_)
    : source(std::move(src_)), dest(std::move(dest_)) {}

/* auto Mov::parse(std::span<uint8_t const> const& data) -> std::unique_ptr<Mov> { */
/*     assert((at(data, 0) & 0b11111100U) == 0b10001000U); */
/*     /1* return std::make_unique<Mov>(at(data, 1), at(data, 2)); *1/ */
/*     throw std::runtime_error("todo"); */
/* } */

}; // namespace computer_enhance
