#pragma once

#include <memory>
#include <span>
#include <string>

namespace computer_enhance {

/*
 * Plan:
 *
 * Decode:
 * - Given a sequence of bytes and an offset, check the first one. Depending
 *   on the value, pick the right `Instruction` subclass and call `::parse`.
 */

class Operand {
  public:
    Operand() = default;
    Operand(const Operand&) = default;
    Operand(Operand&&) = delete;
    auto operator=(const Operand&) -> Operand& = default;
    auto operator=(Operand&&) -> Operand& = delete;
    virtual ~Operand() = default;

    [[nodiscard]] virtual auto serialize() const -> std::string = 0;

    static auto
    parse(std::span<uint8_t> const& data) -> std::unique_ptr<Operand> = delete;
};

class OpRegister : public Operand {
  public:
    explicit OpRegister(int value_);
    [[nodiscard]] auto serialize() const -> std::string override;

  private:
    int value;
};

class Instruction {
  public:
    Instruction() = default;
    Instruction(const Instruction&) = default;
    Instruction(Instruction&&) = delete;
    auto operator=(const Instruction&) -> Instruction& = default;
    auto operator=(Instruction&&) -> Instruction& = delete;
    virtual ~Instruction() = default;

    [[nodiscard]] virtual auto serialize() const -> std::string = 0;

    static auto parse(std::span<uint8_t> const& data)
        -> std::unique_ptr<Instruction> = delete;
};

class Mov : public Instruction {
  private:
    /* bool flip_operands = false; */
    std::unique_ptr<Operand> source;
    std::unique_ptr<Operand> dest;

  public:
    Mov(std::unique_ptr<Operand> src, std::unique_ptr<Operand> dest);

    [[nodiscard]] auto serialize() const -> std::string override;

    static auto
    parse(std::span<uint8_t const> const& data) -> std::unique_ptr<Mov>;
};

}; // namespace computer_enhance
