"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateVariability = calculateVariability;
function calculateVariability(glucoseValues) {
    if (!glucoseValues.length)
        return 0;
    const mean = glucoseValues.reduce((a, b) => a + b, 0) / glucoseValues.length;
    const variance = glucoseValues.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) /
        glucoseValues.length;
    return Math.sqrt(variance);
}
//# sourceMappingURL=variabilityCalculator.js.map