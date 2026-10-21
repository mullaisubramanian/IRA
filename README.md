# IRA · Intelligent Recruitment Assistant

IRA matches faculty members with colleges across Tamil Nadu. Faculty build one profile; institutions describe a vacancy in a chat; IRA ranks the best-fit, similar and "worth a look" profiles and helps schedule interviews.

## Run it

```bash
npm install
npm run dev       # opens on http://localhost:5173
npm run build     # production build into dist/
npm run preview   # serve the production build
```

Requires Node.js 18 or newer.

## Project structure

```
index.html                 Page shell: top bar, #app, #modal
public/favicon.svg
src/
  main.js                  Entry: loads styles, wires events, boots the app
  styles/                  base (colour tokens), topbar, landing, controls,
                           faculty, institution, overlays, responsive
  data/
    catalog.js             Districts by state, map coordinates, degrees,
                           institution types → departments → subjects, options
    questions.js           Personality bank: 5 scenarios × 4 answers, each
                           answer opens its own follow-up (25 questions)
    sampleFaculty.js       Demo faculty used for matching
  core/
    state.js               State, accounts, sessions, localStorage persistence
    ui.js                  Icons and form-control builders
  views/
    landing.js             Home page and IRA expansion
    auth.js                Sign up / log in, role blocking
    faculty.js             13-step faculty wizard and relocation map
    assessment.js          Branching assessment and radar chart
    facultyDone.js         "Profile is live" screen
    institution.js         Chat requirement builder and requirement panel
  logic/
    chatParser.js          Chatbot language parsing, department rules per
                           institution type
    matching.js            Scoring, tiers, candidate cards, interviews
  app/
    render.js              Router and account gate
    events.js              All click / input / change handlers
```

## Colour tokens

Defined in `src/styles/base.css`:

| Token | Value | Use |
|---|---|---|
| `--navy` | `#06393C` | Deep turquoise: top bar, sidebars, hero |
| `--indigo` | `#0C8F8B` | Turquoise: buttons, selected chips, links |
| `--indigo-2` | `#1CC3BD` | Bright turquoise: hover, highlights, IRA initials |
| `--marigold` | `#F2A93B` | Accent: current step, key calls to action |
| `--jade` | `#2F9E5E` | Match / success |
| `--coral` | `#E8604C` | Mismatch / errors |

(The variable names are kept from earlier versions; only the values changed.)

## Prototype limits

* Accounts, profiles and vacancies are saved in the browser's localStorage. Passwords use a demo hash. A production build needs a backend (for example Firebase or Supabase) with real authentication.
* Recorded voice and video intros live only in the current browser session.
* Email notifications, OTP verification and meeting links are shown in the UI but not sent.
