import pool from '../configs/db-config.js'
import pkg from 'pg';
const {Client, Pool} = pkg;


export default class EventRepository {
  getAllEvents = async (page = 1, limit = 10) => {
    try {
      const offset = (page - 1) * limit;
      const sql = `SELECT 
        e.id as event_id, e.name as event_name, e.description as event_description, e.start_date, e.duration_in_minutes, e.price, 
        e.enabled_for_enrollment, e.max_assistance,
        u.id as user_id, u.first_name, u.last_name, u.username,
        el.id as event_location_id, el.id_location, el.full_address,
        l.id as location_id, l.name as location_name, l.latitude, l.longitude, l.id_province,
        p.id as province_id, p.name as province_name, p.full_name as province_full_name, p.latitude as province_latitude, p.longitude as province_longitude
      FROM events e
      JOIN users u ON e.id_creator_user = u.id
      JOIN event_locations el ON e.id_event_location = el.id
      JOIN locations l ON el.id_location = l.id
      JOIN provinces p ON l.id_province = p.id
      ORDER BY e.start_date ASC
      LIMIT $1 OFFSET $2
    `;
    const result = await pool.query(sql, [limit, offset]);
    return result.rows;
    } 
    catch (error) {
      console.log(error);
      throw error;
    }
  }; 

