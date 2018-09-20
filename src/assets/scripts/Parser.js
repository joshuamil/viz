'use strict';

let config = require('../data/config.json');
let team = require('../data/team.json');

import { nSQL } from 'nano-sql';

export default class Parser {

  constructor() {
  }


  // Append Sprints to Configuration
  appendSprints(config, sprints) {
    let conf = [];
    config.forEach( (item) => {
      if (!item.disabled) {
        conf.push(item);
        // TODO: Change the below to use the last column instead of "Status"
        if (item.label.indexOf('Status') === 0) {
          sprints.forEach( (sprint) => {
            conf.push(sprint);
          });
        }
      }
    });
    return conf;
  }


  // Does this issue link exist?
  associatedLink(keyword, row, task) {
    const links = this.calculateLinks(row, task);
    const result = links.find( link => link.type.indexOf(keyword) > -1);
    return result;
  }

  // Get the properties of a linked issue of a specific type
  getLinkProperties(keyword, row, task) {
    let match = {};
    const links = this.calculateLinks(row, task);
    links.forEach( (link) => {
      if (link.type.indexOf(keyword) > -1) {
        match = link;
      }
    });
    return match;
  }


  // Calculate debt
  calculateDebt(row, task) {
    row.debt = 0;
    if (row.pushed > 0) {
      row.debt = Math.ceil(row.pushed * config.riskCalculation.debt);
    }
    const hasLinks = this.associatedLink('relate', row, task);
    if (hasLinks) {
      const link = this.getLinkProperties('relate', row, task);
      if (link.status) {
        row.debt = 4 - parseInt(link.priority, 10);
      } else {
        row.debt++;
      }
    }
    return row.debt;
  }


  // Calculate the estimate fields
  calculateEstimate(row, task, params) {
    row.estimate = task.fields.aggregatetimeoriginalestimate || 0;
    row.timespent = (task.fields.aggregatetimespent) ? task.fields.aggregatetimespent : 0;
    row.remaining = row.estimate-row.timespent;
    if (!isNaN(row.estimate) && parseInt(row.estimate, 10) >= params.defaultWeight) {
      row.estimate = parseInt((parseInt(row.estimate, 10)/3600), 10);
    } else {
      row.estimate = parseInt(params.defaultWeight, 10);
    }

    // Calculate remaining & percentage
    if (!isNaN(row.remaining)) {
      row.remaining = parseInt((parseInt(row.remaining, 10)/3600),10);
    }

    return {
      estimate: row.estimate,
      timespent: row.timespent,
      remaining: row.remaining
    };
  }


  // Captures related links and their context
  calculateLinks(row, task) {
    row.links = [];
    task.fields.issuelinks.forEach( (link) => {
      if (link.inwardIssue) {
        //console.log(link.inwardIssue.fields.priority);
        row.links.push({
          id: link.inwardIssue.key,
          type: link.type.name.toLowerCase(),
          priority: link.inwardIssue.fields.priority.name.replace(/[^0-9]/ig,''),
          status: link.inwardIssue.fields.status.statusCategory.name,
          context: link.type.inward || link.type.outward || link.type.name.toLowerCase()
        });
      }
    });
    return row.links;
  }


  // Was the story pushed?
  calculatePushed(row) {
    row.pushed = 0;
    if (row.sprint && row.sprint.history) {
      row.sprint.history.forEach( (sp, index) => {
        if (row.sprint.current === sp) {
          row['sprint' + sp] = (row.remaining < 0)? '0' : row.remaining;
          if (row['sprint' + sp] === '' || row['sprint' + sp] === 0) {
            row['sprint' + sp] = '0';
          }
        } else {
          row['sprint' + sp] = "-";
          row.pushed++;
        }
      });
    }
    return row.pushed;
  }


  // Calculate Rank
  calculateRank(row) {
    const rankNo = parseInt(row.priority.replace(/[^0-9]/gi, ''), 10);
    if (rankNo > 0) {
      row.rank = rankNo;
      row.priority = this.getPriorityFromRank(rankNo);
    } else {
      // Use severity rank values from config.json
      config.severity.forEach( (sev) => {
        if (row.priority.toLowerCase().indexOf(sev.value) > -1) {
          row.rank = parseInt(sev.rank, 10);
        }
      });
    }
    return {
      rank: row.rank,
      priority: row.priority
    };
  }


  // Calculate risk
  calculateRisk(row) {
    row.risk = 0;
    if (row.priority.toLowerCase().indexOf('block') > -1) {
      row.risk = 2;
    } else if (row.assignee === 'unassigned' && row.sprint.current === 1 && row.status !== 'Done') {
      row.risk = 1;
    }

    // Increase risk if this story is in the current Sprint, but in backlog
    if (row.status.toLowerCase() === 'backlog' && row.sprint.current === 1) {
      row.risk++;
    }

    // Increase risk if this story is in the current Sprint, but has been pushed before
    if (row.pushed > 0) {
      row.risk = Math.ceil(
        row.risk + (row.pushed * config.riskCalculation.delay));
    }
    return row.risk;
  }


  // Calculate Sort Order
  calculateSort(row) {
    // Use sort weight values from config.json
    row.sort = (row.rank*10);
    config.sort.forEach( (srt) => {
      if (row[srt.source].toLowerCase().indexOf(srt.value) > -1) {
        row.sort += parseInt(srt.weight, 10);
      }
    });

    // Create a decimal to further sort by identifier
    let decimal = `0000${row.key.replace(/([^0-9])*/ig,'')}`;
    row.sort = `${row.sort}.${decimal.slice(-4)}`;
    return row.sort;
  }


