// Get the full URL as a string
const fullUrl = window.location.href;

// Split the URL by '/' and get the last section
const urlSegments = fullUrl.split('/');
const ProjectId = urlSegments[urlSegments.length - 1];

const getProjectInfo = function() {
    return new Promise((resolve, reject) => {
        const apiUrl = `/project/${ProjectId}`;
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


const displayProjectInfo = async function(project) {
    const projectInfo = await getProjectInfo()
    console.log( projectInfo );
}

displayProjectInfo();