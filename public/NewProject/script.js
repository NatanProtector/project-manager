// staff inputs
const staffName = document.getElementById("staffName");
const staffEmail = document.getElementById("staffEmail");
const staffRole = document.getElementById("staffRole");

// project fields
const projectName = document.getElementById("projectName");
const summary = document.getElementById("summary");
const managerName = document.getElementById("managerName");
const managerEmail = document.getElementById("managerEmail");
const startDate = document.getElementById("startDate");

// Staff for new project
var staffMembers = []; // Array of staff members

// Submit button
const submitButton = document.getElementById("submit-button");

// add staff button
const selectedStaffDisplay = document.querySelector(".selected-staff-display");

// Email regex
const emailRegex = /^([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+)\.([a-zA-Z]{2,})$/;

// ---=== Functions ---===---===---===---===---===---===---===---===---===---===---===---===---===---===---===---===---===---===---

const clearStaffInput = function () {
  staffEmail.value = "";
  staffName.value = "";
  staffRole.value = "";
};

// Function to clear form data
const clearProjectForm = function () {
  projectName.value = "";
  summary.value = "";
  managerName.value = "";
  managerEmail.value = "";
  startDate.value = "";
  clearStaffInput();
  staffMembers = [];
  selectedStaffDisplay.innerHTML = "";
};

// Validate staff info
const validateStaffInfo = function (name, email, role) {
  if (!name) {
    alert("Staff members must have a name");
    return false;
  }

  if (!email) {
    alert("Staff members must have an email");
    return false;
  }

  if (emailRegex.test(email) == false) {
    alert("Staff members must have a valid email");
    return false;
  }

  if (!role) {
    alert("Staff members must have a role");
    return false;
  }

  return true;
};

// Add staff memeber to project
const addStaffClicked = function (event) {
  const name = staffName.value;
  const email = staffEmail.value;
  const role = staffRole.value;

  if (validateStaffInfo(name, email, role)) {
    clearStaffInput();

    const text = `Name: ${name} - Email: ${email} - Role: ${role}`;

    // Create a new div element of the class selected-staff
    const newStaffDiv = document.createElement("div");

    newStaffDiv.className = "selected-staff";

    newStaffDiv.textContent = text;

    // Create a button element
    const deleteButton = document.createElement("button");
    deleteButton.className = "delete-button";
    deleteButton.textContent = "Delete";
    newStaffDiv.appendChild(deleteButton);

    // remove the div on click
    newStaffDiv.addEventListener("click", function () {
      selectedStaffDisplay.removeChild(newStaffDiv);
      staffMembers = staffMembers.filter(function (member) {
        return (
          member.email !== email && member.name !== name && member.role !== role
        );
      });
    });

    selectedStaffDisplay.appendChild(newStaffDiv);

    staffMembers.push({
      name: name,
      email: email,
      role: role,
    });
  }
};

const validateNewProject = function (project) {
  if (!project.name) {
    alert("Project name is required");
    return false;
  }

  if (!project.manager.name) {
    alert("Project manager name is required");
    return false;
  }

  if (!project.manager.email) {
    alert("Project manager email is required");
    return false;
  }

  if (emailRegex.test(project.manager.email) == false) {
    alert("Project manager email is invalid");
    return false;
  }

  if (!project.summary) {
    alert("Project summary is required");
    return false;
  }

  if (project.summary.length < 20 || project.summary.length > 80) {
    alert("Project summary must be between 20 and 80 characters");
    return false;
  }

  if (!project.start_date) {
    alert("Project start date is required");
    return false;
  }

  if (
    !isFinite(project.start_date) ||
    new Date(project.start_date).getTime() !== project.start_date
  ) {
    return false;
  }

  return true;
};

const submitClicked = function (event) {
  // date to timestamp
  const start_date = new Date(startDate.value);
  const start_date_timestamp = start_date.getTime() / 1000;

  const newProjectObject = {
    name: projectName.value,
    summary: summary.value,
    images: [],
    manager: {
      name: managerName.value,
      email: managerEmail.value,
    },
    team: staffMembers,
    start_date: start_date_timestamp,
  };

  if (validateNewProject(newProjectObject)) {
    // Send the new project object to the server
    $.ajax({
      url: "/projects",
      type: "POST",
      contentType: "application/json",
      data: JSON.stringify(newProjectObject),
      success: function (response) {
        clearProjectForm();
        window.location.href = "../list";
      },
      error: function (error) {
        console.log("Error:", error);
      },
    });
  }
};

// ===---===---===---===---===---===---===---===---===---===---===---===---===---===---===---===---===---===---===---===---===---

document
  .getElementById("add-staff-button")
  .addEventListener("click", addStaffClicked); // Add click event listener to add staff button

submitButton.addEventListener("click", submitClicked); // Add click event listener to submit button
