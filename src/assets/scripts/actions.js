'use strict';

/**
 * Actions
 * User interaction event handlers such as button clicks, hover actions, etc.
 *
 */
export default class Actions {

  constructor() {
  }

  /**
   * DisplayCurrent
   * @param sprint Numeric sprint value (e.g.: 1, 2, 3)
   */
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
  }

  /**
   * DisplayMe
   * Limits results to those assigned to the current User
   * TODO: Remove hard-coded username and read from logged-in properties
   */
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
  }

  /**
   * DisplayAll
   * Display all records in the recordset
   */
  displayAll() {
    const rows = document.querySelectorAll('table tbody tr');
    rows.forEach( (el) => {
      el.style.display = 'table-row';
    });
    const future = document.querySelectorAll('.future');
    future.forEach( (el) => {
      el.style.display = 'table-cell';
    });
  }

  /**
   * DisplayNone
   * Hide all records
   */
  displayNone() {
    const rows = document.querySelectorAll('table tbody tr');
    rows.forEach( (el) => {
      el.style.display = 'none';
    });
  }

  /**
   * Tabs
   * Limits results to those assigned to the current User
   * @param target String value to assign to the current active tab
   */
  tabs(target) {
    const sections = document.querySelectorAll('section');
    sections.forEach( (sec) => {
      sec.classList.remove('active');
      if (target === sec.getAttribute('id')) {
        sec.classList.add('active');
      }
    });
  }


  /**
   * Toggle Source
   * Toggles the source bar at the bottom of the page
   */
  toggleSource() {
    const source = document.querySelector('.source');
    const state = source.classList;
    if (state.contains('closed')) {
      source.classList.remove('closed');
    } else {
      source.classList.add('closed');
    }
    return true;
  }


  enableSourceBar() {
    this.enableSourceForm();
    const button = document.querySelector('.source .handle');
    button.addEventListener('click', (event) => {
      this.toggleSource();
    });
  }

  enableSourceForm() {
    const form = document.querySelector('.source #frmSource');
    const button = form.querySelector('.formfield button');
    button.addEventListener('click', (event) => {
      event.preventDefault();

      const data = new FormData(form);

      console.log(data);

      fetch("http://localhost:3000", {
        method: "POST",
        mode: "cors",
        cache: "no-cache",
        headers:{
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })
      .then( res => res.json())
      .then( (response) => {
        console.log(JSON.stringify(response));
      })
      .catch( error => console.error('Error: ', error));

    });
  }


  /**
   * SetMenuStatus
   * Sets one of the navigation menu items to the active state
   * @param element target element to which status is applied
   * @param nav Object containing a navigation element
   */
  setMenuStatus(element, nav) {
    nav.forEach( (el) => {
      el.classList.remove('active');
    });
    element.classList.add('active');
  }

  /**
   * Navigation
   * Assign click actions to navigation buttons
   * @param sprint Numeric sprint value (e.g.: 1, 2, 3)
   */
  navigation(sprint) {

    this.enableSourceBar();

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

  }

}
