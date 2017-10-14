let config = require('../data/config.json');
let table = require('../data/plan.json');
let sprints = require('../data/sprints.json');

let styles = require('../styles/base.scss');

import Parse from './Parse.js';
import Aggregates from './aggregates.js';
import Plan from './Plan.js';
import Chart from 'chart.js';
import Team from './team.js';
import Reports from './reports.js';
import Dashboard from './dashboard.js';
import Actions from './actions.js';

// Fetches content
const init = () => {

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

  const getContent = url => fetch(url)
    .then(res => res.json())
    .then(response => {
      return response;
    });

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

};


// Initialize the app
init();
