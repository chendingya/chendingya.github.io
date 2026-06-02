---
title: DDD 设计例子：代码怎么变更与设计图怎么画
date: 2026-06-02
author: heleyang
tags: [软件架构设计, 期末复习]
categories: [软件架构设计]
description: 
---

# DDD 设计例子：代码怎么变更与设计图怎么画

**一句话：**这份课件的设计例子可以按“**事件风暴找业务事实 → 限界上下文切边界 → 类图/聚合图表达领域模型 → 包图/分层图表达代码位置 → 端口适配器图隔离基础设施 → 时序图说明一次业务流程**”来复习。

# 一、先记住：DDD 代码怎么改

1. **坏代码：Service / Controller** 直接拼流程、读写技术对象。

2. **事件风暴：**找**事件**、**命令**、**角色**、**策略**，把流程语言改成业务语言。

3. **战略设计：**识别**子领域**、划分**限界上下文**，并说明**上下文映射**。

4. **战术设计：**建模**实体**、**值对象**、**聚合根**、**领域事件**。

5. **代码落地：**用**应用服务**编排用例，把业务规则放回**领域模型**；用**仓储接口**和**适配器**隔离数据库、Excel、HTTP、消息队列、第三方系统。

6. **评审：**检查**一致性**、**耦合**、**可修改性**和**技术隔离**，确认改造后领域规则不再散落在 Service / Controller 里。

# 二、例子 1：超市收银员，从“拆别人内部结构”改成“对象自己完成行为”

**课件问题：Cashier** 通过 `customer.getWallet()` 拿到 **Wallet**，再检查余额和扣钱。这样 **Cashier** 认识了“朋友的朋友”，违反 **迪米特法则**。

### 修改前

```java
public void charge(Customer customer, Money payment) {
    Wallet wallet = customer.getWallet();
    if (wallet.isEnough(payment)) {
        wallet.subtractMoney(payment);
    } else {
        throw new NotEnoughMoneyException();
    }
}
```

### 修改后

```java
public void charge(Customer customer, Money payment) {
    customer.pay(payment);
}

public class Customer {
    private Wallet wallet;

    public void pay(Money payment) {
        wallet.pay(payment);
    }
}
```

## 该画什么图

- **类图 / Class Diagram：**画 **Cashier**、**Customer**、**Wallet** 的关系，突出行为从 **Cashier** 移到 **Customer\.pay\(\)**。

- **时序图 / Sequence Diagram：**画一次收费流程：**Cashier → Customer → Wallet**，说明外部对象不再越级访问。

# 三、例子 2：订单聚合，用聚合根保护一致性边界

**聚合 / Aggregate** 是领域模型的概念边界；**聚合根 / Aggregate Root** 是唯一入口和出口。外部不能随便改内部对象，只能通过聚合根方法改变状态。

- **代码变更：**把原本散落在 Service 中的“加商品、发货、校验地址、计算金额”等规则收拢到 **Order** 聚合根。

- **图上要标：**哪个是 **Aggregate Root**，哪些是内部实体和值对象，外部访问入口在哪里。

- **答题句：**聚合根维护内部业务不变量，聚合之间尽量通过 ID 值对象关联，减少对象网状依赖。

# 四、例子 3：结算系统，从过胖 Service 改成领域模型 \+ 端口适配器

**修改前的问题：InternalSettlementBill** 只有字段没有行为，是贫血模型；**BillReviewService** 同时读 Excel、填单元格、下载文件；**HSSFWorkbook**、**PoiUtils** 等技术对象泄漏到业务流程。

## 修改后的核心代码

```java
public void export(OutputStreamProvider streamProvider,
                   String templateName,
                   String billNumber) {
    SettlementBillTemplate template =
        templateRepo.loadBy(templateName, billNumber);
    SettlementBill bill = billRepo.loadBy(templateName);
    bill.fillWith(template);
    billRepo.save(bill, templateName);
}
```

- **SettlementBill** 负责 `fillWith(template)`。

- **Workbook / Sheet / Row / Cell** 负责 `replaceOrSet()`。

- **SettlementBillRepository** 封装账单加载与保存。

- **HSSFWorkbookAdapter** 等适配器把 POI 技术对象转换成领域模型可用的抽象。

## 该画什么图

- **包图 / Package Diagram：**画 UI、Application、Domain、Infrastructure 四层。

