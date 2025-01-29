// assets/formActions.js

document.addEventListener('DOMContentLoaded', () => {
    // Function to clear the form
    function clearForm() {
        console.log("Clear Form button clicked");
        // Clear all input fields
        document.getElementById('serviceNameInput').value = '';
        editor.setData('');
        document.querySelector('textarea[name="office"]').value = '';
        document.querySelectorAll('input[name="classification"]').forEach(radio => radio.checked = false);
        document.querySelectorAll('input[name="transaction_type"]').forEach(checkbox => checkbox.checked = false);
        document.querySelector('textarea[name="who_may_avail"]').value = '';
        document.getElementById('FeesToBePaid').value = '';
        document.getElementById('ProcessingTime').value = '';
        document.getElementById('requirementsTableBody').innerHTML = '';
        document.getElementById('processOverviewTableBody').innerHTML = '';
        requirementEditors = [];
        processOverviewEditors = [];
        editorCounter = 0;
    }

    // Function to open preview
    function openPreview() {
        console.log("Preview button clicked");
        const FeesToBePaid = document.getElementById('FeesToBePaid').value || "N/A";
        const ProcessingTime = document.getElementById('ProcessingTime').value || "N/A";
        const serviceName = document.getElementById('serviceNameInput').value;
        const description = editor.getData();
        const office = document.querySelector('textarea[name="office"]').value;
        const classificationElement = document.querySelector('input[name="classification"]:checked');
        const classification = classificationElement ? classificationElement.value : 'Not selected';
        const transactionTypes = Array.from(document.querySelectorAll('input[name="transaction_type"]:checked')).map(el => el.value).join(', ');
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
                processOverview.push({ clientSteps: clientStepsData, agencyActions: agencyActionsData, feesToBePaid: feesToBePaidData, processingTime: processingTimeData, personResponsible: personResponsibleData });
            }
        });

        displayPreview(serviceName, description, office, classification, transactionTypes, whoMayAvail, requirements, processOverview, FeesToBePaid, ProcessingTime);
    }

    // Function to save form data to the database
    function saveToDatabase() {
        console.log("Save button clicked");
        const FeesToBePaid = document.getElementById('FeesToBePaid').value || "N/A";
        const ProcessingTime = document.getElementById('ProcessingTime').value || "N/A";
        const serviceName = document.getElementById('serviceNameInput').value;
        const description = editor.getData();
        const office = document.querySelector('textarea[name="office"]').value;
        const classificationElement = document.querySelector('input[name="classification"]:checked');
        if (!classificationElement) {
            console.error('Element with name "classification" not found.');
            return;
        }
        const classification = classificationElement.value;
        const transactionTypes = Array.from(document.querySelectorAll('input[name="transaction_type"]:checked')).map(el => el.value).join(', ');
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
                processOverview.push({ clientSteps: clientStepsData, agencyActions: agencyActionsData, feesToBePaid: feesToBePaidData, processingTime: processingTimeData, personResponsible: personResponsibleData });
            }
        });

        const formData = new FormData();
        formData.append('serviceName', serviceName);
        formData.append('description', description);
        formData.append('office', office);
        formData.append('classification', classification);
        formData.append('transactionTypes', transactionTypes);
        formData.append('whoMayAvail', whoMayAvail);
        formData.append('requirements', JSON.stringify(requirements));
        formData.append('processOverview', JSON.stringify(processOverview));
        formData.append('feesToBePaid', FeesToBePaid);
        formData.append('processingTime', ProcessingTime);

        fetch('save_service.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.text())
        .then(data => {
            console.log(data);
            alert("Data saved successfully!");
        })
        .catch(error => {
            console.error('Error:', error);
            alert("Failed to save data!");
        });
    }

    // Ensure buttons are clickable and call the appropriate functions
    document.querySelector('button[onclick="clearForm()"]').onclick = clearForm;
    document.querySelector('button[onclick="openPreview()"]').onclick = openPreview;
    document.querySelector('button[onclick="saveToDatabase()"]').onclick = saveToDatabase;
});

