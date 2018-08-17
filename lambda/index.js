const username = process.env.icgJiraUser;
const password = process.env.icgJiraPass;
const fetch = require('node-fetch');
const fs = require('fs');


const action = () => {
  
  fetch('https://icg360.atlassian.net/rest/api/2/search?jql=project%20%3D%20IPCM%20and%20status%20!%3D%20resolved%20and%20type%20in%20(story,epic,bug,task)%20order%20by%20rank%20&maxResults=1000&startAt=0',
    {
      headers: {
        "Authorization": "Basic " + new Buffer.from(username + ":" + password).toString("base64")
      }
    })
      .then( (response) => {      
        return response.json();
      })
      .then( (json) => {
        
        fs.writeFile("./dist/jira.json", JSON.stringify(json), function(err) {
          if(err) {
            console.log("JIRA content failed to load!");
            console.log(err);
            return false;
          }
          console.log("JIRA content has been updated.");
        }); 
        
      });
  
}

action();