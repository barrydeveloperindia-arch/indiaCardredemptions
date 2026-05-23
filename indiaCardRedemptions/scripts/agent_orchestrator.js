/**
 * The Points Array - Multi-Agent Orchestrator CLI
 * Orchestrates development, testing, compilation, and branding validation tasks using virtual specialist roles.
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const ARGS = process.argv.slice(2);

const AGENTS = {
  compiler: {
    name: 'Native Compiler Specialist Agent',
    color: '\x1b[36m', // Cyan
    tasks: {
      build: {
        desc: 'Compile Android Release APK',
        cmd: '$env:NODE_ENV="production"; $env:JAVA_HOME="C:\\Program Files\\Android\\Android Studio\\jbr"; ./gradlew assembleRelease',
        cwd: 'android'
      },
      clean: {
        desc: 'Clean Android Build Caches',
        cmd: '$env:JAVA_HOME="C:\\Program Files\\Android\\Android Studio\\jbr"; ./gradlew clean',
        cwd: 'android'
      },
      prebuild: {
        desc: 'Generate Android Native Project Directories',
        cmd: 'npx expo prebuild --platform android --no-install',
        cwd: '.'
      }
    }
  },
  qa: {
    name: 'QA & Testing Specialist Agent',
    color: '\x1b[32m', // Green
    tasks: {
      test: {
        desc: 'Run Jest Unit Testing Suite',
        cmd: 'npm run test',
        cwd: '.'
      },
      lint: {
        desc: 'Execute Code Linter Rules',
        cmd: 'npm run lint',
        cwd: '.'
      }
    }
  },
  branding: {
    name: 'Branding & Assets Specialist Agent',
    color: '\x1b[33m', // Yellow
    tasks: {
      verify: {
        desc: 'Verify file paths and extensions of brand logo assets',
        cmd: 'node scripts/check_image.js',
        cwd: '.'
      },
      rebrand_docs: {
        desc: 'Rebrand legacy texts to The Points Array across project documents',
        cmd: 'node scripts/rebrand_docs.js',
        cwd: '.'
      }
    }
  },
  travel: {
    name: 'Travel & Affiliate Integration Agent',
    color: '\x1b[35m', // Magenta
    tasks: {
      verify_api: {
        desc: 'Verify connectivity and credentials of Duffel flight api endpoints',
        cmd: 'node scripts/test_travel_api.js',
        cwd: '.'
      }
    }
  }
};

function printHelp() {
  console.log('\n\x1b[1m🤖 The Points Array - Agent Manager\x1b[0m');
  console.log('Usage: node scripts/agent_orchestrator.js --agent <compiler|qa|branding|travel> --task <task_name>\n');
  console.log('Registered Specialist Agents & Tasks:');
  
  for (const [agentKey, agent] of Object.entries(AGENTS)) {
    console.log(`\n  ${agent.color}${agent.name} [${agentKey}]\x1b[0m`);
    for (const [taskKey, task] of Object.entries(agent.tasks)) {
      console.log(`    - \x1b[1m${taskKey}\x1b[0m: ${task.desc}`);
    }
  }
  console.log('\n');
}

// Parse args
let agentParam = '';
let taskParam = '';

for (let i = 0; i < ARGS.length; i++) {
  if (ARGS[i] === '--agent' && i + 1 < ARGS.length) {
    agentParam = ARGS[i+1].toLowerCase();
  }
  if (ARGS[i] === '--task' && i + 1 < ARGS.length) {
    taskParam = ARGS[i+1].toLowerCase();
  }
}

if (!agentParam || !taskParam || !AGENTS[agentParam] || !AGENTS[agentParam].tasks[taskParam]) {
  printHelp();
  process.exit(1);
}

const activeAgent = AGENTS[agentParam];
const activeTask = activeAgent.tasks[taskParam];

console.log(`\n${activeAgent.color}[${activeAgent.name}]\x1b[0m Delegated task: \x1b[1m${taskParam}\x1b[0m (${activeTask.desc})`);
console.log(`Executing command: \x1b[90m${activeTask.cmd}\x1b[0m\n`);

try {
  // Execute via powershell since we are on Windows and some commands use env var setters
  execSync(activeTask.cmd, {
    shell: 'powershell.exe',
    cwd: path.resolve(__dirname, '..', activeTask.cwd),
    stdio: 'inherit'
  });
  console.log(`\n${activeAgent.color}[${activeAgent.name}]\x1b[0m Task completed \x1b[32mSuccessfully\x1b[0m! 🎉\n`);
} catch (error) {
  console.error(`\n\x1b[31m[Error]\x1b[0m Task execution failed under ${activeAgent.name}.\n`);
  process.exit(1);
}
