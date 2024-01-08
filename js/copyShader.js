/**
 * @author1 alteredq / http://alteredqualia.com/ [Base] 
 * @author2 Sergius-N / https//github.com/Sergius-Nyah [Refactored]
 *
 * Full-screen textured quad shader
 */

// Define the CopyShader object on the THREE namespace
THREE.CopyShader = {

    // Define the uniforms for the shader. These are global variables that are the same for all vertices and fragments.
    uniforms: {
        // The texture to apply to the quad
        "tDiffuse": { type: "t", value: null },
        // The opacity of the quad
        "opacity":  { type: "f", value: 1.0 }
    },

    // Define the vertex shader code. This code is executed for each vertex of the geometry.
    vertexShader: [
        // Declare a varying variable to pass the texture coordinates from the vertex shader to the fragment shader
        "varying vec2 vUv;",

        // The main function of the vertex shader
        "void main() {",
            // Set the texture coordinates equal to the UV coordinates of the vertex
            "vUv = uv;",
            // Calculate the clip-space position of the vertex
            "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
        "}"
    ].join("\n"),

    // Define the fragment shader code. This code is executed for each pixel of the geometry.
    fragmentShader: [
        // Declare the opacity uniform
        "uniform float opacity;",

        // Declare the texture uniform
        "uniform sampler2D tDiffuse;",

        // Declare the varying for the texture coordinates
        "varying vec2 vUv;",

        // The main function of the fragment shader
        "void main() {",
            // Sample the texture at the texture coordinates to get the color of the pixel
            "vec4 texel = texture2D( tDiffuse, vUv );",
            // Multiply the color by the opacity and set it as the output color of the fragment
            "gl_FragColor = opacity * texel;",
        "}"
    ].join("\n")
};