const API_URL = 'http://localhost:5000/api';

const runVerification = async () => {
    try {
        console.log('0. Checking Test Route...');
        try {
            const testRes = await fetch(`${API_URL}/test`);
            if (testRes.ok) {
                console.log('Test route /api/test is WORKING.');
            } else {
                console.log('Test route /api/test FAILED:', testRes.status);
            }
        } catch (e) {
            console.log('Test route /api/test FAILED (Network):', e.message);
        }

        console.log('1. Creating a dummy faculty...');
        const facultyData = {
            name: 'Test Faculty ' + Date.now(),
            initials: 'TF' + Math.floor(Math.random() * 1000),
            designation: 'Professor',
            department: 'CSE',
            email: 'test@example.com',
            phone: '1234567890'
        };

        const facRes = await fetch(`${API_URL}/faculty`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(facultyData)
        });

        if (!facRes.ok) throw new Error(`Faculty creation failed: ${facRes.statusText}`);
        const faculty = await facRes.json();
        console.log('Faculty created:', faculty.name, faculty.initials);

        console.log('2. Testing Save Allocations...');
        const sessionData = {
            "2023-11-20": {
                "morning": {
                    "deputies": [],
                    "invigilators": [
                        {
                            "name": faculty.name,
                            "initials": faculty.initials,
                            "designation": faculty.designation,
                            "room": "GJCB101"
                        }
                    ]
                }
            }
        };

        const allocRes = await fetch(`${API_URL}/allocations`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sessionData)
        });

        if (!allocRes.ok) throw new Error(`Allocation save failed: ${allocRes.statusText}`);
        const allocData = await allocRes.json();
        console.log('Allocation Response:', allocData);

        console.log('3. Verifying Allocation Persistence...');
        const dutiesRes = await fetch(`${API_URL}/allocations/faculty/${faculty._id}`);
        if (!dutiesRes.ok) throw new Error(`Fetch duties failed: ${dutiesRes.statusText}`);
        const duties = await dutiesRes.json();

        if (duties.length > 0 && duties[0].room === 'GJCB101') {
            console.log('SUCCESS: Allocation found for faculty.');
        } else {
            console.error('FAILURE: Allocation not found or incorrect.', duties);
        }

        console.log('4. Cleaning up...');
        await fetch(`${API_URL}/faculty/${faculty._id}`, { method: 'DELETE' });
        console.log('Cleanup complete.');

    } catch (err) {
        console.error('Verification Failed:', err.message);
    }
};

runVerification();
