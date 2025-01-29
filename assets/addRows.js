function addRequirementRow() {
    const tableBody = document.getElementById('requirementsTableBody');
    const newRow = document.createElement('tr');

    const rowIndex = editorCounter++;

    newRow.innerHTML = `
        <td><div id="requirement-${rowIndex}"></div></td>
        <td><div id="whereToSecure-${rowIndex}"></div></td>
        <td>
            <button class="delete-btn" onclick="deleteRequirementRow(this.parentNode.parentNode)">Delete</button>
        </td>
    `;
    tableBody.appendChild(newRow);

    const editorConfig = {
        toolbar: ['bold', 'italic', 'bulletedList', 'numberedList'],
    };

    ClassicEditor
        .create(document.querySelector(`#requirement-${rowIndex}`), editorConfig)
        .then(editor => {
            requirementEditors.push({
                type: 'requirement',
                index: rowIndex,
                editor: editor
            });
        })
        .catch(error => {
            console.error('Error initializing requirement editor:', error);
        });

    ClassicEditor
        .create(document.querySelector(`#whereToSecure-${rowIndex}`), editorConfig)
        .then(editor => {
            requirementEditors.push({
                type: 'whereToSecure',
                index: rowIndex,
                editor: editor
            });
        })
        .catch(error => {
            console.error('Error initializing whereToSecure editor:', error);
        });
}

function addProcessOverviewRow() {
    const tableBody = document.getElementById('processOverviewTableBody');
    const newRow = document.createElement('tr');

    const rowIndex = editorCounter++;

    newRow.innerHTML = `
        <td><div id="clientSteps-${rowIndex}"></div></td>
        <td><div id="agencyActions-${rowIndex}"></div></td>
        <td><div id="feesToBePaid-${rowIndex}"></div></td>
        <td><div id="processingTime-${rowIndex}"></div></td>
        <td><div id="personResponsible-${rowIndex}"></div></td>
        <td><button class="delete-btn" onclick="deleteProcessOverviewRow(this.parentNode.parentNode)">Delete</button></td>
    `;
    tableBody.appendChild(newRow);

    const editorConfig = {
        toolbar: ['bold', 'italic', 'bulletedList', 'numberedList'],
    };

    const fieldTypes = [
        'clientSteps',
        'agencyActions',
        'feesToBePaid',
        'processingTime',
        'personResponsible',
    ];

    fieldTypes.forEach(type => {
        ClassicEditor.create(document.querySelector(`#${type}-${rowIndex}`), editorConfig)
            .then(editor => {
                processOverviewEditors.push({
                    type: type,
                    index: rowIndex,
                    editor: editor,
                });
            })
            .catch(error => {
                console.error(`Error initializing ${type} editor:`, error);
            });
    });
}