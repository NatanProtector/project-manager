// Project container
const projectContainer = document.querySelector('.project-container');

// List of projects
var projects = [];

const createProjectElement = function(project) {

    // Create project element
    const projectElement = document.createElement('div');
    projectElement.className = 'project';


    // Create project labels
    const projectName = document.createElement('label');
    projectName.className = 'project-name';
    projectName.textContent = `Name: ${project.name}`;

    const managerName = document.createElement('label');
    managerName.className = 'manager-name';
    managerName.textContent = `Manager: ${project.manager.name}`;

    const startDate = document.createElement('label');
    startDate.className = 'start-date';
    startDate.textContent = `Start date: ${project.start_date}`;

    // Create project view button
    const viewButton = document.createElement('button');
    viewButton.className = 'view-button';
    viewButton.textContent = 'View';

    // Add redirect to project page
    viewButton.addEventListener('click', () => {
        window.location.href = `/project/${project.id}`;
    });

    // Append the project elements to the project container
    projectElement.appendChild(projectName);
    projectElement.appendChild(managerName);
    projectElement.appendChild(startDate);
    projectElement.appendChild(viewButton);

    return projectElement;
}

const displayProjects = function() {

    // Clear the project container
    projectContainer.innerHTML = '';

    // Loop through each project
    projects.forEach((project) => {

        // Create project element
        const projectElement = createProjectElement(project);
        projectContainer.appendChild(projectElement);
    })
}

const getProjects = function() {
    return new Promise((resolve, reject) => {
        const apiUrl = `/projects`;
        $.ajax({
            url: apiUrl,
            method: 'GET',
            success: function(response) {
                resolve(response);
            },
            error: function(jqXHR, textStatus, errorThrown) {
                if (jqXHR.status >= 400 && jqXHR.status < 500) {
                    reject(new Error(`Client Side Error! status: ${jqXHR.status}`));
                }
                else if (jqXHR.status >= 500 && jqXHR.status < 600) {
                    reject(new Error(`Server Side Error! status: ${jqXHR.status}`));
                }
                else {
                    reject(new Error(`Error! status: ${jqXHR.status} - ${textStatus}: ${errorThrown}`));
                }
            }
        }); 
    });
}

const populateProjects = async function() {

    // Get projects from database and push each project to the projects array
    Object.values(await getProjects
        ()).forEach((value) => {
        projects.push(value);
    });

    displayProjects();
}

populateProjects();