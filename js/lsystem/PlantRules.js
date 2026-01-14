/**
 * Predefined L-System plant rules
 * Each plant type has: axiom, rules, and recommended parameters
 */

export const PlantRules = {
    // Classic branching tree - full and lush
    tree: {
        axiom: 'FFFFBA',  // Trunk with mid-branch point
        rules: {
            'F': 'F',
            'B': '[+&FA][-&FA]F',  // Mid-trunk branches
            'A': 'FF[&FA][^FA][+&FA][-&FA][+^FA][-^FA]'  // 6 branches at top
        },
        angle: 32,
        lengthFactor: 0.72,
        radiusFactor: 0.58,
        baseLength: 0.7,
        baseRadius: 0.45,
        color: { trunk: 0x5D4037, leaf: 0x2E7D32 }
    },

    // Dense bush with more branching
    bush: {
        axiom: 'A',
        rules: {
            'A': '[&FLA]////[&FLA]////[&FLA]',
            'F': 'S//F',
            'S': 'F',
            'L': '[^^^B]'
        },
        angle: 22.5,
        lengthFactor: 0.85,
        radiusFactor: 0.65,
        baseLength: 0.3,
        baseRadius: 0.05,
        color: { trunk: 0x556B2F, leaf: 0x90EE90 }
    },

    // Fern-like structure
    fern: {
        axiom: 'FFFA',
        rules: {
            'A': 'F[++++++++++++++B]F[--------------B]+A',
            'B': 'F&B'
        },
        angle: 8,
        lengthFactor: 0.92,
        radiusFactor: 0.8,
        baseLength: 0.15,
        baseRadius: 0.02,
        color: { trunk: 0x2E8B57, leaf: 0x3CB371 }
    },

    // Flowering plant
    flower: {
        axiom: 'FA',
        rules: {
            'A': '[&FLA]////[&FLA]////[&FLA]',
            'F': 'S/////F',
            'S': 'FL',
            'L': '[^^B]'
        },
        angle: 18,
        lengthFactor: 0.88,
        radiusFactor: 0.7,
        baseLength: 0.25,
        baseRadius: 0.03,
        color: { trunk: 0x228B22, leaf: 0xFF69B4 }
    },

    // Tall conifer/pine style
    pine: {
        axiom: 'FFFFFA',
        rules: {
            'A': 'F[&&&&+++B][&&&&---B][&&&&++++B][&&&&----B]FA',
            'B': 'FB'
        },
        angle: 30,
        lengthFactor: 0.75,
        radiusFactor: 0.72,
        baseLength: 0.4,
        baseRadius: 0.1,
        color: { trunk: 0x4A3728, leaf: 0x006400 }
    },

    // Abstract/alien plant
    alien: {
        axiom: 'A',
        rules: {
            'A': '[+FA][-FA][&FA][^FA]'
        },
        angle: 45,
        lengthFactor: 0.707,
        radiusFactor: 0.6,
        baseLength: 0.8,
        baseRadius: 0.04,
        color: { trunk: 0x9932CC, leaf: 0x00FFFF }
    }
};

// Function to get random variation of rules
export function getRandomizedRules(plantType) {
    const base = PlantRules[plantType];
    if (!base) return PlantRules.tree;

    return {
        ...base,
        angle: base.angle + (Math.random() - 0.5) * 10,
        lengthFactor: base.lengthFactor + (Math.random() - 0.5) * 0.1,
        radiusFactor: base.radiusFactor + (Math.random() - 0.5) * 0.1
    };
}
