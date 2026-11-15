-- +goose Up
CREATE TABLE page_views (
    slug       text        PRIMARY KEY,
    views      bigint      NOT NULL DEFAULT 0,
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- +goose Down
DROP TABLE page_views;
