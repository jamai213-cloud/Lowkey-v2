"""
Test Grown Folks Lounge Feature
Tests for the new Grown Folks lounge with gold/champagne premium styling,
'Featured Community' badge, and GFB logo.
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'http://localhost:3000')

class TestGrownFolksLoungeAPI:
    """Test Grown Folks lounge API endpoints"""
    
    def test_lounges_returns_grown_folks(self):
        """GET /api/lounges returns Grown Folks lounge"""
        response = requests.get(f"{BASE_URL}/api/lounges")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        lounges = response.json()
        assert isinstance(lounges, list), "Response should be a list"
        
        # Find Grown Folks lounge
        grown_folks = None
        for lounge in lounges:
            if lounge.get('id') == 'grown-folks' or 'grown folk' in lounge.get('name', '').lower():
                grown_folks = lounge
                break
        
        assert grown_folks is not None, "Grown Folks lounge not found in response"
        print(f"Found Grown Folks lounge: {grown_folks}")
    
    def test_grown_folks_has_correct_member_count(self):
        """Grown Folks lounge has memberCount of 56"""
        response = requests.get(f"{BASE_URL}/api/lounges")
        assert response.status_code == 200
        
        lounges = response.json()
        grown_folks = next((l for l in lounges if l.get('id') == 'grown-folks'), None)
        
        assert grown_folks is not None, "Grown Folks lounge not found"
        assert grown_folks.get('memberCount') == 56, f"Expected memberCount 56, got {grown_folks.get('memberCount')}"
        print(f"Grown Folks memberCount: {grown_folks.get('memberCount')}")
    
    def test_grown_folks_has_correct_description(self):
        """Grown Folks lounge description contains 'Grown energy'"""
        response = requests.get(f"{BASE_URL}/api/lounges")
        assert response.status_code == 200
        
        lounges = response.json()
        grown_folks = next((l for l in lounges if l.get('id') == 'grown-folks'), None)
        
        assert grown_folks is not None, "Grown Folks lounge not found"
        description = grown_folks.get('description', '')
        assert 'Grown energy' in description, f"Description should contain 'Grown energy', got: {description}"
        print(f"Grown Folks description: {description}")
    
    def test_grown_folks_is_not_after_dark(self):
        """Grown Folks lounge is NOT an After Dark lounge"""
        response = requests.get(f"{BASE_URL}/api/lounges")
        assert response.status_code == 200
        
        lounges = response.json()
        grown_folks = next((l for l in lounges if l.get('id') == 'grown-folks'), None)
        
        assert grown_folks is not None, "Grown Folks lounge not found"
        assert grown_folks.get('isAfterDark') != True, "Grown Folks should NOT be an After Dark lounge"
        print(f"Grown Folks isAfterDark: {grown_folks.get('isAfterDark')}")
    
    def test_all_featured_lounges_exist(self):
        """All 5 featured lounges exist: Grown Folks, LowKey, After Dark, Kink, VIP"""
        # Get regular lounges
        response = requests.get(f"{BASE_URL}/api/lounges")
        assert response.status_code == 200
        regular_lounges = response.json()
        
        # Get After Dark lounges
        response_ad = requests.get(f"{BASE_URL}/api/lounges?afterDark=true")
        assert response_ad.status_code == 200
        after_dark_lounges = response_ad.json()
        
        all_lounges = regular_lounges + after_dark_lounges
        
        # Check for each featured lounge
        featured_checks = {
            'grown-folks': False,
            'lowkey': False,
            'after-dark': False,
            'kink': False,
            'vip': False
        }
        
        for lounge in all_lounges:
            name = lounge.get('name', '').lower()
            lounge_id = lounge.get('id', '').lower()
            
            if 'grown folk' in name or lounge_id == 'grown-folks':
                featured_checks['grown-folks'] = True
            if 'lowkey' in name or 'lowkey' in lounge_id:
                featured_checks['lowkey'] = True
            if 'after dark' in name or lounge_id == 'after-dark':
                featured_checks['after-dark'] = True
            if 'kink' in name or 'kink' in lounge_id:
                featured_checks['kink'] = True
            if 'vip' in name or 'vip' in lounge_id:
                featured_checks['vip'] = True
        
        for lounge_key, found in featured_checks.items():
            assert found, f"Featured lounge '{lounge_key}' not found"
            print(f"Featured lounge '{lounge_key}': FOUND")
    
    def test_grown_folks_lounge_detail(self):
        """GET /api/lounges/grown-folks returns lounge details"""
        response = requests.get(f"{BASE_URL}/api/lounges/grown-folks")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        lounge = response.json()
        assert lounge.get('id') == 'grown-folks' or 'grown folk' in lounge.get('name', '').lower()
        print(f"Grown Folks lounge detail: {lounge}")


class TestGrownFolksAutoSeed:
    """Test that Grown Folks is auto-seeded correctly"""
    
    def test_auto_seed_creates_grown_folks(self):
        """Auto-seed creates Grown Folks lounge on first API call"""
        # First call should trigger auto-seed
        response = requests.get(f"{BASE_URL}/api/lounges")
        assert response.status_code == 200
        
        lounges = response.json()
        grown_folks = next((l for l in lounges if l.get('id') == 'grown-folks'), None)
        
        assert grown_folks is not None, "Auto-seed should create Grown Folks lounge"
        assert grown_folks.get('name') == 'Grown Folks', f"Name should be 'Grown Folks', got {grown_folks.get('name')}"
        print("Auto-seed created Grown Folks lounge successfully")
    
    def test_auto_seed_idempotent(self):
        """Multiple API calls don't create duplicate lounges"""
        # Call API multiple times
        for i in range(3):
            response = requests.get(f"{BASE_URL}/api/lounges")
            assert response.status_code == 200
        
        lounges = response.json()
        grown_folks_count = sum(1 for l in lounges if l.get('id') == 'grown-folks')
        
        assert grown_folks_count == 1, f"Should have exactly 1 Grown Folks lounge, found {grown_folks_count}"
        print("Auto-seed is idempotent - no duplicates created")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
