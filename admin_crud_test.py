import requests
import json

# Test admin CRUD operations specifically
base_url = "https://flow-reports.preview.emergentagent.com/api"

print("🔍 Testing Admin Reports CRUD Operations...")

# 1. Test create report
create_data = {
    "title": "Test Admin Report 150752",
    "industry": "Technology & IT",
    "category": "Market Analysis", 
    "description": "Test report for admin panel testing",
    "price_single": 2500.00,
    "featured": False
}

print("\n1. Creating test report...")
response = requests.post(f"{base_url}/admin/reports", json=create_data)
print(f"Create Status: {response.status_code}")

if response.status_code == 201:
    report_data = response.json()
    report_id = report_data.get('id')
    print(f"✅ Created report with ID: {report_id}")
    
    # 2. Test update report
    print(f"\n2. Updating report {report_id}...")
    update_data = {**create_data, "title": "Updated Test Report", "price_single": 3000.00}
    
    response = requests.put(f"{base_url}/admin/reports/{report_id}", json=update_data)
    print(f"Update Status: {response.status_code}")
    if response.status_code == 200:
        print("✅ Update successful")
    
    # 3. Test delete report
    print(f"\n3. Deleting report {report_id}...")
    response = requests.delete(f"{base_url}/admin/reports/{report_id}")
    print(f"Delete Status: {response.status_code}")
    if response.status_code == 200:
        print("✅ Delete successful")
        print(f"Response: {response.json()}")
    
else:
    print(f"❌ Create failed: {response.text}")

print("\n📊 Admin CRUD Testing Complete!")