// assets/clearForm.js

document.addEventListener('DOMContentLoaded', () => {
    // Function to clear the form by reloading the page
    function clearForm() {
        console.log("Clear Form button clicked");
        // Reload the page to reset the form and all elements to their initial state
        location.reload();
    }
    
    // Ensure the clear form button calls the clearForm function
    document.querySelector('button[onclick="clearForm()"]').onclick = clearForm;
});