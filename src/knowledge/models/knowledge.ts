export type KnowledgeCategoryId =
  | 'practice-preparation'
  | 'safety-contraindications'
  | 'chakra-guide'
  | 'mudra-library'
  | 'preparation-asanas'
  | 'sanskrit-glossary'
  | 'sattvic-diet'
  | 'pranayama-library'
  | 'bandhas'
  | 'kriyas'
  | 'yogic-lifestyle'
  | 'faq'
  | 'recommended-reading';

export type KnowledgeStatus = 'available' | 'coming-soon';

export type KnowledgeReferenceKind = 'article' | 'entry' | 'glossary' | 'category';

export interface KnowledgeReference {
  id: string;
  kind: KnowledgeReferenceKind;
  label: string;
  note?: string;
}

export interface KnowledgeFact {
  label: string;
  value: string;
}

export interface KnowledgeEntry {
  id: string;
  title: string;
  subtitle?: string;
  summary?: string;
  facts?: KnowledgeFact[];
  paragraphs?: string[];
  bullets?: string[];
  caution?: string;
  references?: KnowledgeReference[];
  illustrationPlaceholder?: string;
}

export interface KnowledgeSection {
  id: string;
  title: string;
  summary?: string;
  paragraphs?: string[];
  bullets?: string[];
  note?: string;
  entries?: KnowledgeEntry[];
  references?: KnowledgeReference[];
}

export interface KnowledgeArticle {
  id: string;
  categoryId: KnowledgeCategoryId;
  title: string;
  summary: string;
  status: KnowledgeStatus;
  sections: KnowledgeSection[];
  references?: KnowledgeReference[];
}

export interface KnowledgeCategory {
  id: KnowledgeCategoryId;
  title: string;
  summary: string;
  status: KnowledgeStatus;
  order: number;
  articleId?: string;
}

export interface GuideCard {
  id: string;
  title: string;
  summary: string;
  categoryId: KnowledgeCategoryId;
  status: KnowledgeStatus;
  accent?: string;
}

export interface GlossaryEntry {
  id: string;
  word: string;
  pronunciation: string;
  meaning: string;
  explanation: string;
  relatedTerms: string[];
  crossLinks: KnowledgeReference[];
}
