// Generates every image used in the profile README as plain SVG files in ./assets.
// No third-party image services: the README only points at files in this repo.
//
//   node scripts/generate-cards.mjs static        -> banner + tech stack (no network)
//   node scripts/generate-cards.mjs stats         -> GitHub stats, streak, languages (needs GITHUB_TOKEN)
//   node scripts/generate-cards.mjs all           -> both
//   node scripts/generate-cards.mjs stats --mock  -> stats cards from sample data (for previews)

import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = join(ROOT, 'assets')
const LOGIN = process.env.PROFILE_LOGIN || 'ahmetbolukoglu'

const THEME = {
  bg: '#1a1b27',
  border: '#2a2d3e',
  title: '#70a5fd',
  text: '#c0caf5',
  muted: '#7f88b0',
  accent: '#00b4d8',
  accent2: '#bf91f3',
  pillBg: '#03142b',
  pillText: '#d8f3ff',
}
const FONT = "'Segoe UI', Ubuntu, 'Helvetica Neue', Arial, sans-serif"

const esc = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

// Rough text width for layout (system fonts, so this is an estimate with headroom).
const textWidth = (s, size, bold = false) => {
  let w = 0
  for (const ch of String(s)) {
    if ('ilI.,:;|!\''.includes(ch)) w += 0.3
    else if ('mwMW@%'.includes(ch)) w += 0.85
    else if (ch === ' ') w += 0.3
    else if (/[A-Z0-9#]/.test(ch)) w += 0.66
    else w += 0.56
  }
  return w * size * (bold ? 1.06 : 1)
}

const fmt = (n) => Number(n).toLocaleString('en-US')

function card(width, height, body, label) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${esc(label)}">
<title>${esc(label)}</title>
<rect x="0.5" y="0.5" width="${width - 1}" height="${height - 1}" rx="10" fill="${THEME.bg}" stroke="${THEME.border}"/>
${body}
</svg>
`
}

// ---------------------------------------------------------------- banner

export function bannerSvg() {
  const w = 1200
  const h = 200
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="Ahmet BÖLÜKOĞLU, Senior Software Engineer">
<title>Ahmet BÖLÜKOĞLU, Senior Software Engineer</title>
<defs>
  <linearGradient id="g" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="#03142b"/>
    <stop offset="1" stop-color="#00b4d8"/>
  </linearGradient>
</defs>
<path d="M0 0H${w}V140C1050 185 900 110 750 140S450 195 300 150S90 120 0 150Z" fill="url(#g)"/>
<path d="M0 165C140 140 260 190 420 168S700 130 860 162S1080 190 ${w} 160V${h}H0Z" fill="url(#g)" opacity="0.35"/>
<text x="600" y="88" text-anchor="middle" font-family="${FONT}" font-size="48" font-weight="700" fill="#d8f3ff">Ahmet BÖLÜKOĞLU</text>
<text x="600" y="126" text-anchor="middle" font-family="${FONT}" font-size="20" fill="#d8f3ff" opacity="0.9">Senior Software Engineer · Backend &amp; Microservices</text>
</svg>
`
}

// ---------------------------------------------------------------- tech stack

const STACK = [
  ['Backend', ['.NET Core', 'C#', 'ASP.NET Web API', 'Microservices', 'gRPC / RPC', 'FastEndpoints', 'Event Bus (Pub/Sub)', 'Node.js', 'Python', 'MQTT']],
  ['Data & cloud', ['SQL Server', 'PostgreSQL', 'Redis', 'Entity Framework', 'Dapper', 'Supabase', 'Edge Functions', 'Amazon S3', 'Vercel', 'Firebase Hosting']],
  ['Game development', ['Godot 4', 'GDScript', 'Unity', 'PixiJS', 'Three.js', 'React Three Fiber', 'HTML5 Canvas', 'Custom shaders', 'Steamworks', 'Blender Python API', 'Howler.js', 'Localization (i18n)']],
  ['DevOps & quality', ['Azure DevOps', 'GitHub Actions', 'Docker', 'Git', 'Grafana', 'Prometheus', 'k6', 'Vitest', 'ESLint', 'Husky']],
  ['Frontend & desktop', ['TypeScript', 'JavaScript', 'React', 'Next.js', 'Angular', 'Blazor', 'Vite', 'Zustand', 'Tailwind CSS', 'Electron']],
  ['AI-assisted development', ['Claude Code', 'Google Antigravity', 'Cursor', 'GitHub Copilot', 'MCP', 'Gemini API', 'llama.cpp (local LLMs)', 'Playwright', 'Prompt engineering']],
]

export function techStackSvg() {
  const width = 1000
  const padX = 28
  const labelW = 230
  const pillH = 30
  const gap = 8
  const size = 14
  const rows = []
  let y = 34

  for (const [group, items] of STACK) {
    let x = padX + labelW
    let rowY = y
    const pills = []
    for (const item of items) {
      const w = Math.ceil(textWidth(item, size, true) + 28)
      if (x + w > width - padX) {
        x = padX + labelW
        rowY += pillH + gap
      }
      pills.push(`<rect x="${x}" y="${rowY}" width="${w}" height="${pillH}" rx="15" fill="${THEME.pillBg}" stroke="${THEME.accent}" stroke-opacity="0.6"/>` +
        `<text x="${x + w / 2}" y="${rowY + 20}" text-anchor="middle" font-family="${FONT}" font-size="${size}" font-weight="600" fill="${THEME.pillText}">${esc(item)}</text>`)
      x += w + gap
    }
    rows.push(`<text x="${padX}" y="${y + 20}" font-family="${FONT}" font-size="15" font-weight="700" fill="${THEME.title}">${esc(group)}</text>`)
    rows.push(...pills)
    y = rowY + pillH + 18
  }

  return card(width, y + 12, rows.join('\n'), 'Tech stack')
}

// ---------------------------------------------------------------- GitHub data

async function gql(query, variables, token) {
  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: { Authorization: `bearer ${token}`, 'Content-Type': 'application/json', 'User-Agent': 'profile-cards' },
    body: JSON.stringify({ query, variables }),
  })
  const json = await res.json()
  if (!res.ok || json.errors) {
    throw new Error(`GitHub API error (${res.status}): ${JSON.stringify(json.errors || json)}`)
  }
  return json.data
}

