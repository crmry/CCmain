# Citizen Charter Builder — Standalone & Web-Executable

### Department of Health — Hospital Information System

A web-based Citizen's Charter authoring tool designed for hospital administration, department heads, and clinical service units to draft, standardize, export, and publish official Citizen Charters in compliance with Republic Act No. 11032 (Ease of Doing Business and Efficient Government Service Delivery Act of 2018).

---

## 🚀 Live Demo (Web-Executable Link)

Access and run the Citizen Charter Builder directly in any web browser without installation:

- **Primary Web-Executable Link:** [https://crmry.github.io/CCmain/](https://crmry.github.io/CCmain/)
- **Alternative Mirror Link:** [https://crmry.github.io/CCmain/main.html](https://crmry.github.io/CCmain/main.html)

*(Runs 100% client-side in Google Chrome, Microsoft Edge, Mozilla Firefox, or Apple Safari — identical architecture to the HIS Physician's Dashboard & Order Sheets)*

---

## ✨ Key Features

### 1. 100% Client-Side & Zero-Server Dependency
- Runs directly from the GitHub Pages link with **zero server, database, or runtime dependencies**.
- No installation of Node.js, PHP, Apache, or XAMPP is needed for daily usage.

### 2. Persistent Browser Storage (`localStorage`)
- **Real-Time Auto-Save**: Automatically saves your working draft to browser storage as you type.
- **Draft Restoration**: Reloading or reopening the link automatically restores your active draft so work is never lost.
- **Manual Save Draft**: Explicit 1-click button to checkpoint your changes with timestamp notification.

### 3. Pre-Loaded Hospital Sample Charter
- 1-click **"Load Sample Charter"** button preloads standard hospital Citizen Charter records (*Issuance of Medical Certificate and Clinical Abstract*), complete with documentary requirements, processing times, and responsible officers.

### 4. Rich Text Formatting & Editor Suite
- **CKEditor 5** rich text editors for Service Description, Requirement Checklists, Where to Secure, Client Steps, Agency Actions, Fees, Processing Time, and Person Responsible.
- Built-in word-break and overflow protection to prevent table wrapping issues.

### 5. Dynamic Row Management
- Insert rows above or below any existing table entry.
- Safe deletion with automated editor teardown to prevent browser memory leaks.

### 6. Official A4 Print & "Save as PDF" Engine
- **Print Preview**: Generates the official Department of Health Citizen Charter layout.
- Styled for **A4 portrait** printing with auto-repeating headers, proper borders, and clean pagination.
- Print guidance instructions provided (Destination: "Save as PDF", Paper: A4, check Background graphics).

### 7. Portable JSON Export & Import
- **Export JSON**: Download the complete charter configuration as a `.json` backup file.
- **Import JSON**: Re-import existing charter files anytime for rapid updates or cross-department reviews.

---

## 🛠️ Technology Stack

- **Structure:** Semantic HTML5
- **Styling:** Inspinia Admin Healthcare Theme + Bootstrap CSS + FontAwesome 6
- **Rich Text:** CKEditor 5 Classic
- **Interactivity:** Vanilla JavaScript + jQuery 3.1.1
- **Persistence:** Client-side HTML5 `localStorage`
- **Hosting / Deployment:** GitHub Pages

---

## 💻 Local / Offline Usage

Simply double-click `index.html` in the repository root to run the application in any modern web browser (Google Chrome, Microsoft Edge, Safari, Firefox). No web server, database, Node.js, or internet connection is required for authoring and saving Citizen Charters.
