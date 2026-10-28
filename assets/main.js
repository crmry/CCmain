/**
 * Citizen Charter Builder - Client-Side Engine
 * Corazon Locsin Montelibano Memorial Regional Hospital (CLMMRH)
 * 
 * Features:
 *  - 100% Client-Side Execution (Runs standalone or on GitHub Pages without backend requirements)
 *  - Persistent Browser Storage (localStorage auto-save and draft restoration)
 *  - CKEditor 5 Integration with Word-Break Protection
 *  - Dynamic Row Management (Insert Above, Insert Below, Delete with Editor Cleanup)
 *  - Standard Hospital Sample Charter Preloader
 *  - Full JSON Export / Import
 *  - Official A4 Printable Preview and Save as PDF
 */

let ckeditorInstance = null;
let processingTimeEditor = null;
let feesEditor = null;
let requirementEditors = [];
let processOverviewEditors = [];
let editorCounter = 0;
let previewWindow = null;
let autoSaveTimeout = null;

const STORAGE_KEY = 'clmmrh_citizen_charter_draft_v1';

const DEFAULT_EDITOR_CONFIG = {
    toolbar: ['bold', 'italic', 'bulletedList', 'numberedList'],
    removePlugins: ['Autoformat']
};

const SAMPLE_CHARTER = {
    serviceName: "ISSUANCE OF MEDICAL CERTIFICATE AND CLINICAL ABSTRACT",
    office: "Health Information Management Department (HIMD) / Outpatient Department (OPD)",
    classification: "Simple",
    transaction_type: ["Government to Citizen (G2C)"],
    who_may_avail: "All discharged inpatients, active outpatients, or their officially authorized representative requesting certified copies of hospital records and medical abstracts.",
    description: "<p>Provision of certified medical certificates, clinical abstracts, and verification of hospital confinements or consultations for employment, legal, insurance, financial assistance, or continuing medical care purposes.</p>",
    feesToBePaid: "<p><strong>₱50.00</strong> (Official Certification Fee; indigent patients waived upon Medical Social Service endorsement)</p>",
    processingTime: "<p><strong>30 Minutes</strong> (Upon submission of complete documentary requirements)</p>",
    requirements: [
        {
            checklist: "<p>1. Valid Government-Issued Identification Card (GSIS, SSS, PhilHealth, Driver's License, Passport, Postal, or PRC) &mdash; <em>1 Original, 1 Photocopy</em></p>",
            where: "<p>Issuing Government Agency (DFA, LTO, PRC, SSS, GSIS, PhilHealth, Post Office)</p>"
        },
        {
            checklist: "<p>2. Patient Hospital Record / OPD Green Card / Hospital Record Number (HRN)</p>",
            where: "<p>HIMD / OPD Registration &amp; Triage Section</p>"
        },
        {
            checklist: "<p>3. Signed Authorization Letter and Representative's Valid ID (if filed through an authorized representative)</p>",
            where: "<p>Patient / Legal Guardian</p>"
        }
    ],
    processOverview: [
        {
            clientSteps: "<p>1. Submit Requisition Slip, Patient ID / OPD Card, and valid identification to the HIMD Window 1 receiving counter.</p>",
            agencyActions: "<p>Receive document request, verify patient identity in the Hospital Information System (HIS/MedSys), and retrieve archived patient medical folder.</p>",
            feesToBePaid: "<p>None</p>",
            processingTime: "<p>5 Minutes</p>",
            personResponsible: "<p>HIMD Receiving Clerk / Health Records Officer</p>"
        },
        {
            clientSteps: "<p>2. Proceed to Hospital Cashier Counter and pay certification fee.</p>",
            agencyActions: "<p>Receive payment, validate fee schedule, and issue Official Receipt (OR).</p>",
            feesToBePaid: "<p>₱50.00</p>",
            processingTime: "<p>5 Minutes</p>",
            personResponsible: "<p>Hospital Cashier</p>"
        },
        {
            clientSteps: "<p>3. Present Official Receipt to the Attending Physician or Medical Officer for document preparation and signature.</p>",
            agencyActions: "<p>Review clinical history, fill out medical certificate / clinical abstract, affix professional license signature, and apply hospital dry seal.</p>",
            feesToBePaid: "<p>None</p>",
            processingTime: "<p>15 Minutes</p>",
            personResponsible: "<p>Attending Physician / Resident Medical Officer</p>"
        },
        {
            clientSteps: "<p>4. Claim signed official medical certificate / clinical abstract at HIMD Releasing Window.</p>",
            agencyActions: "<p>Log release in HIMD Dispatch Registry and issue certified true copy to client.</p>",
            feesToBePaid: "<p>None</p>",
            processingTime: "<p>5 Minutes</p>",
            personResponsible: "<p>HIMD Releasing Officer</p>"
        }
    ]
};

