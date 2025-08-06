class Province {
    constructor({ id, name, full_name, id_event_category, latitude, longitude, duration_in_minutes, display_order }) {
        this.id = id;
        this.name = name;
        this.full_name = full_name;
        this.id_event_category = id_event_category;
        this.latitude = latitude;
        this.longitude = longitude;
        this.duration_in_minutes = duration_in_minutes;
        this.display_order = display_order;
    }
}

export default Province;