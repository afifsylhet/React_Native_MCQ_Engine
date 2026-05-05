/**
 * Comprehensive API Test Suite
 * Tests all API endpoints to ensure they are working correctly
 * Run with: node -r ts-node/register src/api/api.test.ts
 */

import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api';

// Test data
let testAuthToken = '';
let testUserId = '';
let testAttemptId = '';
let testQuestionId = '';

// Test Results
const results: {
    passed: number;
    failed: number;
    tests: Array<{ name: string; status: 'PASS' | 'FAIL'; message: string }>;
} = {
    passed: 0,
    failed: 0,
    tests: [],
};

// Helper function to test API endpoint
async function testEndpoint(
    name: string,
    method: string,
    endpoint: string,
    data?: any,
    headers?: any
): Promise<boolean> {
    try {
        const config: any = { headers: { ...headers } };
        if (testAuthToken) {
            config.headers['Authorization'] = `Bearer ${testAuthToken}`;
        }

        let response: any;
        const url = `${API_URL}${endpoint}`;

        switch (method.toUpperCase()) {
            case 'GET':
                response = await axios.get(url, config);
                break;
            case 'POST':
                response = await axios.post(url, data, config);
                break;
            case 'PATCH':
                response = await axios.patch(url, data, config);
                break;
            case 'DELETE':
                response = await axios.delete(url, config);
                break;
            default:
                throw new Error(`Unsupported HTTP method: ${method}`);
        }

        if (response.data.success) {
            results.tests.push({
                name,
                status: 'PASS',
                message: `${name} - OK`,
            });
            results.passed++;
            return true;
        } else {
            results.tests.push({
                name,
                status: 'FAIL',
                message: `${name} - Response not successful: ${response.data.message}`,
            });
            results.failed++;
            return false;
        }
    } catch (error: any) {
        const message = error.response?.data?.message || error.message;
        results.tests.push({
            name,
            status: 'FAIL',
            message: `${name} - ${message}`,
        });
        results.failed++;
        return false;
    }
}