// Global helper to (re)create the Processing Time CKEditor
function createProcessingTimeEditor(initialData = '') {
    const el = document.querySelector('#ProcessingTime');
    if (!el) return;
    ClassicEditor.create(el, {
        toolbar: ['bold', 'italic'],
        removePlugins: ['Autoformat']
    }).then(ed => {
        processingTimeEditor = ed;
        if (initialData) processingTimeEditor.setData(initialData);

        ed.model.document.on('change:data', () => {
            const val = ed.getData() || '';
            const hidden = document.getElementById('ProcessingTimeInput');
            if (hidden) hidden.value = val;
            triggerAutoSave();
        });
    }).catch(err => console.error('ProcessingTime editor init error:', err));
}

// Global helper to (re)create the Total Fees CKEditor
function createFeesEditor(initialData = '') {
    const el = document.querySelector('#FeesToBePaid');
    if (!el) return;
    ClassicEditor.create(el, {
        toolbar: ['bold', 'italic'],
        removePlugins: ['Autoformat']
    }).then(ed => {
        feesEditor = ed;
        if (initialData) feesEditor.setData(initialData);

        ed.model.document.on('change:data', () => {
            const val = ed.getData() || '';
            const hidden = document.getElementById('FeesToBePaidInput');
            if (hidden) hidden.value = val;
            triggerAutoSave();
        });
    }).catch(err => console.error('Fees editor init error:', err));
}

document.addEventListener("DOMContentLoaded", () => {
    // 1. Initialize Main Service Description CKEditor
    const mainEditorEl = document.querySelector("#editor");
    if (mainEditorEl) {
        ClassicEditor.create(mainEditorEl, DEFAULT_EDITOR_CONFIG).then(e => {
            ckeditorInstance = e;
            ckeditorInstance.model.document.on('change:data', triggerAutoSave);

            // After main editor is ready, initialize editors or load saved draft
            initDraftOrDefaults();
        }).catch(error => {
            console.error('Error initializing main editor:', error);
            initDraftOrDefaults();
        });
    } else {
        initDraftOrDefaults();
    }

    // 2. Event delegation for requirements table actions
    const reqBody = document.getElementById('requirementsTableBody');
    if (reqBody) {
        reqBody.addEventListener('click', (e) => {
            const btn = e.target.closest('button');
            if (!btn || !btn.classList.contains('action-btn')) return;

            e.preventDefault();
            e.stopPropagation();

            const scrollPos = window.scrollY;
            const rowIndex = btn.getAttribute('data-row-index');
            const row = document.querySelector(`#requirementsTableBody tr[data-row-index="${rowIndex}"]`);
            if (!row) return;

            if (btn.classList.contains('insert-above-btn')) {
                insertRequirementRow(row, 'above');
                setTimeout(() => window.scrollTo(0, scrollPos), 50);
            } else if (btn.classList.contains('insert-below-btn')) {
                insertRequirementRow(row, 'below');
                setTimeout(() => window.scrollTo(0, scrollPos), 50);
            } else if (btn.classList.contains('delete-requirement-btn')) {
                deleteRequirementRow(row);
                setTimeout(() => window.scrollTo(0, scrollPos), 50);
            }
            triggerAutoSave();
        });
    }

    // 3. Event delegation for process overview table actions
    const procBody = document.getElementById('processOverviewTableBody');
    if (procBody) {
        procBody.addEventListener('click', (e) => {
            const btn = e.target.closest('button');
            if (!btn || !btn.classList.contains('action-btn')) return;

            e.preventDefault();
            e.stopPropagation();

            const scrollPos = window.scrollY;
            const rowIndex = btn.getAttribute('data-row-index');
            const row = document.querySelector(`#processOverviewTableBody tr[data-row-index="${rowIndex}"]`);
            if (!row) return;

            if (btn.classList.contains('insert-above-btn')) {
                insertProcessOverviewRow(row, 'above');
                setTimeout(() => window.scrollTo(0, scrollPos), 50);
            } else if (btn.classList.contains('insert-below-btn')) {
                insertProcessOverviewRow(row, 'below');
                setTimeout(() => window.scrollTo(0, scrollPos), 50);
            } else if (btn.classList.contains('delete-process-btn')) {
                deleteProcessOverviewRow(row);
                setTimeout(() => window.scrollTo(0, scrollPos), 50);
            }
            triggerAutoSave();
        });
    }

    // 4. Attach input / change listeners for auto-save
    const form = document.getElementById('citizenCharterForm');
    if (form) {
        form.addEventListener('input', triggerAutoSave);
        form.addEventListener('change', triggerAutoSave);
    }
});

