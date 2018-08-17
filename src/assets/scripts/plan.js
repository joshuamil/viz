'use strict';

let markobj = require('markobj');

import Parser from './Parser.js';

export default class Plan {

  constructor() {
    this.parse = new Parser();
  }

  // Toggles the display of the full detail columns
  toggleColumns(target) {
    const headers = document.querySelectorAll('table thead tr th.base');
    const rows = document.querySelectorAll('table tbody tr');
    const table = document.querySelector('table');
    let removed = 0;

    if (target.classList.contains('collapsed')) {

      removed = headers.length;
      target.classList.remove('collapsed');
      table.classList.remove('collapsed');
      let targets = document.querySelectorAll('table .collapsed');
      targets.forEach( (el) => {
        el.classList.remove('collapsed');
      });
      this.toggleAggregates(removed, 'add');

    } else {

      target.classList.add('collapsed');
      table.classList.add('collapsed');
      headers.forEach( (th, n) => {
        if (th.classList.contains('full')) {
          removed++;
          th.classList.add('collapsed');
          rows.forEach( (tr) => {
            tr.querySelectorAll('td').forEach( (td, tx) => {
              if (tx === n) {
                td.classList.add('collapsed');
              }
            });
          });
        }
      });

      this.toggleAggregates(removed, 'remove');

    }

  }

  // Toggle Aggregate Colspans
  toggleAggregates(removed, action) {
    const aggregates = document.querySelectorAll('tfoot td.label');
    aggregates.forEach( (label) => {
      let current = parseInt(label.getAttribute('colspan'), 10);
      const updated = (action === "remove")? (current - removed) : removed;
      label.setAttribute('colspan', updated);
    });
  }

  // Inject Sprints / Phases into Table
  renderHeader(sprints, config, aggregates) {
    let th1, th2, th3 = '';
    let dates = '';
    let d1, d2, current = '';
    const newRow1 = document.createElement('tr');
    const newRow2 = document.createElement('tr');
    const newRow3 = document.createElement('tr');
    const header = document.querySelector('#release-plan thead');
    const headRow = header.querySelector('tr');
    const headers = headRow.querySelectorAll('th');

    const phases = [];
    const sprintsPerPhase = parseInt(config.sprintsPerPhase, 10);

    // Set button action
    document.querySelector('button').addEventListener('click', (event) => {
      this.toggleColumns(event.target);
    });

    headers.forEach( (el, ix) => {

      if (el.classList.contains('full')) {

        newRow1.appendChild(el);

      } else if (ix === (headers.length-1)) {
        newRow1.appendChild(el);
        sprints.forEach( (sprint) => {

          // Populate Phase labels
          if (!this.parse.arrayContains(phases, sprint.phase)) {

            current = '';
            if (aggregates && parseInt(aggregates.phase, 10) === parseInt(sprint.phase, 10)) {
              current = 'current';
            }

            th1 = document.createElement('th');
            th1.setAttribute('colspan', sprintsPerPhase);
            th1.setAttribute('class', `${current} phase phase${sprint.phase} ${sprint.class}`);
            th1.appendChild(document.createTextNode(`Phase ${sprint.phase}`));
          }

          // Populate Sprint labels
          th2 = document.createElement('th');
          th2.setAttribute('class',`sprint nowrap ${sprint.class}`);
          th2.appendChild(document.createTextNode(sprint.label));

          // Populate dates
          th3 = document.createElement('th');
          th3.setAttribute('class',`dates nowrap ${sprint.class}`);
          d1 = new Date(sprint.startDate);
          d2 = new Date(sprint.endDate);
          dates = d1.getMonth()+1 + '/' + d1.getDate();
          dates += '-' + (d2.getMonth()+1) + '/' + d2.getDate();
          th3.appendChild(document.createTextNode(dates));

          // Append rows to the header
          if (!this.parse.arrayContains(phases, sprint.phase)) {
            newRow1.appendChild(th1);
            phases.push(sprint.phase);
          }
          newRow2.appendChild(th2);
          newRow3.appendChild(th3);

        });
      } else {
        newRow1.appendChild(el);
      }
    });

    header.removeChild(headRow);
    header.appendChild(newRow1);
    header.appendChild(newRow2);
    header.appendChild(newRow3);

  }


