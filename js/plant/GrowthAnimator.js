import * as THREE from 'three';

/**
 * Growth animation:
 * - Trunk (depth 0): grows segment by segment
 * - Branches (depth 1+): same-depth branches grow together
 * - Leaves: appear after all branches
 */

export class GrowthAnimator {
    constructor() {
        this.animations = [];
        this.isAnimating = false;
        this.growthSpeed = 1.0;
    }

    startGrowth(plantMesh) {
        this.animations = [];
        this.isAnimating = true;

        const branchMeshes = plantMesh.getBranchMeshes();
        const nodeMeshes = plantMesh.getNodeMeshes();

        // Separate trunk (depth 0) from branches (depth 1+)
        const trunkSegments = branchMeshes.filter(m => m.userData.depth === 0);
        const branchSegments = branchMeshes.filter(m => m.userData.depth > 0);

        // Group branches by depth
        const branchesByDepth = {};
        let maxDepth = 0;
        branchSegments.forEach(mesh => {
            const depth = mesh.userData.depth;
            if (!branchesByDepth[depth]) branchesByDepth[depth] = [];
            branchesByDepth[depth].push(mesh);
            maxDepth = Math.max(maxDepth, depth);
        });

        console.log('Growth:', trunkSegments.length, 'trunk,', branchSegments.length, 'branches,', nodeMeshes.length, 'leaves');

        const segmentDuration = 0.4;   // Time per trunk segment
        const segmentOverlap = 0.5;    // Overlap between trunk segments
        const depthDuration = 0.5;     // Time for each branch depth level
        const depthOverlap = 0.3;      // Overlap between depth levels

        let currentTime = 0;

        // Trunk grows segment by segment (one by one)
        trunkSegments.forEach((mesh, index) => {
            const startTime = index * segmentDuration * (1 - segmentOverlap);
            this.animations.push({
                mesh: mesh,
                startTime: startTime,
                duration: segmentDuration,
                progress: 0,
                started: false,
                completed: false,
                isBranch: true
            });
            currentTime = Math.max(currentTime, startTime + segmentDuration * 0.7);
        });

        // Depth 1 branches: stagger for sequential growth effect
        const depth1Branches = branchesByDepth[1] || [];
        const segmentStagger = 0.08;
        depth1Branches.forEach((mesh, index) => {
            this.animations.push({
                mesh: mesh,
                startTime: currentTime + index * segmentStagger,
                duration: depthDuration,
                progress: 0,
                started: false,
                completed: false,
                isBranch: true
            });
        });

        // Update current time after depth 1
        let branchGrowthEndTime = currentTime;
        if (depth1Branches.length > 0) {
            branchGrowthEndTime = currentTime + depth1Branches.length * segmentStagger + depthDuration;
        } else if (trunkSegments.length > 0) {
            branchGrowthEndTime = currentTime; // No depth 1 branches, so current time is end of trunk
        } else {
            branchGrowthEndTime = 0; // No trunk or branches yet
        }

        // Depth 2+ branches: all grow together at each level
        for (let depth = 2; depth <= maxDepth; depth++) {
            const branches = branchesByDepth[depth] || [];
            const depthStartTime = branchGrowthEndTime + (depth - 2) * depthDuration * (1 - depthOverlap);

            branches.forEach(mesh => {
                this.animations.push({
                    mesh: mesh,
                    startTime: depthStartTime,
                    duration: depthDuration,
                    progress: 0,
                    started: false,
                    completed: false,
                    isBranch: true
                });
            });
        }

        // Calculate when all branches are done
        const depth2PlusTime = branchGrowthEndTime + Math.max(0, maxDepth - 1) * depthDuration * (1 - depthOverlap) + depthDuration;
        const totalTime = Math.max(branchGrowthEndTime, depth2PlusTime);

        // Leaves all pop in together after all branches
        nodeMeshes.forEach((mesh, index) => {
            this.animations.push({
                mesh: mesh,
                startTime: totalTime,
                duration: 0.4,
                progress: 0,
                started: false,
                completed: false,
                isBranch: false
            });
        });
    }

    update(deltaTime) {
        if (!this.isAnimating) return;
        if (deltaTime <= 0 || deltaTime > 1) return;

        let allCompleted = true;
        const elapsed = deltaTime * this.growthSpeed;

        this.animations.forEach(anim => {
            if (anim.completed) return;

            anim.startTime -= elapsed;

            if (anim.startTime <= 0 && !anim.started) {
                anim.started = true;
                anim.mesh.visible = true;
            }

            if (anim.started) {
                anim.progress += elapsed / anim.duration;

                if (anim.progress >= 1) {
                    anim.progress = 1;
                    anim.completed = true;
                }

                const t = anim.progress;
                const eased = 1 - Math.pow(1 - t, 3);

                if (anim.isBranch) {
                    anim.mesh.scale.y = eased;
                } else {
                    anim.mesh.scale.setScalar(eased);
                }
            }

            if (!anim.completed) allCompleted = false;
        });

        if (allCompleted && this.animations.length > 0) {
            console.log('Growth complete!');
            this.isAnimating = false;
        }
    }

    isComplete() {
        return !this.isAnimating;
    }

    setGrowthSpeed(speed) {
        this.growthSpeed = Math.max(0.1, Math.min(3, speed));
    }
}
