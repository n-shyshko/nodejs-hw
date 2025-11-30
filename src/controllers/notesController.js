import { Note } from '../models/note.js';
import createHttpError from 'http-errors';
import mongoose from 'mongoose';
import { TAGS } from '../constants/tags.js';

export const getAllNotes = async (req, res) => {
  const { page = 1, perPage = 10, tag, search } = req.query;

  const skip = (page - 1) * perPage;

  let notesQuery = Note.find({ userId: req.user._id });

  if (search) {
    notesQuery.where({ $text: { $search: search } });
  }

  if (tag && TAGS.includes(tag)) {
    notesQuery.where('tag').equals(tag);
  }

  const [totalNotes, notes] = await Promise.all([
    notesQuery.clone().countDocuments(),
    notesQuery.skip(skiimport { Note } from '../models/note.js';
import createHttpError from 'http-errors';
import mongoose from 'mongoose';
import TAGS from '../constants/tags.js';

//GET All notes
export const getAllNotes = async (req, res) => {
  const { page = 1, perPage = 10, tag, search } = req.query;
  const skip = (page - 1) * perPage;
  let notesQuery = Note.find();

  //текстовий пошук за title, content
  if (search) {
    notesQuery.where({ $text: { $search: search } });
  }

  //ф≥льтрац€ за тегом
  if (tag && TAGS.includes(tag)) {
    notesQuery.where('tag').equals(tag);
  }

  const [totalNotes, notes] = await Promise.all([
    notesQuery.clone().countDocuments(),
    notesQuery.skip(skip).limit(perPage),
  ]);

  //рахуЇ ск≥льки загалом буде стор≥нок, та заокруглюЇ до ц≥лого числа
  const totalPages = Math.ceil(totalNotes / perPage);

  res.status(200).json({
    page,
    perPage,
    totalNotes,
    totalPages,
    notes,
  });
};

//GET note by Id

export const getNoteById = async (req, res) => {
  const noteId = req.params.noteId;

  if (!mongoose.isValidObjectId(noteId)) {
    throw createHttpError(404, 'Note is not found!');
  }

  const note = await Note.findById(noteId);

  if (!note) {
    throw createHttpError(404, 'Note is not found!');
  }
  res.status(200).json(note);
};

//POST /notes/:noteId
export const createNote = async (req, res) => {
  const note = await Note.create(req.body);
  res.status(201).json(note);
};

//DELETE /notes/:noteId
export const deleteNote = async (req, res) => {
  const noteId = req.params.noteId;
  const note = await Note.findOneAndDelete({ _id: noteId });

  if (!note) {
    throw createHttpError(404, 'Note is not found!');
  }
  res.status(200).json(note);
};

//PATCH /notes/:noteId
export const updateNote = async (req, res) => {
  const noteId = req.params.noteId;
  const note = await Note.findOneAndUpdate({ _id: noteId }, req.body, {
    new: true,
  });

  if (!note) {
    throw createHttpError(404, 'Note is not found!');
  }
  res.status(200).json(note);
};p).limit(perPage),
  ]);

  const totalPages = Math.ceil(totalNotes / perPage);

  res.status(200).json({
    page,
    perPage,
    totalNotes,
    totalPages,
    notes,
  });
};

export const getNoteById = async (req, res) => {
  const noteId = req.params.noteId;

  if (!mongoose.isValidObjectId(noteId)) {
    throw createHttpError(404, 'Invalid note id');
  }

  const note = await Note.findOne({ _id: noteId, userId: req.user._id });

  if (!note) {
    throw createHttpError(404, 'Note not found');
  }
  res.status(200).json(note);
};

export const createNote = async (req, res) => {
  const note = await Note.create({ ...req.body, userId: req.user._id });
  res.status(201).json(note);
};

export const deleteNote = async (req, res) => {
  const noteId = req.params.noteId;
  const note = await Note.findOneAndDelete({
    _id: noteId,
    userId: req.user._id,
  });

  if (!note) {
    throw createHttpError(404, 'Note not found');
  }
  res.status(200).json(note);
};

export const updateNote = async (req, res) => {
  const noteId = req.params.noteId;
  const note = await Note.findOneAndUpdate(
    { _id: noteId, userId: req.user._id },
    req.body,
    {
      new: true,
    },
  );

  if (!note) {
    throw createHttpError(404, 'Note is not found!');
  }
  res.status(200).json(note);
};
