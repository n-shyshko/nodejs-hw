import { HttpError } from 'http-errors';

export const errorHandler = (err, req, res, next) => {
  if (req && req.log) {
    req.log.error(err);
  } else {
    console.error(err);
  }

  if (err instanceof HttpError) {
    return res.status(err.status).json({ message: err.message });
  }

  const isProd = process.env.NODE_ENV === 'production';

  res.status(500).json({
    message: isProd
      ? 'Something went wrong. Please try again later.'
      : err.message,
  });
};
