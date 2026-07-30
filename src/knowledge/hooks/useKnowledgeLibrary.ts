import { useMemo } from 'react';
import {
  GLOSSARY_ENTRIES,
  KNOWLEDGE_ARTICLES,
  KNOWLEDGE_CATEGORIES,
  getArticleById,
  getCategoryById,
  getGlossaryEntryById,
  getKnowledgeCards,
} from '../data/library';

export function useKnowledgeLibrary() {
  const cards = useMemo(() => getKnowledgeCards(), []);

  const articlesById = useMemo(
    () => Object.fromEntries(KNOWLEDGE_ARTICLES.map(article => [article.id, article] as const)),
    []
  );

  const categoriesById = useMemo(
    () => Object.fromEntries(KNOWLEDGE_CATEGORIES.map(category => [category.id, category] as const)),
    []
  );

  const glossaryById = useMemo(
    () => Object.fromEntries(GLOSSARY_ENTRIES.map(entry => [entry.id, entry] as const)),
    []
  );

  const availableCards = useMemo(
    () => cards.filter(card => card.status === 'available'),
    [cards],
  );

  const defaultArticle = useMemo(
    () => availableCards[0] ? getArticleById(availableCards[0].id) : KNOWLEDGE_ARTICLES[0] ?? null,
    [availableCards],
  );

  return {
    cards,
    availableCards,
    articles: KNOWLEDGE_ARTICLES,
    categories: KNOWLEDGE_CATEGORIES,
    glossary: GLOSSARY_ENTRIES,
    articlesById,
    categoriesById,
    glossaryById,
    defaultArticle,
    getArticleById,
    getCategoryById,
    getGlossaryEntryById,
  };
}