function displayPreview(serviceName, description, office, classification, transactionTypes, whoMayAvail, requirements, processOverview, FeesToBePaid, ProcessingTime) {
    let previewWindow = window.open('', 'Preview', 'width=816px,height=1056px');
    previewWindow.document.write(`
        <html>
        <head>
            <title>Preview</title>
            <style>
                @media print {
                    table {
                        page-break-inside: auto;
                        border-collapse: collapse;
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
                }
                body {
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    margin: 0;
                    padding: 20px;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 20px;
                }
                th, td {
                    border: 1px solid #000;
                    padding: 8px;
                    text-align: left;
                    vertical-align: top;
                }
                table tr td:first-child {
                    width: 30%;
                    word-break: break-all;
                }
                table tr td:last-child {
                    width: 100%;
                }
                .main-header {
                    text-align: left;
                    margin-bottom: 20px;
                }
                .service-name {
                    font-family: Arial, sans-serif;
                    font-size: 19.2px !important;
                    font-weight: bold !important;
                    margin-bottom: 10px;
                    display: block;
                    width: 100%;
                }
                .service-description {
                    margin-bottom: 10px;
                }
                .requirements-header {
                    font-weight: bold;
                    background-color: #f2f2f2;
                }
                .requirements-table {
                    width: 100%;
                    margin-top: -21px;
                }
                .process-overview-table {
                    margin-top: -21px;
                }
            </style>
        </head>
        <body>
            <div class="main-header">
                <span class="service-name">${serviceName}</span>
                <div class="service-description">${description}</div>
            </div>
            <table class="info-table">
                <tr>
                    <td style="background-color:#8eaadb">Office or Division</td>
                    <td>${office}</td>
                </tr>
                <tr>
                    <td style="background-color:#8eaadb">Classification:</td>
                    <td>${classification}</td>
                </tr>
                <tr>
                    <td style="background-color:#8eaadb">Type of Transaction:</td>
                    <td>${transactionTypes}</td>
                </tr>
                <tr>
                    <td style="background-color:#8eaadb">Who may avail:</td>
                    <td>${whoMayAvail}</td>
                </tr>
            </table>
            <table class="process-overview-table">
                <tbody style="page-break-before:avoid">
                    <tr>
                        <th style="background-color:#8eaadb; text-align:center;" colspan="2">CHECKLIST OF REQUIREMENTS</th>
                        <th style="background-color:#8eaadb; text-align:center;" colspan="3">WHERE TO SECURE</th>
                    </tr>
                    ${requirements.map(req => `
                        <tr>
                            <td colspan="2">${req.requirement}</td>
                            <td colspan="3">${req.whereToSecure}</td>
                        </tr>
                    `).join('')}
                    <tr>
                        <th style="background-color:#8eaadb; text-align:center; page-break-before:avoid; width:30%; word-wrap: break-word;">CLIENT STEPS</th>
                        <th style="background-color:#8eaadb; text-align:center; page-break-before:avoid; width:30%; word-wrap: break-word;">AGENCY ACTIONS</th>
                        <th style="background-color:#8eaadb; text-align:center; page-break-before:avoid; width:10%; word-wrap: break-word;">FEES TO BE PAID</th>
                        <th style="background-color:#8eaadb; text-align:center; page-break-before:avoid; width:15%; word-wrap: break-word;">PROCESSING TIME</th>
                        <th style="background-color:#8eaadb; text-align:center; page-break-before:avoid; width:15%; word-wrap: break-word;">PERSON RESPONSIBLE</th>
                    </tr>
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
                        <td style="background-color:#8eaadb; text-align:center; width:30%;"></td>
                        <td style="background-color:#8eaadb; text-align:right; width:30%;">TOTAL</td>
                        <td style="background-color:#8eaadb; text-align:center; width:10%;">${FeesToBePaid}</td>
                        <td style="background-color:#8eaadb; text-align:center; width:15%;">${ProcessingTime}</td>
                        <td style="background-color:#8eaadb; text-align:center; width:15%;"></td>
                    </tr>
                </tbody>
            </table>
        </body>
        </html>
    `);
    previewWindow.document.close();
}
