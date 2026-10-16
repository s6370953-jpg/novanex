import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('Unhandled request error', err.name);

  if (err.name === 'ValidationError') {
    res.status(400).json({ error: 'Please check the information you entered.' });
    return;
  }

  if (err.name === 'UnauthorizedError') {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  res.status(500).json({ error: 'Internal server error' });
};

export const notFoundHandler = (
  req: Request,
  res: Response
): void => {
  res.status(404).json({ error: 'Route not found' });
};
