import express from 'express';
import EventLocationService from '../services/event-location-service.js';
import { authenticateToken } from '../middleware/auth-middleware.js';

const svc = new EventLocationService();
const router = express.Router();

router.get('', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    const eventLocations = await svc.getAllEventLocationsByUser(userId, page, limit);
    return res.status(200).json(eventLocations);
  } catch (error) {
    console.log('Error getting event locations:', error);
    return res.status(500).json({ error: error.message });
  }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const eventLocation = await svc.getEventLocationById(id, userId);
    if (eventLocation) {
      return res.status(200).json(eventLocation);
    } else {
      return res.status(404).json({ error: 'Event-location no encontrado' });
    }
  } catch (error) {
    console.log('Error getting event location by id:', error);
    return res.status(500).json({ error: error.message });
  }
});


router.post('', authenticateToken, async (req, res) => {
  try {
    const eventLocationData = req.body;
    const userId = req.user.id;
    
    if (!eventLocationData.name || !eventLocationData.full_address || 
        eventLocationData.max_capacity === undefined || !eventLocationData.id_location) {
      return res.status(400).json({ 
        error: 'Todos los campos son requeridos: name, full_address, max_capacity, id_location' 
      });
    }

    const newEventLocation = await svc.createEventLocation(eventLocationData, userId);
    res.status(201).json(newEventLocation);
  } catch (error) {
    if (error.message.includes('al menos 3 letras') || 
        error.message.includes('mayor que cero') || 
        error.message.includes('inexistente')) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const eventLocationData = req.body;
    const userId = req.user.id;
    
    const updatedEventLocation = await svc.updateEventLocation(id, eventLocationData, userId);
    if (updatedEventLocation) {
      res.status(200).json(updatedEventLocation);
    } else {
      res.status(404).json({ error: 'Event-location no encontrado o no tienes permisos para editarlo' });
    }
  } catch (error) {
    if (error.message.includes('no encontrado')) {
      return res.status(404).json({ error: error.message });
    }
    if (error.message.includes('al menos 3 letras') || 
        error.message.includes('mayor que cero') || 
        error.message.includes('inexistente')) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});


router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const deleted = await svc.deleteEventLocation(id, userId);
    if (deleted) {
      res.status(200).json({ message: 'Event-location eliminado exitosamente', eventLocation: deleted });
    } else {
      res.status(404).json({ error: 'Event-location no encontrado o no tienes permisos para eliminarlo' });
    }
  } catch (error) {
    if (error.message.includes('no encontrado')) {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

export default router; 