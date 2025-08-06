class Event{
    constructor({ id, name, description, start_date, duration_in_minutes, price, enabled_for_enrollment, max_assistance, creator_user, event_location }) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.start_date = start_date;
        this.duration_in_minutes = duration_in_minutes;
        this.price = price;
        this.enabled_for_enrollment = enabled_for_enrollment;
        this.max_assistance = max_assistance;
        
        // Simplify creator_user object to show only required fields
        this.creator_user = {
            id: creator_user.id,
            first_name: creator_user.first_name,
            last_name: creator_user.last_name,
            username: creator_user.username
        };
        
        // Simplify event_location object to show only required fields
        this.event_location = {
            id: event_location.id,
            id_location: event_location.id_location,
            location: {
                id: event_location.location.id,
                name: event_location.location.name,
                full_address: event_location.location.full_address,
                latitude: event_location.location.latitude,
                longitude: event_location.location.longitude,
                id_province: event_location.location.id_province,
                province: {
                    id: event_location.location.province.id,
                    name: event_location.location.province.name,
                    full_name: event_location.location.province.full_name,
                    latitude: event_location.location.province.latitude,
                    longitude: event_location.location.province.longitude
                }
            }
        };
    }
}

export default Event;