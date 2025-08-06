import EventRepository from '../repositories/event-repository.js';
import Event from '../entities/event.js';
import User from '../entities/user.js';
import EventLocation from '../entities/event-location.js';
import Location from '../entities/location.js';
import Province from '../entities/province.js';
import { maskPassword, validarTexto, validarNum, validarFecha } from '../helpers/validaciones.js';

const repo = new EventRepository();

export default class EventService{
  getAllEvents = async (page = 1, limit = 10) => {
    const rows = await repo.getAllEvents(page, limit);
    return rows.map(row => {
      const province = new Province({
        id: row.province_id,
        name: row.province_name,
        full_name: row.province_full_name,
        latitude: row.province_latitude,
        longitude: row.province_longitude
      });
      const location = new Location({
        id: row.location_id,
        name: row.location_name,
        full_address: row.full_address,
        latitude: row.latitude,
        longitude: row.longitude,
        id_province: row.province_id,
        province
      });
      const eventLocation = new EventLocation({
        id: row.event_location_id,
        id_location: row.location_id,
        location
      });
      const user = new User({
        id: row.user_id,
        first_name: row.first_name,
        last_name: row.last_name,
        username: row.username
      });
      return new Event({
        id: row.event_id,
        name: row.event_name,
        description: row.event_description,
        start_date: row.start_date,
        duration_in_minutes: row.duration_in_minutes,
        price: row.price,
        enabled_for_enrollment: row.enabled_for_enrollment,
        max_assistance: row.max_assistance,
        creator_user: user,
        event_location: eventLocation
      });
    });
  }

  searchEvents = async (filters) => {
    const rows = await repo.searchEvents(filters);
    return rows.map(row => {
      const province = new Province({
        id: row.province_id,
        name: row.province_name,
        full_name: row.province_full_name,
        latitude: row.province_latitude,
        longitude: row.province_longitude
      });
      const location = new Location({
        id: row.location_id,
        name: row.location_name,
        full_address: row.full_address,
        latitude: row.latitude,
        longitude: row.longitude,
        id_province: row.province_id,
        province
      });
      const eventLocation = new EventLocation({
        id: row.event_location_id,
        id_location: row.location_id,
        location
      });
      const user = new User({
        id: row.user_id,
        first_name: row.first_name,
        last_name: row.last_name,
        username: row.username
      });
      return new Event({
        id: row.event_id,
        name: row.event_name,
        description: row.event_description,
        start_date: row.start_date,
        duration_in_minutes: row.duration_in_minutes,
        price: row.price,
        enabled_for_enrollment: row.enabled_for_enrollment,
        max_assistance: row.max_assistance,
        creator_user: user,
        event_location: eventLocation
      });
    });
  }

