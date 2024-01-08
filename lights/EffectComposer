/*
 * @Author: Sergius Nyah (https://sergius.tech) [Refactored from AlteredQualia]
 * @Date: 2024-01-08 
 * @summary: Full-screen textured quad shader
 */


// Manages a sequence of shader passes that are applied to the screen

THREE.EffectComposer = class {
    constructor(renderer, renderTarget = new THREE.WebGLRenderTarget(window.innerWidth || 1, window.innerHeight || 1, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat, stencilBuffer: false })) {

        this.renderer = renderer;

        this.renderTarget1 = renderTarget;
        this.renderTarget2 = renderTarget.clone();

        this.writeBuffer = this.renderTarget1;
        this.readBuffer = this.renderTarget2;

        this.passes = [];

        if (THREE.CopyShader === undefined)
            console.error("THREE.EffectComposer relies on THREE.CopyShader");

        this.copyPass = new THREE.ShaderPass(THREE.CopyShader);

    }
    // Swaps the buffers and sets the write buffer to the read buffer using a destructuring assignment
    swapBuffers() {

        [this.readBuffer, this.writeBuffer] = [this.writeBuffer, this.readBuffer];

    }
    addPass(pass) {

        this.passes.push(pass);

    }
    insertPass(pass, index) {

        this.passes.splice(index, 0, pass);

    }
    render(delta) {

        this.writeBuffer = this.renderTarget1;
        this.readBuffer = this.renderTarget2;

        let maskActive = false;

        for (let pass of this.passes) {

            if (!pass.enabled) continue; 

            pass.render(this.renderer, this.writeBuffer, this.readBuffer, delta, maskActive);

            if (pass.needsSwap) {

                if (maskActive) {

                    const context = this.renderer.context;

                    context.stencilFunc(context.NOTEQUAL, 1, 0xffffffff);

                    this.copyPass.render(this.renderer, this.writeBuffer, this.readBuffer, delta);

                    context.stencilFunc(context.EQUAL, 1, 0xffffffff);

                }

                this.swapBuffers(); // Swap the read and write buffers

            }

            if (pass instanceof THREE.MaskPass) {

                maskActive = true;

            } else if (pass instanceof THREE.ClearMaskPass) {

                maskActive = false;

            }

        }

    }
    // Resets the render targets and sets the write buffer to the read buffer
    reset(renderTarget = this.renderTarget1.clone()) {

        renderTarget.width = window.innerWidth;
        renderTarget.height = window.innerHeight;

        this.renderTarget1 = renderTarget;
        this.renderTarget2 = renderTarget.clone();

        this.writeBuffer = this.renderTarget1;
        this.readBuffer = this.renderTarget2;

    }
    setSize(width, height) {

        let renderTarget = this.renderTarget1.clone();

        renderTarget.width = width;
        renderTarget.height = height;

        this.reset(renderTarget);

    }
};


// shared ortho camera

THREE.EffectComposer.camera = new THREE.OrthographicCamera( -1, 1, 1, -1, 0, 1 );

THREE.EffectComposer.quad = new THREE.Mesh( new THREE.PlaneGeometry( 2, 2 ), null );

THREE.EffectComposer.scene = new THREE.Scene();
THREE.EffectComposer.scene.add( THREE.EffectComposer.quad );