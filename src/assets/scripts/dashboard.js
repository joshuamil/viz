'use strict';

import Sprints from './Sprint.js';

let tiles = require('../data/dashboard.json');

const numeral = require('numeral');
const moment = require('moment');

/**
 * Dashboard Class
 * Defines data and UI elements related to the Dashboard tab in the application
 *
 */
export default class Dashboard {

  constructor() {
    const sprints = new Sprints();
    this.sprintData = sprints.createSprints();
  }

  /**
   * Extract data from the aggregates element based on path
   * @param path String
   * @param aggregates Object
   */
  getDataFromPath(path, aggregates) {
    // let value = '';
    let source = aggregates;
    let obj;
    const tree = path.split('.');
    tree.forEach( (limb, idx) => {
      try{
        if (idx > 0) {
          source = obj;
        }
        obj = source[limb];
      }
      catch(e) {
        console.log(`${path} failed at: ${limb}`);
        console.log(e);
      }
    });
    return obj;
  }


  /**
   * Return a status from the defined value ranges in the Dashboard config
   * @param aggregates Object
   */
  getDaysRemaining(aggregates) {
    const currentSprint = aggregates.sprint;
    const currentPhase = aggregates.phase;
    let lastDate = moment().format();
    this.sprintData.forEach( (sprint) => {
      if (sprint.class.indexOf('current') > -1) {
        aggregates.daysInSprint = moment(sprint.endDate, 'MM/DD/YYYY').diff(moment(), 'days');
      }
      if (parseInt(sprint.phase, 10) === currentPhase) {
        lastDate = sprint.endDate;
      }
    });

    aggregates.daysInPhase = moment(lastDate, 'MM/DD/YYYY').diff(moment(), 'days');

    return aggregates;
  }


  /**
   * Return a status from the defined value ranges in the Dashboard config
   * @param value String
   * @param title String
   */
  getStatusFromValue(value, tile) {

    const scales = tiles.scales;
    let scale;
    let status = '';

    tiles.scales.forEach( (item) => {
      if (item.name === tile.scale) {
        scale = item;
      }
    });

    for(let key in tile.ranges) {
      if (tile.ranges[key] === value) {
        status = key;
      } else if (Array.isArray(tile.ranges[key]) && tile.ranges[key].includes(value)) {
        status = key;
      } else if (Array.isArray(tile.ranges[key]) &&
        (value >= tile.ranges[key][0] && value <= tile.ranges[key][1])) {
        status = key;
      }
    }

    return status;

  }


  /**
   * Set values for the dashboard from aggregates
   * @param aggregates Object
   */
  setValues(aggregates) {

    const dash = document.querySelector('#dashboard .wrapper');
    let div = '';
    let value = '';

    aggregates = this.getDaysRemaining(aggregates);

    console.log(aggregates);

    tiles.tiles.forEach( (tile) => {

      value = this.getDataFromPath(tile.source, aggregates) || (tile.default || 0);
      status = this.getStatusFromValue(value, tile);

      if (tile.format) {
        if (tile.format.indexOf('%') > -1) {
          value = value / 100;
        }
        value = numeral(value).format(tile.format);
      }

      div += `<div class="tile ${tile.tile} ${status}">
        <div>${value}</div>
        <h2>${tile.label}</h2>
      </div>`;
    });

    dash.innerHTML = div;

  }

}