export async function fetchStats(login, token) {
  const repos = []
  let after = null
  let user
  do {
    const data = await gql(`query($login:String!, $after:String) {
      user(login:$login) {
        createdAt
        followers { totalCount }
        pullRequests { totalCount }
        issues { totalCount }
        contributionsCollection { contributionYears }
        allPublic: repositories(ownerAffiliations: OWNER, privacy: PUBLIC) { totalCount }
        repositories(ownerAffiliations: OWNER, privacy: PUBLIC, isFork: false, first: 100, after: $after) {
          totalCount
          pageInfo { hasNextPage endCursor }
          nodes {
            stargazerCount
            languages(first: 10, orderBy: { field: SIZE, direction: DESC }) {
              edges { size node { name color } }
            }
          }
        }
      }
    }`, { login, after }, token)
    user = data.user
    repos.push(...user.repositories.nodes)
    after = user.repositories.pageInfo.hasNextPage ? user.repositories.pageInfo.endCursor : null
  } while (after)

  const years = [...user.contributionsCollection.contributionYears].sort()
  const days = []
  let totalContributions = 0
  let totalCommits = 0
  let lastYearContributions = 0
  const currentYear = String(new Date().getUTCFullYear())
  for (const year of years) {
    const from = `${year}-01-01T00:00:00Z`
    const to = `${year}-12-31T23:59:59Z`
    const data = await gql(`query($login:String!, $from:DateTime!, $to:DateTime!) {
      user(login:$login) {
        contributionsCollection(from:$from, to:$to) {
          totalCommitContributions
          restrictedContributionsCount
          contributionCalendar {
            totalContributions
            weeks { contributionDays { date contributionCount } }
          }
        }
      }
    }`, { login, from, to }, token)
    const c = data.user.contributionsCollection
    totalContributions += c.contributionCalendar.totalContributions
    if (String(year) === currentYear) lastYearContributions = c.contributionCalendar.totalContributions
    totalCommits += c.totalCommitContributions + c.restrictedContributionsCount
    for (const w of c.contributionCalendar.weeks) days.push(...w.contributionDays)
  }

  const languages = new Map()
  for (const r of repos) {
    for (const e of r.languages.edges) {
      const prev = languages.get(e.node.name) || { size: 0, color: e.node.color }
      prev.size += e.size
      languages.set(e.node.name, prev)
    }
  }

  return {
    login,
    stars: repos.reduce((a, r) => a + r.stargazerCount, 0),
    // Same number the profile page shows (forks included); stars and
    // languages below only count the user's own, non-fork repositories.
    publicRepos: user.allPublic.totalCount,
    contributionsThisYear: lastYearContributions,
    currentYear,
    activeYears: years.length,
    followers: user.followers.totalCount,
    pullRequests: user.pullRequests.totalCount,
    issues: user.issues.totalCount,
    totalCommits,
    totalContributions,
    firstYear: years[0],
    days,
    languages: [...languages.entries()].map(([name, v]) => ({ name, ...v })),
  }
}

