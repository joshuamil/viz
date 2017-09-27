let utils = require('./utils.js');

module.exports = {
  
  displayCurrent(sprint) {
    this.displayNone();
    const future = document.querySelectorAll('.future');
    future.forEach( (el) => {
      el.style.display = 'none';
    });
    const mine = document.querySelectorAll(`[data-sprint="${sprint}"]`);
    mine.forEach( (el) => {
      el.style.display = 'table-row';
    });
  },
  
  displayMe() {
    const me = 'Joshua Miller';
    const theirs = document.querySelectorAll('table tbody tr');
    theirs.forEach( (el) => {
      el.style.display = 'none';
    });
    const mine = document.querySelectorAll(`[data-assignee="${me}"]`);
    mine.forEach( (el) => {
      el.style.display = 'table-row';
    });
  },
  
  displayAll() {
    const rows = document.querySelectorAll('table tbody tr');
    rows.forEach( (el) => {
      el.style.display = 'table-row';
    });
    const future = document.querySelectorAll('.future');
    future.forEach( (el) => {
      el.style.display = 'table-cell';
    });
  },
  
  displayNone() {
    const rows = document.querySelectorAll('table tbody tr');
    rows.forEach( (el) => {
      el.style.display = 'none';
    });
  },
  
  /* Assign Click Actions to Buttons */
  navigation(sprint) {
    
    const nav = document.querySelectorAll('nav ul li a');
    nav.forEach( (button) => {
      button.addEventListener('click', (event) => {
        const element = event.target;  
        const id = element.getAttribute('id');        
        if (id === 'current') {
          this.displayCurrent(sprint);
        } else if (id === 'me') {
          this.displayMe();
        } else {
          this.displayAll();
        }
      });
    });
    
  },
  
};