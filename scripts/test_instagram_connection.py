import os
import unittest
from unittest.mock import patch
import sync_instagram as sync


class AccountConnectionTests(unittest.TestCase):
    @patch.dict(os.environ, {'INSTAGRAM_LOGIN_MODE': 'unified', 'INSTAGRAM_EXPECTED_USERNAME': 'thebalddude.dng'})
    def test_accepts_only_the_requested_account(self):
        with patch.object(sync, 'request_json', return_value={'data': [
            {'id': '123', 'username': 'another_account'},
            {'id': '456', 'username': 'thebalddude.dng'}]}):
            self.assertEqual(sync.media_endpoint(), 'https://graph.facebook.com/v27.0/456/media')

    @patch.dict(os.environ, {'INSTAGRAM_LOGIN_MODE': 'unified', 'INSTAGRAM_EXPECTED_USERNAME': 'thebalddude.dng'})
    def test_missing_or_wrong_assignment_stops_sync(self):
        for data in [[], [{'id': '123', 'username': 'another_account'}]]:
            with self.subTest(data=data), patch.object(sync, 'request_json', return_value={'data': data}):
                with self.assertRaisesRegex(RuntimeError, 'existing feed remains unchanged'):
                    sync.media_endpoint()

    def test_rejects_non_meta_paging_host_before_sending_token(self):
        with patch.object(sync.urllib.request, 'urlopen') as request:
            with self.assertRaisesRegex(RuntimeError, 'outside Meta'):
                sync.request_json('https://example.com/next')
            request.assert_not_called()


if __name__ == '__main__':
    unittest.main()
