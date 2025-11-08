/**
 * Test Cleanup Job
 *
 * This script tests the cleanup processor with test data.
 */

import * as dotenv from 'dotenv';
dotenv.config();

import { PrismaClient } from '../src/generated/prisma/index.js';
import { QueueManager, QueueName } from './infrastructure/queue/QueueManager.js';
import { CleanupProcessor } from './infrastructure/queue/processors/CleanupProcessor.js';

async function testCleanupJob() {
  console.log('🧹 Starting Cleanup Job Test...\n');

  const prisma = new PrismaClient();
  let queueManager: QueueManager | null = null;

  try {
    // 1. Create old test data
    console.log('1. Creating old test data...');

    // Create a user first
    const user = await prisma.user.create({
      data: {
        email: 'cleanup-test@example.com',
        password: 'hashed-password',
        name: 'Cleanup Test User',
        isVerified: false,
      }
    });

    // Create old check-ins (older than 90 days)
    const oldDate = new Date();
    oldDate.setDate(oldDate.getDate() - 100); // 100 days ago

    // Create a switch for check-ins
    const testSwitch = await prisma.switch.create({
      data: {
        userId: user.id,
        name: 'Test Switch for Cleanup',
        checkInInterval: 1,
        gracePeriod: 0,
        isActive: true,
        status: 'ACTIVE',
      }
    });

    // Create old check-ins
    for (let i = 0; i < 5; i++) {
      await prisma.checkIn.create({
        data: {
          switchId: testSwitch.id,
          timestamp: oldDate,
          createdAt: oldDate,
        }
      });
    }

    // Create old audit logs
    for (let i = 0; i < 3; i++) {
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'TEST_ACTION',
          entityType: 'TEST_ENTITY',
          entityId: `test-${i}`,
          createdAt: oldDate,
        }
      });
    }

    // Create soft-deleted records (older than 30 days)
    const softDeleteDate = new Date();
    softDeleteDate.setDate(softDeleteDate.getDate() - 35); // 35 days ago

    await prisma.switch.create({
      data: {
        userId: user.id,
        name: 'Soft Deleted Switch',
        checkInInterval: 1,
        gracePeriod: 0,
        isActive: false,
        status: 'ACTIVE',
        deletedAt: softDeleteDate,
      }
    });

    await prisma.message.create({
      data: {
        switchId: testSwitch.id,
        recipientEmail: 'deleted@example.com',
        recipientName: 'Deleted Recipient',
        encryptedContent: 'encrypted-content',
        isSent: false,
        idempotencyKey: `cleanup-test-${Date.now()}`,
        deletedAt: softDeleteDate,
      }
    });

    console.log('✅ Old test data created\n');

    // 2. Count records before cleanup
    console.log('2. Counting records before cleanup...');
    const beforeCounts = {
      checkIns: await prisma.checkIn.count(),
      auditLogs: await prisma.auditLog.count(),
      switches: await prisma.switch.count(),
      messages: await prisma.message.count(),
    };
    console.log('   Before cleanup:', beforeCounts);
    console.log();

    // 3. Initialize queue manager
    console.log('3. Initializing queue manager...');
    queueManager = QueueManager.getInstance();
    await queueManager.initialize();

    // Register cleanup processor
    const cleanupProcessor = new CleanupProcessor();
    queueManager.registerWorker(
      QueueName.CLEANUP,
      cleanupProcessor.createProcessor(),
      1
    );
    console.log('✅ Queue manager initialized\n');

    // 4. Add cleanup job
    console.log('4. Adding cleanup job...');
    const cleanupQueue = queueManager.getQueue(QueueName.CLEANUP);
    await cleanupQueue.add('cleanup-test', {
      checkInRetentionDays: 90,
      auditLogRetentionDays: 90,
      softDeleteRetentionDays: 30,
      timestamp: new Date()
    });
    console.log('✅ Cleanup job added\n');

    // 5. Wait for processing
    console.log('5. Waiting for job processing...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // 6. Count records after cleanup
    console.log('\n6. Counting records after cleanup...');
    const afterCounts = {
      checkIns: await prisma.checkIn.count(),
      auditLogs: await prisma.auditLog.count(),
      switches: await prisma.switch.count(),
      messages: await prisma.message.count(),
    };
    console.log('   After cleanup:', afterCounts);

    // 7. Show cleanup results
    console.log('\n7. Cleanup Results:');
    console.log(`   Check-ins deleted: ${beforeCounts.checkIns - afterCounts.checkIns}`);
    console.log(`   Audit logs deleted: ${beforeCounts.auditLogs - afterCounts.auditLogs}`);
    console.log(`   Switches deleted: ${beforeCounts.switches - afterCounts.switches}`);
    console.log(`   Messages deleted: ${beforeCounts.messages - afterCounts.messages}`);

    console.log('\n✅ Cleanup job test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    // Cleanup test data
    console.log('\nCleaning up test data...');
    await prisma.message.deleteMany({ where: { recipientEmail: { contains: 'cleanup-test' } } });
    await prisma.checkIn.deleteMany({});
    await prisma.switch.deleteMany({ where: { name: { contains: 'Cleanup' } } });
    await prisma.auditLog.deleteMany({ where: { action: 'TEST_ACTION' } });
    await prisma.user.deleteMany({ where: { email: { contains: 'cleanup-test' } } });

    // Shutdown queue
    if (queueManager) {
      await queueManager.shutdown();
    }
    await prisma.$disconnect();
    console.log('✅ Cleanup complete');
    process.exit(0);
  }
}

// Run the test
testCleanupJob();