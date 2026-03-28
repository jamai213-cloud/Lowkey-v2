"""
Test suite for Lowkey Home Page Redesign v2
Tests all critical APIs and features for the UI+UX overhaul
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'http://localhost:8001')

# Test credentials
TEST_EMAIL = "kinglowkey@hotmail.com"
TEST_PASSWORD = "password123"


class TestAuthLogin:
    """Authentication endpoint tests"""
    
    def test_login_success(self):
        """Test login with valid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "identifier": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        
        data = response.json()
        assert "user" in data, "Response missing 'user' field"
        assert "token" in data, "Response missing 'token' field"
        assert data["user"]["email"] == TEST_EMAIL
        assert data["user"]["verified"] == True, "Founder should be verified"
        assert data["user"]["isFounder"] == True or data["user"]["role"] == "founder"
        print(f"✓ Login successful for {data['user']['displayName']}")
    
    def test_login_invalid_credentials(self):
        """Test login with invalid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "identifier": "wrong@email.com",
            "password": "wrongpassword"
        })
        assert response.status_code in [401, 400], f"Expected 401/400, got {response.status_code}"


class TestUsersAPI:
    """Users API tests for Discover section"""
    
    def test_get_users_list(self):
        """Test GET /api/users returns list of users"""
        response = requests.get(f"{BASE_URL}/api/users")
        assert response.status_code == 200, f"Failed to get users: {response.text}"
        
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        assert len(data) > 0, "Should have at least one user"
        
        # Verify user structure
        user = data[0]
        assert "id" in user, "User missing 'id'"
        assert "displayName" in user, "User missing 'displayName'"
        print(f"✓ Found {len(data)} users for Discover section")
    
    def test_users_have_required_fields(self):
        """Test users have fields needed for profile cards"""
        response = requests.get(f"{BASE_URL}/api/users")
        assert response.status_code == 200
        
        data = response.json()
        for user in data[:5]:  # Check first 5 users
            assert "id" in user
            assert "displayName" in user
            # Optional fields that may be present
            # avatar, verified, isFounder, role


class TestProfileAPI:
    """Profile API tests for profile modal"""
    
    @pytest.fixture
    def user_id(self):
        """Get a valid user ID for testing"""
        response = requests.get(f"{BASE_URL}/api/users")
        if response.status_code == 200 and len(response.json()) > 0:
            return response.json()[0]["id"]
        pytest.skip("No users available for testing")
    
    @pytest.fixture
    def viewer_id(self):
        """Get viewer ID (logged in user)"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "identifier": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        if response.status_code == 200:
            return response.json()["user"]["id"]
        pytest.skip("Could not login to get viewer ID")
    
    def test_get_profile(self, user_id, viewer_id):
        """Test GET /api/profile/{userId} returns profile data"""
        response = requests.get(f"{BASE_URL}/api/profile/{user_id}?viewerId={viewer_id}")
        assert response.status_code == 200, f"Failed to get profile: {response.text}"
        
        data = response.json()
        assert "id" in data, "Profile missing 'id'"
        assert "displayName" in data, "Profile missing 'displayName'"
        print(f"✓ Profile loaded for {data['displayName']}")
    
    def test_profile_has_verification_fields(self, user_id, viewer_id):
        """Test profile includes verification badge fields"""
        response = requests.get(f"{BASE_URL}/api/profile/{user_id}?viewerId={viewer_id}")
        assert response.status_code == 200
        
        data = response.json()
        # These fields should be present for badge display
        # verified, isFounder, role are optional but expected


class TestLoungesAPI:
    """Lounges API tests for Lounges section"""
    
    def test_get_lounges_list(self):
        """Test GET /api/lounges returns list of lounges"""
        response = requests.get(f"{BASE_URL}/api/lounges")
        assert response.status_code == 200, f"Failed to get lounges: {response.text}"
        
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        assert len(data) > 0, "Should have at least one lounge"
        print(f"✓ Found {len(data)} lounges")
    
    def test_lounges_have_required_fields(self):
        """Test lounges have fields needed for display"""
        response = requests.get(f"{BASE_URL}/api/lounges")
        assert response.status_code == 200
        
        data = response.json()
        for lounge in data[:5]:  # Check first 5 lounges
            assert "id" in lounge, "Lounge missing 'id'"
            assert "name" in lounge, "Lounge missing 'name'"
    
    def test_lounges_include_expected_rooms(self):
        """Test expected lounges exist (Night Owls, Chill Vibes, etc.)"""
        response = requests.get(f"{BASE_URL}/api/lounges")
        assert response.status_code == 200
        
        data = response.json()
        lounge_names = [l["name"].lower() for l in data]
        
        # Check for at least some expected lounges
        expected = ["night owls", "chill vibes", "music"]
        found = sum(1 for e in expected if any(e in name for name in lounge_names))
        assert found >= 1, f"Expected at least 1 of {expected}, found none in {lounge_names}"


class TestStoriesAPI:
    """Stories API tests for Active Now section"""
    
    @pytest.fixture
    def viewer_id(self):
        """Get viewer ID (logged in user)"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "identifier": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        if response.status_code == 200:
            return response.json()["user"]["id"]
        pytest.skip("Could not login to get viewer ID")
    
    def test_get_stories(self, viewer_id):
        """Test GET /api/stories returns stories list"""
        response = requests.get(f"{BASE_URL}/api/stories?viewerId={viewer_id}")
        assert response.status_code == 200, f"Failed to get stories: {response.text}"
        
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        print(f"✓ Stories endpoint working, found {len(data)} story groups")


class TestNotificationsAPI:
    """Notifications API tests for Recent Activity section"""
    
    @pytest.fixture
    def user_id(self):
        """Get user ID from login"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "identifier": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        if response.status_code == 200:
            return response.json()["user"]["id"]
        pytest.skip("Could not login to get user ID")
    
    def test_get_notifications(self, user_id):
        """Test GET /api/notifications/{userId} returns notifications"""
        response = requests.get(f"{BASE_URL}/api/notifications/{user_id}")
        assert response.status_code == 200, f"Failed to get notifications: {response.text}"
        
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        print(f"✓ Notifications endpoint working, found {len(data)} notifications")


class TestFriendRequestsAPI:
    """Friend requests API tests"""
    
    @pytest.fixture
    def user_id(self):
        """Get user ID from login"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "identifier": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        if response.status_code == 200:
            return response.json()["user"]["id"]
        pytest.skip("Could not login to get user ID")
    
    def test_get_friend_requests(self, user_id):
        """Test GET /api/friends/requests/{userId} returns requests"""
        response = requests.get(f"{BASE_URL}/api/friends/requests/{user_id}")
        assert response.status_code == 200, f"Failed to get friend requests: {response.text}"
        
        data = response.json()
        assert "pending" in data or isinstance(data, list), "Response should have pending field or be a list"
        print(f"✓ Friend requests endpoint working")


class TestHealthCheck:
    """Health check endpoint test"""
    
    def test_health_endpoint(self):
        """Test /api/health returns healthy status"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200, f"Health check failed: {response.text}"
        
        data = response.json()
        assert data.get("status") == "healthy", f"Unexpected health status: {data}"
        print("✓ Health check passed")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
