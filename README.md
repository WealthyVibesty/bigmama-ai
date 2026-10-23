# Big Mama AI (bigmamaai.com)

Autonomous cloud browser operator powered by cloud Chromium reached over CDP.

## Features
- **Autonomous Web Execution**: Scrapes websites, extracts data, and runs deep competitor audits.
- **Safety Gate 1**: Pre-run plan approval displaying steps, target domains, and estimated credit burn before anything touches the web.
- **Safety Gate 2**: Pauses mid-run whenever sensitive actions (e.g. external checkout, posting, forms) are encountered.
- **Zero Database Password Policy**: Ephemeral browser sessions with zero credentials stored.
- **Deliverables**: Executive summary, structured key-value findings, full-page viewport screenshots, and raw JSON export.
- **Ecosystem Bridge**: Connects directly into AI Brand App for converting extracted intel into 24 ad variations, Nano Banana creatives, and CRM pipelines.

## Stack
- React 18 + Vite + TypeScript
- Tailwind CSS + Lucide Icons + Sonner
- Supabase Edge Functions (`browser-task-runner`)
- Browserbase Cloud Chromium reached over CDP

## Development
```bash
bun install
bun run dev
```

## Production Build
```bash
bun run build
```
