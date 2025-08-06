import pool from '../configs/db-config.js'

export default class EventLocationRepository {
  getAllEventLocationsByUser = async (userId, page = 1, limit = 10) => {
    try {
      const offset = (page - 1) * limit;
      const sql = `SELECT 
        el.id, el.name, el.full_address, el.max_capacity, el.latitude, el.longitude, el.id_location, el.id_creator_user,
        l.id as location_id, l.name as location_name, l.latitude as location_latitude, l.longitude as location_longitude, l.id_province,
        p.id as province_id, p.name as province_name, p.full_name as province_full_name, p.latitude as province_latitude, p.longitude as province_longitude,
        u.id as creator_user_id, u.first_name, u.last_name, u.username
      FROM event_locations el
      JOIN locations l ON el.id_location = l.id
      JOIN provinces p ON l.id_province = p.id
      JOIN users u ON el.id_creator_user = u.id
      WHERE el.id_creator_user = $1
      ORDER BY el.id DESC
      LIMIT $2 OFFSET $3`;
      
      const result = await pool.query(sql, [userId, limit, offset]);
      return result.rows;
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  getEventLocationById = async (id, userId) => {
    try {
      const sql = `SELECT 
        el.id, el.name, el.full_address, el.max_capacity, el.latitude, el.longitude, el.id_location, el.id_creator_user,
        l.id as location_id, l.name as location_name, l.latitude as location_latitude, l.longitude as location_longitude, l.id_province,
        p.id as province_id, p.name as province_name, p.full_name as province_full_name, p.latitude as province_latitude, p.longitude as province_longitude,
        u.id as creator_user_id, u.first_name, u.last_name, u.username
      FROM event_locations el
      JOIN locations l ON el.id_location = l.id
      JOIN provinces p ON l.id_province = p.id
      JOIN users u ON el.id_creator_user = u.id
      WHERE el.id = $1 AND el.id_creator_user = $2`;
      
      const result = await pool.query(sql, [id, userId]);
      return result.rows[0] || null;
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  createEventLocation = async (eventLocationData) => {
    try {
      const sql = `INSERT INTO event_locations (name, full_address, max_capacity, latitude, longitude, id_location, id_creator_user) 
                    VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`;
      const values = [
        eventLocationData.name,
        eventLocationData.full_address,
        eventLocationData.max_capacity,
        eventLocationData.latitude,
        eventLocationData.longitude,
        eventLocationData.id_location,
        eventLocationData.id_creator_user
      ];
      const result = await pool.query(sql, values);
      return result.rows[0];
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  updateEventLocation = async (id, eventLocationData, userId) => {
    try {
      const updateFields = [];
      const values = [];
      let paramIndex = 1;

      if (eventLocationData.name !== undefined) {
        updateFields.push(`name = $${paramIndex}`);
        values.push(eventLocationData.name);
        paramIndex++;
      }

      if (eventLocationData.full_address !== undefined) {
        updateFields.push(`full_address = $${paramIndex}`);
        values.push(eventLocationData.full_address);
        paramIndex++;
      }

      if (eventLocationData.max_capacity !== undefined) {
        updateFields.push(`max_capacity = $${paramIndex}`);
        values.push(eventLocationData.max_capacity);
        paramIndex++;
      }

      if (eventLocationData.latitude !== undefined) {
        updateFields.push(`latitude = $${paramIndex}`);
        values.push(eventLocationData.latitude);
        paramIndex++;
      }

      if (eventLocationData.longitude !== undefined) {
        updateFields.push(`longitude = $${paramIndex}`);
        values.push(eventLocationData.longitude);
        paramIndex++;
      }

      if (eventLocationData.id_location !== undefined) {
        updateFields.push(`id_location = $${paramIndex}`);
        values.push(eventLocationData.id_location);
        paramIndex++;
      }

      if (updateFields.length === 0) {
        return await this.getEventLocationById(id, userId);
      }

      values.push(id, userId);
      const sql = `UPDATE event_locations SET ${updateFields.join(', ')} WHERE id = $${paramIndex} AND id_creator_user = $${paramIndex + 1} RETURNING *`;
      const result = await pool.query(sql, values);
      return result.rows[0];
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  deleteEventLocation = async (id, userId) => {
    try {
      const sql = `DELETE FROM event_locations WHERE id = $1 AND id_creator_user = $2 RETURNING *`;
      const result = await pool.query(sql, [id, userId]);
      return result.rows[0];
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  checkLocationExists = async (id_location) => {
    try {
      const sql = `SELECT id FROM locations WHERE id = $1`;
      const result = await pool.query(sql, [id_location]);
      return result.rows.length > 0;
    } catch (error) {
      console.log(error);
      return false;
    }
  };

  checkEventLocationExists = async (id) => {
    try {
      const sql = `SELECT id FROM event_locations WHERE id = $1`;
      const result = await pool.query(sql, [id]);
      return result.rows.length > 0;
    } catch (error) {
      console.log(error);
      return false;
    }
  };
} 