// ---------------------------------------------------------------- streaks

export function computeStreaks(days, today = new Date().toISOString().slice(0, 10)) {
  const counts = new Map()
  for (const d of days) {
    if (d.date <= today) counts.set(d.date, (counts.get(d.date) || 0) + d.contributionCount)
  }
  const dates = [...counts.keys()].sort()

  let longest = { length: 0, start: null, end: null }
  let run = { length: 0, start: null }
  for (const date of dates) {
    if (counts.get(date) > 0) {
      if (run.length === 0) run.start = date
      run.length += 1
      if (run.length > longest.length) longest = { length: run.length, start: run.start, end: date }
    } else {
      run = { length: 0, start: null }
    }
  }

  // Current streak: count back from today; a quiet "today" does not break it yet.
  let current = { length: 0, start: null, end: null }
  let i = dates.length - 1
  if (i >= 0 && dates[i] === today && counts.get(today) === 0) i -= 1
  for (; i >= 0 && counts.get(dates[i]) > 0; i -= 1) {
    current = { length: current.length + 1, start: dates[i], end: current.end || dates[i] }
  }
  return { current, longest }
}

const shortDate = (iso) => {
  if (!iso) return ''
  const d = new Date(`${iso}T00:00:00Z`)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })
}
const range = (s) => (s.length ? `${shortDate(s.start)} – ${shortDate(s.end)}` : 'No active streak')

// ---------------------------------------------------------------- stat cards

function statsBody(s, ox = 0, width = 495) {
  // Show the first six figures that are not zero, so the card never
  // advertises empty numbers; the card keeps a fixed height either way.
  const rows = [
    ['Total commits', s.totalCommits],
    [`Contributions in ${s.currentYear}`, s.contributionsThisYear],
    ['Public repositories', s.publicRepos],
    ['Total stars', s.stars],
    ['Pull requests', s.pullRequests],
    ['Issues', s.issues],
    ['Years active on GitHub', s.activeYears],
    ['Followers', s.followers],
  ].filter(([, value]) => Number(value) > 0).slice(0, 6)
  const body = [`<text x="${ox + 25}" y="36" font-family="${FONT}" font-size="18" font-weight="700" fill="${THEME.title}">GitHub stats</text>`]
  rows.forEach(([label, value], i) => {
    const y = 72 + i * 25
    body.push(`<circle cx="${ox + 31}" cy="${y - 5}" r="4" fill="${THEME.accent}"/>`)
    body.push(`<text x="${ox + 45}" y="${y}" font-family="${FONT}" font-size="14" fill="${THEME.text}">${esc(label)}</text>`)
    body.push(`<text x="${ox + width - 25}" y="${y}" text-anchor="end" font-family="${FONT}" font-size="14" font-weight="700" fill="${THEME.text}">${fmt(value)}</text>`)
  })
  return body.join('\n')
}

const STAT_CARD_HEIGHT = 72 + 6 * 25

function streakBody(s, today, ox = 0, width = 495) {
  const height = STAT_CARD_HEIGHT
  const { current, longest } = computeStreaks(s.days, today)
  const col = width / 3
  const block = (x, value, label, sub, color) => [
    `<text x="${x}" y="98" text-anchor="middle" font-family="${FONT}" font-size="28" font-weight="700" fill="${color}">${fmt(value)}</text>`,
    `<text x="${x}" y="150" text-anchor="middle" font-family="${FONT}" font-size="14" font-weight="600" fill="${THEME.text}">${esc(label)}</text>`,
    `<text x="${x}" y="174" text-anchor="middle" font-family="${FONT}" font-size="11" fill="${THEME.muted}">${esc(sub)}</text>`,
  ].join('\n')
  const body = [
    block(ox + col / 2, s.totalContributions, 'Total contributions', `Since ${s.firstYear}`, THEME.title),
    `<line x1="${ox + col}" y1="40" x2="${ox + col}" y2="${height - 40}" stroke="${THEME.border}"/>`,
    `<circle cx="${ox + col * 1.5}" cy="88" r="34" fill="none" stroke="${THEME.accent2}" stroke-width="4"/>`,
    block(ox + col * 1.5, current.length, 'Current streak', range(current), THEME.accent2),
    `<line x1="${ox + col * 2}" y1="40" x2="${ox + col * 2}" y2="${height - 40}" stroke="${THEME.border}"/>`,
    block(ox + col * 2.5, longest.length, 'Longest streak', range(longest), THEME.title),
  ]
  return body.join('\n')
}

