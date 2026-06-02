import { prisma } from "./prisma";

export async function generateChallanNumbers(count = 1): Promise<string[]> {
  const year = new Date().getFullYear();
  const prefix = `CH-${year}-`;
  const last = await prisma.dispatch.findFirst({
    where: { challanNo: { startsWith: prefix } },
    orderBy: { challanNo: "desc" },
    select: { challanNo: true },
  });
  let seq = 1;
  if (last?.challanNo) {
    const part = last.challanNo.replace(prefix, "");
    const n = parseInt(part, 10);
    if (!Number.isNaN(n)) seq = n + 1;
  }
  return Array.from({ length: count }, (_, i) =>
    `${prefix}${String(seq + i).padStart(4, "0")}`
  );
}

export async function nextChallanNumber() {
  const [n] = await generateChallanNumbers(1);
  return n;
}
