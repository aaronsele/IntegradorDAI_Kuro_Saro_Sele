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


router.get('/hello', getHello);
router.post('/user/register', registerUser);
router.post('/user/login', loginUser);
router.get('/event', getAllEvents);
router.get('/event/:id', getEventById);
router.post('/event', authenticateToken, createEvent);
router.put('/event/:id', authenticateToken, updateEvent);
router.delete('/event/:id', authenticateToken, deleteEvent);
router.post('/event/:id/enrollment', authenticateToken, enrollInEvent);
router.delete('/event/:id/enrollment', authenticateToken, cancelEnrollment);
router.get('/event/:id/participants', authenticateToken, getEventParticipants);
router.get('/event-location', authenticateToken, getUserEventLocations);
router.get('/event-location/:id', authenticateToken, getEventLocationById);
router.post('/event-location', authenticateToken, createEventLocation);
router.put('/event-location/:id', authenticateToken, updateEventLocation);
router.delete('/event-location/:id', authenticateToken, deleteEventLocation);
router.get('/events/name/:name', getEventByName);
router.get('/events/startdate/:startdate', getEventByStartDate);
router.get('/events/tag/:tag', getEventByTag);

export default router;
