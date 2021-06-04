const state = {
    stars: [],
    bodies: [],
    tick: 0,
    activeBody: null,
    config: {
        drawStars: document.getElementById('config-show-stars').checked,
        showVelocity: document.getElementById('config-show-velocity').checked,
        speed: document.getElementById('config-speed').value || 1,
        paused: document.getElementById('config-paused').checked,
        gravity: document.getElementById('config-gravity').value || 1
    }
}

toggleHelpMenu = () => {
    const container = document.getElementById('help-menu-container');
    if(container.style.display === 'none') {
        container.style.display = 'flex';
    } else {
        container.style.display = 'none';
    }
}

const setActiveBody = (body) => {
    state.activeBody = body;
    const configActiveBody = document.getElementById('config-active-body');
    configActiveBody.style.display = body === null ? 'none' : 'flex'
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
 * @param {*} body1 
 * @param {*} body2 
 * @returns {Number}
 */
const gravity = (body1, body2) => {
    const distance = (body1.position.distance(body2.position))
    return (state.config.gravity * body1.mass * body2.mass) / (distance * distance);
}

const initialize = () => {
    const canvas = document.getElementById('canvas');
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    const totalPixels = canvas.width * canvas.height;
    const numStars = Math.floor(totalPixels / 2500);
    for (let i = 0; i < numStars; i++) {
        state.stars.push(new Body(
            position = new Vector(Math.floor(Math.random() * canvas.width), Math.floor(Math.random() * canvas.height)),
            mass = 0,
            radius = Math.floor(Math.random() * 5),
            velocity = new Vector(0, 0)
        ));
    }
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

}

const updateVelocities = () => {
    state.bodies.forEach((body1) => {
        state.bodies.forEach((body2) => {
            if (body1 !== body2) {
                // We only calculate the force of b1 on b2
                // as the force of b2 on b1 will be calculated
                // in a future loop.
                const magnitude = gravity(body1, body2)
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

const deleteRemoteBodies = () => {

}

const updateState = () => {
    for (let i = 0; i < state.config.speed; i++) {
        updateVelocities();
        updatePositions();
        collisionDetection();
        deleteRemoteBodies();
    }
    setActiveBody(state.activeBody);
}

const drawBackground = (canvas, context) => {
    context.fillStyle = 'black';
    context.fillRect(0, 0, canvas.width - 1, canvas.height - 1);
}

/**
 * Draws the stars (if enabled), the orbiting bodies, and their velocity lines (if enabled)
 * @param {*} canvas 
 * @param {*} context 
 */
const drawBodies = (canvas, context) => {

    context.lineWidth =  1;
    if (state.config.drawStars) {
        state.stars.forEach((star) => {
            context.strokeStyle = star.color;
            context.beginPath();
            context.arc(star.position.x, star.position.y, star.radius, 0, 2 * Math.PI, false);
            context.stroke();
        });
    }

    state.bodies.forEach((body) => {
        //draw body
        context.fillStyle = body.color;
        context.beginPath();
        context.arc(body.position.x, body.position.y, body.radius, 0, 2 * Math.PI, false);
        context.fill();

        //if selected, draw outline
        if (state.activeBody === body) {
            context.strokeStyle = body.color
            context.lineWidth = Math.floor(Math.abs(Math.sin(state.tick / 15)) * 10)
            context.beginPath();
            context.arc(body.position.x, body.position.y, body.radius, 0, 2 * Math.PI, false);
            context.stroke();

        }

        //draw velocity indicator
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

const pause = () => {
    document.getElementById('config-paused').checked = true;
    state.config.paused = true;
}

const animate = () => {

    if (!state.config.paused) {
        updateState();
    }

    const canvas = document.getElementById('canvas');
    const context = canvas.getContext('2d');

    drawBackground(canvas, context);
    drawBodies(canvas, context);

    state.tick++;
    state.tick = state.tick % 100000

    window.requestAnimationFrame(animate);
}

initialize();
animate();

document.getElementById('config-show-velocity').onchange = (e) => state.config.showVelocity = e.target.checked;
document.getElementById('config-show-stars').onchange = (e) => state.config.drawStars = e.target.checked;
document.getElementById('config-paused').onchange = (e) => state.config.paused = e.target.checked;

document.getElementById('config-speed').onkeyup = (e) => {
    if (isNaN(e.target.value) || e.target.value == undefined || e.target.value == '') {
        return false;
    } else {
        state.config.speed = Math.floor(e.target.value);
        return true;
    }
}

document.getElementById('config-gravity').onkeyup = (e) => {
    if (isNaN(e.target.value) || e.target.value == undefined || e.target.value == '') {
        return false;
    } else {
        state.config.gravity = e.target.value
        return true;
    }
}

document.getElementById('canvas').onclick = (e) => {

    const canvas = document.getElementById('canvas');
    const trueX = Math.floor((e.clientX - canvas.getBoundingClientRect().x) * (canvas.width / canvas.getBoundingClientRect().width));
    const trueY = Math.floor((e.clientY - canvas.getBoundingClientRect().y) * (canvas.height / canvas.getBoundingClientRect().height));
    const truePositiion = new Vector(trueX, trueY);

    let clickedBody;

    for (let i = 0; i < state.bodies.length; i++) {
        const body = state.bodies[i];
        if (body.position.distance(truePositiion) <= body.radius) {
            clickedBody = body;
            break;
        }
        clickedBody = null;
    }

    if (clickedBody === null) {
        if (state.activeBody !== null) {
            setActiveBody(null);
        } else {
            const newBody = new Body(
                position = new Vector(truePositiion.x, truePositiion.y),
                mass = 1,
                radius = 17,
                velocity = new Vector(0, 0),
                color = 'white'
            );
            setActiveBody(newBody);
            state.bodies.push(newBody);
            pause();
        }
    } else {
        setActiveBody(clickedBody);
    }


}

document.getElementById('active-body-color').onchange = (e) => {
    const blacklist = ['black', 'fff', '#fff', 'ffffff', '#ffffff'];
    if(!blacklist.includes(e.target.value)) {
        state.activeBody.color = e.target.value;
    }
};

document.getElementById('active-body-mass').onchange = (e) => {
    state.activeBody.mass = parseInt(e.target.value);
};

document.getElementById('active-body-radius').onchange = (e) => {
    state.activeBody.radius = parseInt(e.target.value);
};

document.getElementById('active-body-velocity-x').onchange = (e) => {
    state.activeBody.velocity.x = parseFloat(e.target.value);
};

document.getElementById('active-body-velocity-y').onchange = (e) => {
    state.activeBody.velocity.y = parseFloat(e.target.value);
};

document.getElementById('active-body-position-x').onchange = (e) => {
    state.activeBody.position.x = parseInt(e.target.value);
    console.log(state.activeBody);
};

document.getElementById('active-body-position-y').onchange = (e) => {
    state.activeBody.position.y = parseInt(e.target.value);
};

document.getElementById('active-body-delete').onclick = (e) => {
    state.bodies = state.bodies.filter((body) => {
        return body !== state.activeBody;
    });
    setActiveBody(null);
};