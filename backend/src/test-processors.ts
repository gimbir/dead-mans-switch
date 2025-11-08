/**
 * Test Queue Processors
 *
 * This script tests the queue processors with actual data.
 */

import * as dotenv from 'dotenv';
dotenv.config();

import { PrismaClient } from '../src/generated/prisma/index.js';
import { initializeQueue, shutdownQueue } from './infrastructure/queue/initializeQueue.js';
import { QueueManager, QueueName } from './infrastructure/queue/QueueManager.js';
import { UserRepository } from './infrastructure/repositories/UserRepository.js';
import { SwitchRepository } from './infrastructure/repositories/SwitchRepository.js';
import { MessageRepository } from './infrastructure/repositories/MessageRepository.js';
import { EmailService } from './infrastructure/services/EmailService.js';
import { EncryptionService } from './infrastructure/services/EncryptionService.js';
import { HashingService } from './infrastructure/services/HashingService.js';
import { CacheService } from './infrastructure/cache/CacheService.js';
import { User } from './domain/entities/User.entity.js';
import { Switch } from './domain/entities/Switch.entity.js';
import { Message } from './domain/entities/Message.entity.js';
import { Email } from './domain/value-objects/Email.vo.js';
import { Password } from './domain/value-objects/Password.vo.js';
import { TimeInterval } from './domain/value-objects/TimeInterval.vo.js';

