cmake_minimum_required(VERSION 3.22.0)
project(computer_enhance)
add_compile_options(-std=c++23)
add_compile_options(-Wall)
add_compile_options(-Wextra)
add_compile_options(-Wpedantic)
add_compile_options(-Werror)
add_compile_options(-Wno-unused-parameter)
add_compile_options(-Wno-unused-variable)
add_compile_options(-Wno-unused-function)
add_compile_options(-Wno-unused-but-set-variable)
add_compile_options(-Wno-unused-but-set-parameter)
add_compile_options(-Wno-missing-field-initializers)
add_compile_options(-Wno-missing-braces)
add_compile_options(-Wno-unknown-pragmas)
add_compile_options(-Wno-strict-aliasing)
add_compile_options(-Wno-implicit-fallthrough)
add_compile_options(-Wno-sign-compare)
add_compile_options(-Wno-implicit-int-float-conversion)
add_compile_options(-Wno-implicit-float-conversion)
add_compile_options(-Wno-enum-compare-switch)
add_compile_options(-Wno-enum-compare)
add_compile_options(-Wno-enum-compare-switch)

set(CMAKE_CXX_STANDARD 23)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

include(FetchContent)

FetchContent_Declare(
  googletest
  URL https://github.com/google/googletest/archive/03597a01ee50ed33e9dfd640b249b4be3799d395.zip
)
# For Windows: Prevent overriding the parent project's compiler/linker settings
set(gtest_force_shared_crt ON CACHE BOOL "" FORCE)

FetchContent_MakeAvailable(googletest)

set(SOURCES
  src/main.cc
  src/instruction.cc
)

add_library(computer_enhance ${SOURCES})
target_link_libraries(
  computer_enhance
)

set(TEST_SOURCES
  test/computer_enhance_test.cc
)

add_executable(
  computer_enhance_test
  ${TEST_SOURCES}
)
target_link_libraries(
  computer_enhance_test
  GTest::gtest_main
  computer_enhance
)
include(GoogleTest)
gtest_discover_tests(computer_enhance_test)
