#include <iostream>
#include "instruction.hh"

int main(int argc, char const **argv) {
  for (int i = 0; i < argc; i++) {
    std::cout << argv[i] << std::endl;
  }
  std::cout << "yo" << std::endl;
}
