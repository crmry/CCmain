<?php
// Database connection details
$servername = "localhost";
$username = "arta";
$password = "password123";
$dbname = "citizen_charter";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Check if the request is a POST request
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Get the posted data
    $serviceName = $_POST['serviceName'];
    $description = $_POST['description'];
    $office = $_POST['office'];
    $classification = $_POST['classification'];
    $transactionTypes = $_POST['transactionTypes'];
    $whoMayAvail = $_POST['whoMayAvail'];
    $requirements = $_POST['requirements'];
    $processOverview = $_POST['processOverview'];
    $feesToBePaid = $_POST['feesToBePaid'];
    $processingTime = $_POST['processingTime'];

    // Prepare the SQL statement
    $stmt = $conn->prepare("INSERT INTO services (serviceName, description, office, classification, transactionTypes, whoMayAvail, requirements, processOverview, feesToBePaid, processingTime) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    if ($stmt === false) {
        die("Prepare failed: " . $conn->error);
    }

    // Bind the parameters
    $stmt->bind_param("ssssssssss", $serviceName, $description, $office, $classification, $transactionTypes, $whoMayAvail, $requirements, $processOverview, $feesToBePaid, $processingTime);

    // Execute the statement and check for errors
    if ($stmt->execute()) {
        echo "New record created successfully";
    } else {
        echo "Error: " . $stmt->error;
    }

    // Close the statement and connection
    $stmt->close();
    $conn->close();
} else {
    echo "Invalid request method";
}
?>