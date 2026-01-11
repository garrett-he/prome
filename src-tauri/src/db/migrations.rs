// src-tauri/src/db/migrations.rs
use sqlx::SqlitePool;

pub async fn run_migrations(pool: &SqlitePool) -> Result<(), sqlx::Error> {
    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS categories (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            name        TEXT    NOT NULL UNIQUE,
            color       TEXT,
            sort_order  INTEGER NOT NULL DEFAULT 0,
            created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
            updated_at  TEXT    NOT NULL DEFAULT (datetime('now'))
        );
        "#,
    )
    .execute(pool)
    .await?;

    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS tags (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            name        TEXT    NOT NULL UNIQUE,
            created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
        );
        "#,
    )
    .execute(pool)
    .await?;

    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS prompts (
            id           INTEGER PRIMARY KEY AUTOINCREMENT,
            title        TEXT    NOT NULL,
            content      TEXT    NOT NULL,
            description  TEXT    NOT NULL DEFAULT '',
            category_id  INTEGER REFERENCES categories(id) ON DELETE SET NULL,
            favorite     INTEGER NOT NULL DEFAULT 0,
            usage_count  INTEGER NOT NULL DEFAULT 0,
            created_at   TEXT    NOT NULL DEFAULT (datetime('now')),
            updated_at   TEXT    NOT NULL DEFAULT (datetime('now'))
        );
        "#,
    )
    .execute(pool)
    .await?;

    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS prompt_tags (
            prompt_id  INTEGER NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,
            tag_id     INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
            PRIMARY KEY (prompt_id, tag_id)
        );
        "#,
    )
    .execute(pool)
    .await?;

    sqlx::query("CREATE INDEX IF NOT EXISTS idx_prompts_category ON prompts(category_id)")
        .execute(pool)
        .await?;

    sqlx::query("CREATE INDEX IF NOT EXISTS idx_prompts_favorite ON prompts(favorite)")
        .execute(pool)
        .await?;

    sqlx::query("CREATE INDEX IF NOT EXISTS idx_prompts_updated ON prompts(updated_at)")
        .execute(pool)
        .await?;

    sqlx::query("CREATE INDEX IF NOT EXISTS idx_prompt_tags_tag ON prompt_tags(tag_id)")
        .execute(pool)
        .await?;

    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS prompt_attachments (
            id         INTEGER PRIMARY KEY AUTOINCREMENT,
            prompt_id  INTEGER NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,
            filename   TEXT    NOT NULL,
            mime_type  TEXT,
            size       INTEGER NOT NULL DEFAULT 0,
            data       BLOB    NOT NULL,
            created_at TEXT    NOT NULL DEFAULT (datetime('now'))
        );
        "#,
    )
    .execute(pool)
    .await?;

    sqlx::query("CREATE INDEX IF NOT EXISTS idx_prompt_attachments_prompt ON prompt_attachments(prompt_id)")
        .execute(pool)
        .await?;

    Ok(())
}

pub async fn seed_default_categories(pool: &SqlitePool) -> Result<(), sqlx::Error> {
    let defaults = vec![
        ("General", "#6b7280", 0i64),
        ("Writing", "#d97706", 1i64),
        ("Coding", "#4f46e5", 2i64),
        ("Conversation", "#16a34a", 3i64),
    ];
    for (name, color, sort_order) in defaults {
        sqlx::query("INSERT OR IGNORE INTO categories (name, color, sort_order) VALUES (?, ?, ?)")
            .bind(name)
            .bind(color)
            .bind(sort_order)
            .execute(pool)
            .await?;
    }
    Ok(())
}
