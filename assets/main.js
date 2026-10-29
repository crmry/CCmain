		let editor;
		let requirementEditors = [];
		let processOverviewEditors = [];
		let editorCounter = 0;
		let ckeditorInstance;
		let previewWindow = null;
		let currentOpenedFileName = '';

		document.addEventListener("DOMContentLoaded", () => {
		    const descriptionConfig = {
		        toolbar: [
		            'heading',
		            '|',
		            'bold',
		            'italic',
		            '|',
		            'bulletedList',
		            'numberedList',
		            '|',
		            'outdent',
		            'indent',
		            '|',
		            'undo',
		            'redo'
		        ],
		        placeholder: 'Provide a concise statement on the service purpose, statutory legal mandate/basis, and qualification criteria (e.g., This process covers the verification, evaluation, and issuance of official certifications/permits for eligible clients pursuant to RA 11032)...'
		    };

		    ClassicEditor.create(document.querySelector("#editor"), descriptionConfig).then(e => {
		        ckeditorInstance = e;
		    }).catch(error => {
		        console.error('Error initializing main editor:', error);
		    });

		    addRequirementRow();
		    addProcessOverviewRow();

		    // Interactive sync for custom option cards (radio & checkbox)
		    document.addEventListener("change", (e) => {
		        if (e.target.matches('.custom-option-card input[type="radio"]')) {
		            document.querySelectorAll(`input[name="${e.target.name}"]`).forEach(r => {
		                r.closest('.custom-option-card')?.classList.toggle('active', r.checked);
		            });
		        } else if (e.target.matches('.custom-option-card input[type="checkbox"]')) {
		            e.target.closest('.custom-option-card')?.classList.toggle('active', e.target.checked);
		        }
		    });

		    // Auto-adjust height for textareas as content is typed
		    document.querySelectorAll('textarea.form-control').forEach(autoAdjustTextarea);
		    document.addEventListener('input', (e) => {
		        if (e.target.tagName === 'TEXTAREA' && e.target.classList.contains('form-control')) {
		            autoAdjustTextarea(e.target);
		        }
		    });

		    // Initialize tooltips
		    if (typeof bootstrap !== 'undefined' && bootstrap.Tooltip) {
		        document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(el => new bootstrap.Tooltip(el));
		    }
		});

		function autoAdjustTextarea(el) {
		    if (!el) return;
		    el.style.height = 'auto';
		    el.style.height = Math.max(el.scrollHeight + 2, 42) + 'px';
		}

		function addNewRowFromActionPanel() {
		    addProcessOverviewRowAndScroll();
		}

		function addProcessOverviewRowAndScroll() {
		    addProcessOverviewRow();
		    setTimeout(() => {
		        const rows = document.querySelectorAll('#processOverviewTableBody tr');
		        if (rows.length > 0) {
		            const lastRow = rows[rows.length - 1];
		            lastRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
		            lastRow.classList.add('highlight-row');
		            setTimeout(() => lastRow.classList.remove('highlight-row'), 2000);
		        }
		    }, 100);
		}

		function addRequirementRowAndScroll() {
		    addRequirementRow();
		    setTimeout(() => {
		        const rows = document.querySelectorAll('#requirementsTableBody tr');
		        if (rows.length > 0) {
		            const lastRow = rows[rows.length - 1];
		            lastRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
		            lastRow.classList.add('highlight-row');
		            setTimeout(() => lastRow.classList.remove('highlight-row'), 2000);
		        }
		    }, 100);
		}

		function addRequirementRow(requirementValue = '', whereValue = '') {
		    const tableBody = document.getElementById('requirementsTableBody');
		    const isFirstRow = (tableBody.rows.length === 0);
		    const newRow = document.createElement('tr');
		    const rowIndex = editorCounter++;

		    newRow.innerHTML = `
        <td>
            <div id="requirement-${rowIndex}"></div>
        </td>
        <td>
            <div id="whereToSecure-${rowIndex}"></div>
        </td>
        <td style="text-align: center; vertical-align: middle;">
            <div class="table-actions-btns">
                <button type="button" class="add-btn" onclick="addRequirementRow()" title="Add Additional Row">
                    <i class="fa fa-plus"></i> ADD
                </button>
                ${!isFirstRow ? `
                <button type="button" class="delete-btn" onclick="deleteRequirementRow(this.closest('tr'))" title="Delete Row">
                    <i class="fa fa-trash-alt"></i> Delete
                </button>` : ''}
            </div>
        </td>
    `;
		    tableBody.appendChild(newRow);

		    const reqConfig = {
		        toolbar: ['bold', 'italic', 'bulletedList', 'numberedList'],
		        placeholder: 'Document Name (# of copies, original/photocopy) — e.g., Duly accomplished application form (1 original copy), Valid Government-issued ID (1 photocopy)'
		    };

		    const whereConfig = {
		        toolbar: ['bold', 'italic', 'bulletedList', 'numberedList'],
		        placeholder: 'Specific issuing office, division, desk, or portal (e.g., Agency Receiving Section / Issuing Government Agency / Online Portal)'
		    };

		    ClassicEditor.create(document.querySelector(`#requirement-${rowIndex}`), reqConfig)
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
			
		    ClassicEditor.create(document.querySelector(`#whereToSecure-${rowIndex}`), whereConfig)
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
		    const isFirstRow = (tableBody.rows.length === 0);
		    const newRow = document.createElement('tr');
		    const rowIndex = editorCounter++;

		    newRow.innerHTML = `
        <td><div id="clientSteps-${rowIndex}"></div></td>
        <td><div id="agencyActions-${rowIndex}"></div></td>
        <td><div id="feesToBePaid-${rowIndex}"></div></td>
        <td><div id="processingTime-${rowIndex}"></div></td>
        <td><div id="personResponsible-${rowIndex}"></div></td>
        <td style="text-align: center; vertical-align: middle;">
            <div class="table-actions-btns">
                <button type="button" class="add-btn" onclick="addProcessOverviewRow()" title="Add Additional Row">
                    <i class="fa fa-plus"></i> ADD
                </button>
                ${!isFirstRow ? `
                <button type="button" class="delete-btn" onclick="deleteProcessOverviewRow(this.closest('tr'))" title="Delete Row">
                    <i class="fa fa-trash-alt"></i> Delete
                </button>` : ''}
            </div>
        </td>
    `;
		    tableBody.appendChild(newRow);

		    const editorConfig = {
		        toolbar: ['bold', 'italic', 'bulletedList', 'numberedList'],
		    };

		    const stepPlaceholders = {
		        clientSteps: 'Numbered step & location (e.g., 1. Submit complete checklist of requirements and valid ID to Receiving Section)',
		        agencyActions: 'Numbered action per step (e.g., 1.1 Receive documents, verify completeness against checklist, and issue acknowledgment receipt)',
		        feesToBePaid: 'Type of Fee: Currency Amount (e.g., Certification Fee: PHP 50.00) or "None" (Ranging is prohibited)',
		        processingTime: 'Exact duration: # Day/s, # Hour/s, # Minute/s (e.g., 15 minutes or 1 Day, 2 Hours) (Ranging is prohibited)',
		        personResponsible: 'Designation and Office (e.g., Administrative Officer V, Cashier Section). If rotating, use Immediate Supervisor\'s Designation and Office'
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
		        ClassicEditor.create(document.querySelector(`#${field.type}-${rowIndex}`), {
		            ...editorConfig,
		            placeholder: stepPlaceholders[field.type] || ''
		        })
		            .then(editorInstance => {
		                editorInstance.setData(field.value);
			// Inject CSS to prevent word-break in CKEditor editable area
            editorInstance.editing.view.change(writer => {
                writer.setStyle('word-break', 'keep-all', editorInstance.editing.view.document.getRoot());
                writer.setStyle('overflow-wrap', 'break-word', editorInstance.editing.view.document.getRoot());
                writer.setStyle('white-space', 'normal', editorInstance.editing.view.document.getRoot());
				writer.setStyle('hyphens', 'none', editorInstance.editing.view.document.getRoot());
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
		    if (!row) return;
		    const tableBody = document.getElementById('requirementsTableBody');
		    if (tableBody.rows.length <= 1 || row === tableBody.rows[0]) {
		        return; // Prevent deleting the first permanent row
		    }
		    const editorDiv = row.querySelector('[id^="requirement-"]');
		    if (editorDiv) {
		        const rowIndex = editorDiv.id.split('-')[1];
		        requirementEditors = requirementEditors.filter(editor => editor.index !== parseInt(rowIndex));
		    }
		    row.remove();
		    updateRequirementTableActions();
		}

		function deleteProcessOverviewRow(row) {
		    if (!row) return;
		    const tableBody = document.getElementById('processOverviewTableBody');
		    if (tableBody.rows.length <= 1 || row === tableBody.rows[0]) {
		        return; // Prevent deleting the first permanent row
		    }
		    const editorDiv = row.querySelector('[id^="clientSteps-"]');
		    if (editorDiv) {
		        const rowIndex = editorDiv.id.split('-')[1];
		        processOverviewEditors = processOverviewEditors.filter(editor => editor.index !== parseInt(rowIndex));
		    }
		    row.remove();
		    updateProcessOverviewTableActions();
		}

		function updateRequirementTableActions() {
		    const tableBody = document.getElementById('requirementsTableBody');
		    Array.from(tableBody.rows).forEach((r, idx) => {
		        const deleteBtn = r.querySelector('.delete-btn');
		        if (idx === 0 && deleteBtn) {
		            deleteBtn.remove();
		        }
		    });
		}

		function updateProcessOverviewTableActions() {
		    const tableBody = document.getElementById('processOverviewTableBody');
		    Array.from(tableBody.rows).forEach((r, idx) => {
		        const deleteBtn = r.querySelector('.delete-btn');
		        if (idx === 0 && deleteBtn) {
		            deleteBtn.remove();
		        }
		    });
		}

		function clearForm() {
		    document.getElementById('citizenCharterForm').reset();
		    document.querySelectorAll('.custom-option-card').forEach(c => c.classList.remove('active'));

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
		    setTimeout(() => document.querySelectorAll('textarea.form-control').forEach(autoAdjustTextarea), 50);

		    if (previewWindow && !previewWindow.closed) {
		        previewWindow.close();
		        previewWindow = null;
		    }
		    currentOpenedFileName = '';
		    const importInput = document.getElementById('importFileInput');
		    if (importInput) importInput.value = '';
		}

		function saveFormData() {
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

		    // Determine a clean, valid file name for saving
		    let fileName = '';
		    const rawServiceName = (data.serviceName || '').trim();

		    if (rawServiceName) {
		        // Sanitize: strip newlines, slashes, and invalid filesystem characters: \ / : * ? " < > |
		        let clean = rawServiceName
		            .replace(/[\r\n\t]+/g, ' ')
		            .replace(/[\\/:*?"<>|]+/g, '_')
		            .replace(/\s+/g, ' ')
		            .trim();
		        // Truncate to reasonable length to prevent OS filesystem errors
		        if (clean.length > 120) {
		            clean = clean.substring(0, 120).trim();
		        }
		        if (clean) {
			            fileName = clean + (clean.toLowerCase().endsWith('.json') ? '' : '.json');
		        }
		    }

		    if (!fileName && currentOpenedFileName) {
		        fileName = currentOpenedFileName;
		        if (!fileName.toLowerCase().endsWith('.json')) {
		            fileName += '.json';
		        }
		    }

		    if (!fileName) {
		        fileName = 'citizen_charter.json';
		    }

		    const blob = new Blob([JSON.stringify(data, null, 2)], {
		        type: "application/json"
		    });
		    const a = document.createElement("a");
		    a.href = URL.createObjectURL(blob);
		    a.download = fileName;
		    document.body.appendChild(a);
		    a.click();
		    document.body.removeChild(a);
		    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
		}
		const exportFormData = saveFormData;

		function importFormData(event) {
		    const file = event.target.files[0];
		    if (!file) return;

		    currentOpenedFileName = file.name;

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
		            el.closest('.custom-option-card')?.classList.toggle('active', el.checked);
		        });

		        document.querySelectorAll('input[name="transaction_type"]').forEach(el => {
		            el.checked = data.transaction_type && data.transaction_type.includes(el.value);
		            el.closest('.custom-option-card')?.classList.toggle('active', el.checked);
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
		        setTimeout(() => document.querySelectorAll('textarea.form-control').forEach(autoAdjustTextarea), 100);
		        event.target.value = '';
		    };
		    reader.readAsText(file);
		}


		function getCitizenCharterData() {
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

		    return {
		        serviceName,
		        description,
		        office,
		        classification,
		        transactionTypes,
		        whoMayAvail,
		        requirements,
		        processOverview,
		        FeesToBePaid,
		        ProcessingTime
		    };
		}

		function generateReportHtml(data) {
		    const {
		        serviceName,
		        description,
		        office,
		        classification,
		        transactionTypes,
		        whoMayAvail,
		        requirements,
		        processOverview,
		        FeesToBePaid,
		        ProcessingTime
		    } = data;

		    return `
		        <div class="main-header">
		            <span class="service-name">${serviceName || "Citizen's Charter"}</span>
		            <div class="service-description">${description || ""}</div>
		        </div>
		        <table class="info-table">
		            <tr>
		                <th style="width: 28%;">Office or Division</th>
		                <td style="width: 72%;">${office || ""}</td>
		            </tr>
		            <tr>
		                <th>Classification:</th>
		                <td>${classification || ""}</td>
		            </tr>
		            <tr>
		                <th>Type of Transaction:</th>
		                <td>${transactionTypes || ""}</td>
		            </tr>
		            <tr>
		                <th>Who may avail:</th>
		                <td>${whoMayAvail || ""}</td>
		            </tr>
		        </table>

		        <table class="requirements-table">
		            <thead>
		                <tr>
		                    <th style="width: 46%; text-align: center;">CHECKLIST OF REQUIREMENTS</th>
		                    <th style="width: 54%; text-align: center;">WHERE TO SECURE</th>
		                </tr>
		            </thead>
		            <tbody>
		                ${requirements && requirements.length > 0 ? requirements.map(req => `
		                    <tr>
		                        <td>${req.requirement}</td>
		                        <td>${req.whereToSecure}</td>
		                    </tr>
		                `).join('') : `
		                    <tr>
		                        <td style="text-align: center; font-style: italic;">None</td>
		                        <td style="text-align: center; font-style: italic;">N/A</td>
		                    </tr>
		                `}
		            </tbody>
		        </table>

		        <table class="process-table">
		            <thead>
		                <tr>
		                    <th style="width: 23%; text-align: center;">CLIENT STEPS</th>
		                    <th style="width: 23%; text-align: center;">AGENCY ACTIONS</th>
		                    <th style="width: 14%; text-align: center;">FEES TO BE PAID</th>
		                    <th style="width: 19%; text-align: center;">PROCESSING TIME</th>
		                    <th style="width: 21%; text-align: center;">PERSON RESPONSIBLE</th>
		                </tr>
		            </thead>
		            <tbody>
		                ${processOverview && processOverview.length > 0 ? processOverview.map(proc => `
		                    <tr>
		                        <td>${proc.clientSteps}</td>
		                        <td>${proc.agencyActions}</td>
		                        <td style="text-align: center;">${proc.feesToBePaid}</td>
		                        <td style="text-align: center;">${proc.processingTime}</td>
		                        <td>${proc.personResponsible}</td>
		                    </tr>
		                `).join('') : `
		                    <tr>
		                        <td style="text-align: center; font-style: italic;">None</td>
		                        <td style="text-align: center; font-style: italic;">None</td>
		                        <td style="text-align: center; font-style: italic;">None</td>
		                        <td style="text-align: center; font-style: italic;">N/A</td>
		                        <td style="text-align: center; font-style: italic;">N/A</td>
		                    </tr>
		                `}
		            </tbody>
		            <tfoot>
		                <tr>
		                    <td style="background-color: #8eaadb;"></td>
		                    <th style="text-align:right;">TOTAL</th>
		                    <th style="text-align:center;">${(FeesToBePaid || 'NONE').toUpperCase()}</th>
		                    <th style="text-align:center;">${(ProcessingTime || 'N/A').toUpperCase()}</th>
		                    <td style="background-color: #8eaadb;"></td>
		                </tr>
		            </tfoot>
		        </table>
		    `;
		}

		function openPreview() {
		    console.log("Preview button clicked");
		    const data = getCitizenCharterData();
		    displayPreview(data);
		}

		function downloadDirectPDF() {
		    const data = getCitizenCharterData();
		    const safeTitle = (data.serviceName || 'Citizen_Charter')
		        .replace(/[/\\?%*:|"<>]/g, '_')
		        .trim()
		        .slice(0, 80);
		    const safeFilename = `${safeTitle} - Citizen Charter.pdf`;

		    const btn = document.getElementById('directDownloadPdfBtn');
		    let originalHtml = '';
		    if (btn) {
		        originalHtml = btn.innerHTML;
		        btn.disabled = true;
		        btn.innerHTML = '<i class="fa fa-spinner fa-spin"></i> Generating PDF...';
		    }

		    const container = document.createElement('div');
		    container.id = 'directPdfExportContainer';
		    container.style.position = 'fixed';
		    container.style.left = '-9999px';
		    container.style.top = '0';
		    container.style.width = '794px';
		    container.style.background = '#ffffff';
		    container.style.padding = '20px';
		    container.style.fontFamily = 'Arial, "Helvetica Neue", Helvetica, sans-serif';
		    container.style.color = '#000000';
		    container.style.boxSizing = 'border-box';

		    const styleTag = document.createElement('style');
		    styleTag.innerHTML = `
		        .main-header { margin-bottom: 10px; }
		        .service-name { font-size: 20px; font-weight: bold; margin-bottom: 6px; display: block; color: #000; }
		        .service-description { font-size: 14px; line-height: 1.5; margin-bottom: 10px; color: #000; }
		        table { width: 100%; border-collapse: collapse; margin-top: -1.5px; font-size: 14px; }
		        th, td { border: 1.5px solid #000; padding: 7px 8px; text-align: left; vertical-align: top; font-size: 14px; line-height: 1.45; word-break: break-word; }
		        th { background-color: #8eaadb !important; font-weight: bold; }
		    `;
		    container.appendChild(styleTag);

		    const contentWrapper = document.createElement('div');
		    contentWrapper.innerHTML = generateReportHtml(data);
		    container.appendChild(contentWrapper);
		    document.body.appendChild(container);

		    const opt = {
		        margin: [15, 12, 15, 12],
		        filename: safeFilename,
		        image: { type: 'jpeg', quality: 0.98 },
		        html2canvas: { scale: 2, useCORS: true, logging: false },
		        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
		        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
		    };

		    if (typeof html2pdf !== 'undefined') {
		        html2pdf().set(opt).from(container).save().then(() => {
		            document.body.removeChild(container);
		            if (btn) {
		                btn.disabled = false;
		                btn.innerHTML = originalHtml;
		            }
		        }).catch(err => {
		            console.error('Direct PDF error:', err);
		            document.body.removeChild(container);
		            if (btn) {
		                btn.disabled = false;
		                btn.innerHTML = originalHtml;
		            }
		            alert('Direct PDF generation error. Opening print preview dialog instead.');
		            openPreview();
		        });
		    } else {
		        document.body.removeChild(container);
		        if (btn) {
		            btn.disabled = false;
		            btn.innerHTML = originalHtml;
		        }
		        openPreview();
		    }
		}

		function displayPreview(data) {
		    const {
		        serviceName,
		        description,
		        office,
		        classification,
		        transactionTypes,
		        whoMayAvail,
		        requirements,
		        processOverview,
		        FeesToBePaid,
		        ProcessingTime
		    } = data;

		    const safeTitle = (serviceName || 'Citizen_Charter')
		        .replace(/[/\\?%*:|"<>]/g, '_')
		        .trim()
		        .slice(0, 80);
		    const safeFilename = `${safeTitle} - Citizen Charter.pdf`;

		    let previewWindow = window.open('', '', 'width=900px,height=1056px');
		    if (!previewWindow) {
		        alert("Please allow popups for this site to view the preview.");
		        return;
		    }

		    const reportHtml = generateReportHtml(data);

		    previewWindow.document.write(`
        <html>
        <head>
            <meta charset="UTF-8">
            <title>${serviceName || "Citizen Charter"} - Preview</title>
            <link rel="stylesheet" href="assets/font-awesome/css/font-awesome.css">
            <script src="assets/js/html2pdf.bundle.min.js"></script>
            <style>
    @page {
        size: A4 portrait;
        margin: 1.5in 0.5in 1in 1in;
    }

    *, *:before, *:after {
        box-sizing: border-box;
    }

    body {
        font-family: Arial, "Helvetica Neue", Helvetica, sans-serif;
        line-height: 1.45;
        margin: 0;
        padding: 24px;
        font-size: 14px;
        color: #000;
        background: #fff;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        text-rendering: optimizeLegibility;
    }

    .pdf-button {
        margin-bottom: 16px;
        padding: 9px 18px;
        font-size: 14px;
        font-weight: bold;
        color: #fff;
        background-color: #007bff;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        box-shadow: 0 2px 4px rgba(0,0,0,0.15);
    }
    .pdf-button:hover {
        background-color: #0056b3;
    }

    /* Report Content Styles */
    .main-header {
        margin-bottom: 10px;
    }

    .service-name {
        font-size: 20px;
        font-weight: bold;
        margin-bottom: 6px;
        display: block;
        color: #000;
        letter-spacing: 0.2px;
    }

    .service-description {
        font-size: 14px;
        line-height: 1.5;
        display: block;
        color: #000;
        margin-bottom: 10px;
    }

    .service-description p,
    td p, th p {
        margin: 0 0 4px 0;
    }
    .service-description p:last-child,
    td p:last-child, th p:last-child {
        margin-bottom: 0;
    }

    table {
        width: 100%;
        border-collapse: collapse;
        margin: 0;
        word-wrap: break-word;
        page-break-inside: auto;
        break-inside: auto;
        font-size: 14px;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
    }

    .requirements-table,
    .process-table {
        margin-top: -1.5px;
    }

    th, td {
        border: 1.5px solid #000;
        padding: 7px 8px;
        text-align: left;
        vertical-align: top;
        word-break: break-word;
        font-size: 14px;
        line-height: 1.45;
        color: #000;
    }

    th {
        background-color: #8eaadb !important;
        font-weight: bold;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
    }

    thead {
        display: table-row-group !important;
    }

    tfoot {
        display: table-row-group !important;
    }

    tbody {
        break-inside: auto;
        page-break-inside: auto;
    }

    tr {
        page-break-inside: avoid;
        break-inside: avoid;
    }

    @media print {
        body {
            margin: 0;
            padding: 0;
            font-size: 14px;
            color: #000;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
        }

        .pdf-button {
            display: none !important;
        }

        table {
            border-collapse: collapse;
            page-break-inside: auto;
            break-inside: auto;
            margin: 0;
            font-size: 14px;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
        }

        .requirements-table,
        .process-table {
            margin-top: -1.5px;
        }

        thead {
            display: table-row-group !important;
        }

        tfoot {
            display: table-row-group !important;
        }

        tbody {
            break-inside: auto;
            page-break-inside: auto;
        }

        tr {
            page-break-inside: avoid;
            break-inside: avoid;
        }

        th, td {
            border: 1.5px solid #000 !important;
            font-size: 14px !important;
            padding: 7px 8px !important;
            color: #000 !important;
        }

        th {
            background-color: #8eaadb !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
        }

        .service-name {
            font-size: 20px !important;
            color: #000 !important;
        }

        .service-description {
            font-size: 14px !important;
            color: #000 !important;
        }
    }

    @media screen and (max-width: 768px) {
        body {
            font-size: 14px;
        }

        .service-name {
            font-size: 18px;
        }

        .pdf-button {
            font-size: 13px;
        }
    }
</style>
        </head>
        <body>
            <button class="pdf-button" onclick="window.print()">Save as PDF</button>
            <div id="printableReportArea">
                ${reportHtml}
            </div>
        </body>
        </html>
    `);
		    previewWindow.document.close();
		}

		let tourRunning = false;
		let activeDriverInstance = null;

		function cleanupDriverTour() {
		    tourRunning = false;
		    if (activeDriverInstance) {
		        try {
		            activeDriverInstance.destroy();
		        } catch (err) {}
		        activeDriverInstance = null;
		    }
		    document.querySelectorAll('.driver-overlay, #driver-popover-content, .driver-popover, #driver-dummy-element').forEach(el => {
		        try {
		            el.remove();
		        } catch (err) {}
		    });
		    document.body.classList.remove('driver-active', 'driver-fade', 'driver-simple');
		    document.querySelectorAll('.driver-active-element, .driver-no-interaction').forEach(el => {
		        el.classList.remove('driver-active-element', 'driver-no-interaction');
		        el.removeAttribute('aria-haspopup');
		        el.removeAttribute('aria-expanded');
		        el.removeAttribute('aria-controls');
		    });
		}

		function startSystemTour() {
		    if (typeof window.driver === 'undefined' || !window.driver.js || !window.driver.js.driver) {
		        console.warn('Driver.js is initializing, retrying tour in 150ms...');
		        setTimeout(startSystemTour, 150);
		        return;
		    }

		    const driverFn = window.driver.js.driver;

		    const driverObj = driverFn({
		        showProgress: true,
		        animate: true,
		        allowClose: true,
		        overlayColor: 'rgba(15, 23, 42, 0.70)',
		        nextBtnText: 'Next →',
		        prevBtnText: '← Back',
		        doneBtnText: 'Finish Tour ✓',
		        progressText: 'Step {{current}} of {{total}}',
		        onCloseClick: () => {
		            cleanupDriverTour();
		        },
		        onDestroyed: () => {
		            cleanupDriverTour();
		        },
		        steps: [
		            {
		                element: '.page-top-header',
		                popover: {
		                    title: '🏛️ ARTA & RA 11032 Service Standards Tour',
		                    description: 'Welcome to the <strong>Citizen Charter Builder</strong>! Under <strong>Republic Act No. 11032</strong> (<em>Ease of Doing Business and Efficient Government Service Delivery Act of 2018</em>), all government entities are mandated to formulate, update, and post official <strong>Citizen\'s Charters</strong>.<br><br>This interactive walkthrough incorporates official <strong>ARTA guidelines, standard writing formats, and compliance requirements</strong> to ensure your service charter passes regulatory review.',
		                    side: 'bottom',
		                    align: 'start'
		                }
		            },
		            {
		                element: '#serviceNameInput',
		                popover: {
		                    title: '1. Service Name (Totality of Service)',
		                    description: '<strong>ARTA Standard:</strong> Must state the official title that describes the <em>totality of the service</em> (e.g., <code>ISSUANCE OF MEDICAL CERTIFICATE AND CLINICAL ABSTRACT</code>).<br><br>• <strong>Totality:</strong> Must encompass the full transaction from initial application to final release.<br>• <strong>Inter-Office / Common Services:</strong> If shared across multiple bureaus/offices, specify the issuing unit.<br>• <em>System Tip:</em> This also serves as the default filename when you save.',
		                    side: 'bottom',
		                    align: 'start'
		                }
		            },
		            {
		                element: '.ck-editor, #editor',
		                popover: {
		                    title: '2. Service Description (Purpose & Scope)',
		                    description: '<strong>ARTA Standard:</strong> Provide a concise statement informing citizens of the exact purpose of the service, statutory legal basis/mandate, and applicable qualification criteria.<br><br>• Keep language simple, clear, and citizen-friendly.<br>• Rich formatting (bullet points, bold highlights) can be used to organize multi-part scopes.',
		                    side: 'top',
		                    align: 'start'
		                }
		            },
		            {
		                element: '#mainDetailsTable tbody tr:nth-child(1)',
		                popover: {
		                    title: '3. Office or Division (Service Provider)',
		                    description: '<strong>ARTA Standard:</strong> State the complete official name of the office, division, or unit offering the service.<br><br>• <strong>Multi-Office / Inter-Agency:</strong> If the service workflow crosses departments or external agencies, explicitly list all participating offices in the sequence of transaction.',
		                    side: 'top',
		                    align: 'start'
		                }
		            },
		            {
		                element: '#mainDetailsTable tbody tr:nth-child(2)',
		                popover: {
		                    title: '4. Classification (Mandatory 3-7-20 Limits)',
		                    description: '<strong>ARTA Standard (RA 11032 Sec. 9):</strong> The classification strictly dictates the maximum allowable processing time:<br><br>• 🟢 <strong>Simple:</strong> Max <strong>3 working days</strong> (ministerial actions only).<br>• 🟡 <strong>Complex:</strong> Max <strong>7 working days</strong> (requires resolution of complicated issues / technical evaluation).<br>• 🔴 <strong>Highly Technical:</strong> Max <strong>20 working days</strong> (requires specialized technical evaluation).<br><br>⚠️ <em>What NOT to do:</em> Total Processing Time cannot exceed the selected category limit, and ranging (e.g. <em>"Simple to Complex"</em>) is strictly prohibited!',
		                    side: 'top',
		                    align: 'start'
		                }
		            },
		            {
		                element: '#mainDetailsTable tbody tr:nth-child(3)',
		                popover: {
		                    title: '5. Type of Transaction (G2C / G2B / G2G)',
		                    description: '<strong>ARTA Standard:</strong> Classify based on the client category:<br><br>• <strong>G2C (Government to Citizen):</strong> For transactions with individual citizens or the general public.<br>• <strong>G2B (Government to Business):</strong> For transactions involving commercial firms or businesses.<br>• <strong>G2G (Government to Government):</strong> For transactions between government agencies or internal personnel.<br><br>⚠️ <em>Consistency Rule:</em> The selected type must strictly match the clients listed in <em>Who May Avail</em>.',
		                    side: 'top',
		                    align: 'start'
		                }
		            },
		            {
		                element: '#mainDetailsTable tbody tr:nth-child(4)',
		                popover: {
		                    title: '6. Who May Avail (Authorized Clients)',
		                    description: '<strong>ARTA Standard:</strong><br><br>• If anyone is eligible without restriction, enter <strong>"All"</strong>.<br>• If restricted to specific groups or beneficiaries, enumerate all authorized clients (e.g., <em>Discharged inpatients, registered suppliers, active civil servants</em>).<br><br>⚠️ <em>Rule:</em> Spell out acronyms and avoid obscure abbreviations so the public clearly understands eligibility.',
		                    side: 'top',
		                    align: 'start'
		                }
		            },
		            {
		                element: '#requirementsTable',
		                popover: {
		                    title: '7. Checklist of Requirements & Where to Secure',
		                    description: '<strong>ARTA Prescribed Manner of Writing:</strong><br><code>Name of Document (# of copies, original/photocopy)</code><br><em>Example:</em> <code>Duly Accomplished Request Form (1 original copy)</code><br><br>• <strong>Single Copies:</strong> Explicitly state <em>"one (1)"</em> and specify whether <em>original</em> or <em>photocopy</em>.<br>• <strong>Where to Secure:</strong> Name the specific issuing office, desk, or portal (e.g. <em>PSA Serbilis Center / HIMD Receiving Desk</em>).<br>• If none needed: write <strong>"None"</strong> (never leave blank).<br><br>⚠️ <em>CRITICAL:</em> Any requirement demanded from a citizen that is not listed here is an illegal additional requirement under RA 11032!',
		                    side: 'top',
		                    align: 'start'
		                }
		            },
		            {
		                element: '#processOverviewTable',
		                popover: {
		                    title: '8. Client Steps & Agency Actions (Workflow)',
		                    description: '<strong>ARTA Step-by-Step Flow Rules:</strong><br><br>• <strong>Client Steps:</strong> State what the citizen does and where (e.g., <em>"1. Submit requirements to Receiving Section"</em>). First step must be submission; last step must be claiming result.<br>• <strong>Agency Actions:</strong> Specific action taken by agency staff (e.g., <em>"1.1 Review document completeness"</em>). Use sub-numbering (1.1, 1.2) for multiple agency actions per client step.<br>• <strong>Zero Contact Policy:</strong> Minimize face-to-face interactions strictly to essential ministerial transactions.<br><br>⚠️ <em>Rule:</em> Demanding unlisted steps from clients is strictly prohibited!',
		                    side: 'top',
		                    align: 'start'
		                }
		            },
		            {
		                element: '#processOverviewTable tfoot',
		                popover: {
		                    title: '9. Fees, Time & Responsible Officer Standards',
		                    description: '<strong>ARTA Specification Rules:</strong><br><br>• <strong>Fees:</strong> Type + Currency + Amount (e.g., <code>Certification Fee: PHP 50.00</code>) or <code>None</code>. ⚠️ <em>Ranging (e.g. PHP 50-100) is illegal!</em><br>• <strong>Processing Time:</strong> Exact duration in Days, Hours, Minutes (1 day = 8 working hours). ⚠️ <em>Ranging (e.g. "1-2 hours") is prohibited!</em><br>• <strong>Person Responsible:</strong> Write <strong>Designation and Office</strong> (e.g., <code>Administrative Officer V, Cashier Section</code>). If personnel rotates, use the <em>Immediate Supervisor\'s Designation and Office</em>. ⚠️ <em>Do NOT use personal employee names!</em>',
		                    side: 'top',
		                    align: 'start'
		                }
		            },
		            {
		                element: '.actions-panel',
		                popover: {
		                    title: '10. PDF Export, Print & Compliance Actions',
		                    description: '• <strong>Download PDF:</strong> Directly generates and downloads the official ARTA-compliant PDF to your computer (bypasses printer dialogs entirely).<br>• <strong>Print / Preview:</strong> Opens the printable report with clear instructions on switching to "Save as PDF".<br>• <strong>Save:</strong> Exports a standard <code>.json</code> data backup for recordkeeping and mandatory annual updates (required by March 31 annually).<br>• <strong>Open:</strong> Loads an existing <code>.json</code> file to modify or review.<br>• <strong>Clear Form:</strong> Resets fields to draft a new charter.',
		                    side: 'top',
		                    align: 'center'
		                }
		            },
		            {
		                element: '#startTourNavBtn',
		                popover: {
		                    title: 'You\'re Ready for ARTA Compliance! 🇵🇭',
		                    description: 'Your Citizen\'s Charter is the frontline pledge of your agency to the Filipino people.<br><br>Whenever you need to review ARTA rules again, click <strong>Take a Tour</strong> here anytime.',
		                    side: 'bottom',
		                    align: 'end',
		                    doneBtnText: 'Finish Tour ✓',
		                    onNextClick: () => {
		                        cleanupDriverTour();
		                    }
		                }
		            }
		        ]
		    });

		    tourRunning = true;
		    activeDriverInstance = driverObj;
		    driverObj.drive();
		}

		// Direct event delegation fallback to guarantee tour closes when clicking close button (×) or finish button
		document.addEventListener('click', (e) => {
		    // 1. Close button (×)
		    const closeBtn = e.target && (e.target.matches('.driver-popover-close-btn') || e.target.closest('.driver-popover-close-btn'));
		    if (closeBtn) {
		        e.preventDefault();
		        e.stopPropagation();
		        cleanupDriverTour();
		        return;
		    }

		    // 2. Finish Tour button on final step
		    const nextBtn = e.target && (e.target.matches('.driver-popover-next-btn') || e.target.closest('.driver-popover-next-btn'));
		    if (nextBtn) {
		        const btnText = (nextBtn.textContent || '').trim();
		        const isLast = (activeDriverInstance && typeof activeDriverInstance.isLastStep === 'function' && activeDriverInstance.isLastStep()) ||
		                       btnText.includes('Finish') ||
		                       btnText.includes('Done');
		        if (isLast) {
		            e.preventDefault();
		            e.stopPropagation();
		            cleanupDriverTour();
		            return;
		        }
		    }
		}, true);

		// Always automatically activate tour on visiting or refreshing the page
		(function setupAutoTourActivation() {
		    let hasTriggered = false;

		    function triggerTourOnVisit() {
		        if (hasTriggered || tourRunning) return;
		        hasTriggered = true;
		        startSystemTour();
		    }

		    // Check immediate state
		    if (document.readyState === 'complete') {
		        setTimeout(triggerTourOnVisit, 350);
		    } else {
		        window.addEventListener('load', () => setTimeout(triggerTourOnVisit, 350));
		        document.addEventListener('DOMContentLoaded', () => setTimeout(triggerTourOnVisit, 600));
		    }

		    // Universal fallback to guarantee activation on any slow or cached refresh
		    setTimeout(triggerTourOnVisit, 850);
		})();

		/* Creator Attribution & Anti-Tamper Protection */
		(function initCreatorAttributionProtection() {
		    const REQUIRED_HANDLE = 'crmry';
		    const REQUIRED_PROFILE = 'https://github.com/crmry';
		    const INNER_CONTENT = '<span>&copy; 2026 <strong>Citizen Charter Builder</strong> &bull; Created by <a href="' + REQUIRED_PROFILE + '" target="_blank" rel="noopener noreferrer" class="creator-link">' + REQUIRED_HANDLE + '</a></span>';

		    function enforceAttribution() {
		        let footer = document.getElementById('appCreatorFooter');
		        const targetParent = document.querySelector('.container-fluid') || document.querySelector('#page-wrapper') || document.body;

		        if (!footer) {
		            footer = document.createElement('footer');
		            footer.id = 'appCreatorFooter';
		            footer.className = 'app-creator-footer';
		            footer.setAttribute('data-creator', REQUIRED_HANDLE);
		            footer.setAttribute('data-protected', 'true');
		            footer.innerHTML = '<div class="creator-footer-content">' + INNER_CONTENT + '</div>';
		            if (targetParent) {
		                targetParent.appendChild(footer);
		            }
		            return;
		        }

		        // Validate content integrity
		        const text = footer.textContent || '';
		        const link = footer.querySelector('a');
		        const hasValidText = text.includes('Citizen Charter Builder') && text.includes(REQUIRED_HANDLE);
		        const hasValidLink = link && link.getAttribute('href') === REQUIRED_PROFILE;

		        if (!hasValidText || !hasValidLink) {
		            footer.innerHTML = '<div class="creator-footer-content">' + INNER_CONTENT + '</div>';
		        }

		        // Enforce visibility
		        if (footer.style.display === 'none' || footer.style.visibility === 'hidden' || footer.style.opacity === '0') {
		            footer.style.display = 'block';
		            footer.style.visibility = 'visible';
		            footer.style.opacity = '1';
		        }
		    }

		    if (document.readyState === 'loading') {
		        document.addEventListener('DOMContentLoaded', enforceAttribution);
		    } else {
		        enforceAttribution();
		    }

		    // Mutation observer to detect and reverse tampering/removal
		    try {
		        const observer = new MutationObserver(() => {
		            enforceAttribution();
		        });
		        observer.observe(document.body, { childList: true, subtree: true, attributes: true });
		    } catch (e) {
		        console.warn('Attribution observer fallback active');
		    }

		    // Periodic verification interval
		    setInterval(enforceAttribution, 4000);
		})();


