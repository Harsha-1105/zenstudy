import unittest
import json
from unittest.mock import patch, MagicMock
import os

# Set dummy environment variables before importing server if needed,
# but we will manually patch server.GEMINI_API_KEY in the tests.
import server

class ZenStudyServerTestCase(unittest.TestCase):

    def setUp(self):
        # Configure Flask app for testing
        server.app.config['TESTING'] = True
        self.app = server.app.test_client()
        
        # Save original API Key
        self.original_api_key = server.GEMINI_API_KEY
        server.GEMINI_API_KEY = "" # Default to empty for offline fallback testing

    def tearDown(self):
        # Restore original API Key
        server.GEMINI_API_KEY = self.original_api_key

    def test_serve_index(self):
        """Test that the root URL serves index.html successfully"""
        response = self.app.get('/')
        self.assertEqual(response.status_code, 200)
        # Check if it contains some frontend keyword to confirm it's index.html
        self.assertIn(b'ZenStudy', response.data)

    def test_analyze_empty_payload(self):
        """Test /api/analyze validation checks for empty input"""
        response = self.app.post('/api/analyze', 
                                 data=json.dumps({"text": "", "exam": "JEE"}),
                                 content_type='application/json')
        self.assertEqual(response.status_code, 400)
        data = json.loads(response.data.decode('utf-8'))
        self.assertIn('error', data)

    def test_analyze_local_fallback(self):
        """Test /api/analyze triggers local heuristics when GEMINI_API_KEY is empty"""
        # Inject journal text loaded with stress/burnout keywords
        journal_text = "I am so stressed about the maths exam and syllabus backlog. I feel tired and exhausted."
        response = self.app.post('/api/analyze',
                                 data=json.dumps({"text": journal_text, "exam": "JEE"}),
                                 content_type='application/json')
        
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data.decode('utf-8'))
        
        # Check that we get stress/burnout indicators
        self.assertIn('stress', data)
        self.assertIn('burnout', data)
        self.assertIn('doubt', data)
        self.assertIn('feedbackTitle', data)
        self.assertIn('feedbackText', data)
        self.assertGreater(data['stress'], 30) # Keywords should trigger higher score

    @patch('requests.post')
    def test_analyze_gemini_api_call(self, mock_post):
        """Test /api/analyze correctly calls and parses Gemini API response when API Key exists"""
        # Set dummy key
        server.GEMINI_API_KEY = "AIzaDummyKey"
        
        # Mock Gemini JSON response
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "candidates": [{
                "content": {
                    "parts": [{
                        "text": json.dumps({
                            "stress": 85,
                            "burnout": 70,
                            "doubt": 60,
                            "feedbackTitle": "Managing Mock Pressures",
                            "feedbackText": "Take a 5-minute break and focus on deep breathing."
                        })
                    }]
                }
            }]
        }
        mock_post.return_value = mock_response

        response = self.app.post('/api/analyze',
                                 data=json.dumps({"text": "Stressful mock tests.", "exam": "NEET"}),
                                 content_type='application/json')

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data.decode('utf-8'))
        
        # Verify mocked values were parsed and returned
        self.assertEqual(data['stress'], 85)
        self.assertEqual(data['burnout'], 70)
        self.assertEqual(data['doubt'], 60)
        self.assertEqual(data['feedbackTitle'], "Managing Mock Pressures")
        self.assertEqual(data['feedbackText'], "Take a 5-minute break and focus on deep breathing.")

    def test_chat_empty_payload(self):
        """Test /api/chat validation checks for empty message"""
        response = self.app.post('/api/chat',
                                 data=json.dumps({
                                     "latestUserMessage": "",
                                     "companionName": "Aria"
                                 }),
                                 content_type='application/json')
        self.assertEqual(response.status_code, 400)

    def test_chat_local_fallback(self):
        """Test /api/chat triggers local mock replies when GEMINI_API_KEY is empty"""
        response = self.app.post('/api/chat',
                                 data=json.dumps({
                                     "latestUserMessage": "I have so much syllabus backlog",
                                     "companionName": "Aria",
                                     "exam": "JEE",
                                     "history": []
                                 }),
                                 content_type='application/json')
        
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data.decode('utf-8'))
        self.assertIn('reply', data)
        # Check that Aria's backlog response contains friendly words
        self.assertIn("syllabus", data['reply'].lower() or "backlog" in data['reply'].lower())

    @patch('requests.post')
    def test_chat_gemini_api_call(self, mock_post):
        """Test /api/chat correctly calls and parses Gemini API response when API Key exists"""
        server.GEMINI_API_KEY = "AIzaDummyKey"
        
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "candidates": [{
                "content": {
                    "parts": [{
                        "text": "Hello! I am Leo, your study strategist. Let's make an action plan today."
                    }]
                }
            }]
        }
        mock_post.return_value = mock_response

        response = self.app.post('/api/chat',
                                 data=json.dumps({
                                     "latestUserMessage": "How to study?",
                                     "companionName": "Leo",
                                     "exam": "CAT",
                                     "history": []
                                 }),
                                 content_type='application/json')

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data.decode('utf-8'))
        self.assertEqual(data['reply'], "Hello! I am Leo, your study strategist. Let's make an action plan today.")

    def test_cors_headers(self):
        """Test that cross-origin preflight OPTIONS requests return correct headers"""
        response = self.app.options('/api/analyze')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.headers.get("Access-Control-Allow-Origin"), "*")
        self.assertIn("Content-Type", response.headers.get("Access-Control-Allow-Headers"))

if __name__ == '__main__':
    unittest.main()
