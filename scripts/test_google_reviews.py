import json
import tempfile
import unittest
from pathlib import Path
from sync_google_reviews import fetch_reviews, save_feed


def review(key, rating='FIVE', time='2026-11-04T12:00:00Z'):
    return {'reviewId': key, 'starRating': rating, 'updateTime': time,
            'reviewer': {'displayName': 'Test reviewer'}, 'comment': 'Synthetic test review'}


class ReviewSyncTests(unittest.TestCase):
    def test_new_review_edits_removals_and_all_ratings(self):
        pages = [
            {'reviews': [review('new', 'TWO'), review('edited')], 'averageRating': 3.5,
             'totalReviewCount': 2, 'nextPageToken': 'page2'},
            {'reviews': [review('edited', time='2026-11-03T12:00:00Z')]},
        ]
        urls = []
        def get(url, **kwargs):
            urls.append(url)
            return pages.pop(0)
        result = fetch_reviews('accounts/123/locations/456', 'SECRET_TOKEN_SENTINEL_123', get)
        self.assertEqual(result['data']['averageRating'], 3.5)
        self.assertEqual([r['reviewId'] for r in result['data']['reviews']], ['new', 'edited'])
        self.assertEqual(result['data']['reviews'][0]['starRating'], 'TWO')
        self.assertIn('pageToken=page2', urls[1])
        with tempfile.TemporaryDirectory() as folder:
            target = Path(folder) / 'feed.json'
            target.write_text('{"old": "removed"}')
            save_feed(result, target)
            saved = json.loads(target.read_text())
            self.assertNotIn('old', saved)
            self.assertNotIn('SECRET_TOKEN_SENTINEL_123', target.read_text())

    def test_partial_response_does_not_replace_feed(self):
        with tempfile.TemporaryDirectory() as folder:
            target = Path(folder) / 'feed.json'
            target.write_text('previous published feed')
            with self.assertRaises(ValueError):
                result = fetch_reviews('accounts/123/locations/456', 'SECRET_TOKEN_SENTINEL_123',
                    lambda *a, **kw: {'reviews': [review('one')], 'totalReviewCount': 2, 'averageRating': 5})
                save_feed(result, target)
            self.assertEqual(target.read_text(), 'previous published feed')

    def test_zero_reviews_clears_previous_snapshot(self):
        result = fetch_reviews('accounts/123/locations/456', 'SECRET_TOKEN_SENTINEL_123',
            lambda *a, **kw: {'totalReviewCount': 0})
        self.assertEqual(result['data']['reviews'], [])

    def test_invalid_location_and_pagination_loop(self):
        with self.assertRaises(ValueError):
            fetch_reviews('not-a-location', 'SECRET_TOKEN_SENTINEL_123')
        with self.assertRaises(ValueError):
            fetch_reviews('accounts/123/locations/456', 'SECRET_TOKEN_SENTINEL_123', lambda *a, **kw:
                {'reviews': [review('one')], 'totalReviewCount': 2, 'averageRating': 5, 'nextPageToken': 'same'})


if __name__ == '__main__':
    unittest.main()