// Load saved draft from localStorage or populate sample defaults
function initDraftOrDefaults() {
    createProcessingTimeEditor('');
    createFeesEditor('');

    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        try {
            const data = JSON.parse(saved);
            populateFormData(data);
            showStatusBadge('Restored draft from browser storage', 'info');
            return;
        } catch (err) {
            console.warn('Could not parse saved draft, loading default:', err);
        }
    }

    // If no draft exists, load sample template for immediate readiness
    loadSampleData(false);
}

// Add a Requirement Row
function addRequirementRow(requirementValue = '', whereValue = '', referenceRow = null, insertBefore = true) {
    const tableBody = document.getElementById('requirementsTableBody');
    if (!tableBody) return;
    const newRow = document.createElement('tr');
    const rowIndex = editorCounter++;

    newRow.setAttribute('data-row-index', rowIndex);
    newRow.innerHTML = `
        <td colspan="2">
            <div id="requirement-${rowIndex}"></div>
        </td>
        <td colspan="3">
            <div id="whereToSecure-${rowIndex}"></div>
        </td>
        <td style="text-align: center; vertical-align: middle;">
            <div class="btn-group" role="group">
                <button type="button" class="action-btn action-btn-info insert-above-btn" data-row-index="${rowIndex}" data-action="insert-above" title="Insert row above"><i class="fas fa-arrow-up"></i></button>
                <button type="button" class="action-btn action-btn-info insert-below-btn" data-row-index="${rowIndex}" data-action="insert-below" title="Insert row below"><i class="fas fa-arrow-down"></i></button>
                <button type="button" class="action-btn action-btn-danger delete-requirement-btn" data-row-index="${rowIndex}" data-action="delete" title="Delete row"><i class="fas fa-trash-alt"></i></button>
            </div>
        </td>
    `;

    if (referenceRow) {
        if (insertBefore) {
            tableBody.insertBefore(newRow, referenceRow);
        } else {
            tableBody.insertBefore(newRow, referenceRow.nextSibling);
        }
    } else {
        tableBody.appendChild(newRow);
    }

    ClassicEditor.create(document.querySelector(`#requirement-${rowIndex}`), DEFAULT_EDITOR_CONFIG)
        .then(editorInstance => {
            if (requirementValue) editorInstance.setData(requirementValue);
            editorInstance.editing.view.change(writer => {
                writer.setStyle('word-break', 'keep-all', editorInstance.editing.view.document.getRoot());
                writer.setStyle('overflow-wrap', 'break-word', editorInstance.editing.view.document.getRoot());
                writer.setStyle('white-space', 'normal', editorInstance.editing.view.document.getRoot());
                writer.setStyle('hyphens', 'none', editorInstance.editing.view.document.getRoot());
            });
            editorInstance.model.document.on('change:data', triggerAutoSave);
            requirementEditors.push({
                type: 'requirement',
                index: rowIndex,
                editor: editorInstance
            });
        }).catch(err => console.error('CKEditor requirement error:', err));

    ClassicEditor.create(document.querySelector(`#whereToSecure-${rowIndex}`), DEFAULT_EDITOR_CONFIG)
        .then(editorInstance => {
            if (whereValue) editorInstance.setData(whereValue);
            editorInstance.editing.view.change(writer => {
                writer.setStyle('word-break', 'keep-all', editorInstance.editing.view.document.getRoot());
                writer.setStyle('overflow-wrap', 'break-word', editorInstance.editing.view.document.getRoot());
                writer.setStyle('white-space', 'normal', editorInstance.editing.view.document.getRoot());
                writer.setStyle('hyphens', 'none', editorInstance.editing.view.document.getRoot());
            });
            editorInstance.model.document.on('change:data', triggerAutoSave);
            requirementEditors.push({
                type: 'whereToSecure',
                index: rowIndex,
                editor: editorInstance
            });
        }).catch(err => console.error('CKEditor whereToSecure error:', err));
}

