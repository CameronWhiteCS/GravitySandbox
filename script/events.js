document.getElementById('config-show-velocity').onchange = (e) => state.config.showVelocity = e.target.checked;

document.getElementById('config-show-stars').onchange = (e) => state.config.renderStars = e.target.checked;

document.getElementById('config-paused').onchange = (e) => state.config.paused = e.target.checked;

document.getElementById('config-speed').onchange = (e) => {
    if (isNaN(e.target.value) || e.target.value == undefined || e.target.value == '') {
        return false;
    } else {
        state.config.speed = Math.floor(e.target.value);
        return true;
    }
}

document.getElementById('config-gravity').onchange = (e) => {
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

    let clickedBody = null;

    for (let i = 0; i < state.bodies.length; i++) {
        const body = state.bodies[i];
        if (body.position.distance(truePositiion) <= body.radius) {
            clickedBody = body;
            break;
        }
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
            state.bodies.push(newBody);
            setActiveBody(newBody);
            pause();
        }
    } else {
        setActiveBody(clickedBody);
    }


}

document.getElementById('active-body-color').onchange = (e) => {
    const blacklist = ['black', 'fff', '#fff', 'ffffff', '#ffffff'];
    if (!blacklist.includes(e.target.value)) {
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

document.getElementById('close-config').onclick = (e) => {
    document.getElementById('controls-toggle').checked = false;
}

document.getElementById('active-body-delete').onclick = (e) => {
    state.bodies = state.bodies.filter((body) => {
        return body !== state.activeBody;
    });
    setActiveBody(null);
};

window.onresize = (e) => {

    const canvas = document.getElementById('canvas');

    canvas.width = canvas.getBoundingClientRect().width;
    canvas.height = canvas.getBoundingClientRect().height;

    const scaleX = canvas.getBoundingClientRect().width / state.previousCanvasWidth;
    const scaleY = canvas.getBoundingClientRect().height / state.previousCanvasHeight;



    state.bodies.forEach((body) => {
        body.position.x *= scaleX;
        body.position.y *= scaleY;
    });


    state.previousCanvasWidth = canvas.getBoundingClientRect().width;
    state.previousCanvasHeight = canvas.getBoundingClientRect().height;


    setActiveBody(state.activeBody);

    generateStars();


}