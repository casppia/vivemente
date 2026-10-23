# Vivemente

An AI-assisted web app for learning Spanish, organised by CEFR level (A1–C2). It combines vocabulary by topic, verb conjugation drills, side-by-side grammar comparisons, text generation and correction, image description, speaking practice, and a podcast player, with OpenAI doing most of the explaining, generating and checking.

Built with React, TypeScript and Vite.

## Features

- **Dashboard** – an overview of recent activity and quick links into each section.
- **Topics by level** – pick a CEFR level, then a topic (places, food and drink, transport, clothing, weather and nature, celebrations, health, technology and more). Each topic has word lists with frequency filters, word analysis, tense descriptions and a personal saved-words list.
- **Study** – listen to Spanish text read aloud with a choice of voices.
- **Conjugation practice** – drills on the tenses that fit the selected level, with hover explanations for each tense.
- **Comparison drills** – AI-generated examples and exercises for the pairs learners mix up most:
  - Ser vs Estar
  - Preterite vs Imperfect
  - Para vs Por
  - Había / Estaba / Era / Tenía
  - Direct / indirect object pronouns
  - Reflexive vs non-reflexive verbs
- **Text generator** – generate Spanish texts, analyse them word by word (tense, meaning, translation tooltips), and upload an image to get a description of it at three proficiency levels.
- **Speaking and correction** – record yourself in the browser and get feedback on grammar, pronunciation and phrasing.
- **Podcast** – browse and play episodes of a Spanish-learning podcast via Spotify.
- **Favorites** – words you saved while studying.
- **Extras** – IPA transcription tuned for Mexican Spanish, a profanity filter on generated content, and dark mode.

## Tech stack

| Area | Tools |
| --- | --- |
| Framework | React 18, TypeScript, Vite 5 |
| Routing | React Router 6 |
| State | Zustand (progress, saved words and texts persist to `localStorage`) |
| Styling and UI | Tailwind CSS, Radix UI, Framer Motion, Lucide icons |
| AI | OpenAI API (GPT-3.5 Turbo for most features, GPT-4 for conjugation, GPT-4o for images) |
| Audio | Web Speech API, ElevenLabs text-to-speech, RecordRTC for recording |
| NLP | wink-nlp as a local fallback for text analysis |
| Validation | Zod |
| Integrations | Spotify Web API, Google and Facebook sign-in (UI only, see below) |

## Getting started

### Prerequisites

- Node.js 18 or newer
- An OpenAI API key (required for most features)
- Optional: an ElevenLabs API key for higher-quality voices, and a Spotify app for the podcast page

### Install and run

```bash
git clone https://github.com/casppia/vivemente.git
cd vivemente
npm install
npm run dev
```

### Environment variables

Create a `.env.local` file in the project root:

```bash
# Required
VITE_OPENAI_API_KEY=sk-...

# Optional: ElevenLabs voices (falls back to the browser's built-in voices)
VITE_ELEVENLABS_API_KEY=...

# Optional: Spotify podcast player
VITE_SPOTIFY_CLIENT_ID=...
VITE_REDIRECT_URI=http://localhost:5173/callback
```

`.env*.local` is already in `.gitignore`.

For Spotify, register an app in the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard) and add the same redirect URI there.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Build for production into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run typecheck` | Run the TypeScript compiler |
| `npm run lint` | Lint `src/` with ESLint |

## Project structure

```
src/
├── App.tsx              # Routes
├── main.tsx             # Entry point and OAuth providers
├── pages/               # Dashboard, topics, study, practice, podcast, generator, favorites, auth
├── components/          # Feature components (drills, analysers, players, recorders, tooltips)
├── store/               # Zustand stores (level, topics, words, texts, practice, Spotify)
├── utils/               # OpenAI client, ElevenLabs, Spotify, NLP, IPA, prompts
├── hooks/               # Speech synthesis and text-to-speech hooks
├── types/               # CEFR levels, tenses, topics, practice types
└── data/                # Vocabulary by topic, B1 verb list
```

The `app/`, root-level `hooks/`, `types/` and `utils/` folders and `app.json` / `app.config.js` are left over from the Expo template the project started from. The Vite web app does not use them.
