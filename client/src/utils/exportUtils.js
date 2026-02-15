import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { saveAs } from 'file-saver';

// Helper to format date
const formatDate = (dateStr) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateStr).toLocaleDateString(undefined, options);
};

// Watermark HTML - using table for better Word compatibility
// We use the absolute path or a reachable URL. For client-side generation, 
// linking to the public folder image works if the document renders HTML. 
// However, Word might block external images or localhost images. 
// A robust way for local generation is often Base64, but let's try the public URL first as it's simpler.
// If this fails to show in Word, we might need to convert the image to Base64.
const getWatermark = () => `
    <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: -10; pointer-events: none; overflow: hidden; display: flex; align-items: center; justify-content: center;">
         <img src="http://localhost:5173/logo.png" style="width: 500px; opacity: 0.15; transform: rotate(-15deg);" alt="Watermark" />
    </div>
`;

export const generateDeputyReport = (allocations, config) => {
    let docContent = '';
    const dates = Object.keys(allocations).sort();

    dates.forEach(date => {
        ['morning', 'afternoon'].forEach(session => {
            const deputies = allocations[date]?.[session]?.deputies || [];
            const invigilators = allocations[date]?.[session]?.invigilators || [];

            if (deputies.length === 0 && invigilators.length === 0) return;

            const sessionLabel = session === 'morning' ? 'MORNING' : 'AFTERNOON';
            const sessionCode = session === 'morning' ? 'AM' : 'PM';
            const roomCount = config[date]?.[session]?.rooms || 0;
            const relieverCount = config[date]?.[session]?.relievers || 0;
            const totalInvigilators = invigilators.length;

            docContent += `
                <div style="position: relative; overflow: hidden; padding: 20px;">
                    <!-- Watermark Container -->
                    ${getWatermark()}
                    
                    <!-- Content Container -->
                    <div style="position: relative; z-index: 10;">
                        <div style="text-align: center; font-weight: bold; font-size: 16px; margin-bottom: 20px;">SIDDAGANGA INSTITUTE OF TECHNOLOGY, TUMKUR</div>
                        <div style="margin-bottom: 15px;">
                            <span style="display: inline-block; margin-right: 30px;"><strong>Date of Exam:</strong> ${formatDate(date)} ${sessionCode}</span>
                            <span style="display: inline-block; margin-right: 30px;"><strong>Number of Rooms:</strong> ${roomCount}</span>
                            <span style="display: inline-block; margin-right: 30px;"><strong>Reliever:</strong> ${relieverCount}</span>
                            <span style="display: inline-block; margin-right: 30px;"><strong>Total Invigilators:</strong> ${totalInvigilators}</span>
                        </div>
                        <div style="font-weight: bold; font-size: 14px; margin: 20px 0 10px 0; text-align: center;">${sessionLabel} SESSION</div>
                        
                        <div style="font-weight: bold; margin: 15px 0 5px 0;">List of Deputy Superintendents</div>
                        <table style="border-collapse: collapse; width: 100%; margin-bottom: 15px;">
                            <tr>
                                <th style="border: 1px solid #000; padding: 5px; text-align: left;">Sl No</th>
                                <th style="border: 1px solid #000; padding: 5px; text-align: left;">Name</th>
                                <th style="border: 1px solid #000; padding: 5px; text-align: left;">Designation</th>
                                <th style="border: 1px solid #000; padding: 5px; text-align: left;">Initials</th>
                                <th style="border: 1px solid #000; padding: 5px; text-align: left;">Contact No</th>
                                <th style="border: 1px solid #000; padding: 5px; text-align: left;">Dept</th>
                            </tr>
                            ${deputies.length > 0 ? deputies.map((dep, idx) => `
                                <tr>
                                    <td style="border: 1px solid #000; padding: 5px;">${idx + 1}</td>
                                    <td style="border: 1px solid #000; padding: 5px;">${dep.name}</td>
                                    <td style="border: 1px solid #000; padding: 5px;">${dep.designation}</td>
                                    <td style="border: 1px solid #000; padding: 5px;">${dep.initials}</td>
                                    <td style="border: 1px solid #000; padding: 5px;">${dep.phone || ''}</td>
                                    <td style="border: 1px solid #000; padding: 5px;">${dep.department}</td>
                                </tr>
                            `).join('') : `<tr><td colspan="6" style="border: 1px solid #000; padding: 5px; text-align: center;">No Deputy Superintendents allocated</td></tr>`}
                        </table>

                        <div style="font-weight: bold; margin: 15px 0 5px 0;">List of Invigilators</div>
                        <table style="border-collapse: collapse; width: 100%; margin-bottom: 15px;">
                            <tr>
                                <th style="border: 1px solid #000; padding: 5px; text-align: left;">Sl No</th>
                                <th style="border: 1px solid #000; padding: 5px; text-align: left;">Name</th>
                                <th style="border: 1px solid #000; padding: 5px; text-align: left;">Designation</th>
                                <th style="border: 1px solid #000; padding: 5px; text-align: left;">Initials</th>
                                <th style="border: 1px solid #000; padding: 5px; text-align: left;">Contact No</th>
                                <th style="border: 1px solid #000; padding: 5px; text-align: left;">Dept</th>
                                <th style="border: 1px solid #000; padding: 5px; text-align: left;">Alloted Room / Relieving ( R )</th>
                            </tr>
                            ${invigilators.length > 0 ? invigilators.map((inv, idx) => `
                                <tr>
                                    <td style="border: 1px solid #000; padding: 5px;">${idx + 1}</td>
                                    <td style="border: 1px solid #000; padding: 5px;">${inv.name}</td>
                                    <td style="border: 1px solid #000; padding: 5px;">${inv.designation}</td>
                                    <td style="border: 1px solid #000; padding: 5px;">${inv.initials}</td>
                                    <td style="border: 1px solid #000; padding: 5px;">${inv.phone || ''}</td>
                                    <td style="border: 1px solid #000; padding: 5px;">${inv.department}</td>
                                    <td style="border: 1px solid #000; padding: 5px;"></td>
                                </tr>
                            `).join('') : `<tr><td colspan="7" style="border: 1px solid #000; padding: 5px; text-align: center;">No Invigilators allocated</td></tr>`}
                        </table>
                    </div>
                </div>
                <br style="page-break-after: always;" />
            `;
        });
    });

    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Exam Allotment Report</title>
             <style>
                body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.4; }
                table { page-break-inside: auto; }
                tr { page-break-inside: avoid; page-break-after: auto; }
            </style>
        </head>
        <body>
            ${docContent}
        </body>
        </html>
    `;

    const blob = new Blob([htmlContent], { type: 'application/msword' });
    saveAs(blob, `SIT_Exam_Allotment_${new Date().toISOString().split('T')[0]}.doc`);
};

export const generateRoomReport = (sessionData, customFilename) => {
    let docContent = '';

    Object.keys(sessionData).forEach(date => {
        Object.keys(sessionData[date]).forEach(session => {
            const sessionInfo = sessionData[date][session];
            if (!sessionInfo.invigilators || sessionInfo.invigilators.length === 0) return;

            const sessionLabel = session === 'morning' ? 'MORNING' : 'AFTERNOON';

            docContent += `
                <div style="position: relative; overflow: hidden; padding: 20px;">
                    ${getWatermark()}
                    <div style="position: relative; z-index: 10;">
                        <div style="text-align: center; font-weight: bold; font-size: 16px; margin-bottom: 20px;">SIDDAGANGA INSTITUTE OF TECHNOLOGY, TUMKUR</div>
                        <div style="margin-bottom: 15px;">
                            <strong>Date:</strong> ${date} (${sessionLabel})
                        </div>

                        ${sessionInfo.deputies && sessionInfo.deputies.length > 0 ? `
                        <div style="font-weight: bold; margin: 15px 0 5px 0;">Deputy Superintendents</div>
                        <table style="border-collapse: collapse; width: 100%; margin-bottom: 15px;">
                            <tr>
                                <th style="border: 1px solid #000; padding: 5px;">Sl No</th>
                                <th style="border: 1px solid #000; padding: 5px;">Name</th>
                                <th style="border: 1px solid #000; padding: 5px;">Initials</th>
                                <th style="border: 1px solid #000; padding: 5px;">Mobile</th>
                                <th style="border: 1px solid #000; padding: 5px;">Dept</th>
                                <th style="border: 1px solid #000; padding: 5px;">Room</th>
                            </tr>
                            ${sessionInfo.deputies.map((dep, idx) => `
                                <tr>
                                    <td style="border: 1px solid #000; padding: 5px;">${idx + 1}</td>
                                    <td style="border: 1px solid #000; padding: 5px;">${dep.name}</td>
                                    <td style="border: 1px solid #000; padding: 5px;">${dep.initials || '-'}</td>
                                    <td style="border: 1px solid #000; padding: 5px;">${dep.contact || '-'}</td>
                                    <td style="border: 1px solid #000; padding: 5px;">${dep.department || dep.dept || ''}</td>
                                    <td style="border: 1px solid #000; padding: 5px;">-</td>
                                </tr>
                            `).join('')}
                        </table>
                        ` : ''}
                        
                        <div style="font-weight: bold; margin: 15px 0 5px 0;">Invigilators</div>
                        <table style="border-collapse: collapse; width: 100%; margin-bottom: 15px;">
                            <tr>
                                <th style="border: 1px solid #000; padding: 5px;">Sl No</th>
                                <th style="border: 1px solid #000; padding: 5px;">Name</th>
                                <th style="border: 1px solid #000; padding: 5px;">Initials</th>
                                <th style="border: 1px solid #000; padding: 5px;">Mobile</th>
                                <th style="border: 1px solid #000; padding: 5px;">Dept</th>
                                <th style="border: 1px solid #000; padding: 5px;">Room</th>
                            </tr>
                            ${sessionInfo.invigilators.map((inv) => `
                                <tr>
                                    <td style="border: 1px solid #000; padding: 5px;">${inv.slNo}</td>
                                    <td style="border: 1px solid #000; padding: 5px;">${inv.name}</td>
                                    <td style="border: 1px solid #000; padding: 5px;">${inv.initials || '-'}</td>
                                    <td style="border: 1px solid #000; padding: 5px;">${inv.contact || '-'}</td>
                                    <td style="border: 1px solid #000; padding: 5px;">${inv.dept}</td>
                                    <td style="border: 1px solid #000; padding: 5px;">${inv.room}</td>
                                </tr>
                            `).join('')}
                        </table>
                    </div>
                </div>
                <br style="page-break-after: always;" />
             `;
        });
    });

    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Room Allotment</title>
            <style>body { font-family: Arial, sans-serif; }</style>
        </head>
        <body>${docContent}</body>
        </html>
    `;

    const blob = new Blob([htmlContent], { type: 'application/msword' });
    const filename = customFilename || `Room_Allotment_Report_${new Date().toISOString().split('T')[0]}.doc`;
    saveAs(blob, filename);
};

