import * as THREE from 'three';

/**
 * Realistic low-poly rainforest undergrowth
 */

export class ForestPlants {
    constructor() {
        this.group = new THREE.Group();
        this.plants = [];
        this.isAnimating = false;
        this.animationProgress = 0;
    }

    generate() {
        this.clear();

        const plantConfigs = [];
        const plantCount = 25;

        for (let i = 0; i < plantCount; i++) {
            const angle = (i / plantCount) * Math.PI * 2 + Math.random() * 0.4;
            const radius = 0.9 + Math.random() * 2.0;
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;

            if (Math.sqrt(x * x + z * z) < 0.6) continue;

            const rand = Math.random();
            let type, scale;
            if (rand < 0.6) {
                type = 'bush';
                scale = 0.6 + Math.random() * 0.4;
            } else {
                type = 'grass';
                scale = 0.5 + Math.random() * 0.3;
            }

            plantConfigs.push({ type, x, z, scale });
        }

        plantConfigs.forEach((config, index) => {
            const plant = this.createPlant(config.type);
            plant.position.set(config.x, 0, config.z);
            plant.rotation.y = Math.random() * Math.PI * 2;
            plant.scale.setScalar(0);
            plant.visible = false;
            plant.userData.targetScale = config.scale;
            plant.userData.index = index;
            this.group.add(plant);
            this.plants.push(plant);
        });
    }

    createPlant(type) {
        const group = new THREE.Group();
        switch (type) {
            case 'fern': this.createFern(group); break;
            case 'bush': this.createBush(group); break;
            case 'flower': this.createFlower(group); break;
            case 'grass': this.createGrass(group); break;
        }
        return group;
    }

    createFern(group) {
        const leafMat = new THREE.MeshStandardMaterial({
            color: 0x228B22, roughness: 0.7, flatShading: true
        });

        // Curved fern fronds using multiple cones
        for (let i = 0; i < 7; i++) {
            const angle = (i / 7) * Math.PI * 2;

            // Create curved frond with 2 segments
            for (let j = 0; j < 2; j++) {
                const segment = new THREE.Mesh(
                    new THREE.ConeGeometry(0.08 - j * 0.03, 0.5, 4),
                    leafMat
                );
                const dist = 0.15 + j * 0.25;
                const height = 0.25 + j * 0.2;
                segment.position.set(
                    Math.cos(angle) * dist,
                    height,
                    Math.sin(angle) * dist
                );
                segment.rotation.z = 0.4 + j * 0.3;
                segment.rotation.y = angle;
                group.add(segment);
            }
        }
    }

    createBush(group) {
        const colors = [0x2E8B57, 0x228B22, 0x3CB371];

        // Layered spheres for bushy look
        for (let i = 0; i < 5; i++) {
            const mat = new THREE.MeshStandardMaterial({
                color: colors[i % 3], roughness: 0.75, flatShading: true
            });
            const sphere = new THREE.Mesh(
                new THREE.SphereGeometry(0.18 + Math.random() * 0.1, 5, 4),
                mat
            );
            sphere.position.set(
                (Math.random() - 0.5) * 0.3,
                0.2 + i * 0.1,
                (Math.random() - 0.5) * 0.3
            );
            sphere.scale.y = 0.7;  // Flatten slightly
            group.add(sphere);
        }
    }

    createFlower(group) {
        const stemMat = new THREE.MeshStandardMaterial({
            color: 0x2E7D32, roughness: 0.8, flatShading: true
        });
        const flowerMat = new THREE.MeshStandardMaterial({
            color: 0xFF6B6B, roughness: 0.5, flatShading: true
        });
        const leafMat = new THREE.MeshStandardMaterial({
            color: 0x43A047, roughness: 0.7, flatShading: true
        });

        // Stem
        const stem = new THREE.Mesh(
            new THREE.CylinderGeometry(0.02, 0.03, 0.6, 4),
            stemMat
        );
        stem.position.y = 0.3;
        group.add(stem);

        // Flower head
        const flower = new THREE.Mesh(
            new THREE.SphereGeometry(0.12, 6, 4),
            flowerMat
        );
        flower.position.y = 0.65;
        group.add(flower);

        // Leaves at base
        for (let i = 0; i < 3; i++) {
            const leaf = new THREE.Mesh(
                new THREE.ConeGeometry(0.08, 0.25, 4),
                leafMat
            );
            const a = (i / 3) * Math.PI * 2;
            leaf.position.set(Math.cos(a) * 0.1, 0.12, Math.sin(a) * 0.1);
            leaf.rotation.z = 0.5;
            leaf.rotation.y = a;
            group.add(leaf);
        }
    }

    createGrass(group) {
        const grassMat = new THREE.MeshStandardMaterial({
            color: 0x7CB342, roughness: 0.8, flatShading: true
        });

        for (let i = 0; i < 10; i++) {
            const blade = new THREE.Mesh(
                new THREE.ConeGeometry(0.015, 0.4 + Math.random() * 0.2, 3),
                grassMat
            );
            const angle = (i / 10) * Math.PI * 2;
            blade.position.set(
                Math.cos(angle) * 0.08,
                0.2 + Math.random() * 0.1,
                Math.sin(angle) * 0.08
            );
            blade.rotation.z = (Math.random() - 0.5) * 0.2;
            group.add(blade);
        }
    }

    startPopAnimation() {
        this.isAnimating = true;
        this.animationProgress = 0;
        this.plants.forEach(plant => {
            plant.visible = true;
            plant.scale.setScalar(0);
        });
    }

    update(deltaTime) {
        if (!this.isAnimating) return;
        this.animationProgress += deltaTime * 2.5;

        let allDone = true;
        this.plants.forEach((plant, index) => {
            const delay = index * 0.04;
            const progress = Math.max(0, this.animationProgress - delay);
            if (progress < 1) {
                allDone = false;
                const eased = 1 - Math.pow(1 - Math.min(progress, 1), 3);
                plant.scale.setScalar(plant.userData.targetScale * eased);
            } else {
                plant.scale.setScalar(plant.userData.targetScale);
            }
        });
        if (allDone) this.isAnimating = false;
    }

    applyWind(time, strength) {
        this.plants.forEach((plant, i) => {
            const sway = Math.sin(time * 1.2 + i * 0.4) * strength * 0.1;
            plant.rotation.x = sway;
            plant.rotation.z = sway * 0.5;
        });
    }

    clear() {
        while (this.group.children.length) this.group.remove(this.group.children[0]);
        this.plants = [];
    }

    getMesh() { return this.group; }
}
