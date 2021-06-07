const state = {
    stars: [],
    bodies: [],
    tick: 0,
    activeBody: null,
    config: {
        renderStars: document.getElementById('config-show-stars').checked,
        showVelocity: document.getElementById('config-show-velocity').checked,
        speed: document.getElementById('config-speed').value || 1,
        paused: document.getElementById('config-paused').checked,
        gravity: document.getElementById('config-gravity').value || 1
    },
    previousCanvasHeight: 0,
    previousCanvasWidth: 0
}

const pause = () => {
    document.getElementById('config-paused').checked = true;
    state.config.paused = true;
}

const unpause = () => {
    document.getElementById('config-paused').checked = false;
    state.config.paused = false;
}

toggleHelpMenu = () => {
    const container = document.getElementById('help-menu-container');
    if(container.style.display === 'none') {
        container.style.display = 'flex';
    } else {
        container.style.display = 'none';
    }
}

/**
 * Sets the active body and adjusts the UI accordingly. If null, the active body UI is hidden.
 * @param {?Body} body 
 */
const setActiveBody = (body) => {
    state.activeBody = body;
    const configActiveBody = document.getElementById('config-active-body');
    configActiveBody.style.display = (body === null ? 'none' : 'flex');
    if (body !== null) {
        document.getElementById('active-body-color').value = body.color;
        document.getElementById('active-body-mass').value = body.mass;
        document.getElementById('active-body-radius').value = body.radius;
        document.getElementById('active-body-velocity-x').value = body.velocity.x;
        document.getElementById('active-body-velocity-y').value = body.velocity.y;
        document.getElementById('active-body-position-x').value = body.position.x;
        document.getElementById('active-body-position-y').value = body.position.y;
    }
}

/**
 * Calculates the force of gravity between two bodies.
 * F = (m_1 * m_2 * G) / (d^2) 
 * @param {*} body1 
 * @param {*} body2 
 * @returns {Number}
 */
const gravity = (body1, body2) => {
    const distance = (body1.position.distance(body2.position))
    return (state.config.gravity * body1.mass * body2.mass) / (distance * distance);
}

const generateStars = () => {
    const canvas = document.getElementById('canvas');
    const totalPixels = canvas.width * canvas.height;
    const numStars = Math.floor(totalPixels / 2500);
    state.stars = [];
    for (let i = 0; i < numStars; i++) {
        state.stars.push(new Body(
            position = new Vector(Math.floor(Math.random() * canvas.width), Math.floor(Math.random() * canvas.height)),
            mass = 0,
            radius = Math.floor(Math.random() * 5),
            velocity = new Vector(0, 0)
        ));
    }
}

/**
 * Generates background stars and sets the list of bodies equal to one sun centered on the screen.
 */
const initialize = () => {
    const canvas = document.getElementById('canvas');
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    generateStars();
    state.bodies = [
        new Body(
            position = new Vector(0.50 * canvas.width, 0.5 * canvas.height),
            mass = 2000,
            radius = 50,
            velocity = new Vector(0, 0),
            color = 'yellow'
        )
    ];
    setActiveBody(state.bodies[0]);
    state.previousCanvasWidth = canvas.getBoundingClientRect().width;
    state.previousCanvasHeight = canvas.getBoundingClientRect().height;

}

/**
 * Calculates the updated velocities for all orbiting bodies.
 */
const updateVelocities = () => {
    state.bodies.forEach((body1) => {
        state.bodies.forEach((body2) => {
            if (body1 !== body2) {
                // We only calculate the force of b1 on b2
                // as the force of b2 on b1 will be calculated
                // in a future loop.
                const magnitude = gravity(body1, body2);
                const direction = new Vector(body2.position.x - body1.position.x, body2.position.y - body1.position.y).norm();
                const forceGravity = direction.scale(magnitude);
                if (body1.mass > 0) {
                    body1.velocity.x += (forceGravity.x / body1.mass);  //F = ma; divide by m to get a
                    body1.velocity.y += (forceGravity.y / body1.mass);
                }
            }
        });
    });
}

/**
 * Calculates the acceleration of each body and updates their positions according to the equation for gravity. 
 */