async function runTests() {
    console.log('🧪 Starting Comprehensive API Test Suite');
    console.log(`📍 API URL: ${API_URL}`);
    console.log('━'.repeat(80));

    // ============================================================
    // 1. AUTH ENDPOINTS
    // ============================================================
    console.log('\n📝 Testing Auth Endpoints...');

    // Test Register
    const registerData = {
        firstName: 'Test',
        lastName: 'User',
        email: `test-${Date.now()}@example.com`,
        password: 'Test@123456',
        passwordConfirm: 'Test@123456',
        studentType: 'diploma_nursing_midwifery',
    };

    const registerSuccess = await testEndpoint(
        'Auth - Register',
        'POST',
        '/auth/register',
        registerData
    );

    // If register fails, try to login with known credentials (for testing)
    if (!registerSuccess) {
        const loginSuccess = await testEndpoint(
            'Auth - Login',
            'POST',
            '/auth/login',
            {
                email: 'nurse@gmail.com',
                password: 'Test@123456',
            }
        );

        if (loginSuccess) {
            try {
                const response = await axios.post(`${API_URL}/auth/login`, {
                    email: 'nurse@gmail.com',
                    password: 'Test@123456',
                });
                testAuthToken = response.data.data.accessToken;
                console.log('✓ Auth token obtained');
            } catch (error) {
                console.log('✗ Could not obtain auth token');
            }
        }
    }

    // Test Send OTP
    await testEndpoint('Auth - Send OTP', 'POST', '/auth/send-otp', {
        email: registerData.email,
    });

    // Test Get Me (requires auth token)
    if (testAuthToken) {
        await testEndpoint('Auth - Get Me', 'GET', '/auth/me');
    }

    // Test Change Password (requires auth token)
    if (testAuthToken) {
        await testEndpoint('Auth - Change Password', 'PATCH', '/auth/change-password', {
            currentPassword: 'Test@123456',
            password: 'NewTest@123456',
            passwordConfirm: 'NewTest@123456',
        });
    }

    // ============================================================
    // 2. QUESTION ENDPOINTS
    // ============================================================
    console.log('\n❓ Testing Question Endpoints...');

    const questionSuccess = await testEndpoint(
        'Question - Get Questions',
        'GET',
        '/questions?page=1&limit=10&difficulty=easy'
    );

    if (questionSuccess) {
        try {
            const response = await axios.get(`${API_URL}/questions?page=1&limit=1`);
            if (response.data.data.items && response.data.data.items[0]) {
                testQuestionId = response.data.data.items[0].id;
                console.log(`✓ Sample question ID obtained: ${testQuestionId}`);
            }
        } catch (error) {
            console.log('✗ Could not extract sample question ID');
        }
    }

    // Test Get Single Question
    if (testQuestionId) {
        await testEndpoint(
            'Question - Get Question by ID',
            'GET',
            `/questions/${testQuestionId}`
        );
    }

    // Test Get Question Statistics
    await testEndpoint('Question - Get Statistics', 'GET', '/questions/statistics');

    // Test Report Question (requires auth token)
    if (testAuthToken && testQuestionId) {
        await testEndpoint(
            'Question - Report Question',
            'POST',
            `/questions/${testQuestionId}/report`,
            {
                reason: 'incorrect_answer',
                description: 'Test report',
            }
        );
    }

    // ============================================================
    // 3. EXAM ENDPOINTS
    // ============================================================
    console.log('\n📚 Testing Exam Endpoints...');

    // Test Generate Exam (requires auth token)
    if (testAuthToken) {
        const generateExamSuccess = await testEndpoint(
            'Exam - Generate Exam',
            'POST',
            '/exams/generate',
            {
                difficulty: 'medium',
                numberOfQuestions: 10,
                questionPattern: 'mcq',
            }
        );

        if (generateExamSuccess) {
            try {
                const response = await axios.post(
                    `${API_URL}/exams/generate`,
                    {
                        difficulty: 'medium',
                        numberOfQuestions: 5,
                        questionPattern: 'mcq',
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${testAuthToken}`,
                        },
                    }
                );
                testAttemptId = response.data.data.attemptId;
                console.log(`✓ Test attempt ID obtained: ${testAttemptId}`);
            } catch (error) {
                console.log('✗ Could not extract attempt ID');
            }
        }

        // Test Get Exam History
        await testEndpoint('Exam - Get History', 'GET', '/exams/history?page=1&limit=10');

        // Test Get Exam Result (requires attempt ID)
        if (testAttemptId) {
            await testEndpoint(
                'Exam - Get Result',
                'GET',
                `/exams/${testAttemptId}/result`
            );

            // Test Get Attempt Detail
            await testEndpoint(
                'Exam - Get Attempt Detail',
                'GET',
                `/exams/history/${testAttemptId}`
            );

            // Test Submit Exam
            await testEndpoint(
                'Exam - Submit Exam',
                'POST',
                `/exams/${testAttemptId}/submit`,
                {
                    answers: [
                        {
                            questionId: testQuestionId || '1',
                            selectedOptionIndex: 0,
                        },
                    ],
                    totalTimeTakenSeconds: 300,
                }
            );
        }
    }

    // ============================================================
    // 4. USER ENDPOINTS
    // ============================================================
    console.log('\n👤 Testing User Endpoints...');

    // Test Get Profile (requires auth token)
    if (testAuthToken) {
        await testEndpoint('User - Get Profile', 'GET', '/users/profile');

        // Test Update Profile
        await testEndpoint('User - Update Profile', 'PATCH', '/users/profile', {
            firstName: 'Updated',
            lastName: 'User',
            phone: '+1234567890',
            bio: 'Test bio',
        });

        // Test Get User Statistics
        await testEndpoint('User - Get Statistics', 'GET', '/users/statistics');
    }

    // ============================================================
    // 5. SUBSCRIPTION ENDPOINTS
    // ============================================================
    console.log('\n💳 Testing Subscription Endpoints...');

    // Test Get Subscription Plans
    await testEndpoint(
        'Subscription - Get Plans',
        'GET',
        '/subscriptions/plans'
    );

    // Test Get My Subscription (requires auth token)
    if (testAuthToken) {
        await testEndpoint(
            'Subscription - Get My Subscription',
            'GET',
            '/subscriptions/my'
        );

        // Test Get Subscription History
        await testEndpoint(
            'Subscription - Get History',
            'GET',
            '/subscriptions/history?page=1'
        );
    }

    // ============================================================
    // 6. LEADERBOARD ENDPOINTS
    // ============================================================
    console.log('\n🏆 Testing Leaderboard Endpoints...');

    // Test Get Weekly Leaderboard
    await testEndpoint(
        'Leaderboard - Get Weekly',
        'GET',
        '/leaderboards/weekly?page=1&limit=10'
    );

    // Test Get My Rank (requires auth token)
    if (testAuthToken) {
        await testEndpoint(
            'Leaderboard - Get My Rank',
            'GET',
            '/leaderboards/my-rank'
        );
    }

    // ============================================================
    // 7. NOTIFICATION ENDPOINTS
    // ============================================================
    console.log('\n🔔 Testing Notification Endpoints...');

    // Test Get Notifications (requires auth token)
    if (testAuthToken) {
        await testEndpoint(
            'Notification - Get Notifications',
            'GET',
            '/notifications?page=1&limit=10'
        );

        // Test Mark All as Read
        await testEndpoint(
            'Notification - Mark All as Read',
            'PATCH',
            '/notifications/read-all'
        );
    }

    // ============================================================
    // PRINT RESULTS
    // ============================================================
    console.log('\n' + '═'.repeat(80));
    console.log('📊 TEST RESULTS');
    console.log('═'.repeat(80));

    results.tests.forEach((test) => {
        const icon = test.status === 'PASS' ? '✅' : '❌';
        console.log(`${icon} ${test.message}`);
    });

    console.log('\n' + '─'.repeat(80));
    console.log(
        `📈 Summary: ${results.passed} PASSED, ${results.failed} FAILED (Total: ${results.passed + results.failed})`
    );
    console.log(
        `✅ Success Rate: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(2)}%`
    );
    console.log('═'.repeat(80));

    if (results.failed > 0) {
        console.log('\n⚠️  Some tests failed. Please check the API server and try again.');
        process.exit(1);
    } else {
        console.log('\n✨ All tests passed successfully!');
        process.exit(0);
    }
}

// Run tests
runTests().catch((error) => {
    console.error('❌ Fatal error during testing:', error);
    process.exit(1);
});
