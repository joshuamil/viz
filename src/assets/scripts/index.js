let parse = require('./parse.js');
let agg = require('./aggregates.js');
let plan = require('./plan.js');
let actions = require('./actions.js');
let charts = require('./charts.js');
let dashboard = require('./dashboard.js');
let team = require('./team.js');

let config = require('../data/config.json');
let table = require('../data/plan.json');
let sprints = require('../data/sprints.json');

let styles = require('../styles/base.scss');

import Chart from 'chart.js';

// Fetches content
const init = () => {

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
      let aggregates = agg.parseAggregates(data, sprints, config);

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
      charts.renderCharts(aggregates);

      // Render Teams
      team.renderTeams();

  });

};


// Initialize the app
init();