- **类图 / Class Diagram：**画 **SettlementBill**、**Workbook**、**Sheet**、**Row**、**Cell**、Repository 接口和 Adapter。

- **端口适配器图：**画领域层依赖端口，基础设施层实现端口。

- **时序图：**画一次导出流程：AppService 调用领域服务，领域服务加载账单和模板，账单填充，仓储保存。

# 五、例子 4：限界上下文，不要把所有字段塞进一个大 Product

课件里的供应链例子说明：如果按普通模块分类，容易把采购、订单、库存、运输关心的字段都塞进一个巨大 **Product**。DDD 更强调按 **限界上下文 / Bounded Context** 切分，同一个词在不同上下文中可以有不同模型。

- **代码变更：**不要创建一个万能 **Product** 类；在不同上下文内建立各自的 Product 模型或引用模型。

- **图上要标：**上下文名称、每个上下文公开的业务能力、上下文之间的依赖或映射关系。

- **答题句：**限界上下文是按领域能力纵向切分，不是按技术层水平拆模块。

# 六、例子 5：为学课堂，用事件风暴推导代码边界

事件风暴先找已经发生的业务事实，再识别命令、角色、策略、外部系统、聚合和读模型。课件里的事件包括 **试卷已生成**、**试卷已提交**、**诊断已完成**、**课程已推荐**、**订单已提交**、**支付已完成**、**报名已完成**、**课程名额已锁定/已释放**。

- **事件** 可以落成 `DomainEvent`，例如 `PaymentCompleted`。

- **命令** 可以落成 `Command`，例如 `SubmitOrderCommand`。

- **聚合根** 处理命令并维护一致性，例如 `Order.submit()`、`Enrollment.complete()`。

- **读模型** 服务查询展示，不直接承载核心业务规则。

# 七、设计图速查：每种图用来回答什么

|图|回答的问题|DDD 题里怎么用|
|---|---|---|
|**类图 / Class Diagram**|领域对象有哪些，谁持有哪些属性和行为。|画实体、值对象、聚合根、领域服务、仓储接口；说明业务行为移到领域对象。|
|**聚合结构图**|一致性边界在哪里，谁是唯一入口。|标出 Aggregate Root、内部实体和值对象；说明外部只能通过根修改聚合。|
|**包图 / Package Diagram**|代码分层和依赖方向。|画 UI、Application、Domain、Infrastructure；强调领域层不依赖技术实现。|
|**端口适配器图**|领域逻辑如何隔离技术细节。|画 Repository/Client/Writer 等端口和 Adapter；说明 Excel、DB、HTTP 不进入领域逻辑。|
|**限界上下文图**|业务能力边界怎么切。|按采购、订单、库存、运输等上下文拆模型，而不是把所有字段放到一个大类。|
|**上下文映射图 / Context Map**|上下文之间如何协作。|标出 ACL、OHS、PL、Customer/Supplier、Conformist、Partnership、Shared Kernel 等关系。|
|**事件风暴图**|业务流程如何从事件推导出模型。|按时间线画事件、命令、角色、策略、外部系统、读模型、聚合。|
|**时序图 / Sequence Diagram**|一次业务流程中对象怎么交互。|画 AppService、Domain Service、Repository、Aggregate、External System 的调用顺序。|

# 八、考试/作业答题模板

1. **先指出旧代码问题：**是否是贫血模型、Service 过胖、技术细节泄漏、对象越级访问、边界不清。

2. **再说明 DDD 改法：**领域对象承担行为，聚合根维护一致性，Repository 管生命周期，Adapter 隔离技术。

3. **配图：**至少画一个类图/聚合图；如果涉及系统边界，再画限界上下文图；如果涉及流程，再画事件风暴图或时序图。

4. **最后回扣收益与代价：**收益是可理解、可修改、业务规则集中、技术隔离；代价是模型设计成本更高，需要维护边界和事件契约。

**知识出处：**`slides/领域驱动设计项目实战讲解.pdf`；本地文本抽取：`sources/slides-ocr/2026-05-27/pdftotext-triage/领域驱动设计项目实战讲解.txt`，重点片段包括“超市收银员”“订单聚合”“DDD 设计，从错误到正确”“结算系统”“菱形对称架构”“事件风暴”“为学课堂”。

