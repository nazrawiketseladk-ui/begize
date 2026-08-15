import { prisma } from './prisma';
import { hashPassword } from './auth';

export async function seedDatabaseIfEmpty() {
  try {
    const userCount = await prisma.user.count();
    if (userCount > 0) return;

    console.log('[BEGIZE SEED] Database is empty. Pre-populating default user, rooms, and bills...');

    const defaultPasswordHash = await hashPassword('password123');

    const defaultUser = await prisma.user.create({
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

    const userId = defaultUser.id;

    // Seed 7 Rooms
    await prisma.tenant.createMany({
      data: [
        {
          userId,
          roomNumber: '101',
          tenantName: 'Abebe Bikila',
          phone: '+251 91 123 4567',
          rentAmount: 12500,
          dueDay: 5,
          status: 'paid',
          lastPaidDate: '2026-08-04',
          notes: 'Ground floor office space'
        },
        {
          userId,
          roomNumber: '102',
          tenantName: 'Tigist Assefa',
          phone: '+251 92 345 6789',
          rentAmount: 9500,
          dueDay: 10,
          status: 'overdue',
          notes: 'Residential apartment 1st floor'
        },
        {
          userId,
          roomNumber: '103',
          tenantName: 'Dawit Gebremichael',
          phone: '+251 93 456 7890',
          rentAmount: 14000,
          dueDay: 15,
          status: 'due-soon',
          notes: 'Corner retail shop'
        },
        {
          userId,
          roomNumber: '104',
          tenantName: 'Almaz Ayana',
          phone: '+251 94 567 8901',
          rentAmount: 11000,
          dueDay: 1,
          status: 'paid',
          lastPaidDate: '2026-08-01',
          notes: '2nd floor suite'
        },
        {
          userId,
          roomNumber: '105',
          tenantName: 'Yohannes Tadesse',
          phone: '+251 91 678 9012',
          rentAmount: 10500,
          dueDay: 20,
          status: 'due-soon',
          notes: 'Residential studio'
        },
        {
          userId,
          roomNumber: '106',
          tenantName: 'Genzebe Dibaba',
          phone: '+251 92 789 0123',
          rentAmount: 13000,
          dueDay: 12,
          status: 'overdue',
          notes: '1st floor commercial office'
        },
        {
          userId,
          roomNumber: '107',
          tenantName: 'Solomon Haile',
          phone: '+251 95 890 1234',
          rentAmount: 8500,
          dueDay: 25,
          status: 'paid',
          lastPaidDate: '2026-07-25',
          notes: 'Ground floor storage unit'
        }
      ]
    });

    // Seed 4 Outgoing Utility Bills
    await prisma.bill.createMany({
      data: [
        {
          userId,
          title: 'Electricity Bill (EEU)',
          category: 'electricity',
          accountNumber: 'EEU-88492011',
          amount: 3450,
          dueDay: 18,
          isPaid: false,
          provider: 'Ethiopian Electric Utility (EEU)'
        },
        {
          userId,
          title: 'Water Bill (AAWSA)',
          category: 'water',
          accountNumber: 'AAWSA-554109',
          amount: 1850,
          dueDay: 22,
          isPaid: true,
          provider: 'Addis Ababa Water & Sewerage Authority',
          lastPaidDate: '2026-08-02'
        },
        {
          userId,
          title: 'Internet Bill (Ethio Telecom)',
          category: 'internet',
          accountNumber: 'ET-WIFI-99201',
          amount: 2800,
          dueDay: 5,
          isPaid: true,
          provider: 'Ethio Telecom Fiber',
          lastPaidDate: '2026-08-03'
        },
        {
          userId,
          title: 'Building Maintenance',
          category: 'maintenance',
          accountNumber: 'MAINT-004-ADDIS',
          amount: 4000,
          dueDay: 28,
          isPaid: false,
          provider: 'City Sanitation & Maintenance'
        }
      ]
    });

    console.log('[BEGIZE SEED] Database seed completed successfully!');
  } catch (err) {
    console.error('Database Seeding Error:', err);
  }
}
