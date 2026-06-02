# c++ vector

C++中的`vector`是一种序列容器，表示可以改变大小的数组。以下是`vector`的一些基本用法：
### 1. 包含头文件
在使用`vector`之前，需要包含相应的头文件：
```cpp
#include <vector>
```
### 2. 声明一个vector
```cpp
std::vector<int> vec;          // 声明一个int类型的vector
std::vector<double> vecDouble; // 声明一个double类型的vector
```
### 3. 初始化vector
```cpp
std::vector<int> vec(10);            
// 创建一个包含10个int类型元素的vector，所有元素都初始化为0
std::vector<int> vec(10, 5);         
// 创建一个包含10个int类型元素的vector，所有元素都初始化为5
std::vector<int> vec{1, 2, 3, 4, 5}; 
// 创建一个包含{1, 2, 3, 4, 5}的vector
```
### 4. 添加元素
```cpp
vec.push_back(10); 
// 在vector末尾添加一个元素10
```
### 5. 访问元素
```cpp
int element = vec[0]; // 访问第一个元素
int element = vec.at(0); // 使用at()函数访问第一个元素，提供边界检查
```
### 6. 修改元素
```cpp
vec[0] = 100; // 修改第一个元素为100
```
### 7. 删除元素
```cpp
vec.pop_back(); // 删除vector末尾的元素
vec.erase(vec.begin() + 1); // 删除第二个元素
vec.clear(); // 删除所有元素
```
### 8. 获取vector的大小和容量
```cpp
size_t size = vec.size();    // 返回vector中元素的数量
size_t capacity = vec.capacity(); // 返回vector当前容量
```
### 9. 遍历vector
```cpp
for (int i = 0; i < vec.size(); ++i) {
    std::cout << vec[i] << ' ';
}
// 或者使用迭代器
for (std::vector<int>::iterator it = vec.begin(); it != vec.end(); ++it) {
    std::cout << *it << ' ';
}
// C++11起，使用范围for循环
for (const auto& value : vec) {
    std::cout << value << ' ';
}
```
### 10. 其他操作
- `vec.empty()`：检查vector是否为空
- `vec.reserve(100)`：预留至少能容纳100个元素的内存空间