# 九、Mock 题：研究生选课系统，手把手按 DDD 写回答

**一句话记忆：**DDD 设计题不要一上来写数据库表，先从**业务不变量**和**领域事件**出发，再落到**限界上下文**、**聚合**、**领域服务**、**应用服务**和设计图。

## 题目

某高校要建设一个**研究生选课系统**。学生可以浏览课程、提交选课申请、退课；课程有容量上限，不能超过人数；学生不能选择时间冲突的课程；课程满员后可以进入候补队列；退课后系统自动通知候补队列中的下一位学生补位。请用 **DDD / Domain\-Driven Design** 方法进行领域建模，说明主要**限界上下文**、**聚合**、**实体**、**值对象**、**领域事件**，并给出关键伪代码和设计图。

## 第 1 步：先找核心业务规则

本题的核心领域是**选课**，不是“课程表 CRUD”。先把会影响正确性的规则列出来：

- **课程容量不能超限**：已选人数不能超过容量上限。

- **学生课程时间不能冲突**：同一学生不能选择时间重叠的课程。

- **退课后要释放名额**：退课会改变课程名额状态。

- **满员后进入候补队列**：候补要保持先后顺序。

- **有空位时自动推进候补**：退课后通知或提升候补队列中的下一位学生。

这些规则如果全部写在 `CourseSelectionService` 里，就容易形成**贫血模型**：对象只有字段，业务规则都堆在 Service。DDD 更推荐把容量、退课、候补推进等规则放回**聚合根**或**领域服务**中。

## 第 2 步：事件风暴，先找“发生过的事实”

可以先写命令和领域事件，再反推模型边界：

- **Command / 命令**：`SelectCourse`、`DropCourse`。

- **Domain Event / 领域事件**：`CourseSelected`、`StudentWaitlisted`、`SeatReleased`、`WaitlistedStudentPromoted`、`WaitlistedStudentNotified`。

- **Policy / 策略**：检查时间冲突、课程满员后进入候补、释放名额后推进候补。

## 第 3 步：划分限界上下文

不要把所有对象塞进一个大模型。这里至少可以拆成三个上下文：

- **Course Catalog Context / 课程目录上下文**：维护课程名称、教师、时间、学分等基础信息。

- **Course Selection Context / 选课上下文**：处理选课、退课、容量、候补队列，是本题的**核心域**。

- **Notification Context / 通知上下文**：接收领域事件，负责站内信、邮件或短信通知。

## 第 4 步：设计聚合、实体和值对象

核心聚合可以选 **CourseOffering / 课程开课实例**，因为容量、候补队列、已选学生都围绕“一门课的一次开课”变化。

- **CourseOffering**：聚合根，保护课程容量、选课状态和候补队列的一致性。

- **Enrollment**：实体，表示某个学生在某门课中的选课记录。

- **Schedule**：值对象，用来判断课程时间是否冲突。

- **Capacity**：值对象，封装容量上限、占用、释放等规则。

- **Waitlist**：聚合内部对象，维护候补队列顺序。

- **CourseConflictService**：领域服务，负责跨课程的时间冲突判断。

## 第 5 步：写聚合根伪代码，让业务规则回到领域对象

核心要点是：不要在应用服务里到处 `setStatus()`，而是让 **CourseOffering** 自己完成选课、退课、候补推进。

```java
class CourseOffering {
    private CourseOfferingId id;
    private CourseId courseId;
    private Capacity capacity;
    private Schedule schedule;
    private List<Enrollment> enrollments;
    private Waitlist waitlist;
    private List<DomainEvent> events;

    public void select(StudentId studentId) {
        if (hasSelected(studentId)) {
            throw new DomainException("学生已经选择该课程");
        }

        if (capacity.hasAvailableSeat()) {
            capacity.occupy();
            enrollments.add(Enrollment.selected(studentId));
            events.add(new CourseSelected(id, studentId));
        } else {
            waitlist.enqueue(studentId);
            events.add(new StudentWaitlisted(id, studentId));
        }
    }

    public void drop(StudentId studentId) {
        Enrollment enrollment = findEnrollment(studentId);
        enrollment.drop();

        capacity.release();
        events.add(new SeatReleased(id, studentId));

        waitlist.dequeue().ifPresent(nextStudent -> {
            capacity.occupy();
            enrollments.add(Enrollment.selected(nextStudent));
            events.add(new WaitlistedStudentPromoted(id, nextStudent));
        });
    }

    private boolean hasSelected(StudentId studentId) {
        return enrollments.stream()
            .anyMatch(e -> e.belongsTo(studentId) && e.isSelected());
    }
}
```

