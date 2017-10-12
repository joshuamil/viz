let utils = require('./utils.js');
let agg = require('./aggregates.js');
let render = require('./render.js');
let actions = require('./actions.js');
let charts = require('./charts.js');
let dashboard = require('./dashboard.js');

let config = require('../data/config.json');
let table = require('../data/table.json');
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
      let settings = utils.appendSprints(table, sprints);
      
      // Parse Story Data
      let data = utils.parseData(stories);
      let aggregates = agg.parseAggregates(data, sprints, config);
      
      // Render Header Row
      render.renderHeader(sprints, config, aggregates);
      
      // Render Table
      data.forEach( (task) => {
        render.renderTable(task, settings, config, aggregates);
      });
      
      // Render the Aggregate Values
      render.renderAggregates(aggregates);
      
      // Assign Actions
      actions.navigation(aggregates.sprint);
      
      // Assign values to dashboard
      dashboard.setValues(aggregates);
      
      // Render Charts
      charts.renderCharts(aggregates);
      
  });
  
};


// Initialize the app
init();