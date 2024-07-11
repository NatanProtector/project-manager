// Get the current URL of the page
const currentUrl = window.location.href;

// Split the URL by '/' to get segments
const urlSegments = currentUrl.split('/');

// Get the last segment (trim any trailing slashes)
const project_id = urlSegments[urlSegments.length - 1].replace(/\/+$/, '');

// Fields for editing project

// staff inputs
const staffName = document.getElementById('staffName');
const staffEmail = document.getElementById('staffEmail');
const staffRole = document.getElementById('staffRole');

// project fields
const projectName = document.getElementById('projectName');
const summary = document.getElementById('summary');
const managerName = document.getElementById('managerName');
const managerEmail = document.getElementById('managerEmail');
const startDate = document.getElementById('startDate');

// Staff for new project
var staffMembers = [];  // Array of staff members

// Submit button 
const submitButton = document.getElementById('submit-button');

// add staff button
const selectedStaffDisplay = document.querySelector('.selected-staff-display');

// Email regex
const emailRegex = /^([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+)\.([a-zA-Z]{2,})$/;

// ---=== Functions ---===---===---===---===---===---===---===---===---===---===---===---===---===---===---===---===---===---===---

const clearStaffInput = function() {
    staffEmail.value = '';
    staffName.value = '';
    staffRole.value = '';
}

// Function to clear form data
const clearProjectForm = function() {
    projectName.value = '';
    summary.value = '';
    managerName.value = '';
    managerEmail.value = '';
    startDate.value = '';
    clearStaffInput();
    staffMembers = [];
    selectedStaffDisplay.innerHTML = '';
}

// Validate staff info
const validateStaffInfo = function(name,email,role) {
    if (!name) {
        alert('Staff members must have a name');
        return false;
    }

    if (!email) {
        alert('Staff members must have an email');
        return false;
    }

    if (emailRegex.test(email) == false) {
        alert('Staff members must have a valid email');
        return false;
    }

    if (!role) {
        alert('Staff members must have a role');
        return false;
    }

    return true;
}

const addStaff = function(name,email,role) {
    clearStaffInput();

    const text = `Name: ${name} - Email: ${email} - Role: ${role}`;

    // Create a new div element of the class selected-staff
    const newStaffDiv = document.createElement('div');

    newStaffDiv.className = 'selected-staff';

    newStaffDiv.textContent = text;

    // Create a button element
    const deleteButton = document.createElement('button');
    deleteButton.className = 'delete-button';
    deleteButton.textContent = 'Delete';
    newStaffDiv.appendChild(deleteButton);
    
    // remove the div on click  
    newStaffDiv.addEventListener('click', function() {
        selectedStaffDisplay.removeChild(newStaffDiv);
        staffMembers = staffMembers.filter(function(member) {
            return member.email !== email && member.name !== name && member.role !== role;
        })
    });

    selectedStaffDisplay.appendChild(newStaffDiv);

    staffMembers.push({
        name: name,
        email: email,
        role: role
    })
}

// Add staff memeber to project
const addStaffClicked = function(event) {

    const name = staffName.value;
    const email = staffEmail.value;
    const role = staffRole.value;

    if (validateStaffInfo(name,email,role)) {
        addStaff(name,email,role);
    }
}


const validateNewProject = function(project) {
    if (!project.name) {
        alert('Project name is required');
        return false;
    }

    if (!project.manager.name) {
        alert('Project manager name is required');
        return false;
    }

    if (!project.manager.email) {
        alert('Project manager email is required');
        return false;
    }

    if (emailRegex.test(project.manager.email) == false) {
        alert('Project manager email is invalid');
        return false;
    }

    if (!project.summary) {
        alert('Project summary is required');
        return false;
    }

    if (project.summary.length < 20 || project.summary.length > 80) {
        console.log("test");
        alert('Project summary must be between 20 and 80 characters');
        return false;
    }

    if (!project.start_date) {
        alert('Project start date is required');
        return false;
    }

    return true;
}

const submitClicked = function(event) {

    // date to timestamp
    const start_date = new Date(startDate.value); 
    const start_date_timestamp = start_date.getTime() / 1000;

    const editedProjectObject = {
        name: projectName.value,
        summary: summary.value,
        images: projectImages,
        manager: {
            name: managerName.value,
            email: managerEmail.value
        },
        team: staffMembers,
        start_date: start_date_timestamp,
        id: project_id
    };


    // Validate project info
    if (validateNewProject(editedProjectObject)) {
        // Send the new project object to the server
        $.ajax({
            url: `/projects/${project_id}`,
            type: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify(editedProjectObject),
            success: function(response) {
                clearProjectForm();
                window.location.href = '../../list';
            },
            error: function(error) {
                console.log('Error:', error);
            }
        });
    }   
}

// ===---===---===---===---===---===---===---===---===---===---===---===---===---===---===---===---===---===---===---===---===---

document.getElementById('add-staff-button').addEventListener('click', addStaffClicked); // Add click event listener to add staff button

submitButton.addEventListener('click', submitClicked); // Add click event listener to submit button

async function getProject(Project_id) {
    return new Promise((resolve, reject) => {
        const apiUrl = `/projects/${Project_id}`;

        $.ajax({
            url: apiUrl,
            method: 'GET',
            success: function(response) {
                resolve(response);
            },
            error: function(jqXHR, textStatus, errorThrown) {
                reject(new Error(`Error fetching project. Status: ${jqXHR.status} - ${textStatus}: ${errorThrown}`));
            }
        });
    });
}

const timestampToDate = function(timestamp) {
        // Format start_date to "yyyy-MM-dd"
        const startDateValue = new Date(timestamp * 1000);
        const formattedStartDate = startDateValue.toISOString().split('T')[0];
    
        return formattedStartDate;
} 

const displayProjectForEditing = async (project_id) => {

    const project = await getProject(project_id);

    projectImages = project.images;

    projectName.value = project.name;
    summary.value = project.summary;
    managerName.value = project.manager.name;
    managerEmail.value = project.manager.email;

    startDate.value = timestampToDate(project.start_date);

    project.team.forEach((member) => {
        addStaff(member.name, member.email, member.role);
    })

    staffMembers = project.team;    
} 


displayProjectForEditing(project_id);