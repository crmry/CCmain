document.addEventListener('DOMContentLoaded', () => {
    function clearForm() {
        console.log("Clear Form button clicked");
        location.reload();
    }

    function openPreview() {
        console.log("Preview button clicked");

        const FeesToBePaid = document.getElementById('FeesToBePaid').value || "N/A";
        const ProcessingTime = document.getElementById('ProcessingTime').value || "N/A";
        const serviceName = document.getElementById('serviceNameInput').value;
        const description = editor.getData();
        const office = document.querySelector('textarea[name="office"]').value;
        const classificationElement = document.querySelector('input[name="classification"]:checked');
        const classification = classificationElement ? classificationElement.value : 'Not selected';
        const transactionTypes = Array.from(document.querySelectorAll('input[name="transaction_type"]:checked'))
            .map(el => el.value).join(', ');
        const whoMayAvail = document.querySelector('textarea[name="who_may_avail"]').value.replace(/\n/g, '<br>');

        let requirements = [];
        requirementEditors.forEach(req => {
            if (req.type === 'requirement') {
                const requirementData = req.editor.getData();
                const whereToSecureEditor = requirementEditors.find(r => r.index === req.index && r.type === 'whereToSecure');
                const whereToSecureData = whereToSecureEditor ? whereToSecureEditor.editor.getData() : '';
                requirements.push({ requirement: requirementData, whereToSecure: whereToSecureData });
            }
        });

        let processOverview = [];
        processOverviewEditors.forEach(proc => {
            if (proc.type === 'clientSteps') {
                const clientStepsData = proc.editor.getData();
                const agencyActionsEditor = processOverviewEditors.find(p => p.index === proc.index && p.type === 'agencyActions');
                const agencyActionsData = agencyActionsEditor ? agencyActionsEditor.editor.getData() : '';
                const feesToBePaidEditor = processOverviewEditors.find(p => p.index === proc.index && p.type === 'feesToBePaid');
                const feesToBePaidData = feesToBePaidEditor ? feesToBePaidEditor.editor.getData() : '';
                const processingTimeEditor = processOverviewEditors.find(p => p.index === proc.index && p.type === 'processingTime');
                const processingTimeData = processingTimeEditor ? processingTimeEditor.editor.getData() : '';
                const personResponsibleEditor = processOverviewEditors.find(p => p.index === proc.index && p.type === 'personResponsible');
                const personResponsibleData = personResponsibleEditor ? personResponsibleEditor.editor.getData() : '';
                processOverview.push({
                    clientSteps: clientStepsData,
                    agencyActions: agencyActionsData,
                    feesToBePaid: feesToBePaidData,
                    processingTime: processingTimeData,
                    personResponsible: personResponsibleData
                });
            }
        });

        displayPreview(serviceName, description, office, classification, transactionTypes, whoMayAvail, requirements, processOverview, FeesToBePaid, ProcessingTime);
    }

    document.querySelector('button[onclick="clearForm()"]').onclick = clearForm;
    document.querySelector('button[onclick="openPreview()"]').onclick = openPreview;
});

function displayPreview(serviceName, description, office, classification, transactionTypes, whoMayAvail, requirements, processOverview, FeesToBePaid, ProcessingTime) {
    let previewWindow = window.open('', '', 'width=816px,height=1056px');
    previewWindow.document.write(`
        <html>
        <head>
            <style>
                @page {
                    size: A4;
                    margin: 1.5in 1in 1in 1in;
                }
                body {
                    font-family: Arial, sans-serif;
                    line-height: 1.4;
                    margin: 0;
                    padding: 20px;
                    font-size: 12px;
                }
                .print-warning {
                    color: red;
                    font-weight: bold;
                    margin-bottom: 10px;
                }
                .main-header {
                    margin-bottom: 0;
                }
                .service-name {
                    font-size: 1.6em;
                    font-weight: bold;
                    margin-bottom: 5px;
                    display: block;
                }
                .pdf-button {
                    margin-bottom: 0;
                    padding: 8px 12px;
                    font-size: 14px;
                    cursor: pointer;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 0;
                    word-wrap: break-word;
                }
                th, td {
                    border: 1px solid #000;
                    padding: 6px;
                    text-align: left;
                    vertical-align: top;
                    word-break: break-word;
                }
                th {
                    background-color: #8eaadb;
                }
                .requirements-table-wrapper,
                .process-table-wrapper {
                    page-break-after: auto;
                    break-inside: avoid;
                    margin: 0;
                    padding: 0;
                }
                @media print {
                    table {
                        border-collapse: collapse;
                        page-break-inside: auto;
                        margin: 0;
                    }
                    thead {
                        display: table-header-group;
                    }
                    tfoot {
                        display: table-footer-group;
                    }
                    tr {
                        page-break-inside: avoid;
                        page-break-after: auto;
                    }
                    .requirements-table-wrapper,
                    .process-table-wrapper {
                        page-break-after: auto;
                        break-inside: avoid;
                        margin: 0;
                        padding: 0;
                    }
                    button, .print-warning {
                        display: none;
                    }
                    body {
                        margin: 0;
                        padding: 0;
                    }
                }
                @media screen and (max-width: 768px) {
                    body {
                        font-size: 10px;
                    }
                    .service-name {
                        font-size: 1.2em;
                    }
                    .pdf-button {
                        font-size: 12px;
                    }
                }
            </style>
        </head>
        <body>
            <div class="print-warning">
                * Before saving as PDF:<br>
                - Destination: <strong>"Save as PDF"</strong><br>
                - Click More Settings<br>
                - Uncheck <strong>"Headers and footers"</strong><br>
                - Check <strong>"Background graphics"</strong>
            </div>
            <button class="pdf-button" onclick="window.print()">Save as PDF</button>
            <div class="main-header">
                <span class="service-name">${serviceName}</span>
                <div class="service-description">${description}</div>
            </div>
            <table>
                <tr>
                    <th>Office or Division</th>
                    <td>${office}</td>
                </tr>
                <tr>
                    <th>Classification:</th>
                    <td>${classification}</td>
                </tr>
                <tr>
                    <th>Type of Transaction:</th>
                    <td>${transactionTypes}</td>
                </tr>
                <tr>
                    <th>Who may avail:</th>
                    <td>${whoMayAvail}</td>
                </tr>
            </table>
            <div class="requirements-table-wrapper">
                <table>
                    <thead>
                        <tr>
                            <th>CHECKLIST OF REQUIREMENTS</th>
                            <th>WHERE TO SECURE</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${requirements.map(req => `
                            <tr>
                                <td>${req.requirement}</td>
                                <td>${req.whereToSecure}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            <div class="process-table-wrapper">
                <table>
                    <thead>
                        <tr>
                            <th>CLIENT STEPS</th>
                            <th>AGENCY ACTIONS</th>
                            <th>FEES TO BE PAID</th>
                            <th>PROCESSING TIME</th>
                            <th>PERSON RESPONSIBLE</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${processOverview.map(proc => `
                            <tr>
                                <td>${proc.clientSteps}</td>
                                <td>${proc.agencyActions}</td>
                                <td>${proc.feesToBePaid}</td>
                                <td>${proc.processingTime}</td>
                                <td>${proc.personResponsible}</td>
                            </tr>
                        `).join('')}
                        <tr>
                            <td></td>
                            <th style="text-align:right;">TOTAL</th>
                            <th style="text-align:center;">${FeesToBePaid}</th>
                            <th style="text-align:center;">${ProcessingTime}</th>
                            <td></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </body>
        </html>
    `);
    previewWindow.document.close();
}
