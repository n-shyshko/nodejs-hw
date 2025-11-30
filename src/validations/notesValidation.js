import { Joi, Segments } from 'celebrate';
import { isValidObjectId } from 'mongoose';
import TAGS from '../constants/tags.js';

const objectIdValidator = (value, helpers) => {
  return !isValidObjectId(value) ? helpers.message('Invalid id format') : value;
};

export const getAllNotesSchema = {
  [Segments.QUERY]: Joi.object({
    page: Joi.number()
      .integer()
      .min(1)
      .messages({
        'number.base': 'page must be a number',
        'number.min': 'page must be at least 1',
      })
      .default(1),
    perPage: Joi.number()
      .integer()
      .min(5)
      .max(20)
      .messages({
        'number.base': 'perPage must be a number',
        'number.min': 'perPage must be at least 5',
        'number.max': 'perPage must be at most 20',
      })
      .default(10),
    tag: Joi.string()
      .valid(...TAGS)
      .messages({
        'string.base': 'Tag must be a string',
        'any.only': `Tag must be one of: ${TAGS.join(', ')}`,
      })
      .optional(),
    search: Joi.string().trim().allow('').optional(),
  }),
};

export const noteIdSchema = {
  [Segments.PARAMS]: Joi.object({
    noteId: Joi.string().custom(objectIdValidator).required(),
  }),
};

export const createNoteSchema = {
  [Segments.BODY]: Joi.object({
    title: Joi.string().min(1).required().messages({
      'string.base': 'title must be a string',
      'string.min': 'title must be at least 1',
      'any.required': 'title is required',
    }),
    content: Joi.string().allow('').optional(),
    tag: Joi.string()
      .valid(...TAGS)
      .messages({
        'string.base': 'Tag must be a string',
        'any.only': `Tag must be one of: ${TAGS.join(', ')}`,
      })
      .optional(),
  }),
};

export const updateNoteSchema = {
  [Segments.PARAMS]: Joi.object({
    noteId: Joi.string().custom(objectIdValidator).required(),
  }),
  [Segments.BODY]: Joi.object({
    title: Joi.string().min(1).optional(),
    content: Joi.string().allow('').optional(),
    tag: Joi.string()
      .valid(...TAGS)
      .messages({
        'string.base': 'Tag must be a string',
        'any.only': `Tag must be one of: ${TAGS.join(', ')}`,
      })
      .optional(),
  }).min(1),
};
