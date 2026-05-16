export type SessionType = 'morning' | 'night';

export type SessionStatus =
  | 'idle'
  | 'ready'
  | 'running'
  | 'paused'
  | 'completed'
  | 'cancelled'
  | 'error';

export type SessionPhase =
  | 'preparation'
  | 'activation'
  | 'integration'
  | 'closing';

export type VisualMode =
  | 'neutral'
  | 'grounding'
  | 'ascending'
  | 'heart-centered'
  | 'subtle'
  | 'integration';

export interface ChakraReference {
  id: string;
  label: string;
}

export interface NarrationCue {
  id: string;
  atSecond: number;
  text: string;
  language?: string;
  voicePackId?: string;
  premiumOnly?: boolean;
}

export interface AmbientTrackReference {
  key: string;
  variant?: string;
  audioPackId?: string;
  premiumOnly?: boolean;
}

export interface SessionModule {
  id: string;
  title: string;
  chakraId: string;
  durationSeconds: number;
  instruction: string;
  shortCue: string;
  ambientKey: string;
  mantraKey: string;
  narrationCues?: NarrationCue[];
  visualMode?: VisualMode;
  transitionBell: string;
}

export interface Session {
  id: string;
  title: string;
  type: SessionType;
  totalDuration: number;
  modules: SessionModule[];
  openingBell: string;
  closingBell: string;
}

export interface SessionProgress {
  sessionId: string;
  status: SessionStatus;
  currentModuleIndex: number;
  elapsedSeconds: number;
  moduleElapsedSeconds: number;
  startedAt?: string;
  endedAt?: string;
  completedModuleIds: string[];
  language?: string;
}

