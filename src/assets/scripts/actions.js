let parse = require('./parse.js');

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

  tabs(target) {
    const sections = document.querySelectorAll('section');
    sections.forEach( (sec) => {
      sec.classList.remove('active');
      if (target === sec.getAttribute('id')) {
        sec.classList.add('active');
      }
    });
  },

  setMenuStatus(element, nav) {
    nav.forEach( (el) => {
      el.classList.remove('active');
    });
    element.classList.add('active');
  },

  /* Assign Click Actions to Buttons */
  navigation(sprint) {

    const nav = document.querySelectorAll('nav ul li a');
    nav.forEach( (button) => {
      button.addEventListener('click', (event) => {
        const element = event.target;
        const id = element.getAttribute('href').replace('#','');
        if (id === 'current') {
          this.displayCurrent(sprint);
        } else if (id === 'me') {
          this.displayMe();
        } else if (id === 'all') {
          this.displayAll();
        } else {
          this.tabs(id);
        }
        this.setMenuStatus(element, nav);
      });
    });

  },

};
