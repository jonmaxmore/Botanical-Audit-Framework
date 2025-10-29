/**
 * Auto Test Runner Script
 * รันการทดสอบ QA/QC อัตโนมัติแบบ Start to End
 *
 * @version 1.0.0
 * @date October 21, 2025
 */

const { spawn } = require('child_process');
const chalk = require('chalk');

console.log(chalk.blue.bold('\n🚀 Starting Automated QA/QC Testing'));
console.log(chalk.blue('═'.repeat(80)));
console.log(chalk.gray(`Timestamp: ${new Date().toISOString()}\n`));

// Run comprehensive QA test
const testProcess = spawn('node', ['test/comprehensive-qa-test.js'], {
  cwd: process.cwd(),
  stdio: 'inherit'
});

testProcess.on('error', error => {
  console.error(chalk.red('\n❌ Error starting test:'), error.message);
  process.exit(1);
});

testProcess.on('close', code => {
  if (code === 0) {
    console.log(chalk.green.bold('\n✅ All tests completed successfully!'));
  } else {
    console.log(chalk.red.bold(`\n❌ Tests failed with exit code ${code}`));
  }
  process.exit(code);
});
