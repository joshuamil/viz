'use strict';

export default class Aggregates {

  parseAggregates(data, sprints, config) {

    const aggregates = {
      phase: 0,
      sprint: 0,
      risk: 0,
      debt: 0,
      mood: ':|',
      totals: {
        sprint: {
          tasks: 0,
          completed: 0,
          rate: 0,
          blockers: 0,
          pushed: 0,
          lost: 0,
          incidents: 0,
          status: {}
        },
        project: {
          tasks: 0,
          completed: 0,
          rate: 0,
          blockers: 0,
          pushed: 0,
          lost: 0,
          incidents: 0,
          status: {}
        },
        team: {}
      },
      subtotals: []
    };

    aggregates.sprint = this.getCurrentSprint(sprints);
    aggregates.phase = this.getCurrentPhase(sprints);

    sprints.forEach( (sprint) => {
      aggregates.subtotals[sprint.field] = {
        phase: parseInt(sprint.phase, 10),
        sprint: parseInt(sprint.label.replace(/[^0-9]/g,''), 10),
        class: sprint.class,
        tasks: 0,
        completed: 0,
        estimate: 0,
        remaining: 0,
        expected: 0,
        spilled: 0,
        hours: {
          dev: 0,
          qa: 0
        },
        status: {}
      };
    });


    let assignee = '';
    data.forEach( (row) => {

      // Build Assignee Data
      assignee = row.assignee.replace(/[^\w]/g,'_');
      status = row.status.replace(/[^\w]/g,'_');

      if (!aggregates.totals.project.status.hasOwnProperty(status)) {
        aggregates.totals.project.status[status] = 0;
      }
      aggregates.totals.project.status[status]++;

      if (!aggregates.totals.team.hasOwnProperty(assignee)) {
        // Create new assignee entry
        aggregates.totals.team[assignee] = {
          tasks: 0,
          completed: 0,
          estimate: 0,
          remaining: 0,
          timespent: 0,
          spilled: 0,
          available: 50,
          status: {}
        };
      }

      aggregates.totals.team[assignee].tasks++;
      aggregates.totals.team[assignee].timespent += row.timespent;
      aggregates.totals.team[assignee].remaining += row.remaining;
      aggregates.totals.team[assignee].estimate += parseInt(row.estimate, 10) || 0;

      // Get Completed #
      if (row.status && row.status === 'Done') {
        aggregates.totals.team[assignee].completed++;
      }

      // Get Pushed #
      if (row.pushed && row.pushed > 0) {
        aggregates.totals.project.pushed++;
        aggregates.totals.team[assignee].spilled++;
      }

      // Get risk
      if (row.risk && row.risk > 0) {
        aggregates.risk++;
      }

      // Calculate story-based totals
      if (row.numtasks && row.numtasks > 0) {
        aggregates.totals.project.tasks++;
        if (row.status === "Done") {
          aggregates.totals.project.completed++;
        }
        if (row.priority === "Blocker") {
          aggregates.totals.project.blockers++;
        }
        if (parseInt(row.sprint.current, 10) === parseInt(aggregates.sprint, 10)) {
          aggregates.totals.sprint.tasks++;
          if (row.status === "Done") {
            aggregates.totals.sprint.completed++;
          }
          if (row.priority === "Blocker") {
            aggregates.totals.sprint.blockers++;
          }

          // Status
          if (!aggregates.totals.sprint.status.hasOwnProperty(status)) {
            aggregates.totals.sprint.status[status] = 0;
          }
          aggregates.totals.sprint.status[status]++;

        }

        // Get Sprint totals
        if (row.sprint && row.sprint.current) {
          if (aggregates.subtotals.hasOwnProperty('sprint' + row.sprint.current)) {
            aggregates.subtotals['sprint' + row.sprint.current].tasks++;
            aggregates.subtotals['sprint' + row.sprint.current].estimate += (!isNaN(row.estimate)) ? parseInt(row.estimate, 10) : 0;
            aggregates.subtotals['sprint' + row.sprint.current].remaining += row.remaining;
            aggregates.subtotals['sprint' + row.sprint.current].hours.dev = Math.ceil((aggregates.subtotals['sprint' + row.sprint.current].estimate * config.hoursPerPoint) * config.estimate.dev);
            aggregates.subtotals['sprint' + row.sprint.current].hours.qa = Math.ceil((aggregates.subtotals['sprint' + row.sprint.current].estimate * config.hoursPerPoint) * config.estimate.qa);

            if (!aggregates.subtotals['sprint' + row.sprint.current].status.hasOwnProperty(status)) {
              aggregates.subtotals['sprint' + row.sprint.current].status[status] = 0;
            }
            aggregates.subtotals['sprint' + row.sprint.current].status[status]++;

          }
        }

        // Get Sprint-totals
        sprints.forEach( (sprint) => {
          if (row.hasOwnProperty(sprint.field) && row[sprint.field] === '-') {

            if (!aggregates.subtotals['sprint' + row.sprint.current].status.hasOwnProperty(status)) {
              aggregates.subtotals[sprint.field].status[status] = 0;
            }

            aggregates.subtotals[sprint.field].tasks++;
            aggregates.subtotals[sprint.field].spilled++;
            aggregates.subtotals[sprint.field].estimate += (!isNaN(row.estimate)) ? row.estimate : 0;
            aggregates.subtotals[sprint.field].remaining += row.remaining;
            aggregates.subtotals[sprint.field].hours.dev = Math.ceil((aggregates.subtotals[sprint.field].estimate * config.hoursPerPoint) * config.estimate.dev);
            aggregates.subtotals[sprint.field].hours.qa = Math.ceil((aggregates.subtotals[sprint.field].estimate * config.hoursPerPoint) * config.estimate.qa);

          } else if (row.hasOwnProperty(sprint.field) && row.status === 'Done') {

            aggregates.subtotals[sprint.field].completed++;

          }

        });

      }

    });

    // Final totals
    aggregates.totals.project.rate = (aggregates.totals.project.completed / aggregates.totals.project.tasks * 100).toFixed(2);
    aggregates.totals.sprint.rate = (aggregates.totals.sprint.completed / aggregates.totals.sprint.tasks * 100).toFixed(2);

    aggregates.mood = this.getCurrentMood(aggregates);

    console.log('----- Aggregate Data Object -----');
    console.log(aggregates);

    return aggregates;

  }

