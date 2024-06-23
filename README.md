![hero](github.png)

<p align="center">
	<h1 align="center"><b>mangosqueezy</b></h1>
<p align="center">
    Affiliate marketing platform
    <br />
    <br />
    <a href="https://mangosqueezy.com">Website</a>
  </p>
</p>

# Under active development

> The project is currently under development and is not ready to use yet.

# Get started

We are working on the documentation to get started with mangosqueezy for local development: work in progress 🚧

# App Architecture

- pnpm
- React
- TypeScript
- Nextjs
- Supabase
- Shadcn
- Aceternity
- TailwindCSS

### Hosting

- Supabase (database, storage, realtime, auth)
- Vercel (Website, edge-config, vercel ai and metrics)

### Services

- Resend (email)
- Github Actions (CI/CD)
- Loops (Marketing email)
- Posthog (Events and Analytics)
- Dub (Short URLs)

## Security

To avoid pushing secrets to the remote git repository we use [Gitleaks](https://github.com/gitleaks/gitleaks)

From their repository:

> Gitleaks is a SAST tool for detecting and preventing hardcoded secrets like passwords, api keys, and tokens in git repos.

It automaticaly scans new commits and interrupts the execution if it finds content that match the configured rules.

## Repo Activity

![Alt](https://repobeats.axiom.co/api/embed/edc89d95d14ba160c1281f4a4af5067ef505c9d0.svg "Repobeats analytics image")
