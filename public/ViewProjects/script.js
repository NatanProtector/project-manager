// For images
const logDisplay = document.getElementsByClassName("display-txt")[0];  // Log display element
const selectedImage = document.getElementsByClassName("selected-img")[0];  // Selected image element
const imgContainer = document.querySelector('.img-container');  // Image container
const imageToDisplay = document.createElement('img');  // Image element to display
imageToDisplay.classList.add("selected-img");  // Add class to image
const gridContainer = document.querySelector('.grid-container');  // Grid container element
const photoSearchField = document.getElementById('txtinput');  // Text field element

var currentSearchWord = "";  // Current search word
var currentPage = 0;  // Current page number
var total_pages = 0;  // Total number of pages

const nextButton = document.querySelector('.button-next');  // Next button
const backButton = document.querySelector('.button-back');  // Back button
const selectButton = document.getElementById('select-button');  // Select button

// Data for image selection
var currentlySelectedGridItem = null;  // Currently selected grid item
var currentlySelectedImageInfo = null;  // Currently selected image

const addPhotosPopup = document.getElementById('add-photos-popup');

// Project container
const projectContainer = document.querySelector('.project-container');
// List of projects
var projects = [];

selectedProject = null;

// ===== Functions for adding image =================================================================================================

// Function to clear images
const clearImages = function() {
    currentSearchWord = '';
    currentPage = 0;
    total_pages = 0;
    imgContainer.innerHTML = '';
    handleDisplayForInput(currentSearchWord)
    selectedImages.clear();
    photoSearchField.value = '';
}

const reset = function() {
    unselectImage();
    imgContainer.innerHTML = '';
    currentlySelectedGridItem = null;
    currentlySelectedImageInfo = null;
    logDisplay.innerHTML = '';
    imageToDisplay.src = "";
    currentPage = 0;
    total_pages = 0;
    currentSearchWord = "";
    photoSearchField.value = "";
    removeGridItems();
}

const unselectImage = function() {
    currentlySelectedGridItem = null;
    currentlySelectedImageInfo = null;
}