export const generateDepartmentReport = (sessionData, targetDept = null) => {
    // 1. Extract all unique dates and sessions
    const dates = Object.keys(sessionData).sort();
    if (dates.length === 0) return;

    // Create a mapping of Date -> Sessions for report headers
    const dateHeaders = [];
    dates.forEach(date => {
        ['morning', 'afternoon'].forEach(session => {
            if (sessionData[date][session]) {
                dateHeaders.push({ date, session, label: `${date.split(',')[0]} (${session === 'morning' ? 'AM' : 'PM'})` });
            }
        });
    });

    // 2. Aggregate data by Department -> Faculty
    const deptData = {};

    dates.forEach(date => {
        ['morning', 'afternoon'].forEach(session => {
            const sessionInfo = sessionData[date]?.[session];
            if (!sessionInfo) return;

            // Helper to process people
            const processPerson = (person, role) => {
                if (!person.name || person.name.startsWith('Test Faculty')) return;

                const dept = person.department || person.dept || 'Unknown';
                if (!deptData[dept]) deptData[dept] = {};

                // Use Name + Initials as unique key
                // Clean name to avoid duplicates
                const cleanName = person.name.trim();
                const cleanInitials = (person.initials || '').trim();
                const key = `${cleanName}_${cleanInitials}`;

                if (!deptData[dept][key]) {
                    deptData[dept][key] = {
                        name: cleanName,
                        initials: cleanInitials,
                        designation: person.designation || '',
                        isDeputy: role === 'Deputy', // Track if they are ever a deputy
                        duties: {}
                    };
                } else if (role === 'Deputy') {
                    // Upgrade to deputy if they appear as one
                    deptData[dept][key].isDeputy = true;
                }

                // Record duty
                const duty = person.room || (role === 'Deputy' ? 'Deputy' : 'Invigilator');
                deptData[dept][key].duties[`${date}_${session}`] = duty;
            };

            if (sessionInfo.deputies) sessionInfo.deputies.forEach(p => processPerson(p, 'Deputy'));
            if (sessionInfo.invigilators) sessionInfo.invigilators.forEach(p => processPerson(p, 'Invigilator'));
        });
    });

    // 3. Generate HTML
    let docContent = '';

    const departmentsToExport = targetDept ? [targetDept] : Object.keys(deptData).sort();

    departmentsToExport.forEach((dept, index) => {
        if (!deptData[dept]) return;

        const fullFacultyList = Object.values(deptData[dept]);
        const deputyList = fullFacultyList.filter(f => f.isDeputy).sort((a, b) => a.name.localeCompare(b.name));
        const invigilatorList = fullFacultyList.filter(f => !f.isDeputy).sort((a, b) => a.name.localeCompare(b.name));

        const renderTable = (list, title) => {
            if (list.length === 0) return '';
            return `
                ${title ? `<div style="font-weight: bold; font-size: 14px; margin-top: 15px; margin-bottom: 10px;">${title}</div>` : ''}
                <table style="border-collapse: collapse; width: 100%; font-size: 10px; margin-bottom: 20px;">
                    <thead>
                        <tr>
                            <th style="border: 1px solid #000; padding: 4px;">Sl. No.</th>
                            <th style="border: 1px solid #000; padding: 4px;">Name of the Faculty</th>
                            <th style="border: 1px solid #000; padding: 4px;">Initials</th>
                            <th style="border: 1px solid #000; padding: 4px;">Designation</th>
                            <th style="border: 1px solid #000; padding: 4px;">Allocated Dates</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${list.map((fac, idx) => {
                const dutyStrings = [];
                dates.forEach(date => {
                    ['morning', 'afternoon'].forEach(session => {
                        const key = `${date}_${session}`;
                        if (fac.duties[key]) {
                            const sessionLabel = session === 'morning' ? 'AM' : 'PM';
                            // Try to format date from 'February 16, 2026' to '16-02-2026'
                            let shortDate = date;
                            try {
                                const d = new Date(date);
                                if (!isNaN(d.getTime())) {
                                    const day = String(d.getDate()).padStart(2, '0');
                                    const month = String(d.getMonth() + 1).padStart(2, '0');
                                    const year = d.getFullYear();
                                    shortDate = `${day}-${month}-${year}`;
                                }
                            } catch (e) { /* ignore */ }

                            dutyStrings.push(`${shortDate} (${sessionLabel})`);
                        }
                    });
                });
                const dutyContent = dutyStrings.length > 0 ? dutyStrings.join(', ') : '-';
                return `
                                <tr>
                                    <td style="border: 1px solid #000; padding: 4px; text-align: center;">${idx + 1}</td>
                                    <td style="border: 1px solid #000; padding: 4px;">${fac.name}</td>
                                    <td style="border: 1px solid #000; padding: 4px;">${fac.initials}</td>
                                    <td style="border: 1px solid #000; padding: 4px;">${fac.designation}</td>
                                    <td style="border: 1px solid #000; padding: 4px;">${dutyContent}</td>
                                </tr>
                            `;
            }).join('')}
                    </tbody>
                </table>
            `;
        };

        // Explicit page break for all except first
        const pageBreak = index > 0 ? '<br style="page-break-before: always; mso-break-type: section-break;" />' : '';

        docContent += `
            ${pageBreak}
            <div style="padding: 20px; font-family: Arial, sans-serif;">
                <div style="text-align: center; margin-bottom: 20px;">
                    <div style="font-weight: bold; font-size: 16px;">SIDDAGANGA INSTITUTE OF TECHNOLOGY, TUMKUR</div>
                    <div style="font-weight: bold; font-size: 14px; margin-top: 5px;">ALLOTMENT OF INVIGILATION DUTY FOR SEMESTER EXAMINATIONS</div>
                    <div style="font-weight: bold; font-size: 14px; margin-top: 5px; text-decoration: underline;">${dept.toUpperCase()} - EXAM ALLOTMENT</div>
                </div>

                <div style="font-size: 11px; margin-bottom: 20px;">
                    <div style="font-weight: bold; margin-bottom: 5px;">General Instructions :</div>
                    <ol style="margin: 0; padding-left: 20px;">
                        <li style="margin-bottom: 3px;">Deputy chief Supdts are requested to report to duty one hour before the schedule time of the commencement of examinations.</li>
                        <li style="margin-bottom: 3px;">Room Supdts/Relieving Supdts are requested to report to duty HALF an hour before the scheduled time of the start of the examinations.</li>
                        <li style="margin-bottom: 3px;">Request letter for mutual exchange of duty should be sent through Heads of the concerned Depts to the principal.</li>
                        <li style="margin-bottom: 3px;">Mutual exchange is permitted in the same cadre and block transfer of invigilation work is not permitted.</li>
                        <li style="margin-bottom: 3px;">Deputy Supdts/Relieving Supdts are requested to refer to the circular issued by VTU on the DUTIES and RESPONSIBILITIES and follow the same.</li>
                    </ol>
                    <div style="margin-top: 8px; font-style: italic;">Kind cooperation & involvement of every one is solicited for the Smooth conduct of examinations.</div>
                </div>
                
                ${renderTable(deputyList, 'DEPUTY CHIEF SUPERINTENDENTS')}
                ${renderTable(invigilatorList, 'FACULTY / INVIGILATORS')}
            </div>
        `;
    });

    const htmlContent = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head>
            <meta charset="UTF-8">
            <title>Department Allotment Report</title>
            <!--[if gte mso 9]>
            <xml>
            <w:WordDocument>
            <w:View>Print</w:View>
            <w:Zoom>100</w:Zoom>
            </w:WordDocument>
            </xml>
            <![endif]-->
            <style>
                @page {
                    size: 29.7cm 21cm;
                    mso-page-orientation: landscape;
                    margin: 1cm;
                }
                body { 
                    font-family: Arial, sans-serif; 
                }
            </style>
        </head>
        <body>
            <div>
                ${docContent}
            </div>
        </body>
        </html>
    `;

    const blob = new Blob([htmlContent], { type: 'application/msword' });
    const filename = targetDept
        ? `${targetDept}_Exam_Allotment_${new Date().toISOString().split('T')[0]}.doc`
        : `Dept_Wise_Allotment_${new Date().toISOString().split('T')[0]}.doc`;
    saveAs(blob, filename);
};

export const generateRoomPDF = (sessionData, customFilename) => {
    try {
        const doc = new jsPDF();

        let isFirstPage = true;

        Object.keys(sessionData).forEach(date => {
            Object.keys(sessionData[date]).forEach(session => {
                const sessionInfo = sessionData[date][session];
                if (!sessionInfo.invigilators || sessionInfo.invigilators.length === 0) return;

                if (!isFirstPage) {
                    doc.addPage();
                }
                isFirstPage = false;

                const sessionLabel = session === 'morning' ? 'MORNING' : 'AFTERNOON';

                // Header
                doc.setFontSize(14);
                doc.setFont('helvetica', 'bold');
                doc.text('SIDDAGANGA INSTITUTE OF TECHNOLOGY, TUMKUR', 105, 15, { align: 'center' });

                doc.setFontSize(11);
                doc.setFont('helvetica', 'normal');
                doc.text(`Date: ${date} (${sessionLabel})`, 14, 25);

                let startY = 35;

                // Deputies Table
                if (sessionInfo.deputies && sessionInfo.deputies.length > 0) {
                    doc.setFontSize(11);
                    doc.setFont('helvetica', 'bold');
                    doc.text('Deputy Superintendents', 14, startY);
                    startY += 5;

                    const deputyHeaders = [['Sl No', 'Name', 'Initials', 'Mobile', 'Dept', 'Room']];
                    const deputyRows = sessionInfo.deputies.map((dep, idx) => [
                        idx + 1,
                        dep.name,
                        dep.initials || '-',
                        dep.contact || '-',
                        dep.department || dep.dept || '',
                        '-'
                    ]);

                    autoTable(doc, {
                        startY: startY,
                        head: deputyHeaders,
                        body: deputyRows,
                        theme: 'grid',
                        styles: { fontSize: 9, cellPadding: 2 },
                        headStyles: { fillColor: [220, 220, 220], textColor: 20, fontStyle: 'bold' }
                    });

                    startY = doc.lastAutoTable.finalY + 10;
                }

                // Invigilators Table
                doc.setFontSize(11);
                doc.setFont('helvetica', 'bold');
                doc.text('Invigilators', 14, startY);
                startY += 5;

                const invigHeaders = [['Sl No', 'Name', 'Initials', 'Mobile', 'Dept', 'Room']];
                const invigRows = sessionInfo.invigilators.map(inv => [
                    inv.slNo,
                    inv.name,
                    inv.initials || '-',
                    inv.contact || '-',
                    inv.dept,
                    inv.room
                ]);

                autoTable(doc, {
                    startY: startY,
                    head: invigHeaders,
                    body: invigRows,
                    theme: 'grid',
                    styles: { fontSize: 9, cellPadding: 2 },
                    headStyles: { fillColor: [220, 220, 220], textColor: 20, fontStyle: 'bold' }
                });
            });
        });

        const filename = customFilename || `Room_Allotment_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(filename);

    } catch (error) {
        console.error("PDF Generation Error:", error);
        alert("Failed to generate PDF. See console for details.");
    }
};

