# 03 质量属性、ASR 与 ADD

**本页是复习枢纽：**架构设计不是从“我要高性能”开始，而是从可度量的质量属性场景开始；识别 **ASR** 后，先用 **通用设计策略（Generic Design Strategies）** 把问题抽象、分解、迭代和复用，再用 **tactics / patterns** 与七类设计决策形成可评估方案，最终进入 ADD 的迭代设计。

# 需求先分类，架构才有依据

## 脑图：质量属性、ASR 与 ADD 怎么串起来

**记忆方法：**不要分开背 ASR、场景、tactic 和 ADD；考试里它们通常是一条从需求到架构选择的连续路径。

## 通用设计策略：从 ASR 到设计概念的桥

**放在这里的原因：**质量属性场景和 **ASR** 说明“为什么要设计”，**通用设计策略（Generic Design Strategies）** 说明“先怎样组织设计思路”，**tactics / patterns** 说明“用什么机制和结构满足质量属性”。

- **Abstraction / 抽象：**隐藏实现细节，只暴露关键接口和职责；例：把不同支付渠道抽象成统一的 PaymentPort。

- **Decomposition / 分解：**按职责、业务能力或质量属性压力点拆系统；例：拆出 CourseService、EnrollmentService、PaymentService。

- **Divide and Conquer / 分而治之：**把复杂问题拆成可独立求解的小问题；例：迁移时先做网关接入，再抽取服务，再处理数据迁移。

- **Generate and Test / 生成与测试：**提出候选架构，再用 **ASR**、质量属性场景和风险检查验证；例：比较分层、微服务和事件驱动候选方案。

- **Iteration / Incremental Refinement / 迭代式增量细化：**每轮处理一组高优先级驱动因素，逐步细化元素、接口和部署。

- **Reusable Elements / Reuse / 复用元素：**复用已有组件、框架、模式和基础设施，降低风险和成本。

**和后文关系：**通用设计策略不是 tactic 或 pattern 的替代品；它先帮助组织设计思路，随后才把具体质量属性落到 **tactics**、**patterns** 和 **ADD** 设计概念上。

