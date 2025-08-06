import EventLocationRepository from '../repositories/event-location-repository.js';
import EventLocation from '../entities/event-location.js';
import Location from '../entities/location.js';
import Province from '../entities/province.js';
import User from '../entities/user.js';
import { validarTexto, validarNum } from '../helpers/validaciones.js';

const repo = new EventLocationRepository();

export default class EventLocationService {
  getAllEventLocationsByUser = async (userId, page = 1, limit = 10) => {
    const rows = await repo.getAllEventLocationsByUser(userId, page, limit);
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
        full_address: row.location_full_address,
        latitude: row.location_latitude,
        longitude: row.location_longitude,
        id_province: row.province_id,
        province
      });
      
      const creatorUser = new User({
        id: row.creator_user_id,
        first_name: row.first_name,
        last_name: row.last_name,
        username: row.username
      });
      
      return new EventLocation({
        id: row.id,
        name: row.name,
        full_address: row.full_address,
        max_capacity: row.max_capacity,
        latitude: row.latitude,
        longitude: row.longitude,
        id_location: row.id_location,
        id_creator_user: row.id_creator_user,
        location,
        creator_user: creatorUser
      });
    });
  };

  getEventLocationById = async (id, userId) => {
    const row = await repo.getEventLocationById(id, userId);
    if (!row) return null;
    
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
      full_address: row.location_full_address,
      latitude: row.location_latitude,
      longitude: row.location_longitude,
      id_province: row.province_id,
      province
    });
    
    const creatorUser = new User({
      id: row.creator_user_id,
      first_name: row.first_name,
      last_name: row.last_name,
      username: row.username
    });
    
    return new EventLocation({
      id: row.id,
      name: row.name,
      full_address: row.full_address,
      max_capacity: row.max_capacity,
      latitude: row.latitude,
      longitude: row.longitude,
      id_location: row.id_location,
      id_creator_user: row.id_creator_user,
      location,
      creator_user: creatorUser
    });
  };

  createEventLocation = async (eventLocationData, userId) => {
    // Validar nombre
    const nameError = validarTexto(eventLocationData.name);
    if (nameError) {
      throw new Error("El nombre " + nameError);
    }

    // Validar dirección
    const addressError = validarTexto(eventLocationData.full_address);
    if (addressError) {
      throw new Error("La dirección " + addressError);
    }

    // Validar max_capacity
    const capacityError = validarNum(eventLocationData.max_capacity);
    if (capacityError) {
      throw new Error("La capacidad máxima " + capacityError);
    }

    if (eventLocationData.max_capacity <= 0) {
      throw new Error("El max_capacity debe ser mayor que cero.");
    }

    // Verificar que la ubicación existe
    const locationExists = await repo.checkLocationExists(eventLocationData.id_location);
    if (!locationExists) {
      throw new Error("El id_location es inexistente.");
    }

    const eventLocationWithCreator = {
      ...eventLocationData,
      id_creator_user: userId
    };

    return await repo.createEventLocation(eventLocationWithCreator);
  };

  updateEventLocation = async (id, eventLocationData, userId) => {
    const existingEventLocation = await repo.getEventLocationById(id, userId);
    if (!existingEventLocation) {
      throw new Error('Event-location no encontrado.');
    }

    if (eventLocationData.name) {
      const nameError = validarTexto(eventLocationData.name);
      if (nameError) {
        throw new Error("El nombre " + nameError);
      }
    }

    if (eventLocationData.full_address) {
      const addressError = validarTexto(eventLocationData.full_address);
      if (addressError) {
        throw new Error("La dirección " + addressError);
      }
    }

    if (eventLocationData.max_capacity !== undefined) {
      const capacityError = validarNum(eventLocationData.max_capacity);
      if (capacityError) {
        throw new Error("La capacidad máxima " + capacityError);
      }

      if (eventLocationData.max_capacity <= 0) {
        throw new Error("El max_capacity debe ser mayor que cero.");
      }
    }

    if (eventLocationData.id_location) {
      const locationExists = await repo.checkLocationExists(eventLocationData.id_location);
      if (!locationExists) {
        throw new Error("El id_location es inexistente.");
      }
    }

    return await repo.updateEventLocation(id, eventLocationData, userId);
  };

  deleteEventLocation = async (id, userId) => {
    const existingEventLocation = await repo.getEventLocationById(id, userId);
    if (!existingEventLocation) {
      throw new Error('Event-location no encontrado.');
    }

    return await repo.deleteEventLocation(id, userId);
  };
} 