import * as THREE from 'three';
import { SceneManager } from './scene/SceneManager.js';
import { Island } from './scene/Island.js';
import { Lighting } from './scene/Lighting.js';
import { PlantMesh } from './plant/PlantMesh.js';
import { GrowthAnimator } from './plant/GrowthAnimator.js';
import { WindSimulator } from './plant/WindSimulator.js';
import { ForestPlants } from './plant/ForestPlants.js';

class App {
    constructor() {
        this.container = document.getElementById('canvas-container');
        this.currentPlant = null;
        this.forestPlantsSpawned = false;

        this.init();
        this.setupUI();
        this.animate();
    }

    init() {
        this.sceneManager = new SceneManager(this.container);
        this.lighting = new Lighting(this.sceneManager.scene);

        this.island = new Island();
        this.sceneManager.scene.add(this.island.getMesh());

        this.growthAnimator = new GrowthAnimator();
        this.windSimulator = new WindSimulator();

        // Create forest plants (hidden initially)
        this.forestPlants = new ForestPlants();
        this.forestPlants.generate();
        const forestMesh = this.forestPlants.getMesh();
        forestMesh.position.y = 1.55;  // Same height as main plant
        this.sceneManager.scene.add(forestMesh);

        this.growPlant('tree', 4);
    }

    setupUI() {
        const plantTypeSelect = document.getElementById('plant-type');
        plantTypeSelect?.addEventListener('change', (e) => {
            this.growPlant(e.target.value, this.getIterations());
        });

        const iterSlider = document.getElementById('iterations');
        const iterValue = document.getElementById('iter-value');
        iterSlider?.addEventListener('input', (e) => {
            iterValue.textContent = e.target.value;
        });
        iterSlider?.addEventListener('change', (e) => {
            this.growPlant(this.getPlantType(), parseInt(e.target.value));
        });

        const windSlider = document.getElementById('wind-strength');
        const windValue = document.getElementById('wind-value');
        windSlider?.addEventListener('input', (e) => {
            windValue.textContent = e.target.value;
            this.windSimulator.setWindStrength(parseFloat(e.target.value));
        });

        const growBtn = document.getElementById('grow-btn');
        growBtn?.addEventListener('click', () => {
            this.growPlant(this.getPlantType(), this.getIterations());
        });

        const resetBtn = document.getElementById('reset-btn');
        resetBtn?.addEventListener('click', () => {
            this.clearPlants();
        });
    }

    getPlantType() {
        return document.getElementById('plant-type')?.value || 'tree';
    }

    getIterations() {
        return parseInt(document.getElementById('iterations')?.value || '4');
    }

    growPlant(type, iterations) {
        if (this.currentPlant) {
            this.sceneManager.scene.remove(this.currentPlant.getMesh());
            this.currentPlant.clear();
        }

        // Reset forest plants
        this.forestPlantsSpawned = false;
        this.forestPlants.generate();

        this.currentPlant = new PlantMesh(type, iterations);
        const plantGroup = this.currentPlant.getMesh();
        const plantPos = this.island.getPlantingPosition(0, 0);
        plantGroup.position.copy(plantPos);

        this.sceneManager.scene.add(plantGroup);
        this.growthAnimator.startGrowth(this.currentPlant);
        this.windSimulator.registerPlant(this.currentPlant);
    }

    clearPlants() {
        if (this.currentPlant) {
            this.sceneManager.scene.remove(this.currentPlant.getMesh());
            this.currentPlant.clear();
            this.currentPlant = null;
        }
        this.forestPlantsSpawned = false;
        this.forestPlants.generate();
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const currentTime = performance.now() / 1000;
        if (!this.lastTime) this.lastTime = currentTime;
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        const time = this.sceneManager.getElapsedTime();

        this.island.update(time);
        this.lighting.update(time);
        this.growthAnimator.update(deltaTime);

        // When main tree finishes, spawn forest plants
        if (this.growthAnimator.isComplete() && !this.forestPlantsSpawned && this.currentPlant) {
            this.forestPlantsSpawned = true;
            this.forestPlants.startPopAnimation();
            console.log('Spawning forest plants!');
        }

        // Update forest plants animation
        this.forestPlants.update(deltaTime);

        // Wind affects both main tree and forest plants
        if (this.growthAnimator.isComplete() && this.currentPlant) {
            this.windSimulator.update(time, this.currentPlant);
            const windStrength = this.windSimulator.windStrength;
            this.forestPlants.applyWind(time, windStrength);
        }

        this.sceneManager.update();
        this.sceneManager.render();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new App();
});
