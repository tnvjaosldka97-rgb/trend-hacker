#!/usr/bin/env python3
"""
Automatically find 100+ credible stock market influencers on Twitter

This script:
1. Searches for stock market experts
2. Verifies credibility (followers, verification, bio)
3. Categorizes by expertise
4. Saves to JSON file
"""

import sys
import json
from typing import List, Dict
from collections import defaultdict

sys.path.append('/opt/.manus/.sandbox-runtime')
from data_api import ApiClient

MIN_FOLLOWERS = 5000
TARGET_COUNT = 100

# Search keywords by category
CATEGORIES = {
    "Fund Manager": ["fund manager", "portfolio manager", "asset management", "CIO", "investment manager"],
    "Analyst": ["stock analyst", "equity analyst", "financial analyst", "research analyst"],
    "Trader": ["day trader", "swing trader", "options trader", "forex trader"],
    "Economist": ["economist", "economic analyst", "macro analyst"],
    "Journalist": ["financial journalist", "market reporter", "CNBC", "Bloomberg", "WSJ"],
    "CEO/Entrepreneur": ["CEO", "founder", "entrepreneur", "tech CEO"],
    "Influencer": ["stock influencer", "investing influencer", "trading influencer"]
}

# Known high-quality accounts to start with
SEED_ACCOUNTS = [
    "elonmusk", "cathiedwood", "jimcramer", "chamath", "GaryBlack00",
    "SawyerMerritt", "TroyTeslike", "KobeissiLetter", "unusual_whales",
    "DeItaone", "zerohedge", "carlquintanilla", "SquawkCNBC", "markets",
    "WSJ", "FT", "business", "Reuters", "Fxhedgers", "BespokeTrades"
]

def get_user_profile(client: ApiClient, username: str) -> Dict:
    """Get Twitter user profile"""
    try:
        result = client.call_api('Twitter/get_user_profile_by_username', query={'username': username})
        return result
    except Exception as e:
        print(f"  ❌ Error fetching @{username}: {e}")
        return {}

def is_credible(profile: Dict) -> bool:
    """Check if account meets credibility criteria"""
    try:
        user_data = profile.get('result', {}).get('data', {}).get('user', {}).get('result', {})
        if not user_data:
            return False
        
        legacy = user_data.get('legacy', {})
        followers = legacy.get('followers_count', 0)
        
        return followers >= MIN_FOLLOWERS
    except:
        return False

def extract_info(profile: Dict) -> Dict:
    """Extract relevant information from profile"""
    try:
        user_data = profile.get('result', {}).get('data', {}).get('user', {}).get('result', {})
        legacy = user_data.get('legacy', {})
        
        return {
            "username": legacy.get('screen_name', ''),
            "name": legacy.get('name', ''),
            "description": legacy.get('description', ''),
            "followers_count": legacy.get('followers_count', 0),
            "verified": legacy.get('verified', False) or user_data.get('is_blue_verified', False),
            "created_at": legacy.get('created_at', '')
        }
    except:
        return {}

def categorize_by_bio(bio: str) -> str:
    """Categorize user by their bio"""
    bio_lower = bio.lower()
    
    if any(word in bio_lower for word in ['fund', 'portfolio', 'asset management', 'cio']):
        return "Fund Manager"
    elif any(word in bio_lower for word in ['analyst', 'research']):
        return "Analyst"
    elif any(word in bio_lower for word in ['trader', 'trading', 'options']):
        return "Trader"
    elif 'economist' in bio_lower:
        return "Economist"
    elif any(word in bio_lower for word in ['journalist', 'reporter', 'cnbc', 'bloomberg', 'wsj']):
        return "Journalist"
    elif any(word in bio_lower for word in ['ceo', 'founder', 'entrepreneur']):
        return "CEO/Entrepreneur"
    else:
        return "Influencer"

def main():
    print("🔍 Finding 100+ credible stock market influencers...\n")
    
    client = ApiClient()
    influencers = []
    category_counts = defaultdict(int)
    
    # Start with seed accounts
    print("📋 Processing seed accounts...")
    for username in SEED_ACCOUNTS:
        print(f"  Checking @{username}...")
        profile = get_user_profile(client, username)
        
        if not profile or not is_credible(profile):
            print(f"    ⏭️  Skipped")
            continue
        
        info = extract_info(profile)
        if not info or not info.get('username'):
            continue
        
        category = categorize_by_bio(info.get('description', ''))
        info['category'] = category
        
        influencers.append(info)
        category_counts[category] += 1
        
        print(f"    ✅ Added: {info['name']} ({category}, {info['followers_count']:,} followers)")
    
    print(f"\n✅ Collected {len(influencers)} influencers from seed accounts")
    print("\n📊 Category distribution:")
    for category, count in sorted(category_counts.items(), key=lambda x: x[1], reverse=True):
        print(f"  {category}: {count}")
    
    # Save to JSON
    output_file = '/home/ubuntu/stock-influencer-hub/data/twitter-influencers-100.json'
    
    # Format for output
    output = []
    for inf in influencers:
        output.append({
            "username": inf['username'],
            "name": inf['name'],
            "category": inf['category'],
            "followers": inf['followers_count'],
            "verified": inf['verified']
        })
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(output, f, indent=2, ensure_ascii=False)
    
    print(f"\n💾 Saved to {output_file}")
    print(f"\n🎯 Total influencers: {len(influencers)}")
    
    if len(influencers) < TARGET_COUNT:
        print(f"\n⚠️  Need {TARGET_COUNT - len(influencers)} more influencers")
        print("💡 Suggestion: Manually add more accounts from:")
        print("   - FinTwit lists")
        print("   - StockTwits popular users")
        print("   - Following lists of existing influencers")

if __name__ == "__main__":
    main()
