import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 เริ่มต้นการ Seed ข้อมูลระบบบัญชีส่วนตัว...");

  // ล้างข้อมูลเดิมอย่างปลอดภัย
  await prisma.transaction.deleteMany();
  await prisma.recurringExpense.deleteMany();
  await prisma.budget.deleteMany();
  await prisma.category.deleteMany();
  await prisma.account.deleteMany();
  await prisma.appConfig.deleteMany();

  // 1. สร้างการตั้งค่าเริ่มต้น
  await prisma.appConfig.create({
    data: {
      id: "default",
      isPinEnabled: false,
      currency: "THB",
      theme: "system",
    },
  });

  // 2. สร้างบัญชีเริ่มต้น
  const cash = await prisma.account.create({
    data: {
      name: "เงินสด",
      type: "CASH",
      initialBalance: 5000,
      currentBalance: 5000,
      currency: "THB",
      color: "#10b981", // Emerald
      isActive: true,
    },
  });

  const bank = await prisma.account.create({
    data: {
      name: "ธนาคารกสิกรไทย",
      type: "BANK",
      initialBalance: 45000,
      currentBalance: 45000,
      currency: "THB",
      color: "#3b82f6", // Blue
      isActive: true,
    },
  });

  const wallet = await prisma.account.create({
    data: {
      name: "TrueMoney Wallet",
      type: "WALLET",
      initialBalance: 2500,
      currentBalance: 2500,
      currency: "THB",
      color: "#f59e0b", // Amber
      isActive: true,
    },
  });

  console.log("✅ สร้างบัญชีการเงินเรียบร้อยแล้ว");

  // 3. สร้างหมวดหมู่ (Categories)
  const categoriesData = [
    // รายจ่าย (EXPENSE)
    { name: "อาหาร", type: "EXPENSE", icon: "Utensils", color: "#f97316" },
    { name: "เครื่องดื่ม", type: "EXPENSE", icon: "Coffee", color: "#8b5cf6" },
    { name: "เดินทาง", type: "EXPENSE", icon: "Car", color: "#06b6d4" },
    { name: "ที่พัก", type: "EXPENSE", icon: "Home", color: "#6366f1" },
    { name: "ช้อปปิ้ง", type: "EXPENSE", icon: "ShoppingBag", color: "#ec4899" },
    { name: "บิล/สาธารณูปโภค", type: "EXPENSE", icon: "Zap", color: "#eab308" },
    { name: "สุขภาพ", type: "EXPENSE", icon: "HeartPulse", color: "#ef4444" },
    { name: "บันเทิง", type: "EXPENSE", icon: "Tv", color: "#a855f7" },
    { name: "การศึกษา", type: "EXPENSE", icon: "GraduationCap", color: "#14b8a6" },
    { name: "ภาษี", type: "EXPENSE", icon: "Receipt", color: "#64748b" },
    { name: "รายจ่ายอื่น ๆ", type: "EXPENSE", icon: "MoreHorizontal", color: "#94a3b8" },

    // รายรับ (INCOME)
    { name: "เงินเดือน", type: "INCOME", icon: "Briefcase", color: "#22c55e" },
    { name: "Freelance", type: "INCOME", icon: "Laptop", color: "#10b981" },
    { name: "โบนัส", type: "INCOME", icon: "Gift", color: "#eab308" },
    { name: "ขายของ", type: "INCOME", icon: "Store", color: "#3b82f6" },
    { name: "ดอกเบี้ย/เงินปันผล", type: "INCOME", icon: "TrendingUp", color: "#8b5cf6" },
    { name: "รายรับอื่น ๆ", type: "INCOME", icon: "PlusCircle", color: "#14b8a6" },
  ];

  const categoryMap = new Map<string, string>();
  for (const cat of categoriesData) {
    const created = await prisma.category.create({
      data: {
        name: cat.name,
        type: cat.type,
        icon: cat.icon,
        color: cat.color,
      },
    });
    categoryMap.set(cat.name, created.id);
  }

  console.log("✅ สร้างหมวดหมู่เรียบร้อยแล้ว");

  // 4. สร้าง Budget ตัวอย่างประจำเดือนนี้
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  await prisma.budget.createMany({
    data: [
      { categoryId: categoryMap.get("อาหาร")!, amount: 6000, month: currentMonth, year: currentYear },
      { categoryId: categoryMap.get("เดินทาง")!, amount: 2500, month: currentMonth, year: currentYear },
      { categoryId: categoryMap.get("ช้อปปิ้ง")!, amount: 3000, month: currentMonth, year: currentYear },
      { categoryId: categoryMap.get("บิล/สาธารณูปโภค")!, amount: 3500, month: currentMonth, year: currentYear },
    ],
  });

  // 5. สร้างรายการค่าใช้จ่ายประจำ (Recurring)
  await prisma.recurringExpense.createMany({
    data: [
      {
        name: "อินเทอร์เน็ตบ้าน",
        amount: 599,
        type: "EXPENSE",
        categoryId: categoryMap.get("บิล/สาธารณูปโภค")!,
        accountId: bank.id,
        frequency: "MONTHLY",
        dayOfMonth: 15,
        nextDueDate: new Date(currentYear, currentMonth - 1, 15),
      },
      {
        name: "Netflix Subscription",
        amount: 419,
        type: "EXPENSE",
        categoryId: categoryMap.get("บันเทิง")!,
        accountId: wallet.id,
        frequency: "MONTHLY",
        dayOfMonth: 20,
        nextDueDate: new Date(currentYear, currentMonth - 1, 20),
      },
    ],
  });

  // 6. สร้างตัวอย่าง Transactions (15-20 รายการ)
  const d = (daysAgo: number) => {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return date;
  };

  const sampleTransactions = [
    // รายรับ
    {
      accountId: bank.id,
      categoryId: categoryMap.get("เงินเดือน"),
      type: "INCOME",
      amount: 42000,
      date: d(6),
      note: "เงินเดือนประจำงวด",
    },
    {
      accountId: bank.id,
      categoryId: categoryMap.get("Freelance"),
      type: "INCOME",
      amount: 8500,
      date: d(4),
      note: "งานออกแบบเว็บไซต์",
    },
    // โอนเงิน
    {
      accountId: bank.id,
      toAccountId: cash.id,
      type: "TRANSFER",
      amount: 3000,
      date: d(5),
      note: "กดเงินสดตู้ ATM",
    },
    {
      accountId: bank.id,
      toAccountId: wallet.id,
      type: "TRANSFER",
      amount: 1500,
      date: d(3),
      note: "เติมเงินเข้า TrueMoney Wallet",
    },
    // รายจ่าย อาหาร
    {
      accountId: cash.id,
      categoryId: categoryMap.get("อาหาร"),
      type: "EXPENSE",
      amount: 80,
      date: d(0),
      note: "ข้าวมันไก่ตอนเช้า",
    },
    {
      accountId: wallet.id,
      categoryId: categoryMap.get("อาหาร"),
      type: "EXPENSE",
      amount: 150,
      date: d(1),
      note: "ก๋วยเตี๋ยวเรือและเครื่องดื่ม",
    },
    {
      accountId: cash.id,
      categoryId: categoryMap.get("เครื่องดื่ม"),
      type: "EXPENSE",
      amount: 65,
      date: d(1),
      note: "อเมริกาโน่เย็น",
    },
    {
      accountId: bank.id,
      categoryId: categoryMap.get("อาหาร"),
      type: "EXPENSE",
      amount: 850,
      date: d(2),
      note: "มื้อเย็นบุฟเฟต์กับเพื่อนร่วมงาน",
    },
    // เดินทาง
    {
      accountId: wallet.id,
      categoryId: categoryMap.get("เดินทาง"),
      type: "EXPENSE",
      amount: 1200,
      date: d(2),
      note: "เติมน้ำมันรถยนต์",
    },
    {
      accountId: cash.id,
      categoryId: categoryMap.get("เดินทาง"),
      type: "EXPENSE",
      amount: 70,
      date: d(3),
      note: "ค่ารถไฟฟ้า BTS",
    },
    // ช้อปปิ้ง & อื่นๆ
    {
      accountId: bank.id,
      categoryId: categoryMap.get("ช้อปปิ้ง"),
      type: "EXPENSE",
      amount: 1490,
      date: d(4),
      note: "รองเท้าวิ่งลดราคา",
    },
    {
      accountId: bank.id,
      categoryId: categoryMap.get("บิล/สาธารณูปโภค"),
      type: "EXPENSE",
      amount: 1850,
      date: d(5),
      note: "ค่าไฟฟ้าประจำเดือน",
    },
    {
      accountId: wallet.id,
      categoryId: categoryMap.get("สุขภาพ"),
      type: "EXPENSE",
      amount: 280,
      date: d(6),
      note: "ซื้อวิตามินและยาแก้แพ้",
    },
    {
      accountId: bank.id,
      categoryId: categoryMap.get("บันเทิง"),
      type: "EXPENSE",
      amount: 320,
      date: d(7),
      note: "ตั๋วชมภาพยนตร์",
    },
  ];

  for (const item of sampleTransactions) {
    await prisma.transaction.create({
      data: {
        accountId: item.accountId,
        toAccountId: item.toAccountId || null,
        categoryId: item.categoryId || null,
        type: item.type,
        amount: item.amount,
        date: item.date,
        note: item.note,
      },
    });
  }

  // 7. คำนวณ Reconcile balance ของทุกบัญชีจากธุรกรรมทั้งหมด
  const allAccounts = [cash, bank, wallet];
  for (const acc of allAccounts) {
    const inc = await prisma.transaction.aggregate({
      where: { accountId: acc.id, type: "INCOME" },
      _sum: { amount: true },
    });
    const exp = await prisma.transaction.aggregate({
      where: { accountId: acc.id, type: "EXPENSE" },
      _sum: { amount: true },
    });
    const trOut = await prisma.transaction.aggregate({
      where: { accountId: acc.id, type: "TRANSFER" },
      _sum: { amount: true },
    });
    const trIn = await prisma.transaction.aggregate({
      where: { toAccountId: acc.id, type: "TRANSFER" },
      _sum: { amount: true },
    });

    const income = inc._sum.amount || 0;
    const expense = exp._sum.amount || 0;
    const transferOut = trOut._sum.amount || 0;
    const transferIn = trIn._sum.amount || 0;

    const currentBalance = acc.initialBalance + income - expense - transferOut + transferIn;

    await prisma.account.update({
      where: { id: acc.id },
      data: { currentBalance },
    });
  }

  console.log("✅ สร้างรายการธุรกรรมตัวอย่างและ Reconcile ยอดเงินสำเร็จแล้ว!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
