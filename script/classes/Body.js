/**
 * Represents a body in motion
 */
class Body {
    /**
     * 
     * @param {Vector} position
     * @param {Number} mass 
     * @param {Integer} radius 
     * @param {Vector} velocity 
     * @param {String} color
     */
    constructor(position, mass, radius, velocity, color = 'white') {
        this.position = position;
        this.mass = mass;
        this.radius = radius;
        this.velocity = velocity;
        this.color = color;
    }
}