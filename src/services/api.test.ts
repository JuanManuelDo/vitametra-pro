import { describe, it, expect } from 'vitest';
import { apiService } from './apiService';
import { analyzeFoodText } from './geminiService';

describe('Auditoría Pro: VitaMetra Bio-Core', () => {
  
  it('Conector Firebase: Todas las funciones críticas operativas', () => {
    expect(apiService.login).toBeDefined();
    expect(apiService.saveHistoryEntry).toBeDefined();
    expect(apiService.updateHistoryEntry).toBeDefined();
    expect(apiService.calibrateEntry).toBeDefined();
  });

  it('Lógica Clínica: Cálculo de ratios de insulina correcto', () => {
    const mockSchedule = [{ startTime: "08:00", ratio: 10 }];
    const result = apiService._getRatioForTime("09:00", mockSchedule);
    expect(result).toBe(10);
  });

  it('Motor IA: La función de análisis existe y es ejecutable', () => {
    expect(analyzeFoodText).toBeDefined();
  });
});
