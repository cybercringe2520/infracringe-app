-- name: GetViews :one
SELECT views FROM page_views WHERE slug = $1;

-- name: IncrementViews :one
INSERT INTO page_views (slug, views)
VALUES ($1, 1)
ON CONFLICT (slug) DO UPDATE
SET views = page_views.views + 1,
    updated_at = now()
RETURNING views;
