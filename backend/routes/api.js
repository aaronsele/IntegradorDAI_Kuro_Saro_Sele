import express from 'express';
import {
    getHello,
    getAllEvents,
    getEventById,
    createEvent,
    updateEvent,
    deleteEvent,
    enrollInEvent,
    cancelEnrollment,
    getEventParticipants,
    getEventByName,
    getEventByStartDate,
    getEventByTag
} from '../src/controllers/eventController.js';
import { registerUser, loginUser } from '../src/controllers/userController.js';
import {
    getUserEventLocations,
    getEventLocationById,
    createEventLocation,
    updateEventLocation,
    deleteEventLocation
} from '../src/controllers/eventLocationController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Ruta default (de prueba)
router.get('/hello', getHello);

// Rutas de autenticación (sin autenticación requerida)
router.post('/user/register', registerUser);
router.post('/user/login', loginUser);

// Rutas de eventos public
router.get('/event', getAllEvents);
router.get('/event/:id', getEventById);

// Rutas de eventos auth
router.post('/event', authenticateToken, createEvent);
router.put('/event/:id', authenticateToken, updateEvent);
router.delete('/event/:id', authenticateToken, deleteEvent);

// Rutas de inscripciones auth
router.post('/event/:id/enrollment', authenticateToken, enrollInEvent);
router.delete('/event/:id/enrollment', authenticateToken, cancelEnrollment);

// Rutas de participantes auth
router.get('/event/:id/participants', authenticateToken, getEventParticipants);

// Rutas de ubicaciones de eventos auth
router.get('/event-location', authenticateToken, getUserEventLocations);
router.get('/event-location/:id', authenticateToken, getEventLocationById);
router.post('/event-location', authenticateToken, createEventLocation);
router.put('/event-location/:id', authenticateToken, updateEventLocation);
router.delete('/event-location/:id', authenticateToken, deleteEventLocation);

// Rutas de búsqueda auth
router.get('/events/name/:name', getEventByName);
router.get('/events/startdate/:startdate', getEventByStartDate);
router.get('/events/tag/:tag', getEventByTag);

export default router;
