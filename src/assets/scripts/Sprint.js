'use strict';

const markobj = require('markobj');
const arraySort = require('array-sort');
const moment = require('moment');
const numeral = require('numeral');

let config = require('../data/config.json');
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
    const firstSprint = config.sprint.firstSprint;
    const numberOfSprints = config.sprint.numberOfSprints;
    const sprints = [];

    let startDate = moment(config.sprint.startDate, 'YYYY-MM-DD').toDate();
    let endDate = moment(startDate, 'YYYY-MM-DD').add(config.sprint.daysInSprint, 'd').toDate();
    let today = moment(new Date(), 'YYYY-MM-DD').toDate();
    let state = "";
    let idx = 1;
    let phase = config.sprint.firstPhase;
    let phaseConfig = 0;

    for (let i=firstSprint; i<(firstSprint+numberOfSprints); i++) {

      // Determine when in relative time this sprint exists
      if (moment(today, 'YYYY-MM-DD').isBetween(startDate, endDate)) {
        state = "current";
      } else if (moment(endDate, 'YYYY-MM-DD').isBefore(today)) {
        state = "previous";
      } else if (moment(startDate, 'YYYY-MM-DD').isAfter(today)) {
        state = "future";
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


      // Determine phase for this sprint
      if (idx % config.sprint.sprintsPerPhase[phaseConfig] === 0) {
        phase++;
        idx = 1;
        phaseConfig++;
      } else {
        idx++;
      }

      // Set the timespan for the next sprint
      startDate = moment(endDate, 'YYYY-MM-DD').add(1, 'd').toDate();
      endDate = moment(startDate, 'YYYY-MM-DD').add(config.sprint.daysInSprint, 'd').toDate();

    }

    return sprints;

  }

}
