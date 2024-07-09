// // routes.js
// const express = require("express");
// const router = express.Router();
// const path = require("path");
// const 
// // const {
// //   CreateProjectRoute,
// //   updateProjectRoute,
// //   AddImagesToProjectRoute,
// //   getProjectRoute,
// //   getProjectsRoute,
// //   deleteImageFromProjectRoute,
// //   deleteProjectRoute,
// //   getPhotos,
// // } = require("./controllers"); // Adjust the import to match your controllers' file location

// // Serve static files from the "public" directory
// router.use(express.static(path.join(__dirname, "public")));

// // Routes for pages
// router.get("/", (req, res) => {
//   res.redirect("/list");
// });

// router.get("/projects/new", (req, res) => {
//   res.sendFile(path.join(__dirname, "public", "NewProject", "index.html"));
// });

// router.get("/list", (req, res) => {
//   res.sendFile(path.join(__dirname, "public", "ViewProjects", "index.html"));
// });

// router.get("/projects/edit/:Project_Id", async (req, res) => {
//   const Project_id = req.params.Project_Id;

//   const projects = await readJsonFile(databasePath);

//   if (!projects[Project_id]) res.status(404).send("404: Project not found");
//   else
//     res.sendFile(path.join(__dirname, "public", "EditProject", "index.html"));
// });

// // Routes for assignment
// router.post("/projects", CreateProjectRoute);
// router.put("/projects/:Project_id", updateProjectRoute);
// router.post("/projects/:Project_id/images", AddImagesToProjectRoute);
// router.get("/projects/:Project_id", getProjectRoute);
// router.get("/projects", getProjectsRoute);
// router.delete(
//   "/projects/:Project_id/images/:Image_id",
//   deleteImageFromProjectRoute
// );
// router.delete("/projects/:Project_id", deleteProjectRoute);

// // Route for getting photos
// router.get("/photos/:query/:page", getPhotos);

// module.exports = router;
