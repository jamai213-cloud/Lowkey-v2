#!/usr/bin/env python3
import requests
import json

def test_reset_password():
    url = "https://lowkey-critical.preview.emergentagent.com/api/auth/reset-password"
    headers = {"Content-Type": "application/json"}
    
    reset_data = {
        "token": "dummy_token_for_testing",
        "email": "test@example.com",
        "password": "newpassword123"
    }
    
    try:
        print("Making request...")
        response = requests.post(url, headers=headers, json=reset_data, timeout=30)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 400:
            data = response.json()
            if "error" in data and "Invalid or expired reset token" in data["error"]:
                print("✅ Reset password API working correctly")
                return True
        
        print("❌ Unexpected response")
        return False
        
    except Exception as e:
        print(f"❌ Request failed: {e}")
        return False

if __name__ == "__main__":
    test_reset_password()