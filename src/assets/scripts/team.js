const markobj = require('markobj');
const arraySort = require('array-sort');
const moment = require('moment');

let team = require('../data/team.json');
let sprints = require('../data/sprints.json');
let holidays = require('../data/holidays.json');

module.exports = {

  /**
   * Subtract holidays from regular schedule
   *
   */
  getHolidays(sprint, member) {
    let hours = 0;
    let startDate = moment(sprint.startDate, 'MM/DD/YYYY').format('YYYY-MM-DD');
    let endDate = moment(sprint.endDate, 'MM/DD/YYYY').format('YYYY-MM-DD');
    holidays.forEach( (holiday) => {
      if (moment(holiday.date).isBetween(startDate, endDate)) {
        if (holiday.members.includes(member.name) || holiday.teams.includes(member.team)) {
          hours += holiday.hours;
        }
      }
    });
    return hours;
  },

  /**
   * Parse team member data
   *
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
      sprints.forEach( (sprint) => {

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

    console.log(data);

    // Sort by Team, then Name
    arraySort(data.members, 'team', 'name');

    return data;

  },

  /**
   * Draw the team member table
   *
   */
  renderTeams() {

    // Parse the data before beginning
    const data = this.parseData();

    let cls = '';
    let currentTeam = '';
    let sprintHours
    let totalMemberHours = 0;
    let sprintData = '';

    // Get the table header and body
    const body = document.querySelector('#team-data table tbody');

    // Construct Sprint Header
    this.renderSprintHeaderRow();

    // Iterate over each team member
    let tr;
    data.members.forEach( (member, idx) => {

      // Add Subtotal Rows as Appropriate
      if (currentTeam !== member.team) {
        if (currentTeam !== '') {
          this.renderSubTotalRow(data, currentTeam);
        }
        currentTeam = member.team;
      }

      // Construct Sprint Rows
      totalMemberHours = 0;
      sprintData = '';
      for (let key in member.sprints) {
        cls = (member.sprints[key] < member.hours) ? 'pto' : '';
        totalMemberHours += member.sprints[key];
        sprintData += `<td class="${cls}">${member.sprints[key]}</td>`;
      }

      // Construct each row of the table
      tr = markobj(`<tr id="${member.jiraName}">
        <td>${member.team}</td>
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
  },


  /**
   * Renders Sprint Header Row
   *
   */
  renderSprintHeaderRow() {
    const header = document.querySelector('#team-data table thead tr');
    let sprintHeaders = '';
    sprints.forEach( (sprint) => {
      sprintHeaders = markobj(`<th>${sprint.label}</th>`);
      header.appendChild(sprintHeaders);
    });
    sprintHeaders = markobj(`<th>Totals</th>`);
    header.appendChild(sprintHeaders);
  },


  /**
   * Renders SubTotal Rows for Each Team
   *
   */
  renderSubTotalRow(data, team) {

    const body = document.querySelector('#team-data table tbody');
    const sprints = data.subtotals.teams[team];

    let tr;
    let sprintCount = 0;
    let teamTotal = 0;
    let sprintSubTotal = '';
    for (let key in sprints) {
      sprintSubTotal += `<td>${sprints[key]}</td>`;
      teamTotal += sprints[key];
      sprintCount++;
    }

    tr = markobj(`<tr class="subtotal">
      <td colspan="5" class="label">Available Team Hours per Sprint</td>
      ${sprintSubTotal}
      <td class="total">${teamTotal}</td>
    </tr>`);
    body.appendChild(tr);

    tr = markobj(`<tr class="spacer"><td colspan="${(6+sprintCount)}">&nbsp;</td></tr>`);
    body.appendChild(tr);
  }

};
