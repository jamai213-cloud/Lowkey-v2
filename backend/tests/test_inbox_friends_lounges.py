"""
Test suite for LowKey API - Inbox, Friends, and Lounges functionality
Tests: Auto-seeding lounges, friend requests, inbox/messaging
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'http://localhost:3000')

# Test credentials
TEST_USER_EMAIL = "kinglowkey@hotmail.com"
TEST_USER_PASSWORD = "password123"
TEST_USER_ID = "9a184971-c123-4be7-a178-fc8a8716fac6"
FRIEND_USER_ID = "b7a2eaa5-0ac8-4866-a4ea-e1c216c5486b"


class TestAuthentication:
    """Authentication endpoint tests"""
    
    def test_login_success(self):
        """Test login with valid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "identifier": TEST_USER_EMAIL,
            "password": TEST_USER_PASSWORD
        })
        assert response.status_code == 200
        data = response.json()
        assert "user" in data
        assert "token" in data
        assert data["user"]["email"] == TEST_USER_EMAIL
        assert data["user"]["id"] == TEST_USER_ID
    
    def test_login_invalid_credentials(self):
        """Test login with invalid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "identifier": "wrong@example.com",
            "password": "wrongpass"
        })
        assert response.status_code == 401


class TestLounges:
    """Lounge API tests - including auto-seeding"""
    
    def test_get_lounges_returns_required_lounges(self):
        """GET /api/lounges returns lounges INCLUDING auto-seeded ones"""
        response = requests.get(f"{BASE_URL}/api/lounges")
        assert response.status_code == 200
        lounges = response.json()
        assert isinstance(lounges, list)
        assert len(lounges) >= 4, "Should have at least 4 lounges"
        
        # Check for required lounges
        lounge_names = [l.get("name", "").lower() for l in lounges]
        assert any("lowkey" in name for name in lounge_names), "LowKey Lounge should exist"
        assert any("kink" in name for name in lounge_names), "Kink Lounge should exist"
        assert any("vip" in name for name in lounge_names), "VIP Lounge should exist"
    
    def test_get_afterdark_lounge(self):
        """GET /api/lounges?afterDark=true returns After Dark lounge"""
        response = requests.get(f"{BASE_URL}/api/lounges?afterDark=true")
        assert response.status_code == 200
        lounges = response.json()
        assert isinstance(lounges, list)
        assert len(lounges) >= 1, "Should have at least 1 After Dark lounge"
        
        # Check After Dark lounge exists
        after_dark = [l for l in lounges if l.get("isAfterDark") == True]
        assert len(after_dark) >= 1, "After Dark lounge should exist"
        assert any("after dark" in l.get("name", "").lower() for l in after_dark)
    
    def test_all_four_required_lounges_exist(self):
        """Auto-seeding: all 4 required lounges exist"""
        # Get regular lounges
        regular_res = requests.get(f"{BASE_URL}/api/lounges")
        regular = regular_res.json() if regular_res.ok else []
        
        # Get After Dark lounges
        ad_res = requests.get(f"{BASE_URL}/api/lounges?afterDark=true")
        after_dark = ad_res.json() if ad_res.ok else []
        
        all_lounges = regular + after_dark
        lounge_names = [l.get("name", "").lower() for l in all_lounges]
        
        # Check all 4 required lounges
        assert any("lowkey" in name for name in lounge_names), "LowKey Lounge missing"
        assert any("after dark" in name for name in lounge_names), "After Dark missing"
        assert any("kink" in name for name in lounge_names), "Kink Lounge missing"
        assert any("vip" in name for name in lounge_names), "VIP Lounge missing"


class TestFriendRequests:
    """Friend request functionality tests"""
    
    def test_get_friend_requests(self):
        """GET /api/friends/requests/{userId} returns pending requests"""
        response = requests.get(f"{BASE_URL}/api/friends/requests/{TEST_USER_ID}")
        assert response.status_code == 200
        data = response.json()
        assert "pending" in data
        assert "sent" in data
        assert isinstance(data["pending"], list)
        assert isinstance(data["sent"], list)
    
    def test_send_friend_request(self):
        """POST /api/friends/request creates a friend request"""
        # First register a new test user
        import uuid
        test_email = f"test_{uuid.uuid4().hex[:8]}@test.com"
        reg_res = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": test_email,
            "password": "password123",
            "displayName": f"TestUser{uuid.uuid4().hex[:4]}"
        })
        
        if reg_res.status_code == 200:
            new_user = reg_res.json()["user"]
            new_user_id = new_user["id"]
            
            # Send friend request from new user to test user
            response = requests.post(f"{BASE_URL}/api/friends/request", json={
                "userId": new_user_id,
                "friendId": TEST_USER_ID
            })
            
            # Should succeed or say request already exists
            assert response.status_code in [200, 400]
            data = response.json()
            if response.status_code == 200:
                assert data.get("success") == True
            else:
                # Request already exists is acceptable
                assert "already" in data.get("error", "").lower()
    
    def test_accept_friend_request(self):
        """POST /api/friends/accept accepts a friend request"""
        # This test verifies the endpoint works (may return 404 if no pending request)
        response = requests.post(f"{BASE_URL}/api/friends/accept", json={
            "userId": TEST_USER_ID,
            "friendId": "nonexistent-user-id"
        })
        # Should return 404 for non-existent request or 200 for success
        assert response.status_code in [200, 404]


class TestInbox:
    """Inbox/messaging functionality tests"""
    
    def test_get_inbox_conversations(self):
        """GET /api/inbox?userId={userId} returns conversations list"""
        response = requests.get(f"{BASE_URL}/api/inbox?userId={TEST_USER_ID}")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        
        # If there are conversations, check structure
        if len(data) > 0:
            convo = data[0]
            assert "id" in convo
            assert "displayName" in convo or "otherUserId" in convo
    
    def test_create_conversation(self):
        """POST /api/conversations creates a new conversation"""
        response = requests.post(f"{BASE_URL}/api/conversations", json={
            "participants": [TEST_USER_ID, FRIEND_USER_ID]
        })
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        assert "participants" in data
        assert TEST_USER_ID in data["participants"]
        assert FRIEND_USER_ID in data["participants"]
    
    def test_send_message(self):
        """POST /api/inbox/{convoId}/messages sends a message"""
        # First get or create a conversation
        convo_res = requests.post(f"{BASE_URL}/api/conversations", json={
            "participants": [TEST_USER_ID, FRIEND_USER_ID]
        })
        assert convo_res.status_code == 200
        convo_id = convo_res.json()["id"]
        
        # Send a message
        response = requests.post(f"{BASE_URL}/api/inbox/{convo_id}/messages", json={
            "userId": TEST_USER_ID,
            "content": "Test message from pytest"
        })
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        assert data["content"] == "Test message from pytest"
        assert data["userId"] == TEST_USER_ID
    
    def test_get_messages(self):
        """GET /api/inbox/{convoId}/messages returns messages"""
        # First get or create a conversation
        convo_res = requests.post(f"{BASE_URL}/api/conversations", json={
            "participants": [TEST_USER_ID, FRIEND_USER_ID]
        })
        assert convo_res.status_code == 200
        convo_id = convo_res.json()["id"]
        
        # Get messages
        response = requests.get(f"{BASE_URL}/api/inbox/{convo_id}/messages?userId={TEST_USER_ID}")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        
        # If there are messages, check structure
        if len(data) > 0:
            msg = data[0]
            assert "id" in msg
            assert "content" in msg
            assert "userId" in msg


class TestEvents:
    """Events API tests"""
    
    def test_get_events(self):
        """GET /api/events returns events list"""
        response = requests.get(f"{BASE_URL}/api/events")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)


class TestUsers:
    """Users API tests"""
    
    def test_get_users(self):
        """GET /api/users returns user list"""
        response = requests.get(f"{BASE_URL}/api/users")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
    
    def test_get_user_profile(self):
        """GET /api/profile/{userId} returns user profile"""
        response = requests.get(f"{BASE_URL}/api/profile/{TEST_USER_ID}")
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        assert "displayName" in data


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
