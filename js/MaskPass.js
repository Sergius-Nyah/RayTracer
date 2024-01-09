THREE.MaskPass = function ( scene, camera ) {

    this.scene = scene;
    this.camera = camera;

    this.enabled = true;
    this.clear = true;
    this.needsSwap = false;

    this.inverse = false;

};

THREE.MaskPass.prototype = {

    setInverse: function (inverse) {
        this.inverse = inverse;
    },

    setEnabled: function (enabled) {
        this.enabled = enabled;
    },

    render: function ( renderer, writeBuffer, readBuffer, delta ) {

            /**
             * The rendering context used by the renderer.
             * @type {CanvasRenderingContext2D | WebGLRenderingContext}
             */
            var context = renderer.context;
    
            // don't update color or depth
    
            context.colorMask( false, false, false, false );
            context.depthMask( false );
    
            // set up stencil
    
            var writeValue, clearValue;
    
            if ( this.inverse ) {
    
                writeValue = 0;
                clearValue = 1;
    
            } else {
    
                writeValue = 1;
                clearValue = 0;
    
            }
    
            context.enable( context.STENCIL_TEST );
            context.stencilOp( context.REPLACE, context.REPLACE, context.REPLACE );
            context.stencilFunc( context.ALWAYS, writeValue, 0xffffffff );
            context.clearStencil( clearValue );
    
            // draw into the stencil buffer
    
            renderer.render( this.scene, this.camera, readBuffer, this.clear );
            renderer.render( this.scene, this.camera, writeBuffer, this.clear );
    
            // re-enable update of color and depth
    
            context.colorMask( true, true, true, true );
            context.depthMask( true );
    
            // only render where stencil is set to 1
    
            context.stencilFunc( context.EQUAL, 1, 0xffffffff );  // draw if == 1
            context.stencilOp( context.KEEP, context.KEEP, context.KEEP );
    
        }
};

THREE.ClearMaskPass = function () {

    this.enabled = true;

};
// Clears the stencil mark after it has been applied. 
THREE.ClearMaskPass.prototype = {

    setEnabled: function (enabled) {
        this.enabled = enabled;
    },

    render: function ( renderer, writeBuffer, readBuffer, delta ) {

        // Existing code

		var context = renderer.context;

		context.disable( context.STENCIL_TEST );

    }

};