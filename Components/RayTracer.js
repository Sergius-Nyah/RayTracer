const RAY = {
    ctx: null,
    width: null,
    height: null,
    progress: null,
    basesize: null,
    coords: null,
    pause: null,
    timeout: null,
    scene: null,
    camera: null,
    perspective: null,
    cameraNormalMatrix: null,
    objects: null,
    lights: null,
    objcache: null,
    maxRecursionDepth: null,
    num_samples: null
};

RAY.init = function(ctx, width, height, progress) {
    this.ctx = ctx;
    this.width = width;
    this.height = height;
    this.progress = progress;
    this.pause = false;
    this.timeout = 15;
    this.lights = [];
    this.objcache = {};
    this.maxRecursionDepth = 5;
    this.num_samples = Number($('#samplersize').val());
    this.lens_size = Number($('#lenssize').val());
    this.light_size = Number($('#lightsize').val());
    this.focal_distance = Number($('#focal').val());
    this.recursion_depth = Number($('#recursion').val());
    this.reflect_strength = Number($('#reflect').val());
    this.reflect_diffusion = Number($('#reflect_d').val());

    const tmp = Math.min(this.width, this.height);
    this.basesize = 1;
    while (this.basesize << 1 < tmp) {
        this.basesize <<= 1;
    }

    const filled = Array(this.height).fill().map(() => Array(this.width).fill(false));
    this.coords = [];
    let tmpc = [0, 0];
    let size = this.basesize;
    for (let i = 0; i < this.height * this.width; i++) {
        this.coords.push({ x: tmpc[0], y: tmpc[1], size });

        filled[tmpc[1]][tmpc[0]] = true;
        while (size > 0 && filled[tmpc[1]][tmpc[0]]) {
            tmpc[0] += size;
            if (tmpc[0] >= this.width) {
                tmpc[0] = 0;
                tmpc[1] += size;
            }
            if (tmpc[1] >= this.height) {
                tmpc[1] = 0;
                size >>= 1;
            }
        }
    }
}
RAY.initScene = function(scene, camera) {
    this.scene = scene;
    this.camera = camera;
    this.cameraNormalMatrix = new THREE.Matrix3();
    this.cameraNormalMatrix.getNormalMatrix(this.camera.matrixWorld);
    this.perspective = 0.5 / Math.tan(THREE.Math.degToRad(camera.fov * 0.5)) * this.height;
    this.objects = scene.children;

    this.num_samples = Number($('#samplersize').val());
    this.lens_size = Number($('#lenssize').val());
    this.light_size = Number($('#lightsize').val());
    this.focal_distance = Number($('#focal').val());
    this.recursion_depth = Number($('#recursion').val());
    this.reflect_strength = Number($('#reflect').val());
    this.reflect_diffusion = Number($('#reflect_d').val());

    scene.traverse((object) => {
        if (object instanceof THREE.Light && object.type === "PointLight") {
            this.lights.push(object);
        }
        if (this.objcache[object.id] === undefined) {
            this.objcache[object.id] = {
                normalMatrix: new THREE.Matrix3(),
                inverseMatrix: new THREE.Matrix4()
            };
        }
        const modelViewMatrix = new THREE.Matrix4();
        modelViewMatrix.multiplyMatrices(this.camera.matrixWorldInverse, object.matrixWorld);

        const _object = this.objcache[object.id];
        _object.normalMatrix.getNormalMatrix(modelViewMatrix);
        _object.inverseMatrix.getInverse(object.matrixWorld);
    });
}

RAY.traceCanvas = function(onprocess, onfinish) {
    const end = this.width * this.height;
    while (!this.pause && this.progress < end) {
        const coord = this.coords[this.progress];
        const c = RAY.tracePixel(coord.x, this.height - coord.y);
        const n = coord.size;
        this.coords[this.progress].color = this.ctx.fillStyle = `rgba(${c.r},${c.g},${c.b},${c.a})`;
        this.ctx.fillRect(coord.x, coord.y, n, n);
        this.progress++;
        if (this.progress > 1 && this.coords[this.progress - 1].y !== this.coords[this.progress - 2].y) {
            onprocess();
            setTimeout(() => {
                RAY.traceCanvas(onprocess, onfinish)
            }, this.timeout);
            break;
        }
    }
    if (this.progress === end) {
        onprocess();
        onfinish();
    }
}

