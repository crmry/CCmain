let editor;
let requirementEditors = [];
let processOverviewEditors = [];
let editorCounter = 0; // Initialize a counter for editor IDs

// Initialize CKEditor
ClassicEditor
    .create(document.querySelector('#editor'))
    .then(newEditor => {
        editor = newEditor;
        console.log('CKEditor initialized');
    })
    .catch(error => {
        console.error('CKEditor initialization error:', error);
    });