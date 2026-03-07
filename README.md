# 🪄 magic-need

> Capture tool/data needs from AI agents — let your agent spec your product for you.
Give your AI agent a tool that "does nothing" but lets it express what it's missing. The agent becomes a proxy for your best engineer and specs your integration roadmap for you.

## For OpenClaw Users

This CLI is included in the `magic-need` skill. Install via:

```bash
clawhub install magic-need
```

Then use: `node ~/.openclaw/skills/magic-need/scripts/cli.js "description"`

Skill repo: <https://github.com/guim4dev/skill-magic-need>

## For NPM Users

```bash
npm install -g magic-need
```

Or with npx (no install):
```bash
npx magic-need "API for recent deploys"
```

## Usage

### As an AI Agent

When you're executing a task and realize you need data or a tool you don't have:

```bash
magic-need "API of recent deploys for service X in the last 2 hours"
```

Or via code:
```javascript
const { execSync } = require('child_process');
execSync('magic-need "CPU metrics for upstream auth-service"');
```

### As a Human

```bash
# Register a need
magic-need "Need for Stripe webhook handling"

# List all needs
magic-need list

# Generate report (for cronjobs)
magic-need report

# Archive pending needs
magic-need clear
```

## Auto-categorization

Needs are automatically categorized based on description:

| Category | Triggers | Emoji |
|----------|----------|-------|
| `integration` | api, endpoint | 🔌 |
| `observability` | metric, log, monitor | 📊 |
| `devops` | deploy, pipeline, ci | 🚀 |
| `auth` | user, auth, login | 🔐 |
| `database` | database, db, query | 🗄️ |
| `storage` | file, storage, upload | 📁 |
| `general` | (default) | 📝 |

## Cronjob Example

Daily report at 10 PM:

```bash
# Add to crontab
crontab -e

# Add this line:
0 22 * * * /usr/local/bin/magic-need report | webhook-send https://discord.com/api/webhooks/...
```

Or with a Discord bot:
```javascript
const report = require('child_process').execSync('magic-need report').toString();
if (!report.includes('NO_REPORT')) {
  // send to Discord channel
}
```

## Data Storage

Needs are stored in `~/.magic-need/needs.json` (global install) or `./data/needs.json` (local dev).

Structure:
```json
[
  {
    "id": "j8ldlr",
    "description": "API de deploys recentes...",
    "createdAt": "2026-03-07T18:09:18.123Z",
    "status": "pending",
    "category": "integration"
  }
]
```

## Why?

> "The insight: your agent is a great proxy for your best on-call engineer. Give it a blank canvas to express what it's missing, and it'll spec your product for you." — Sonarly

Instead of guessing which integrations to build, let your AI agent tell you what it actually needs.

## License

MIT © Thiago Guimarães
