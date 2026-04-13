import os
from datetime import datetime

import jwt
import requests
from supabase import create_client


TICKER_TAGS = {
    "GTCO",
    "ZENITHBANK",
    "ACCESSCORP",
    "MTNN",
    "DANGCEM",
    "SEPLAT",
    "UBA",
    "FBNH",
    "BUACEMENT",
    "AIRTELAFRI",
    "NB",
    "NESTLE",
    "PRESCO",
    "OKOMUOIL",
    "STANBIC",
    "WAPCO",
    "TRANSCORP",
    "BUAFOODS",
}


def env(name: str) -> str:
    value = os.environ.get(name, "").strip()
    if not value:
        raise RuntimeError(f"Missing required environment variable: {name}")
    return value


GHOST_URL = env("GHOST_URL").rstrip("/")
GHOST_ADMIN_API_KEY = env("GHOST_ADMIN_API_KEY")
SUPABASE_URL = env("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = env("SUPABASE_SERVICE_ROLE_KEY")


def ghost_token() -> str:
    key_id, secret = GHOST_ADMIN_API_KEY.split(":")
    now = int(datetime.utcnow().timestamp())
    return jwt.encode(
        {"iat": now, "exp": now + 300, "aud": "/admin/"},
        bytes.fromhex(secret),
        algorithm="HS256",
        headers={"kid": key_id},
    )


def detect_type_and_ticker(tags: list[dict]) -> tuple[str, str | None]:
    tag_slugs = [t.get("slug", "").lower() for t in tags]
    tag_names = [t.get("name", "").upper() for t in tags]

    post_type = "equity"
    if any(t in tag_slugs for t in ("currency", "fx")):
        post_type = "currency"
    elif any(t in tag_slugs for t in ("commodity", "commodities")):
        post_type = "commodity"
    elif any(t in tag_slugs for t in ("crypto", "cryptocurrency")):
        post_type = "crypto"
    elif any(t in tag_slugs for t in ("real-estate", "realestate")):
        post_type = "realestate"

    ticker = next((name for name in tag_names if name in TICKER_TAGS), None)
    return post_type, ticker


def fetch_all_posts() -> list[dict]:
    headers = {"Authorization": f"Ghost {ghost_token()}"}
    posts: list[dict] = []
    page = 1

    while True:
        response = requests.get(
            f"{GHOST_URL}/ghost/api/admin/posts/",
            headers=headers,
            params={
                "status": "published",
                "include": "tags",
                "limit": 50,
                "page": page,
                "fields": "id,title,slug,excerpt,custom_excerpt,published_at,visibility,feature_image",
            },
            timeout=20,
        )
        response.raise_for_status()
        payload = response.json()
        posts.extend(payload.get("posts", []))

        pagination = payload.get("meta", {}).get("pagination", {})
        if page >= pagination.get("pages", 1):
            break
        page += 1

    return posts


def sync_posts(posts: list[dict]) -> tuple[int, int]:
    client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    synced = 0
    errors = 0

    for post in posts:
        try:
            tags = post.get("tags", [])
            post_type, ticker = detect_type_and_ticker(tags)
            visibility = post.get("visibility", "paid")
            is_free = visibility in {"public", "members"}

            data = {
                "title": post["title"],
                "slug": post["slug"],
                "type": post_type,
                "excerpt": (post.get("custom_excerpt") or post.get("excerpt") or "")[:300],
                "ticker": ticker,
                "is_free": is_free,
                "published_at": post.get("published_at") or datetime.utcnow().isoformat(),
                "tags": [t.get("name", "") for t in tags],
            }

            existing = client.table("reports").select("id").eq("slug", post["slug"]).limit(1).execute()
            if existing.data:
                client.table("reports").update(data).eq("slug", post["slug"]).execute()
            else:
                client.table("reports").insert(data).execute()
            synced += 1
        except Exception as exc:
            print(f"warning: failed to sync '{post.get('title', '?')[:60]}': {exc}")
            errors += 1

    return synced, errors


def main() -> None:
    print("Ghost -> Supabase sync")
    print(datetime.utcnow().isoformat(timespec="minutes") + "Z")

    response = requests.get(
        f"{GHOST_URL}/ghost/api/admin/site/",
        headers={"Authorization": f"Ghost {ghost_token()}"},
        timeout=20,
    )
    response.raise_for_status()

    posts = fetch_all_posts()
    print(f"published_posts={len(posts)}")

    synced, errors = sync_posts(posts)
    print(f"synced={synced}")
    print(f"errors={errors}")

    if errors:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
