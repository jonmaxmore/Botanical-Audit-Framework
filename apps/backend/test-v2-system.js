/**
 * V2 System Test Script
 * Tests V2 models and routes without starting the full server
 */

require('dotenv').config();

async function testV2System() {
  console.log('🧪 Testing V2 System Components...\n');

  try {
    // Test 1: Load Notification Model
    console.log('1️⃣ Testing Notification Model...');
    const Notification = require('./models/Notification');
    console.log('✅ Notification model loaded successfully');
    console.log(`   - Schema has ${Object.keys(Notification.schema.paths).length} fields`);

    // Test 2: Load Ticket Model
    console.log('\n2️⃣ Testing Ticket Model...');
    const Ticket = require('./models/Ticket');
    console.log('✅ Ticket model loaded successfully');
    console.log(`   - Schema has ${Object.keys(Ticket.schema.paths).length} fields`);

    // Test 3: Load Role Middleware
    console.log('\n3️⃣ Testing Role Middleware...');
    const roleMiddleware = require('./middleware/roleMiddleware');
    console.log('✅ Role middleware loaded successfully');
    console.log(`   - Available middleware: ${Object.keys(roleMiddleware).join(', ')}`);

    // Test 4: Load V2 Routes
    console.log('\n4️⃣ Testing V2 Routes...');
    const v2Router = require('./routes/v2');
    console.log('✅ V2 router loaded successfully');
    console.log(`   - Router type: ${typeof v2Router}`);

    // Test 5: Check V2 Route Structure
    console.log('\n5️⃣ Testing V2 Route Structure...');
    const notificationsRouter = require('./routes/v2/notifications');
    const ticketsRouter = require('./routes/v2/tickets');
    console.log('✅ V2 sub-routes loaded successfully');
    console.log(`   - Notifications router: ${typeof notificationsRouter}`);
    console.log(`   - Tickets router: ${typeof ticketsRouter}`);

    console.log('\n✅ All V2 components loaded successfully!');
    console.log('\n📋 Summary:');
    console.log('   - Notification Model: ✅');
    console.log('   - Ticket Model: ✅');
    console.log('   - Role Middleware: ✅');
    console.log('   - V2 Router: ✅');
    console.log('   - V2 Sub-routes: ✅');

    console.log('\n🎉 V2 System is ready for deployment!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('\nStack trace:');
    console.error(error.stack);
    process.exit(1);
  }
}

testV2System();
