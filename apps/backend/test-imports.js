try {
  console.log('Testing imports...');

  console.log('1. Shared module');
  require('./shared');
  console.log('✅ Shared module loaded');

  console.log('2. Express config');
  require('./src/config/express');
  console.log('✅ Express config loaded');

  console.log('3. Core routes');
  require('./src/routes/core.routes');
  console.log('✅ Core routes loaded');

  console.log('4. Auth Farmer container');
  require('./modules/auth-farmer/container');
  console.log('✅ Auth Farmer container loaded');

  console.log('5. Workflow Engine');
  require('./modules/application-workflow/domain/gacp-workflow-engine');
  console.log('✅ Workflow Engine loaded');

  console.log('6. Inspection Service');
  require('./services/gacp-enhanced-inspection');
  console.log('✅ Inspection Service loaded');

  console.log('7. Health Monitoring');
  require('./services/health-monitoring');
  console.log('✅ Health Monitoring loaded');

} catch (error) {
  console.error('❌ Import failed:', error.message);
  console.error('Stack:', error.stack);
}
