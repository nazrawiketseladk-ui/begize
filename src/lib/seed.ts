import { prisma } from './prisma';
import { hashPassword } from './auth';

export async function seedDatabaseIfEmpty() {
  try {
    const userCount = await prisma.user.count();
    if (userCount > 0) return;

    console.log('[BEGIZE SEED] Database is empty. Creating default landlord account...');

    const defaultPasswordHash = await hashPassword('password123');

    await prisma.user.create({
      data: {
        email: 'ketsela@begize.app',
        passwordHash: defaultPasswordHash,
        name: 'Ketsela Tadesse',
        phone: '+251 91 100 2233',
        cbeAccount: '1000 4829 1048',
        telebirrNumber: '+251 91 123 4567',
        landlordPhone: '+251 91 100 2233',
        preferredAlertTime: '09:00',
        autoSmsEnabled: true,
      }
    });

    console.log('[BEGIZE SEED] Default landlord account created with 0 sample rooms.');
  } catch (err) {
    console.error('Database Seeding Error:', err);
  }
}
