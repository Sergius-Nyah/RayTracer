/**
 * @author mrdoob / http://mrdoob.com
 * @author alteredq / http://alteredqualia.com/
 * @author Sergius / https://sergius.tech
 * 
 */
// This file is a modified version of the original file from three.js /!\

var container, scene, renderer;
var controls, object, camera, place, maesh;
var plane, mesh, camera2;
var mouseX = 0,
    mouseY = 0;
const windowHalfX = window.innerWidth / 2;
const windowHalfY = window.innerHeight / 2;
var showPerspective = true;

window.addEventListener('resize', () => {
    $('#objlayer').width($('#raylayer').width());
    $('#objlayer').height($('#raylayer').height());
}, false);

//Determines if raylayer exists and has a width and height
function checkRayLayer() {
    const rayLayer = $('#raylayer');
    if (rayLayer && rayLayer.width() && rayLayer.height()) {
        // The raylayer exists and has a width and height
        return rayLayer;
    } else {
        // The raylayer doesn't exist or doesn't have a width or height
        console.error('#raylayer element not found or has no width or height');
        return false;
    }
}

function startRendering() {
    init();
    animate();
   
    if(checkRayLayer()){
    //calculate the half-width and half-height of the element
    windowHalfX = $('#raylayer').width() / 2;
    windowHalfY = $('#raylayer').height() / 2;
    }
    else{
        //if the element doesn't exist or has no width or height.
        console.error('#raylayer element not found or has no width or height');
    }
}

// Function to create plane 
function createPlane(geometry, material, x, y, z, rotationX, rotationY, rotationZ) {
    const plane = new THREE.Mesh(geometry, material);
    plane.position.set(x, y, z);
    plane.rotation.set(rotationX, rotationY, rotationZ);
    scene.add(plane);
}

const PLANE_COLOR = 0x724a2f;
const PLANE_DIMENSIONS = 100;
const PLANE_SPECULAR = 0x707070;
function init() {

    container = document.createElement('div');
    $('#objlayer').append(container);

    camera = new THREE.PerspectiveCamera(35, $('#raylayer').width() / $('#raylayer').height(), 1, 100);
    camera2 = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 1000);
    // camera.position.z = 10;
    camera.position.set(0, 0, -2);
    camera2.position.set(0, 0, -280);

    cameraTarget = new THREE.Vector3(0, 0, 0);

    // creates a scene
     scene = new THREE.Scene();
    
     // Adds directional lights to the scene
    const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.5);
    scene.add(directionalLight1);
    scene.fog = new THREE.Fog(PLANE_COLOR, 2, 15);


    // ground
    plane = new THREE.Mesh(
        new THREE.PlaneBufferGeometry(1, 1),
        new THREE.MeshPhongMaterial({
            color: 0xffffff,
            specular: PLANE_SPECULAR
        })
    );
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = -0.5;
    plane.receiveShadow = true;
    plane.normal = new THREE.Vector3(0, 1, 0);
    scene.add(plane);

    // ceil
    plane = new THREE.Mesh(
        new THREE.PlaneBufferGeometry(1, 1),
        new THREE.MeshPhongMaterial({
            color: 0xffffff,
            specular: 0x000000
        })
    );
    plane.rotation.x = Math.PI / 2;
    plane.position.y = 0.5;
    plane.receiveShadow = true;

    plane.normal = new THREE.Vector3(0, -1, 0);
    scene.add(plane);

    // light
    plane = new THREE.Mesh(
        new THREE.PlaneBufferGeometry(0.25, 0.25),
        new THREE.MeshBasicMaterial({
            color: 0xffffff
            // specular: 0xffffff,
            // shininess: 150
        })
    );
    plane.rotation.x = Math.PI / 2;
    plane.position.y = 0.49999;
    plane.position.z = 0;
    plane.receiveShadow = true;

    plane.normal = new THREE.Vector3(0, -1, 0);
    scene.add(plane);

    // right

    plane = new THREE.Mesh(
        new THREE.PlaneBufferGeometry(1, 1),
        new THREE.MeshPhongMaterial({
            color: 0x910606,
            specular: PLANE_SPECULAR
        })
    );
    plane.rotation.y = -Math.PI / 2;
    plane.position.x = 0.5;
    plane.receiveShadow = true;

    plane.normal = new THREE.Vector3(-1, 0, 0);
    scene.add(plane);

    // left
    plane = new THREE.Mesh(
        new THREE.PlaneBufferGeometry(1, 1),
        new THREE.MeshPhongMaterial({
            color: 0x063c06,
            specular: PLANE_SPECULAR //0x707070;
        })
    );
    plane.rotation.y = Math.PI / 2;
    plane.position.x = -0.5;
    plane.receiveShadow = true;

    plane.normal = new THREE.Vector3(1, 0, 0);
    scene.add(plane);

    // back

    plane = new THREE.Mesh(
        new THREE.PlaneBufferGeometry(1, 1),
        new THREE.MeshPhongMaterial({
            color: 0xffffff,
            specular: PLANE_SPECULAR
        })
    );
    plane.rotation.z = Math.PI;
    plane.position.z = -0.5;
    plane.receiveShadow = true;

    plane.normal = new THREE.Vector3(0, 0, 1);
    scene.add(plane);

    // front

    plane = new THREE.Mesh(
        new THREE.PlaneBufferGeometry(1, 1),
        new THREE.MeshPhongMaterial({
            color: 0xffffff,
            specular: PLANE_SPECULAR
        })
    );
    plane.rotation.y = Math.PI;
    plane.position.z = 0.5;
    plane.receiveShadow = true;

    plane.normal = new THREE.Vector3(0, 0, -1);
    scene.add(plane);


    var ambient = new THREE.AmbientLight(0x050505);
    scene.add(ambient);
    addSpotLight(0, 0.45, 0, 0xffdd88, 0.25);
    addPointLight(0, 0.45, 0, 0xffdd88, 0.25);
    //addPointLight(0, 0, -1, 0xffab36, 0.25);
    //

    renderer = new THREE.WebGLRenderer({
        antialias: true
    });
    renderer.setClearColor(scene.fog.color);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize($('#raylayer').width(), $('#raylayer').height());

    renderer.gammaInput = true;
    renderer.gammaOutput = true;

    renderer.shadowMap.enabled = true;
    renderer.shadowMap.cullFace = THREE.CullFaceBack;

    container.appendChild(renderer.domElement);
    // document.addEventListener('mousemove', onDocumentMouseMove, false);


    scene.add(camera);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = false;
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.enableKeys = true;
    controls.maxPolarAngle = Math.PI / 2;
    controls.minPolarAngle = Math.PI / 2;
    controls.addEventListener('change', animate);
    // addAreaLight();
    //

    window.addEventListener('resize', onWindowResize, false);

}

