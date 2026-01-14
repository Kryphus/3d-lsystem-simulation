import * as THREE from 'three';

export class Lighting {
    constructor(scene) {
        this.scene = scene;
        this.lights = [];

        this.createAmbientLight();
        this.createDirectionalLight();
        this.createRimLight();
        this.createPointLights();
    }

    createAmbientLight() {
        const ambient = new THREE.AmbientLight(0x404080, 0.4);
        this.scene.add(ambient);
        this.lights.push(ambient);
    }

    createDirectionalLight() {
        // Main sun light
        const directional = new THREE.DirectionalLight(0xffeedd, 1.5);
        directional.position.set(10, 15, 10);
        directional.castShadow = true;

        // Shadow settings
        directional.shadow.mapSize.width = 2048;
        directional.shadow.mapSize.height = 2048;
        directional.shadow.camera.near = 0.5;
        directional.shadow.camera.far = 50;
        directional.shadow.camera.left = -15;
        directional.shadow.camera.right = 15;
        directional.shadow.camera.top = 15;
        directional.shadow.camera.bottom = -15;
        directional.shadow.bias = -0.0001;

        this.scene.add(directional);
        this.directionalLight = directional;
        this.lights.push(directional);
    }

    createRimLight() {
        // Back light for rim effect
        const rim = new THREE.DirectionalLight(0x88ccff, 0.5);
        rim.position.set(-10, 5, -10);
        this.scene.add(rim);
        this.lights.push(rim);
    }

    createPointLights() {
        // Warm accent light
        const warm = new THREE.PointLight(0xff9944, 0.5, 20);
        warm.position.set(-5, 8, -5);
        this.scene.add(warm);
        this.lights.push(warm);

        // Cool accent light
        const cool = new THREE.PointLight(0x4488ff, 0.3, 20);
        cool.position.set(5, 6, 5);
        this.scene.add(cool);
        this.lights.push(cool);
    }

    // Animate lights for dynamic feel
    update(time) {
        // Subtle movement of directional light
        if (this.directionalLight) {
            this.directionalLight.position.x = 10 + Math.sin(time * 0.1) * 2;
        }
    }
}
