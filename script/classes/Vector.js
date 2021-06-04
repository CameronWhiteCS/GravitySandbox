class Vector {

    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    get magnitude (){
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    /**
     * 
     * @returns {Vector}
     */
    norm = () => {
        const magnitude = this.magnitude;
        return new Vector(this.x / magnitude, this.y / magnitude);
    }

    /**
     * 
     * @param {Number} factor 
     * @returns {Vector}
     */
    scale = (factor) => {
        return new Vector(this.x * factor, this.y * factor);
    }

    add = (vec) => {
        return new Vector(this.x + vec.x, this.y + vec.y);
    }

    /**
     * Used to calculate the distance between two vectors when they are used to represent a point in space rather than a vector.
     * @param {Vector} vec 
     * @returns {Number}
     */
    distance = (vec) => {
        return Math.sqrt(Math.pow(vec.x - this.x, 2) + Math.pow(vec.y - this.y, 2));
    }

}