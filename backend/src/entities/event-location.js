class EventLocation {
    constructor({ id, name, full_address, max_capacity, latitude, longitude, id_location, id_creator_user, location, creator_user }) {
        this.id = id;
        this.name = name;
        this.full_address = full_address;
        this.max_capacity = max_capacity;
        this.latitude = latitude;
        this.longitude = longitude;
        this.id_location = id_location;
        this.id_creator_user = id_creator_user;
        this.location = location;
        this.creator_user = creator_user;
    }
}

export default EventLocation; 