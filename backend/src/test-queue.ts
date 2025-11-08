import { QueueManager, QueueName } from './infrastructure/queue/QueueManager.js';
// import { logger } from './shared/utils/logger.js';

async function testQueueSystem() {
  try {
    console.log('🚀 Starting Queue System Test...\n');

    // 1. Initialize Queue Manager
    console.log('1. Initializing Queue Manager...');
    const queueManager = QueueManager.getInstance();
    await queueManager.initialize();
    console.log('✅ Queue Manager initialized successfully\n');

    // 2. Test Redis Connection
    console.log('2. Testing Redis connection...');
    // Redis connection is internal to QueueManager, test by trying to get a queue
    queueManager.getQueue(QueueName.CHECK_SWITCHES);
    console.log('✅ Redis connection successful (queue retrieved)\n');

    // 3. Add a test job to CHECK_SWITCHES queue
    console.log('3. Adding test job to CHECK_SWITCHES queue...');
    const checkSwitchesQueue = queueManager.getQueue(QueueName.CHECK_SWITCHES);
    const checkJob = await checkSwitchesQueue.add('check-switches', {
      testData: 'This is a test check switches job',
      timestamp: new Date().toISOString()
    });
    console.log(`✅ Check switches job added with ID: ${checkJob.id}\n`);

    // 4. Add a test job to SEND_NOTIFICATIONS queue
    console.log('4. Adding test job to SEND_NOTIFICATIONS queue...');
    const notificationsQueue = queueManager.getQueue(QueueName.SEND_NOTIFICATIONS);
    const notificationJob = await notificationsQueue.add('send-notification', {
      messageId: 'test-message-123',
      recipientEmail: 'test@example.com',
      subject: 'Test Notification',
      content: 'This is a test notification',
      timestamp: new Date().toISOString()
    });
    console.log(`✅ Notification job added with ID: ${notificationJob.id}\n`);

    // 5. Add a test job to SEND_REMINDERS queue
    console.log('5. Adding test job to SEND_REMINDERS queue...');
    const remindersQueue = queueManager.getQueue(QueueName.SEND_REMINDERS);
    const reminderJob = await remindersQueue.add('send-reminder', {
      switchId: 'test-switch-456',
      userId: 'test-user-789',
      timestamp: new Date().toISOString()
    });
    console.log(`✅ Reminder job added with ID: ${reminderJob.id}\n`);

    // 6. Check queue status
    console.log('6. Checking queue status...');
    const checkQueueCounts = await checkSwitchesQueue.getJobCounts();
    const notificationQueueCounts = await notificationsQueue.getJobCounts();
    const reminderQueueCounts = await remindersQueue.getJobCounts();

    console.log('Queue Status:');
    console.log('CHECK_SWITCHES:', checkQueueCounts);
    console.log('SEND_NOTIFICATIONS:', notificationQueueCounts);
    console.log('SEND_REMINDERS:', reminderQueueCounts);
    console.log();

    // 7. Wait a bit for jobs to process
    console.log('7. Waiting for jobs to process...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // 8. Check final status
    console.log('\n8. Final queue status:');
    const finalCheckCounts = await checkSwitchesQueue.getJobCounts();
    const finalNotificationCounts = await notificationsQueue.getJobCounts();
    const finalReminderCounts = await remindersQueue.getJobCounts();

    console.log('CHECK_SWITCHES:', finalCheckCounts);
    console.log('SEND_NOTIFICATIONS:', finalNotificationCounts);
    console.log('SEND_REMINDERS:', finalReminderCounts);

    console.log('\n✅ Queue system test completed successfully!');

    // Graceful shutdown
    await queueManager.shutdown();
    console.log('✅ Queue manager shutdown complete');

    process.exit(0);
  } catch (error) {
    console.error('❌ Queue system test failed:', error);
    process.exit(1);
  }
}

// Run the test
testQueueSystem();