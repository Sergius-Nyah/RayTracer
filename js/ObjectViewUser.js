var container, scene, renderer; 

var controls, object, camera, place, maesh;

var plane, mesh;

var mouseX = 0,
    mouseY = 0;

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

var showPerspective = true;

window.addEventListener('resize', () => {
    $('#objlayer').width($('#raylayer').width());
    $('#objlayer').height($('#raylayer').height());
}, false);

function startRendering() {
    init();
    animate();
    windowHalfX = $('#raylayer').width() / 2;
    windowHalfY = $('#raylayer').height() / 2;
}
