/**
 * Quesstions for miriam:
 * - timestamp not in miliseconds right?
 *      - yes, but make sure the routes accept ONLY timestamps, NO DATE STRINGS
 *
 * - is axios ok for requests on server side?
 *      - yes
 *
 * - does npm start need to install the dependencies as well?
 *      - no, npm install is done automatically before npm start
 *
 * - how to submit the assignment? will zipping without the modules work?
 *      - yes, do not zip the modules
 *
 * - We need to submit projects.json as well. is there anything we need to put in there?
 *      - its not projects.json, its the package.json
 *
 * - what to submit in the הגשת עבודות באתר?
 *      - the zip file of the project, no modules
 *
 * - how to include second participant?
 *      - add id of the second participant in תחנת מידע
 */

/** TODO:
 * - add sorting to projects
 * - add validation for the date, ONLY TIMESTAMPS
 *      - Note: timestamp will arrive as a string in the json, must check that it is a timestamp
 */

const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const axios = require("axios");
const fs = require("fs");
require("dotenv").config();

// Get validator class
const Validator = require("./utils/validator");

const validator = new Validator();

// get utils:
generateUniqueKey = require("./utils/keyGenerator");

// starting express app
const app = express();

// defining port
const PORT = 3001;

// constant variables
const databasePath = "./projects.json";
const client_id = process.env.UNSPLASH_API_KEY; // Unsplash API client ID

// Middleware
app.use(bodyParser.json()); // Parse JSON bodies
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, "public")));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

// Functions for reading and writing to the json database
function readJsonFile(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) {
        reject(err);
      } else {
        // If there is no data, create an empty object
        if (!data) data = "{}";

        // Parse the JSON data
        const currentDatabase = JSON.parse(data);
        resolve(currentDatabase);
      }
    });
  });
}

