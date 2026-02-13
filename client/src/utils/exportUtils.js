import jsPDF from 'jspdf';
import 'jspdf-autotable';
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

export const generateRoomReport = (sessionData) => {
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
                        
                        <table style="border-collapse: collapse; width: 100%; margin-bottom: 15px;">
                            <tr>
                                <th style="border: 1px solid #000; padding: 5px;">Sl No</th>
                                <th style="border: 1px solid #000; padding: 5px;">Name</th>
                                <th style="border: 1px solid #000; padding: 5px;">Dept</th>
                                <th style="border: 1px solid #000; padding: 5px;">Room</th>
                            </tr>
                            ${sessionInfo.invigilators.map((inv) => `
                                <tr>
                                    <td style="border: 1px solid #000; padding: 5px;">${inv.slNo}</td>
                                    <td style="border: 1px solid #000; padding: 5px;">${inv.name}</td>
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
    saveAs(blob, `Room_Allotment_Report_${new Date().toISOString().split('T')[0]}.doc`);
};
