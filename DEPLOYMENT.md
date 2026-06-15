# TechCity Store — Cloud Deployment Guide

**Stack**: Supabase (Database) → Render (Backend API) → Netlify (Frontend)

---

## 1. Supabase — Set Up Cloud Database

1. Go to [supabase.com](https://supabase.com) and create a new project.
2. Note your **database password** — you'll need it later.
3. Once the project is ready, open the **SQL Editor**.
4. Paste the contents of `supabase_schema.sql` and click **Run** — this creates all 4 tables and indexes.

### Get Your Connection String

1. Go to **Settings → Database → Connection string**.
2. Select **Transaction pooler** (port `6543`) — this is what Render needs.
3. Copy the URI and replace `[YOUR-PASSWORD]` with your database password.

It will look like:

```
postgresql://postgres.abcdef123456:YourPassword@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

---

## 2. Migrate Local Data to Supabase

Export your local `techcity_db` data:

```bash
pg_dump -U postgres -d techcity_db --data-only --inserts --column-inserts -f techcity_data_dump.sql
```

Then go to **Supabase SQL Editor** and paste + run the exported SQL to import your products, users, orders, etc.

> **Note**: After importing, reset the serial sequences so new inserts don't collide:
>
> ```sql
> SELECT setval('users_id_seq', (SELECT COALESCE(MAX(id), 0) FROM users));
> SELECT setval('products_id_seq', (SELECT COALESCE(MAX(id), 0) FROM products));
> SELECT setval('orders_id_seq', (SELECT COALESCE(MAX(id), 0) FROM orders));
> SELECT setval('order_items_id_seq', (SELECT COALESCE(MAX(id), 0) FROM order_items));
> ```

---

## 3. Render — Deploy the Backend

1. Go to [render.com](https://render.com) and create a **New Web Service**.
2. Connect your GitHub repo: `TheeMuller007/techcity-store`.
3. Configure:

| Setting | Value |
|---|---|
| **Branch** | `main` |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Plan** | Free |

4. Set these **Environment Variables** in the Render dashboard:

| Variable | Value |
|---|---|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | Your Supabase pooler connection string (from step 1) |
| `JWT_SECRET` | A strong random secret |

5. Click **Deploy** and wait for it to build.

### Verify

Once deployed, visit:

```
https://YOUR-SERVICE.onrender.com/api/health
```

You should see:

```json
{ "status": "ok", "db": "connected" }
```

---

## 4. Netlify — Frontend

`netlify.toml` proxies `/api/*` requests to your Render backend.

If your Render service URL changes, update:
- `netlify.toml` — the redirect `to` URL
- `public/scripts/config.js` — the `API_BASE` URL

---

## 5. Local Development

```bash
# Copy and fill in your environment variables
cp .env.example .env

# Install dependencies
npm install

# Create tables (if using local Postgres)
npm run setup-db

# Start the server
npm start
```

Visit `http://localhost:5000/api/health` to verify.