// Add a Process Overview Row
function addProcessOverviewRow(clientSteps = '', agencyActions = '', fees = '', time = '', person = '', referenceRow = null, insertBefore = true) {
    const tableBody = document.getElementById('processOverviewTableBody');
    if (!tableBody) return;
    const newRow = document.createElement('tr');
    const rowIndex = editorCounter++;
    newRow.setAttribute('data-row-index', rowIndex);
    newRow.innerHTML = `
        <td><div id="clientSteps-${rowIndex}"></div></td>
        <td><div id="agencyActions-${rowIndex}"></div></td>
        <td><div id="feesToBePaid-${rowIndex}"></div></td>
        <td><div id="processingTime-${rowIndex}"></div></td>
        <td><div id="personResponsible-${rowIndex}"></div></td>
        <td style="text-align: center; vertical-align: middle;">
            <div class="btn-group" role="group">
                <button type="button" class="action-btn action-btn-info insert-above-btn" data-row-index="${rowIndex}" data-action="insert-above" title="Insert row above"><i class="fas fa-arrow-up"></i></button>
                <button type="button" class="action-btn action-btn-info insert-below-btn" data-row-index="${rowIndex}" data-action="insert-below" title="Insert row below"><i class="fas fa-arrow-down"></i></button>
                <button type="button" class="action-btn action-btn-danger delete-process-btn" data-row-index="${rowIndex}" data-action="delete" title="Delete row"><i class="fas fa-trash-alt"></i></button>
            </div>
        </td>
    `;

    if (referenceRow) {
        if (insertBefore) {
            tableBody.insertBefore(newRow, referenceRow);
        } else {
            tableBody.insertBefore(newRow, referenceRow.nextSibling);
        }
    } else {
        tableBody.appendChild(newRow);
    }

    const fields = [
        { type: 'clientSteps', value: clientSteps },
        { type: 'agencyActions', value: agencyActions },
        { type: 'feesToBePaid', value: fees },
        { type: 'processingTime', value: time },
        { type: 'personResponsible', value: person }
    ];

    fields.forEach(field => {
        ClassicEditor.create(document.querySelector(`#${field.type}-${rowIndex}`), DEFAULT_EDITOR_CONFIG)
            .then(editorInstance => {
                if (field.value) editorInstance.setData(field.value);
                editorInstance.editing.view.change(writer => {
                    writer.setStyle('word-break', 'keep-all', editorInstance.editing.view.document.getRoot());
                    writer.setStyle('overflow-wrap', 'break-word', editorInstance.editing.view.document.getRoot());
                    writer.setStyle('white-space', 'normal', editorInstance.editing.view.document.getRoot());
                    writer.setStyle('hyphens', 'none', editorInstance.editing.view.document.getRoot());
                });
                editorInstance.model.document.on('change:data', triggerAutoSave);
                processOverviewEditors.push({
                    type: field.type,
                    index: rowIndex,
                    editor: editorInstance
                });
            }).catch(err => console.error(`CKEditor ${field.type} error:`, err));
    });
}

function deleteRequirementRow(row) {
    if (!row) return;
    const rowIndex = parseInt(row.getAttribute('data-row-index'), 10);
    requirementEditors.forEach(item => {
        if (item.index === rowIndex && item.editor && item.editor.destroy) {
            item.editor.destroy().catch(() => {});
        }
    });
    requirementEditors = requirementEditors.filter(item => item.index !== rowIndex);
    row.remove();
}

function deleteProcessOverviewRow(row) {
    if (!row) return;
    const rowIndex = parseInt(row.getAttribute('data-row-index'), 10);
    processOverviewEditors.forEach(item => {
        if (item.index === rowIndex && item.editor && item.editor.destroy) {
            item.editor.destroy().catch(() => {});
        }
    });
    processOverviewEditors = processOverviewEditors.filter(item => item.index !== rowIndex);
    row.remove();
}

function insertRequirementRow(referenceRow, position) {
    const before = position === 'above';
    addRequirementRow('', '', referenceRow, before);
}

function insertProcessOverviewRow(referenceRow, position) {
    const before = position === 'above';
    addProcessOverviewRow('', '', '', '', '', referenceRow, before);
}

