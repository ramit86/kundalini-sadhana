# Audio Generation

This folder holds the local ElevenLabs pipeline for creating reviewed narration MP3 assets.

## Setup

1. Copy `.env.example` to `.env` at the repository root.
2. Set `ELEVENLABS_API_KEY` and `ELEVENLABS_VOICE_ID` in that local file.
3. Keep `.env` out of version control. The repository already ignores it.

## Finding a Voice ID

Use the ElevenLabs dashboard or the voices API to copy the voice ID for the narrator voice you want to use. Paste that ID into `ELEVENLABS_VOICE_ID` in `.env`.

## Commands

- `npm run audio:generate`
- `npm run audio:generate -- --only opening_invocation`
- `npm run audio:generate -- --force`

## Overwrite Behavior

- Existing MP3 files are skipped by default.
- Use `--force` to overwrite an existing output file.

## Output Structure

Generated files are written only to:

- `public/audio/rituals`
- `public/audio/announcements`
- `public/audio/practice`
- `public/audio/knowledge`

The category in `scripts/audio/scripts.json` determines which folder is used.

## Review Workflow

1. Edit `scripts/audio/scripts.json`.
2. Run `npm run audio:generate`.
3. Review the generated MP3s locally.
4. Approve the reviewed assets before using them in the app.

## Security Notes

- The ElevenLabs API key stays in the local root `.env` file only.
- The SDK is used only by `scripts/audio/generate-audio.mjs`.
- Nothing under `src/` imports the ElevenLabs SDK.
- Reports do not include the API key.
