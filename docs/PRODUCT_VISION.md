# Product Vision

A complete digital ashram that guides a practitioner from preparation, through daily sadhana, into lifelong spiritual growth — without distractions, gamification, or commercialization.

This is what distinguishes the app from meditation apps like Calm or Headspace. It should not just help people relax; it should become a trusted companion for a serious, long-term spiritual practice. See [APP_PHILOSOPHY.md](APP_PHILOSOPHY.md) for the tone this must hold at every phase.

Ratings (⭐ 1–5) reflect how essential each feature is to that mission, not build order within a phase.

## Phase 1 — Core Meditation Experience (current focus)

**1. Sacred Opening Ritual** ⭐⭐⭐⭐⭐
Every new session begins with the invocation:

> ॐ असतो मा सद्गमय । तमसो मा ज्योतिर्गमय । मृत्योर्मा अमृतं गमय । ॐ शान्तिः शान्तिः शान्तिः ॥

Flow: Open Session → Opening Mantra Screen → Recorded Chant → 2–3 sec Silence → Soft Bell → Practice Name Announcement → Practice Begins.

Settings: enable/disable opening mantra; Sanskrit only, or Sanskrit + translation.

**2. Perfect Transition Engine** ⭐⭐⭐⭐⭐
Every practice transition should be identical: Practice Ends → Bell → Silence → Voice ("Swadhisthana Chakra") → Ambient Fade → Practice Starts. No skipped bells, no broken narration.

**3. Journey Timeline** ⭐⭐⭐⭐⭐
Replace Previous/Next with a visible journey: Grounding ✓ · Muladhara ✓ · Swadhisthana ▶ · Manipura ○ · Anahata ○ · Vishuddhi ○ · Ajna ○ · Sahasrara ○ · Integration ○. Allows revisiting completed practices.

**4. Better Spatial UX** ⭐⭐⭐⭐⭐
More breathing room, softer cards, fewer borders, better typography, native mobile feel, sacred aesthetics.

> **Current state:** items 2–4 touch the same session/audio state machine (`src/screens/ActiveScreen/`). That component was a single 1268-line file as of this writing — now split into `useSessionPlayback` (timer/audio/transition logic) plus focused presentational pieces. Build the opening ritual and transition engine against that structure rather than back into one file.

## Phase 2 — Personal Sadhana

**5. User Account** ⭐⭐⭐⭐⭐
Profile contains: name, practice history, preferred language, preferred voice, reminder time, practice duration, theme, settings. Eventually backed by Supabase Auth.

> **Current state:** the Supabase schema for this already exists and is migrated (`profiles`, RLS policies, `daily_completions`, `admin_settings` — see `supabase/migrations/`), and `AuthScreen.tsx` already has the login/register UI. `src/lib/authContext.tsx` is currently a stub that always returns "Authentication is disabled in local mode." This phase is mostly about wiring the existing UI to the existing backend and migrating local-storage trackers (`backupStore`, `reminderStore`, `practiceMetaStore`) to sync with `daily_completions` — not a from-scratch build. Worth deciding explicitly whether cloud accounts fit the "private sacred practice space" framing in APP_PHILOSOPHY.md before flipping this on.

**6. Personal Practice Time** ⭐⭐⭐⭐☆
Reframe "Reminder 6 AM" as "My Sacred Practice Time." Options: Dawn, Sunrise, Morning, Evening, Custom. Notification copy: "Your Sadhana Awaits."

**7. Real Sadhana Calendar** ⭐⭐⭐⭐⭐
Replace the fixed 28-day tracker with month/year view: practice history, missed days, practice duration, streak, total hours, monthly reflection.

**8. Spiritual Progress** ⭐⭐⭐⭐⭐
Not gamification — reflective language instead of badges, e.g. "This month: practised 23 days · 18h total · 11-day longest streak · 17 morning / 6 evening sessions," closing with a reflection like "Your consistency has improved over the last three weeks."

> Every metric here should pass one test: does displaying this number create anxiety about missing a day? If yes, reframe or cut it — this is the item most likely to drift into gamification under implementation pressure despite the explicit intent not to.

## Phase 3 — Knowledge Library

**9. Chakra Guide** ⭐⭐⭐⭐⭐
Per chakra: meaning, element, color, seed mantra, psychological qualities, physical association, signs of imbalance, practice guidance.

