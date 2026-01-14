import * as THREE from 'three';

/**
 * 3D Turtle Graphics Interpreter
 * Interprets L-System strings and generates 3D geometry
 */

export class Turtle3D {
    constructor(params = {}) {
        this.angle = THREE.MathUtils.degToRad(params.angle || 25);
        this.length = params.baseLength || 0.5;
        this.radius = params.baseRadius || 0.08;
        this.lengthFactor = params.lengthFactor || 0.9;
        this.radiusFactor = params.radiusFactor || 0.7;
        this.colors = params.color || { trunk: 0x8B4513, leaf: 0x228B22 };

        this.reset();
    }

    reset() {
        this.position = new THREE.Vector3(0, 0, 0);
        this.quaternion = new THREE.Quaternion();
        this.stack = [];
        this.currentLength = this.length;
        this.currentRadius = this.radius;
        this.depth = 0;
        this.branches = [];
        this.nodes = [];
    }

    // Get the current heading direction
    getHeading() {
        const up = new THREE.Vector3(0, 1, 0);
        return up.applyQuaternion(this.quaternion).normalize();
    }

    // Push current state
    pushState() {
        this.stack.push({
            position: this.position.clone(),
            quaternion: this.quaternion.clone(),
            length: this.currentLength,
            radius: this.currentRadius,
            depth: this.depth
        });

        // Reduce size at each branch point
        this.currentLength *= this.lengthFactor;
        this.currentRadius *= this.radiusFactor;
        this.depth++;
    }

    // Pop previous state
    popState() {
        if (this.stack.length > 0) {
            const state = this.stack.pop();
            this.position = state.position;
            this.quaternion = state.quaternion;
            this.currentLength = state.length;
            this.currentRadius = state.radius;
            this.depth = state.depth;
        }
    }

    // Rotation functions
    rotateYaw(angle) {
        const q = new THREE.Quaternion();
        q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), angle);
        this.quaternion.premultiply(q);
    }

    rotatePitch(angle) {
        const q = new THREE.Quaternion();
        const left = new THREE.Vector3(1, 0, 0).applyQuaternion(this.quaternion);
        q.setFromAxisAngle(left, angle);
        this.quaternion.premultiply(q);
    }

    rotateRoll(angle) {
        const q = new THREE.Quaternion();
        const heading = this.getHeading();
        q.setFromAxisAngle(heading, angle);
        this.quaternion.premultiply(q);
    }

    // Move forward and create branch segment
    moveForward(draw = true) {
        const heading = this.getHeading();
        const startPos = this.position.clone();
        const endPos = this.position.clone().add(
            heading.multiplyScalar(this.currentLength)
        );

        if (draw) {
            this.branches.push({
                start: startPos,
                end: endPos,
                radius: this.currentRadius,
                depth: this.depth,
                quaternion: this.quaternion.clone()
            });
        }

        this.position = endPos;
    }

    // Create node (fruit/flower) at current position
    createNode(type = 'A') {
        this.nodes.push({
            position: this.position.clone(),
            type: type,
            depth: this.depth,
            radius: this.currentRadius * 2
        });
    }

    // Interpret L-System string
    interpret(lsystemString) {
        this.reset();

        for (const char of lsystemString) {
            switch (char) {
                case 'F':
                    this.moveForward(true);
                    break;
                case 'f':
                    this.moveForward(false);
                    break;
                case '+':
                    this.rotateYaw(this.angle);
                    break;
                case '-':
                    this.rotateYaw(-this.angle);
                    break;
                case '&':
                    this.rotatePitch(this.angle);
                    break;
                case '^':
                    this.rotatePitch(-this.angle);
                    break;
                case '\\':
                    this.rotateRoll(this.angle);
                    break;
                case '/':
                    this.rotateRoll(-this.angle);
                    break;
                case '[':
                    this.pushState();
                    break;
                case ']':
                    this.popState();
                    break;
                case 'A':
                    this.createNode('A');
                    break;
                case 'B':
                    this.createNode('B');
                    break;
                case '!':
                    // Decrement diameter
                    this.currentRadius *= 0.8;
                    break;
            }
        }

        return {
            branches: this.branches,
            nodes: this.nodes
        };
    }
}