// Centralized Form Data Extraction
function collectFormData() {
    const form = document.getElementById('citizenCharterForm');
    const formData = form ? new FormData(form) : new FormData();

    const feesVal = (feesEditor ? feesEditor.getData() : '') ||
                    (document.getElementById('FeesToBePaidInput') ? document.getElementById('FeesToBePaidInput').value : '') ||
                    'N/A';
    const procVal = (processingTimeEditor ? processingTimeEditor.getData() : '') ||
                    (document.getElementById('ProcessingTimeInput') ? document.getElementById('ProcessingTimeInput').value : '') ||
                    'N/A';

    const data = {
        serviceName: formData.get('serviceName') || (document.getElementById('serviceNameInput') ? document.getElementById('serviceNameInput').value : ''),
        office: formData.get('office') || (document.querySelector('textarea[name="office"]') ? document.querySelector('textarea[name="office"]').value : ''),
        classification: formData.get('classification') || (document.querySelector('input[name="classification"]:checked') ? document.querySelector('input[name="classification"]:checked').value : 'Simple'),
        transaction_type: Array.from(document.querySelectorAll('input[name="transaction_type"]:checked')).map(el => el.value),
        who_may_avail: formData.get('who_may_avail') || (document.querySelector('textarea[name="who_may_avail"]') ? document.querySelector('textarea[name="who_may_avail"]').value : ''),
        feesToBePaid: feesVal,
        processingTime: procVal,
        description: ckeditorInstance ? ckeditorInstance.getData() : '',
        requirements: [],
        processOverview: []
    };

    // Extract Requirements
    document.querySelectorAll('#requirementsTableBody tr').forEach(row => {
        const rowIndex = parseInt(row.getAttribute('data-row-index'), 10);
        const reqEd = requirementEditors.find(ed => ed.index === rowIndex && ed.type === 'requirement');
        const whereEd = requirementEditors.find(ed => ed.index === rowIndex && ed.type === 'whereToSecure');
        if (reqEd && whereEd) {
            data.requirements.push({
                checklist: reqEd.editor.getData(),
                where: whereEd.editor.getData()
            });
        }
    });

    // Extract Process Overview Steps
    document.querySelectorAll('#processOverviewTableBody tr').forEach(row => {
        const rowIndex = parseInt(row.getAttribute('data-row-index'), 10);
        const clientStepsEd = processOverviewEditors.find(ed => ed.index === rowIndex && ed.type === 'clientSteps');
        const agencyActionsEd = processOverviewEditors.find(ed => ed.index === rowIndex && ed.type === 'agencyActions');
        const feesEd = processOverviewEditors.find(ed => ed.index === rowIndex && ed.type === 'feesToBePaid');
        const timeEd = processOverviewEditors.find(ed => ed.index === rowIndex && ed.type === 'processingTime');
        const personEd = processOverviewEditors.find(ed => ed.index === rowIndex && ed.type === 'personResponsible');

        if (clientStepsEd && agencyActionsEd && feesEd && timeEd && personEd) {
            data.processOverview.push({
                clientSteps: clientStepsEd.editor.getData(),
                agencyActions: agencyActionsEd.editor.getData(),
                feesToBePaid: feesEd.editor.getData(),
                processingTime: timeEd.editor.getData(),
                personResponsible: personEd.editor.getData()
            });
        }
    });

    return data;
}

// Centralized Form Data Population
function populateFormData(data) {
    if (!data) return;

    if (document.getElementById('serviceNameInput')) {
        document.getElementById('serviceNameInput').value = data.serviceName || '';
    }
    if (document.querySelector('textarea[name="office"]')) {
        document.querySelector('textarea[name="office"]').value = data.office || '';
    }
    if (document.querySelector('textarea[name="who_may_avail"]')) {
        document.querySelector('textarea[name="who_may_avail"]').value = data.who_may_avail || '';
    }

    // Set Classification Radio
    document.querySelectorAll('input[name="classification"]').forEach(el => {
        el.checked = (el.value === data.classification);
    });

    // Set Transaction Type Checkboxes
    const types = Array.isArray(data.transaction_type) ? data.transaction_type : [data.transaction_type || ''];
    document.querySelectorAll('input[name="transaction_type"]').forEach(el => {
        el.checked = types.some(t => t && t.includes(el.value));
    });

    // Description Editor
    if (ckeditorInstance) {
        ckeditorInstance.setData(data.description || '');
    }

    // Processing Time & Fees
    if (processingTimeEditor) {
        processingTimeEditor.setData(data.processingTime || '');
    } else if (document.getElementById('ProcessingTimeInput')) {
        document.getElementById('ProcessingTimeInput').value = data.processingTime || '';
    }

    if (feesEditor) {
        feesEditor.setData(data.feesToBePaid || '');
    } else if (document.getElementById('FeesToBePaidInput')) {
        document.getElementById('FeesToBePaidInput').value = data.feesToBePaid || '';
    }

    // Clear and rebuild requirements rows
    requirementEditors.forEach(e => {
        if (e.editor && e.editor.destroy) e.editor.destroy().catch(() => {});
    });
    requirementEditors = [];
    const reqBody = document.getElementById('requirementsTableBody');
    if (reqBody) reqBody.innerHTML = '';

    // Clear and rebuild process overview rows
    processOverviewEditors.forEach(e => {
        if (e.editor && e.editor.destroy) e.editor.destroy().catch(() => {});
    });
    processOverviewEditors = [];
    const procBody = document.getElementById('processOverviewTableBody');
    if (procBody) procBody.innerHTML = '';

    editorCounter = 0;

    if (Array.isArray(data.requirements) && data.requirements.length > 0) {
        data.requirements.forEach(item => addRequirementRow(item.checklist || item.requirement || '', item.where || item.whereToSecure || ''));
    } else {
        addRequirementRow();
    }

    if (Array.isArray(data.processOverview) && data.processOverview.length > 0) {
        data.processOverview.forEach(item =>
            addProcessOverviewRow(item.clientSteps || '', item.agencyActions || '', item.feesToBePaid || '', item.processingTime || '', item.personResponsible || '')
        );
    } else {
        addProcessOverviewRow();
    }
}

