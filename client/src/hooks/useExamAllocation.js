import { useState, useCallback } from 'react';

const useExamAllocation = (facultyList) => {
    const [allocations, setAllocations] = useState({});

    // Helper: Check if faculty worked yesterday
    const workedYesterday = (profId, currentDateStr, currentAllocations) => {
        const date = new Date(currentDateStr);
        date.setDate(date.getDate() - 1);
        const yesterdayStr = date.toISOString().split('T')[0];

        if (!currentAllocations[yesterdayStr]) return false;

        const am = [...(currentAllocations[yesterdayStr].morning?.deputies || []), ...(currentAllocations[yesterdayStr].morning?.invigilators || [])];
        const pm = [...(currentAllocations[yesterdayStr].afternoon?.deputies || []), ...(currentAllocations[yesterdayStr].afternoon?.invigilators || [])];

        return [...am, ...pm].some(p => p._id === profId);
    };

    const startAllocation = (config, currentFacultyList) => {
        // Deep copy faculty list to track local state (totalAllotments) during this run
        let workingFaculty = currentFacultyList.map(f => ({ ...f, totalAllotments: 0 }));
        let newAllocations = {};
        const sortedDates = Object.keys(config).sort();

        sortedDates.forEach(date => {
            newAllocations[date] = {
                morning: { deputies: [], invigilators: [] },
                afternoon: { deputies: [], invigilators: [] }
            };

            // --- AM SESSION ---
            const amRooms = config[date].morning?.rooms || 0;
            const amProfsNeeded = Math.ceil(amRooms / 7);
            const amNonProfsNeeded = (config[date].morning?.rooms || 0) + (config[date].morning?.relievers || 0);

            // Allocate AM Deputies (Professors)
            const amDeputies = allocateSession(
                workingFaculty,
                date,
                'Professor',
                amProfsNeeded,
                [], // No exclusions
                newAllocations
            );

            // Allocate AM Invigilators (Non-Professors)
            const amInvigilators = allocateSession(
                workingFaculty,
                date,
                'Non-Professor', // Reverted to strict Non-Professor
                amNonProfsNeeded,
                amDeputies, // Exclude AM Deputies
                newAllocations
            );

            newAllocations[date].morning.deputies = amDeputies;
            newAllocations[date].morning.invigilators = amInvigilators;

            // --- PM SESSION ---
            const pmRooms = config[date].afternoon?.rooms || 0;
            const pmProfsNeeded = Math.ceil(pmRooms / 7);
            const pmNonProfsNeeded = (config[date].afternoon?.rooms || 0) + (config[date].afternoon?.relievers || 0);

            // Exclude AM workers from PM
            const amWorkers = [...amDeputies, ...amInvigilators];

            // Allocate PM Deputies
            const pmDeputies = allocateSession(
                workingFaculty,
                date,
                'Professor',
                pmProfsNeeded,
                amWorkers,
                newAllocations
            );

            // Allocate PM Invigilators
            const pmInvigilators = allocateSession(
                workingFaculty,
                date,
                'Non-Professor', // Reverted to strict Non-Professor
                pmNonProfsNeeded,
                [...amWorkers, ...pmDeputies],
                newAllocations
            );

            newAllocations[date].afternoon.deputies = pmDeputies;
            newAllocations[date].afternoon.invigilators = pmInvigilators;
        });

        setAllocations(newAllocations);
        return newAllocations;
    };

    // Helper: Calculate Department Sizes
    const getDeptSizes = (faculty) => {
        const sizes = {};
        faculty.forEach(f => {
            sizes[f.department] = (sizes[f.department] || 0) + 1;
        });
        return sizes;
    };

    // Helper: Check if worked earlier TODAY (Same Day Gap)
    const workedSameDay = (profId, date, currentAllocations) => {
        const am = currentAllocations[date]?.morning?.deputies || [];
        const amInv = currentAllocations[date]?.morning?.invigilators || [];
        // Note: PM Allocations usually happen AFTER AM, so we mostly check AM when allocating PM.
        // When allocating AM, PM is empty, so this returns false (correct).
        return [...am, ...amInv].some(p => p._id === profId);
    };

    const allocateSession = (allFaculty, date, type, count, excludeList, currentAllocations) => {
        if (count === 0) return [];

        const excludeIds = new Set(excludeList.map(f => f._id));
        const deptSizes = getDeptSizes(allFaculty); // Total size of each dept

        // 1. Identify Valid Candidates
        let candidates = allFaculty.filter(f => {
            const desig = f.designation.toLowerCase();
            const isTrueProfessor = desig.includes('professor') && !desig.includes('assistant') && !desig.includes('associate');
            const matchesType = type === 'Professor' ? isTrueProfessor : !isTrueProfessor;
            return matchesType && f.isActive && !excludeIds.has(f._id);
        });

        // 2. Score Candidates
        // Lower Score = Better Candidate
        // Base: TotalAllotments * 1000
        // Same Day Penalty: +50,000 (Avoid at all costs)
        // Consecutive Day Penalty: +500 (Avoid if possible, but prefer over unfair total)

        // CRITICAL FIX: Use forEach to mutate objects in place.
        // using .map() creates new objects, breaking the reference to 'allFaculty' / 'candidates'
        // which means when we do candidates[i].totalAllotments += 1 later, it updates the COPY, not the original.
        // Since 'allFaculty' in this scope is already a local clone (from startAllocation), it's safe to mutate.

        candidates.forEach(f => {
            let score = f.totalAllotments * 1000;

            if (workedSameDay(f._id, date, currentAllocations)) {
                score += 50000;
            }

            if (workedYesterday(f._id, date, currentAllocations)) {
                score += 500;
            }

            // Randomized tie-breaker (0-900).
            // Large range ensures that "Fresh" (0) and "Tired" (500) overlap significantly.
            // This breaks rigid "Even/Odd Day" cohorts/patterns.
            // Max 900 ensures we NEVER override the Total Allotment priority (Step 1000).
            score += Math.random() * 900;

            f.score = score; // Direct mutation
        });

        // 3. Sort by Score
        candidates.sort((a, b) => a.score - b.score);

        // 4. Select with Smart Threshold Logic
        const selected = [];
        const sessionDeptCounts = {};

        // Helper: Is Dept Full?
        const isDeptFull = (dept) => {
            const totalSize = deptSizes[dept] || 10;
            const currentAllocated = sessionDeptCounts[dept] || 0;
            // Target: Leave ~35% -> Allocate Max ~65%
            const maxAllocatable = Math.max(1, Math.ceil(totalSize * 0.65));
            return currentAllocated >= maxAllocatable;
        };

        // We select 'count' people one by one
        // In each step, we look at the 'best' remaining candidates
        for (let i = 0; i < count; i++) {
            if (candidates.length === 0) break;

            // Strategy:
            // 1. Look at the absolute best candidate (candidates[0]).
            // 2. If their Dept is NOT full, pick them.
            // 3. If their Dept IS full, look down the list for the first candidate whose Dept is NOT full.
            // 4. Compare their Total Allotments.
            // 5. STRICT FAIRNESS: If the difference is > 0 (even 1 duty), pick the Absolute Best (Fairness > Dept Limit).
            // 6. Only if counts are IDENTICAL (diff 0), pick the Dept-Valid candidate.

            let bestIndex = 0; // The candidate with lowest score
            let chosenIndex = -1;

            const bestCandidate = candidates[0];

            if (!isDeptFull(bestCandidate.department)) {
                chosenIndex = 0;
            } else {
                // Dept is full. Look for a valid alternative.
                let validAltIndex = -1;
                for (let j = 1; j < candidates.length; j++) {
                    if (!isDeptFull(candidates[j].department)) {
                        validAltIndex = j;
                        break;
                    }
                }

                if (validAltIndex !== -1) {
                    const altCandidate = candidates[validAltIndex];
                    const scoreDiff = altCandidate.score - bestCandidate.score;

                    // NEW STRICT LOGIC:
                    // Only prefer Alt if scores are practically identical (diff < 1000, i.e., same total counts).
                    // If Best has 6 and Alt has 7 (Diff ~1000), we pick Best (6).
                    // We only pick Alt if both have 6.

                    if (scoreDiff < 500) { // Practically same score (Tie-breaker range)
                        chosenIndex = validAltIndex;
                    } else {
                        // Counts differ. Fairness is priority. Ignore Dept Limit.
                        chosenIndex = 0;
                    }
                } else {
                    // No valid alternatives. Must pick best.
                    chosenIndex = 0;
                }
            }

            // Execute Selection
            const selectedCandidate = candidates[chosenIndex];
            selected.push(selectedCandidate);

            // Update State
            selectedCandidate.totalAllotments += 1;
            sessionDeptCounts[selectedCandidate.department] = (sessionDeptCounts[selectedCandidate.department] || 0) + 1;

            // Remove from pool
            candidates.splice(chosenIndex, 1);
        }

        return selected;
    };

    return {
        allocations,
        setAllocations,
        startAllocation
    };
};

export default useExamAllocation;
