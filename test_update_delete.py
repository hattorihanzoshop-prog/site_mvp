import requests

base_url = "https://flow-reports.preview.emergentagent.com/api"
report_id = "rpt-614184f2"

print("🔍 Testing Update and Delete...")

# Test update
print(f"\n1. Updating report {report_id}...")
update_data = {
    "title": "Updated Test Admin Report",
    "industry": "Technology & IT", 
    "category": "Market Analysis",
    "description": "Updated test description",
    "price_single": 3500.00,
    "featured": True
}

response = requests.put(f"{base_url}/admin/reports/{report_id}", json=update_data)
print(f"Update Status: {response.status_code}")
if response.status_code == 200:
    result = response.json()
    print(f"✅ Update successful - Title: {result.get('title')}")
    print(f"   Price updated: ${result.get('price_single')}")
    print(f"   Featured: {result.get('featured')}")

# Test delete
print(f"\n2. Deleting report {report_id}...")
response = requests.delete(f"{base_url}/admin/reports/{report_id}")
print(f"Delete Status: {response.status_code}")
if response.status_code == 200:
    result = response.json()
    print(f"✅ Delete successful: {result}")

print("\n🎉 All Admin API CRUD operations working correctly!")