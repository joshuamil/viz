'use strict';

let config = require('../data/config.json');

export default class Parser {

  constructor() {
  }


  // Find a value in an array
  arrayContains(array, value) {
    for (let i=0;i<array.length;i++) {
      if (array[i] === value) {
        return true;
      }
    }
    return false;
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
  parseValue(value, data) {
    const parts = value.split('.');
    let result = data;
    parts.forEach( (part) => {
      if (result && result.hasOwnProperty(part)) {
        result = result[part];
      }
    });
    return result;
  }


  // Get a priority based on a numeric ranking
  getPriorityFromRank(rank) {
    let priority = '';
    if (rank === 0) {
      priority = "block";
    } else if (rank === 1) {
      priority = "highest";
    } else if (rank === 2) {
      priority = "high";
    } else if (rank === 3) {
      priority = "medium";
    } else if (rank === 4) {
      priority = "low";
    } else if (rank >= 5) {
      priority = "lowest";
    }
    return priority;
  }


  // Parse Jira data into data element
  parseData(input) {
    let data = [];
    let row = {}
    input.issues.forEach( (task) => {

      row = {};
      row.key = task.key;
      row.priority = task.fields.priority.name;
      row.description = task.fields.summary;
      row.status = task.fields.status.name;
      row.assignee = (!task.fields.assignee) ? 'unassigned' : task.fields.assignee.displayName;

      row.numtasks = 1;
      row.debt = '';

      // Calculate risk
      row.risk = 0;
      if (row.priority.toLowerCase().indexOf('block') > -1) {
        row.risk = 2;
      }

      // Calculate rank & priority
      const rankNo = parseInt(row.priority.replace(/[^0-9]/gi, ''), 10);
      if (rankNo > 0) {
        row.rank = rankNo;
        row.priority = this.getPriorityFromRank(rankNo);
      } else {
        if (row.priority.toLowerCase().indexOf('block') > -1) {
          row.rank = 0;
        } else if (row.priority.toLowerCase().indexOf('highest') > -1) {
          row.rank = 1;
        } else if (row.priority.toLowerCase().indexOf('high') > -1) {
          row.rank = 2;
        } else if (row.priority.toLowerCase().indexOf('medium') > -1) {
          row.rank = 3;
        } else if (row.priority.toLowerCase().indexOf('low') > -1) {
          row.rank = 4;
        } else if (row.priority.toLowerCase().indexOf('lowest') > -1) {
          row.rank = 5;
        }
      }

      // Rank modified by Status
      row.sort = (row.rank*10);
      if (row.status.toLowerCase().indexOf('done') >= 0) {
        row.sort += 90;
      } else if (row.status.toLowerCase().indexOf('validation') >= 0) {
        row.sort += 0;
      } else if (row.status.toLowerCase().indexOf('progress') >= 0) {
        row.sort += 10;
      } else if (row.status.toLowerCase().indexOf('ready') >= 0) {
        row.sort += 20;
      } else if (row.status.toLowerCase().indexOf('open') >= 0) {
        row.sort += 30;
      } else if (row.status.toLowerCase().indexOf('backlog') >= 0) {
        row.sort += 200;
      }

      // Lower the sort ranking if an item is unassigned
      if (row.assignee.toLowerCase().indexOf('unassign') >= 0) {
        row.sort += 1;
      }

      // Create a decimal at the end to sort by identifier
      let decimal = `0000${row.key.replace(/([^0-9])*/ig,'')}`;
      row.sort = `${row.sort}.${decimal.slice(-4)}`;

      // Calculate the estimate field
      row.estimate = task.fields.aggregatetimeoriginalestimate || 0;
      row.timespent = (task.fields.aggregatetimespent) ? task.fields.aggregatetimespent : 0;
      row.remaining = row.estimate-row.timespent;
      if (!isNaN(row.estimate)) {
        row.estimate = parseInt((parseInt(row.estimate, 10)/3600),10);
      } else {
        row.estimate = 0;
      }

      // Calculate remaining & percentage
      if (!isNaN(row.remaining)) {
        row.remaining = parseInt((parseInt(row.remaining, 10)/3600),10);
      }

      // Get epic information
      row.epic = task.fields[config.jiraConfig.epicField];
      row.epic = this.getEpic(row.epic, input);

      // Get sprint information
      row.sprint = task.fields[config.jiraConfig.sprintField];
      if (row.sprint && row.sprint !== null && Array.isArray(row.sprint)) {
        row.sprint = this.parseSprint(row.sprint);
      }

      // Populate empty sprint values
      if (!row.sprint) {
        row.sprint = { current: 999, history: [] };
      }

      // Capture Sprint data
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

      // Add to collection
      data.push(row);

    });

    // Sort based on Sprint then Priority / Rank
    data.sort((a, b) => {
      if (a.sprint) {
        return a.sprint.current - b.sprint.current || a.rank - b.rank || a.sort - b.sort;
      }
    });

    return data;
  }


  // Append Sprints to Configuration
  appendSprints(config, sprints) {
    let conf = [];
    config.forEach( (item) => {
      conf.push(item);
      // TODO: Change the below to use the last column instead of "Status"
      if (item.label.indexOf('Status') === 0) {
        sprints.forEach( (sprint) => {
          conf.push(sprint);
        });
      }
    });
    return conf;
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


  // Create an Epic Link
  getEpic(epic, data) {
    for (let i=0;i<data.issues.length;i++) {
      if (data.issues[0].key === epic) {
        return data.issues[0].fields.summary;
      }
    }
    return epic;
  }

}
