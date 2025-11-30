import { Joi, Segments } from 'celebrate';
import { TAGS } from '../constants/tags.js';
import { isValidObjectId } from 'mongoose';

export const getAllNotesSchema = {
  [Segments.QUERY]: Joi.object({
  page: Joi.number().integer().min(1).default(1).messages({
      "number.base": "Page must be a number",
      "number.integer": "Page must be an integer",
      "number.min": "Page must be greater than or equal to 1",
    }),
  perPage: Joi.number().integer().min(5).max(20).default(10).messages({
      "number.base": "Per page must be a number",
      "number.integer": "Per page must be an integer",
      "number.min": "Per page must be greater than or equal to 5",
      "number.max": "Per page must be less than or equal to 20",
    }),
  tag: Joi.string().valid(...TAGS).optional().messages({
      "string.base": "Tag must be a string",
      "any.only": "Tag must be one of the allowed values",
  }),
  search: Joi.string().allow('').optional().messages({
      "string.base": "Search must be a string",
    }),
  }),
};

export const createNoteSchema = {
  [Segments.BODY]: Joi.object({
    title: Joi.string().min(1).required().messages({
        'string.base': 'Title must be a string.',
        'string.empty': 'Title cannot be empty.',
        'string.min': 'Title must have at least 1 character.',
        'any.required': 'Title is required.',
      }),
    content: Joi.string().allow('').optional().messages({
        'string.base': 'Content must be a string.',
      }),
    tag: Joi.string().valid(...TAGS).optional().messages({
        'string.base': 'Tag must be a string.',
        'any.only': 'Tag must be one of the allowed values.',
      }),
  }),
};

const objectIdValidator = (value, helpers) => {
  return !isValidObjectId(value) ? helpers.message('Invalid id format') : value;
};

export const noteIdSchema = {
  [Segments.PARAMS]: Joi.object({
  noteId: Joi.string().custom(objectIdValidator, 'Mongoose ObjectId validation').required().messages({
        'any.invalid': 'Invalid note ID format. Must be a valid Mongoose ObjectId.',
        'string.base': 'Note ID must be a string.',
        'any.required': 'Note ID is required in route parameters.',
      }),
  }),
};

export const updateNoteSchema = {
  [Segments.PARAMS]: Joi.object({
    noteId: Joi.string().custom(objectIdValidator, 'Mongoose ObjectId validation').required(),
  }),
  [Segments.BODY]: Joi.object({
    title: Joi.string().min(1).optional().messages({
        'string.base': 'Title must be a string.',
        'string.min': 'Title must have at least 1 character.',
      }),
    content: Joi.string().allow('').optional().messages({
        'string.base': 'Content must be a string.',
      }),
    tag: Joi.string().valid(...TAGS).optional().messages({
        'string.base': 'Tag must be a string.',
        'any.only': 'Tag must be one of the allowed values.',
      }),
  }).min(1).messages({
      'object.min': 'Request body must contain at least one field (title, content, or tag) to update.',
    }),
};