## 第 6 步：跨聚合规则放领域服务

**时间冲突**需要比较学生已经选择的多门课，它不是单个课程实例自己能完整判断的规则，所以可以放在**领域服务**中。

```java
class CourseConflictService {
    public void checkNoConflict(
        StudentId studentId,
        CourseOffering target,
        List<CourseOffering> selectedCourses
    ) {
        for (CourseOffering selected : selectedCourses) {
            if (target.schedule().conflictsWith(selected.schedule())) {
                throw new DomainException("课程时间冲突");
            }
        }
    }
}
```

## 第 7 步：应用服务只做流程编排

**Application Service / 应用服务**负责加载聚合、调用领域行为、保存聚合、发布领域事件，不承载核心业务判断。

```java
class CourseSelectionApplicationService {
    private CourseOfferingRepository courseRepo;
    private StudentScheduleRepository scheduleRepo;
    private CourseConflictService conflictService;
    private DomainEventPublisher eventPublisher;

    public void selectCourse(StudentId studentId, CourseOfferingId courseOfferingId) {
        CourseOffering target = courseRepo.findById(courseOfferingId);
        List<CourseOffering> selectedCourses = scheduleRepo.findSelectedCourses(studentId);

        conflictService.checkNoConflict(studentId, target, selectedCourses);
        target.select(studentId);

        courseRepo.save(target);
        eventPublisher.publish(target.domainEvents());
    }

    public void dropCourse(StudentId studentId, CourseOfferingId courseOfferingId) {
        CourseOffering target = courseRepo.findById(courseOfferingId);

        target.drop(studentId);

        courseRepo.save(target);
        eventPublisher.publish(target.domainEvents());
    }
}
```

## 第 8 步：画调用时序图

时序图适合回答“选课请求在系统里怎么协作”。

## 第 9 步：画包图 / 分层图

包图或分层图适合回答“代码结构怎么组织”。核心依赖方向应指向**领域层**，避免领域层依赖数据库或 Web 框架。

## 最终答题模板

1. **识别核心领域**：本题核心是选课，关键规则是容量限制、时间冲突、候补队列和退课补位。

2. **事件风暴**：识别 `SelectCourse`、`DropCourse` 命令，以及 `CourseSelected`、`StudentWaitlisted`、`SeatReleased`、`WaitlistedStudentPromoted` 等领域事件。

3. **划分限界上下文**：拆为课程目录上下文、选课上下文、通知上下文，其中选课上下文是核心域。

4. **设计聚合**：以 `CourseOffering` 为聚合根，内部维护 `Enrollment`、`Capacity`、`Schedule`、`Waitlist`。

5. **设计领域服务**：跨课程的时间冲突判断由 `CourseConflictService` 完成。

6. **设计应用服务**：应用服务负责加载聚合、调用领域行为、保存聚合、发布领域事件。

7. **避免贫血模型**：容量占用、退课释放、候补补位等规则放入领域模型，而不是全部堆在 Service 中。

8. **补充设计图**：画限界上下文图、聚合类图、调用时序图和分层包图。

**知识出处：**本题是复习用 mock 题；选课系统场景可联系 `slides/软件架构模式演进：从主机到 AI 原生` 中反复使用的选课系统案例，DDD 答题步骤与概念表述沿用本页前面整理的 `slides/领域驱动设计项目实战讲解.pdf`。

# 十、Slides 原有代码改造 Mock 题：按标准步骤答题

**标准步骤：**这类题不要只写“改成 DDD”。建议固定按 **Step 1 识别问题 → Step 2 提炼领域概念 → Step 3 划边界和职责 → Step 4 设计领域模型 → Step 5 写伪代码 → Step 6 画图和总结答题句** 来答。

## Mock 题 A：超市收银员，如何把“拆别人内部结构”的代码改掉

**题目：**某超市收银系统中，`Cashier` 负责向顾客收费。现有代码如下，请按 DDD / 面向对象设计方法指出问题并改造。

