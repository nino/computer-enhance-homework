#include "../src/instruction.hh"
#include <gtest/gtest.h>

    using computer_enhance::Mov;
    using computer_enhance::OpRegister;

TEST(ParseInstruction, Mov_register_to_register) {

    auto mov = Mov(4, 2);
    EXPECT_EQ(mov.serialize(), "hello");
}