  getEventById = async (id) => {
    const row = await repo.getEventById(id);
    if (!row) return null;
    
    const province = new Province({
      id: row.province_id,
      name: row.province_name,
      full_name: row.province_full_name,
      latitude: row.province_latitude,
      longitude: row.province_longitude,
      display_order: row.display_order
    });
    
    const location = new Location({
      id: row.location_id,
      name: row.location_name,
      id_province: row.id_province,
      latitude: row.location_latitude,
      longitude: row.location_longitude,
      province
    });
    
    const eventLocation = {
      id: row.event_location_id,
      id_location: row.id_location,
      name: row.event_location_name,
      full_address: row.full_address,
      max_capacity: row.max_capacity,
      latitude: row.event_location_latitude,
      longitude: row.event_location_longitude,
      id_creator_user: row.event_location_creator_user,
      location,
      creator_user: {
        id: row.event_location_creator_id,
        first_name: row.event_location_creator_first_name,
        last_name: row.event_location_creator_last_name,
        username: row.event_location_creator_username,
        password: maskPassword(row.event_location_creator_password)
      }
    };
    
    const creatorUser = {
      id: row.creator_user_id,
      first_name: row.creator_first_name,
      last_name: row.creator_last_name,
      username: row.creator_username,
      password: maskPassword(row.creator_password)
    };
    
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      id_event_location: row.id_event_location,
      start_date: row.start_date,
      duration_in_minutes: row.duration_in_minutes,
      price: row.price,
      enabled_for_enrollment: row.enabled_for_enrollment,
      max_assistance: row.max_assistance,
      id_creator_user: row.id_creator_user,
      event_location: eventLocation,
      tags: row.tags,
      creator_user: creatorUser
    };
  }

  createEvent = async (eventData, userId) => {

    const nameError = validarTexto(eventData.name);
    if (nameError) {
      throw new Error("Nombre: " + nameError);
    }

    const descriptionError = validarTexto(eventData.description);
    if (descriptionError) {
      throw new Error("Descripción: " + descriptionError);
    }
    const precioError = validarNum(eventData.price);
    if (precioError) {
      throw new Error(precioError);
    }

    const durationError = validarNum(eventData.duration_in_minutes);
    if (durationError) {
      throw new Error(durationError);
    }

    const fechaError = validarFecha(eventData.start_date);
    if (fechaError) {
      throw new Error(fechaError);
    }

    // Verificar si ya existe un evento con el mismo nombre
    const eventExists = await repo.checkEventExistsByName(eventData.name);
    if (eventExists) {
      throw new Error('Ya existe un evento con ese nombre.');
    }

    const eventLocation = await repo.getEventLocationById(eventData.id_event_location);
    if (!eventLocation) {
      throw new Error('La ubicación del evento no existe.');
    }

    if (eventData.max_assistance > eventLocation.max_capacity) {
      throw new Error('El max_assistance no puede ser mayor que el max_capacity de la ubicación del evento.');
    }

    const eventoConCreador = {
      ...eventData,
      id_creator_user: userId
    };

    return await repo.createEvent(eventoConCreador);
  }

  updateEvent = async (eventId, eventData, userId) => {
    const existingEvent = await repo.getEventById(eventId);
    if (!existingEvent) {
      throw new Error('Evento no encontrado.');
    }

    if (existingEvent.id_creator_user !== userId) {
      throw new Error('No tienes permisos para editar este evento.');
    }

    if (eventData.name) {
      const nameError = validarTexto(eventData.name);
      if (nameError) {
        throw new Error('El name debe tener al menos 3 letras y contener solo letras y espacios.');
      }
    }

    if (eventData.description) {
      const descriptionError = validarTexto(eventData.description);
      if (descriptionError) {
        throw new Error('La description debe tener al menos 3 letras y contener solo letras y espacios.');
      }
    }

    if (eventData.price !== undefined && eventData.price < 0) {
      throw new Error('El price debe ser mayor o igual a cero.');
    }

    if (eventData.duration_in_minutes !== undefined && eventData.duration_in_minutes < 0) {
      throw new Error('La duration_in_minutes debe ser mayor o igual a cero.');
    }

    if (eventData.max_assistance !== undefined) {
      const eventLocation = await repo.getEventLocationById(eventData.id_event_location || existingEvent.id_event_location);
      if (eventData.max_assistance > eventLocation.max_capacity) {
        throw new Error('El max_assistance no puede ser mayor que el max_capacity de la ubicación del evento.');
      }
    }

    return await repo.updateEvent(eventId, eventData);
  }

  deleteEvent = async (eventId, userId) => {
    const existingEvent = await repo.getEventById(eventId);
    if (!existingEvent) {
      throw new Error('Evento no encontrado.');
    }

    if (existingEvent.id_creator_user !== userId) {
      throw new Error('No tienes permisos para eliminar este evento.');
    }

    
    const hasEnrollments = await repo.checkEventEnrollments(eventId);
    if (hasEnrollments) {
      throw new Error('No se puede eliminar el evento porque existe al menos un usuario registrado al evento.');
    }

    return await repo.deleteEvent(eventId);
  }

  enrollUserToEvent = async (eventId, userId) => {
    return await repo.enrollUserToEvent(eventId, userId);
  }

  removeUserFromEvent = async (eventId, userId) => {
    return await repo.removeUserFromEvent(eventId, userId);
  }
}
