"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateMetabolicScore = calculateMetabolicScore;
function calculateMetabolicScore(tir, variability, hba1c) {
    let score = 100;
    score -= (100 - tir) * 0.3;
    score -= variability * 0.1;
    score -= (hba1c - 6) * 10;
    return Math.max(0, Math.min(100, Math.round(score)));
}
//# sourceMappingURL=metabolicScore.js.map