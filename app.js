/**
 * Quesstions for miriam:
 * - How to operate the tester
 * - do i need to hide the unsplash api key?
 * - in the function createProject, what does it mean return status? return an integer?
 * - does getProject display the page or does it get the details for all projects? ?
 */

const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const axios = require('axios');
const fs = require('fs');
require('dotenv').config();

// get utils:
generateUniqueKey = require('./utils/keyGenerator');

// starting express app
const app = express();

// defining port
const PORT = 3001;

// constant variables
const databasePath = './projects.json';
const client_id = process.env.UNSPLASH_API_KEY;  // Unsplash API client ID

// Middleware
app.use(bodyParser.json()); // Parse JSON bodies
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Error handling middleware
app.use((err, req, res, next) => {  
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Functions for reading and writing to the json database
function readJsonFile(filePath) {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                reject(err);
            } else {
                // If there is no data, create an empty object
                if (!data)
                    data = '{}';
                
                // Parse the JSON data
                const currentDatabase = JSON.parse(data)
                resolve(currentDatabase);
            }
        });
    });
}

function writeJsonFile(filePath, data) {
    return new Promise((resolve, reject) => {
        const jsonData = JSON.stringify(data, null, 2);
        fs.writeFile(filePath, jsonData, 'utf8', (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

// Function for project
async function insertProject (project) {
    var projects = await readJsonFile(databasePath);

    const newProjectId = generateUniqueKey();

    project['id'] = newProjectId;

    projects[newProjectId] = project;

    await writeJsonFile(databasePath, projects);
}

// Assignment functions:
async function CreateProject(projectDetails) {

    // TODO: validate the newProjectObject


    try {
        await insertProject(projectDetails)
        return ({
            status: 200,
            message: 'Project received successfully',
            project: projectDetails
        })
    } catch (error) {
        console.log('Failed to insert project', error);
        return ({
            status: 500,
            message: 'Failed to insert project'
        })
        
    }
}

// Route functions for project
async function CreateProjectRoute(req,res) {

    const newProjectObject = req.body;

    const result = await CreateProject(newProjectObject);

    res.status(result.status).json(result);
}

function updateProject(req, res) {
    // Function to update project details
    // To be implemented
    res.send('Update Project: Not yet implemented');
}

function AddImagesToProject(req, res) {
    // Function to add images to a project
    // To be implemented
    res.send('Add Images to Project: Not yet implemented');
}

function getProject(req, res) {
    // Function to get details of a specific project
    // To be implemented
    res.send('Get Project: Not yet implemented');
}

async function getProjects(req, res) {
    // Function to get all projects
    const projects = await readJsonFile(databasePath);
    res.status(200).json(projects);
}

function deleteImageFromProject(req, res) {
    // Function to delete an image from a project
    // To be implemented
    res.send('Delete Image from Project: Not yet implemented');
}

function deleteProject(req, res) {
    // Function to delete a project
    // To be implemented
    res.send('Delete Project: Not yet implemented');
}


const getPhotos = async function(req,res) {

    const {query, page} = req.params;

    await getPhotosFromUnsplash(query, client_id, page).then(response => {
        res.status(200).json(response);  
    }).catch(error => {
        console.log(error);
        res.status(500).json(error);
    })
}

const getPhotosFromUnsplash = async function(query_string, client_id, currentPage) {
    return new Promise((resolve, reject) => {
        const apiUrl = 
            "https://api.unsplash.com/search/photos?query="
            + query_string
            + "&client_id="
            + client_id
            + "&per_page=20&page=" 
            + currentPage;

        axios.get(apiUrl)
            .then(response => {
                resolve(response.data);
            })
            .catch(error => {
                if (error.response) {
                    if (error.response.status >= 400 && error.response.status < 500) {
                        reject(new Error(`Client Side Error! status: ${error.response.status}`));
                    } else if (error.response.status >= 500 && error.response.status < 600) {
                        reject(new Error(`Server Side Error! status: ${error.response.status}`));
                    } else {
                        reject(new Error(`Error! status: ${error.response.status}`));
                    }
                } else {
                    reject(new Error(`Error! ${error.message}`));
                }
            });
    });
}

// get routes for displaying the pages
app.get('/project/new',(req,res) => {
    res.sendFile(path.join(__dirname, 'public' ,'NewProject' ,'index.html'));
});

app.get('/projects/view', (req,res) => {
    res.sendFile(path.join(__dirname, 'public', 'ViewProjects', 'index.html'));
})

// Routes for assignment
app.post('/project', CreateProjectRoute);
app.put('/project/:Project_id', updateProject);
app.post('/project/:Project_id/images', AddImagesToProject);
app.get('/project/:Project_id', getProject);
app.get('/projects', getProjects);
app.delete('/project/:Project_id/image/:ImageId', deleteImageFromProject);
app.delete('/project/:Project_id', deleteProject);

// Route for getting photos
app.get('/photos/:query/:page', getPhotos);

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
