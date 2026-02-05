# Eldrun Eisenfeder

Eldrun is a **serverless** Discord bot that helps render Markdown.
Discord sends interaction webhooks to your Worker, and the Worker replies with messages/embeds.

---

## Prerequisites

- Node.js (latest LTS recommended)
- pnpm
- A Discord Application (Developer Portal)
- A Cloudflare account + Wrangler CLI

---

## Discord Setup (once)

1. Go to the Discord Developer Portal and create (or open) your Application.
2. In **General Information**, copy:
   - **Application ID**
   - **Public Key**
3. In **Bot**:
   - Create a bot (if you haven’t)
   - Reset/copy the **Bot Token**
4. Invite the bot to your server:
   - OAuth2 → URL Generator
   - Scopes: `bot`, `applications.commands`
   - Bot permissions: minimal is fine (you can start with “Send Messages”)