function writeJsonFile(filePath, data) {
  return new Promise((resolve, reject) => {
    const jsonData = JSON.stringify(data, null, 2);
    fs.writeFile(filePath, jsonData, "utf8", (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

// Function for project
async function insertProject(project) {
  var projects = await readJsonFile(databasePath);

  const newProjectId = generateUniqueKey();

  project["id"] = newProjectId;

  projects[newProjectId] = project;

  projects[newProjectId]["images"] = [];

  await writeJsonFile(databasePath, projects);
  return newProjectId;
}

// Assignment functions:
async function CreateProjectInDatabase(projectDetails) {
  try {
    const id = await insertProject(projectDetails);
    return {
      status: 200,
      message: "Project received successfully",
      id: id,
    };
  } catch (error) {
    return {
      status: 500,
      message: "Failed to insert project",
    };
  }
}

function deepEqual(obj1, obj2) {
  if (obj1 === obj2) return true;

  if (
    obj1 == null ||
    typeof obj1 !== "object" ||
    obj2 == null ||
    typeof obj2 !== "object"
  ) {
    return false;
  }

  let keys1 = Object.keys(obj1);
  let keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) return false;

  for (let key of keys1) {
    if (!keys2.includes(key) || !deepEqual(obj1[key], obj2[key])) {
      return false;
    }
  }

  return true;
}

function compareArrays(arr1, arr2) {
  if (arr1.length !== arr2.length) return false;

  for (let i = 0; i < arr1.length; i++) {
    if (!deepEqual(arr1[i], arr2[i])) {
      return false;
    }
  }

  return true;
}

// Route functions for project
async function CreateProjectRoute(req, res) {
  const newProjectObject = req.body;

  if (!validator.validateNewProject(newProjectObject)) {
    res.status(400).send("Bad request");
  } else {
    const result = await CreateProjectInDatabase(newProjectObject);

    res.json(result);
  }
}

async function updateProject(projectDetails, id) {
  const projects = await readJsonFile(databasePath);

  const project = projects[id];

  if (!project) {
    return {
      status: 404,
      message: "Project not found",
    };
  }

  if (!validator.validateUpdateProject(projectDetails)) {
    return {
      status: 400,
      message: "Bad request",
    };
  }

  if (projectDetails.name) project.name = projectDetails.name;

  if (projectDetails.description)
    project.description = projectDetails.description;

  if (projectDetails.manager) {
    if (projectDetails.manager.name)
      project.manager.name = projectDetails.manager.name;

    if (projectDetails.manager.email)
      project.manager.email = projectDetails.manager.email;
  }

  if (projectDetails.team)
    if (!compareArrays(projectDetails.team, project.team))
      project.team = projectDetails.team;

  if (projectDetails.start_date) project.start_date = projectDetails.start_date;

  projects[id] = project;

  await writeJsonFile(databasePath, projects);

  return {
    status: 200,
    message: "Project updated successfully",
  };
}

async function updateProjectRoute(req, res) {
  // Function to update project details

  const projectDetails = req.body;

  const { Project_id } = req.params;

  var result;

  try {
    result = await updateProject(projectDetails, Project_id);
  } catch (err) {
    console.log(err);
    result = {
      status: 500,
      message: "Update Project: Internal server error",
    };
  }

  res.status(result.status).send(result.message);
}

async function AddImageToProject(ImageDetails, Project_id) {
  const projects = await readJsonFile(databasePath);

  const project = projects[Project_id];

  if (!project) {
    return {
      status: 404,
      message: "Project not found",
    };
  }

  if (!validator.validateImage(ImageDetails)) {
    return {
      status: 400,
      message: "Bad request",
    };
  }

  const image = project.images.find((image) => image.id == ImageDetails.id);

  if (image) {
    return {
      status: 400,
      message: "Bad request",
    };
  }

  projects[Project_id].images.push(ImageDetails);

  await writeJsonFile(databasePath, projects);

  return {
    status: 200,
    message: {
      message: "Image added successfully",
      id: ImageDetails.id,
    },
  };
}

async function AddImagesToProjectRoute(req, res) {
  // Function to add images to a project
  // To be implemented

  const imageInfo = req.body;

  const { Project_id } = req.params;

  var result;

  try {
    result = await AddImageToProject(imageInfo, Project_id);
  } catch (err) {
    result = {
      status: 500,
      message: "Update Project: Internal server error",
    };
  }

  res.status(result.status).send(result.message);
}

async function getProject(id_project) {
  const projects = await readJsonFile(databasePath);

  const project = projects[id_project];

  return project;
}

async function getProjectRoute(req, res) {
  // Function to get details of a specific project

  const projectId = req.params.Project_id;

  const project = await getProject(projectId);

  if (!project) res.status(404).send("Project not found");
  else res.send(project);
}

// Function for assignment
async function getProjects() {
  const projects = await readJsonFile(databasePath);
  return projects;
}

async function getProjectsRoute(req, res) {
  try {
    const projects = await getProjects();
    res.status(200).json(projects);
  } catch (err) {
    res.status(500).send("Get Projects: Internal server error");
  }
}

async function deleteImageFromProject(Project_id, ImageId) {
  const projects = await readJsonFile(databasePath);

  const project = projects[Project_id];

  if (!project) {
    return {
      status: 404,
      message: "Project not found",
    };
  }

  const imageIndex = project.images.findIndex((image) => image.id === ImageId);

  if (imageIndex == -1) {
    return {
      status: 404,
      message: "Image not found",
    };
  }

  // remove the photo
  projects[Project_id].images.splice(imageIndex, 1);

  await writeJsonFile(databasePath, projects);

  return {
    status: 200,
    message: "Image deleted successfully",
  };
}

//:Project_id/images/:ImageId
async function deleteImageFromProjectRoute(req, res) {
  // Function to delete an image from a project

  const { Project_id, Image_id } = req.params;

  var result;

  try {
    result = await deleteImageFromProject(Project_id, Image_id);
  } catch (err) {
    result = {
      status: 500,
      message: "Delete Image from Project: Internal server error",
    };
  }

  res.status(result.status).send(result.message);
}

async function deleteProject(Project_id) {
  const projects = await readJsonFile(databasePath);

  const project = projects[Project_id];

  if (!project) {
    return {
      status: 404,
      message: "Project not found",
    };
  }

  // remove the project
  delete projects[Project_id];

  await writeJsonFile(databasePath, projects);

  return {
    status: 200,
    message: "Project deleted successfully",
  };
}

async function deleteProjectRoute(req, res) {
  // Function to delete a project
  const project_id = req.params.Project_id;

  var result;

  try {
    result = await deleteProject(project_id);
  } catch (err) {
    result = { status: 500, message: "Delete Project: Internal server error" };
  }

  res.status(result.status).send(result.message);
}

const getPhotos = async function (req, res) {
  const { query, page } = req.params;

  await getPhotosFromUnsplash(query, client_id, page)
    .then((response) => {
      res.status(200).json(response);
    })
    .catch((error) => {
      res.status(500).json(error);
    });
};

const getPhotosFromUnsplash = async function (
  query_string,
  client_id,
  currentPage
) {
  return new Promise((resolve, reject) => {
    const apiUrl =
      "https://api.unsplash.com/search/photos?query=" +
      query_string +
      "&client_id=" +
      client_id +
      "&per_page=20&page=" +
      currentPage;

    axios
      .get(apiUrl)
      .then((response) => {
        resolve(response.data);
      })
      .catch((error) => {
        if (error.response) {
          if (error.response.status >= 400 && error.response.status < 500) {
            reject(
              new Error(`Client Side Error! status: ${error.response.status}`)
            );
          } else if (
            error.response.status >= 500 &&
            error.response.status < 600
          ) {
            reject(
              new Error(`Server Side Error! status: ${error.response.status}`)
            );
          } else {
            reject(new Error(`Error! status: ${error.response.status}`));
          }
        } else {
          reject(new Error(`Error! ${error.message}`));
        }
      });
  });
};

app.get("/projects/edit/:Project_Id", async (req, res) => {
  const Project_id = req.params.Project_Id;

  const projects = await readJsonFile(databasePath);

  if (!projects[Project_id]) res.status(404).send("404: Project not found");
  else
    res.sendFile(path.join(__dirname, "public", "EditProject", "index.html"));
});

// get routes for displaying the pages
app.get("/projects/new", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "NewProject", "index.html"));
});

app.get("/list", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "ViewProjects", "index.html"));
});

// Routes for assignment
app.post("/projects", CreateProjectRoute);
app.put("/projects/:Project_id", updateProjectRoute);
app.post("/projects/:Project_id/images", AddImagesToProjectRoute);
app.get("/projects/:Project_id", getProjectRoute);
app.get("/projects", getProjectsRoute);
app.delete(
  "/projects/:Project_id/images/:Image_id",
  deleteImageFromProjectRoute
);
app.delete("/projects/:Project_id", deleteProjectRoute);

// Route for getting photos
app.get("/photos/:query/:page", getPhotos);

// Start the server**
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
