import * as THREE from 'three';

export class Island {
    constructor() {
        this.group = new THREE.Group();
        this.createIslandBase();
        this.createGrassSurface();
        this.createFloatingRocks();
        this.createGlowEffect();
    }

    createIslandBase() {
        // Main rock body - low poly cylinder
        const rockGeometry = new THREE.CylinderGeometry(
            3.5,    // radiusTop
            2.0,    // radiusBottom (smaller for floating look)
            2.5,    // height
            8,      // radialSegments (low for faceted look)
            3       // heightSegments
        );

        // Distort vertices for organic look
        const positions = rockGeometry.attributes.position;
        for (let i = 0; i < positions.count; i++) {
            const x = positions.getX(i);
            const y = positions.getY(i);
            const z = positions.getZ(i);

            // Add noise based on position
            const noise = Math.sin(x * 2) * Math.cos(z * 2) * 0.3;
            const bottomNoise = y < 0 ? Math.random() * 0.5 : 0;

            positions.setX(i, x + noise * 0.2);
            positions.setZ(i, z + noise * 0.2);
            positions.setY(i, y - bottomNoise);
        }

        rockGeometry.computeVertexNormals();

        const rockMaterial = new THREE.MeshStandardMaterial({
            color: 0x5c4033,
            roughness: 0.9,
            metalness: 0.1,
            flatShading: true
        });

        this.rockMesh = new THREE.Mesh(rockGeometry, rockMaterial);
        this.rockMesh.castShadow = true;
        this.rockMesh.receiveShadow = true;
        this.rockMesh.position.y = 0;
        this.group.add(this.rockMesh);
    }

    createGrassSurface() {
        // Green grass top surface
        const grassGeometry = new THREE.CylinderGeometry(
            3.4,    // radiusTop
            3.5,    // radiusBottom
            0.4,    // height
            8,      // radialSegments
            1       // heightSegments
        );

        // Add slight undulation to grass
        const positions = grassGeometry.attributes.position;
        for (let i = 0; i < positions.count; i++) {
            const x = positions.getX(i);
            const y = positions.getY(i);
            const z = positions.getZ(i);

            if (y > 0) {
                const wave = Math.sin(x * 1.5) * Math.cos(z * 1.5) * 0.15;
                positions.setY(i, y + wave);
            }
        }

        grassGeometry.computeVertexNormals();

        const grassMaterial = new THREE.MeshStandardMaterial({
            color: 0x4ade80,
            roughness: 0.8,
            metalness: 0.0,
            flatShading: true
        });

        this.grassMesh = new THREE.Mesh(grassGeometry, grassMaterial);
        this.grassMesh.receiveShadow = true;
        this.grassMesh.position.y = 1.35;
        this.group.add(this.grassMesh);
    }

    createFloatingRocks() {
        // Small floating rock debris around the island
        const rockPositions = [
            { x: -4, y: -0.5, z: 1, scale: 0.4 },
            { x: 3.5, y: -1, z: -2, scale: 0.3 },
            { x: -2, y: -1.5, z: -3, scale: 0.5 },
            { x: 4, y: 0.5, z: 2, scale: 0.25 },
        ];

        const rockGeo = new THREE.IcosahedronGeometry(1, 0);
        const rockMat = new THREE.MeshStandardMaterial({
            color: 0x6b5344,
            roughness: 0.9,
            flatShading: true
        });

        rockPositions.forEach((pos, index) => {
            const rock = new THREE.Mesh(rockGeo, rockMat);
            rock.position.set(pos.x, pos.y, pos.z);
            rock.scale.setScalar(pos.scale);
            rock.rotation.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            );
            rock.castShadow = true;
            rock.userData.floatOffset = index * Math.PI * 0.5;
            rock.userData.originalY = pos.y;
            this.group.add(rock);
        });
    }

    createGlowEffect() {
        // Subtle glow under the island
        const glowGeometry = new THREE.RingGeometry(0.5, 4, 16);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0x22c55e,
            transparent: true,
            opacity: 0.15,
            side: THREE.DoubleSide
        });

        this.glowRing = new THREE.Mesh(glowGeometry, glowMaterial);
        this.glowRing.rotation.x = -Math.PI / 2;
        this.glowRing.position.y = -1.5;
        this.group.add(this.glowRing);
    }

    // Animate floating effect
    update(time) {
        // Main island bobbing
        this.group.position.y = Math.sin(time * 0.5) * 0.1;
        this.group.rotation.y = Math.sin(time * 0.2) * 0.02;

        // Floating rocks orbit slightly
        this.group.children.forEach(child => {
            if (child.userData.floatOffset !== undefined) {
                child.position.y = child.userData.originalY +
                    Math.sin(time + child.userData.floatOffset) * 0.15;
            }
        });

        // Pulsing glow
        if (this.glowRing) {
            this.glowRing.material.opacity = 0.1 + Math.sin(time * 2) * 0.05;
        }
    }

    getMesh() {
        return this.group;
    }

    // Get position for planting (on top of grass)
    getPlantingPosition(offsetX = 0, offsetZ = 0) {
        return new THREE.Vector3(
            offsetX,
            1.55 + this.group.position.y,
            offsetZ
        );
    }
}
