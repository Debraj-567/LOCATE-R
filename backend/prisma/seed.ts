import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create default office
  const office = await prisma.office.upsert({
    where: { id: 'default-office-id' },
    update: {},
    create: {
      id: 'default-office-id',
      name: 'Headquarters',
      address: '123 Main St, City, Country',
      latitude: 40.7128,
      longitude: -74.006,
      radius: 50,
    },
  });

  // Create admin user
  const hashedPassword = await bcrypt.hash('Admin@123456', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@locate-r.com' },
    update: {},
    create: {
      email: 'admin@locate-r.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: Role.ADMIN,
      officeId: office.id,
    },
  });

  console.log('Seed completed:', { office, admin: { ...admin, password: '[hidden]' } });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
