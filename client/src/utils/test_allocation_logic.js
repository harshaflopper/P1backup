// Test Script for Allocation Logic

// --- MOCK DATA ---
const departments = ['CSE', 'ECE', 'ME', 'CV', 'ISE', 'BT', 'CH'];
const designations = ['Professor', 'Associate Professor', 'Assistant Professor'];

const generateFaculty = (count) => {
    return Array.from({ length: count }, (_, i) => ({
        _id: `f${i}`,
        name: `Faculty ${i}`,
        designation: designations[i % designations.length],
        department: departments[i % departments.length],
        isActive: true,
        totalAllotments: 0
    }));
};

const facultyList = generateFaculty(100);
const dates = ['2026-05-01', '2026-05-02', '2026-05-03', '2026-05-04', '2026-05-05'];
const config = {};
dates.forEach(d => {
    config[d] = {
        morning: { rooms: 20, relievers: 2 },
        afternoon: { rooms: 20, relievers: 2 }
    };
});

// --- LOGIC FROM useExamAllocation.js ---

const workedYesterday = (profId, currentDateStr, currentAllocations) => {
    const date = new Date(currentDateStr);
    date.setDate(date.getDate() - 1);
    const yesterdayStr = date.toISOString().split('T')[0];

    if (!currentAllocations[yesterdayStr]) return false;

    const am = [...(currentAllocations[yesterdayStr].morning?.deputies || []), ...(currentAllocations[yesterdayStr].morning?.invigilators || [])];
    const pm = [...(currentAllocations[yesterdayStr].afternoon?.deputies || []), ...(currentAllocations[yesterdayStr].afternoon?.invigilators || [])];

    return [...am, ...pm].some(p => p._id === profId);
};

const getDeptSizes = (faculty) => {
    const sizes = {};
    faculty.forEach(f => {
        sizes[f.department] = (sizes[f.department] || 0) + 1;
    });
    return sizes;
};

const workedSameDay = (profId, date, currentAllocations) => {
    const am = currentAllocations[date]?.morning?.deputies || [];
    const amInv = currentAllocations[date]?.morning?.invigilators || [];
    return [...am, ...amInv].some(p => p._id === profId);
};

const allocateSession = (allFaculty, date, type, count, excludeList, currentAllocations) => {
    if (count === 0) return [];

    const excludeIds = new Set(excludeList.map(f => f._id));
    const deptSizes = getDeptSizes(allFaculty);

    // 1. Valid Candidates
    let candidates = allFaculty.filter(f => {
        const desig = f.designation.toLowerCase();
        const isTrueProfessor = desig.includes('professor') && !desig.includes('assistant') && !desig.includes('associate');

        let matchesType = false;
        if (type === 'Professor') matchesType = isTrueProfessor;
        else if (type === 'Non-Professor') matchesType = !isTrueProfessor;
        else if (type === 'Any') matchesType = true;

        return matchesType && f.isActive && !excludeIds.has(f._id);
    });

    // 2. Score
    // candidates = candidates.map ... NO! This creates copies and breaks reference to workingFaculty.
    // We must mutate or find original. Since workingFaculty is a local deep copy, we can mutate.
    candidates.forEach(f => {
        let score = f.totalAllotments * 1000;

        if (workedSameDay(f._id, date, currentAllocations)) {
            score += 50000;
        }

        if (workedYesterday(f._id, date, currentAllocations)) {
            score += 500;
        }

        score += Math.random() * 10;
        f.score = score; // Direct mutation
    });

    // 3. Sort
    candidates.sort((a, b) => a.score - b.score);

    // 4. Select
    const selected = [];
    const sessionDeptCounts = {};

    const isDeptFull = (dept) => {
        const totalSize = deptSizes[dept] || 10;
        const currentAllocated = sessionDeptCounts[dept] || 0;
        const maxAllocatable = Math.max(1, Math.ceil(totalSize * 0.65));
        return currentAllocated >= maxAllocatable;
    };

    for (let i = 0; i < count; i++) {
        if (candidates.length === 0) break;

        let chosenIndex = -1;
        const bestCandidate = candidates[0];

        if (!isDeptFull(bestCandidate.department)) {
            chosenIndex = 0;
        } else {
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

                // STRICT LOGIC: Only pick Alt if diff < 500 (Same totals)
                if (scoreDiff < 500) {
                    chosenIndex = validAltIndex;
                } else {
                    chosenIndex = 0;
                }
            } else {
                chosenIndex = 0;
            }
        }

        const selectedCandidate = candidates[chosenIndex];
        selected.push(selectedCandidate);
        selectedCandidate.totalAllotments += 1;
        sessionDeptCounts[selectedCandidate.department] = (sessionDeptCounts[selectedCandidate.department] || 0) + 1;
        candidates.splice(chosenIndex, 1);
    }

    return selected;
};

// --- SIMULATION ---

const startAllocation = () => {
    let workingFaculty = JSON.parse(JSON.stringify(facultyList)).map(f => ({ ...f, totalAllotments: 0 }));
    let newAllocations = {};

    dates.forEach(date => {
        newAllocations[date] = {
            morning: { deputies: [], invigilators: [] },
            afternoon: { deputies: [], invigilators: [] }
        };

        const amRooms = config[date].morning.rooms;
        const amProfsNeeded = Math.ceil(amRooms / 7);
        const amNonProfsNeeded = amRooms + config[date].morning.relievers;

        const amDeputies = allocateSession(workingFaculty, date, 'Professor', amProfsNeeded, [], newAllocations);
        const amInvigilators = allocateSession(workingFaculty, date, 'Any', amNonProfsNeeded, amDeputies, newAllocations);

        newAllocations[date].morning.deputies = amDeputies;
        newAllocations[date].morning.invigilators = amInvigilators;

        const pmRooms = config[date].afternoon.rooms;
        const pmProfsNeeded = Math.ceil(pmRooms / 7);
        const pmNonProfsNeeded = pmRooms + config[date].afternoon.relievers;
        const amWorkers = [...amDeputies, ...amInvigilators];

        const pmDeputies = allocateSession(workingFaculty, date, 'Professor', pmProfsNeeded, amWorkers, newAllocations);
        const pmInvigilators = allocateSession(workingFaculty, date, 'Any', pmNonProfsNeeded, [...amWorkers, ...pmDeputies], newAllocations);

        newAllocations[date].afternoon.deputies = pmDeputies;
        newAllocations[date].afternoon.invigilators = pmInvigilators;
    });

    return workingFaculty;
};

const result = startAllocation();
const counts = result.map(f => f.totalAllotments).sort((a, b) => a - b);
const min = counts[0];
const max = counts[counts.length - 1];

console.log(`Min: ${min}, Max: ${max}`);
console.log(`Distribution:`, counts.slice(0, 20), '...', counts.slice(-20));

if (max - min > 1) {
    console.error("FAIL: Gap > 1");
} else {
    console.log("SUCCESS: Gap <= 1");
}