// Auto-save triggers
function triggerAutoSave() {
    clearTimeout(autoSaveTimeout);
    autoSaveTimeout = setTimeout(() => {
        saveToLocalStorage(false);
    }, 1500);
}

// Save to LocalStorage
function saveToLocalStorage(showFeedback = true) {
    try {
        const data = collectFormData();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        const timeStr = new Date().toLocaleTimeString();
        showStatusBadge(`Auto-saved at ${timeStr}`, 'success');
        if (showFeedback) {
            alert('Charter data saved securely in your browser storage!');
        }
    } catch (err) {
        console.warn('Storage quota or security restriction:', err);
        showStatusBadge('Save failed', 'danger');
    }
}

// Load Preconfigured Hospital Sample Charter
function loadSampleData(showConfirm = true) {
    if (showConfirm && !confirm('Load the standard CLMMRH hospital sample Citizen Charter? Any unsaved edits will be replaced.')) {
        return;
    }
    populateFormData(SAMPLE_CHARTER);
    saveToLocalStorage(false);
    showStatusBadge('Loaded Hospital Sample Charter', 'primary');
}

// Clear Form
function clearForm() {
    if (!confirm('Are you sure you want to clear the entire form?')) {
        return;
    }

    const form = document.getElementById('citizenCharterForm');
    if (form) form.reset();

    if (ckeditorInstance) ckeditorInstance.setData('');
    if (feesEditor) feesEditor.setData('');
    if (processingTimeEditor) processingTimeEditor.setData('');

    const feesHidden = document.getElementById('FeesToBePaidInput');
    if (feesHidden) feesHidden.value = '';
    const timeHidden = document.getElementById('ProcessingTimeInput');
    if (timeHidden) timeHidden.value = '';

    requirementEditors.forEach(e => {
        if (e.editor && e.editor.destroy) e.editor.destroy().catch(() => {});
    });
    requirementEditors = [];
    const reqBody = document.getElementById('requirementsTableBody');
    if (reqBody) reqBody.innerHTML = '';

    processOverviewEditors.forEach(e => {
        if (e.editor && e.editor.destroy) e.editor.destroy().catch(() => {});
    });
    processOverviewEditors = [];
    const procBody = document.getElementById('processOverviewTableBody');
    if (procBody) procBody.innerHTML = '';

    editorCounter = 0;
    addRequirementRow();
    addProcessOverviewRow();

    localStorage.removeItem(STORAGE_KEY);
    showStatusBadge('Form cleared', 'warning');

    if (previewWindow && !previewWindow.closed) {
        previewWindow.close();
        previewWindow = null;
    }
}

// Export JSON
function exportFormData() {
    const data = collectFormData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    const filename = (data.serviceName ? data.serviceName.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 50) : "citizen_charter") + ".json";
    a.download = filename;
    a.click();
    showStatusBadge('Exported JSON successfully', 'success');
}

// Import JSON
function importFormData(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            populateFormData(data);
            saveToLocalStorage(false);
            showStatusBadge('Imported charter JSON successfully', 'success');
        } catch (err) {
            alert('Invalid JSON file format. Please check your file.');
            console.error('Import error:', err);
        }
    };
    reader.readAsText(file);
    // Reset file input so same file can be re-imported
    event.target.value = '';
}

