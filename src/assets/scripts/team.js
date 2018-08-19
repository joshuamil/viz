'use strict';

import Sprints from './Sprint.js';

const markobj = require('markobj');
const arraySort = require('array-sort');
const moment = require('moment');
const numeral = require('numeral');

let config = require('../data/config.json');
let team = require('../data/team.json');
let holidays = require('../data/holidays.json');

/**
 * Team Class
 * Defines data and UI elements related to the Teams tab in the application
 *
 */
export default class Team {

  constructor() {
    const sprints = new Sprints();
    this.sprintData = sprints.createSprints();
  }

  /**
   * Subtract holidays from regular schedule
   * @param sprint Number
   * @param member Number indicating the specific team member being targeted
   */
  getHolidays(sprint, member) {
    let hours = 0;
    let startDate = new Date(sprint.startDate);
    let endDate = new Date(sprint.endDate);
    holidays.forEach( (holiday) => {
      if (moment(new Date(holiday.date), 'MM/DD/YYYY').isBetween(startDate, endDate)) {
        if (holiday.members.includes(member.name) || holiday.teams.includes(member.team)) {
          hours += holiday.hours;
        }
      }
    });
    return hours;
  }

  /**
   * Parse team member data
   */
  parseData() {
    const data = {
      members: [],
      subtotals: {
        teams: {}
      },
      totals: {
        roles: {},
        sprints: {}
      }
    };

    let offset = 0;
    let hours = 0;
    let lastTeam = '';

    // Sort by Team, then Name
    arraySort(team, 'team', 'name');

    // Parse data for each team member
    team.forEach( (member, idx) => {

      data.members[idx] = {};
      data.members[idx].sprints = {};

      // Copy keys into the new data element
      for (let key in member) {
        data.members[idx][key] = member[key];
      }

      // Create Team for SubTotals
      if (!data.subtotals.teams[member.team]) {
        data.subtotals.teams[member.team] = {};
      }

      // Calculate Sprint Totals
      this.sprintData.forEach( (sprint) => {

        offset = this.getHolidays(sprint, member);
        hours = (member.hours - offset);

        // Assign the member:sprint value
        data.members[idx].sprints[sprint.field] = hours;

        // Increment the team:sprint subtotal
        if (!data.subtotals.teams[member.team][sprint.field]) {
          data.subtotals.teams[member.team][sprint.field] = 0;
        }
        data.subtotals.teams[member.team][sprint.field] += hours;

        // Increment the total:sprint total
        if (!data.totals.sprints[sprint.field]) {
          data.totals.sprints[sprint.field] = 0;
        }
        data.totals.sprints[sprint.field] += hours;

        // Increment role totals
        if (!data.totals.roles[member.role]) {
          data.totals.roles[member.role] = 0;
        }
        data.totals.roles[member.role] += hours;

      });

      if (lastTeam === '') {
        lastTeam = member.team;
      } else if (lastTeam !== '' && lastTeam !== member.team) {
        // End team
        lastTeam = member.team;
      }

    });

    // Sort by Team, then Name
    arraySort(data.members, 'team', 'name');

    return data;

  }

  /**
   * Draw the team member table
   */
  renderTeams() {

    // Parse the data before beginning
    const data = this.parseData();

    let cls = '';
    let currentTeam = '';
    let sprintHours
    let sprintCount = 0;
    let totalMemberHours = 0;
    let sprintData = '';

    // Get the table header and body
    const body = document.querySelector('#team-data table tbody');

    // Construct Sprint Header
    this.renderSprintHeaderRow();

    // Iterate over each team member
    let tr;
    data.members.forEach( (member, idx) => {

      // Construct Sprint Rows
      sprintCount = 0;
      totalMemberHours = 0;
      sprintData = '';
      for (let key in member.sprints) {
        cls = (member.sprints[key] < member.hours) ? 'pto' : 'full';
        totalMemberHours += member.sprints[key];
        sprintData += `<td class="${cls}">${member.sprints[key]}</td>`;
        sprintCount++;
      }

      // Add Subtotal Rows as Appropriate
      if (currentTeam !== member.team) {
        if (currentTeam !== '') {
          this.renderSubTotalRow(data, currentTeam);
        }
        currentTeam = member.team;
        this.renderTeamNameRow(currentTeam, body, sprintCount);
      }

      // Construct each row of the table
      tr = markobj(`<tr id="${member.jiraName}">
        <td>${member.name}</td>
        <td>${member.role}</td>
        <td>${member.allocation}</td>
        <td>${member.hours}</td>
        ${sprintData}
        <td class="subtotal">${totalMemberHours}</td>
      </tr>`);

      // Append the row to the table body
      body.appendChild(tr);

      // Show last SubTotal row
      if (idx === data.members.length-1) {
        this.renderSubTotalRow(data, currentTeam);
      }

    });
  }


  /**
   * Render Team Name Row
   * Draws the team name row in the Team chart
   * @param name String containing the team's name
   * @param target Object reference to the target element
   * @param columns Number of columns in the final chart
   */
  renderTeamNameRow(name, target, columns) {
    const sprintHeaders = markobj(`<tr><td colspan="${(5+columns)}"
      class="title">${name} Team</td></tr>`);
    target.appendChild(sprintHeaders);
  }


  /**
   * Renders Sprint Header Row
   */
  renderSprintHeaderRow() {
    const header = document.querySelector('#team-data table thead tr');
    let sprintHeaders = '';
    this.sprintData.forEach( (sprint) => {
      sprintHeaders = markobj(`<th>${sprint.label}</th>`);
      header.appendChild(sprintHeaders);
    });
    sprintHeaders = markobj(`<th>Totals</th>`);
    header.appendChild(sprintHeaders);
  }


  /**
   * Renders SubTotal Rows for Each Team
   * @param data Object
   * @param team Number
   */
  renderSubTotalRow(data, team) {

    const body = document.querySelector('#team-data table tbody');
    const sprints = data.subtotals.teams[team];

    let tr;
    let sprintCount = 0;
    let teamTotal = 0;
    let pointCount = 0;
    let sprintSubTotal = '';
    let pointSubTotal = '';



    for (let key in sprints) {
      pointCount = numeral((sprints[key] / config.hoursPerPoint)).format('0.0');
      sprintSubTotal += `<td>${sprints[key]}</td>`;
      pointSubTotal += `<td>${pointCount}</td>`;
      teamTotal += sprints[key];
      sprintCount++;
    }

    tr = markobj(`<tr class="subtotal">
      <td colspan="4" class="label">Available Team Hours per Sprint</td>
      ${sprintSubTotal}
      <td class="total">${teamTotal}</td>
    </tr>`);
    body.appendChild(tr);

    tr = markobj(`<tr class="subtotal">
      <td colspan="4" class="label">Estimated Point Velocity</td>
      ${pointSubTotal}
      <td class="total">${teamTotal}</td>
    </tr>`);
    body.appendChild(tr);

    tr = markobj(`<tr class="spacer"><td colspan="${(5+sprintCount)}">&nbsp;</td></tr>`);
    body.appendChild(tr);
  }

}
