function clearForm() {
    const form = document.getElementById('citizenCharterForm');
    form.reset();

    // Clear CKEditor content
    document.getElementById('editor').innerHTML = '';

    // Clear radio buttons
    form.querySelectorAll('input[type="radio"]').forEach(function(radio) {
        radio.checked = false;
    });

    // Clear checkboxes
    form.querySelectorAll('input[type="checkbox"]').forEach(function(checkbox) {
        checkbox.checked = false;
    });

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