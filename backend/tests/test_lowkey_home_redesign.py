"""
Lowkey Home Page Redesign API Tests
Tests for the 7-section home page redesign with connections as main focus
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'http://localhost:3000')

class TestAuthAPI:
    """Authentication endpoint tests"""
    
    def test_login_success(self):
        """Test login with valid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "identifier": "kinglowkey@hotmail.com",
            "password": "password123"
        })
        assert response.status_code == 200
        data = response.json()
        assert "user" in data
        assert "token" in data
        assert data["user"]["email"] == "kinglowkey@hotmail.com"
        print(f"Login successful for user: {data['user']['displayName']}")
    
    def test_login_invalid_credentials(self):
        """Test login with invalid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "identifier": "wrong@example.com",
            "password": "wrongpass"
        })
        assert response.status_code == 401
        data = response.json()
        assert "error" in data
    
    def test_login_missing_credentials(self):
        """Test login with missing credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={})
        assert response.status_code == 400
        data = response.json()
        assert "error" in data


class TestUsersAPI:
    """Users endpoint tests for Discover section"""
    
    def test_get_users(self):
        """Test GET /api/users returns list of users for Discover section"""
        response = requests.get(f"{BASE_URL}/api/users")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        # Check user structure
        user = data[0]
        assert "id" in user
        assert "displayName" in user
        print(f"Found {len(data)} users for Discover section")
    
    def test_get_user_by_id(self):
        """Test GET /api/users/{id} for profile view"""
        # First get a user ID
        users_response = requests.get(f"{BASE_URL}/api/users")
        users = users_response.json()
        if len(users) > 0:
            user_id = users[0]["id"]
            response = requests.get(f"{BASE_URL}/api/users/{user_id}")
            assert response.status_code == 200
            data = response.json()
            assert data["id"] == user_id


class TestLoungesAPI:
    """Lounges endpoint tests for Lounges section"""
    
    def test_get_lounges(self):
        """Test GET /api/lounges returns list of lounges"""
        response = requests.get(f"{BASE_URL}/api/lounges")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        print(f"Found {len(data)} lounges")
        
        # Check for expected lounges
        lounge_names = [l["name"] for l in data]
        expected_lounges = ["Night Owls", "Chill Vibes Only", "Music Lovers"]
        for expected in expected_lounges:
            assert expected in lounge_names, f"Expected lounge '{expected}' not found"
            print(f"  - Found lounge: {expected}")
    
    def test_lounge_structure(self):
        """Test lounge data structure"""
        response = requests.get(f"{BASE_URL}/api/lounges")
        data = response.json()
        lounge = data[0]
        assert "id" in lounge
        assert "name" in lounge
        assert "description" in lounge


class TestStoriesAPI:
    """Stories endpoint tests for Active Now section"""
    
    def test_get_stories(self):
        """Test GET /api/stories returns stories for Active Now section"""
        # Login first to get user ID
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "identifier": "kinglowkey@hotmail.com",
            "password": "password123"
        })
        user_id = login_response.json()["user"]["id"]
        
        response = requests.get(f"{BASE_URL}/api/stories?viewerId={user_id}")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"Found {len(data)} story groups")


class TestFriendRequestsAPI:
    """Friend requests endpoint tests for Connection Requests section"""
    
    def test_get_friend_requests(self):
        """Test GET /api/friends/requests/{userId} for connection requests"""
        # Login first to get user ID
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "identifier": "kinglowkey@hotmail.com",
            "password": "password123"
        })
        user_id = login_response.json()["user"]["id"]
        
        response = requests.get(f"{BASE_URL}/api/friends/requests/{user_id}")
        assert response.status_code == 200
        data = response.json()
        assert "pending" in data
        assert "sent" in data
        print(f"Found {len(data['pending'])} pending friend requests")


class TestNotificationsAPI:
    """Notifications endpoint tests for header bell"""
    
    def test_get_notifications(self):
        """Test GET /api/notifications/{userId} for notification bell"""
        # Login first to get user ID
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "identifier": "kinglowkey@hotmail.com",
            "password": "password123"
        })
        user_id = login_response.json()["user"]["id"]
        
        response = requests.get(f"{BASE_URL}/api/notifications/{user_id}")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"Found {len(data)} notifications")


class TestNoticesAPI:
    """Notices endpoint tests"""
    
    def test_get_unread_notices(self):
        """Test GET /api/notices/unread/{userId}"""
        # Login first to get user ID
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "identifier": "kinglowkey@hotmail.com",
            "password": "password123"
        })
        user_id = login_response.json()["user"]["id"]
        
        response = requests.get(f"{BASE_URL}/api/notices/unread/{user_id}")
        assert response.status_code == 200


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
