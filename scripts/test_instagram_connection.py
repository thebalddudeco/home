import os
import unittest
import tempfile
from pathlib import Path
from unittest.mock import patch
import sync_instagram as sync


class AccountConnectionTests(unittest.TestCase):
    def test_profile_links_match_api_links_for_pins_and_grid_membership(self):
        profile = 'https://www.instagram.com/thebalddude.dng/reel/DfSJuRqvJv-/'
        api = 'https://www.instagram.com/reel/DfSJuRqvJv-/'
        self.assertEqual(sync.normalize_permalink(profile), sync.normalize_permalink(api))
        self.assertNotEqual(sync.normalize_permalink(api), sync.normalize_permalink('https://www.instagram.com/reel/another/'))

    @patch.dict(os.environ, {'INSTAGRAM_LOGIN_MODE': 'facebook', 'INSTAGRAM_EXPECTED_USERNAME': 'thebalddude.dng', 'INSTAGRAM_FACEBOOK_PAGE_ID': '123'})
    def test_linked_page_accepts_only_expected_instagram_account(self):
        with patch.object(sync, 'request_json', return_value={'id': '123', 'instagram_business_account': {'id': '456', 'username': 'thebalddude.dng'}}) as request:
            self.assertEqual(sync.media_endpoint(), 'https://graph.facebook.com/v27.0/456/media')
            self.assertIn('/123?', request.call_args.args[0])
        for page in [{'id': '123'}, {'id': '999', 'instagram_business_account': {'id': '456', 'username': 'thebalddude.dng'}},
                     {'id': '123', 'instagram_business_account': {'id': '456', 'username': 'another_account'}}]:
            with self.subTest(page=page), patch.object(sync, 'request_json', return_value=page):
                with self.assertRaisesRegex(RuntimeError, 'existing feed remains unchanged'):
                    sync.media_endpoint()

    def test_failed_photo_download_preserves_existing_feed_and_images(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            assets = root / 'assets'
            assets.mkdir()
            photo = assets / 'instagram-live-existing.webp'
            photo.write_bytes(b'existing photo')
            feed = root / 'instagram-feed.json'
            feed.write_text('{"source":"previous-success"}')
            payload = {'data': [{'id': '1', 'media_type': 'IMAGE', 'permalink': 'https://www.instagram.com/p/test/', 'media_url': 'https://example.com/photo'}]}
            with patch.multiple(sync, ROOT=root, ASSETS=assets, OUTPUT=feed, TOKEN='test-only'), \
                    patch.object(sync, 'media_endpoint', return_value=sync.ENDPOINT), \
                    patch.object(sync, 'request_json', return_value=payload), \
                    patch.object(sync, 'download', side_effect=RuntimeError('photo download failed')):
                with self.assertRaisesRegex(RuntimeError, 'photo download failed'):
                    sync.main()
            self.assertEqual(photo.read_bytes(), b'existing photo')
            self.assertEqual(feed.read_text(), '{"source":"previous-success"}')
            self.assertEqual(list(assets.iterdir()), [photo])

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
