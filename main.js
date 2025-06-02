// Get references to the HTML elements
const scheduleForm = document.getElementById('scheduleForm'); 
const subjectIdInput = document.getElementById('subjectIdInput');
const startDateInput = document.getElementById('startDateInput');
const scheduleOutputDiv = document.getElementById('scheduleOutput');
const printScheduleBtn = document.getElementById('printScheduleBtn');

/**
 * Formats a Date object into a readable string (e.g., "DD-MMM-YYYY").
 * @param {Date} date The Date object to format.
 * @returns {string} The formatted date string.
 */

// Sets date to match format used in research 
function formatDate(date) {
    const day = date.getDate().toString().padStart(2, '0');
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
}

/**
 * Generates the visit schedule table based on the selected start date.
 * This function is called when the form is successfully submitted.
 */
function generateSchedule(event) {
    // Prevent the default form submission behavior (which will reload the page)
    event.preventDefault();

    const startDateString = startDateInput.value;
    const subjectId = subjectIdInput.value; 

    // Basic input validation via pattern/required
    // but a final check here is is made to ensure necessary input
    if (!startDateString || !subjectId) {

        scheduleOutputDiv.innerHTML = '<p>Please enter both Subject ID and select a start date to generate the schedule.</p>';
        printScheduleBtn.disabled = true;
        return;
    }

    printScheduleBtn.disabled = false;

    const parts = startDateString.split('-');
    let currentTargetDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));

    let tableHTML = `
        <h2>Visit Schedule for Subject ID: ${subjectId}</h2> <table>
            <thead>
                <tr>
                    <th>Visit Number</th>
                    <th>Target Visit Date</th>
                    <th>Visit Window</th>
                </tr>
            </thead>
            <tbody>
    `;

    // This loop will create a schedule for visits 2 - 10, taking into account the 
    // additional 4 week gap at visit 8 and 10.  
    for (let i = 2; i <= 10; i++) {
        let visitNumber = `Visit ${i}`;
        let visitWindowStart = new Date(currentTargetDate);
        let visitWindowEnd = new Date(currentTargetDate);

        visitWindowStart.setDate(currentTargetDate.getDate() - 7);
        visitWindowEnd.setDate(currentTargetDate.getDate() + 7);

        tableHTML += `
            <tr>
                <td>${visitNumber}</td>
                <td>${formatDate(currentTargetDate)}</td>
                <td>${formatDate(visitWindowStart)} - ${formatDate(visitWindowEnd)}</td>
            </tr>
        `;

        if (i < 10) {  // While another visit exists, add 8 weeks (56 days)
            currentTargetDate.setDate(currentTargetDate.getDate() + 56);

            // As this looks at the CURRENT visit number, this IF statement is 
            // actually checking visits 8 and 10 are next in order to add 4 weeks
            if (i === 7 || i === 9) {
                currentTargetDate.setDate(currentTargetDate.getDate() + 28);
            }
        }
    }

    tableHTML += `
            </tbody>
        </table>
    `;

    scheduleOutputDiv.innerHTML = tableHTML;
}

/**
 * Handles printing the schedule table.
 */
function printSchedule() {
    const scheduleContent = scheduleOutputDiv.innerHTML;

    if (!scheduleContent || scheduleOutputDiv.querySelector('table') === null) {
        alert('Please generate a schedule first!');
        return;
    }

    const printWindow = window.open('', '_blank');

    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Print Visit Schedule</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 20px;
                }
                h1, h2 {
                    text-align: center;
                    color: #333;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 20px;
                }
                th, td {
                    border: 1px solid #000;
                    padding: 8px;
                    text-align: left;
                }
                th {
                    background-color: #f2f2f2;
                    color: #000;
                }
                @media print {
                    /* ... */
                }
            </style>
        </head>
        <body>
            ${scheduleContent}
        </body>
        </html>
    `);

    printWindow.document.close();

    printWindow.onload = function() {
        printWindow.focus();
        printWindow.print();
        printWindow.close();
    };
}

// EVENT LISTENERS

scheduleForm.addEventListener('submit', generateSchedule);
printScheduleBtn.addEventListener('click', printSchedule);

// Initial call to generate the schedule (and set print button state)
// This will now show the "Please enter..." message until form is submitted.
// No initial call to generateSchedule here, as it's triggered by form submit.
// Instead, just set print button to disabled initially.
printScheduleBtn.disabled = true;
scheduleOutputDiv.innerHTML = '<p>Please enter Subject ID and select a start date, then click "Generate Schedule".</p>';