export const generateDepartmentPDF = (sessionData, targetDept = null) => {
    try {
        // 1. Extract all unique dates and sessions
        const dates = Object.keys(sessionData).sort();
        if (dates.length === 0) return;

        // 2. Aggregate data by Department -> Faculty
        const deptData = {};

        dates.forEach(date => {
            ['morning', 'afternoon'].forEach(session => {
                const sessionInfo = sessionData[date]?.[session];
                if (!sessionInfo) return;

                // Helper to process people
                const processPerson = (person, role) => {
                    if (!person.name || person.name.startsWith('Test Faculty')) return;

                    const dept = person.department || person.dept || 'Unknown';
                    if (!deptData[dept]) deptData[dept] = {};

                    // Use Name + Initials as unique key
                    const cleanName = person.name.trim();
                    const cleanInitials = (person.initials || '').trim();
                    const key = `${cleanName}_${cleanInitials}`;

                    if (!deptData[dept][key]) {
                        deptData[dept][key] = {
                            name: cleanName,
                            initials: cleanInitials,
                            designation: person.designation || '',
                            isDeputy: role === 'Deputy',
                            duties: {}
                        };
                    } else if (role === 'Deputy') {
                        deptData[dept][key].isDeputy = true;
                    }

                    // Record duty
                    const duty = person.room || (role === 'Deputy' ? 'Deputy' : 'Invigilator');
                    deptData[dept][key].duties[`${date}_${session}`] = duty;
                };

                if (sessionInfo.deputies) sessionInfo.deputies.forEach(p => processPerson(p, 'Deputy'));
                if (sessionInfo.invigilators) sessionInfo.invigilators.forEach(p => processPerson(p, 'Invigilator'));
            });
        });

        // 3. Generate PDF
        const doc = new jsPDF({ orientation: 'landscape' });
        let isFirstPage = true;

        const departmentsToExport = targetDept ? [targetDept] : Object.keys(deptData).sort();

        departmentsToExport.forEach((dept) => {
            if (!deptData[dept]) return;

            const fullFacultyList = Object.values(deptData[dept]);
            const deputyList = fullFacultyList.filter(f => f.isDeputy).sort((a, b) => a.name.localeCompare(b.name));
            const invigilatorList = fullFacultyList.filter(f => !f.isDeputy).sort((a, b) => a.name.localeCompare(b.name));

            if (!isFirstPage) {
                doc.addPage();
            }
            isFirstPage = false;

            // Header
            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.text('SIDDAGANGA INSTITUTE OF TECHNOLOGY, TUMKUR', 148.5, 15, { align: 'center' });

            doc.setFontSize(12);
            doc.text('ALLOTMENT OF INVIGILATION DUTY FOR SEMESTER EXAMINATIONS', 148.5, 23, { align: 'center' });

            doc.setFontSize(12);
            doc.text(`${dept.toUpperCase()} - EXAM ALLOTMENT`, 148.5, 30, { align: 'center' }); // Added Underline manually by drawing line if needed, but text is fine.

            // General Instructions
            doc.setFontSize(10);
            doc.text('General Instructions :', 14, 40);
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);

            const instructions = [
                '1. Deputy chief Supdts are requested to report to duty one hour before the schedule time of the commencement of examinations.',
                '2. Room Supdts/Relieving Supdts are requested to report to duty HALF an hour before the scheduled time of the start of the examinations.',
                '3. Request letter for mutual exchange of duty should be sent through Heads of the concerned Depts to the principal.',
                '4. Mutual exchange is permitted in the same cadre and block transfer of invigilation work is not permitted.',
                '5. Deputy Supdts/Relieving Supdts are requested to refer to the circular issued by VTU on the DUTIES and RESPONSIBILITIES and follow the same.'
            ];

            let instrY = 45;
            instructions.forEach(inst => {
                const splitText = doc.splitTextToSize(inst, 270);
                doc.text(splitText, 14, instrY);
                instrY += (splitText.length * 4);
            });

            doc.setFont('helvetica', 'italic');
            doc.text('Kind cooperation & involvement of every one is solicited for the Smooth conduct of examinations.', 14, instrY + 2);

            let startY = instrY + 10;

            const renderTable = (list, title) => {
                if (list.length === 0) return;

                doc.setFont('helvetica', 'bold');
                doc.setFontSize(11);
                doc.text(title, 14, startY);
                startY += 5;

                const headers = [['Sl. No.', 'Name of the Faculty', 'Initials', 'Designation', 'Allocated Dates']];
                const rows = list.map((fac, idx) => {
                    const dutyStrings = [];
                    dates.forEach(date => {
                        ['morning', 'afternoon'].forEach(session => {
                            const key = `${date}_${session}`;
                            if (fac.duties[key]) {
                                const sessionLabel = session === 'morning' ? 'AM' : 'PM';
                                let shortDate = date;
                                try {
                                    const d = new Date(date);
                                    if (!isNaN(d.getTime())) {
                                        const day = String(d.getDate()).padStart(2, '0');
                                        const month = String(d.getMonth() + 1).padStart(2, '0');
                                        const year = d.getFullYear();
                                        shortDate = `${day}-${month}-${year}`;
                                    }
                                } catch (e) { /* ignore */ }
                                dutyStrings.push(`${shortDate} (${sessionLabel})`);
                            }
                        });
                    });
                    return [
                        idx + 1,
                        fac.name,
                        fac.initials,
                        fac.designation,
                        dutyStrings.join(', ')
                    ];
                });

                autoTable(doc, {
                    startY: startY,
                    head: headers,
                    body: rows,
                    theme: 'grid',
                    styles: { fontSize: 9, cellPadding: 2 },
                    headStyles: { fillColor: [220, 220, 220], textColor: 20, fontStyle: 'bold' },
                    columnStyles: {
                        0: { cellWidth: 15, halign: 'center' },
                        1: { cellWidth: 50 },
                        2: { cellWidth: 20 },
                        3: { cellWidth: 40 },
                        4: { cellWidth: 'auto' }
                    }
                });

                startY = doc.lastAutoTable.finalY + 10;
            };

            renderTable(deputyList, 'DEPUTY CHIEF SUPERINTENDENTS');
            renderTable(invigilatorList, 'FACULTY / INVIGILATORS');
        });

        const filename = targetDept
            ? `${targetDept}_Exam_Allotment_${new Date().toISOString().split('T')[0]}.pdf`
            : `Dept_Wise_Allotment_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(filename);

    } catch (error) {
        console.error("Dept PDF Generation Error:", error);
        alert("Failed to generate Dept PDF. See console for details.");
    }
};
