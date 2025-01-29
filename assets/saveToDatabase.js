// assets/saveToDatabase.js

// Function to save form data to the database
function saveToDatabase() {
    console.log("Save button clicked");
    
    // Get form values
    const FeesToBePaid = document.getElementById('FeesToBePaid').value || "N/A";
    const ProcessingTime = document.getElementById('ProcessingTime').value || "N/A";
    const serviceName = document.getElementById('serviceNameInput').value.trim();
    const description = editor.getData().trim();
    const office = document.querySelector('textarea[name="office"]').value.trim();
    const classificationElement = document.querySelector('input[name="classification"]:checked');
    const classification = classificationElement ? classificationElement.value : '';
    const transactionTypes = Array.from(document.querySelectorAll('input[name="transaction_type"]:checked')).map(el => el.value).join(', ');
    const whoMayAvail = document.querySelector('textarea[name="who_may_avail"]').value.trim().replace(/\n/g, '<br>');

    // Validation checks
    if (!serviceName || !description || !office || !classification || !transactionTypes || !whoMayAvail) {
        alert("Please fill out all required fields.");
        return;
    }

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