async function testProcessors() {
  console.log('🚀 Starting Processor Tests...\n');

  const prisma = new PrismaClient();

  try {
    // 1. Setup repositories and services
    console.log('1. Setting up repositories and services...');
    const userRepository = new UserRepository(prisma);
    const switchRepository = new SwitchRepository(prisma);
    const messageRepository = new MessageRepository(prisma);
    const emailService = new EmailService();
    const encryptionService = new EncryptionService();
    const hashingService = new HashingService();
    const cacheService = new CacheService();

    console.log('✅ Repositories and services initialized\n');

    // 2. Clear test data
    console.log('2. Clearing old test data...');
    await prisma.message.deleteMany({ where: { recipientEmail: { contains: 'test@' } } });
    await prisma.checkIn.deleteMany({});
    await prisma.switch.deleteMany({ where: { name: { contains: 'Test Switch' } } });
    await prisma.user.deleteMany({ where: { email: { contains: 'test@' } } });
    console.log('✅ Old test data cleared\n');

    // 3. Create test user
    console.log('3. Creating test user...');
    const email = Email.create('test@example.com');
    if (!email.isSuccess) throw new Error('Invalid email');

    const password = Password.create('Test123!@#');
    if (!password.isSuccess) throw new Error('Invalid password');

    const hashResult = await hashingService.hashPassword(password.value);
    if (!hashResult.isSuccess) throw new Error(`Failed to hash password: ${hashResult.error}`);
    console.log(`   Hashed password: Generated`);

    const user = User.create({
      email: email.value, // Pass the Email value object directly
      hashedPassword: hashResult.value,
      name: 'Test User',
    });
    if (!user.isSuccess) throw new Error(`Failed to create user entity: ${user.error}`);

    const savedUser = await userRepository.save(user.value);
    if (!savedUser.isSuccess) throw new Error(`Failed to save user: ${savedUser.error}`);

    console.log(`✅ User created: ${savedUser.value.id}\n`);

    // 4. Create test switch (past due)
    console.log('4. Creating test switch (past due)...');
    const checkInInterval = TimeInterval.create(1); // 1 day
    if (!checkInInterval.isSuccess) throw new Error('Invalid check-in interval');

    const gracePeriod = TimeInterval.create(1); // 1 day grace period
    if (!gracePeriod.isSuccess) throw new Error('Invalid grace period');

    const switchEntity = Switch.create({
      userId: savedUser.value.id,
      name: 'Test Switch - Past Due',
      description: 'This switch is past due and should trigger',
      checkInInterval: checkInInterval.value,
      gracePeriod: gracePeriod.value,
    });
    if (!switchEntity.isSuccess) throw new Error('Failed to create switch entity');

    // Note: We'll need to update the switch after saving to make it past due
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const savedSwitch = await switchRepository.save(switchEntity.value);
    if (!savedSwitch.isSuccess) throw new Error('Failed to save switch');

    // Update the switch to make it past due by directly updating in database
    await prisma.switch.update({
      where: { id: savedSwitch.value.id },
      data: {
        lastCheckIn: threeDaysAgo,
        nextCheckInDue: threeDaysAgo, // Set to past date to trigger
      },
    });

    console.log(`✅ Switch created: ${savedSwitch.value.id}`);
    console.log(`   Last check-in: ${threeDaysAgo.toISOString()}`);
    console.log(`   Next due: ${threeDaysAgo.toISOString()}\n`);

    // 5. Create test message
    console.log('5. Creating test message...');
    const encryptResult = await encryptionService.encrypt(
      'This is a test notification message. Your switch has been triggered!'
    );
    if (!encryptResult.isSuccess)
      throw new Error(`Failed to encrypt message: ${encryptResult.error}`);

    const recipientEmail = Email.create('test@recipient.com');
    if (!recipientEmail.isSuccess) throw new Error('Invalid recipient email');

    const message = Message.create({
      switchId: savedSwitch.value.id,
      recipientEmail: recipientEmail.value,
      recipientName: 'Test Recipient',
      subject: 'Switch Triggered - Test',
      encryptedContent: encryptResult.value.encryptedContent, // Use the encrypted content string
    });
    if (!message.isSuccess) throw new Error('Failed to create message entity');

    const savedMessage = await messageRepository.save(message.value);
    if (!savedMessage.isSuccess) throw new Error(`Failed to save message: ${savedMessage.error}`);

    console.log(`✅ Message created: ${savedMessage.value.id}\n`);

    // 6. Initialize queue system with dependencies
    console.log('6. Initializing queue system...');
    await initializeQueue({
      switchRepository,
      messageRepository,
      userRepository,
      notificationService: emailService,
      cacheService,
    });
    console.log('✅ Queue system initialized\n');

    // 7. Add check switches job immediately
    console.log('7. Adding immediate check switches job...');
    const queueManager = QueueManager.getInstance();

    // Add immediate job instead of scheduled
    const checkQueue = queueManager.getQueue(QueueName.CHECK_SWITCHES);
    await checkQueue.add('check-switches-immediate', {
      batchSize: 100,
      timestamp: new Date()
    });

    console.log('✅ Check switches job added\n');

    // 8. Wait for processing
    console.log('8. Waiting for job processing...');
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // 9. Check results
    console.log('\n9. Checking results...');
    const updatedSwitch = await switchRepository.findById(savedSwitch.value.id);
    if (updatedSwitch.isSuccess) {
      console.log(`   Switch status: ${updatedSwitch.value?.status}`);
      console.log(
        `   Triggered at: ${updatedSwitch.value?.triggeredAt?.toISOString() || 'Not triggered'}`
      );
    }

    const updatedMessage = await messageRepository.findById(savedMessage.value.id);
    if (updatedMessage.isSuccess) {
      console.log(`   Message sent: ${updatedMessage.value?.isSent}`);
      console.log(`   Sent at: ${updatedMessage.value?.sentAt?.toISOString() || 'Not sent'}`);
      console.log(`   Delivery attempts: ${updatedMessage.value?.deliveryAttempts}`);
    }

    // 10. Check queue stats
    console.log('\n10. Queue Statistics:');
    const checkStats = await queueManager.getQueueStats(QueueName.CHECK_SWITCHES);
    const notifyStats = await queueManager.getQueueStats(QueueName.SEND_NOTIFICATIONS);

    console.log('   CHECK_SWITCHES:', checkStats);
    console.log('   SEND_NOTIFICATIONS:', notifyStats);

    console.log('\n✅ Processor tests completed successfully!');
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    // Cleanup
    console.log('\nCleaning up...');
    await shutdownQueue();
    await prisma.$disconnect();
    console.log('✅ Cleanup complete');
    process.exit(0);
  }
}

// Run the test
testProcessors();
