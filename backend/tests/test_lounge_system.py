"""
Test suite for LowKey Lounge System
Tests: Login, Lounges API (regular + After Dark), Events API
"""
import pytest
import requests
import os

BASE_URL = "http://localhost:3000"

# Test credentials
TEST_EMAIL = "kinglowkey@hotmail.com"
TEST_PASSWORD = "password123"

class TestAuthentication:
    """Test login functionality"""
    
    def test_login_success(self):
        """Login with valid credentials returns user and token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "identifier": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        assert "user" in data, "Response missing 'user' field"
        assert "token" in data, "Response missing 'token' field"
        assert data["user"]["email"] == TEST_EMAIL
        print(f"✓ Login successful for {TEST_EMAIL}")
    
    def test_login_invalid_credentials(self):
        """Login with invalid credentials returns 401"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "identifier": "wrong@email.com",
            "password": "wrongpassword"
        })
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ Invalid credentials correctly rejected")


class TestLoungesAPI:
    """Test lounges endpoints - regular and After Dark"""
    
    def test_get_regular_lounges(self):
        """GET /api/lounges returns regular lounges including LowKey, VIP, Kink"""
        response = requests.get(f"{BASE_URL}/api/lounges")
        assert response.status_code == 200, f"Failed to get lounges: {response.text}"
        lounges = response.json()
        assert isinstance(lounges, list), "Response should be a list"
        assert len(lounges) >= 4, f"Expected at least 4 lounges, got {len(lounges)}"
        
        # Check for required lounges
        lounge_names = [l.get("name", "").lower() for l in lounges]
        print(f"Found lounges: {[l.get('name') for l in lounges]}")
        
        # Verify LowKey Lounge exists
        assert any("lowkey" in name for name in lounge_names), "LowKey Lounge not found"
        print("✓ LowKey Lounge found")
        
        # Verify VIP Lounge exists
        assert any("vip" in name for name in lounge_names), "VIP Lounge not found"
        print("✓ VIP Lounge found")
        
        # Verify Kink Lounge exists
        assert any("kink" in name for name in lounge_names), "Kink Lounge not found"
        print("✓ Kink Lounge found")
    
    def test_get_after_dark_lounge(self):
        """GET /api/lounges?afterDark=true returns After Dark lounge"""
        response = requests.get(f"{BASE_URL}/api/lounges?afterDark=true")
        assert response.status_code == 200, f"Failed to get After Dark lounges: {response.text}"
        lounges = response.json()
        assert isinstance(lounges, list), "Response should be a list"
        assert len(lounges) >= 1, "Expected at least 1 After Dark lounge"
        
        # Verify After Dark lounge exists
        after_dark = next((l for l in lounges if "after dark" in l.get("name", "").lower()), None)
        assert after_dark is not None, "After Dark lounge not found"
        assert after_dark.get("isAfterDark") == True, "After Dark lounge should have isAfterDark=true"
        print(f"✓ After Dark lounge found: {after_dark.get('name')}")
    
    def test_lounge_structure(self):
        """Verify lounge objects have required fields"""
        response = requests.get(f"{BASE_URL}/api/lounges")
        lounges = response.json()
        
        for lounge in lounges[:4]:  # Check first 4 lounges
            assert "id" in lounge, f"Lounge missing 'id': {lounge}"
            assert "name" in lounge, f"Lounge missing 'name': {lounge}"
            # memberCount or members should exist
            has_count = "memberCount" in lounge or "members" in lounge
            assert has_count, f"Lounge missing member count: {lounge}"
        print("✓ All lounges have required structure")
    
    def test_lowkey_lounge_description(self):
        """LowKey Lounge has correct description"""
        response = requests.get(f"{BASE_URL}/api/lounges")
        lounges = response.json()
        lowkey = next((l for l in lounges if "lowkey" in l.get("name", "").lower()), None)
        assert lowkey is not None, "LowKey Lounge not found"
        desc = lowkey.get("description", "").lower()
        assert "everyone starts" in desc or "real people" in desc, f"LowKey description incorrect: {lowkey.get('description')}"
        print(f"✓ LowKey Lounge description: {lowkey.get('description')}")
    
    def test_vip_lounge_description(self):
        """VIP Lounge has correct description"""
        response = requests.get(f"{BASE_URL}/api/lounges")
        lounges = response.json()
        vip = next((l for l in lounges if "vip" in l.get("name", "").lower()), None)
        assert vip is not None, "VIP Lounge not found"
        desc = vip.get("description", "").lower()
        assert "private" in desc or "elevated" in desc, f"VIP description incorrect: {vip.get('description')}"
        print(f"✓ VIP Lounge description: {vip.get('description')}")
    
    def test_kink_lounge_description(self):
        """Kink Lounge has correct description"""
        response = requests.get(f"{BASE_URL}/api/lounges")
        lounges = response.json()
        kink = next((l for l in lounges if "kink" in l.get("name", "").lower()), None)
        assert kink is not None, "Kink Lounge not found"
        desc = kink.get("description", "").lower()
        assert "boundaries" in desc or "find your people" in desc, f"Kink description incorrect: {kink.get('description')}"
        print(f"✓ Kink Lounge description: {kink.get('description')}")
    
    def test_after_dark_description(self):
        """After Dark has correct description"""
        response = requests.get(f"{BASE_URL}/api/lounges?afterDark=true")
        lounges = response.json()
        after_dark = next((l for l in lounges if "after dark" in l.get("name", "").lower()), None)
        assert after_dark is not None, "After Dark lounge not found"
        desc = after_dark.get("description", "").lower()
        assert "no names" in desc or "no limits" in desc or "energy" in desc, f"After Dark description incorrect: {after_dark.get('description')}"
        print(f"✓ After Dark description: {after_dark.get('description')}")


class TestEventsAPI:
    """Test events endpoint"""
    
    def test_get_events(self):
        """GET /api/events returns 3 events"""
        response = requests.get(f"{BASE_URL}/api/events")
        assert response.status_code == 200, f"Failed to get events: {response.text}"
        events = response.json()
        assert isinstance(events, list), "Response should be a list"
        assert len(events) == 3, f"Expected 3 events, got {len(events)}"
        print(f"✓ Found {len(events)} events")
    
    def test_event_structure(self):
        """Verify event objects have required fields"""
        response = requests.get(f"{BASE_URL}/api/events")
        events = response.json()
        
        required_fields = ["id", "title", "description", "date"]
        for event in events:
            for field in required_fields:
                assert field in event, f"Event missing '{field}': {event}"
        print("✓ All events have required structure (id, title, description, date)")
    
    def test_event_titles(self):
        """Verify expected event titles exist"""
        response = requests.get(f"{BASE_URL}/api/events")
        events = response.json()
        titles = [e.get("title", "").lower() for e in events]
        
        # Check for expected events
        assert any("friday" in t or "live" in t for t in titles), "Friday Night Live event not found"
        assert any("vinyl" in t or "vibes" in t for t in titles), "Vinyl & Vibes event not found"
        assert any("after dark" in t or "unmasked" in t for t in titles), "After Dark: Unmasked event not found"
        print("✓ All expected events found: Friday Night Live, Vinyl & Vibes, After Dark: Unmasked")


class TestUsersAPI:
    """Test users endpoint"""
    
    def test_get_users(self):
        """GET /api/users returns user list"""
        response = requests.get(f"{BASE_URL}/api/users")
        assert response.status_code == 200, f"Failed to get users: {response.text}"
        users = response.json()
        assert isinstance(users, list), "Response should be a list"
        assert len(users) >= 1, "Expected at least 1 user"
        print(f"✓ Found {len(users)} users")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