  // Calculate the correct Sprint
  calculateSprint(row, task) {
    // Get sprint information
    row.sprint = task.fields[config.jira.sprintField];
    if (row.sprint && row.sprint !== null && Array.isArray(row.sprint)) {
      row.sprint = this.parseSprint(row.sprint);
    }
    // Populate empty sprint values
    if (!row.sprint) {
      row.sprint = { current: 999, history: [] };
    }
    return row.sprint;
  }


  // Get default velocity + stories per Sprint
  calculateVelocity(params) {
    return new Promise( (resolve, reject) => {
      let response = params;
      response.defaultWeight = config.sprint.planning.defaultStoryWeight;

      // TODO: Needs to be calculated by Sprint, by Person, and by Team
      // Get number of team members
      nSQL(team)
        .query("select")
        .where(["role","=","dev"])
        .exec()
        .then((rows) => {
          rows.forEach( (row) => {
            response.defaultVelocity += Math.round(row.hours / (config.sprint.hoursPerPoint));
          });
          document.querySelector('#baseVelocity').value = Math.round(response.defaultVelocity);
          response.storiesPerSprint += Math.round(response.defaultVelocity / response.defaultWeight);
          document.querySelector('#storiesPerSprint').value = Math.round(response.storiesPerSprint);
          resolve(response);
        });
    })
    .then( (response) => {
      return response;
    });
  }


  // Create an Epic Link
  getEpic(epic, data) {
    for (let i=0;i<data.issues.length;i++) {
      if (data.issues[0].key === epic) {
        return data.issues[0].fields.summary;
      }
    }
    return epic;
  }


  // Get a priority based on a numeric ranking
  getPriorityFromRank(rank) {
    let priority = '';
    config.severity.forEach( (sev) => {
      if (sev.rank === rank) {
        priority = sev.value;
      }
    });
    return priority;
  }


  // Parse Jira data into data element
  parseData(input) {
    let data = [];
    let row = {};

    const isPlanningMode = document.querySelector('#planningMode');
    const usePlanningMode = (isPlanningMode.checked) ? true : false;

    let params = {};
    params.planningSprint = 1;
    params.defaultWeight = 0;
    params.defaultVelocity = 0;
    params.storiesPerSprint = 0;


    // TODO: This needs to be turned into an asynchronous call
    return this.calculateVelocity(params)
      .then( (response) => {
        if (usePlanningMode) {
          params = response;
        }

        input.issues.forEach( (task, idx) => {

          row = {
            key: task.key,
            priority: task.fields.priority.name,
            description: task.fields.summary,
            status: task.fields.status.name,
            assignee: (!task.fields.assignee) ? 'unassigned' : task.fields.assignee.displayName,
            numtasks: 1
          };

          // Calculate rank & priority
          const rank = this.calculateRank(row);
          for ( let key in rank) {
            row[key] = rank[key];
          }

          // Calculate sort order
          row.sort = this.calculateSort(row);

          // Calculate estimate
          const estimate = this.calculateEstimate(row, task, params);
          for ( let key in estimate) {
            row[key] = estimate[key];
          }

          // Get epic information
          row.epic = this.getEpic(task.fields[config.jira.epicField], input);

          // Calculate Sprint
          row.sprint = this.calculateSprint(row, task);

          // If in planning mode, set Sprints based on calculated velocity
          if (usePlanningMode) {
            if (row.sprint.current === 999) {
              row.sprint.current = params.planningSprint;
              if (idx % params.storiesPerSprint === 0) {
                params.planningSprint++;
              }
            }
          }

          // Determine if the story was pushed from a previous Sprint
          row.pushed = this.calculatePushed(row);

          // Calculate Debt
          row.debt = this.calculateDebt(row, task);

          // Calculate Risk
          row.risk = this.calculateRisk(row);

          // Add to collection
          data.push(row);

        });

        // Sort based on Sprint then Priority / Rank
        data.sort((a, b) => {
          if (a.sprint) {
            return a.sprint.current - b.sprint.current || a.rank - b.rank || a.sort - b.sort;
          }
        });

        console.log('-------- Parsed Data --------');
        console.log(data);

        return data;

      });

  }


  // Parse links in configured columns
  parseLink(value, link) {
    let result = link.replace('@value', value);
    let a = document.createElement('a');
    a.setAttribute('href', result);
    a.setAttribute('target', '_blank');
    a.appendChild(document.createTextNode(value));
    return a;
  }


  // Parse a multi-part value
  parseMultiPartValue(value, data) {
    const parts = value.split('.');
    let result = data;
    parts.forEach( (part) => {
      if (result && result.hasOwnProperty(part)) {
        result = result[part];
      }
    });
    return result;
  }


  // Parses Sprint value from string
  parseSprint(input) {
    let sprint = '';
    let result = {};

    result.raw = input;
    result.current = input[input.length-1];
    result.history = [];

    // Capture the current Sprint
    if (result.current) {
      sprint = result.current.match(/(name=[^,]*,)/);
      if (sprint !== null && Array.isArray(sprint)) {
        result.current = sprint[sprint.length-1].replace(/([^0-9]*)/ig, '');
      }
    }

    // Set a default Sprint
    if (!result.current) {
      result.current = 999;
    }

    // Create a Sprint History log
    result.raw.forEach( (item) => {
      let sp = item.match(/(name=[^,]*,)/);
      sp = sp[sp.length-1].replace(/([^0-9]*)/ig, '')
      if (!result.history.includes(sp)) {
        result.history.push(sp);
      }
    });

    return result;
  }

}