  // Renders rows into the table
  renderTable(task, sprints, config, aggregates) {

    const tbody = document.querySelector('#release-plan tbody');
    let td;
    let column = '';
    let value = '';

    let trClass = (task.priority.toLowerCase().indexOf('block') > -1) ? 'blocker' : '';

    let tr = markobj(`<tr id="${task.key}"
      data-sprint="${task.sprint.current}"
      data-assignee="${task.assignee}"
      class="${trClass}"></tr>`);

    tbody.appendChild(tr);

    sprints.forEach( (item, index) => {

      // Create a new cell
      td = document.createElement('td');
    
      // Defaults
      column = item.label;
      value = task[item.field];

      // Parse the value if the field is a multi-node path
      if (item.field.indexOf('.') > -1) {
        value = this.parse.parseValue(item.field, task);
      }
      
      // Clear "999" from Sprints
      if (item.field.indexOf('sprint') > -1 && value === 999) {
        value = '';
      }

      // Set class of the element
      if (item.class.indexOf('@value') > -1) {
        let cls = value.toLowerCase().replace(/(\s){1,}/ig,'-');
        td.setAttribute('class', cls);
      } else {
        if (item.phase && item.class.indexOf('phase') === -1) {
          item.class += ` phase${item.phase}`;
        }
        td.setAttribute('class', item.class);
      }

      // Find the value
      if (typeof value !== "object") {

        // Inject a title if 
        if (item.title) {
          td.setAttribute('title', item.title);
        }

        // Populate Current Sprint Column
        if (item.field === `sprint${task.sprint.current}`) {
          
          // Populate Sprint Columns
          td.appendChild(document.createTextNode(task.estimate));
          td.classList.add('scheduled');
          
        } else if (
          item.class.indexOf('future') > -1
          && item.field === `sprint${task.sprint.current}`
        ) {
          
          // Populate Sprint Columns
          td.appendChild(document.createTextNode(task.estimate));
          
        } else if (item.hidden) {

          // Hidden item value
          td.setAttribute('data-value', value);

        } else if (item.link && item.link !== '') {
          
          // Link node
          let a = this.parse.parseLink(value, item.link);
          td.appendChild(a);

        } else if (value && value !== '') {

          // Basic values
          if (value === "-") {
            td.setAttribute('class', `${item.class} pushed`);
            td.setAttribute('title', `Pushed`);
          } else if (value === "unassigned") {
            td.setAttribute('class', `${item.class} dimmed`);
          }
          
          // Insert text nodes
          td.appendChild(document.createTextNode(value));

          // Sprint column
          if (task.sprint && task.sprint.current && value !== '-' && column.indexOf('Sprint ') > -1) {
            td.setAttribute('class', `${item.class} active`);
          }

        }
        
        

      }

      tr.appendChild(td);
    });

  }


  // Renders totals into the grid
  renderAggregates(aggregates) {

    let sprints1,sprints2,sprints3,sprints4,sprints5,sprints6,sprints7,sprints8,blanks;
    const table = document.querySelector('table');

    blanks = '<tr><td colspan="10" class="empty label"></td>';

    // Loop through the aggregate values
    for (let key in aggregates.subtotals) {

      let percentage = ((aggregates.subtotals[key].tasks / aggregates.totals.project.tasks) * 100).toFixed('1');
      let completion = ((aggregates.subtotals[key].completed / aggregates.totals.project.tasks) * 100).toFixed('1');
      let completionClass = (completion < 100) ? 'bad' : 'good';
      let spilledClass = (parseInt(aggregates.subtotals[key].spilled, 10) > 0) ? 'warning' : 'white';
      let phase = `phase${aggregates.subtotals[key].phase}`;
      let defaultClass = aggregates.subtotals[key].class;

      sprints1 += `<td class="${defaultClass} total">${aggregates.subtotals[key].estimate}</td>`;
      sprints2 += `<td class="${defaultClass} subtotal">${aggregates.subtotals[key].hours.dev}</td>`;
      sprints3 += `<td class="${defaultClass} subtotal">${aggregates.subtotals[key].hours.qa}</td>`;
      sprints4 += `<td class="${defaultClass} ${spilledClass} ${phase}">${aggregates.subtotals[key].spilled}</td>`;
      sprints5 += `<td class="${defaultClass} subtotal ${phase}">${aggregates.subtotals[key].tasks}</td>`;
      sprints6 += `<td class="${defaultClass} total ${phase}">${percentage}%</td>`;
      sprints7 += `<td class="${defaultClass} subtotal ${phase}">${aggregates.subtotals[key].completed}</td>`;
      sprints8 += `<td class="${defaultClass} subtotal ${completionClass}">${completion}%</td>`;

      blanks += `<td class="${defaultClass} empty ${phase}"></td>`;

    }

    blanks += '<td colspan="5" class="empty plain"></td></tr>';

    // Build out the footer
    let footerRows = markobj(`<tfoot>
      <tr><td colspan="10" class="label">Total story points per Sprint</td>${sprints1}<td colspan="5" class="plain"></td></tr>
      <tr><td colspan="10" class="label">Total Dev Hours per Sprint</td>${sprints2}<td colspan="5" class="plain"></td></tr>
      <tr><td colspan="10" class="label">Total QA Hours per Sprint</td>${sprints3}<td colspan="5" class="plain"></td></tr>
      <tr><td colspan="10" class="label">Stories Spilled across Sprints</td>${sprints4}<td colspan="5" class="plain"></td></tr>
      ${blanks}
      <tr><td colspan="10" class="label">Total Stories by Sprint</td>${sprints5}<td colspan="5" class="plain"></td></tr>
      <tr><td colspan="10" class="label">Target Completion Percentage</td>${sprints6}<td colspan="5" class="plain"></td></tr>
      ${blanks}
      <tr><td colspan="10" class="label">Sprint Stories Completed</td>${sprints7}<td colspan="5" class="plain"></td></tr>
      <tr><td colspan="10" class="label">Sprint Completion Percentage</td>${sprints8}<td colspan="5" class="plain"></td></tr>
    </tfoot>`);

    // Append the footer to the table
    table.appendChild(footerRows);

  }

}
