# ShopMasti Backend

## Setup
1. `npm install`
2. Copy `.env.example` to `.env` and fill in your PostgreSQL credentials
3. `npx prisma migrate dev` — run DB migrations
4. `npm run dev` — starts on port 5000

## First-time seed (create admin user)
Run this SQL or use a Prisma seed script:
```sql
-- Insert roles if not present
INSERT INTO "Role" (name) VALUES ('Admin'), ('User') ON CONFLICT DO NOTHING;
```
Then register a user normally, and manually set `role_id = 1` in the DB for that user.
