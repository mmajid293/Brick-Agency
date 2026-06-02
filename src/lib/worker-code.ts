import { prisma } from "./prisma";

export async function generateWorkerCode() {
  const year = new Date().getFullYear();
  const prefix = `WB-${year}-`;
  const last = await prisma.worker.findFirst({
    where: { workerCode: { startsWith: prefix } },
    orderBy: { workerCode: "desc" },
    select: { workerCode: true },
  });
  const seq = last?.workerCode
    ? parseInt(last.workerCode.split("-").pop() || "0", 10) + 1
    : 1;
  return `${prefix}${String(seq).padStart(4, "0")}`;
}
