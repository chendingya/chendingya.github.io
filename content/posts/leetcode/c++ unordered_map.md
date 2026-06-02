# C++ unordered_map

unordered_map是一个将key和value关联起来的容器，它可以高效的根据单个key值查找对应的value。

### 内部实现机理

* map： map内部实现了一个**红黑树**，该结构具有自动排序的功能，因此map内部的所有元素都是有序的，红黑树的每一个节点都代表着map的一个元素，因此，对于map进行的查找，删除，添加等一系列的操作都相当于是对红黑树进行这样的操作，故红黑树的效率决定了map的效率。
* unordered_map: unordered_map内部实现了一个**哈希表**，因此其元素的排列顺序是杂乱的，无序的

1. **键的唯一性**：在 `unordered_map` 中，每个键必须是唯一的。
2. **元素顺序**：与 `map` 不同，`unordered_map` 不保证元素的顺序。这是因为元素是按照它们的哈希值来存储的。
3. **性能**：对于大多数操作（如插入、删除、查找），`unordered_map` 通常比 `map` 快，尤其是在元素数量较多时。
4. **内存使用**：由于哈希表的实现，`unordered_map` 可能比 `map` 使用更多的内存。

### 常用成员函数：

- `insert(pair)`: 插入一个键值对。
- `operator[]`: 访问或插入一个键值对。
- `find(key)`: 查找一个键，如果找到返回迭代器，否则返回 `end()`。
- `erase(key)`: 删除由键指定的元素。
- `size()`: 返回容器中元素的数量。
- `empty()`: 检查容器是否为空。

```c++
#include <iostream>
#include <unordered_map>

int main() {
    // 创建一个 unordered_map，键和值都是 int 类型
    std::unordered_map<int, int> umap;

    // 插入键值对
    umap.insert(std::make_pair(1, 100));
    umap[2] = 200; // 更简便的插入方法

    // 访问元素
    std::cout << "Element at key 1: " << umap[1] << std::endl;

    // 检查键是否存在
    if (umap.find(3) == umap.end()) {
        std::cout << "Key 3 not found" << std::endl;
    }

    // 遍历 unordered_map
    for (const auto& pair : umap) {
        std::cout << pair.first << " : " << pair.second << std::endl;
    }

    return 0;
}

```

[138. 随机链表的复制 - 力扣（LeetCode）](https://leetcode.cn/problems/copy-list-with-random-pointer/description/)

```c++
/*
// Definition for a Node.
class Node {
public:
    int val;
    Node* next;
    Node* random;
    
    Node(int _val) {
        val = _val;
        next = NULL;
        random = NULL;
    }
};
*/

class Solution {
public:
    Node* copyRandomList(Node* head) {
        if(!head)
            return NULL;
        std::unordered_map<Node*, Node*> map;
        Node *curr = head;
        while(curr){
            map[curr] = new Node(curr->val);
            curr = curr->next;
        }
        curr = head;
        while(curr){
            map[curr]->next = map[curr->next];
            map[curr]->random = map[curr->random];
            curr = curr->next;
        }
        return map[head];
    }
};
```

