#include "instruction.hh"
#include "util.hh"
#include <cassert>

namespace computer_enhance {

Mov::Mov(std::unique_ptr<Operand> src_, std::unique_ptr<Operand> dest_)
    : source(std::move(src_)), dest(std::move(dest_)) {}

[[nodiscard]] auto Mov::serialize() const -> std::string {
    // Implementation details...
    return "MOV R" + std::to_string(dest_register) + ", R" +
           std::to_string(source_register);
}

auto Mov::parse(std::span<uint8_t const> const& data) -> std::unique_ptr<Mov> {
    assert((at(data, 0) & 0b11111100U) == 0b10001000U);
    return std::make_unique<Mov>(at(data, 1), at(data, 2));
}

OpRegister::OpRegister(int value_) : value(value_) {}

[[nodiscard]] auto OpRegister::serialize() const -> std::string {
    return std::to_string(value);
}

}; // namespace computer_enhance
