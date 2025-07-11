		let editor;
		let requirementEditors = [];
		let processOverviewEditors = [];
		let editorCounter = 0;
		let ckeditorInstance;
		let previewWindow = null;

		document.addEventListener("DOMContentLoaded", () => {
		    ClassicEditor.create(document.querySelector("#editor")).then(e => {
		        ckeditorInstance = e;
		    }).catch(error => {
		        console.error('Error initializing main editor:', error);
		    });

		    addRequirementRow();
		    addProcessOverviewRow();
		});

		function addRequirementRow(requirementValue = '', whereValue = '') {
		    const tableBody = document.getElementById('requirementsTableBody');
		    const newRow = document.createElement('tr');
		    const rowIndex = editorCounter++;

		    newRow.innerHTML = `
        <td colspan="2">
            <div id="requirement-${rowIndex}"></div>
        </td>
        <td colspan="3">
            <div id="whereToSecure-${rowIndex}"></div>
        </td>
        <td style="text-align: center;">
            <button class="delete-btn" onclick="deleteRequirementRow(this.parentNode.parentNode)">Delete</button>
        </td>
    `;
		    tableBody.appendChild(newRow);

		    const editorConfig = {
		        toolbar: ['bold', 'italic', 'bulletedList', 'numberedList'],
		    };

		    ClassicEditor.create(document.querySelector(`#requirement-${rowIndex}`), editorConfig)
		        .then(editorInstance => {
		            editorInstance.setData(requirementValue);
			// Inject CSS to prevent word-break in CKEditor editable area
            editorInstance.editing.view.change(writer => {
                writer.setStyle('word-break', 'keep-all', editorInstance.editing.view.document.getRoot());
                writer.setStyle('overflow-wrap', 'break-word', editorInstance.editing.view.document.getRoot());
                writer.setStyle('white-space', 'normal', editorInstance.editing.view.document.getRoot());
				writer.setStyle('hyphens', 'none', editorInstance.editing.view.document.getRoot());
            });
		            requirementEditors.push({
		                type: 'requirement',
		                index: rowIndex,
		                editor: editorInstance
		            });
		        });
			
		    ClassicEditor.create(document.querySelector(`#whereToSecure-${rowIndex}`), editorConfig)
		        .then(editorInstance => {
		            editorInstance.setData(whereValue);
			// Inject CSS to prevent word-break in CKEditor editable area
            editorInstance.editing.view.change(writer => {
                writer.setStyle('word-break', 'keep-all', editorInstance.editing.view.document.getRoot());
                writer.setStyle('overflow-wrap', 'break-word', editorInstance.editing.view.document.getRoot());
                writer.setStyle('white-space', 'normal', editorInstance.editing.view.document.getRoot());
				writer.setStyle('hyphens', 'none', editorInstance.editing.view.document.getRoot());
            });
		            requirementEditors.push({
		                type: 'whereToSecure',
		                index: rowIndex,
		                editor: editorInstance
		            });
		        });
		}


		function addProcessOverviewRow(clientSteps = '', agencyActions = '', fees = '', time = '', person = '') {
		    const tableBody = document.getElementById('processOverviewTableBody');
		    const newRow = document.createElement('tr');
		    const rowIndex = editorCounter++;

		    newRow.innerHTML = `
        <td><div id="clientSteps-${rowIndex}"></div></td>
        <td><div id="agencyActions-${rowIndex}"></div></td>
        <td><div id="feesToBePaid-${rowIndex}"></div></td>
        <td><div id="processingTime-${rowIndex}"></div></td>
        <td><div id="personResponsible-${rowIndex}"></div></td>
        <td style="text-align: center;"><button class="delete-btn" onclick="deleteProcessOverviewRow(this.parentNode.parentNode)">Delete</button></td>
    `;
		    tableBody.appendChild(newRow);

		    const editorConfig = {
		        toolbar: ['bold', 'italic', 'bulletedList', 'numberedList'],
		    };

		    const fields = [{
		            type: 'clientSteps',
		            value: clientSteps
		        },
		        {
		            type: 'agencyActions',
		            value: agencyActions
		        },
		        {
		            type: 'feesToBePaid',
		            value: fees
		        },
		        {
		            type: 'processingTime',
		            value: time
		        },
		        {
		            type: 'personResponsible',
		            value: person
		        },
		    ];

		    fields.forEach(field => {
		        ClassicEditor.create(document.querySelector(`#${field.type}-${rowIndex}`), editorConfig)
		            .then(editorInstance => {
		                editorInstance.setData(field.value);
			// Inject CSS to prevent word-break in CKEditor editable area
            editorInstance.editing.view.change(writer => {
                writer.setStyle('word-break', 'keep-all', editorInstance.editing.view.document.getRoot());
                writer.setStyle('overflow-wrap', 'break-word', editorInstance.editing.view.document.getRoot());
                writer.setStyle('white-space', 'normal', editorInstance.editing.view.document.getRoot());
				writer.setStyle('hyph®ens', 'none', editorInstance.editing.view.document.getRoot());
            });
		                processOverviewEditors.push({
		                    type: field.type,
		                    index: rowIndex,
		                    editor: editorInstance
		                });
		            });
		    });
		}

		function deleteRequirementRow(row) {
		    row.remove();
		    const rowIndex = row.querySelector('div').id.split('-')[1];
		    requirementEditors = requirementEditors.filter(editor => editor.index !== parseInt(rowIndex));
		}

		function deleteProcessOverviewRow(row) {
		    row.remove();
		    const rowIndex = row.querySelector('div').id.split('-')[1];
		    processOverviewEditors = processOverviewEditors.filter(editor => editor.index !== parseInt(rowIndex));
		}

		function clearForm() {
		    document.getElementById('citizenCharterForm').reset();

		    if (ckeditorInstance) {
		        ckeditorInstance.setData('');
		    }
		    requirementEditors.forEach(e => e.editor.destroy());
		    requirementEditors = [];
		    document.getElementById('requirementsTableBody').innerHTML = '';
		    processOverviewEditors.forEach(e => e.editor.destroy());
		    processOverviewEditors = [];
		    document.getElementById('processOverviewTableBody').innerHTML = '';

		    editorCounter = 0;
		    addRequirementRow();
		    addProcessOverviewRow();

		    if (previewWindow && !previewWindow.closed) {
		        previewWindow.close();
		        previewWindow = null;
		    }
		}

		function exportFormData() {
		    const form = document.getElementById('citizenCharterForm');
		    const formData = new FormData(form);
		    const data = {
		        serviceName: formData.get('serviceName'),
		        office: formData.get('office'),
		        classification: formData.get('classification'),
		        transaction_type: formData.getAll('transaction_type'),
		        who_may_avail: formData.get('who_may_avail'),
		        feesToBePaid: formData.get('feesToBePaid'),
		        processingTime: formData.get('processingTime'),
		        description: ckeditorInstance ? ckeditorInstance.getData() : '',
		        requirements: [],
		        processOverview: []
		    };

		    document.querySelectorAll('#requirementsTableBody tr').forEach(row => {
		        const rowIndex = row.querySelector('div').id.split('-')[1];
		        const requirementEditor = requirementEditors.find(editor => editor.index == rowIndex && editor.type === 'requirement');
		        const whereToSecureEditor = requirementEditors.find(editor => editor.index == rowIndex && editor.type === 'whereToSecure');

		        if (requirementEditor && whereToSecureEditor) {
		            data.requirements.push({
		                checklist: requirementEditor.editor.getData(),
		                where: whereToSecureEditor.editor.getData()
		            });
		        }
		    });

		    document.querySelectorAll('#processOverviewTableBody tr').forEach(row => {
		        const rowIndex = row.querySelector('div').id.split('-')[1];
		        const clientStepsEditor = processOverviewEditors.find(editor => editor.index == rowIndex && editor.type === 'clientSteps');
		        const agencyActionsEditor = processOverviewEditors.find(editor => editor.index == rowIndex && editor.type === 'agencyActions');
		        const feesToBePaidEditor = processOverviewEditors.find(editor => editor.index == rowIndex && editor.type === 'feesToBePaid');
		        const processingTimeEditor = processOverviewEditors.find(editor => editor.index == rowIndex && editor.type === 'processingTime');
		        const personResponsibleEditor = processOverviewEditors.find(editor => editor.index == rowIndex && editor.type === 'personResponsible');

		        if (clientStepsEditor && agencyActionsEditor && feesToBePaidEditor && processingTimeEditor && personResponsibleEditor) {
		            data.processOverview.push({
		                clientSteps: clientStepsEditor.editor.getData(),
		                agencyActions: agencyActionsEditor.editor.getData(),
		                feesToBePaid: feesToBePaidEditor.editor.getData(),
		                processingTime: processingTimeEditor.editor.getData(),
		                personResponsible: personResponsibleEditor.editor.getData()
		            });
		        }
		    });

		    const blob = new Blob([JSON.stringify(data, null, 2)], {
		        type: "application/json"
		    });
		    const a = document.createElement("a");
		    a.href = URL.createObjectURL(blob);
		    a.download = (data.serviceName || "citizen_charter") + ".json";
		    a.click();
		}

		function importFormData(event) {
		    const file = event.target.files[0];
		    if (!file) return;

		    const reader = new FileReader();
		    reader.onload = function(e) {
		        const data = JSON.parse(e.target.result);

		        document.getElementById('serviceNameInput').value = data.serviceName || '';
		        document.querySelector('textarea[name="office"]').value = data.office || '';
		        document.querySelector('textarea[name="who_may_avail"]').value = data.who_may_avail || '';
		        document.getElementById('FeesToBePaid').value = data.feesToBePaid || '';
		        document.getElementById('ProcessingTime').value = data.processingTime || '';
		        ckeditorInstance.setData(data.description || '');

		        document.querySelectorAll('input[name="classification"]').forEach(el => {
		            el.checked = (el.value === data.classification);
		        });

		        document.querySelectorAll('input[name="transaction_type"]').forEach(el => {
		            el.checked = data.transaction_type.includes(el.value);
		        });

		        requirementEditors.forEach(e => e.editor.destroy());
		        requirementEditors = [];
		        document.getElementById('requirementsTableBody').innerHTML = '';

		        processOverviewEditors.forEach(e => e.editor.destroy());
		        processOverviewEditors = [];
		        document.getElementById('processOverviewTableBody').innerHTML = '';

		        editorCounter = 0;

		        data.requirements.forEach(item => addRequirementRow(item.checklist, item.where));
		        data.processOverview.forEach(item =>
		            addProcessOverviewRow(item.clientSteps, item.agencyActions, item.feesToBePaid, item.processingTime, item.personResponsible)
		        );
		    };
		    reader.readAsText(file);
		}


		function openPreview() {
		    console.log("Preview button clicked");

		    const FeesToBePaid = document.getElementById('FeesToBePaid').value || "N/A";
		    const ProcessingTime = document.getElementById('ProcessingTime').value || "N/A";
		    const serviceName = document.getElementById('serviceNameInput').value;
		    const description = ckeditorInstance ? ckeditorInstance.getData() : '';
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
		            requirements.push({
		                requirement: requirementData,
		                whereToSecure: whereToSecureData
		            });
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



		function displayPreview(serviceName, description, office, classification, transactionTypes, whoMayAvail, requirements, processOverview, FeesToBePaid, ProcessingTime) {
		    let previewWindow = window.open('', '', 'width=816px,height=1056px');
		    previewWindow.document.write(`
        <html>
        <head>
            <style>
    @page {
        size: A4;
        margin: 1.5in 0.5in 1in 1in;
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

	.service-description {
	font-size: 12pt;
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
        page-break-inside: auto;
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

    table + div table tr:first-child th {
        border-top: none !important;
    }
	table + div + div table tr:first-child th {
        border-top: none !important;
        }

    .requirements-table-wrapper,
    .process-table-wrapper {
        margin: 0;
        padding: 0;
        break-inside: auto;
        page-break-inside: auto;
        page-break-before: auto;
    }

    @media print {
        body {
            margin: 0;
            padding: 0;
        }

        .print-warning,
        .pdf-button {
            display: none;
        }

        table {
            border-collapse: collapse;
            page-break-inside: auto;
            margin: 0;
        }

        thead {
            display: table-header-group !important;
        }

        tfoot {
            display: table-footer-group;
        }

        tr {
            page-break-inside: avoid;
        }


        .requirements-table-wrapper,
        .process-table-wrapper {
            break-inside: auto;
            page-break-inside: auto;
            page-break-before: auto;
            margin: 0 !important;
            padding: 0 !important;
        }
    }

    @media screen and (max-width: 768px) {
        body {
            font-size: 1.0037500100375em;
        }

        .service-name {
            font-size: 1.16em;
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
            <div>
                <table>
					
					<tbody style="page-break-inside: avoid;">
						<tr>
							<th style="width: 46%; text-align: center;">CHECKLIST OF REQUIREMENTS</th>
							<th style="width: 54%; text-align: center;">WHERE TO SECURE</th>
						</tr>
					</tbody>
  
                    <tbody style="page-break-inside: avoid;">
                        ${requirements.map(req => `
                            <tr>
                                <td>${req.requirement}</td>
                                <td>${req.whereToSecure}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            <div>
                <table>
    <tbody style="page-break-inside: avoid;">
    <tr>
      <th style="width: 23%; text-align: center;">CLIENT STEPS</th>
      <th style="width: 23%; text-align: center;">AGENCY ACTIONS</th>
      <th style="width: 14%; text-align: center;">FEES TO BE PAID</th>
      <th style="width: 19%; text-align: center;">PROCESSING TIME</th>
      <th style="width: 21%; text-align: center;">PERSON RESPONSIBLE</th>
    </tr>
  </tbody>

    ${processOverview.map(proc => `
        <tbody style="page-break-inside: avoid;">
            <tr>
                <td>${proc.clientSteps}</td>
                <td>${proc.agencyActions}</td>
                <td style="text-align: center;">${proc.feesToBePaid}</td>
                <td style="text-align: center;">${proc.processingTime}</td>
                <td>${proc.personResponsible}</td>
            </tr>
        </tbody>
    `).join('')}

    <tbody style="page-break-inside: avoid;">
        <tr>
            <td style="background-color: #8eaadb;"></td>
            <th style="text-align:right;">TOTAL</th>
            <th style="text-align:center;">${FeesToBePaid.toUpperCase()}</th>
            <th style="text-align:center;">${ProcessingTime.toUpperCase()}</th>
            <td style="background-color: #8eaadb;"></td>
        </tr>
    </tbody>
</table>

            </div>
        </body>
        </html>
    `);
		    previewWindow.document.close();
		}