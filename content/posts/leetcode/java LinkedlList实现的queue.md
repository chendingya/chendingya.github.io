2025.1.4

# ArrayDeque

`ArrayDeque` 是 Java 中的一个类，它实现了 `Deque` 接口，可以作为栈（Stack）或者队列（Queue）使用。`ArrayDeque` 是基于数组实现的，因此它具有更好的性能特性，特别是对于固定大小的操作集合，它比 `LinkedList` 更高效。

以下是 `ArrayDeque` 的一些基本使用方法：

### 初始化

```
import java.util.ArrayDeque;

// 创建一个空的 ArrayDeque
ArrayDeque<Integer> deque = new ArrayDeque<>();

// 创建一个带有初始元素的 ArrayDeque
ArrayDeque<Integer> dequeWithElements = new ArrayDeque<>(Arrays.asList(1, 2, 3));
```

### 作为队列使用

```
// 添加元素到队列尾部
deque.offer(1);
deque.offer(2);
deque.offer(3);

// 检查队列头部元素
Integer head = deque.peek(); // 返回队列头部元素，但不删除它

// 移除队列头部元素
Integer removedHead = deque.poll(); // 返回并移除队列头部元素

// 检查队列是否为空
boolean isEmpty = deque.isEmpty();

// 获取队列的大小
int size = deque.size();
```

### 作为栈使用

```
// 将元素推入栈顶
deque.push(1);
deque.push(2);
deque.push(3);

// 查看栈顶元素
Integer top = deque.peek(); // 返回栈顶元素，但不删除它

// 移除栈顶元素
Integer poppedTop = deque.pop(); // 返回并移除栈顶元素
```

### 其他常用方法

```
// 检查是否包含某个元素
boolean contains = deque.contains(2);

// 清空队列/栈
deque.clear();

// 使用迭代器遍历
for (Integer item : deque) {
    System.out.println(item);
}

// 或者使用增强的 for 循环
Iterator<Integer> iterator = deque.iterator();
while (iterator.hasNext()) {
    System.out.println(iterator.next());
}
```

### 注意事项

- `ArrayDeque` 不支持插入 `null` 元素，如果你尝试插入 `null`，它将抛出 `NullPointerException`。
- `ArrayDeque` 没有容量限制，它会根据需要自动增长。
- 与 `LinkedList` 相比，`ArrayDeque` 在大多数操作上通常更快，特别是对于固定大小的操作集合。

使用 `ArrayDeque` 时，你应该根据你的具体需求来选择它作为队列还是栈。由于 `ArrayDeque` 实现了 `Deque` 接口，它可以很容易地在这两种数据结构之间切换。

# LinkedList

`LinkedList`在Java中实现了`Queue`接口，因此它可以被当作队列使用。

### 1. 创建`LinkedList`队列

要创建一个`LinkedList`并将其用作队列，可以这样做：

```
import java.util.Queue;
import java.util.LinkedList;

Queue<String> queue = new LinkedList<>();
```

### 2. 向队列中添加元素

可以使用`add()`或`offer()`方法向队列中添加元素。`add()`方法在添加失败时抛出异常，而`offer()`方法在添加失败时返回`false`。

```
queue.add("Element1"); // 添加元素到队列尾部
queue.offer("Element2"); // 添加元素到队列尾部
```

### 3. 从队列中移除元素

可以使用`remove()`或`poll()`方法从队列中移除元素。`remove()`方法在队列为空时抛出异常，而`poll()`方法在队列为空时返回`null`。

```
String removedElement = queue.remove(); // 移除队列头部的元素
String polledElement = queue.poll(); // 移除队列头部的元素，如果队列为空，返回null
```

### 4. 查看队列头部的元素

可以使用`element()`或`peek()`方法查看队列头部的元素。`element()`方法在队列为空时抛出异常，而`peek()`方法在队列为空时返回`null`。

```
String headElement = queue.element(); // 查看队列头部的元素，不删除
String peekedElement = queue.peek(); // 查看队列头部的元素，不删除，如果队列为空，返回null
```

### 5. 完整示例

以下是一个使用`LinkedList`作为队列的完整示例：

```
import java.util.Queue;
import java.util.LinkedList;

public class LinkedListQueueExample {
    public static void main(String[] args) {
        Queue<String> queue = new LinkedList<>();

        // 添加元素
        queue.offer("Apple");
        queue.offer("Banana");
        queue.offer("Cherry");

        // 查看队列头部元素
        System.out.println("Queue head: " + queue.peek()); // 输出: Queue head: Apple

        // 移除并打印所有元素
        while (!queue.isEmpty()) {
            String element = queue.poll();
            System.out.println("Removed: " + element);
        }

        // 队列现在为空
        System.out.println("Is the queue empty? " + queue.isEmpty()); // 输出: Is the queue empty? true
    }
}
```

在这个例子中，我们创建了一个`LinkedList`队列，添加了三个元素，然后逐个移除并打印它们。最后，我们检查队列是否为空。