```java
class Cashier {
    public void charge(Customer customer, float payment) {
        Wallet wallet = customer.getWallet();

        if (wallet.getTotalMoney() >= payment) {
            wallet.subtractMoney(payment);
        } else {
            throw new NotEnoughMoneyException();
        }
    }
}

class Customer {
    private Wallet myWallet;

    public Wallet getWallet() {
        return myWallet;
    }
}

class Wallet {
    private float value;

    public float getTotalMoney() {
        return value;
    }

    public void subtractMoney(float debit) {
        value -= debit;
    }
}
```

### Step 1：识别问题

- **越过对象边界**：`Cashier` 通过 `customer.getWallet()` 拿到 `Wallet`，再直接调用 `getTotalMoney()` 和 `subtractMoney()`。

- **违反迪米特法则 / Law of Demeter**：`Customer` 是 `Cashier` 的朋友，`Wallet` 是 `Customer` 的朋友；朋友的朋友不是自己的朋友。

- **破坏封装**：`Customer` 变成了钱包数据的提供者，而不是有行为的领域对象。

- **职责错位**：是否余额足够、如何扣款，不应该由 `Cashier` 判断。

### Step 2：提炼领域概念

- **Cashier / 收银员**：发起收费，不关心顾客钱包内部结构。

- **Customer / 顾客**：承担支付行为，封装自己的钱包。

- **Wallet / 钱包**：负责余额判断和扣款。

- **NotEnoughMoneyException**：支付失败时的领域异常。

### Step 3：重新分配职责

按照“谁持有信息，谁承担行为”的原则，把 `pay(payment)` 放到 **Customer**，把 `isEnough(payment)` 和 `subtractMoney(payment)` 放到 **Wallet**。**Cashier** 只调用 `customer.pay(payment)`。

### Step 4：设计领域模型

- **Customer** 可以看成当前小模型中的核心实体，负责保护自己的支付行为。

- **Wallet** 是 `Customer` 内部对象，封装余额相关行为。

- 如果题目进一步要求系统级设计，可把 **Cashier** 作为收银聚合根，引入 **CashierService**、**CashierRepository**，并划分 **Cashier Context / 收银上下文** 与 **Customer Context / 顾客上下文**。

### Step 5：写修改后的伪代码

```java
class Cashier {
    public void charge(Customer customer, float payment) {
        customer.pay(payment);
    }
}

class Customer {
    private Wallet myWallet;

    public void pay(float payment) {
        if (myWallet.isEnough(payment)) {
            myWallet.subtractMoney(payment);
        } else {
            throw new NotEnoughMoneyException();
        }
    }
}

class Wallet {
    private float value;

    public boolean isEnough(float payment) {
        return value >= payment;
    }

    public void subtractMoney(float debit) {
        value -= debit;
    }
}
```

### Step 6：画图和答题句

**答题句：**修改后的设计把“余额判断和扣款”从 `Cashier` 下沉到 `Customer` 与 `Wallet`，让对象通过行为协作，避免把领域对象退化成数据提供者。

## Mock 题 B：结算账单导出系统，如何从贫血模型改成领域模型 \+ 端口适配器

**题目：**某结算系统需要导入 Excel 账单模板，从数据库读取结算账单数据，替换模板中的变量，最终导出 Excel 报表。现有设计如下，请按 DDD 标准步骤改造。

```java
class InternalSettlementBill {
    private String billNumber;
    private String flightIdentity;
    private String flightRoute;
    private BigDecimal totalCost;
}

class InternalSettlementBillService
        extends BaseBillReviewExportTemplate<InternalSettlementBill> {

    private InternalSettlementBillRepository repository;

    protected InternalSettlementBill queryFilledDataBy(String billNumber) {
        return repository.queryByBillNumber(billNumber);
    }

    protected List<TemplateReplacement> composeTemplateReplacements(
            InternalSettlementBill bill) {
        List<TemplateReplacement> replacements = new ArrayList<>();
        replacements.add(new TemplateReplacement(0, 0, bill.getBillNumber()));
        replacements.add(new TemplateReplacement(1, 2, bill.getFlightRoute()));
        return replacements;
    }
}

class BillReviewService {
    private PoiUtils poiUtils;
    private FileDownloader fileDownloader;

    public void exportBillReviewByTemplate(
            HttpServletResponse response,
            String billNumber,
            String templateName) {
        HSSFWorkbook workbook = poiUtils.getHssfWorkbook(templateName);
        List<TemplateReplacement> replacements = templateReplacementsBy(billNumber);
        poiUtils.fillCells(workbook, 0, "${}", replacements);
        fileDownloader.downloadHSSFFile(response, workbook, templateName);
    }
}
```

