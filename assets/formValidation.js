// assets/formValidation.js

function validateForm() {
    const form = document.getElementById('citizenCharterForm');
    const saveButton = document.getElementById('saveButton');
    let allFilled = true;

    // Check required fields
    form.querySelectorAll('[required]').forEach(function(input) {
        if (!input.value.trim()) {
            allFilled = false;
        }
    });

    // Check requirements table
    form.querySelectorAll('#requirementsTableBody tr').forEach(function(row) {
        row.querySelectorAll('input, textarea').forEach(function(input) {
            if (!input.value.trim()) {
                allFilled = false;
            }
        });
    });

    // Check process overview table
    form.querySelectorAll('#processOverviewTableBody tr').forEach(function(row) {
        row.querySelectorAll('input, textarea').forEach(function(input) {
            if (!input.value.trim()) {
                allFilled = false;
            }
        });
    });

    // Check total processing time and fees fields
    const processingTime = document.getElementById('ProcessingTime');
    const feesToBePaid = document.getElementById('FeesToBePaid');
    if (processingTime && !processingTime.value.trim()) {
        allFilled = false;
    }
    if (feesToBePaid && !feesToBePaid.value.trim()) {
        allFilled = false;
    }

    // Enable or disable the save button based on field validation
    saveButton.disabled = !allFilled;
}

// Add event listener to validate form on input
document.getElementById('citizenCharterForm').addEventListener('input', validateForm);

// Validate form on page load
document.addEventListener('DOMContentLoaded', function() {
    validateForm();
});