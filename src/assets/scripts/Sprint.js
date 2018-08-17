'use strict';

const markobj = require('markobj');
const arraySort = require('array-sort');
const moment = require('moment');
const numeral = require('numeral');

let config = require('../data/config.json');
let team = require('../data/team.json');
let holidays = require('../data/holidays.json');

/**
 * Sprint Class
 * Defines data and UI elements related to the Teams tab in the application
 *
 */
export default class Sprint {

  constructor() {
  }


  /**
   * Creates a new Sprint object using values from assets/data/config.json
   *
   */
  createSprints() {
    const firstSprint = config.firstSprint;
    const numberOfSprints = config.numberOfSprints;
    const sprints = [];

    let startDate = config.startDate;
    let endDate = moment(startDate).add(config.daysInSprint, 'd').toDate();
    let today = moment().toDate();
    let state = "";
    let idx = 0;
    let phase = config.firstPhase-1;

    for (let i=firstSprint; i<(firstSprint+numberOfSprints); i++) {

      // Determine when in relative time this sprint exists
      if (moment(today).isBetween(startDate, endDate)) {
        state = "current";
      } else if (moment(endDate).isBefore(today)) {
        state = "previous";
      } else if (moment(startDate).isAfter(today)) {
        state = "future";
      }

      // Determine phase for this sprint
      if (idx % config.sprintsPerPhase === 0) {
        phase++;
      }

      // Add to the array of dynamic sprints
      sprints.push({
        "label": `Sprint ${i}`,
        "field": `sprint${i}`,
        "startDate": `${startDate}`,
        "endDate": `${endDate}`,
        "phase": phase,
        "class": state
      });

      // Set the timespan for the next sprint
      startDate = moment(endDate).add(1, 'd').toDate();
      endDate = moment(startDate).add(config.daysInSprint, 'd').toDate();

      idx++;

    }

    return sprints;

  }

}
