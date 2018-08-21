let config = require('../data/config.json');
let table = require('../data/plan.json');

let styles = require('../styles/base.scss');

import Authentication from './Authentication.js';
import Parser from './Parser.js';
import Aggregates from './Aggregates.js';
import Plan from './Plan.js';
import Team from './Team.js';
import Reports from './Reports.js';
import Dashboard from './Dashboard.js';
import Actions from './Actions.js';
import Sprints from './Sprint.js';

// Fetches content
const init = () => {

  const auth = new Authentication();
  const parse = new Parser();
  const aggregate = new Aggregates();
  const plan = new Plan();
  const team = new Team();
  const reports = new Reports();
  const dashboard = new Dashboard();
  const actions = new Actions();
  const sprints = new Sprints();

  const resources = [
    config.cache
  ];

  // Ensure authentication token exists
  if (!localStorage.hasOwnProperty('VIZ_AUTH_TOKEN')) {

    // TODO: Create authentication routine
    localStorage
      .setItem('VIZ_AUTH_TOKEN', { token: 'Basic KOJDRGhqXSca1H3mT52uBV3zv6ihX0hm' });

  } else {

    // Retrieve content from server
    const getContent = url => fetch(url)
      .then(res => res.json())
      .then(response => {
        return response;
      });

    // Use content, parse data and render
    Promise
      .all(resources.map(getContent))
      .then( results => {

        /* Build Data Objects */
        const stories = results[0];
        const sprintData = sprints.createSprints();

          // Append Sprint Data to Configuration
          const settings = parse.appendSprints(table, sprintData);

          // Parse Story Data
          const data = parse.parseData(stories);

          // Build Aggregate Data
          const aggregates = aggregate.parseAggregates(data, sprintData, config);


        /* Render the Dashboard */
        dashboard.setValues(aggregates);


        /* Render the Release Plan */

          // Render Header Row
          plan.renderHeader(sprintData, config, aggregates);

          // Render Table
          data.forEach( (task) => {
            plan.renderTable(task, settings, config, aggregates);
          });

          // Render the Aggregate Values
          plan.renderAggregates(aggregates);

          // Assign Actions
          actions.navigation(aggregates.sprint);


        /* Render Charts */
        reports.renderCharts(aggregates);

        /* Render Teams */
        team.renderTeams();

      });

  }

};


// Initialize the app
init();