const updatePositions = () => {
    const canvas = document.getElementById('canvas');
    state.bodies.forEach((body) => {
        body.position.x += body.velocity.x;
        body.position.y += body.velocity.y;
        if(body.position.x > canvas.width) body.position.x = body.position.x % canvas.width;
        if(body.position.y > canvas.height) body.position.y = body.position.y % canvas.height;
        if(body.position.x < 0) body.position.x = canvas.width;
        if(body.position.y < 0) body.position.y = canvas.height;
    });
}

/**
 * Combines two bodies that have collided into a single body.
 * Some energy is lost during this process.
 */
const collisionDetection = () => {

    const deleted = [];

    state.bodies.forEach((body1) => {
        state.bodies.forEach((body2) => {
            if (body1 !== body2 && (body1.position.distance(body2.position) < body1.radius + body2.radius)) {

                const totalMass = body1.mass + body2.mass;

                const velocity1 = new Vector(body1.velocity.x * body1.mass / totalMass, body1.velocity.y * body1.mass / totalMass);
                const velocity2 = new Vector(body2.velocity.x * body2.mass / totalMass, body2.velocity.y * body2.mass / totalMass);

                const position1 = new Vector(body1.position.x * body1.mass / totalMass, body1.position.y * body1.mass / totalMass);
                const position2 = new Vector(body2.position.x * body2.mass / totalMass, body2.position.y * body2.mass / totalMass);

                state.bodies.push(new Body(
                    position = position1.add(position2),
                    mass = body1.mass + body2.mass,
                    radius = body1.radius + body2.radius,
                    velocity = velocity1.add(velocity2).scale(0.95),
                    color = body1.mass > body2.mass ? body1.color : body2.color
                ));

                body1.mass = 0;
                body2.mass = 0;

                body1.radius = 0;
                body2.radius = 0;

                deleted.push(body1);
                deleted.push(body2);

            }
        });
    });

    state.bodies = state.bodies.filter((body) => {
        return !deleted.includes(body);
    });

}

/**
 * Updates the game state; equivalent to a traditional "tick" function.
 */
const updateState = () => {
    for (let i = 0; i < state.config.speed; i++) {
        updateVelocities();
        updatePositions();
        collisionDetection();
    }
    setActiveBody(state.activeBody);
}

const renderBackground = (canvas, context) => {
    context.fillStyle = 'black';
    context.fillRect(0, 0, canvas.width, canvas.height);
}

/**
 * renders the stars (if enabled), the orbiting bodies, and their velocity lines (if enabled)
 * @param {*} canvas 
 * @param {*} context 
 */
const renderBodies = (canvas, context) => {

    context.lineWidth =  1;
    if (state.config.renderStars) {
        state.stars.forEach((star) => {
            context.strokeStyle = star.color;
            context.beginPath();
            context.arc(star.position.x, star.position.y, star.radius, 0, 2 * Math.PI, false);
            context.stroke();
        });
    }

    state.bodies.forEach((body) => {
        //render body
        context.fillStyle = body.color;
        context.beginPath();
        context.arc(body.position.x, body.position.y, body.radius, 0, 2 * Math.PI, false);
        context.fill();

        //if selected, render outline
        if (state.activeBody === body) {
            context.strokeStyle = body.color
            context.lineWidth = Math.floor(Math.abs(Math.sin(state.tick / 15)) * 10)
            context.beginPath();
            context.arc(body.position.x, body.position.y, body.radius, 0, 2 * Math.PI, false);
            context.stroke();

        }

        //render velocity indicator
        if (state.config.showVelocity) {
            context.strokeStyle = body.color;
            context.lineWidth = 1;
            context.beginPath();
            context.lineTo(body.position.x, body.position.y);
            context.lineTo(body.position.x + (body.velocity.x * 100), body.position.y + (body.velocity.y * 100));
            context.stroke();
        }

    });

}

const render = () => {

    if (!state.config.paused) {
        updateState();
    }

    const canvas = document.getElementById('canvas');
    const context = canvas.getContext('2d');

    renderBackground(canvas, context);
    renderBodies(canvas, context);

    state.tick++;
    state.tick = state.tick % 100000

    window.requestAnimationFrame(render);
}

initialize();
render();