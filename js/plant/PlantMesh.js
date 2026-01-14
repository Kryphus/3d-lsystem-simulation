import * as THREE from 'three';
import { LSystem } from '../lsystem/LSystem.js';
import { Turtle3D } from '../lsystem/Turtle3D.js';
import { PlantRules } from '../lsystem/PlantRules.js';

export class PlantMesh {
    constructor(plantType = 'tree', iterations = 4) {
        this.plantType = plantType;
        this.iterations = iterations;
        this.group = new THREE.Group();
        this.branchMeshes = [];
        this.nodeMeshes = [];

        this.generate();
    }

    generate() {
        // Clear existing meshes
        this.clear();

        // Get plant rules
        const rules = PlantRules[this.plantType] || PlantRules.tree;

        // Add random variation for unique trees
        const randomVariation = {
            angle: rules.angle + (Math.random() - 0.5) * 15,      // ±7.5 degrees
            baseLength: rules.baseLength * (0.85 + Math.random() * 0.3),  // 85%-115%
            baseRadius: rules.baseRadius * (0.9 + Math.random() * 0.2),   // 90%-110%
            lengthFactor: rules.lengthFactor + (Math.random() - 0.5) * 0.1,
            radiusFactor: rules.radiusFactor + (Math.random() - 0.5) * 0.08
        };

        // Create L-System
        this.lsystem = new LSystem(rules.axiom, rules.rules, this.iterations);
        const lsystemString = this.lsystem.generate();

        // Interpret with 3D turtle using randomized parameters
        this.turtle = new Turtle3D({
            angle: randomVariation.angle,
            baseLength: randomVariation.baseLength,
            baseRadius: randomVariation.baseRadius,
            lengthFactor: randomVariation.lengthFactor,
            radiusFactor: randomVariation.radiusFactor,
            color: rules.color
        });

        const { branches, nodes } = this.turtle.interpret(lsystemString);

        // Create branch meshes
        this.createBranchMeshes(branches, rules.color.trunk);

        // Create node meshes (fruits/flowers)
        this.createNodeMeshes(nodes, rules.color.leaf);

        console.log(`Generated plant: ${branches.length} branches, ${nodes.length} nodes`);
    }

    createBranchMeshes(branches, color) {
        const material = new THREE.MeshStandardMaterial({
            color: color,
            roughness: 0.8,
            metalness: 0.1,
            flatShading: true
        });

        branches.forEach((branch, index) => {
            // Create cylinder for branch
            const length = branch.start.distanceTo(branch.end);
            const geometry = new THREE.CylinderGeometry(
                branch.radius * 0.85,  // top radius (tapered)
                branch.radius * 1.2,   // bottom radius (thicker)
                length,               // height
                6,                    // radial segments (low poly)
                1                     // height segments
            );

            // Orient cylinder
            geometry.translate(0, length / 2, 0);

            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.copy(branch.start);

            // Align with branch direction
            const direction = new THREE.Vector3()
                .subVectors(branch.end, branch.start)
                .normalize();
            const quaternion = new THREE.Quaternion()
                .setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);
            mesh.quaternion.copy(quaternion);

            // Store metadata for animation
            mesh.userData = {
                depth: branch.depth,
                index: index,
                targetScale: 1,
                currentScale: 0.01,
                phaseOffset: Math.random() * Math.PI * 2
            };

            mesh.scale.set(1, 0, 1);  // Start invisible
            mesh.visible = false;      // Hidden until animation
            mesh.castShadow = true;
            mesh.receiveShadow = true;

            this.group.add(mesh);
            this.branchMeshes.push(mesh);
        });
    }

    createNodeMeshes(nodes, color) {
        const material = new THREE.MeshStandardMaterial({
            color: color,
            roughness: 0.7,
            metalness: 0.0,
            flatShading: true  // Low-poly look for leaves
        });

        nodes.forEach((node, index) => {
            // Create larger leaf clusters
            const size = node.radius * 4;  // Much bigger leaves

            // Use icosahedron for chunky low-poly leaf clusters
            const geometry = new THREE.IcosahedronGeometry(size, 0);

            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.copy(node.position);

            // Random rotation for variety
            mesh.rotation.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            );

            mesh.userData = {
                depth: node.depth,
                index: index,
                targetScale: 1,
                currentScale: 0.01,
                type: node.type,
                phaseOffset: Math.random() * Math.PI * 2
            };

            mesh.scale.setScalar(0);  // Completely invisible at start
            mesh.visible = false;     // Hidden until animation starts
            mesh.castShadow = true;
            mesh.receiveShadow = true;

            this.group.add(mesh);
            this.nodeMeshes.push(mesh);
        });
    }

    clear() {
        while (this.group.children.length > 0) {
            const child = this.group.children[0];
            if (child.geometry) child.geometry.dispose();
            if (child.material) child.material.dispose();
            this.group.remove(child);
        }
        this.branchMeshes = [];
        this.nodeMeshes = [];
    }

    getMesh() {
        return this.group;
    }

    getBranchMeshes() {
        return this.branchMeshes;
    }

    getNodeMeshes() {
        return this.nodeMeshes;
    }

    getAllMeshes() {
        return [...this.branchMeshes, ...this.nodeMeshes];
    }
}