  searchEvents = async (filters) => {
    try {
      let whereClauses = [];
      let values = [];
      let idx = 1;

      if (filters.name) {
        whereClauses.push(`LOWER(e.name) LIKE LOWER($${idx})`);
        values.push(`%${filters.name}%`);
        idx++;
      }
      if (filters.startdate) {
        whereClauses.push(`CAST(e.start_date AS DATE) = $${idx}`);
        values.push(filters.startdate);
        idx++;
      }
      if (filters.tag) {
        whereClauses.push(`EXISTS (
          SELECT 1 FROM event_tags et
          JOIN tags t ON et.id_tag = t.id
          WHERE et.id_event = e.id AND LOWER(t.name) = LOWER($${idx})
        )`);
        values.push(filters.tag);
        idx++;
      }

      const where = whereClauses.length > 0 ? 'WHERE ' + whereClauses.join(' AND ') : '';

      const sql = `SELECT 
        e.id as event_id, e.name as event_name, e.description as event_description, e.start_date, e.duration_in_minutes, e.price, 
        e.enabled_for_enrollment, e.max_assistance,
        u.id as user_id, u.first_name, u.last_name, u.username,
        el.id as event_location_id, el.id_location, el.full_address,
        l.id as location_id, l.name as location_name, l.latitude, l.longitude, l.id_province,
        p.id as province_id, p.name as province_name, p.full_name as province_full_name, p.latitude as province_latitude, p.longitude as province_longitude
      FROM events e
      JOIN users u ON e.id_creator_user = u.id
      JOIN event_locations el ON e.id_event_location = el.id
      JOIN locations l ON el.id_location = l.id
      JOIN provinces p ON l.id_province = p.id
      ${where}
      ORDER BY e.start_date ASC`;
      const result = await pool.query(sql, values);
      return result.rows;
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  getEventById = async (id) => {
    try {
      const sql = `SELECT 
        e.*, 
        u.id as creator_user_id, u.first_name as creator_first_name, u.last_name as creator_last_name, u.username as creator_username, u.password as creator_password,
        el.id as event_location_id, el.id_location, el.name as event_location_name, el.full_address, el.max_capacity, el.latitude as event_location_latitude, el.longitude as event_location_longitude, el.id_creator_user as event_location_creator_user,
        l.id as location_id, l.name as location_name, l.id_province, l.latitude as location_latitude, l.longitude as location_longitude,
        p.id as province_id, p.name as province_name, p.full_name as province_full_name, p.latitude as province_latitude, p.longitude as province_longitude, p.display_order,
        elu.id as event_location_creator_id, elu.first_name as event_location_creator_first_name, elu.last_name as event_location_creator_last_name, elu.username as event_location_creator_username, elu.password as event_location_creator_password
      FROM events e
      JOIN users u ON e.id_creator_user = u.id
      JOIN event_locations el ON e.id_event_location = el.id
      JOIN users elu ON el.id_creator_user = elu.id
      JOIN locations l ON el.id_location = l.id
      JOIN provinces p ON l.id_province = p.id
      WHERE e.id = $1`;
      const result = await pool.query(sql, [id]);
      if (result.rows.length === 0) return null;
      const tagsSql = `SELECT t.id, t.name FROM event_tags et JOIN tags t ON et.id_tag = t.id WHERE et.id_event = $1`;
      const tagsResult = await pool.query(tagsSql, [id]);
      return { ...result.rows[0], tags: tagsResult.rows };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  getEventLocationById = async (id) => {
    try {
      const sql = `SELECT * FROM event_locations WHERE id = $1`;
      const result = await pool.query(sql, [id]);
      return result.rows[0] || null;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  checkEventExistsByName = async (name) => {
    try {
      const sql = `SELECT id FROM events WHERE LOWER(name) = LOWER($1)`;
      const result = await pool.query(sql, [name]);
      return result.rows.length > 0;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  createEvent = async (eventData) => {
    try {
      const sql = `INSERT INTO events (name, description, start_date, duration_in_minutes, price, enabled_for_enrollment, max_assistance, id_creator_user, id_event_location) 
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`;
      const values = [
        eventData.name,
        eventData.description,
        eventData.start_date,
        eventData.duration_in_minutes,
        eventData.price,
        eventData.enabled_for_enrollment,
        eventData.max_assistance,
        eventData.id_creator_user,
        eventData.id_event_location
      ];
      const result = await pool.query(sql, values);
      return result.rows[0];
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  updateEvent = async (eventId, eventData) => {
    try {
      const existingEvent = await this.getEventById(eventId);
      if (!existingEvent) {
        throw new Error('Evento no encontrado.');
      }

      const updateFields = [];
      const values = [];
      let paramIndex = 1;

      if (eventData.name !== undefined) {
        updateFields.push(`name = $${paramIndex}`);
        values.push(eventData.name);
        paramIndex++;
      }

      if (eventData.description !== undefined) {
        updateFields.push(`description = $${paramIndex}`);
        values.push(eventData.description);
        paramIndex++;
      }

      if (eventData.start_date !== undefined) {
        updateFields.push(`start_date = $${paramIndex}`);
        values.push(eventData.start_date);
        paramIndex++;
      }

      if (eventData.duration_in_minutes !== undefined) {
        updateFields.push(`duration_in_minutes = $${paramIndex}`);
        values.push(eventData.duration_in_minutes);
        paramIndex++;
      }

      if (eventData.price !== undefined) {
        updateFields.push(`price = $${paramIndex}`);
        values.push(eventData.price);
        paramIndex++;
      }

      if (eventData.enabled_for_enrollment !== undefined) {
        updateFields.push(`enabled_for_enrollment = $${paramIndex}`);
        values.push(eventData.enabled_for_enrollment);
        paramIndex++;
      }

      if (eventData.max_assistance !== undefined) {
        updateFields.push(`max_assistance = $${paramIndex}`);
        values.push(eventData.max_assistance);
        paramIndex++;
      }

      if (eventData.id_event_location !== undefined) {
        updateFields.push(`id_event_location = $${paramIndex}`);
        values.push(eventData.id_event_location);
        paramIndex++;
      }

      if (updateFields.length === 0) {
        return existingEvent;
      }

      values.push(eventId);
      const sql = `UPDATE events SET ${updateFields.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
      const result = await pool.query(sql, values);
      return result.rows[0];
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  deleteEvent = async (eventId) => {
    try {
      await pool.query('DELETE FROM event_tags WHERE id_event = $1', [eventId]);
      
      const sql = 'DELETE FROM events WHERE id = $1 RETURNING *';
      const result = await pool.query(sql, [eventId]);
      return result.rows[0];
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  checkEventEnrollments = async (eventId) => {
    try {
      const sql = `SELECT COUNT(*) FROM event_enrollments WHERE id_event = $1`;
      const result = await pool.query(sql, [eventId]);
      return parseInt(result.rows[0].count) > 0;
    } catch (error) {
      console.log('Error checking event enrollments:', error);
      return false;
    }
  }

  enrollUserToEvent = async (eventId, userId) => {
    try {
      // Check if user is already enrolled
      const existingEnrollment = await this.getUserEnrollment(eventId, userId);
      if (existingEnrollment) {
        throw new Error('El usuario ya se encuentra registrado en el evento.');
      }

      // Check if event exists and is enabled for enrollment
      const event = await this.getEventById(eventId);
      if (!event) {
        throw new Error('Evento no encontrado.');
      }

      if (!event.enabled_for_enrollment) {
        throw new Error('El evento no está habilitado para la inscripción.');
      }

      // Check if event has already started or is today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const eventDate = new Date(event.start_date);
      eventDate.setHours(0, 0, 0, 0);
      
      if (eventDate <= today) {
        throw new Error('No se puede registrar a un evento que ya sucedió o es hoy.');
      }

      // Check if event has reached max capacity
      const currentEnrollments = await this.getEventEnrollmentsCount(eventId);
      if (currentEnrollments >= event.max_assistance) {
        throw new Error('El evento ha excedido la capacidad máxima de registrados.');
      }

      // Create enrollment
      const registrationDateTime = new Date();
      const sql = `INSERT INTO event_enrollments (id_event, id_user, registration_date_time) 
                    VALUES ($1, $2, $3) RETURNING *`;
      const result = await pool.query(sql, [eventId, userId, registrationDateTime]);
      return result.rows[0];
    } catch (error) {
      console.log('Error enrolling user to event:', error);
      throw error;
    }
  }

  removeUserFromEvent = async (eventId, userId) => {
    try {
      // Check if user is enrolled
      const existingEnrollment = await this.getUserEnrollment(eventId, userId);
      if (!existingEnrollment) {
        throw new Error('El usuario no se encuentra registrado al evento.');
      }

      // Check if event has already started or is today
      const event = await this.getEventById(eventId);
      if (!event) {
        throw new Error('Evento no encontrado.');
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const eventDate = new Date(event.start_date);
      eventDate.setHours(0, 0, 0, 0);
      
      if (eventDate <= today) {
        throw new Error('No se puede remover de un evento que ya sucedió o es hoy.');
      }

      // Remove enrollment
      const sql = `DELETE FROM event_enrollments WHERE id_event = $1 AND id_user = $2 RETURNING *`;
      const result = await pool.query(sql, [eventId, userId]);
      return result.rows[0];
    } catch (error) {
      console.log('Error removing user from event:', error);
      throw error;
    }
  }

  getUserEnrollment = async (eventId, userId) => {
    try {
      const sql = `SELECT * FROM event_enrollments WHERE id_event = $1 AND id_user = $2`;
      const result = await pool.query(sql, [eventId, userId]);
      return result.rows[0] || null;
    } catch (error) {
      console.log('Error getting user enrollment:', error);
      return null;
    }
  }

  getEventEnrollmentsCount = async (eventId) => {
    try {
      const sql = `SELECT COUNT(*) FROM event_enrollments WHERE id_event = $1`;
      const result = await pool.query(sql, [eventId]);
      return parseInt(result.rows[0].count);
    } catch (error) {
      console.log('Error getting event enrollments count:', error);
      return 0;
    }
  }
}
