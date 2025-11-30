import { Joi, Segments } from 'celebrate';

//POST auth/register
export const registerUserSchema = {
  [Segments.BODY]: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).max(16).required(),
  }),
};

//POST auth/login
export const loginUserSchema = {
  [Segments.BODY]: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
};

//POST /auth/request-reset-email
export const requestResetEmailSchema = {
  [Segments.BODY]: Joi.object({ email: Joi.string().email().required() }),
};

//POST /auth/reset-password
export const resetPasswordSchema = {
  [Segments.BODY]: Joi.object({
    password: Joi.string().min(8).max(16).required(), //новий пароль який користувач хоче встановити
    token: Joi.string().required(), //JWT-JSON WEB TOKEN
  }),
};
