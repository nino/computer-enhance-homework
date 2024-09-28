#include <span>

namespace computer_enhance {

/// Try to get the element at index `index` inside `data`. Throws if the index
/// is out of bounds.
template <class T> auto at(std::span<T> const& data, size_t index) -> T {
    if (data.size() > index) {
        return data[index];
    }
    throw std::exception();
}

}; // namespace computer_enhance