// UI Status Badge Helper
function showStatusBadge(msg, type = 'success') {
    const badge = document.getElementById('saveStatusBadge');
    if (!badge) return;
    badge.className = `badge badge-${type}`;
    badge.innerHTML = `<i class="fa fa-info-circle"></i> ${msg}`;
    badge.style.display = 'inline-block';
}

// Open Print Preview Window
function openPreview() {
    const data = collectFormData();
    const serviceName = data.serviceName || 'CITIZEN CHARTER';
    const description = data.description || '';
    const office = data.office || 'N/A';
    const classification = data.classification || 'Simple';
    const transactionTypes = data.transaction_type.join(', ') || 'N/A';
    const whoMayAvail = (data.who_may_avail || 'N/A').replace(/\n/g, '<br>');
    const feesToBePaid = data.feesToBePaid || 'N/A';
    const processingTime = data.processingTime || 'N/A';

    displayPreview(serviceName, description, office, classification, transactionTypes, whoMayAvail, data.requirements, data.processOverview, feesToBePaid, processingTime);
}

// Display Preview & Printable Document
function displayPreview(serviceName, description, office, classification, transactionTypes, whoMayAvail, requirements, processOverview, FeesToBePaid, ProcessingTime) {
    previewWindow = window.open('', '_blank', 'width=900,height=1000,scrollbars=yes,resizable=yes');
    if (!previewWindow) {
        alert('Pop-up window was blocked by your browser. Please allow popups for this site or use the browser print function.');
        return;
    }

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${serviceName} - Citizen Charter Official Form</title>
    <style>
        @page {
            size: A4 portrait;
            margin: 15mm 12mm 15mm 12mm;
        }

        * {
            box-sizing: border-box;
        }

        body {
            font-family: Arial, "Helvetica Neue", Helvetica, sans-serif;
            line-height: 1.4;
            margin: 0;
            padding: 24px;
            font-size: 11pt;
            color: #000;
            background-color: #fff;
        }

        .print-toolbar {
            background-color: #f1f5f9;
            border: 1px solid #cbd5e1;
            border-radius: 6px;
            padding: 12px 16px;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            font-size: 10pt;
        }

        .print-toolbar strong {
            color: #0f172a;
        }

        .pdf-button {
            background-color: #1f7d45;
            color: white;
            border: none;
            padding: 10px 20px;
            font-size: 11pt;
            font-weight: bold;
            border-radius: 4px;
            cursor: pointer;
            box-shadow: 0 2px 4px rgba(0,0,0,0.15);
            transition: background 0.2s;
        }

        .pdf-button:hover {
            background-color: #176337;
        }

        .close-button {
            background-color: #64748b;
            color: white;
            border: none;
            padding: 10px 16px;
            font-size: 11pt;
            border-radius: 4px;
            cursor: pointer;
            margin-left: 8px;
        }

        .hospital-header {
            text-align: center;
            border-bottom: 2px solid #000;
            padding-bottom: 8px;
            margin-bottom: 14px;
        }

        .hospital-header h4 {
            margin: 0 0 2px 0;
            font-size: 11pt;
            font-weight: normal;
            text-transform: uppercase;
        }

        .hospital-header h2 {
            margin: 0 0 2px 0;
            font-size: 14pt;
            font-weight: bold;
            color: #000;
        }

        .hospital-header h3 {
            margin: 0;
            font-size: 12pt;
            font-weight: bold;
            letter-spacing: 1px;
            text-transform: uppercase;
        }

        .service-title-card {
            background-color: #8eaadb;
            border: 1px solid #000;
            padding: 8px 12px;
            font-size: 13pt;
            font-weight: bold;
            text-transform: uppercase;
            margin-top: 10px;
            margin-bottom: 0;
        }

        .service-description-card {
            border: 1px solid #000;
            border-top: none;
            padding: 8px 12px;
            font-size: 10.5pt;
            margin-bottom: 0;
            background-color: #fff;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin: 0;
            word-wrap: break-word;
            table-layout: fixed;
            page-break-inside: auto;
        }

        th, td {
            border: 1px solid #000;
            padding: 6px 8px;
            text-align: left;
            vertical-align: top;
            word-break: break-word;
            font-size: 10pt;
        }

        th {
            background-color: #8eaadb;
            color: #000;
            font-weight: bold;
        }

        .section-header-row th {
            background-color: #8eaadb !important;
            text-align: center;
            font-weight: bold;
            text-transform: uppercase;
        }

        .total-row th, .total-row td {
            background-color: #8eaadb;
            font-weight: bold;
        }

        @media print {
            body {
                padding: 0;
                margin: 0;
                font-size: 9.5pt;
            }

            .print-toolbar {
                display: none !important;
            }

            table {
                border-collapse: collapse;
                page-break-inside: auto;
            }

            tr {
                page-break-inside: avoid;
            }

            thead {
                display: table-header-group;
            }

            tfoot {
                display: table-footer-group;
            }
        }
    </style>
</head>
<body>
    <div class="print-toolbar">
        <div>
            <strong>Print Instructions:</strong> Click <strong>Save as PDF</strong> &bull; Select Paper: <strong>A4</strong> &bull; Options: Check <strong>"Background graphics"</strong> &bull; Uncheck <strong>"Headers & footers"</strong>
        </div>
        <div>
            <button class="pdf-button" onclick="window.print()">Print / Save as PDF</button>
            <button class="close-button" onclick="window.close()">Close</button>
        </div>
    </div>

    <div class="hospital-header">
        <h4>Republic of the Philippines &bull; Department of Health</h4>
        <h2>CORAZON LOCSIN MONTELIBANO MEMORIAL REGIONAL HOSPITAL</h2>
        <h3>CITIZEN'S CHARTER</h3>
    </div>

    <div class="service-title-card">${serviceName}</div>
    <div class="service-description-card">${description || '<em>No description provided.</em>'}</div>

    <table>
        <colgroup>
            <col style="width: 28%;">
            <col style="width: 72%;">
        </colgroup>
        <tbody>
            <tr>
                <th>Office or Division:</th>
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
                <th>Who May Avail:</th>
                <td>${whoMayAvail}</td>
            </tr>
        </tbody>
    </table>

    <table style="border-top: none;">
        <colgroup>
            <col style="width: 50%;">
            <col style="width: 50%;">
        </colgroup>
        <thead>
            <tr class="section-header-row">
                <th style="text-align: center; border-top: none;">CHECKLIST OF REQUIREMENTS</th>
                <th style="text-align: center; border-top: none;">WHERE TO SECURE</th>
            </tr>
        </thead>
        <tbody>
            ${requirements.length > 0 ? requirements.map(req => `
                <tr>
                    <td>${req.checklist || req.requirement || '<em>None</em>'}</td>
                    <td>${req.where || req.whereToSecure || '<em>None</em>'}</td>
                </tr>
            `).join('') : `
                <tr>
                    <td colspan="2" style="text-align: center; font-style: italic;">No specific checklist items required.</td>
                </tr>
            `}
        </tbody>
    </table>

    <table style="border-top: none;">
        <colgroup>
            <col style="width: 24%;">
            <col style="width: 24%;">
            <col style="width: 15%;">
            <col style="width: 17%;">
            <col style="width: 20%;">
        </colgroup>
        <thead>
            <tr class="section-header-row">
                <th style="text-align: center; border-top: none;">CLIENT STEPS</th>
                <th style="text-align: center; border-top: none;">AGENCY ACTIONS</th>
                <th style="text-align: center; border-top: none;">FEES TO BE PAID</th>
                <th style="text-align: center; border-top: none;">PROCESSING TIME</th>
                <th style="text-align: center; border-top: none;">PERSON RESPONSIBLE</th>
            </tr>
        </thead>
        <tbody>
            ${processOverview.length > 0 ? processOverview.map(proc => `
                <tr>
                    <td>${proc.clientSteps || '<em>None</em>'}</td>
                    <td>${proc.agencyActions || '<em>None</em>'}</td>
                    <td style="text-align: center;">${proc.feesToBePaid || 'None'}</td>
                    <td style="text-align: center;">${proc.processingTime || 'N/A'}</td>
                    <td>${proc.personResponsible || 'N/A'}</td>
                </tr>
            `).join('') : `
                <tr>
                    <td colspan="5" style="text-align: center; font-style: italic;">No process steps defined.</td>
                </tr>
            `}
            <tr class="total-row">
                <td style="background-color: #8eaadb;"></td>
                <th style="text-align: right;">TOTAL:</th>
                <th style="text-align: center;">${FeesToBePaid}</th>
                <th style="text-align: center;">${ProcessingTime}</th>
                <td style="background-color: #8eaadb;"></td>
            </tr>
        </tbody>
    </table>
</body>
</html>`;

    previewWindow.document.open();
    previewWindow.document.write(htmlContent);
    previewWindow.document.close();
}
