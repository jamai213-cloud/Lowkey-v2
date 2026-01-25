#!/usr/bin/env python3
"""
LowKey Backend API Testing Script
Tests all backend APIs including Auth, Users, and Messaging
"""

import requests
import json
import uuid
import time
from datetime import datetime

# Configuration
BASE_URL = "https://premium-social-19.preview.emergentagent.com/api"
HEADERS = {"Content-Type": "application/json"}

class LowKeyAPITester:
    def __init__(self):
        self.base_url = BASE_URL
        self.headers = HEADERS
        self.test_users = []
        self.test_conversations = []
        self.test_messages = []
        
    def log(self, message, level="INFO"):
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        print(f"[{timestamp}] [{level}] {message}")
        
    def make_request(self, method, endpoint, data=None, expected_status=None):
        """Make HTTP request and return response"""
        url = f"{self.base_url}{endpoint}"
        
        try:
            if method.upper() == "GET":
                response = requests.get(url, headers=self.headers, timeout=30)
            elif method.upper() == "POST":
                response = requests.post(url, headers=self.headers, json=data, timeout=30)
            elif method.upper() == "PUT":
                response = requests.put(url, headers=self.headers, json=data, timeout=30)
            elif method.upper() == "DELETE":
                response = requests.delete(url, headers=self.headers, timeout=30)
            else:
                raise ValueError(f"Unsupported method: {method}")
                
            self.log(f"{method} {endpoint} -> {response.status_code}")
            
            if expected_status and response.status_code != expected_status:
                self.log(f"Expected status {expected_status}, got {response.status_code}", "ERROR")
                self.log(f"Response: {response.text}", "ERROR")
                return None
                
            return response
            
        except requests.exceptions.RequestException as e:
            self.log(f"Request failed: {str(e)}", "ERROR")
            return None
    
    def test_health_check(self):
        """Test basic health check endpoints"""
        self.log("=== Testing Health Check Endpoints ===")
        
        root_success = False
        health_success = False
        
        # Test root endpoint
        response = self.make_request("GET", "/", expected_status=200)
        if response:
            data = response.json()
            if "message" in data:
                self.log("✅ Root endpoint working")
                root_success = True
            else:
                self.log("❌ Root endpoint response invalid", "ERROR")
        else:
            self.log("❌ Root endpoint failed", "ERROR")
            
        # Test health endpoint
        response = self.make_request("GET", "/health", expected_status=200)
        if response:
            data = response.json()
            if data.get("status") == "healthy":
                self.log("✅ Health endpoint working")
                health_success = True
            else:
                self.log("❌ Health endpoint response invalid", "ERROR")
        else:
            self.log("❌ Health endpoint failed", "ERROR")
            
        return root_success and health_success
    
    def test_auth_register(self):
        """Test user registration"""
        self.log("=== Testing Auth Registration ===")
        
        # Generate unique test data
        unique_id = str(uuid.uuid4())[:8]
        test_user = {
            "email": f"testuser_{unique_id}@example.com",
            "password": "securepassword123",
            "displayName": f"TestUser_{unique_id}"
        }
        
        response = self.make_request("POST", "/auth/register", test_user, expected_status=200)
        if response:
            data = response.json()
            if "user" in data and "token" in data:
                self.log("✅ User registration successful")
                self.test_users.append({
                    "user_data": data["user"],
                    "token": data["token"],
                    "credentials": test_user
                })
                return True
            else:
                self.log("❌ Registration response missing user or token", "ERROR")
        else:
            self.log("❌ User registration failed", "ERROR")
        return False
    
    def test_auth_login_email(self):
        """Test login with email"""
        self.log("=== Testing Auth Login with Email ===")
        
        if not self.test_users:
            self.log("❌ No test users available for login test", "ERROR")
            return False
            
        user = self.test_users[0]
        login_data = {
            "identifier": user["credentials"]["email"],
            "password": user["credentials"]["password"]
        }
        
        response = self.make_request("POST", "/auth/login", login_data, expected_status=200)
        if response:
            data = response.json()
            if "user" in data and "token" in data:
                self.log("✅ Login with email successful")
                return True
            else:
                self.log("❌ Login response missing user or token", "ERROR")
        else:
            self.log("❌ Login with email failed", "ERROR")
        return False
    
    def test_auth_login_displayname(self):
        """Test login with displayName"""
        self.log("=== Testing Auth Login with DisplayName ===")
        
        if not self.test_users:
            self.log("❌ No test users available for login test", "ERROR")
            return False
            
        user = self.test_users[0]
        login_data = {
            "identifier": user["credentials"]["displayName"],
            "password": user["credentials"]["password"]
        }
        
        response = self.make_request("POST", "/auth/login", login_data, expected_status=200)
        if response:
            data = response.json()
            if "user" in data and "token" in data:
                self.log("✅ Login with displayName successful")
                return True
            else:
                self.log("❌ Login response missing user or token", "ERROR")
        else:
            self.log("❌ Login with displayName failed", "ERROR")
        return False
    
    def test_users_get_all(self):
        """Test getting all users"""
        self.log("=== Testing Get All Users ===")
        
        response = self.make_request("GET", "/users", expected_status=200)
        if response:
            data = response.json()
            if isinstance(data, list):
                self.log(f"✅ Get all users successful - found {len(data)} users")
                return True
            else:
                self.log("❌ Get all users response is not a list", "ERROR")
        else:
            self.log("❌ Get all users failed", "ERROR")
        return False
    
    def test_users_get_specific(self):
        """Test getting a specific user"""
        self.log("=== Testing Get Specific User ===")
        
        if not self.test_users:
            self.log("❌ No test users available for get user test", "ERROR")
            return False
            
        user_id = self.test_users[0]["user_data"]["id"]
        response = self.make_request("GET", f"/users/{user_id}", expected_status=200)
        if response:
            data = response.json()
            if data.get("id") == user_id:
                self.log("✅ Get specific user successful")
                return True
            else:
                self.log("❌ Get specific user returned wrong user", "ERROR")
        else:
            self.log("❌ Get specific user failed", "ERROR")
        return False
    
    def test_users_verify_toggle(self):
        """Test toggling user verification status"""
        self.log("=== Testing User Verification Toggle ===")
        
        if not self.test_users:
            self.log("❌ No test users available for verification test", "ERROR")
            return False
            
        user_id = self.test_users[0]["user_data"]["id"]
        
        # Toggle to verified
        verify_data = {"verified": True}
        response = self.make_request("PUT", f"/users/{user_id}/verify", verify_data, expected_status=200)
        if response:
            data = response.json()
            if data.get("verified") == True:
                self.log("✅ User verification toggle to true successful")
                
                # Toggle back to unverified
                verify_data = {"verified": False}
                response2 = self.make_request("PUT", f"/users/{user_id}/verify", verify_data, expected_status=200)
                if response2:
                    data2 = response2.json()
                    if data2.get("verified") == False:
                        self.log("✅ User verification toggle to false successful")
                        return True
                    else:
                        self.log("❌ User verification toggle to false failed", "ERROR")
                else:
                    self.log("❌ User verification toggle to false request failed", "ERROR")
            else:
                self.log("❌ User verification toggle to true failed", "ERROR")
        else:
            self.log("❌ User verification toggle request failed", "ERROR")
        return False
    
    def test_conversations_create(self):
        """Test creating a conversation"""
        self.log("=== Testing Create Conversation ===")
        
        if len(self.test_users) < 2:
            # Create a second user for conversation testing
            unique_id = str(uuid.uuid4())[:8]
            test_user2 = {
                "email": f"testuser2_{unique_id}@example.com",
                "password": "securepassword123",
                "displayName": f"TestUser2_{unique_id}"
            }
            
            response = self.make_request("POST", "/auth/register", test_user2, expected_status=200)
            if response:
                data = response.json()
                self.test_users.append({
                    "user_data": data["user"],
                    "token": data["token"],
                    "credentials": test_user2
                })
                self.log("✅ Created second user for conversation testing")
            else:
                self.log("❌ Failed to create second user for conversation testing", "ERROR")
                return False
        
        # Create conversation between two users
        conversation_data = {
            "participants": [
                self.test_users[0]["user_data"]["id"],
                self.test_users[1]["user_data"]["id"]
            ]
        }
        
        response = self.make_request("POST", "/conversations", conversation_data, expected_status=200)
        if response:
            data = response.json()
            if "id" in data and "participants" in data:
                self.log("✅ Create conversation successful")
                self.test_conversations.append(data)
                return True
            else:
                self.log("❌ Create conversation response missing required fields", "ERROR")
        else:
            self.log("❌ Create conversation failed", "ERROR")
        return False
    
    def test_conversations_get_for_user(self):
        """Test getting conversations for a user"""
        self.log("=== Testing Get Conversations for User ===")
        
        if not self.test_users or not self.test_conversations:
            self.log("❌ No test users or conversations available", "ERROR")
            return False
            
        user_id = self.test_users[0]["user_data"]["id"]
        response = self.make_request("GET", f"/conversations/{user_id}", expected_status=200)
        if response:
            data = response.json()
            if isinstance(data, list) and len(data) > 0:
                self.log(f"✅ Get conversations for user successful - found {len(data)} conversations")
                return True
            else:
                self.log("❌ Get conversations returned empty or invalid response", "ERROR")
        else:
            self.log("❌ Get conversations for user failed", "ERROR")
        return False
    
    def test_messages_send(self):
        """Test sending a message"""
        self.log("=== Testing Send Message ===")
        
        if not self.test_conversations or not self.test_users:
            self.log("❌ No test conversations or users available", "ERROR")
            return False
            
        message_data = {
            "conversationId": self.test_conversations[0]["id"],
            "senderId": self.test_users[0]["user_data"]["id"],
            "content": "Hello! This is a test message from the API testing script."
        }
        
        response = self.make_request("POST", "/messages", message_data, expected_status=200)
        if response:
            data = response.json()
            if "id" in data and data.get("content") == message_data["content"]:
                self.log("✅ Send message successful")
                self.test_messages.append(data)
                return True
            else:
                self.log("❌ Send message response invalid", "ERROR")
        else:
            self.log("❌ Send message failed", "ERROR")
        return False
    
    def test_messages_get_for_conversation(self):
        """Test getting messages for a conversation"""
        self.log("=== Testing Get Messages for Conversation ===")
        
        if not self.test_conversations:
            self.log("❌ No test conversations available", "ERROR")
            return False
            
        conversation_id = self.test_conversations[0]["id"]
        response = self.make_request("GET", f"/messages/{conversation_id}", expected_status=200)
        if response:
            data = response.json()
            if isinstance(data, list):
                self.log(f"✅ Get messages for conversation successful - found {len(data)} messages")
                return True
            else:
                self.log("❌ Get messages returned invalid response", "ERROR")
        else:
            self.log("❌ Get messages for conversation failed", "ERROR")
        return False

    def test_auth_forgot_password(self):
        """Test forgot password functionality"""
        self.log("=== Testing Auth Forgot Password ===")
        
        if not self.test_users:
            self.log("❌ No test users available for forgot password test", "ERROR")
            return False
            
        forgot_data = {
            "email": self.test_users[0]["credentials"]["email"]
        }
        
        response = self.make_request("POST", "/auth/forgot-password", forgot_data, expected_status=200)
        if response:
            data = response.json()
            if "message" in data:
                self.log("✅ Forgot password request successful")
                return True
            else:
                self.log("❌ Forgot password response missing message", "ERROR")
        else:
            self.log("❌ Forgot password request failed", "ERROR")
        return False

    def test_auth_reset_password(self):
        """Test reset password functionality"""
        self.log("=== Testing Auth Reset Password ===")
        
        if not self.test_users:
            self.log("❌ No test users available for reset password test", "ERROR")
            return False
            
        # Note: This test will fail with invalid token, but we're testing the API structure
        reset_data = {
            "token": "dummy_token_for_testing",
            "email": self.test_users[0]["credentials"]["email"],
            "password": "newpassword123"
        }
        
        response = self.make_request("POST", "/auth/reset-password", reset_data, expected_status=400)
        if response:
            data = response.json()
            if "error" in data and "Invalid or expired reset token" in data["error"]:
                self.log("✅ Reset password API working (correctly rejected invalid token)")
                return True
            else:
                self.log("❌ Reset password response unexpected", "ERROR")
        else:
            self.log("❌ Reset password request failed", "ERROR")
        return False

    def test_notifications_create(self):
        """Test creating a notification"""
        self.log("=== Testing Create Notification ===")
        
        if len(self.test_users) < 2:
            # Create a second user for notification testing
            unique_id = str(uuid.uuid4())[:8]
            test_user2 = {
                "email": f"testuser2_{unique_id}@example.com",
                "password": "securepassword123",
                "displayName": f"TestUser2_{unique_id}"
            }
            
            response = self.make_request("POST", "/auth/register", test_user2, expected_status=200)
            if response:
                data = response.json()
                self.test_users.append({
                    "user_data": data["user"],
                    "token": data["token"],
                    "credentials": test_user2
                })
                self.log("✅ Created second user for notification testing")
            else:
                self.log("❌ Failed to create second user for notification testing", "ERROR")
                return False
            
        notification_data = {
            "userId": self.test_users[1]["user_data"]["id"],
            "type": "test",
            "message": "This is a test notification",
            "fromUserId": self.test_users[0]["user_data"]["id"]
        }
        
        response = self.make_request("POST", "/notifications", notification_data, expected_status=200)
        if response:
            data = response.json()
            if "id" in data and data.get("message") == notification_data["message"]:
                self.log("✅ Create notification successful")
                # Store notification ID for later tests
                if not hasattr(self, 'test_notifications'):
                    self.test_notifications = []
                self.test_notifications.append(data)
                return True
            else:
                self.log("❌ Create notification response invalid", "ERROR")
        else:
            self.log("❌ Create notification failed", "ERROR")
        return False

    def test_notifications_get_for_user(self):
        """Test getting notifications for a user"""
        self.log("=== Testing Get Notifications for User ===")
        
        if len(self.test_users) < 2:
            self.log("❌ Need at least 2 users for notification test", "ERROR")
            return False
            
        user_id = self.test_users[1]["user_data"]["id"]  # User who should have notifications
        response = self.make_request("GET", f"/notifications/{user_id}", expected_status=200)
        if response:
            data = response.json()
            if isinstance(data, list):
                self.log(f"✅ Get notifications for user successful - found {len(data)} notifications")
                return True
            else:
                self.log("❌ Get notifications returned invalid response", "ERROR")
        else:
            self.log("❌ Get notifications for user failed", "ERROR")
        return False

    def test_notifications_mark_read(self):
        """Test marking notification as read"""
        self.log("=== Testing Mark Notification as Read ===")
        
        if not hasattr(self, 'test_notifications') or not self.test_notifications:
            self.log("❌ No test notifications available", "ERROR")
            return False
            
        notification_id = self.test_notifications[0]["id"]
        response = self.make_request("PUT", f"/notifications/{notification_id}/read", {}, expected_status=200)
        if response:
            data = response.json()
            if data.get("success") == True:
                self.log("✅ Mark notification as read successful")
                return True
            else:
                self.log("❌ Mark notification as read response invalid", "ERROR")
        else:
            self.log("❌ Mark notification as read failed", "ERROR")
        return False

    def test_friends_send_request(self):
        """Test sending a friend request"""
        self.log("=== Testing Send Friend Request ===")
        
        if len(self.test_users) < 2:
            self.log("❌ Need at least 2 users for friend request test", "ERROR")
            return False
            
        friend_request_data = {
            "fromUserId": self.test_users[0]["user_data"]["id"],
            "toUserId": self.test_users[1]["user_data"]["id"]
        }
        
        response = self.make_request("POST", "/friends/request", friend_request_data, expected_status=200)
        if response:
            data = response.json()
            if data.get("success") == True:
                self.log("✅ Send friend request successful")
                return True
            else:
                self.log("❌ Send friend request response invalid", "ERROR")
        else:
            self.log("❌ Send friend request failed", "ERROR")
        return False

    def test_friends_accept_request(self):
        """Test accepting a friend request"""
        self.log("=== Testing Accept Friend Request ===")
        
        if len(self.test_users) < 2:
            self.log("❌ Need at least 2 users for friend accept test", "ERROR")
            return False
            
        accept_data = {
            "userId": self.test_users[1]["user_data"]["id"],
            "friendId": self.test_users[0]["user_data"]["id"]
        }
        
        response = self.make_request("POST", "/friends/accept", accept_data, expected_status=200)
        if response:
            data = response.json()
            if data.get("success") == True:
                self.log("✅ Accept friend request successful")
                return True
            else:
                self.log("❌ Accept friend request response invalid", "ERROR")
        else:
            self.log("❌ Accept friend request failed", "ERROR")
        return False

    def test_conversations_create_non_friend(self):
        """Test creating a conversation from non-friend"""
        self.log("=== Testing Create Non-Friend Conversation ===")
        
        if len(self.test_users) < 2:
            self.log("❌ Need at least 2 users for non-friend conversation test", "ERROR")
            return False
        
        # Create a third user for non-friend conversation
        unique_id = str(uuid.uuid4())[:8]
        test_user3 = {
            "email": f"testuser3_{unique_id}@example.com",
            "password": "securepassword123",
            "displayName": f"TestUser3_{unique_id}"
        }
        
        response = self.make_request("POST", "/auth/register", test_user3, expected_status=200)
        if response:
            data = response.json()
            self.test_users.append({
                "user_data": data["user"],
                "token": data["token"],
                "credentials": test_user3
            })
            self.log("✅ Created third user for non-friend conversation testing")
        else:
            self.log("❌ Failed to create third user", "ERROR")
            return False
        
        # Create non-friend conversation
        conversation_data = {
            "participants": [
                self.test_users[0]["user_data"]["id"],
                self.test_users[2]["user_data"]["id"]  # Third user (non-friend)
            ],
            "isFromNonFriend": True
        }
        
        response = self.make_request("POST", "/conversations", conversation_data, expected_status=200)
        if response:
            data = response.json()
            if "id" in data and data.get("isFromNonFriend") == True and data.get("accepted") == False:
                self.log("✅ Create non-friend conversation successful")
                if not hasattr(self, 'test_non_friend_conversations'):
                    self.test_non_friend_conversations = []
                self.test_non_friend_conversations.append(data)
                return True
            else:
                self.log("❌ Create non-friend conversation response invalid", "ERROR")
        else:
            self.log("❌ Create non-friend conversation failed", "ERROR")
        return False

    def test_conversations_accept(self):
        """Test accepting a non-friend conversation"""
        self.log("=== Testing Accept Non-Friend Conversation ===")
        
        if not hasattr(self, 'test_non_friend_conversations') or not self.test_non_friend_conversations:
            self.log("❌ No non-friend conversations available", "ERROR")
            return False
            
        conversation_id = self.test_non_friend_conversations[0]["id"]
        response = self.make_request("PUT", f"/conversations/{conversation_id}/accept", {}, expected_status=200)
        if response:
            data = response.json()
            if data.get("accepted") == True and data.get("isFromNonFriend") == False:
                self.log("✅ Accept non-friend conversation successful")
                return True
            else:
                self.log("❌ Accept non-friend conversation response invalid", "ERROR")
        else:
            self.log("❌ Accept non-friend conversation failed", "ERROR")
        return False

    def test_messages_with_notifications(self):
        """Test that sending messages creates notifications"""
        self.log("=== Testing Messages Create Notifications ===")
        
        if not self.test_conversations or len(self.test_users) < 2:
            self.log("❌ No test conversations or insufficient users available", "ERROR")
            return False
        
        # Get initial notification count for recipient
        recipient_id = self.test_users[1]["user_data"]["id"]
        initial_response = self.make_request("GET", f"/notifications/{recipient_id}", expected_status=200)
        initial_count = 0
        if initial_response:
            initial_notifications = initial_response.json()
            initial_count = len(initial_notifications)
        
        # Send a message
        message_data = {
            "conversationId": self.test_conversations[0]["id"],
            "senderId": self.test_users[0]["user_data"]["id"],
            "content": "This message should create a notification!"
        }
        
        message_response = self.make_request("POST", "/messages", message_data, expected_status=200)
        if not message_response:
            self.log("❌ Failed to send message", "ERROR")
            return False
        
        # Wait a moment for notification to be created
        time.sleep(1)
        
        # Check if notification was created
        final_response = self.make_request("GET", f"/notifications/{recipient_id}", expected_status=200)
        if final_response:
            final_notifications = final_response.json()
            final_count = len(final_notifications)
            
            if final_count > initial_count:
                # Check if the latest notification is about the message
                latest_notification = final_notifications[0]  # Should be sorted by createdAt desc
                if (latest_notification.get("type") == "dm" and 
                    latest_notification.get("fromUserId") == self.test_users[0]["user_data"]["id"]):
                    self.log("✅ Message successfully created notification")
                    return True
                else:
                    self.log("❌ Latest notification is not the expected message notification", "ERROR")
            else:
                self.log("❌ No new notification created after sending message", "ERROR")
        else:
            self.log("❌ Failed to get notifications after sending message", "ERROR")
        
        return False
    
    def run_all_tests(self):
        """Run all backend API tests"""
        self.log("🚀 Starting LowKey Backend API Tests")
        self.log(f"Base URL: {self.base_url}")
        
        test_results = {}
        
        # Health check tests
        test_results["health_check"] = self.test_health_check()
        
        # Auth tests
        test_results["auth_register"] = self.test_auth_register()
        test_results["auth_login_email"] = self.test_auth_login_email()
        test_results["auth_login_displayname"] = self.test_auth_login_displayname()
        test_results["auth_forgot_password"] = self.test_auth_forgot_password()
        test_results["auth_reset_password"] = self.test_auth_reset_password()
        
        # User tests
        test_results["users_get_all"] = self.test_users_get_all()
        test_results["users_get_specific"] = self.test_users_get_specific()
        test_results["users_verify_toggle"] = self.test_users_verify_toggle()
        
        # Notification tests
        test_results["notifications_create"] = self.test_notifications_create()
        test_results["notifications_get_for_user"] = self.test_notifications_get_for_user()
        test_results["notifications_mark_read"] = self.test_notifications_mark_read()
        
        # Friend request tests
        test_results["friends_send_request"] = self.test_friends_send_request()
        test_results["friends_accept_request"] = self.test_friends_accept_request()
        
        # Messaging tests
        test_results["conversations_create"] = self.test_conversations_create()
        test_results["conversations_get_for_user"] = self.test_conversations_get_for_user()
        test_results["conversations_create_non_friend"] = self.test_conversations_create_non_friend()
        test_results["conversations_accept"] = self.test_conversations_accept()
        test_results["messages_send"] = self.test_messages_send()
        test_results["messages_get_for_conversation"] = self.test_messages_get_for_conversation()
        test_results["messages_with_notifications"] = self.test_messages_with_notifications()
        
        # Summary
        self.log("=" * 60)
        self.log("🏁 TEST SUMMARY")
        self.log("=" * 60)
        
        passed = 0
        failed = 0
        
        for test_name, result in test_results.items():
            status = "✅ PASS" if result else "❌ FAIL"
            self.log(f"{test_name}: {status}")
            if result:
                passed += 1
            else:
                failed += 1
        
        self.log("=" * 60)
        self.log(f"Total Tests: {passed + failed}")
        self.log(f"Passed: {passed}")
        self.log(f"Failed: {failed}")
        self.log(f"Success Rate: {(passed / (passed + failed) * 100):.1f}%")
        
        return test_results

if __name__ == "__main__":
    tester = LowKeyAPITester()
    results = tester.run_all_tests()