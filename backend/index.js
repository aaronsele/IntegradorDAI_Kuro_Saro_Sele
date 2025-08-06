import 'dotenv/config';
import express from "express";
import cors from "cors";
import EventRouter from "./src/controllers/event-controller.js";
import UserRouter from "./src/controllers/user-controller.js";
import AuthRouter from "./src/controllers/auth-controller.js";
import EventLocationRouter from "./src/controllers/event-location-controller.js";

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('¡Servidor funcionando correctamente!');
});

app.use('/api/event', EventRouter);
app.use('/api/user', UserRouter);
app.use('/api/auth', AuthRouter);
app.use('/api/event-location', EventLocationRouter);

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
