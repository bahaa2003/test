#!/usr/bin/env node
/**
 * Comprehensive RBAC and Authentication Test Script
 * Tests all roles and their access permissions
 */

const BASE_URL = 'http://localhost:5001/api/v1';

// Test credentials for each role
const TEST_CREDENTIALS = {
  system_admin: {
    email: 'admin@attendance-system.com',
    password: 'password123',
    role: 'system_admin'
  },
  admin: {
    email: 'admin@university.edu',
    password: 'password123', 
    role: 'admin'
  },
  faculty: {
    email: 'faculty@university.edu',
    password: 'password123',
    role: 'faculty'
  },
  student: {
    email: 'student@university.edu', 
    password: 'password123',
    role: 'student'
  }
};

// Test endpoints with expected access levels
const TEST_ENDPOINTS = {
  // University management - only system_admin
  'POST /academic/universities': ['system_admin'],
  'PATCH /academic/universities/1': ['system_admin'],
  'DELETE /academic/universities/1': ['system_admin'],
  
  // College management - admin and system_admin
  'POST /academic/colleges': ['admin', 'system_admin'],
  'PATCH /academic/colleges/1': ['admin', 'system_admin'],
  'DELETE /academic/colleges/1': ['admin', 'system_admin'],
  
  // Section management - admin, faculty, system_admin
  'POST /academic/sections': ['admin', 'faculty', 'system_admin'],
  'PATCH /academic/sections/1': ['admin', 'faculty', 'system_admin'],
  'DELETE /academic/sections/1': ['admin', 'system_admin'],
  
  // User management - admin and system_admin
  'GET /admin/users': ['admin', 'system_admin'],
  'POST /admin/users': ['admin', 'system_admin'],
  
  // Public endpoints - all authenticated users
  'GET /academic/universities': ['system_admin', 'admin', 'faculty', 'student'],
  'GET /academic/colleges': ['system_admin', 'admin', 'faculty', 'student'],
  'GET /academic/sections': ['system_admin', 'admin', 'faculty', 'student']
};

class RBACTester {
  constructor() {
    this.tokens = {};
    this.results = {
      authentication: {},
      authorization: {},
      summary: {
        passed: 0,
        failed: 0,
        errors: []
      }
    };
  }

  async testAuthentication() {
    console.log('🔐 Testing Authentication for All Roles...\n');
    
    for (const [role, credentials] of Object.entries(TEST_CREDENTIALS)) {
      try {
        const response = await fetch(`${BASE_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(credentials)
        });
        
        const data = await response.json();
        
        if (response.ok && data.success && data.data.accessToken) {
          this.tokens[role] = data.data.accessToken;
          this.results.authentication[role] = { status: 'PASS', message: 'Login successful' };
          console.log(`✅ ${role.toUpperCase()}: Authentication successful`);
        } else {
          this.results.authentication[role] = { status: 'FAIL', message: data.message || 'Login failed' };
          console.log(`❌ ${role.toUpperCase()}: Authentication failed - ${data.message}`);
          this.results.summary.failed++;
        }
      } catch (error) {
        this.results.authentication[role] = { status: 'ERROR', message: error.message };
        console.log(`💥 ${role.toUpperCase()}: Authentication error - ${error.message}`);
        this.results.summary.errors.push(`${role} auth: ${error.message}`);
      }
    }
    
    console.log('\n' + '='.repeat(60) + '\n');
  }

  async testAuthorization() {
    console.log('🛡️  Testing Authorization for All Endpoints...\n');
    
    for (const [endpoint, allowedRoles] of Object.entries(TEST_ENDPOINTS)) {
      console.log(`Testing: ${endpoint}`);
      
      for (const role of Object.keys(TEST_CREDENTIALS)) {
        if (!this.tokens[role]) {
          console.log(`  ⚠️  ${role}: Skipped (no token)`);
          continue;
        }
        
        const shouldHaveAccess = allowedRoles.includes(role);
        const result = await this.testEndpointAccess(endpoint, role, this.tokens[role]);
        
        if (result.hasAccess === shouldHaveAccess) {
          console.log(`  ✅ ${role}: ${shouldHaveAccess ? 'Authorized' : 'Properly denied'}`);
          this.results.summary.passed++;
        } else {
          console.log(`  ❌ ${role}: ${shouldHaveAccess ? 'Should have access but denied' : 'Should be denied but allowed'}`);
          this.results.summary.failed++;
          this.results.summary.errors.push(`${endpoint} - ${role}: Expected ${shouldHaveAccess ? 'access' : 'denial'}`);
        }
      }
      console.log('');
    }
  }

  async testEndpointAccess(endpoint, role, token) {
    const [method, path] = endpoint.split(' ');
    const url = `${BASE_URL}${path}`;
    
    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: method === 'POST' ? JSON.stringify({ test: 'data' }) : undefined
      });
      
      // 200-299 = access granted, 401/403 = access denied, 404 = endpoint not found (treat as denied)
      const hasAccess = response.status >= 200 && response.status < 300;
      
      return {
        hasAccess,
        status: response.status,
        statusText: response.statusText
      };
    } catch (error) {
      return {
        hasAccess: false,
        status: 500,
        statusText: error.message
      };
    }
  }

  printSummary() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 RBAC AUDIT SUMMARY');
    console.log('='.repeat(60));
    
    console.log('\n🔐 Authentication Results:');
    for (const [role, result] of Object.entries(this.results.authentication)) {
      const icon = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '💥';
      console.log(`  ${icon} ${role.toUpperCase()}: ${result.status} - ${result.message}`);
    }
    
    console.log(`\n📈 Test Results:`);
    console.log(`  ✅ Passed: ${this.results.summary.passed}`);
    console.log(`  ❌ Failed: ${this.results.summary.failed}`);
    console.log(`  💥 Errors: ${this.results.summary.errors.length}`);
    
    if (this.results.summary.errors.length > 0) {
      console.log('\n🚨 Issues Found:');
      this.results.summary.errors.forEach(error => console.log(`  • ${error}`));
    }
    
    const totalTests = this.results.summary.passed + this.results.summary.failed;
    const successRate = totalTests > 0 ? (this.results.summary.passed / totalTests * 100).toFixed(1) : 0;
    
    console.log(`\n🎯 Overall Success Rate: ${successRate}%`);
    
    if (successRate >= 90) {
      console.log('🎉 RBAC System: EXCELLENT');
    } else if (successRate >= 75) {
      console.log('⚠️  RBAC System: NEEDS IMPROVEMENT');
    } else {
      console.log('🚨 RBAC System: CRITICAL ISSUES');
    }
    
    console.log('='.repeat(60));
  }

  async runFullTest() {
    console.log('🚀 Starting Comprehensive RBAC Audit...\n');
    
    await this.testAuthentication();
    await this.testAuthorization();
    this.printSummary();
    
    return this.results;
  }
}

// Run the test if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const tester = new RBACTester();
  tester.runFullTest().catch(console.error);
}

export default RBACTester;
