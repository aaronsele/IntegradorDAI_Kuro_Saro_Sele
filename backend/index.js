import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import apiRoutes from './routes/api.js';


dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;


const corsOptions = process.env.NODE_ENV === 'production'
  ? { origin: process.env.FRONTEND_URL, optionsSuccessStatus: 200 }
  : {};
app.use(cors(corsOptions));
app.use(express.json());


app.use('/api', apiRoutes);


app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Error interno del servidor'
    });
});


app.get('/', (req, res) => {
    res.send('Servidor Express funcionando en perfectas condiciones');
});


app.listen(PORT, () => {
    console.log(`Todo Listo! Servidor escuchando en puerto ${PORT}`);
});