### Step 1：识别问题

- **贫血模型**：`InternalSettlementBill` 只有数据，没有“如何生成模板变量”的领域行为。

- **职责错位**：`InternalSettlementBillService` 组装 `TemplateReplacement`，但这些变量来自账单自身，应由持有领域信息的对象生成。

- **领域概念放错层**：`TemplateReplacement` 表达的是模板变量替换规则，不应只是基础设施工具对象，更适合抽象为 **TemplateVariable**。

- **技术细节泄漏**：`HSSFWorkbook`、`PoiUtils`、`FileDownloader` 混入应用/领域流程。

### Step 2：提炼领域概念

- **SettlementBill / 结算账单**：被填充和导出的账单对象。

- **SettlementBillTemplate / 结算账单模板数据**：能够生成需要替换的模板变量。

- **InternalSettlementBillTemplate / 内部结算账单模板**：内部结算场景下的具体模板数据。

- **TemplateVariable / 模板变量**：包含行号、列号和替换值。

- **Workbook / Sheet / Row**：对 Excel 工作薄、工作表、行的领域侧抽象。

### Step 3：划分边界和端口

- **领域层**：保留 `SettlementBill`、`SettlementBillTemplate`、`TemplateVariable`、`Workbook`、`SettlementBillService`。

- **端口 / Port**：定义 `WorkbookReader`、`WorkbookWriter`、`SettlementBillTemplateRepository`、`OutputStreamProvider`。

- **基础设施层**：用 POI Adapter、Repository Adapter、Download Adapter 实现端口。

- **应用层**：接收导出请求，调用领域服务，不直接操作 POI、数据库或 HTTP 响应。

### Step 4：设计领域模型

**InternalSettlementBillTemplate** 实现 `SettlementBillTemplate`，负责 `composeVariables()`；**SettlementBill** 持有 `Workbook`，负责 `fillWith(template)`；**Workbook**、**Sheet** 负责 `replaceOrSet()`。这样替换规则回到领域模型，具体 Excel 技术留在适配器。

### Step 5：写修改后的伪代码

```java
interface SettlementBillTemplate {
    List<TemplateVariable> composeVariables();
}

class InternalSettlementBillTemplate implements SettlementBillTemplate {
    private String billNumber;
    private String flightIdentity;
    private String flightRoute;
    private BigDecimal totalCost;

    public List<TemplateVariable> composeVariables() {
        return List.of(
            new TemplateVariable(0, 0, billNumber),
            new TemplateVariable(1, 0, flightIdentity),
            new TemplateVariable(1, 2, flightRoute)
        );
    }
}

class TemplateVariable {
    private int rowIndex;
    private int cellNum;
    private String replaceValue;
}
```

```java
class SettlementBill {
    private Workbook workbook;

    public void setWorkbook(Workbook workbook) {
        this.workbook = workbook;
    }

    public void fillWith(
            SettlementBillTemplate template,
            int sheetIndex,
            String replacePattern) {
        workbook.fillWith(template, sheetIndex, replacePattern);
    }
}

abstract class Workbook {
    protected abstract Sheet getSheetAt(int sheetIndex);

    public void fillWith(
            SettlementBillTemplate template,
            int sheetIndex,
            String replacePattern) {
        Sheet sheet = getSheetAt(sheetIndex);
        for (TemplateVariable variable : template.composeVariables()) {
            sheet.replaceOrSet(variable, replacePattern);
        }
    }
}
```

```java
class SettlementBillService {
    private WorkbookReader reader;
    private WorkbookWriter writer;
    private SettlementBillTemplateRepository repository;

    public void export(
            OutputStreamProvider streamProvider,
            String templateName,
            String billNumber) {
        SettlementBillTemplate template =
            repository.loadBy(templateName, billNumber);

        SettlementBill bill =
            reader.readFrom(templateName);

        bill.fillWith(template, 0, "${}");

        writer.writeTo(streamProvider, bill, templateName);
    }
}
```

### Step 6：画图和答题句