> **Current state:** `src/data/chakraInfo.ts` already carries `bijaMantra`, `element`, `color`, `spiritualMeaning`, and `spiritualBenefits` per chakra. This phase is largely "build a screen over data that already exists."

**10. Yoga Preparation** ⭐⭐⭐⭐⭐
4–5 preparation asanas per chakra, each with illustration, duration, benefits, common mistakes, contraindications.

**11. Mudra Library** ⭐⭐⭐⭐⭐
Per mudra: image, meaning, benefits, associated chakra, practice duration, daily uses.

**12. Diet Guide** ⭐⭐⭐⭐☆
Not meal plans — topics: sattvic / rajasic / tamasic food, hydration, fasting, alcohol, sleep, food before meditation.

**13. Practice Preparation** ⭐⭐⭐⭐⭐
Before Meditation checklist: empty stomach, water, time, clothing, room, lighting, direction to face, cushion, silence.

## Phase 4 — Daily Companion

**14. Gentle Reflections** ⭐⭐⭐⭐⭐
Not achievements — observations, e.g. "You maintained your practice for seven consecutive days," "You have mostly practised in the evening this week," "Morning sessions may deepen concentration."

**15. Quotes & Wisdom** ⭐⭐⭐⭐☆
One thought per day, drawn from the Upanishads, Bhagavad Gita, Yoga Sutras, Vivekananda, Ramana Maharshi.

**16. Sacred Journal (optional)** ⭐⭐⭐☆☆
Very lightweight — "Today's Reflection" only. No forced journaling.

## Phase 5 — Personalization

**17. Themes** ⭐⭐⭐⭐☆
Already started. Eventually: Dark Temple, Parchment, Himalayan Dawn, Deep Blue, Golden Ashram.

**18. Voice Packs** ⭐⭐⭐⭐⭐
English Male, English Female, Hindi, Sanskrit, Custom Upload.

> **Current state:** the `custom_audio` table already models this (`audio_type: 'voice' | 'ambient'`, `label`, `url`, `created_by`), and `AdminScreen.tsx` has an audio-management tab. Schema and admin tooling are ahead of the picker UI here.

**19. Ambient Library** ⭐⭐⭐⭐☆
Temple Bells, River, Rain, Himalayan Wind, OM Drone, Tanpura, Singing Bowls.

## Phase 6 — Community (future)

**20. Sangha** ⭐⭐⭐⭐☆
Reframe "Invite Friends" as inviting a practitioner, family, meditation circle, teacher, or students.

**21. Group Meditation** ⭐⭐⭐⭐⭐
E.g. "Sunday 6:00 AM · Global Meditation · 126 practitioners online" — everyone begins together.

**22. Live Guided Sessions** ⭐⭐⭐⭐☆
Future — a teacher can host, everyone joins.

> **Open tension:** APP_PHILOSOPHY.md currently lists "social features" under what the app must avoid, and describes it as "a private sacred practice space." Live presence counts ("126 practitioners online") are a social feature by definition. Resolve this explicitly before building Phase 6 — either amend the philosophy doc to carve out an exception, or scope this phase to something that doesn't compromise the solitary/private core (e.g., an asynchronous "X people practiced today" instead of live presence).

## Phase 7 — Complete Learning Platform

**23. Structured Learning** ⭐⭐⭐⭐⭐
Path: Introduction → Preparing Body → Breath → Mudras → Bandhas → Chakras → Meditation → Integration.

**24. Book Companion** ⭐⭐⭐⭐⭐
Every chapter from a chosen book links directly to related practices, mudras, asanas, explanations.

**25. Personal AI Guide (future)** ⭐⭐⭐⭐⭐
Not a generic chatbot — a Sadhana Guide grounded only in the curated library and traditional sources, understanding the app's content and the practitioner's own history. Example questions it should answer: "Why am I feeling restless during Manipura meditation?", "Which mudra complements Anahata practice?", "I've missed three days — how should I resume?"

## Sequencing note

The repo is currently solo-maintained with no tests and no CI (see `REFINEMENT_BACKLOG.md` for the tactical backlog this vision sits above). Phases 2–7 assume a structurally sound Phase 1. Resist starting Phase 2+ work before the session/audio state machine underlying items 1–3 is on solid footing — building more state-heavy features into it first multiplies the cost of untangling it later.