function loadModel() {
    try {
        scene.remove(object);
    } catch (e) {}
    var manager = new THREE.LoadingManager();
    manager.onProgress = function(item, loaded, total) {
        console.info(item, loaded, total);
        if (loaded == total) {
            animate();
        }
    };

    var texture = new THREE.Texture();

    var onProgress = function(xhr) {
        if (xhr.lengthComputable) {
            var percentComplete = xhr.loaded / xhr.total * 100;
            console.info(Math.round(percentComplete, 2) + '% downloaded');
        }
    };

    var onError = function(xhr) {};

    var loader = new THREE.OBJLoader(manager);
    loader.load('obj/' + $('#filename').val(), function(object0) {
        object0.traverse(function(child) {
            if (child instanceof THREE.Mesh) {
                // child.material.map = texture;
                var r = Math.round(Math.random() * 0xff / 2);
                var g = Math.round(Math.random() * 0xff / 2);
                var b = Math.round(Math.random() * 0xff / 2);
                child.material = new THREE.MeshPhongMaterial({
                    // color: 0xffffff,
                    color: 0x020000 * r + 0x000200 * g + 0x000002 * b,
                    specular: 0xffffff,//0x010000 * r + 0x000100 * g + 0x000001 * b,
                    //707070,
                    // shading: THREE.SmoothShading
                    // side: THREE.DoubleSide,
                    shading: $('#smooth')[0].checked ? THREE.SmoothShading : THREE.FlatShading
                })
                child.castShadow = true;
                child.receiveShadow = true;
                child.geometry = new THREE.Geometry().fromBufferGeometry(child.geometry);
                child.geometry.normalize();
                child.geometry.computeBoundingSphere();

                var s = child.geometry.boundingSphere;
                var c = s.center;
                var r = s.radius;

                child.geometry.computeBoundingBox();

                var b = child.geometry.boundingBox;
                var b1 = b.min;
                // console.log(r);
                // console.log(b1);
                var b2 = b.max;
                var scale = 0.5;
                child.scale.set(scale / r, scale / r, scale / r);
                child.position.set(-c.x * scale / r, -c.y * scale / r - 0.5 + (c.y - b1.y) * scale / r + 0.0001, -c.z * scale / r);
                child.geometry.mergeVertices();
                child.geometry.computeVertexNormals();
                child.geometry.computeFaceNormals();
                mesh = child;
            }
        });

        // object.position.y = -80;
        scene.add(object0);
        object = object0;


    }, onProgress, onError);

}

