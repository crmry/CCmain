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

    openPreview();
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

    openPreview();
}