// Function to send an XMLHttpRequest
const getPhotos = function(query_string) {
    return new Promise((resolve, reject) => {
        const apiUrl = `/photos/${query_string}/${currentPage}`;
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

// Function to get photo information based on a search query
const getPhotoInfo = async function (query_string) {
    const data = await getPhotos(query_string);
    
    var results = [];
    
    data.results.forEach((element) => {
        var name = element.description;
        if (name == null)
            name = "No name";
        results.push({
            url_thumb: element.urls.thumb,
            url_small: element.urls.small,
            description: element.alt_description,           // used as description for form
            description_formName: name,      // Used as name for form
            likes: element.likes,
        });       
    });

    total_pages = data.total_pages;  // Update total pages

    return results;
};

// Function to select a grid item
const selectGridItem = function(gridItem) {

    if (currentlySelectedGridItem) {
        currentlySelectedGridItem.style.backgroundColor = "white";
    }

    color = "yellow"
    gridItem.style.backgroundColor = color;
    currentlySelectedGridItem = gridItem;
}

// Function to display selected item information
const displaySelected = function(toDisplay) {
    logDisplay.textContent = toDisplay;
}

// Function to select and display an image
const selectImage = function(url) {  
    imageToDisplay.src = url;
    imgContainer.appendChild(imageToDisplay);
}

// Function to remove the displayed image
const removeImage = function() {
    const existingImg = imgContainer.querySelector('img');
    if (existingImg) 
        imgContainer.removeChild(existingImg);
}

// Function to create a click handler for an image
const createClickHandlerForImage = function(element, gridItem) {
    return((event) => {
        selectGridItem(gridItem);
        const {description, likes, url_thumb, description_formName } = element;
        const toDisplay = `Description: ${description}\nLikes: ${likes}`;
        currentlySelectedImageInfo = {
            thumb_url: url_thumb,
            name: description_formName,
            description: description
        }
        displaySelected(toDisplay);
        selectImage(url_thumb);
    });
}

// Function to add photos to the grid based on a search term
function addPhotosToGrid(searchTerm) {
    // Get images based on search term.
    getPhotoInfo(searchTerm).then(images => {
        // Loop to insert grid items
        images.forEach((element) => {
            // Create a new grid item element
            const gridItem = document.createElement('div');

            // Create an image element
            const img = document.createElement('img');
            
            // Add url to img
            img.src = element.url_thumb;

            // Add image class
            img.classList.add('image');

            // Add the image to the grid item
            gridItem.appendChild(img);

            // Add a click listener to the image
            gridItem.addEventListener("click", 
                createClickHandlerForImage(element, gridItem)
            );

            // Add class to the grid item
            gridItem.classList.add('grid-item');

            // Append the grid item to the grid container
            gridContainer.appendChild(gridItem);
        });
    })
    .catch(error => {
        console.log(error);
    });
}

// Function to remove all items from the grid
function removeGridItems() {
    
    // Get the grid container element
    var gridContainer = document.querySelector('.grid-container');

    // Get all elements with the class 'grid-item' within the grid container
    var gridItems = gridContainer.querySelectorAll('.grid-item');

    // Loop through each grid item and remove it
    gridItems.forEach((gridItem) => {
        gridItem.parentNode.removeChild(gridItem);
    });
}

// Function to handle the next button click
const nextClicked = function(event) {
    if (currentPage < total_pages) {
        currentPage++;
        handleDisplayForInput(currentSearchWord);
        unselectImage()
    }
}

// Function to handle the back button click
const backClicked = function(event) {
    if (currentPage > 1) {
        currentPage--;
        handleDisplayForInput(currentSearchWord);
        unselectImage()
    }
}

// Function to handle display for a given input value
const handleDisplayForInput = function(val) {

    // Updating global for current search word
    currentSearchWord = val;

    // Get text length
    var textLength = val.length;

    // Remove previous items from grid
    removeGridItems();

    // Remove text from display paragraph:
    displaySelected("");

    // Remove the selected image
    removeImage();

    // Display photos only if the search word length is 3 or higher.
    if (textLength >= 3)
        addPhotosToGrid(val);
    else {
        currentPage = 0;
        unselectImage()
    }
}


// Select photo
const selectClicked = function(event) {
    if (currentlySelectedGridItem != null) {
        currentlySelectedGridItem = event.target;

        // TODO Add photo to project
        console.log(currentlySelectedImageInfo);

        closeAddImages();



    }
}

const HandleTextInput = function (event) {
    currentPage = 1;
    handleDisplayForInput(event.target.value);
}

const closeAddImages = function() {
    addPhotosPopup.style.display = 'none';
    reset();
}

const openAddImages = function() {
    var addPhotos = document.getElementById('add-photos-popup');
    addPhotos.style.display = 'flex';
}

// ===== Event Listeners ======================================================================================================

const closeProjectPopup = function() {
    var projectPopup = document.getElementById('Project-Popup');
    projectPopup.style.display = 'none';
    selectedProject = null;
}

// Add event listener to the button
photoSearchField.addEventListener('input', HandleTextInput);  // Add input event listener

nextButton.addEventListener('click', nextClicked);  // Add click event listener to next button

backButton.addEventListener('click', backClicked);  // Add click event listener to back button

selectButton.addEventListener('click', selectClicked); // Add click event listener to select button

document.getElementById('close-add-photos-button').addEventListener('click', closeAddImages); // Add click event listener to close button

document.getElementById('close-project-button').addEventListener('click', closeProjectPopup); // Add click event listener to close button

document.getElementById('add-photos-button').addEventListener('click', openAddImages);
// ===== Functions for projects ================================================================================================================

const createProjectElement = function(project) {

    // Create project element
    const projectElement = document.createElement('div');
    projectElement.className = 'project';

    // Create project labels
    const projectId = document.createElement('label');
    projectId.className = 'project-id';
    projectId.textContent = `Id: ${project.id}`;

    const projectName = document.createElement('label');
    projectName.className = 'project-name';
    projectName.textContent = `Name: ${project.name}`;

    const managerName = document.createElement('label');
    managerName.className = 'manager-name';
    managerName.textContent = `Manager: ${project.manager.name}`;
    

    const startDate = document.createElement('label');
    startDate.className = 'start-date';
    startDate.textContent = `Start date: ${project.start_date}`;


    const description = document.createElement('P');
    description.className = 'description';
    description.textContent = `Summary: ${project.summary}`;
    description.style.display = "block"

    // Create project view button
    const viewButton = document.createElement('button');
    viewButton.className = 'view-button';
    viewButton.textContent = 'View';
    viewButton.style.display = "block"

    // Add open project popup event listener
    viewButton.addEventListener('click', () => {
        var projectPopup = document.getElementById('Project-Popup');
        projectPopup.style.display = 'flex';
    });

    // Append the project elements to the project container
    projectElement.appendChild(projectId);
    projectElement.appendChild(projectName);
    projectElement.appendChild(managerName);
    projectElement.appendChild(startDate);
    projectElement.appendChild(description);
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
    Object.values(await getProjects()).forEach((value) => {
        projects.push(value);
    });

    displayProjects();
}

populateProjects();