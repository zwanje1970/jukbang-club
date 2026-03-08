# Supabase 테이블 구조

## tournaments

| 컬럼           | 타입    | 비고                |
|----------------|---------|---------------------|
| id             | bigint  | primary key         |
| name           | text    |                     |
| date           | date    |                     |
| average_limit  | integer |                     |
| description    | text    |                     |

## venues

| 컬럼       | 타입   | 비고        |
|------------|--------|-------------|
| id         | bigint | primary key |
| name       | text   |             |
| address    | text   |             |
| description| text   |             |

## players

| 컬럼  | 타입   | 비고        |
|-------|--------|-------------|
| id    | bigint | primary key |
| name  | text   |             |
| average | integer |           |

## results

| 컬럼         | 타입   | 비고        |
|--------------|--------|-------------|
| id           | bigint | primary key |
| tournament_id| bigint |             |
| player_id    | bigint |             |
| rank         | integer|             |
