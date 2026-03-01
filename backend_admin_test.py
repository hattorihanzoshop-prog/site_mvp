import requests
import json
import sys
from datetime import datetime

class AdminAPITester:
    def __init__(self, base_url="https://flow-reports.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.admin_password = "flowadmin2025"

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint.lstrip('/')}"
        default_headers = {'Content-Type': 'application/json'}
        if headers:
            default_headers.update(headers)

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"  URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=default_headers)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=default_headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=default_headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=default_headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                if response.content:
                    try:
                        response_data = response.json()
                        if isinstance(response_data, dict) and len(response_data) < 10:
                            print(f"   Response: {response_data}")
                    except:
                        pass
                return True, response.json() if response.content else {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    print(f"   Response: {response.text[:200]}")
                except:
                    pass
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_admin_login_correct_password(self):
        """Test admin login with correct password"""
        success, response = self.run_test(
            "Admin Login (Correct Password)",
            "POST",
            "admin/login",
            200,
            data={"password": self.admin_password}
        )
        return success

    def test_admin_login_wrong_password(self):
        """Test admin login with wrong password"""
        success, response = self.run_test(
            "Admin Login (Wrong Password)",
            "POST", 
            "admin/login",
            401,
            data={"password": "wrongpassword"}
        )
        return success

    def test_admin_stats(self):
        """Test admin stats endpoint"""
        success, response = self.run_test(
            "Admin Stats",
            "GET",
            "admin/stats",
            200
        )
        if success and response:
            print(f"   Stats: {json.dumps(response, indent=2)}")
        return success

    def test_admin_submissions(self):
        """Test admin submissions endpoint"""
        success, response = self.run_test(
            "Admin Submissions (All)",
            "GET", 
            "admin/submissions",
            200
        )
        if success and response:
            print(f"   Submission types: {list(response.keys())}")
            for key, data in response.items():
                if isinstance(data, dict) and 'total' in data:
                    print(f"   {key}: {data['total']} items")
        return success

    def test_admin_submissions_filtered(self):
        """Test admin submissions with filters"""
        filters = ['newsletter', 'contact', 'research', 'downloads']
        all_passed = True
        
        for filter_type in filters:
            success, response = self.run_test(
                f"Admin Submissions ({filter_type})",
                "GET",
                f"admin/submissions?submission_type={filter_type}",
                200
            )
            if success and response:
                data = response.get(filter_type, {})
                total = data.get('total', 0) if isinstance(data, dict) else 0
                print(f"   {filter_type}: {total} items")
            all_passed = all_passed and success
        
        return all_passed

    def test_admin_transactions(self):
        """Test admin transactions endpoint"""
        success, response = self.run_test(
            "Admin Transactions",
            "GET",
            "admin/transactions",
            200
        )
        if success and response:
            total = response.get('total', 0)
            pages = response.get('pages', 0)
            items_count = len(response.get('items', []))
            print(f"   Total transactions: {total}, Pages: {pages}, Current page items: {items_count}")
        return success

    def test_admin_reports_crud(self):
        """Test admin reports CRUD operations"""
        # First get existing reports to understand structure
        print("\n🔍 Testing Admin Reports CRUD...")
        
        # 1. Get all reports (should work - using existing endpoint)
        success, reports_response = self.run_test(
            "Get Reports List",
            "GET",
            "reports?limit=50",
            200
        )
        if not success:
            return False
            
        reports = reports_response.get('reports', [])
        if not reports:
            print("   No reports found to test with")
            return False
            
        first_report = reports[0]
        print(f"   Found {len(reports)} reports, testing with: {first_report.get('title', 'Unknown')[:50]}...")

        # 2. Test create new report
        new_report_data = {
            "title": "Test Admin Report " + datetime.now().strftime("%H%M%S"),
            "industry": "Technology & IT",
            "category": "Market Analysis", 
            "description": "This is a test report created by admin API testing",
            "detailed_description": "Detailed description for testing purposes",
            "pages": 100,
            "figures": 25,
            "tables": 15,
            "companies_profiled": 50,
            "regions_covered": 10,
            "publish_date": "2025-02-01",
            "price_single": 2500.00,
            "price_multi": 4000.00,
            "price_enterprise": 6000.00,
            "key_findings": ["Test finding 1", "Test finding 2"],
            "table_of_contents": [
                {"chapter": "1", "title": "Introduction", "pages": "1-10"},
                {"chapter": "2", "title": "Analysis", "pages": "11-50"}
            ],
            "methodology": "Test methodology description",
            "cover_image": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop",
            "featured": False,
            "keywords": ["test", "admin", "api"]
        }
        
        success, create_response = self.run_test(
            "Create New Report",
            "POST",
            "admin/reports",
            201,
            data=new_report_data
        )
        
        if not success:
            return False
            
        new_report_id = create_response.get('id')
        if not new_report_id:
            print("   ❌ Created report missing ID field")
            return False
            
        print(f"   Created report with ID: {new_report_id}")

        # 3. Test update report
        update_data = {
            **new_report_data,
            "title": "Updated Test Admin Report " + datetime.now().strftime("%H%M%S"),
            "price_single": 3000.00,
            "featured": True
        }
        
        success, update_response = self.run_test(
            "Update Report",
            "PUT", 
            f"admin/reports/{new_report_id}",
            200,
            data=update_data
        )
        
        if not success:
            return False
            
        # Verify update worked
        if update_response.get('title') != update_data['title']:
            print(f"   ❌ Update failed - title not updated")
            return False
            
        print(f"   Updated report title: {update_response.get('title', 'Missing')[:50]}...")

        # 4. Test delete report
        success, delete_response = self.run_test(
            "Delete Report",
            "DELETE",
            f"admin/reports/{new_report_id}",
            200
        )
        
        if success and delete_response.get('status') == 'deleted':
            print(f"   Successfully deleted report: {delete_response.get('id')}")
        
        return success

def main():
    print("🚀 Starting Flow Consulting Admin Panel API Testing...")
    print("=" * 60)
    
    tester = AdminAPITester()
    
    # Test admin authentication
    print("\n📋 ADMIN AUTHENTICATION TESTS")
    print("-" * 40)
    
    auth_tests = [
        tester.test_admin_login_correct_password,
        tester.test_admin_login_wrong_password,
    ]
    
    for test in auth_tests:
        test()
    
    # Test admin data endpoints
    print("\n📋 ADMIN DATA ENDPOINTS TESTS")
    print("-" * 40)
    
    data_tests = [
        tester.test_admin_stats,
        tester.test_admin_submissions,
        tester.test_admin_submissions_filtered,
        tester.test_admin_transactions,
    ]
    
    for test in data_tests:
        test()
    
    # Test admin CRUD operations
    print("\n📋 ADMIN CRUD OPERATIONS TESTS")
    print("-" * 40)
    
    tester.test_admin_reports_crud()
    
    # Print results
    print(f"\n📊 FINAL RESULTS")
    print("=" * 60)
    print(f"Tests Run: {tester.tests_run}")
    print(f"Tests Passed: {tester.tests_passed}")
    print(f"Success Rate: {(tester.tests_passed/tester.tests_run*100):.1f}%" if tester.tests_run > 0 else "0%")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All admin API tests passed!")
        return 0
    else:
        print("⚠️  Some admin API tests failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())