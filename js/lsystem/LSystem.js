/**
 * L-System (Lindenmayer System) Core Implementation
 * 
 * Symbols:
 *  F  - Move forward and draw branch
 *  f  - Move forward without drawing
 *  +  - Rotate around Y axis (yaw) positive
 *  -  - Rotate around Y axis (yaw) negative
 *  &  - Rotate around X axis (pitch) positive
 *  ^  - Rotate around X axis (pitch) negative
 *  \  - Rotate around Z axis (roll) positive
 *  /  - Rotate around Z axis (roll) negative
 *  [  - Push state onto stack
 *  ]  - Pop state from stack
 *  A  - Apex/bud (can produce fruit/flower)
 *  B  - Blossom marker
 */

export class LSystem {
    constructor(axiom, rules, iterations = 4) {
        this.axiom = axiom;
        this.rules = rules;
        this.iterations = iterations;
        this.currentString = axiom;
    }

    generate() {
        this.currentString = this.axiom;

        for (let i = 0; i < this.iterations; i++) {
            this.currentString = this.applyRules(this.currentString);
        }

        return this.currentString;
    }

    applyRules(str) {
        let result = '';

        for (const char of str) {
            if (this.rules[char]) {
                // Handle stochastic rules (arrays of possible replacements)
                const rule = this.rules[char];
                if (Array.isArray(rule)) {
                    const randomIndex = Math.floor(Math.random() * rule.length);
                    result += rule[randomIndex];
                } else {
                    result += rule;
                }
            } else {
                result += char;
            }
        }

        return result;
    }

    setIterations(n) {
        this.iterations = Math.max(1, Math.min(n, 7));
    }

    getGenerationStats() {
        return {
            axiom: this.axiom,
            iterations: this.iterations,
            finalLength: this.currentString.length,
            branchCount: (this.currentString.match(/F/g) || []).length,
            nodeCount: (this.currentString.match(/[AB]/g) || []).length
        };
    }
}
