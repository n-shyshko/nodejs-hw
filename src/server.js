import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { errors } from 'celebrate';
import { connectMongoDB } from './db/connectMongoDB.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';
import notesRoutes from './routes/notesRoutes.js';
import logger from './middleware/logger.js';

const app = express();
const PORT = process.env.PORT ?? 3000;

//логування запитів
app.use(logger);

//щоб парсити данні
app.use(
  express.json({
    type: ['application/json', 'application/vnd.api+json'],
    limit: '100kb',
  }),
);

//дозволяє обмін данними з різних джерел
app.use(cors());

//GET запити та маршурути за notes
app.use(notesRoutes);

// не існуючі маршрути
app.use(notFoundHandler);

//обробка помилок валідації
app.use(errors());

//обробка помлок
app.use(errorHandler);

//Зєднання з базою данних.
await connectMongoDB();

//запуск серв
app.listen(PORT, () => {
  console.log(`Server runnig ${PORT}`);
});
