/**
 * TODO - display selected photos
 */

// Global variables:
const logDisplay = document.getElementsByClassName("display-txt")[0];  // Log display element
const selectedImage = document.getElementsByClassName("selected-img")[0];  // Selected image element
const imgContainer = document.querySelector('.img-container');  // Image container
const imageToDisplay = document.createElement('img');  // Image element to display
const gridContainer = document.querySelector('.grid-container');  // Grid container element
const photoSearchField = document.getElementById('txtinput');  // Text field element

var currentSearchWord = "";  // Current search word
var currentPage = 0;  // Current page number
var total_pages = 0;  // Total number of pages

const nextButton = document.querySelector('.button-next');  // Next button
const backButton = document.querySelector('.button-back');  // Back button
const selectButton = document.getElementById('select-button');  // Select button
const addStaffButton = document.getElementById('add-staff-button');  // Add staff button

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

// Selected staff display
const selectedStaffDisplay = document.querySelector('.selected-staff-display');

// Adding class to image:
imageToDisplay.classList.add("selected-img");  // Add class to image

// Data for image selection
var currentlySelectedGridItem = null;  // Currently selected grid item

var currentlySelectedImageInfo = null;

// Images selected for the new project
var selectedImages = new Map();  // Array of selected images

// Staff for new project
var staffMembers = [];  // Array of staff members

const unselectImage = function() {
    currentlySelectedGridItem = null;
    currentlySelectedImageInfo = null;
}

const isPhotoSelected = function() {
    return currentlySelectedGridItem != null && currentlySelectedImageInfo != null;
}


// Submit button 
const submitButton = document.getElementById('submit-button');

// ---=== Functions ---===---===---===---===---===---===---===---===---===---===---===---===---===---===---===---===---===---===---

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
    clearImages()
    staffMembers = [];
    selectedStaffDisplay.innerHTML = '';
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


    if (isPhotoSelected()) {
        if (selectedImages.has(currentlySelectedImageInfo.thumb_url)) {
            currentlySelectedGridItem.style.backgroundColor = "lightgreen";
        } else {
            currentlySelectedGridItem.style.backgroundColor = "white";
        }
        
    }

    color = "yellow"
    if (gridItem.style.backgroundColor == "lightgreen")
        color = "orange"
    
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

            if (selectedImages.has(element.url_small)) {
                gridItem.style.backgroundColor = "lightgreen";
            }

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

// Function to retrieve input from textarea and log it
const HandleTextInput = function (event) {
    currentPage = 1;
    handleDisplayForInput(event.target.value);
}


// Function to handle click events:

// Select photo
const selectClicked = function(event) {
    if (isPhotoSelected()) {
        if (selectedImages.has(currentlySelectedImageInfo.thumb_url)) {
            selectedImages.delete(currentlySelectedImageInfo.thumb_url);
            currentlySelectedGridItem.style.backgroundColor = "yellow";
        } else {
            selectedImages.set(
                currentlySelectedImageInfo.thumb_url,
                currentlySelectedImageInfo
            );
            currentlySelectedGridItem.style.backgroundColor = "orange";
        }
    }
}

// Validate staff info
const validateStaffInfo = function(name,email,role) {
    console.log("Staff validation not implemented yet");
    return true;
}

// Add staff memeber to project
const addStaffClicked = function(event) {

    const name = staffName.value;
    const email = staffEmail.value;
    const role = staffRole.value;

    if (validateStaffInfo(name,email,role)) {
        
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
}

const submitClicked = function(event) {

    const newProjectObject = {
        name: projectName.value,
        summary: summary.value,
        images: [...selectedImages.values()],
        manager: {
            name: managerName.value,
            email: managerEmail.value
        },
        team: staffMembers,
        start_date: startDate.value
    }

    // Send the new project object to the server
    $.ajax({
        url: '/project',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(newProjectObject),
        success: function(response) {
            clearProjectForm();
            window.location.href = '../projects/view'
        },
        error: function(error) {
            console.log('Error:', error);
        }
    });

}

// ===---===---===---===---===---===---===---===---===---===---===---===---===---===---===---===---===---===---===---===---===---

// Add event listener to the button
photoSearchField.addEventListener('input', HandleTextInput);  // Add input event listener

nextButton.addEventListener('click', nextClicked);  // Add click event listener to next button

backButton.addEventListener('click', backClicked);  // Add click event listener to back button

selectButton.addEventListener('click', selectClicked); // Add click event listener to select button

addStaffButton.addEventListener('click', addStaffClicked); // Add click event listener to add staff button

submitButton.addEventListener('click', submitClicked); // Add click event listener to submit button