// Define the openPreview function
function openPreview() {
    console.log("Preview button clicked");
    // Your preview logic here
}

// Example usage of delete functions
function deleteRequirementRow(row) {
    const rowIndex = row.rowIndex - 1;

    requirementEditors = requirementEditors.filter(editor => {
        if (editor.index === rowIndex) {
            editor.editor.destroy();
            return false;
        }
        return true;
    });

    row.remove();

    // Ensure openPreview is defined and accessible
    if (typeof openPreview === 'function') {
        openPreview();
    } else {
        console.error('openPreview function is not defined.');
    }
}

function deleteProcessOverviewRow(row) {
    const rowIndex = row.rowIndex - 1;

    processOverviewEditors = processOverviewEditors.filter(editor => {
        if (editor.index === rowIndex) {
            editor.editor.destroy();
            return false;
        }
        return true;
    });

    row.remove();

    // Ensure openPreview is defined and accessible
    if (typeof openPreview === 'function') {
        openPreview();
    } else {
        console.error('openPreview function is not defined.');
    }
}

// Example to test the delete functions
document.addEventListener('DOMContentLoaded', () => {
    // Assuming you have a way to add rows and editors
    // Here you can add event listeners to delete buttons
    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const row = event.target.closest('tr');
            deleteRequirementRow(row); // or deleteProcessOverviewRow(row) based on the context
        });
    });
});
