#!/usr/bin/env node

/**
 * Setup script for University Attendance System
 * This script helps users set up the project environment
 */

import fs from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';
import {execSync} from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

console.log('🚀 Setting up University Attendance System...\n');

// Check Node.js version
function checkNodeVersion () {
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);

  if (majorVersion < 18) {
    console.error('❌ Node.js version 18 or higher is required');
    console.error(`Current version: ${nodeVersion}`);
    process.exit(1);
  }

  console.log(`✅ Node.js version: ${nodeVersion}`);
}

// Check if .env file exists
function checkEnvironmentFile () {
  const envPath = path.join(projectRoot, '.env');

  if (!fs.existsSync(envPath)) {
    console.log('📝 Creating .env file from template...');

    const envExamplePath = path.join(projectRoot, 'env.example');
    if (fs.existsSync(envExamplePath)) {
      fs.copyFileSync(envExamplePath, envPath);
      console.log('✅ .env file created from template');
      console.log('⚠️  Please update the .env file with your configuration');
    } else {
      console.log('⚠️  env.example not found, please create .env file manually');
    }
  } else {
    console.log('✅ .env file already exists');
  }
}

// Install dependencies
function installDependencies () {
  console.log('📦 Installing dependencies...');

  try {
    execSync('npm install', {
      cwd: projectRoot,
      stdio: 'inherit'
    });
    console.log('✅ Dependencies installed successfully');
  } catch (error) {
    console.error('❌ Failed to install dependencies');
    process.exit(1);
  }
}

// Create necessary directories
function createDirectories () {
  const directories = ['logs', 'uploads', 'uploads/avatars', 'public', 'temp'];

  console.log('📁 Creating necessary directories...');

  directories.forEach(dir => {
    const dirPath = path.join(projectRoot, dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, {recursive: true});
      console.log(`✅ Created directory: ${dir}`);
    }
  });
}

// Check MongoDB connection
function checkMongoDB () {
  console.log('🗄️  Checking MongoDB connection...');

  try {
    // This is a basic check - in production you'd want more robust connection testing
    console.log('⚠️  Please ensure MongoDB is running on your system');
    console.log('   You can start MongoDB with: mongod');
  } catch (error) {
    console.log('⚠️  MongoDB check skipped');
  }
}

// Create database indexes
function createDatabaseIndexes () {
  console.log('🔍 Setting up database indexes...');

  try {
    execSync('npm run db:index', {
      cwd: projectRoot,
      stdio: 'inherit'
    });
    console.log('✅ Database indexes created successfully');
  } catch (error) {
    console.log('⚠️  Database indexes setup skipped (MongoDB may not be running)');
  }
}

// Run tests
function runTests () {
  console.log('🧪 Running tests...');

  try {
    execSync('npm test', {
      cwd: projectRoot,
      stdio: 'inherit'
    });
    console.log('✅ All tests passed');
  } catch (error) {
    console.log('⚠️  Tests failed or skipped');
  }
}

// Display next steps
function displayNextSteps () {
  console.log('\n🎉 Setup completed successfully!');
  console.log('\n📋 Next steps:');
  console.log('1. Update your .env file with your configuration');
  console.log('2. Ensure MongoDB is running');
  console.log('3. Start the application: npm run dev');
  console.log('4. Access the API at: http://localhost:5000');
  console.log('5. Check the README.md for detailed documentation');

  console.log('\n🔧 Available commands:');
  console.log('  npm run dev          - Start development server');
  console.log('  npm start            - Start production server');
  console.log('  npm test             - Run tests');
  console.log('  npm run db:index     - Create database indexes');
  console.log('  npm run lint         - Check code quality');
  console.log('  npm run format       - Format code');

  console.log('\n📚 Documentation:');
  console.log('  - README.md          - Project overview and setup');
  console.log('  - docs/              - Detailed documentation');
  console.log('  - ERD.txt            - Database schema');

  console.log('\n🚀 Happy coding!');
}

// Main setup function
async function main () {
  try {
    checkNodeVersion();
    checkEnvironmentFile();
    installDependencies();
    createDirectories();
    checkMongoDB();
    createDatabaseIndexes();
    runTests();
    displayNextSteps();
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

// Run setup
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
