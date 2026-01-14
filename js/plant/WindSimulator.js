import * as THREE from 'three';

/**
 * Unified wind sway - whole tree moves together
 * with extra sway on deeper branches/leaves
 */

export class WindSimulator {
    constructor() {
        this.windStrength = 0.5;
        this.windSpeed = 1.0;
        this.windDirection = new THREE.Vector3(1, 0, 0.5).normalize();
        this.originalRotations = new Map();
    }

    registerPlant(plantMesh) {
        const meshes = plantMesh.getBranchMeshes();
        meshes.forEach(mesh => {
            this.originalRotations.set(mesh.uuid, {
                x: mesh.rotation.x,
                y: mesh.rotation.y,
                z: mesh.rotation.z
            });
        });
    }

    update(time, plantMesh) {
        if (!plantMesh) return;

        // Main unified sway - same for whole tree
        const mainSway = Math.sin(time * this.windSpeed) * this.windStrength * 0.2;  // Stronger bend
        const secondarySway = Math.sin(time * this.windSpeed * 1.7) * this.windStrength * 0.05;
        const baseSway = mainSway + secondarySway;

        const meshes = plantMesh.getBranchMeshes();
        meshes.forEach(mesh => {
            const original = this.originalRotations.get(mesh.uuid);
            if (!original) return;

            const depth = mesh.userData.depth || 0;

            // Extra sway multiplier for deeper branches (subtle)
            const depthMultiplier = 1 + depth * 0.15;
            const totalSway = baseSway * depthMultiplier;

            mesh.rotation.x = original.x + totalSway * this.windDirection.x;
            mesh.rotation.z = original.z + totalSway * this.windDirection.z;
        });

        // Leaves sway with tree + slight extra movement
        const nodes = plantMesh.getNodeMeshes();
        nodes.forEach(mesh => {
            const depth = mesh.userData.depth || 0;
            const depthMultiplier = 1 + depth * 0.2;
            const leafSway = baseSway * depthMultiplier * 1.2;

            mesh.rotation.x = leafSway * this.windDirection.x;
            mesh.rotation.z = leafSway * this.windDirection.z;
        });
    }

    setWindStrength(strength) {
        this.windStrength = Math.max(0, Math.min(1, strength));
    }

    setWindSpeed(speed) {
        this.windSpeed = Math.max(0.1, Math.min(3, speed));
    }

    setWindDirection(x, y, z) {
        this.windDirection.set(x, y, z).normalize();
    }
}
