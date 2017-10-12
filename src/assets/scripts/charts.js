let charts = require('../data/charts.json');
import Chart from 'chart.js';

module.exports = {
  
  /**
   * Return an array of colors matching the correct length 
   *
   */
  getColors(length) {
    const colors = [
      '#ec9998',
      '#ffda5c',
      '#9ec4ea',
      '#b5d8a6',
      '#facc99',
      '#ec9998',
      '#ffda5c',
      '#9ec4ea',
      '#b5d8a6',
      '#facc99',
      '#facc99',
      '#ec9998',
      '#ffda5c',
      '#9ec4ea',
      '#b5d8a6',
      '#facc99'
    ];
    return colors.slice(0,length);
  },
  
  
  /**
   * Returns data for Sprint aggregates
   *
   */
  sprintData(config, aggregates) {
    
    const datasets = [];
    const data = [];
    const subs = aggregates.subtotals;
    const context = config.name;
    
    const currentSprint = parseInt(aggregates.sprint, 10);
    
    let options = {};
    let series = [];
    let labels = [];
    let colors;
    let sprint;
    
    // Create a container to hold the chart
    this.createChartContainer(context);
    
    // Create data arrays
    config.datasets.forEach( (ds) => {
      series = [];
      labels = [];
      for (let key in subs) {
        sprint = subs[key];
        if (sprint && sprint.hasOwnProperty(ds.value)) {
          if (parseInt(sprint.sprint, 10) <= currentSprint) {            
            series.push(sprint[ds.value]);
            labels.push(`Sprint ${sprint.sprint}`);
          }
        }
      }
      data.push(series);
    });
    
    // Create chart datasets
    config.datasets.forEach( (ds, idx) => {
      if (ds.colors && ds.colors !== 'dynamic') {
        colors = ds.colors;
      } else {
        colors = this.getColors(data[idx].length);
      }
      datasets.push({
        label: ds.label,
        data: data[idx],
        backgroundColor: colors,
        borderWidth: 1,
        stack: ds.stack || ''
      });
    });
    
    if (data && data.length > 0) {
      options = {
        type: config.type,
        options: {
          legend: {
            position: 'bottom'
          },
          title: {
            display: true,
            text: config.title,
            fontSize: 18,
            fontColor: 'white'
          },
          responsive: true
        },
        data: {
          labels: labels,
          datasets: datasets
        }
      };
      
      // Enable stacking
      if (config.stacked) {
        options.options.scales = {
          xAxes: [{
            stacked: true
          }],
          yAxes: [{
            stacked: true
          }]
        };
      }
      
      let ctx = document.querySelector(`#${context}`);           
      let thisChart = new Chart(ctx, options);
    }
  },
  
  
  /**
   *
   *
   */
  createChartContainer(chart) {  
    const canvas = document.createElement('canvas');
          canvas.setAttribute('id', chart);
          canvas.setAttribute('width', '400');
          canvas.setAttribute('height', '400');
    const div = document.createElement('div');
          div.setAttribute('class', 'chart-box');
          div.appendChild(canvas);
    const target = document.querySelector('#charts');  
          target.appendChild(div);
  },
  
  
  /**
   *
   *
   */
  renderCharts(aggregates) {
    charts.forEach( (chart) => {
      this.sprintData(chart, aggregates);
    });
  }
  
};