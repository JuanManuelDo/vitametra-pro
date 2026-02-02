
import type { UserData, InsulinRatioSegment, MealType } from '../types';

/**
 * Determina el slot de comida sugerido según la hora actual.
 */
export const getSmartMealSlot = (): MealType => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 11) return 'desayuno';
    if (hour >= 11 && hour < 13) return 'snack-manana';
    if (hour >= 13 && hour < 16) return 'almuerzo';
    if (hour >= 16 && hour < 19) return 'snack-tarde';
    if (hour >= 19 && hour < 21) return 'snack-deportivo';
    if (hour >= 21 && hour < 23) return 'cena';
    return 'snack-noche';
};

/**
 * Converts a time string "HH:MM" to minutes from midnight.
 */
export const timeToMinutes = (timeStr: string): number => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
};

/**
 * Converts minutes from midnight to "HH:MM" string.
 */
export const minutesToTime = (minutes: number): string => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
};

/**
 * Determines the active Insulin-to-Carb Ratio for a specific date/time.
 */
export const getRatioForTime = (date: Date, user: UserData | null): number => {
    if (!user) return 0;

    // Fallback to legacy static ratio if no schedule exists or it's empty
    if (!user.insulinRatioSchedule || user.insulinRatioSchedule.length === 0) {
        /* Fix: insulinToCarbRatio is nested inside clinicalConfig */
        return user.clinicalConfig?.insulinToCarbRatio || 0;
    }

    const currentMinutes = date.getHours() * 60 + date.getMinutes();
    
    // Sort segments by start time
    const sortedSegments = [...user.insulinRatioSchedule].sort((a, b) => a.startTime - b.startTime);

    // Find the segment that started most recently
    let activeSegment = sortedSegments[0]; // Default to first (usually 00:00)
    
    for (const segment of sortedSegments) {
        if (segment.startTime <= currentMinutes) {
            activeSegment = segment;
        } else {
            break; // Since it's sorted, once we pass current time, we stop
        }
    }

    return activeSegment.ratio;
};

/**
 * Adds or Updates a time segment while maintaining 24h continuity without gaps.
 * Logic:
 * 1. Ensure 00:00 exists.
 * 2. Inserting a range [Start, End] effectively means:
 *    - Set ratio at Start Time.
 *    - Set ratio at (End Time + 1 minute) to whatever ratio was active at that time before this change.
 */
export const updateScheduleWithRange = (
    currentSchedule: InsulinRatioSegment[], 
    newStartStr: string, 
    newEndStr: string, 
    newRatio: number
): InsulinRatioSegment[] => {
    
    const startMinutes = timeToMinutes(newStartStr);
    const endMinutes = timeToMinutes(newEndStr);
    
    // Sort existing
    let segments = [...currentSchedule].sort((a, b) => a.startTime - b.startTime);
    
    // Ensure base 00:00 exists (if empty, create it with default 10 or existing)
    if (segments.length === 0 || segments[0].startTime !== 0) {
        segments.unshift({ startTime: 0, ratio: 10 });
    }

    // 1. Identify what the ratio would be right after our new range ends
    // This allows us to "return" to the previous setting after the new block
    const ratioAfterRange = getRatioAtMinutes(endMinutes + 1, segments);

    // 2. Remove any existing segments that start INSIDE our new range (Start <= X <= End)
    // We are overwriting this block
    segments = segments.filter(s => s.startTime < startMinutes || s.startTime > endMinutes);

    // 3. Add the new Start segment
    // Check if there is already a segment exactly at startMinutes (after filtering, unlikely unless it was kept), update or push
    const existingStart = segments.find(s => s.startTime === startMinutes);
    if (existingStart) {
        existingStart.ratio = newRatio;
    } else {
        segments.push({ startTime: startMinutes, ratio: newRatio });
    }

    // 4. Add the "Return" segment (End + 1 min) IF it's not 24:00 (1440 min)
    // Only if the new range doesn't go until end of day (23:59)
    if (endMinutes < 1439) {
        const returnTime = endMinutes + 1;
        const existingReturn = segments.find(s => s.startTime === returnTime);
        if (existingReturn) {
            // Already a segment there, we rely on it, OR we overwrite it? 
            // Standard logic: The user defines a block. If I say 08-12, 12:01 should revert.
            // If 12:01 already had a specific change, we might arguably keep it, but to be "gapless range" logic, we usually overwrite.
            // Simplified: Ensure the ratio at returnTime is set to `ratioAfterRange`.
            existingReturn.ratio = ratioAfterRange;
        } else {
            segments.push({ startTime: returnTime, ratio: ratioAfterRange });
        }
    }

    // 5. Cleanup: Sort and remove redundant segments
    // (e.g. if 08:00 is ratio 10, and 12:00 is also ratio 10, 12:00 is technically redundant but harmless. We keep it for explicit visibility).
    return segments.sort((a, b) => a.startTime - b.startTime);
};

// Helper for internal logic
const getRatioAtMinutes = (minutes: number, sortedSegments: InsulinRatioSegment[]): number => {
    let ratio = sortedSegments[0].ratio;
    for (const seg of sortedSegments) {
        if (seg.startTime <= minutes) {
            ratio = seg.ratio;
        } else {
            break;
        }
    }
    return ratio;
};

export const deleteSegment = (schedule: InsulinRatioSegment[], startTime: number): InsulinRatioSegment[] => {
    if (startTime === 0) return schedule; // Cannot delete base segment
    return schedule.filter(s => s.startTime !== startTime);
};
