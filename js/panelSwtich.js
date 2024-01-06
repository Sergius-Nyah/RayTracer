const rayTracingTab =  document.getElementById('rayTracingTab');
const webGLTab = document.getElementById('webGLTab');
const raylayer = document.getElementById('raylayer');
const objlayer = document.getElementById('objlayer');

rayTracingTab.addEventListener('click', function() {
raylayer.style.display = 'block';
objlayer.style.display = 'none';
});

webGLTab.addEventListener('click', function() {
    raylayer.style.display = 'none';
    objlayer.style.display = 'block';
});
