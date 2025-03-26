const fs = require('fs');

// Read the app.js file
const appCode = fs.readFileSync('app.js', 'utf8');

// Define checks
const checks = [
  {
    name: 'Debug Logging',
    pattern: /console\.log\([^'"]*[^'"]*\)/g,
    message: 'Found debug console.log statements. Only essential logs should remain.',
    shouldFail: true,
    excludePatterns: [
      /console\.log\('XCancel bot is running!'\)/,
      /console\.log\('Connected to Slack'\)/,
      /console\.log\('Connecting to Slack\.\.\.'\)/,
      /console\.log\('Disconnected from Slack'\)/
    ]
  },
  {
    name: 'Test Message',
    pattern: /complete-bollocks/g,
    message: 'Found test channel reference. Remove test messages before deploying.',
    shouldFail: true
  },
  {
    name: 'Correct Response Message',
    pattern: /No x\.com account\? I got u:/g,
    message: 'Correct response message is present.',
    shouldFail: false
  },
  {
    name: 'HTTP Server',
    pattern: /http\.createServer/g,
    message: 'HTTP server is present for Render.',
    shouldFail: false
  },
  {
    name: 'Port Configuration',
    pattern: /process\.env\.PORT/g,
    message: 'Port configuration is present for Render.',
    shouldFail: false
  }
];

// Run checks
console.log('Running deployment checks...\n');

let hasErrors = false;

checks.forEach(check => {
  let matches = appCode.match(check.pattern) || [];
  
  // If there are exclude patterns, filter out allowed matches
  if (check.excludePatterns && matches.length > 0) {
    matches = matches.filter(match => 
      !check.excludePatterns.some(pattern => pattern.test(match))
    );
  }
  
  const status = check.shouldFail ? 
    (matches.length > 0 ? '❌ FAIL' : '✅ PASS') : 
    (matches.length > 0 ? '✅ PASS' : '❌ FAIL');
  
  console.log(`${status} - ${check.name}`);
  if (check.shouldFail && matches.length > 0) {
    console.log(`  ${check.message}`);
    console.log(`  Found: ${matches.join(', ')}`);
    hasErrors = true;
  } else if (!check.shouldFail && matches.length === 0) {
    console.log(`  ${check.message}`);
    hasErrors = true;
  }
});

console.log('\nDeployment check complete!');
if (hasErrors) {
  console.log('❌ Please fix the issues before deploying.');
  process.exit(1);
} else {
  console.log('✅ All checks passed! Ready to deploy.');
} 