// Stats and streak in one 1000px card, so it lines up with the other full-width cards.
export function overviewSvg(s, today) {
  const width = 1000
  const half = width / 2
  const body = [
    statsBody(s, 0, half),
    `<line x1="${half}" y1="24" x2="${half}" y2="${STAT_CARD_HEIGHT - 24}" stroke="${THEME.border}"/>`,
    streakBody(s, today, half, half),
  ]
  return card(width, STAT_CARD_HEIGHT, body.join('\n'), `GitHub stats and contribution streak for ${s.login}`)
}

export function languagesSvg(s, count = 10) {
  const width = 1000
  const total = s.languages.reduce((a, l) => a + l.size, 0)
  const sorted = [...s.languages].sort((a, b) => b.size - a.size)
  const top = sorted.slice(0, count)
  const rest = sorted.slice(count).reduce((a, l) => a + l.size, 0)
  if (rest > 0) top.push({ name: 'Other', size: rest, color: '#565f89' })

  const body = [`<text x="25" y="36" font-family="${FONT}" font-size="18" font-weight="700" fill="${THEME.title}">Most used languages</text>`]
  if (total === 0) {
    body.push(`<text x="25" y="80" font-family="${FONT}" font-size="14" fill="${THEME.muted}">No public code yet</text>`)
    return card(width, 110, body.join('\n'), 'Most used languages')
  }

  const barX = 25
  const barW = width - 50
  body.push(`<clipPath id="bar"><rect x="${barX}" y="54" width="${barW}" height="10" rx="5"/></clipPath>`)
  let x = barX
  const segs = []
  for (const l of top) {
    const w = (l.size / total) * barW
    segs.push(`<rect x="${x.toFixed(2)}" y="54" width="${Math.max(w, 0.5).toFixed(2)}" height="10" fill="${l.color || '#565f89'}"/>`)
    x += w
  }
  body.push(`<g clip-path="url(#bar)">${segs.join('')}</g>`)

  const perRow = 4
  const colW = (width - 50) / perRow
  top.forEach((l, i) => {
    const cx = 25 + (i % perRow) * colW
    const cy = 92 + Math.floor(i / perRow) * 26
    const pct = ((l.size / total) * 100).toFixed(1)
    body.push(`<circle cx="${cx + 6}" cy="${cy - 5}" r="6" fill="${l.color || '#565f89'}"/>`)
    body.push(`<text x="${cx + 18}" y="${cy}" font-family="${FONT}" font-size="14" fill="${THEME.text}">${esc(l.name)} <tspan fill="${THEME.muted}">${pct}%</tspan></text>`)
  })
  const rows = Math.ceil(top.length / perRow)
  return card(width, 92 + rows * 26, body.join('\n'), 'Most used languages')
}

// ---------------------------------------------------------------- main

function mockStats() {
  const days = []
  const start = new Date('2026-01-01T00:00:00Z')
  for (let i = 0; i < 304; i += 1) {
    const d = new Date(start.getTime() + i * 86400000)
    const date = d.toISOString().slice(0, 10)
    days.push({ date, contributionCount: i > 282 ? 3 : (i % 7 === 0 ? 0 : 1) })
  }
  return {
    login: LOGIN, stars: 12, publicRepos: 26, followers: 2, pullRequests: 0, issues: 0,
    contributionsThisYear: 300, currentYear: '2026', activeYears: 8,
    totalCommits: 980, totalContributions: 1040, firstYear: 2019, days,
    languages: [
      { name: 'JavaScript', size: 500000, color: '#f1e05a' },
      { name: 'C#', size: 300000, color: '#178600' },
      { name: 'CSS', size: 120000, color: '#663399' },
      { name: 'HTML', size: 90000, color: '#e34c26' },
      { name: 'TypeScript', size: 40000, color: '#3178c6' },
      { name: 'Python', size: 10000, color: '#3572A5' },
    ],
  }
}

function write(name, svg) {
  mkdirSync(OUT, { recursive: true })
  writeFileSync(join(OUT, name), svg)
  console.log(`wrote assets/${name}`)
}

async function main() {
  const mode = process.argv[2] || 'all'
  const mock = process.argv.includes('--mock')

  if (mode === 'static' || mode === 'all') {
    write('banner.svg', bannerSvg())
    write('tech-stack.svg', techStackSvg())
  }
  if (mode === 'stats' || mode === 'all') {
    let stats
    if (mock) {
      stats = mockStats()
    } else {
      const token = process.env.GITHUB_TOKEN
      if (!token) throw new Error('GITHUB_TOKEN is required for stats')
      stats = await fetchStats(LOGIN, token)
    }
    write('overview.svg', overviewSvg(stats, mock ? '2026-10-31' : undefined))
    write('languages.svg', languagesSvg(stats))
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error(err)
    process.exit(1)
  })
}
