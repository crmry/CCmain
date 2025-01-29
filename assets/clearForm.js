function clearForm() {
    // Clear all input fields
    document.getElementById('serviceNameInput').value = '';
    document.getElementById('editor').innerHTML = '';
    document.getElementsByName('office')[0].value = '';
    
    // Clear radio buttons
    document.querySelectorAll('input[name="classification"]').forEach((radio) => {
        radio.checked = false;
    });
    
    // Clear checkboxes
    document.querySelectorAll('input[name="transaction_type"]').forEach((checkbox) => {
        checkbox.checked = false;
    });
    
    // Clear textarea fields
    document.getElementsByName('who_may_avail')[0].value = '';
    document.getElementsByName('feesToBePaid')[0].value = '';
    document.getElementsByName('processingTime')[0].value = '';
    
    // Clear requirements table
    const requirementsTableBody = document.getElementById('requirementsTableBody');
    while (requirementsTableBody.firstChild) {
        requirementsTableBody.removeChild(requirementsTableBody.firstChild);
    }
    addRequirementRow(); // Add one initial row

    // Clear process overview table
    const processOverviewTableBody = document.getElementById('processOverviewTableBody');
    while (processOverviewTableBody.firstChild) {
        processOverviewTableBody.removeChild(processOverviewTableBody.firstChild);
    }
    addProcessOverviewRow(); // Add one initial row

    // Reset save button
    document.getElementById('saveButton').disabled = true;

    // Hide success message
    document.getElementById('saveSuccessMsg').style.display = 'none';
}