**答题句：**改造后的设计把模板变量生成、账单填充等业务规则放入领域模型，把 Excel、数据库和下载等技术实现放到基础设施适配器中；领域服务只依赖端口，因此核心业务逻辑更稳定、更容易测试。

## 这类题的统一答题模板

1. **识别坏味道**：贫血模型、越过对象边界、职责错位、技术细节泄漏。

2. **提炼领域概念**：从业务语言中找实体、值对象、聚合、领域服务、领域事件或领域异常。

3. **划分边界**：区分领域层、应用层、基础设施层；必要时划分限界上下文。

4. **重新分配职责**：谁持有领域信息，谁优先承担相关行为；跨聚合规则才放领域服务。

5. **写伪代码**：展示领域对象方法、领域服务流程和端口接口。

6. **补设计图**：小对象改造画类图/协作图；系统级改造画分层图、端口适配器图、时序图。

**知识出处：**`slides/领域驱动设计项目实战讲解.pdf`：超市收银员案例、迪米特法则、修改后的超市收银员、引入聚合/限界上下文、结算系统、修改前后设计模型、结算账单模板与领域服务定义。

# 十一、Mock 题：星空在线影院票务系统，按标准步骤答题

**核心记忆：**这题考的是把“选座购票”从流程描述翻译成 **事件风暴**、**限界上下文**、**聚合设计** 和 **领域行为代码**。答题时不要只写 CRUD 表结构，要把“锁座、超时取消、支付成功出票”这些业务规则放回领域模型里。

## 题目

某公司要设计一个 **在线影院票务系统**。用户可以在 App 上浏览当前上映的电影、影院和排片场次。用户选择某个场次后进入选座页面，选择座位并点击提交订单后，系统必须把这些座位锁定，不能让别人买走。

锁定成功后，系统生成一个 **待支付订单**。用户必须在 **15 分钟内完成支付**。如果支付成功，系统出票并生成带二维码的电影票；如果 15 分钟未支付，或者用户主动取消，系统需要取消订单，并释放锁定座位，允许其他用户再次购买。

**任务：**按照 DDD 的设计思想，完成事件风暴分析、战略设计和战术设计，并给出能体现领域行为的伪代码。

## Step 1：先抓业务不变量

- **座位锁定不变量：**提交订单时，目标座位必须存在且处于可售状态；锁定后，其他用户不能再购买这些座位。

- **订单生命周期不变量：**新订单初始状态是待支付；只有待支付订单可以取消；支付成功后不能再按普通取消流程释放座位。

- **支付时限不变量：**订单必须在 15 分钟内支付，否则由超时策略取消订单并释放座位。

- **出票不变量：**只有支付成功的订单才能出票；出票结果可以是带二维码的电影票。

**答题表述：**这类题先不要急着设计表。先把不可破坏的业务规则写出来，再决定哪些规则应该放进聚合方法，哪些规则应该交给策略或应用服务编排。

## Step 2：事件风暴

- **角色：**购票用户。

- **命令：**`SubmitOrder`、`PayOrder`、`CancelOrder`、`ExpireOrder`、`IssueTicket`。

- **领域事件：**`SeatsLocked`、`OrderCreated`、`PaymentCompleted`、`OrderCancelled`、`SeatsReleased`、`TicketIssued`。

- **策略：**提交订单成功后锁座并创建订单；支付成功后触发出票；15 分钟未支付或用户取消后，取消订单并释放座位。

## Step 3：战略设计：限界上下文和 Context Map

- **Catalog Context / 目录上下文：**负责电影、影院、排片场次展示。它主要提供查询能力，是支撑域。

- **Booking Context / 订票上下文：**负责选座、锁座、订单生命周期，是核心域。锁座和订单创建都应该围绕它展开。

- **Payment Context / 支付上下文：**负责对接第三方支付渠道，通常是通用域或外部系统适配。

- **Ticket Context / 票务上下文：**负责生成电影票、二维码和验票凭证。

**Context Map：Booking** 依赖 **Catalog** 的场次信息，可以写成 **Conformist / 遵奉者**；**Booking**、**Payment** 和 **Ticket** 之间更适合用 **领域事件** 解耦，例如支付上下文发布 `PaymentCompleted`，票务上下文监听后签发电影票。

## Step 4：战术设计：聚合、实体和值对象

