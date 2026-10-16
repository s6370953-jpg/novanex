import { Request, Response } from 'express';

interface TutorQuestion {
  lessonId: string;
  currentTimestamp: number;
  question: string;
}

const isTutorQuestion = (body: unknown): body is TutorQuestion => {
  if (!body || typeof body !== 'object') return false;

  const question = body as Partial<TutorQuestion>;
  return typeof question.lessonId === 'string' &&
    question.lessonId.trim().length > 0 &&
    question.lessonId.length <= 128 &&
    typeof question.currentTimestamp === 'number' &&
    Number.isFinite(question.currentTimestamp) &&
    question.currentTimestamp >= 0 &&
    typeof question.question === 'string' &&
    question.question.trim().length > 0 &&
    question.question.length <= 2000;
};

export const askTutor = (req: Request, res: Response): void => {
  if (!isTutorQuestion(req.body)) {
    res.status(400).json({ error: 'Please provide a lesson, playback timestamp, and question.' });
    return;
  }

  res.status(503).json({
    error: 'The AI Tutor is not configured yet. No answer was generated.',
  });
};