**知识出处：**`slides/01_Introduction.pdf` 第 24 页 **How to Develop a Design? / Generic Design Strategies**；OCR 交叉核验：`sources/slides-ocr/2026-05-27/ocr-output/01-introduction/pages/page-24.txt`。相关题目见 [06｜历年题与训练答案](https://my.feishu.cn/wiki/BQ9FwI4cHilhzhkJexhcmAT3n4c)。

## 常见 Tactics 与 Patterns 速查

**区别先背：Tactic** 是为了满足某个质量属性而采取的“局部设计手段”，例如缓存、冗余、鉴权；**Pattern** 是把多个 tactics 与结构决策组合起来的“常见架构方案”，例如 Layered、Broker、Microservices。考试写法通常是：先从质量属性场景识别 ASR，再选择 tactics，最后用 pattern 组织成可画图、可解释的架构。

|质量属性|常见 Tactics|答题例子|
|---|---|---|
|**Availability**|**Fault detection**、心跳/健康检查、异常监控；**Recovery**、主备/冗余、重试、超时、降级、检查点与回滚；**Prevention**、隔离故障组件。|支付服务故障时快速检测，熔断并切换备用渠道，保证核心选课流程可继续。|
|**Performance**|缓存、复制、并发处理、异步队列、负载均衡、资源池、调度与优先级、减少通信次数和数据量。|高峰查询用缓存与读副本降低响应时间，后台任务异步化避免阻塞主链路。|
|**Modifiability**|封装变化点、信息隐藏、接口抽象、降低耦合、插件/配置化、延迟绑定、分层、模块化、限制依赖方向。|新增支付渠道只改支付适配器和配置，不影响选课核心逻辑。|
|**Security**|身份认证、授权、加密、输入校验、审计日志、最小权限、攻击检测、限流、密钥轮换与撤销。|支付接口要求鉴权、传输加密和审计，异常请求触发告警与限流。|
|**Testability**|提高**可控制性**和**可观察性**：依赖注入、Mock/Stub、测试接口、日志、探针、断言、可重复测试数据。|把外部支付网关抽象成接口，测试时替换成 Mock，并用日志/指标验证状态变化。|
|**Interoperability**|标准协议、适配器、防腐层（ACL）、服务注册/发现、统一数据格式、网关、契约管理。|对接第三方支付时用 Adapter/ACL 隔离外部模型，内部仍保持稳定领域语言。|

|常见 Pattern|主要解决什么|快速记忆|
|---|---|---|
|**Layered**|模块职责分离与依赖控制。|逻辑上分层，常用于提升可修改性；代价是跨层调用和性能开销。|
|**Client\-Server / Multi\-tier**|请求/响应协作与部署隔离。|Client\-Server 重点是运行交互；Multi\-tier 重点是部署映射。|
|**MVC**|分离界面、控制逻辑和领域数据。|Model 管状态，View 管展示，Controller 管输入与协调。|
|**Pipe\-and\-Filter**|数据流处理、转换与组合。|Filter 做转换，Pipe 传数据；适合批处理/流水线，不适合强交互和共享状态。|
|**Broker**|分布式对象/服务的定位、转发和解耦。|Client 不直接找 Server，而是通过 Broker；代价是中介复杂和潜在瓶颈。|
|**Publish\-Subscribe / Event\-driven**|事件通知、异步解耦和扩展。|发布者不关心订阅者是谁；代价是时序、一致性和调试更难。|
|**Shared\-Data / Repository**|多个组件围绕共享数据协作。|共享存储方便集成，但容易产生耦合、瓶颈和单点风险。|
|**SOA / Microservices**|服务化集成、独立演进与部署。|SOA 偏企业集成和复用；Microservices 偏小粒度自治、独立部署和运行治理。|
|**P2P / Map\-Reduce**|去中心化协作 / 大规模数据并行处理。|P2P 关注对等节点通信；Map\-Reduce 关注任务如何分配、汇总与恢复。|

**考场落笔：**不要只罗列名字。每个 tactic/pattern 至少写出“对应质量属性 → 结构或机制 → 收益 → 代价”。例如为了 **Availability** 选择健康检查、冗余和断路器，再用 **Microservices \+ API Gateway \+ Service Discovery** 组织运行结构，并说明会增加分布式故障定位和运维复杂度。

**知识出处：**[03 质量属性、ASR 与 ADD](https://my.feishu.cn/wiki/QF1Swto6Vi6TB2k8DCocQsOLncc)、[04 架构模式演进与微服务](https://my.feishu.cn/wiki/TugcwyaYciuLXjkMw55c5BWrnNg)；补充证据：`slides/02-04_Quality Attributes.pdf`、`slides/05_Patterns.pdf`、`slides/06-07Attribute-Driven Design.pdf`、`扫描文档20260526_192514.pdf`。

|类别|回答什么|示例|对架构的作用|
|---|---|---|---|
|功能需求|系统做什么|登录、检索、报价|定义能力，但通常不足以决定架构|
|质量需求|做到多好|响应时间、可用性、安全、易改|驱动结构、通信与资源控制|
|约束|哪些边界不可选|必须兼容平台、法规、既有技术|零自由度的设计决定|

---

# 质量属性场景：六要素必须会写

|元素|问题|性能场景示例|
|---|---|---|
|Source of Stimulus|谁触发？|高峰时段用户|
|Stimulus|发生什么？|提交价格查询请求|
|Artifact|影响谁？|报价 API 与缓存|
|Environment|在什么状态？|峰值负载|
|Response|系统做什么？|读取缓存或计算并返回结果|
|Response Measure|怎样判合格？|95% 请求 200ms 内完成|

## 画图题示例：性能与互操作性的刺激\-响应图

- **题源：**2024 本课程回忆版第 3 题要求画出互操作性和性能的刺激\-响应图。

- **性能示例：**高峰时段用户提交价格查询；报价 API 与缓存应使 95% 请求在 200ms 内完成。

- **互操作性示例：**外部支付系统提交标准订单消息；集成适配器完成协议/数据转换并在限定时间内返回可解析确认。

**高频失分点：**“系统要快、要稳、要安全”不是场景；没有 response measure 就无法验证，也不足以成为设计依据。

## 主要质量属性与常见 tactic 方向

|属性|关心什么|常见 tactic 方向|
|---|---|---|
|Availability 可用性|故障后还能否服务、多久恢复|检测、冗余、恢复、降级|
|Performance 性能|响应时间与吞吐|控制资源需求、并发与调度、缓存|
|Modifiability 可修改性|变化的成本与影响范围|高内聚、限制依赖、延迟绑定|
|Security 安全性|防止、发现、响应攻击|检测、抵御、响应、恢复|
|Testability 可测试性|状态能否观察与控制|可观察接口、隔离依赖、记录行为|
|Interoperability 互操作性|系统间能否有意义交换信息|接口发现、协议/数据转换|

---

# ASR 与 Utility Tree

### ASR 是什么

- 对架构有显著影响的需求。

- 通常来自业务目标、质量需求与约束。

- 不是所有需求都同样值得优先设计。

### 怎样找到

1. 从需求文档获取初始候选。

2. 通过 workshop / interview 补全场景。

3. 用效用树排序高重要且高风险叶节点。

> 记忆链：业务目标 → 质量属性 → 具体场景与度量 → 优先级 → 架构决策。
> 
> 

## Utility Tree：从业务目标排到高优先级场景

**来源说明：**原始课件 **\`slides/02\-04\_Quality Attributes\.pdf\`** 支撑“质量需求必须转成具体、可度量场景”的课堂重点；课程阅读材料 **\`slides/Reading Materials/SEI00\_ATAM Method for architecture evaluation\.pdf\`** 明确给出 **Utility Tree** 的结构、排序维度和 ATAM 用法。下方在线课程平台示例是按该方法生成的训练例，不是原资料中的案例。

**定义：Utility Tree（效用树）**是 ATAM 中自顶向下细化质量属性需求的方法：从系统整体“好用/成功”的目标出发，把**业务驱动**转成可度量的**质量属性场景**，再挑出真正需要架构分析的高优先级叶节点。

## ATAM：用场景暴露风险与权衡

**概念：****ATAM \(Architecture Tradeoff Analysis Method\)** 是一种以业务驱动和质量属性场景为核心的架构评估方法，目标不是给架构打分，而是识别**风险、非风险、敏感点与权衡点**。

1. **呈现驱动因素：**明确业务目标、约束与关键质量属性。

2. **建立 Utility Tree：**把质量愿望细化为可度量场景，并按重要性/难度或风险排序。

3. **分析架构方法：**将高优先级场景映射到 tactics、patterns 与设计决定。

4. **产出评估结论：**记录风险、敏感点、权衡点及后续验证计划。

**作答****要点****：**如同一复制策略同时提升**可用性**与**性能**，却提高**一致性**与部署成本，这就是可说明的权衡点。

**事实源：**`slides/Reading Materials/SEI00_ATAM Method for architecture evaluation.pdf`、`slides/02-04_Quality Attributes.pdf`，并结合《软件体系结构复习课录音整理版\.docx》对 ASR 与 Utility Tree 的复习说明。

### 四层落笔结构

1. **根节点：Utility**。写系统整体成功目标，例如“在线课程平台稳定支撑选课与支付”。

2. **质量属性层：**按业务驱动展开 **Availability**、**Performance**、**Modifiability**、**Security** 等属性。

3. **细化关注点层：**把抽象属性收敛到可讨论的主题，例如“选课提交延迟”“支付故障恢复”“支付渠道替换”。

4. **场景叶节点：**用可验证的刺激与响应度量写完整场景，并在叶节点前标注 **\(重要性, 风险\)**。

### 优先级如何读

- **第一维 Importance：**该场景对业务成功的重要程度，常用 **H / M / L**。

- **第二维 Risk：**当前架构实现该目标的风险或难度，常用 **H / M / L**。

- **分析顺序：**优先追踪 **\(H,H\)** 与 **\(H,M\)** 叶节点，再检查支撑它们的 architectural approaches、风险、**sensitivity points** 与 **tradeoff points**。

### 画图训练例：在线课程平台

**题目：**为“高峰期学生选课并支付”的系统绘制 Utility Tree，并指出应优先分析的场景。

**参考作答：**以 **Utility** 为根，至少展开以下四条分支；其中 **\(H,H\)** 与 **\(H,M\)** 应优先进入架构分析。

- **Availability → 支付故障恢复 → \(H,H\)：**支付渠道故障时，30 秒内切换备用渠道，并保证订单不重复扣款。

- **Performance → 选课提交延迟 → \(H,M\)：**选课高峰下，95% 提交请求在 2 秒内返回结果。

- **Security → 支付数据保护 → \(H,H\)：**支付请求传输与存储受保护，未授权访问被拒绝并产生审计记录。

- **Modifiability → 支付渠道扩展 → \(M,M\)：**新增一种支付渠道的改动控制在 3 人日内，且不修改选课核心逻辑。

> **答题收束句：**Utility Tree 不是简单列举质量属性，而是把场景按业务重要性与实现风险排序；高优先级叶节点将继续驱动 tactic / pattern 选择，并暴露架构的风险、敏感点和权衡点。
> 
> 

---

# ADD：从驱动因素到可评估方案



![Image](https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/authcode/?code=ZDRlMGVjNzBlMDQ4MDcyYzMxZDFkZmQ0OTBmN2ZlMmNfZmMzOTRmMzE2NTBlMWJlNzIzOGE2OTY1ODhmZWNiMzNfSUQ6NzY0NjMzNTUwNzU0NzQyNTk5Ml8xNzgwNDA1MTU3OjE3ODA0OTE1NTdfVjM)



|步骤|要做什么|答题落点|
|---|---|---|
|**1\. Review Inputs / 审查输入**|确认 **Design Purpose / 设计目的**、**Primary Function / 主要功能**、**Quality Attributes / 质量属性**、**Architecture Concerns / 架构关注点** 与 **Constraints / 约束**。|先说明“为什么设计”和“受什么驱动”，不要直接跳到方案。|
|**2\. 选择驱动因素并建立本轮迭代目标**|从输入中挑出本轮最重要的 **Architecture Drivers / 架构驱动因素**，包括关键功能、质量属性场景、约束和关注点。|指出真正影响架构的 **ASR**，并限定本轮要解决的问题。|
|**3\. 选择要精化的系统元素**|选择一个或多个需要进一步设计的系统、子系统、模块、服务或接口。|明确本轮设计边界：这轮细化哪里，不细化哪里。|
|**4\. 选择设计概念**|选择能满足已选驱动因素的 **tactics**、**patterns**、参考架构、外部组件、部署方案或技术机制。|写清“选择什么、为什么满足 ASR、带来什么代价”。|
|**5\. 实例化架构元素、分配责任并定义接口**|把设计概念落到具体元素、职责、接口和关系上。|画出结构，说明每个元素负责什么、如何交互。|
|**6\. 文档化：绘制视图并记录设计决定**|用视图表达架构，并记录关键设计决定、理由、接口、约束、风险和影响。|ADD 包含文档化；可用 **ADR** 记录关键选择。|
|**7\. 分析当前设计并评审是否达成目标**|检查当前设计是否满足本轮迭代目标和总体设计目的；若仍有风险或未处理驱动因素，进入下一轮。|回扣质量属性场景、响应度量、风险、敏感点和权衡点。|

**快速背诵：通用设计策略在 ADD 中的体现**

**通用设计策略**可以记成“**生抽可迭代二分**”：**生成与测试**、**抽象**、**可复用元素**、**迭代式增量细化**、**Divide and Conquer / 分而治之**、**Decomposition / 分解**。

- **分解 / Decomposition：**Step 3 选择要精化的系统元素，把系统拆成子系统、服务、模块或接口。

- **抽象 / Abstraction：**Step 4 选择设计概念，用参考架构、模式和战术抽象高层结构。

- **分而治之 / Divide and Conquer：**每轮只处理一组高优先级 **ASR**，不一次解决所有问题。

- **生成与测试 / Generate and Test：**Step 4 生成候选设计概念，Step 7 用质量属性场景、风险和权衡评审。

- **迭代式增量细化 / Iteration / Incremental Refinement：**ADD 本身就是多轮迭代，从整体到局部逐步细化。

- **复用元素 / Reusable Elements / Reuse：**Step 4 复用已有模式、战术、框架、组件和基础设施，降低设计风险。

**一句话：**ADD 通过分解系统元素、抽象高层结构、逐步细化架构、生成并评估候选设计、迭代满足 ASR，并复用已有模式和战术，最终形成满足架构显著需求的软件架构。

## ADD 每个步骤的输入与输出

|步骤|输入|输出|
|---|---|---|
|**1\. Review Inputs / 审查输入**|设计目的、主要功能、质量属性、架构关注点、约束。|已确认的设计输入与初始驱动因素清单。|
|**2\. Establish Iteration Goal / 建立迭代目标**|输入 **ASR**、风险和优先级。|本轮迭代目标，以及本轮要解决的 drivers。<br>|
|**3\. Choose Elements to Refine / 选择要精化的元素**|当前系统元素、上一轮架构草图或已有架构。|本轮要细化的系统、子系统、服务、模块或接口。|
|**4\. Choose Design Concepts / 选择设计概念**|本轮 drivers、候选 tactics / patterns / reference architecture。|选定的设计概念，以及选择理由、收益和代价。|
|**5\. Instantiate Elements / 实例化并分配职责**|设计概念和待细化元素。|具体架构元素、职责、接口、关系和数据/资源安排。|
|**6\. Sketch Views and Record Decisions / 绘制视图并记录决策**|具体元素、连接关系和关键选择。|架构视图、接口说明、**ADR / 决策记录**、约束和风险。|
|**7\. Analyze and Iterate / 分析并迭代**|当前设计、质量属性场景、评审标准。|风险、权衡、敏感点、是否达成本轮目标，以及下一轮输入。|

## 七类设计决策清单

**怎么理解：**七类设计决策是把 **ASR** 和质量属性场景落到架构方案上的检查清单。答题时不要只背名称，要说明“这个决策解决哪个质量属性、带来什么权衡”。

### 七类设计决策：中英名称与解释

1. **职责分配（Allocation of Responsibilities）：**决定系统里的职责由哪些模块、服务、组件或团队承担，回答“谁负责做什么”。在线课程平台中，可把选课规则放入 **EnrollmentService**，而不是散落在课程页面和订单模块中；收益是提升**可修改性**，代价是服务间调用变多。

2. **协调模型（Coordination Model）：**决定架构元素之间如何协作，包括同步调用、异步消息、事件发布订阅、超时、重试、补偿和失败处理，回答“各部分怎么沟通与配合”。在线课程平台中，支付成功后发布 **PaymentSucceeded** 事件，EnrollmentService 订阅后确认选课；收益是解耦和提升**可用性**，代价是要处理最终一致性。

3. **数据模型（Data Model）：**决定核心数据如何表达、存储、复制、缓存和保持一致，回答“数据怎么组织，边界在哪里”。在线课程平台中，CourseDB 保存课程，OrderDB 保存订单，Enrollment 只引用 courseId 和 orderId；收益是提升服务自治，代价是跨库查询和统计报表更复杂。

4. **资源管理（Management of Resources）：**决定 CPU、内存、线程、连接、队列、实例、带宽、配额等资源如何分配、隔离、限制和扩展，回答“资源不够或负载突增时怎么稳住系统”。在线课程平台中，高峰期给 EnrollmentService 横向扩容，并对支付接口设置连接池、限流和优先级队列；收益是支撑**性能**和**可用性**，代价是容量规划和运维成本增加。

5. **架构元素映射（Mapping among Architecture Elements）：**决定逻辑模块、运行时组件、进程、容器、节点、仓库、团队之间如何对应，回答“设计里的元素最终落到哪里”。在线课程平台中，将 EnrollmentService、PaymentService 分别部署到独立容器，并使用独立发布流水线；收益是支撑**可部署性**和故障隔离，代价是部署、监控和网络治理成本增加。

6. **绑定时机决策（Binding Time Decisions）：**决定某些变化点在什么时候被确定：设计时、编码时、编译时、部署时、启动时，还是运行时，回答“哪些选择可以晚一点再定”。在线课程平台中，支付渠道、限流阈值、灰度比例在运行时通过配置中心绑定；收益是提升**可变更性**和回滚速度，代价是配置错误风险和治理成本更高。

7. **技术选择（Choice of Technology）：**决定使用哪些框架、中间件、数据库、消息队列、容器平台、监控工具等，回答“用什么技术实现前面的设计决策”。在线课程平台中，选择 API Gateway、消息队列、容器编排和链路追踪；收益是支撑**互操作性**、**可观测性**和弹性，代价是学习与运维门槛更高。

**记忆句：**七类设计决策可以按“**谁负责、怎么协作、数据怎么放、资源怎么管、元素落到哪里、何时绑定、用什么技术**”来记；写答案时逐一回扣 **ASR**、收益、代价和验证方式。

**知识出处：**[03 质量属性、ASR 与 ADD](https://my.feishu.cn/wiki/QF1Swto6Vi6TB2k8DCocQsOLncc)；[04 架构模式演进与微服务](https://my.feishu.cn/wiki/TugcwyaYciuLXjkMw55c5BWrnNg)；[06｜历年题与训练答案](https://my.feishu.cn/wiki/BQ9FwI4cHilhzhkJexhcmAT3n4c)。补充证据名：`09Architectural Decisions`、`软件体系结构复习课录音整理版.docx`。

## 纪要补充：ASR 获取、质量属性自检与 ADD 迭代

**回到总结页：**[纪要可能考查方式索引](https://my.feishu.cn/docx/GVzbdsMMuolSoRxxbqoclqmunqd#doxcnXAOKPpx8SHZVkikCfTQCpf) 已把本知识点与相关训练题互链，复习时可从题型反查本节。

**核心****说明****：**质量需求只有被写成可度量的场景，才能成为架构设计依据；需求文档不足时，要通过访谈或研讨会补全场景、优先级和利益相关者关注点。

|补充点|考试写法|注意边界|
|---|---|---|
|ASR 获取方式|需求文档 → 利益相关者访谈 → 质量属性研讨会（QAW）→ 场景优先级排序|QAW 只作为发现 ASR 的方法点，不扩成独立大题。|
|质量属性自检|六要素是否完整；响应度量是否量化；tactic/pattern 是否匹配；是否写出收益、代价和权衡|不要只列 tactic 名称，必须说明它解决哪个刺激和响应。|
|ADD 3\.0 案例迭代|第 1 轮定整体结构；第 2 轮处理核心功能；第 3 轮处理质量属性；第 4 轮处理开发、部署和运营关注点|考试范围仍以老师纪要中的 ADD 3\.0 七步为准。|

**答设计题的固定****完整步骤****：**列场景及度量 → 识别 ASR → 选 tactic / pattern → 给出结构和职责 → 解释权衡 → 写验证方法。

---

# 可直接背诵答案

## 英文题面常见问法

|English prompt|答题要点|
|---|---|
|How do you specify a quality attribute scenario?|Source, stimulus, artifact, environment, response, response measure。|
|What are Architecturally Significant Requirements?|ASR 是会显著影响架构的功能、质量属性、约束或设计目标。|
|How can ASRs be gathered?|Requirements documents, stakeholder interviews, QAW, utility tree prioritization。|
|Explain Utility Tree in ATAM\.|从 Utility 分解到质量属性、子属性和场景，并以重要性/风险排序。|
|Describe the ADD 3\.0 process\.|按老师纪要七步答：**目标、驱动因素、元素、方案、职责接口、文档化、评审迭代。**|
|What is **Generate and Test?**<br>|Generate candidate architecture, test it against ASRs and quality attribute scenarios, then refine。|

## 题 1：质量属性场景与 ASR

> 质量属性场景用于把抽象的质量诉求转化为可设计、可验证的需求。一个完整场景包含刺激源、刺激、制品、环境、响应和响应度量六个要素，其中响应度量最关键，因为它决定需求是否能够被验证。ASR 是对架构具有显著影响的需求，通常从关键质量需求和约束中识别，并通过需求分析、stakeholder workshop 或访谈、业务目标和效用树进行补充与排序。
> 
> 

## 题 2：ADD 方法

> ADD 是**属性驱动的迭代式架构设计方法**。设计者首先确认需求并选择需要分解的元素，识别该元素的 ASR；然后针对关键关注点列出候选设计，选择能够满足 ASR 的 patterns 或 tactics，并形成视图；之后实例化架构元素、分配职责、定义接口，验证并细化需求；最后继续迭代直到重要 ASR 得到处理。其核心不是机械套步骤，而是始终用质量属性和约束推动设计选择与验证。
> 
> 

## ADD 用法示例：在线课程平台迁移到微服务

**例题场景：**在线课程平台原来是分层单体，选课和支付高峰期响应慢，支付失败会影响选课流程，团队希望逐步迁移到微服务，并保证可回滚、可观测、可继续迭代。

|ADD 步骤|本例怎么做|产出/决策|
|---|---|---|
|**1\. Review Inputs / 审查输入**|目的不是“使用微服务”，而是解决高峰性能、支付隔离、可部署性和可回滚问题。|**驱动因素**：P95 响应时间、支付故障隔离、灰度发布、数据一致性约束。|
|**2\. 选迭代目标**|第一轮先处理选课与支付主链路，不一次性重构全部课程后台。|迭代目标：抽出 EnrollmentService 与 PaymentService，并保留旧系统回退路径。|
|**3\. 选待精化元素**|从整体系统中选择“选课/订单/支付”子系统作为本轮精化元素。|元素边界：Course、Enrollment、Order、Payment 四类职责。|
|**4\. 选择设计概念**|选择 API Gateway、按业务能力拆分、数据库拆分、异步事件、容器部署和熔断降级。|设计概念：Strangler 路线、服务自治、事件驱动、灰度发布。|
|**5\. 实例化并分配职责**|CourseService 管课程，EnrollmentService 管选课，PaymentService 管支付，NotificationService 订阅事件。|接口：POST /enrollments、POST /payments；事件：PaymentSucceeded、CourseEnrolled。|
|**6\. 绘制视图并记录设计决定**|画模块视图、C\&C 运行视图、部署视图，并记录每个服务的职责、接口和依赖。|文档：服务边界表、API 契约、部署拓扑、关键 ADR。|
|**7\. 分析当前设计并评审是否达成目标**|检查 ASR 是否被解决：峰值性能是否达标，支付故障是否隔离，回滚是否可执行。|新风险：分布式事务、数据同步延迟、链路追踪复杂度；进入下一轮处理。|

**ADR 是什么：ADR** 是 **Architecture Decision Record**，即“架构决策记录”。它通常用一小页记录某个关键架构选择的**背景**、**决策**、**理由**、**替代方案**和**后果/权衡**。在 ADD 的文档化步骤里，ADR 用来说明“为什么选择 API Gateway、事件驱动、容器部署，而不是别的方案”，方便后续评审、迭代和影响分析。

**知识出处：**[03 质量属性、ASR 与 ADD](https://my.feishu.cn/wiki/QF1Swto6Vi6TB2k8DCocQsOLncc)；[04 架构模式演进与微服务](https://my.feishu.cn/wiki/TugcwyaYciuLXjkMw55c5BWrnNg)；[06｜历年题与训练答案](https://my.feishu.cn/wiki/BQ9FwI4cHilhzhkJexhcmAT3n4c)。补充证据名：`slides/Designing Software Architectures - ADD 3.0.pdf`、`软件体系结构复习课录音整理版.docx`。

### 新增纪要线索：酒店定价系统 ADD 案例

**来源校准：**用户补充的“完整考前复习重点”纪要明确提到老师用**酒店定价系统**说明 ADD 3\.0：系统需要确定特定酒店房型价格，受旅游淡旺季等因素影响，并与多个外部系统交互，终端用户包括销售经理。这个案例更接近老师课堂素材；上方“在线课程平台”保留为便于迁移练习的自编答题例。

|ADD 线索|酒店定价系统怎么落笔|答题抓手|
|---|---|---|
|**驱动因素**|功能需求包括登录、价格变更、价格查询；质量需求包括性能、可靠性、可用性；约束包括平台支持和时间要求。|先把需求分成 **FR / QA / Constraint**，再识别真正影响架构的 **ASR**。|
|**迭代目标**|纪要提到通常 3\-4 轮迭代：第一轮确定整体结构，第二轮关注核心功能，第三轮解决质量属性，第四轮处理开发、部署和运营需求。|不要一次把所有设计做完；每轮选一个待细化元素和一组高优先级 ASR。|
|**设计概念**|根据高优先级质量属性选择 tactics、patterns 与技术方案，例如缓存/复制改善查询性能，冗余/健康检查改善可用性，接口抽象隔离外部系统变化。|写清“选择什么、为什么满足 ASR、带来什么代价”。|
|**文档与评审**|每轮产出视图、职责、接口、关键决策和风险，并检查是否满足响应度量。|回扣 ADD 的最后两步：**Document and review**，不是只列步骤名。|

**知识出处：**[智能纪要：完整考前复习重点](https://my.feishu.cn/docx/RrjOdIMTioXr6px8zmdcuQB5nSh)；相关知识库页：[03 质量属性、ASR 与 ADD](https://my.feishu.cn/wiki/QF1Swto6Vi6TB2k8DCocQsOLncc)。

## 老师纪要中的 ADD 3\.0 七步速背

1. **Review Inputs / 审查输入：**确认设计目的、主要功能、质量属性、架构关注点和约束。

2. **选择驱动因素并建立本轮迭代目标：**挑出本轮要优先处理的关键功能、质量属性场景、约束和关注点。

3. **选择要精化的系统元素：**决定本轮细化哪个系统、子系统、模块、服务或接口。

4. **选择设计概念：**选择满足驱动因素的 tactics、patterns、参考架构、外部组件或技术机制。

5. **实例化架构元素、分配责任并定义接口：**把设计概念落到具体元素、职责、接口和关系上。

6. **绘制视图并记录设计决定：**用视图表达结构和交互，用决策记录说明理由、约束、风险和影响。

7. **分析当前设计并评审是否达成目标：**检查是否满足本轮目标和设计目的，必要时把新风险带入下一轮。

# 精选来源

- 飞书考前复习纪要：质量属性、ASR、效用树和 ADD 3\.0 为明确重点。

- 上传资料：《扫描文档20260526\_192514\.pdf》（MinerU OCR）的 Quality Attributes 与 Designing Software Architecture 目录/概念页。

- 流程说明依据：老师智能纪要对 ADD 3\.0 案例及七个步骤的明确复习说明。

- 原始课件：\`slides/02\-04\_Quality Attributes\.pdf\`、\`slides/06\-07Attribute\-Driven Design\.pdf\` 与 \`slides/09Architectural Decisions\.pdf\`；不以 \`slides/readable\_notes/\` 二次转写内容作为来源。

- **Utility Tree / ATAM 依据：**原始阅读材料 \`slides/Reading Materials/SEI00\_ATAM Method for architecture evaluation\.pdf\` 的 5\.3 节与 ATAM Step 5：效用树从 **Utility → Quality Attribute → Sub\-factor → Scenario** 展开，并以 **\(重要性, 风险\)** 对叶节点排序。

> (注：内容由 AI 生成，请谨慎参考）
