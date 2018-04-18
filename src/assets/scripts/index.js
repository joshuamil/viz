let config = require('../data/config.json');
let table = require('../data/plan.json');
let sprints = require('../data/sprints.json');

let styles = require('../styles/base.scss');

import Chart from 'chart.js';
import Authentication from './Authentication.js';
import Parse from './Parse.js';
import Aggregates from './Aggregates.js';
import Plan from './Plan.js';
import Team from './Team.js';
import Reports from './Reports.js';
import Dashboard from './Dashboard.js';
import Actions from './Actions.js';

// Fetches content
const init = () => {

  const auth = new Authentication();
  const parse = new Parse();
  const aggregate = new Aggregates();
  const plan = new Plan();
  const team = new Team();
  const reports = new Reports();
  const dashboard = new Dashboard();
  const actions = new Actions();

  const resources = [
    config.baseUrl
  ];

  // Ensure authentication token exists
  if (!localStorage.hasOwnProperty('VIZ_AUTH_TOKEN')) {

    // TODO: Create authentication routine
    localStorage.setItem('VIZ_AUTH_TOKEN', {
      token: 'Basic KOJDRGhqXSca1H3mT52uBV3zv6ihX0hm'});

  } else {

    // Retrieve content from server
    const getContent = url => fetch(url)
      .then(res => res.json())
      .then(response => {
        return response;
      });

    // Use content, parse data and render
    Promise.all(resources.map(getContent)).then( results => {

        const stories = results[0];

        // Append Sprint Data to Configuration
        let settings = parse.appendSprints(table, sprints);

        // Parse Story Data
        let data = parse.parseData(stories);
        let aggregates = aggregate.parseAggregates(data, sprints, config);

        // Render Header Row
        plan.renderHeader(sprints, config, aggregates);

        // Render Table
        data.forEach( (task) => {
          plan.renderTable(task, settings, config, aggregates);
        });

        // Render the Aggregate Values
        plan.renderAggregates(aggregates);

        // Assign Actions
        actions.navigation(aggregates.sprint);

        // Assign values to dashboard
        dashboard.setValues(aggregates);

        // Render Charts
        reports.renderCharts(aggregates);

        // Render Teams
        team.renderTeams();

    });

  }

};


// Initialize the app
init();
