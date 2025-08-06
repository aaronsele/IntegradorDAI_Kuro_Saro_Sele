class Location{
    constructor({ id, name, full_address, latitude, longitude, id_province, province }) {
        this.id = id;
        this.name = name;
        this.full_address = full_address;
        this.latitude = latitude;
        this.longitude = longitude;
        this.id_province = id_province;
        this.province = province;
    }
}

export default Location;