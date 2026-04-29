
export const parseSessionData = (content) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    const sessionData = {}; // { date: { morning: {...}, afternoon: {...} } }

    // Find all sections in the document
    const allElements = doc.querySelectorAll('*');
    let currentDate = '';
    let currentSession = '';
    let currentExamInfo = {};

    // Helper to extract text safely
    const getText = (el) => el ? el.textContent.trim() : '';

    for (let i = 0; i < allElements.length; i++) {
        const element = allElements[i];
        const text = getText(element);

        // Look for date information
        if (text.includes('Date of Exam')) {
            const dateMatch = text.match(/Date of Exam\s*:\s*(.+?)(?:\s+(?:AM|PM)|$)/i);
            if (dateMatch) {
                const fullDateText = dateMatch[1].trim();
                // Try to handle DD-MM-YYYY or DD.MM.YYYY or DD/MM/YYYY
                const cleanDate = fullDateText.replace(/[./]/g, '-');
                const parts = cleanDate.split('-');

                // Assumption: DD-MM-YYYY
                if (parts.length === 3) {
                    // Convert to YYYY-MM-DD
                    currentDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
                } else {
                    // Fallback, just take raw or first part
                    currentDate = parts[0];
                }

                // If it looks like "20 February 2025", we might need standard parse
                if (isNaN(Date.parse(currentDate)) && parts.length !== 3) {
                    // Try parsing natural language date
                    const naturalDate = new Date(fullDateText);
                    if (!isNaN(naturalDate.getTime())) {
                        currentDate = naturalDate.toISOString().split('T')[0];
                    }
                }

                if (text.includes('AM')) currentSession = 'morning';
                else if (text.includes('PM')) currentSession = 'afternoon';
            }
        }

        // Look for exam info
        if (text.includes('Number of Rooms') || text.includes('Reliever') || text.includes('Total Invigilators')) {
            const roomsMatch = text.match(/Number of Rooms\s*:\s*(\d+)/i);
            const relieverMatch = text.match(/Reliever\s*:\s*(\d+)/i);
            const totalMatch = text.match(/Total Invigilators\s*:\s*(\d+)/i);

            if (roomsMatch || relieverMatch || totalMatch) {
                currentExamInfo = {
                    rooms: roomsMatch ? roomsMatch[1] : (currentExamInfo.rooms || ''),
                    reliever: relieverMatch ? relieverMatch[1] : (currentExamInfo.reliever || ''),
                    totalInvigilators: totalMatch ? totalMatch[1] : (currentExamInfo.totalInvigilators || '')
                };
            }
        }

        // Look for session titles
        if (text.match(/^(MORNING|AFTERNOON)\s+SESSION$/i)) {
            currentSession = text.toLowerCase().includes('morning') ? 'morning' : 'afternoon';
        }

        // Look for tables
        if (element.tagName === 'TABLE') {
            const rows = element.querySelectorAll('tr');
            let isDeputyTable = false;
            let isInvigilatorTable = false;
            let deputies = [];
            let invigilators = [];

            rows.forEach(row => {
                const cells = row.querySelectorAll('td, th');
                if (cells.length > 0) {
                    const headerText = Array.from(cells).map(cell => cell.textContent.trim().toLowerCase()).join(' ');

                    if (headerText.includes('sl no') && headerText.includes('name') && !headerText.includes('alloted room')) {
                        isDeputyTable = true;
                        isInvigilatorTable = false;
                        return;
                    }

                    if (headerText.includes('sl no') && headerText.includes('name') && headerText.includes('alloted room')) {
                        isInvigilatorTable = true;
                        isDeputyTable = false;
                        return;
                    }

                    if (isDeputyTable && cells.length >= 6) {
                        const name = cells[1].textContent.trim();
                        if (name && name.toLowerCase() !== 'name') {
                            deputies.push({
                                slNo: cells[0].textContent.trim(),
                                name: name,
                                designation: cells[2].textContent.trim(),
                                initials: cells[3].textContent.trim(),
                                contact: cells[4].textContent.trim(),
                                dept: cells[5].textContent.trim()
                            });
                        }
                    }

                    if (isInvigilatorTable && cells.length >= 6) {
                        const name = cells[1].textContent.trim();
                        if (name && name.toLowerCase() !== 'name') {
                            invigilators.push({
                                slNo: cells[0].textContent.trim(),
                                name: name,
                                designation: cells[2].textContent.trim(),
                                initials: cells[3].textContent.trim(),
                                contact: cells[4].textContent.trim(),
                                dept: cells[5].textContent.trim(),
                                room: cells.length > 6 ? cells[6].textContent.trim() : ''
                            });
                        }
                    }
                }
            });

            if (currentDate && currentSession) {
                if (!sessionData[currentDate]) sessionData[currentDate] = {};
                if (!sessionData[currentDate][currentSession]) {
                    sessionData[currentDate][currentSession] = {
                        examInfo: currentExamInfo,
                        deputies: [],
                        invigilators: []
                    };
                }

                if (deputies.length > 0) sessionData[currentDate][currentSession].deputies = deputies;
                if (invigilators.length > 0) sessionData[currentDate][currentSession].invigilators = invigilators;
            }
        }
    }

    return sessionData;
};
