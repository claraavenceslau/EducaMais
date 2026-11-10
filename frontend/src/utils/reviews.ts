import type { Course, Review, Stars } from '../types';
import { courseProgress } from './selectors';

/** Percentual mínimo do curso que o aluno precisa ter feito antes de avaliar. */
export const MIN_PROGRESS_TO_REVIEW = 25;

export type RatingSummary = {
  average: number; // com uma casa decimal; 0 quando não há avaliações
  count: number;
  distribution: Record<Stars, number>;
};

export function summarize(reviews: Review[]): RatingSummary {
  const distribution: Record<Stars, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const r of reviews) distribution[r.stars] += 1;
  if (reviews.length === 0) return { average: 0, count: 0, distribution };
  const total = reviews.reduce((sum, r) => sum + r.stars, 0);
  return { average: Math.round((total / reviews.length) * 10) / 10, count: reviews.length, distribution };
}

export const reviewsOf = (reviews: Review[], courseId: string): Review[] =>
  reviews.filter((r) => r.courseId === courseId);

export const courseRating = (reviews: Review[], courseId: string): RatingSummary =>
  summarize(reviewsOf(reviews, courseId));

export const myReview = (reviews: Review[], courseId: string, studentId: string): Review | undefined =>
  reviews.find((r) => r.courseId === courseId && r.studentId === studentId);

export type ReviewEligibility = { allowed: boolean; reason?: string };

/** Só aluno matriculado, com parte do curso feita, avalia. Professor nunca avalia. */
export function reviewEligibility(course: Course, role: 'aluno' | 'professor'): ReviewEligibility {
  if (role !== 'aluno') return { allowed: false, reason: 'Somente alunos avaliam cursos.' };
  if (!course.enrolled) return { allowed: false, reason: 'Matricule-se no curso para avaliar.' };
  if (courseProgress(course) < MIN_PROGRESS_TO_REVIEW) {
    return { allowed: false, reason: `Conclua pelo menos ${MIN_PROGRESS_TO_REVIEW}% do curso para avaliar.` };
  }
  return { allowed: true };
}

export function newestFirst(reviews: Review[]): Review[] {
  return [...reviews].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

/** "4,8" no formato brasileiro, ou "Novo" quando ainda não há avaliações. */
export function ratingLabel(s: RatingSummary): string {
  return s.count === 0 ? 'Novo' : `${s.average.toFixed(1).replace('.', ',')} (${s.count})`;
}