这题不要把场次座位和订单都塞进一个巨大聚合。**锁座**关注座位并发一致性，**订单**关注支付和取消生命周期，两者变化原因不同，适合拆成两个聚合。

- **Showtime 聚合：**聚合根是 `Showtime`，内部实体是 `Seat`，值对象包括 `SeatId` 和 `SeatStatus`。它负责判断座位是否可锁、执行锁定和释放。

- **Order 聚合：**聚合根是 `Order`，值对象包括 `OrderId`、`OrderAmount` 和 `OrderStatus`。它负责订单创建、取消、支付完成等状态变化。

- **应用服务：**`BookingAppService` 负责编排事务：加载场次、调用领域方法锁座、创建订单、保存聚合。它不直接写座位状态细节。

## Step 5：伪代码：把规则写进领域对象

下面的代码重点不是语法完整，而是展示 **贫血模型应该被去掉**：锁座、释放、取消订单这些规则应该进入聚合方法，而不是散落在 Controller 或 SQL 更新语句里。

```Java
public enum SeatStatus {
    AVAILABLE, LOCKED, SOLD
}

public class Showtime extends AggregateRoot {
    private String showtimeId;
    private List<Seat> seats;

    public void lockSeats(List<String> targetSeatIds) {
        for (String seatId : targetSeatIds) {
            Seat seat = findSeat(seatId);
            if (seat == null || seat.getStatus() != SeatStatus.AVAILABLE) {
                throw new DomainException("座位已被占用或不存在: " + seatId);
            }
            seat.lock();
        }
        registerEvent(new SeatsLockedEvent(showtimeId, targetSeatIds));
    }

    public void releaseSeats(List<String> targetSeatIds) {
        for (String seatId : targetSeatIds) {
            Seat seat = findSeat(seatId);
            if (seat != null && seat.getStatus() == SeatStatus.LOCKED) {
                seat.release();
            }
        }
        registerEvent(new SeatsReleasedEvent(showtimeId, targetSeatIds));
    }
}

public class Order extends AggregateRoot {
    private OrderId orderId;
    private OrderStatus status;
    private List<String> seatIds;
    private Money totalAmount;
    private LocalDateTime createTime;

    public Order(String showtimeId, List<String> seatIds, Money totalAmount) {
        this.orderId = new OrderId();
        this.status = OrderStatus.PENDING;
        this.seatIds = seatIds;
        this.totalAmount = totalAmount;
        this.createTime = LocalDateTime.now();
        registerEvent(new OrderCreatedEvent(orderId, showtimeId, seatIds));
    }

    public void cancel() {
        if (status != OrderStatus.PENDING) {
            throw new DomainException("只能取消待支付订单");
        }
        status = OrderStatus.CANCELLED;
        registerEvent(new OrderCancelledEvent(orderId, seatIds));
    }

    public void markPaid() {
        if (status != OrderStatus.PENDING) {
            throw new DomainException("只有待支付订单可以支付");
        }
        status = OrderStatus.PAID;
        registerEvent(new PaymentCompletedEvent(orderId));
    }
}

@Service
public class BookingAppService {
    @Resource
    private ShowtimeRepository showtimeRepo;
    @Resource
    private OrderRepository orderRepo;

    @Transactional
    public String createOrder(String showtimeId, List<String> seatIds) {
        Showtime showtime = showtimeRepo.findById(showtimeId);

        showtime.lockSeats(seatIds);
        showtimeRepo.save(showtime);

        Order order = new Order(showtimeId, seatIds, calculatePrice(seatIds));
        orderRepo.save(order);

        return order.getOrderId().getValue();
    }
}
```

## Step 6：补充流程图和答题句

**答案句：**本题可以把 **Booking Context** 作为核心域，用 **Showtime 聚合** 保证座位锁定一致性，用 **Order 聚合** 管理订单生命周期；支付和出票通过 **领域事件** 与订票上下文解耦，超时取消通过 **Policy / 策略** 触发订单取消和座位释放。

## 知识出处

- 用户补充截图：**DDD 设计题目：星空在线影院票务系统**，用于补充本 mock 题的题面、事件风暴、上下文拆分、聚合建模和伪代码示例。

- 本页前文：**DDD 设计题答题模板**、**事件风暴**、**战略设计** 和 **战术设计** 的统一步骤。

> (注：内容由 AI 生成，请谨慎参考）
