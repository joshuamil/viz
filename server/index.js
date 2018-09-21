const username = process.env.icgJiraUser;
const password = process.env.icgJiraPass;
const fetch = require('node-fetch');
const fs = require('fs');

const express = require('express');
const app = express();
const port = 3000;

const bodyParser = require('body-parser');
const urlencodedParser = bodyParser.urlencoded({ extended: true });

// Enable GET Route
app.post('/', urlencodedParser, (req, res) => {
  const data = action(req.body)
    .then( (data) => {
      res.send(data);
    });
});

// Listen for connections on the configured port
app.listen(port, () => console.log(`Server listening on port ${port}!`));

// Retrieve the requested file
const action = (params) => {

  const location = params.location;
  const project = params.project;
  const types = params.types;
  const mode = params.mode;

  let url = `https://${location}/rest/api/2/search?jql=project%20%3D%20${project}%20and%20status%20!%3D%20resolved%20and%20type%20in%20(${types})%20order%20by%20rank%20&maxResults=1000&startAt=0`;

  return fetch(url,
    {
      headers: {
        "Authorization": "Basic " + new Buffer.from(username + ":" + password).toString("base64")
      }
    })
      .then( (response) => {
        return response.json();
      })
      .then( (json) => {

        return json;

        /* Cache file locally */
        fs.writeFile("../dist/jira.json", JSON.stringify(json), function(err) {
          if(err) {
            console.log("JIRA content failed to load!");
            console.log(err);
            return false;
          }
          console.log("JIRA content has been updated.");
        });


      });

}
