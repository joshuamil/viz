'use strict';

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

      // Calculate numeric priority
      row.rank = 6;
      if (row.priority.toLowerCase().indexOf('block') > -1) {
        row.rank = 0;
      } else if (row.priority.toLowerCase().indexOf('highest') > -1) {
        row.rank = 1;
      } else if (row.priority.toLowerCase().indexOf('high') > -1) {
        row.rank = 2;
      } else if (row.priority.toLowerCase().indexOf('medium') > -1) {
        row.rank = 3;
      } else if (row.priority.toLowerCase().indexOf('lowest') > -1) {
        row.rank = 5;
      } else if (row.priority.toLowerCase().indexOf('low') > -1) {
        row.rank = 4;
      }

      // Calculate the estimate field
      row.estimate = task.fields.aggregatetimeoriginalestimate;
      row.timespent = (task.fields.aggregatetimespent) ? task.fields.aggregatetimespent : 0;
      row.remaining = row.estimate-row.timespent;
      if (!isNaN(row.estimate)) {
        row.estimate = parseInt((parseInt(row.estimate, 10)/3600),10);
      }

      // Calculate remaining & percentage
      if (!isNaN(row.remaining)) {
        row.remaining = parseInt((parseInt(row.remaining, 10)/3600),10);
      }

      // Get epic information
      row.epic = task.fields.customfield_10003;
      row.epic = this.getEpic(row.epic, input);

      // Get sprint information
      row.sprint = task.fields.customfield_10007;
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
        return a.sprint.current - b.sprint.current || a.rank - b.rank;
      }
    });

    console.log('----- Data Object -----');
    console.log(data);

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
    config = conf;
    return config;
  }


  // Parses Sprint value from string
  parseSprint(input) {
    let sprint = '';
    let result = {};
    result.raw = input;
    result.current = input[input.length-1];
    result.history = [];

    // Capture the current Sprint
    sprint = result.current.match(/(name=[^,]*,)/);
    if (sprint !== null && Array.isArray(sprint)) {
      result.current = sprint[sprint.length-1].replace(/([^0-9]*)/ig, '');
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
