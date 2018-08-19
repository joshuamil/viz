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

    let startDate = moment(config.startDate, 'yyyy-mm-dd').toDate();
    let endDate = moment(startDate, 'yyyy-mm-dd').add(config.daysInSprint, 'd').toDate();
    let today = moment(new Date(), 'yyyy-mm-dd').toDate();
    let state = "";
    let idx = 1;
    let phase = config.firstPhase;
    let phaseConfig = 0;

    for (let i=firstSprint; i<(firstSprint+numberOfSprints); i++) {

      // Determine when in relative time this sprint exists
      if (moment(today, 'yyyy-mm-dd').isBetween(startDate, endDate)) {
        state = "current";
      } else if (moment(endDate, 'yyyy-mm-dd').isBefore(today)) {
        state = "previous";
      } else if (moment(startDate, 'yyyy-mm-dd').isAfter(today)) {
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
      if (idx % config.sprintsPerPhase[phaseConfig] === 0) {
        phase++;
        idx = 1;
        phaseConfig++;
      } else {
        idx++;
      }

      // Set the timespan for the next sprint
      startDate = moment(endDate, 'yyyy-mm-dd').add(1, 'd').toDate();
      endDate = moment(startDate, 'yyyy-mm-dd').add(config.daysInSprint, 'd').toDate();

    }

    return sprints;

  }

}
