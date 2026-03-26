"""
Backend API Tests for Lowkey Next.js App
Tests: /api/auth/login, /api/users, /api/lounges
"""
import pytest
import requests

BASE_URL = "http://localhost:8001"

class TestAuthAPI:
    """Authentication endpoint tests"""
    
    def test_login_success(self):
        """Test successful login with valid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "identifier": "kinglowkey@hotmail.com",
            "password": "password123"
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "user" in data, "Response should contain 'user' field"
        assert "token" in data, "Response should contain 'token' field"
        assert data["user"]["email"] == "kinglowkey@hotmail.com"
        assert data["user"]["displayName"] == "King Tense"
        assert "id" in data["user"]
        print(f"✓ Login successful for user: {data['user']['displayName']}")
    
    def test_login_invalid_credentials(self):
        """Test login with invalid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "identifier": "wrong@email.com",
            "password": "wrongpassword"
        })
        # Should return 401 or 400 for invalid credentials
        assert response.status_code in [400, 401, 404], f"Expected 400/401/404, got {response.status_code}"
        print(f"✓ Invalid login correctly rejected with status {response.status_code}")
    
    def test_login_missing_fields(self):
        """Test login with missing fields"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "identifier": "kinglowkey@hotmail.com"
            # missing password
        })
        assert response.status_code in [400, 401, 422], f"Expected 400/401/422, got {response.status_code}"
        print(f"✓ Missing fields correctly rejected with status {response.status_code}")


class TestUsersAPI:
    """Users endpoint tests"""
    
    def test_get_users_list(self):
        """Test fetching all users"""
        response = requests.get(f"{BASE_URL}/api/users")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        assert len(data) > 0, "Should have at least one user"
        
        # Verify user structure
        user = data[0]
        assert "id" in user, "User should have 'id' field"
        assert "displayName" in user, "User should have 'displayName' field"
        print(f"✓ Users API returned {len(data)} users")
    
    def test_users_have_required_fields(self):
        """Test that users have all required fields"""
        response = requests.get(f"{BASE_URL}/api/users")
        assert response.status_code == 200
        
        data = response.json()
        required_fields = ["id", "displayName"]
        
        for user in data[:5]:  # Check first 5 users
            for field in required_fields:
                assert field in user, f"User missing required field: {field}"
        print(f"✓ All users have required fields")


class TestLoungesAPI:
    """Lounges endpoint tests"""
    
    def test_get_lounges_list(self):
        """Test fetching all lounges"""
        response = requests.get(f"{BASE_URL}/api/lounges")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        assert len(data) > 0, "Should have at least one lounge"
        print(f"✓ Lounges API returned {len(data)} lounges")
    
    def test_lounges_have_required_fields(self):
        """Test that lounges have all required fields"""
        response = requests.get(f"{BASE_URL}/api/lounges")
        assert response.status_code == 200
        
        data = response.json()
        required_fields = ["id", "name"]
        
        for lounge in data:
            for field in required_fields:
                assert field in lounge, f"Lounge missing required field: {field}"
        print(f"✓ All lounges have required fields")
    
    def test_lounges_structure(self):
        """Test lounge data structure"""
        response = requests.get(f"{BASE_URL}/api/lounges")
        assert response.status_code == 200
        
        data = response.json()
        lounge = data[0]
        
        # Check expected fields
        assert "name" in lounge
        assert isinstance(lounge["name"], str)
        
        if "description" in lounge:
            assert isinstance(lounge["description"], str)
        
        if "memberCount" in lounge:
            assert isinstance(lounge["memberCount"], int)
        
        print(f"✓ Lounge structure is valid: {lounge['name']}")


class TestAPIHealth:
    """Basic API health checks"""
    
    def test_api_is_accessible(self):
        """Test that the API server is running"""
        response = requests.get(f"{BASE_URL}/")
        assert response.status_code == 200, f"API not accessible: {response.status_code}"
        print("✓ API server is accessible")
    
    def test_api_returns_json(self):
        """Test that API endpoints return JSON"""
        response = requests.get(f"{BASE_URL}/api/users")
        assert response.status_code == 200
        assert "application/json" in response.headers.get("content-type", "")
        print("✓ API returns JSON content type")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