  getCurrentSprint(data) {
    let sprint = 0;
    data.forEach( (row) => {
      if (row.class && row.class === "current") {
        sprint = row.label.replace('Sprint ','');
      }
    });
    return parseInt(sprint, 10);
  }

  getCurrentPhase(data) {
    let phase = 0;
    data.forEach( (row) => {
      if (row.phase && row.class && row.class === "current") {
        phase = row.phase;
      }
    });
    return parseInt(phase, 10);
  }

  getCurrentMood(aggregates) {
    let rating = 0;
    let mood = ':|';

    /*
    aggregages.risk
    aggregates.debt
    aggregates.totals.sprint.blockers
    aggregates.totals.sprint.rate
    */

    // Risk Ranking
    if (aggregates.risk > 10) {
      rating += 5;
    } else if (aggregates.risk > 20) {
      rating += 10;
    } else if (aggregates.risk >= 25) {
      rating += 15;
    }

    // Debt Ranking
    if (aggregates.debt > 0) {
      rating += 2;
    } else if (aggregates.debt > 10) {
      rating += 4;
    } else if (aggregates.debt >= 15) {
      rating += 6;
    } else if (aggregates.debt >= 25) {
      rating += 8;
    }

    // Rate Ranking
    if (aggregates.totals.sprint.expected < aggregates.totals.sprint.rate) {
      rating -= 5;
    } else if (aggregates.totals.sprint.expected - aggregates.totals.sprint.rate > 10) {
      rating += 2;
    } else if (aggregates.totals.sprint.expected - aggregates.totals.sprint.rate > 15) {
      rating += 4;
    } else if (aggregates.totals.sprint.expected - aggregates.totals.sprint.rate > 20) {
      rating += 6;
    } else if (aggregates.totals.sprint.expected - aggregates.totals.sprint.rate > 25) {
      rating += 8;
    }

    // Blocker Ranking
    if (aggregates.totals.sprint.blockers > 0) {
      rating += 25;
    }

    // Moods
    if (rating <= 5) {
      mood = ":)";
    } else if (rating > 5 && rating <= 10) {
      mood = ":|";
    } else if (rating > 15 && rating <= 20) {
      mood = ":/";
    } else if (rating > 25) {
      mood = ":(";
    } else {
      mood = ":|";
    }

    return mood;

  }

}