function addPointLight(x, y, z, color, intensity) {
    var light = new THREE.PointLight(color, intensity);
    light.position.set(x, y, z);
    // scene.add(light);
    // light.castShadow = true;
    // light.shadowCameraVisible = true;
    // var sphereSize = 0.3;
    // var pointLightHelper = new THREE.PointLightHelper(light, sphereSize);
    // scene.add(pointLightHelper);
    scene.add(light);
}

function addSpotLight(x, y, z, color, intensity) {
    var spotLight = new THREE.SpotLight(color);
    spotLight.position.set(x, y, z);

    spotLight.castShadow = false;

    spotLight.shadowMapWidth = 1024;
    spotLight.shadowMapHeight = 1024;

    spotLight.shadowCameraNear = 0.5;
    spotLight.shadowCameraFar = 10;
    spotLight.shadowCameraFov = 80;

    scene.add(spotLight);
    // var spotLightHelper = new THREE.SpotLightHelper( spotLight );
    // scene.add( spotLightHelper );
}

function addShadowedLight(x, y, z, color, intensity) {

    var directionalLight = new THREE.DirectionalLight(color, intensity);
    directionalLight.position.set(x, y, z);
    // scene.add(directionalLight);
    scene.add(directionalLight);

    directionalLight.castShadow = true;
    directionalLight.onlyShadow = true;
    // directionalLight.shadowCameraVisible = true;

    var d = 1;
    directionalLight.shadowCameraLeft = -d;
    directionalLight.shadowCameraRight = d;
    directionalLight.shadowCameraTop = d;
    directionalLight.shadowCameraBottom = -d;

    directionalLight.shadowCameraNear = 0.1;
    directionalLight.shadowCameraFar = 4;

    directionalLight.shadowMapWidth = 1024;
    directionalLight.shadowMapHeight = 1024;

    directionalLight.shadowBias = -0.005;
    directionalLight.shadowDarkness = 0.15;

}


function onWindowResize() {

    windowHalfX = $('#raylayer').width() / 2;
    windowHalfY = $('#raylayer').height() / 2;

    camera.aspect = $('#raylayer').width() / $('#raylayer').height();
    camera.updateProjectionMatrix();
    camera2.aspect = $('#raylayer').width() / $('#raylayer').height();
    camera2.updateProjectionMatrix();

    renderer.setSize($('#raylayer').width(), $('#raylayer').height());
    // controls.handleResize();
    animate();
}

function onDocumentMouseMove(event) {

    mouseX = (event.clientX - windowHalfX) / 2;
    mouseY = (event.clientY - windowHalfY) / 2;

}

//

function animate() {

    // requestAnimationFrame(animate);

    render();
    // if (controls)
    controls.update();
}

function render() {

    // var timer = Date.now() * 0.0005;
    //
    // camera.position.x = Math.cos(timer) * 3;
    // camera.position.z = Math.sin(timer) * 3;
    // camera2.position.x = Math.cos(timer) * 3;
    // camera2.position.z = Math.sin(timer) * 3;

    camera.lookAt(cameraTarget);
    camera2.lookAt(cameraTarget);
    renderer.render(scene, showPerspective ? camera : camera2);
}

var rotateTarget = [0, 0, 0];
var frame = 0;

function rotateTo(x, y, z, f) {
    if (frame > 0) return;
    rotateTarget = [x, y, z];
    frame = f;
    rotateToTarget();
}

function rotateToTarget() {
    /*有问题: 转动的时候，x的值不能超过PI/2或者小于-PI/2*/
    if (frame > 0) {
        var x = rotateTarget[0],
            y = rotateTarget[1],
            z = rotateTarget[2];
        var c = mesh.rotation;
        var pi2 = 2 * Math.PI;
        var dx = x - c._x,
            dy = y - c._y,
            dz = z - c._z;
        dx = (dx % pi2 + pi2) % pi2;
        dy = (dy % pi2 + pi2) % pi2;
        dz = (dz % pi2 + pi2) % pi2;
        if (dx > pi2 / 2) dx -= pi2;
        if (dy > pi2 / 2) dy -= pi2;
        if (dz > pi2 / 2) dz -= pi2;
        dx /= frame;
        dy /= frame;
        dz /= frame;
        c.set(c._x + dx, c._y + dy, c._z + dz);
        // animate();
        requestAnimationFrame(animate);
        setTimeout(function() {
            rotateToTarget(frame - 1);
            frame--;
        }, 1000 / 30);
        return;
    }
    animate();
}