RAY.tracePixel = function(x, y) {
    const origin = new THREE.Vector3();
    let outputColor = new THREE.Color(0, 0, 0);
    const num_samples2 = Math.pow(this.num_samples, 2);
    for (let n = 0; n < num_samples2; n++) {
        let color = new THREE.Color(0, 0, 0);
        origin.copy(this.camera.position);
        const x0 = x - 0.5 + Math.random() / this.num_samples + n % this.num_samples / this.num_samples;
        const y0 = y - 0.5 + Math.random() / this.num_samples + Math.floor(n / this.num_samples) / this.num_samples;

        const pp = [x0 - this.width / 2, y0 - this.height / 2];
        const tmp = Math.random() * Math.PI * 2;
        const lens_radius = this.lens_size * Math.random();
        const lp = [lens_radius * Math.cos(tmp), lens_radius * Math.sin(tmp)];
        origin.x += lp[0];
        origin.y += lp[1];

        lp[0] *= Math.cos(Math.atan2(camera.position.x, camera.position.z));
        lp[1] *= 1;

        const f = this.focal_distance;
        const d = this.perspective;
        const direction = new THREE.Vector3(pp[0] * f / d - lp[0], pp[1] * f / d - lp[1], -f);
        direction.applyMatrix3(this.cameraNormalMatrix);
        direction.normalize();
        this.spawnRay(origin, direction, color, 0, n, this.num_samples);
        color.r = Math.min(color.r, 1);
        color.g = Math.min(color.g, 1);
        color.b = Math.min(color.b, 1);
        outputColor.add(color);
    }
    outputColor.r /= num_samples2;
    outputColor.g /= num_samples2;
    outputColor.b /= num_samples2;
    outputColor.copyLinearToGamma(outputColor);

    return {
        r: Math.round(255 * outputColor.r),
        g: Math.round(255 * outputColor.g),
        b: Math.round(255 * outputColor.b),
        a: 1
    }
}


/*
//without lens
RAY.tracePixel = function(x, y) {
	const origin = new THREE.Vector3();
	origin.copy(this.camera.position);
	x += Math.random() - 0.5;
	y += Math.random() - 0.5;

	const direction = new THREE.Vector3(x - this.width / 2, y - this.height / 2, -this.perspective);
	direction.applyMatrix3(this.cameraNormalMatrix).normalize();

	const outputColor = new THREE.Color(0, 0, 0);
	this.spawnRay(origin, direction, outputColor, 0);

	return {
		r: Math.round(255 * outputColor.r),
		g: Math.round(255 * outputColor.g),
		b: Math.round(255 * outputColor.b),
		a: 1
	}
}
*/

RAY.spawnRay = function(origin, direction, color, recursionDepth, n, num_samples) {
    var intersections = this.raycasting(origin, direction);
    if (intersections.length == 0) {
        return;
    }
    var first = intersections[0];
    var object = first.object;
    var material = object.material;
    var diffuseColor = this.getDiffuseColor(object);
    var normalVector = new THREE.Vector3();
    var rayLightOrigin = new THREE.Vector3().copy(first.point);
    var rayLightDirection = new THREE.Vector3();
    var jitterSample = this.getJitterSample(n, num_samples);
    var eyeVector = this.getEyeVector(origin, first.point);
    var specularColor = new THREE.Color(0, 0, 0);
    var schlick = new THREE.Color(0, 0, 0);

    this.calculateLightContribution(first, material, normalVector, rayLightOrigin, rayLightDirection, jitterSample, eyeVector, color, specularColor, schlick);

    this.calculateReflection(first, direction, recursionDepth, n, num_samples, normalVector, eyeVector, color);
}

RAY.getDiffuseColor = function(object) {
    var diffuseColor = new THREE.Color(0, 0, 0);
    try {
        diffuseColor.copyGammaToLinear(object.material.color);
    } catch (e) {
        diffuseColor.set(0, 0, 0);
        console.warn("set diffuseColor fail");
    }
    return diffuseColor;
}

RAY.getJitterSample = function(n, num_samples) {
    var x0 = (n != undefined) ? (-0.5 + Math.random() / num_samples + n % num_samples / num_samples) : 0;
    var y0 = (n != undefined) ? (-0.5 + Math.random() / num_samples + Math.floor(n / num_samples) / num_samples) : 0;
    return {x0: x0, y0: y0};
}

RAY.getEyeVector = function(origin, point) {
    var eyeVector = new THREE.Vector3();
    eyeVector.subVectors(origin, point).normalize();
    return eyeVector;
}

RAY.raycasting = function(origin, direction, near, far) {
    var raycaster = new THREE.Raycaster(origin, direction);
    if (near != undefined && far != undefined) {
        raycaster.near = near;
        raycaster.far = far;
    }
    return raycaster.intersectObjects(this.objects, true);
}

