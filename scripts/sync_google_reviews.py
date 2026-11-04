"""Read-only Business Profile review sync. Never writes to the Google listing.

The generated feed is a deployment artifact, not source-controlled review data.
"""
from __future__ import annotations

import json
import os
import re
import sys
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MAPS_URL = 'https://www.google.com/maps/place/The+Bald+Dude+Co./data=!4m2!3m1!1s0x0:0xb40325d0df15bb9b'


def request_json(url, *, data=None, token=None):
    headers = {'Accept': 'application/json'}
    if token:
        headers['Authorization'] = f'Bearer {token}'
    if data is not None:
        headers['Content-Type'] = 'application/x-www-form-urlencoded'
        data = urllib.parse.urlencode(data).encode()
    try:
        with urllib.request.urlopen(urllib.request.Request(url, data=data, headers=headers), timeout=30) as response:
            return json.load(response)
    except urllib.error.HTTPError as error:
        # Do not print response bodies, authorization headers, or token-bearing URLs.
        raise RuntimeError(f'Google request failed (HTTP {error.code}); existing review data was not changed.') from None


def access_token():
    names = ('GOOGLE_REVIEW_CLIENT_ID', 'GOOGLE_REVIEW_CLIENT_SECRET', 'GOOGLE_REVIEW_REFRESH_TOKEN')
    values = {name: os.environ.get(name, '').strip() for name in names}
    if not all(values.values()):
        raise RuntimeError('Google review authorization is not configured. See scripts/GOOGLE-REVIEWS-SETUP.txt.')
    result = request_json('https://oauth2.googleapis.com/token', data={
        'client_id': values[names[0]], 'client_secret': values[names[1]],
        'refresh_token': values[names[2]], 'grant_type': 'refresh_token',
    })
    if not result.get('access_token'):
        raise RuntimeError('Google authorization did not return an access token.')
    return result['access_token']


def fetch_reviews(parent, token, get=request_json):
    if not re.fullmatch(r'accounts/[0-9]+/locations/[0-9]+', parent):
        raise ValueError('GOOGLE_REVIEW_LOCATION must be accounts/ACCOUNT_ID/locations/LOCATION_ID.')
    collected, seen_tokens, page_token, summary = {}, set(), '', None
    while True:
        query = {'pageSize': 50, 'orderBy': 'updateTime desc'}
        if page_token:
            query['pageToken'] = page_token
        payload = get(f'https://mybusiness.googleapis.com/v4/{parent}/reviews?{urllib.parse.urlencode(query)}', token=token)
        if summary is None:
            total = payload.get('totalReviewCount')
            average = payload.get('averageRating', 0)
            if not isinstance(total, int) or total < 0 or not isinstance(average, (int, float)) or not 0 <= average <= 5:
                raise ValueError('Google returned an invalid review summary.')
            summary = {'averageRating': average, 'totalReviewCount': total}
        for review in payload.get('reviews', []):
            review_id = review.get('reviewId')
            if not review_id or review.get('starRating') not in ('ONE', 'TWO', 'THREE', 'FOUR', 'FIVE'):
                raise ValueError('Google returned an invalid review.')
            if review_id not in collected or review.get('updateTime', '') > collected[review_id].get('updateTime', ''):
                collected[review_id] = review
        page_token = payload.get('nextPageToken')
        if not page_token:
            break
        if page_token in seen_tokens or len(seen_tokens) >= 1000:
            raise ValueError('Review pagination did not complete; keeping the previous feed.')
        seen_tokens.add(page_token)
    if len(collected) != summary['totalReviewCount']:
        raise ValueError('Review count changed during sync or a page is missing; retry on the next sync.')
    # Keep Google review objects intact. No rating filtering or text rewriting.
    summary['reviews'] = sorted(collected.values(), key=lambda item: item.get('updateTime', ''), reverse=True)
    return {'source': 'google-business-profile', 'syncedAt': datetime.now(timezone.utc).isoformat(),
            'googleMapsUrl': MAPS_URL, 'data': summary}


def save_feed(feed, destination):
    temporary = destination.with_suffix('.tmp')
    temporary.write_text(json.dumps(feed, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    temporary.replace(destination)


def main():
    parent = os.environ.get('GOOGLE_REVIEW_LOCATION', '').strip()
    feed = fetch_reviews(parent, access_token())
    save_feed(feed, ROOT / 'google-reviews.json')
    print(f"Synced {feed['data']['totalReviewCount']} Google reviews.")


if __name__ == '__main__':
    try:
        main()
    except (RuntimeError, ValueError) as error:
        print(str(error), file=sys.stderr)
        sys.exit(1)
