"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateTIR = calculateTIR;
function calculateTIR(glucoseValues) {
    if (!glucoseValues.length)
        return 0;
    const inRange = glucoseValues.filter(g => g >= 70 && g <= 180);
    return (inRange.length / glucoseValues.length) * 100;
}
//# sourceMappingURL=tirCalculator.js.map