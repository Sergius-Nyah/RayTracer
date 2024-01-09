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

        // Existing code...

    }

};

THREE.ClearMaskPass = function () {

    this.enabled = true;

};

THREE.ClearMaskPass.prototype = {

    setEnabled: function (enabled) {
        this.enabled = enabled;
    },

    render: function ( renderer, writeBuffer, readBuffer, delta ) {

        // Existing code...

    }

};