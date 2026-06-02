import { prisma } from "./prisma";
import { hashPassword } from "./auth";

export const DEFAULT_ADMIN_EMAIL = "admin@bhatha.pk";
export const DEFAULT_ADMIN_PASSWORD = "admin123";

/** Create or reset the default admin user (password always synced on login/seed). */
export async function ensureDefaultAdmin() {
  const passwordHash = await hashPassword(DEFAULT_ADMIN_PASSWORD);
  return prisma.user.upsert({
    where: { email: DEFAULT_ADMIN_EMAIL },
    update: {
      passwordHash,
      role: "ADMIN",
      workerId: null,
      isActive: true,
      name: "Malik Rafique",
      nameUrdu: "ملک رفیق",
    },
    create: {
      email: DEFAULT_ADMIN_EMAIL,
      passwordHash,
      name: "Malik Rafique",
      nameUrdu: "ملک رفیق",
      role: "ADMIN",
      phone: "+923001234567",
      isActive: true,
    },
  });
}
