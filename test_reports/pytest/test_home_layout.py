"""
Test Home Page Layout - Iteration 10
Tests for home screen layout restructuring:
1. Events API returns 3 events
2. Lounges API returns 8 regular lounges + 1 After Dark
3. Login works with test credentials
4. Section order verification
"""

import pytest
import requests
import os

BASE_URL = "http://localhost:3000"

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
        print(f"✓ Login successful for {data['user']['displayName']}")
    
    def test_login_invalid_credentials(self):
        """Test login with invalid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "identifier": "wrong@example.com",
            "password": "wrongpass"
        })
        assert response.status_code == 401
        data = response.json()
        assert "error" in data


class TestEventsAPI:
    """Events endpoint tests"""
    
    def test_get_events_returns_3_events(self):
        """GET /api/events should return 3 events"""
        response = requests.get(f"{BASE_URL}/api/events")
        assert response.status_code == 200
        events = response.json()
        assert len(events) == 3, f"Expected 3 events, got {len(events)}"
        print(f"✓ Found {len(events)} events")
    
    def test_events_have_required_fields(self):
        """Events should have required fields"""
        response = requests.get(f"{BASE_URL}/api/events")
        assert response.status_code == 200
        events = response.json()
        
        required_fields = ["id", "title", "description", "date"]
        for event in events:
            for field in required_fields:
                assert field in event, f"Event missing field: {field}"
    
    def test_events_contain_expected_titles(self):
        """Events should contain the 3 expected events"""
        response = requests.get(f"{BASE_URL}/api/events")
        assert response.status_code == 200
        events = response.json()
        
        titles = [e["title"] for e in events]
        expected_titles = ["Friday Night Live", "Vinyl & Vibes", "After Dark: Unmasked"]
        
        for expected in expected_titles:
            assert expected in titles, f"Missing event: {expected}"
            print(f"✓ Found event: {expected}")


class TestLoungesAPI:
    """Lounges endpoint tests"""
    
    def test_get_regular_lounges_returns_8(self):
        """GET /api/lounges should return 8 regular lounges"""
        response = requests.get(f"{BASE_URL}/api/lounges")
        assert response.status_code == 200
        lounges = response.json()
        assert len(lounges) == 8, f"Expected 8 regular lounges, got {len(lounges)}"
        print(f"✓ Found {len(lounges)} regular lounges")
    
    def test_get_afterdark_lounges_returns_1(self):
        """GET /api/lounges?afterDark=true should return 1 After Dark lounge"""
        response = requests.get(f"{BASE_URL}/api/lounges?afterDark=true")
        assert response.status_code == 200
        lounges = response.json()
        assert len(lounges) == 1, f"Expected 1 After Dark lounge, got {len(lounges)}"
        assert lounges[0]["name"] == "After Dark"
        print(f"✓ Found After Dark lounge with {lounges[0].get('memberCount', 0)} members")
    
    def test_lounges_have_required_fields(self):
        """Lounges should have required fields"""
        response = requests.get(f"{BASE_URL}/api/lounges")
        assert response.status_code == 200
        lounges = response.json()
        
        required_fields = ["id", "name", "description"]
        for lounge in lounges:
            for field in required_fields:
                assert field in lounge, f"Lounge missing field: {field}"
    
    def test_kink_lounge_exists(self):
        """Kink Lounge should exist in regular lounges"""
        response = requests.get(f"{BASE_URL}/api/lounges")
        assert response.status_code == 200
        lounges = response.json()
        
        kink_lounge = next((l for l in lounges if "kink" in l["name"].lower()), None)
        assert kink_lounge is not None, "Kink Lounge not found"
        print(f"✓ Found Kink Lounge with {kink_lounge.get('memberCount', 0)} members")
    
    def test_main_lounge_exists(self):
        """Main Lounge should exist"""
        response = requests.get(f"{BASE_URL}/api/lounges")
        assert response.status_code == 200
        lounges = response.json()
        
        main_lounge = next((l for l in lounges if "main" in l["name"].lower()), None)
        assert main_lounge is not None, "Main Lounge not found"
        print(f"✓ Found Main Lounge")
    
    def test_vip_room_exists(self):
        """VIP Room should exist"""
        response = requests.get(f"{BASE_URL}/api/lounges")
        assert response.status_code == 200
        lounges = response.json()
        
        vip_room = next((l for l in lounges if "vip" in l["name"].lower()), None)
        assert vip_room is not None, "VIP Room not found"
        print(f"✓ Found VIP Room")


class TestUsersAPI:
    """Users endpoint tests"""
    
    def test_get_users(self):
        """GET /api/users should return users"""
        response = requests.get(f"{BASE_URL}/api/users")
        assert response.status_code == 200
        users = response.json()
        assert len(users) > 0, "No users found"
        print(f"✓ Found {len(users)} users")
    
    def test_users_have_required_fields(self):
        """Users should have required fields"""
        response = requests.get(f"{BASE_URL}/api/users")
        assert response.status_code == 200
        users = response.json()
        
        required_fields = ["id", "displayName"]
        for user in users[:5]:  # Check first 5 users
            for field in required_fields:
                assert field in user, f"User missing field: {field}"


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
