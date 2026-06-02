---
title: leetcode刷题-136、137只出现一次的数字
date: 2023-10-15 11:40:36
tags: 位运算
categories: leetcode

---

# [136. 只出现一次的数字](https://leetcode.cn/problems/single-number/)

给你一个 **非空** 整数数组 `nums` ，除了某个元素只出现一次以外，其余每个元素均出现两次。找出那个只出现了一次的元素。

你必须设计并实现线性时间复杂度的算法来解决此问题，且该算法只使用常量额外空间。



**示例 1 ：**

```
输入：nums = [2,2,1]
输出：1
```

**示例 2 ：**

```
输入：nums = [4,1,2,1,2]
输出：4
```

**示例 3 ：**

```
输入：nums = [1]
输出：1
```

 

**提示：**

- `1 <= nums.length <= 3 * 104`
- `-3 * 104 <= nums[i] <= 3 * 104`
- 除了某个元素只出现一次以外，其余每个元素均出现两次。



# 题解

如何才能做到线性时间复杂度和常数空间复杂度呢？

答案是使用位运算。对于这道题，可使用异或运算 ⊕。异或运算有以下三个性质。

任何数和 000 做异或运算，结果仍然是原来的数，即 a⊕0=a
任何数和其自身做异或运算，结果是 000，即 a⊕a=0
异或运算满足交换律和结合律，即 a⊕b⊕a=b⊕a⊕a=b⊕(a⊕a)=b⊕0=b



```java
class Solution {
    public int singleNumber(int[] nums) {
        int single = 0;
        for (int num : nums) {
            single ^= num;
        }
        return single;
    }
}
```

**复杂度分析**

- 时间复杂度：O(n)，其中 nn*n* 是数组长度。只需要对数组遍历一次。
- 空间复杂度：O(1)。



# [137. 只出现一次的数字 II](https://leetcode.cn/problems/single-number-ii/)

给你一个整数数组 `nums` ，除某个元素仅出现 **一次** 外，其余每个元素都恰出现 **三次 。**请你找出并返回那个只出现了一次的元素。

你必须设计并实现线性时间复杂度的算法且使用常数级空间来解决此问题。

 **示例 1：**

```
输入：nums = [2,2,3,2]
输出：3
```

**示例 2：**

```
输入：nums = [0,1,0,1,0,1,99]
输出：99
```

 

**提示：**

- `1 <= nums.length <= 3 * 104`
- `-231 <= nums[i] <= 231 - 1`
- `nums` 中，除某个元素仅出现 **一次** 外，其余每个元素都恰出现 **三次**

# 题解

## 方法一：哈希表

思路与算法

我们可以使用哈希映射统计数组中每个元素的出现次数。对于哈希映射中的每个键值对，键表示一个元素，值表示其出现的次数。

在统计完成后，我们遍历哈希映射即可找出只出现一次的元素。

```java
class Solution {
    public int singleNumber(int[] nums) {
        Map<Integer, Integer> freq = new HashMap<Integer, Integer>();
        for (int num : nums) {
            freq.put(num, freq.getOrDefault(num, 0) + 1);
        }
        int ans = 0;
        for (Map.Entry<Integer, Integer> entry : freq.entrySet()) {
            int num = entry.getKey(), occ = entry.getValue();
            if (occ == 1) {
                ans = num;
                break;
            }
        }
        return ans;
    }
}
```

复杂度分析

复杂度分析

时间复杂度：O(n)，其中 nnn 是数组的长度。

空间复杂度：O(n)。哈希映射中包含最多 ⌊n/3⌋+1个元素，即需要的空间为 O(n)。

## 方法三：数字电路设计

篇幅太长详见题解，这里只贴代码

方法三以及后续进行优化的方法四需要读者有一定的数字电路设计的基础。读者需要对以下知识：

> 简单的门电路（例如与门、异或门等）
>
> 给定数字电路输入和输出（真值表），使用门电路设计出一种满足要求的数字电路结构
>

有一定的了解。

```java
class Solution {
    public int singleNumber(int[] nums) {
        int a = 0, b = 0;
        for (int num : nums) {
            int aNext = (~a & b & num) | (a & ~b & ~num), bNext = ~a & (b ^ num);
            a = aNext;
            b = bNext;
        }
        return b;
    }
}
```

复杂度分析

时间复杂度：O(n)，其中 n 是数组的长度。

空间复杂度：O(1)。

