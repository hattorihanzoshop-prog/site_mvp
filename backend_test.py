import requests
import sys
import json
from datetime import datetime

class FlowConsultingAPITester:
    def __init__(self, base_url="https://flow-reports.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def log_result(self, test_name, success, response_data=None, error_msg=None):
        """Log test results"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {test_name}: PASSED")
            if response_data and isinstance(response_data, dict):
                if 'reports' in response_data:
                    print(f"   → Found {len(response_data['reports'])} reports")
                elif 'message' in response_data:
                    print(f"   → {response_data['message']}")
        else:
            self.failed_tests.append({'test': test_name, 'error': error_msg})
            print(f"❌ {test_name}: FAILED")
            if error_msg:
                print(f"   → Error: {error_msg}")

    def test_root_endpoint(self):
        """Test the root API endpoint"""
        try:
            response = requests.get(f"{self.base_url}/", timeout=10)
            success = response.status_code == 200
            data = response.json() if success else None
            self.log_result("Root Endpoint", success, data)
            return success
        except Exception as e:
            self.log_result("Root Endpoint", False, error_msg=str(e))
            return False

    def test_get_reports(self):
        """Test GET /reports endpoint"""
        try:
            response = requests.get(f"{self.base_url}/reports", timeout=10)
            success = response.status_code == 200
            data = response.json() if success else None
            
            if success and data:
                # Check data structure
                expected_keys = ['reports', 'total', 'page', 'pages']
                has_structure = all(key in data for key in expected_keys)
                if not has_structure:
                    success = False
                    
            self.log_result("GET Reports", success, data)
            return success, data
        except Exception as e:
            self.log_result("GET Reports", False, error_msg=str(e))
            return False, None

    def test_get_reports_with_filters(self):
        """Test GET /reports with filters"""
        test_cases = [
            {"params": {"industry": "Technology & IT"}, "name": "Filter by Technology Industry"},
            {"params": {"featured": True}, "name": "Filter by Featured Reports"},
            {"params": {"search": "AI"}, "name": "Search for AI"},
            {"params": {"limit": 5}, "name": "Limit Results"},
        ]
        
        all_passed = True
        for case in test_cases:
            try:
                response = requests.get(f"{self.base_url}/reports", params=case["params"], timeout=10)
                success = response.status_code == 200
                data = response.json() if success else None
                self.log_result(case["name"], success, data)
                if not success:
                    all_passed = False
            except Exception as e:
                self.log_result(case["name"], False, error_msg=str(e))
                all_passed = False
        
        return all_passed

    def test_get_single_report(self):
        """Test GET /reports/{id} endpoint"""
        try:
            # First get a report ID
            reports_response = requests.get(f"{self.base_url}/reports?limit=1", timeout=10)
            if reports_response.status_code != 200:
                self.log_result("Get Single Report (Prerequisites Failed)", False, error_msg="Could not fetch reports list")
                return False
            
            reports_data = reports_response.json()
            if not reports_data.get('reports'):
                self.log_result("Get Single Report (No Reports Available)", False, error_msg="No reports found")
                return False
            
            report_id = reports_data['reports'][0]['id']
            
            # Test getting single report
            response = requests.get(f"{self.base_url}/reports/{report_id}", timeout=10)
            success = response.status_code == 200
            data = response.json() if success else None
            
            # Validate report structure
            if success and data:
                expected_fields = ['id', 'title', 'industry', 'price_single', 'description']
                has_fields = all(field in data for field in expected_fields)
                if not has_fields:
                    success = False
                    
            self.log_result("GET Single Report", success, {'id': data.get('id') if data else None})
            return success
        except Exception as e:
            self.log_result("GET Single Report", False, error_msg=str(e))
            return False

    def test_get_industries(self):
        """Test GET /industries endpoint"""
        try:
            response = requests.get(f"{self.base_url}/industries", timeout=10)
            success = response.status_code == 200
            data = response.json() if success else None
            
            if success and data:
                # Should be a list of industries with required fields
                if isinstance(data, list) and len(data) > 0:
                    first_industry = data[0]
                    required_fields = ['name', 'icon', 'slug', 'report_count']
                    has_structure = all(field in first_industry for field in required_fields)
                    if not has_structure:
                        success = False
                else:
                    success = False
                    
            self.log_result("GET Industries", success, {'count': len(data) if data and isinstance(data, list) else 0})
            return success
        except Exception as e:
            self.log_result("GET Industries", False, error_msg=str(e))
            return False

    def test_search_endpoint(self):
        """Test GET /search endpoint"""
        try:
            response = requests.get(f"{self.base_url}/search", params={'q': 'AI'}, timeout=10)
            success = response.status_code == 200
            data = response.json() if success else None
            
            self.log_result("GET Search", success, {'results_count': len(data) if data and isinstance(data, list) else 0})
            return success
        except Exception as e:
            self.log_result("GET Search", False, error_msg=str(e))
            return False

    def test_newsletter_signup(self):
        """Test POST /newsletter endpoint"""
        try:
            test_email = f"test_{datetime.now().strftime('%H%M%S')}@example.com"
            payload = {"email": test_email}
            
            response = requests.post(f"{self.base_url}/newsletter", json=payload, timeout=10)
            success = response.status_code == 200
            data = response.json() if success else None
            
            self.log_result("POST Newsletter Signup", success, data)
            return success
        except Exception as e:
            self.log_result("POST Newsletter Signup", False, error_msg=str(e))
            return False

    def test_contact_form(self):
        """Test POST /contact endpoint"""
        try:
            payload = {
                "name": "Test User",
                "email": "test@example.com",
                "subject": "Test Subject",
                "message": "This is a test message"
            }
            
            response = requests.post(f"{self.base_url}/contact", json=payload, timeout=10)
            success = response.status_code == 200
            data = response.json() if success else None
            
            self.log_result("POST Contact Form", success, data)
            return success
        except Exception as e:
            self.log_result("POST Contact Form", False, error_msg=str(e))
            return False

    def test_custom_research(self):
        """Test POST /custom-research endpoint"""
        try:
            payload = {
                "name": "Test Researcher",
                "email": "research@example.com",
                "company": "Test Company",
                "phone": "+1234567890",
                "industry": "Technology & IT",
                "description": "Test research request for AI market analysis",
                "budget": "$10,000 - $25,000"
            }
            
            response = requests.post(f"{self.base_url}/custom-research", json=payload, timeout=10)
            success = response.status_code == 200
            data = response.json() if success else None
            
            self.log_result("POST Custom Research", success, data)
            return success
        except Exception as e:
            self.log_result("POST Custom Research", False, error_msg=str(e))
            return False

    def test_sample_download(self):
        """Test POST /sample-download endpoint"""
        try:
            # First get a report ID
            reports_response = requests.get(f"{self.base_url}/reports?limit=1", timeout=10)
            if reports_response.status_code != 200:
                self.log_result("Sample Download (Prerequisites Failed)", False, error_msg="Could not fetch reports list")
                return False
            
            reports_data = reports_response.json()
            if not reports_data.get('reports'):
                self.log_result("Sample Download (No Reports Available)", False, error_msg="No reports found")
                return False
            
            report_id = reports_data['reports'][0]['id']
            
            payload = {
                "email": "sample@example.com",
                "report_id": report_id
            }
            
            response = requests.post(f"{self.base_url}/sample-download", json=payload, timeout=10)
            success = response.status_code == 200
            data = response.json() if success else None
            
            self.log_result("POST Sample Download", success, data)
            return success
        except Exception as e:
            self.log_result("POST Sample Download", False, error_msg=str(e))
            return False

    def test_sample_pdf_generation(self):
        """Test GET /sample-download/{report_id}/pdf endpoint"""
        try:
            # First get a report ID
            reports_response = requests.get(f"{self.base_url}/reports?limit=1", timeout=10)
            if reports_response.status_code != 200:
                self.log_result("PDF Generation (Prerequisites Failed)", False, error_msg="Could not fetch reports list")
                return False
            
            reports_data = reports_response.json()
            if not reports_data.get('reports'):
                self.log_result("PDF Generation (No Reports Available)", False, error_msg="No reports found")
                return False
            
            report_id = reports_data['reports'][0]['id']
            
            response = requests.get(f"{self.base_url}/sample-download/{report_id}/pdf", timeout=15)
            success = response.status_code == 200 and response.headers.get('content-type') == 'application/pdf'
            
            result_data = {
                'content_type': response.headers.get('content-type'),
                'content_length': len(response.content) if success else 0
            }
            
            self.log_result("GET PDF Generation", success, result_data)
            return success
        except Exception as e:
            self.log_result("GET PDF Generation", False, error_msg=str(e))
            return False

    def test_checkout_creation(self):
        """Test POST /checkout endpoint (basic validation only - no actual payment)"""
        try:
            # First get a report ID
            reports_response = requests.get(f"{self.base_url}/reports?limit=1", timeout=10)
            if reports_response.status_code != 200:
                self.log_result("Checkout Creation (Prerequisites Failed)", False, error_msg="Could not fetch reports list")
                return False
            
            reports_data = reports_response.json()
            if not reports_data.get('reports'):
                self.log_result("Checkout Creation (No Reports Available)", False, error_msg="No reports found")
                return False
            
            report_id = reports_data['reports'][0]['id']
            
            payload = {
                "items": [{"report_id": report_id, "license_type": "single"}],
                "origin_url": "https://flow-reports.preview.emergentagent.com"
            }
            
            response = requests.post(f"{self.base_url}/checkout", json=payload, timeout=15)
            success = response.status_code == 200
            data = response.json() if success else None
            
            # Check if response contains expected Stripe checkout URL structure
            if success and data:
                has_url = 'url' in data and isinstance(data['url'], str)
                has_session = 'session_id' in data
                if not (has_url and has_session):
                    success = False
            
            self.log_result("POST Checkout Creation", success, {'has_url': bool(data and 'url' in data) if data else False})
            return success
        except Exception as e:
            self.log_result("POST Checkout Creation", False, error_msg=str(e))
            return False

    def run_all_tests(self):
        """Run all API tests"""
        print(f"🚀 Starting Flow Consulting API Tests")
        print(f"📍 Base URL: {self.base_url}")
        print("=" * 50)
        
        # Test basic endpoints first
        self.test_root_endpoint()
        
        # Test core report functionality
        reports_success, reports_data = self.test_get_reports()
        if reports_success and reports_data and reports_data.get('reports'):
            print(f"📊 Database contains {reports_data['total']} reports")
        
        self.test_get_reports_with_filters()
        self.test_get_single_report()
        self.test_get_industries()
        self.test_search_endpoint()
        
        # Test form submissions
        self.test_newsletter_signup()
        self.test_contact_form()
        self.test_custom_research()
        
        # Test sample download functionality
        self.test_sample_download()
        self.test_sample_pdf_generation()
        
        # Test checkout (basic validation only)
        self.test_checkout_creation()
        
        # Print results
        print("=" * 50)
        print(f"📊 Test Results: {self.tests_passed}/{self.tests_run} tests passed")
        print(f"✅ Success Rate: {(self.tests_passed/self.tests_run)*100:.1f}%")
        
        if self.failed_tests:
            print(f"\n❌ Failed Tests:")
            for test in self.failed_tests:
                print(f"   • {test['test']}: {test['error']}")
        
        return self.tests_passed == self.tests_run

def main():
    tester = FlowConsultingAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())