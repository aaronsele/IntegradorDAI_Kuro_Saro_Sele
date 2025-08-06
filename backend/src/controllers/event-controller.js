import express from 'express';
import EventService from '../services/event-service.js';
import { authenticateToken } from '../middleware/auth-middleware.js';

const svc = new EventService();
const router = express.Router();

router.get('', async (req, res) => {
  let respuesta;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const { name, startdate, tag } = req.query;
  let events;
  if (name || startdate || tag) {
    events = await svc.searchEvents({ name, startdate, tag }, page, limit);
  } else {
    events = await svc.getAllEvents(page, limit);
  }
  if (events && events.length > 0) {
    respuesta = res.status(200).json(events);
  } else {
    respuesta = res.status(200).json({ error: 'Tal evento no está registrado' });
  }
  return respuesta;
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const event = await svc.getEventById(id);
  if (event) {
    return res.status(200).json(event);
  } else {
    return res.status(404).json({ error: 'Evento no encontrado' });
  }
});


router.post('', authenticateToken, async (req, res) => {
  try {
    const eventData = req.body;
    const userId = req.user.id; 
    
    if (!eventData.name || !eventData.description || !eventData.start_date || 
        eventData.duration_in_minutes === undefined || eventData.price === undefined || 
        eventData.enabled_for_enrollment === undefined || eventData.max_assistance === undefined || 
        !eventData.id_event_location) {
      return res.status(400).json({ 
        error: 'Todos los campos son requeridos: name, description, start_date, duration_in_minutes, price, enabled_for_enrollment, max_assistance, id_event_location' 
      });
    }

    const newEvent = await svc.createEvent(eventData, userId);
    res.status(201).json(newEvent);
  } catch (error) {
    if (error.message.includes('al menos 3 letras') || 
        error.message.includes('mayor que cero') || 
        error.message.includes('max_capacity') ||
        error.message.includes('Ya existe un evento con ese nombre')) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

router.put('', authenticateToken, async (req, res) => {
  try {
    const eventData = req.body;
    const userId = req.user.id; 
    
    if (!eventData.id) {
      return res.status(400).json({ error: 'El ID del evento es requerido' });
    }
    
    const updatedEvent = await svc.updateEvent(eventData.id, eventData, userId);
    if (updatedEvent) {
      res.status(200).json(updatedEvent);
    } else {
      res.status(404).json({ error: 'Evento no encontrado o no tienes permisos para editarlo' });
    }
  } catch (error) {
    if (error.message.includes('No tienes permisos')) {
      return res.status(404).json({ error: error.message });
    }
    if (error.message.includes('al menos 3 letras') || 
        error.message.includes('mayor que cero') || 
        error.message.includes('max_capacity')) {
      return res.status(400).json({ error: error.message });
    }
    if (error.message.includes('Evento no encontrado')) {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});


router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id; 
    
    const deleted = await svc.deleteEvent(id, userId);
    if (deleted) {
      res.status(200).json({ message: 'Evento eliminado exitosamente', event: deleted });
    } else {
      res.status(404).json({ error: 'Evento no encontrado o no tienes permisos para eliminarlo' });
    }
  } catch (error) {
    if (error.message.includes('No tienes permisos')) {
      return res.status(404).json({ error: error.message });
    }
    if (error.message.includes('usuarios registrados')) {
      return res.status(400).json({ error: error.message });
    }
    if (error.message.includes('Evento no encontrado')) {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

// Enrollment endpoints
router.post('/:id/enrollment', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const enrollment = await svc.enrollUserToEvent(id, userId);
    res.status(201).json({ message: 'Usuario registrado exitosamente al evento', enrollment });
  } catch (error) {
    if (error.message.includes('ya se encuentra registrado') || 
        error.message.includes('no está habilitado') ||
        error.message.includes('excedido la capacidad máxima') ||
        error.message.includes('ya sucedió o es hoy')) {
      return res.status(400).json({ error: error.message });
    }
    if (error.message.includes('Evento no encontrado')) {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id/enrollment', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const removed = await svc.removeUserFromEvent(id, userId);
    if (removed) {
      res.status(200).json({ message: 'Usuario removido exitosamente del evento', enrollment: removed });
    } else {
      res.status(404).json({ error: 'Evento no encontrado' });
    }
  } catch (error) {
    if (error.message.includes('no se encuentra registrado') ||
        error.message.includes('ya sucedió o es hoy')) {
      return res.status(400).json({ error: error.message });
    }
    if (error.message.includes('Evento no encontrado')) {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

export default router; 

