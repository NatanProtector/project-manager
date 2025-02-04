const validator = require('validator');

const isInteger= function(str) {
    if (typeof str !== 'string') {
      return false; // If not a string, return false
    }
  
    const num = Number(str);
    return Number.isInteger(num) && str.trim() !== '';
}

module.exports = class Validator {

    constructor() {

    }
    
    validateNewProject(projectDetails) {
    
        if (!projectDetails.name || !projectDetails.summary || !projectDetails.manager || !projectDetails.start_date) {
            return false;
        }

        if (!projectDetails.manager.name || !projectDetails.manager.email) {
            return false;
        }

        if (!validator.isEmail(projectDetails.manager.email)) {
            return false;
        }

        if (projectDetails.summary.length < 20 || projectDetails.summary.length > 80) {
            return false;
        }

        if (isInteger(projectDetails.start_date) == false) {
            console.log("test");
            return false;
        }

        return true;

    } 

    validateUpdateProject(projectDetails) {

        if (projectDetails.name != undefined) {
            if (projectDetails.name == "")
                return false;
        }

        if (projectDetails.summary != undefined) {
            if (projectDetails.summary.length < 20 || projectDetails.summary.length > 80)
                return false;
        }
        
        if (projectDetails.manager != undefined) {
            if (projectDetails.manager.name == undefined )
                if (projectDetails.manager.name == "")
                    return false;

            if (!projectDetails.manager.email == undefined)
                if (projectDetails.manager.email == "")
                    return false;

            if (!validator.isEmail(projectDetails.manager.email))
                return false;
        }

        if (projectDetails.team != undefined) {

            if (!Array.isArray(projectDetails.team))
                return false;

            projectDetails.team.forEach((member) => {

                if (!member.email || !member.name || member.role) {
                    return false;
                }

                if (!validator.isEmail(member.email))
                    return false;

            });
        }

        if (projectDetails.start_date != undefined) {
            if (isInteger(projectDetails.start_date) == false) {
                return false;
            }
        }

        return true;

    }


    validateImage(imageDetails) {

        if (!imageDetails.id || !imageDetails.thumb || !imageDetails.description) {
            return false;
        }
        return true;
    }

}