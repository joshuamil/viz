!function(t){function e(r){if(s[r])return s[r].exports;var a=s[r]={i:r,l:!1,exports:{}};return t[r].call(a.exports,a,a.exports,e),a.l=!0,a.exports}var s={};e.m=t,e.c=s,e.d=function(t,s,r){e.o(t,s)||Object.defineProperty(t,s,{configurable:!1,enumerable:!0,get:r})},e.n=function(t){var s=t&&t.__esModule?function(){return t.default}:function(){return t};return e.d(s,"a",s),s},e.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},e.p="/dist/",e(e.s=1)}([function(t,e,s){"use strict";t.exports={arrayContains:function(t,e){for(var s=0;s<t.length;s++)if(t[s]===e)return!0;return!1},parseLink:function(t,e){var s=e.replace("@value",t),r=document.createElement("a");return r.setAttribute("href",s),r.setAttribute("target","_blank"),r.appendChild(document.createTextNode(t)),r},parseValue:function(t,e){var s=t.split("."),r=e;return s.forEach(function(t){r&&r.hasOwnProperty(t)&&(r=r[t])}),r},parseData:function(t){var e=this,s=[],r={};return t.issues.forEach(function(a){r={},r.key=a.key,r.priority=a.fields.priority.name,r.description=a.fields.summary,r.status=a.fields.status.name,r.assignee=a.fields.assignee?a.fields.assignee.displayName:"",r.numtasks=1,r.debt="",r.risk=0,r.priority.toLowerCase().indexOf("block")>-1&&(r.risk=2),r.rank=6,r.priority.toLowerCase().indexOf("block")>-1?r.rank=0:r.priority.toLowerCase().indexOf("highest")>-1?r.rank=1:r.priority.toLowerCase().indexOf("high")>-1?r.rank=2:r.priority.toLowerCase().indexOf("medium")>-1?r.rank=3:r.priority.toLowerCase().indexOf("lowest")>-1?r.rank=5:r.priority.toLowerCase().indexOf("low")>-1&&(r.rank=4),r.estimate=a.fields.aggregatetimeoriginalestimate,r.timespent=a.fields.aggregatetimespent?a.fields.aggregatetimespent:0,r.remaining=r.estimate-r.timespent,isNaN(r.estimate)||(r.estimate=parseInt(parseInt(r.estimate,10)/3600,10)),isNaN(r.remaining)||(r.remaining=parseInt(parseInt(r.remaining,10)/3600,10)),r.epic=a.fields.customfield_10003,r.epic=e.getEpic(r.epic,t),r.sprint=a.fields.customfield_10007,r.sprint&&null!==r.sprint&&Array.isArray(r.sprint)&&(r.sprint=e.parseSprint(r.sprint)),r.sprint||(r.sprint={current:999,history:[]}),r.pushed=0,r.sprint&&r.sprint.history&&r.sprint.history.forEach(function(t,e){r.sprint.current===t?(r["sprint"+t]=r.remaining<0?"0":r.remaining,""!==r["sprint"+t]&&0!==r["sprint"+t]||(r["sprint"+t]="0")):(r["sprint"+t]="-",r.pushed++)}),s.push(r)}),s.sort(function(t,e){if(t.sprint)return t.sprint.current-e.sprint.current||t.rank-e.rank}),console.log("----- Data Object -----"),console.log(s),s},appendSprints:function(t,e){var s=[];return t.forEach(function(t){s.push(t),0===t.label.indexOf("Sprint")&&e.forEach(function(t){s.push(t)})}),t=s},parseSprint:function(t){var e="",s={};return s.raw=t,s.current=t[t.length-1],s.history=[],e=s.current.match(/(name=[^,]*,)/),null!==e&&Array.isArray(e)&&(s.current=e[e.length-1].replace(/([^0-9]*)/gi,"")),s.raw.forEach(function(t){var e=t.match(/(name=[^,]*,)/);e=e[e.length-1].replace(/([^0-9]*)/gi,""),s.history.includes(e)||s.history.push(e)}),s},getEpic:function(t,e){for(var s=0;s<e.issues.length;s++)if(e.issues[0].key===t)return e.issues[0].fields.summary;return t}}},function(t,e,s){"use strict";var r=s(0),a=s(2),n=s(3),i=s(5),l=s(6),o=s(7),p=s(8);s(9);!function(){var t=[l.baseUrl],e=function(t){return fetch(t).then(function(t){return t.json()}).then(function(t){return t})};Promise.all(t.map(e)).then(function(t){var e=t[0],s=r.appendSprints(o,p),c=r.parseData(e),d=a.parseAggregates(c,p,l);n.renderHeader(p,l,d),c.forEach(function(t){n.renderTable(t,s,l,d)}),n.renderAggregates(d),i.navigation(d.sprint)})}()},function(t,e,s){"use strict";t.exports={parseAggregates:function(t,e,s){var r={phase:0,sprint:0,risk:0,debt:0,mood:":|",totals:{sprint:{tasks:0,completed:0,rate:0,blockers:0,pushed:0,lost:0,incidents:0},project:{tasks:0,completed:0,rate:0,blockers:0,pushed:0,lost:0,incidents:0}},subtotals:[]};return r.sprint=this.getCurrentSprint(e),r.phase=this.getCurrentPhase(e),e.forEach(function(t){r.subtotals[t.field]={phase:parseInt(t.phase,10),sprint:parseInt(t.label.replace(/[^0-9]/g,""),10),class:t.class,tasks:0,completed:0,estimate:0,remaining:0,expected:0,spilled:0,hours:{dev:0,qa:0}}}),t.forEach(function(t){t.pushed&&t.pushed>0&&r.totals.project.pushed++,t.risk&&t.risk>0&&r.risk++,t.numtasks&&t.numtasks>0&&(r.totals.project.tasks++,"Done"===t.status&&r.totals.project.completed++,"Blocker"===t.priority&&r.totals.project.blockers++,parseInt(t.sprint.current,10)===parseInt(r.sprint,10)&&(r.totals.sprint.tasks++,"Done"===t.status&&r.totals.sprint.completed++,"Blocker"===t.priority&&r.totals.sprint.blockers++),t.sprint&&t.sprint.current&&r.subtotals.hasOwnProperty("sprint"+t.sprint.current)&&(r.subtotals["sprint"+t.sprint.current].tasks++,r.subtotals["sprint"+t.sprint.current].estimate+=isNaN(t.estimate)?0:t.estimate,r.subtotals["sprint"+t.sprint.current].remaining+=t.remaining,r.subtotals["sprint"+t.sprint.current].hours.dev=Math.ceil(r.subtotals["sprint"+t.sprint.current].estimate*s.hoursPerPoint*s.estimate.dev),r.subtotals["sprint"+t.sprint.current].hours.qa=Math.ceil(r.subtotals["sprint"+t.sprint.current].estimate*s.hoursPerPoint*s.estimate.qa)),e.forEach(function(e){t.hasOwnProperty(e.field)&&"-"===t[e.field]?(r.subtotals[e.field].tasks++,r.subtotals[e.field].spilled++,r.subtotals[e.field].estimate+=isNaN(t.estimate)?0:t.estimate,r.subtotals[e.field].remaining+=t.remaining,r.subtotals[e.field].hours.dev=Math.ceil(r.subtotals[e.field].estimate*s.hoursPerPoint*s.estimate.dev),r.subtotals[e.field].hours.qa=Math.ceil(r.subtotals[e.field].estimate*s.hoursPerPoint*s.estimate.qa)):t.hasOwnProperty(e.field)&&"Done"===t.status&&r.subtotals[e.field].completed++}))}),r.totals.project.rate=(r.totals.project.completed/r.totals.project.tasks*100).toFixed(2),r.totals.sprint.rate=(r.totals.sprint.completed/r.totals.sprint.tasks*100).toFixed(2),r.mood=this.getCurrentMood(r),console.log("----- Aggregate Data Object -----"),console.log(r),r},getCurrentSprint:function(t){var e=0;return t.forEach(function(t){t.class&&"current"===t.class&&(e=t.label.replace("Sprint ",""))}),parseInt(e,10)},getCurrentPhase:function(t){var e=0;return t.forEach(function(t){t.phase&&t.class&&"current"===t.class&&(e=t.phase)}),parseInt(e,10)},getCurrentMood:function(t){var e=0;t.risk>10?e+=5:t.risk>20?e+=10:t.risk>=25&&(e+=15),t.debt>0?e+=2:t.debt>10?e+=4:t.debt>=15?e+=6:t.debt>=25&&(e+=8),t.totals.sprint.expected<t.totals.sprint.rate?e-=5:t.totals.sprint.expected-t.totals.sprint.rate>10?e+=2:t.totals.sprint.expected-t.totals.sprint.rate>15?e+=4:t.totals.sprint.expected-t.totals.sprint.rate>20?e+=6:t.totals.sprint.expected-t.totals.sprint.rate>25&&(e+=8),t.totals.sprint.blockers>0&&(e+=25),e<=5?t.mood=":)":e>5&&e<=10?t.mood=":|":e>15&&e<=20?t.mood=":/":e>25&&(t.mood=":(")}}},function(t,e,s){"use strict";var r="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},a=s(0),n=s(4);t.exports={renderHeader:function(t,e,s){var r=void 0,n=void 0,i="",l="",o=void 0,p=void 0,c="",d=document.createElement("tr"),u=document.createElement("tr"),f=document.createElement("tr"),h=document.querySelector("#release-plan thead"),b=h.querySelector("tr"),m=b.querySelectorAll("th"),y=[],g=parseInt(e.sprintsPerPhase,10);m.forEach(function(e){"Sprint"===e.innerText?(d.appendChild(e),t.forEach(function(t){a.arrayContains(y,t.phase)||(c="",s&&parseInt(s.phase,10)===parseInt(t.phase,10)&&(c="current"),r=document.createElement("th"),r.setAttribute("colspan",g),r.setAttribute("class",c+" phase phase"+t.phase+" "+t.class),r.appendChild(document.createTextNode("Phase "+t.phase))),n=document.createElement("th"),n.setAttribute("class","sprint nowrap "+t.class),n.appendChild(document.createTextNode(t.label)),i=document.createElement("th"),i.setAttribute("class","dates nowrap "+t.class),o=new Date(t.startDate),p=new Date(t.endDate),l=o.getMonth()+1+"/"+o.getDate(),l+="-"+(p.getMonth()+1)+"/"+p.getDate(),i.appendChild(document.createTextNode(l)),a.arrayContains(y,t.phase)||(d.appendChild(r),y.push(t.phase)),u.appendChild(n),f.appendChild(i)})):d.appendChild(e)}),h.removeChild(b),h.appendChild(d),h.appendChild(u),h.appendChild(f)},renderTable:function(t,e,s,n){var i=document.querySelector("#release-plan tbody"),l=void 0,o=void 0,p="",c="";l=document.createElement("tr"),l.setAttribute("id",t.key),l.setAttribute("data-sprint",t.sprint.current),l.setAttribute("data-assignee",t.assignee),t.priority.toLowerCase().indexOf("block")>-1&&l.setAttribute("class","blocker"),i.appendChild(l),e.forEach(function(e,s){if(p=e.label,c=t[e.field],e.field.indexOf(".")>-1&&(c=a.parseValue(e.field,t)),o=document.createElement("td"),e.field.indexOf("sprint")>-1&&999===c&&(c=""),e.class.indexOf("@value")>-1){var n=c.toLowerCase().replace(/(\s){1,}/gi,"-");o.setAttribute("class",n+" "+e.class)}else e.phase&&-1===e.class.indexOf("phase")&&(e.class+=" phase"+e.phase),o.setAttribute("class",e.class);if("object"!==(void 0===c?"undefined":r(c)))if(e.title&&o.setAttribute("title",c),e.hidden)o.setAttribute("data-value",c);else if(e.link&&""!==e.link){var i=a.parseLink(c,e.link);o.appendChild(i)}else c&&""!==c&&(o.appendChild(document.createTextNode(c)),"-"===c&&o.setAttribute("class",e.class+" pushed"),t.sprint&&t.sprint.current&&"-"!==c&&p.indexOf("Sprint ")>-1&&o.setAttribute("class",e.class+" active"));l.appendChild(o)})},renderAggregates:function(t){var e=void 0,s=void 0,r=void 0,a=void 0,i=void 0,l=void 0,o=void 0,p=void 0,c=void 0,d=document.querySelector("table");c='<tr><td colspan="6" class="empty label"></td>';for(var u in t.subtotals){var f=t.subtotals[u].tasks/t.totals.project.tasks*100,h=t.subtotals[u].completed/t.totals.project.tasks*100,b=h<100?"bad":"good",m=parseInt(t.subtotals[u].spilled,10)>0?"warning":"white",y="phase"+t.subtotals[u].phase,g=t.subtotals[u].class;e+='<td class="'+g+' total">'+t.subtotals[u].estimate+"</td>",s+='<td class="'+g+' subtotal">'+t.subtotals[u].hours.dev+"</td>",r+='<td class="'+g+' subtotal">'+t.subtotals[u].hours.qa+"</td>",a+='<td class="'+g+" "+m+" "+y+'">'+t.subtotals[u].spilled+"</td>",i+='<td class="'+g+" subtotal "+y+'">'+t.subtotals[u].tasks+"</td>",l+='<td class="'+g+" total "+y+'">'+f+"%</td>",o+='<td class="'+g+" subtotal "+y+'">'+t.subtotals[u].completed+"</td>",p+='<td class="'+g+" subtotal "+b+'">'+h+"%</td>",c+='<td class="'+g+" empty "+y+'"></td>'}c+='<td colspan="5" class="empty plain"></td></tr>';var v=n('<tfoot>\n      <tr><td colspan="6" class="label">Total story points per Sprint</td>'+e+'<td colspan="5" class="plain"></td></tr>\n      <tr><td colspan="6" class="label">Total Dev Hours per Sprint</td>'+s+'<td colspan="5" class="plain"></td></tr>\n      <tr><td colspan="6" class="label">Total QA Hours per Sprint</td>'+r+'<td colspan="5" class="plain"></td></tr>\n      <tr><td colspan="6" class="label">Stories Spilled across Sprints</td>'+a+'<td colspan="5" class="plain"></td></tr>\n      '+c+'\n      <tr><td colspan="6" class="label">Total Stories by Sprint</td>'+i+'<td colspan="5" class="plain"></td></tr>\n      <tr><td colspan="6" class="label">Target Completion Percentage</td>'+l+'<td colspan="5" class="plain"></td></tr>\n      '+c+'\n      <tr><td colspan="6" class="label">Sprint Stories Completed</td>'+o+'<td colspan="5" class="plain"></td></tr>\n      <tr><td colspan="6" class="label">Sprint Completion Percentage</td>'+p+'<td colspan="5" class="plain"></td></tr>\n    </tfoot>');d.appendChild(v)}}},function(t,e,s){"use strict";function r(t){var e="div",s=0;"tr"!==t.substring(1,3)&&"td"!==t.substring(1,3)&&"th"!==t.substring(1,3)&&"tbody"!==t.substring(1,6)&&"thead"!==t.substring(1,6)&&"tfoot"!==t.substring(1,6)&&"caption"!==t.substring(1,8)&&"col"!==t.substring(1,4)&&"colgroup"!==t.substring(1,9)||(e="table"),"tbody"!==t.substring(1,6)&&"thead"!==t.substring(1,6)&&"tfoot"!==t.substring(1,6)||(s=0),"tr"===t.substring(1,3)&&(s=1),"td"!==t.substring(1,3)&&"th"!==t.substring(1,3)||(s=2);var r=document.createElement(e);return r.innerHTML=t,2===s?r.childNodes[0].childNodes[0].childNodes[0]:1===s?r.childNodes[0].childNodes[0]:r.childNodes[0]}t.exports=r},function(t,e,s){"use strict";s(0);t.exports={displayCurrent:function(t){this.displayNone(),document.querySelectorAll(".future").forEach(function(t){t.style.display="none"}),document.querySelectorAll('[data-sprint="'+t+'"]').forEach(function(t){t.style.display="table-row"})},displayMe:function(){document.querySelectorAll("table tbody tr").forEach(function(t){t.style.display="none"}),document.querySelectorAll('[data-assignee="Joshua Miller"]').forEach(function(t){t.style.display="table-row"})},displayAll:function(){document.querySelectorAll("table tbody tr").forEach(function(t){t.style.display="table-row"}),document.querySelectorAll(".future").forEach(function(t){t.style.display="table-cell"})},displayNone:function(){document.querySelectorAll("table tbody tr").forEach(function(t){t.style.display="none"})},navigation:function(t){var e=this;document.querySelectorAll("nav ul li a").forEach(function(s){s.addEventListener("click",function(s){var r=s.target,a=r.getAttribute("id");"current"===a?e.displayCurrent(t):"me"===a?e.displayMe():e.displayAll()})})}}},function(t,e){t.exports={hideFutureSprints:!1,sprintsPerPhase:3,hoursPerPoint:1,estimate:{dev:.66,qa:.34},risk:{blocker:2,delay:1,early:-1,debt:.25,resourceDeficitHourBlocks:25},baseUrl:"http://localhost/viz/src/assets/data/sample-full.json",jiraUrl:"https://daymon.atlassian.net/rest/api/2/search?jql=project%20%3D%20NES%20and%20status%20!%3D%20resolved%20and%20type%20in%20(story,epic,bug,task)%20order%20by%20rank%20&maxResults=1000&startAt=0"}},function(t,e){t.exports=[{label:"Priority",field:"priority",class:"priority @value",hidden:!0,title:!0},{label:"Epic",field:"epic",class:"nowrap"},{label:"Description",field:"description",class:"left wide"},{label:"Identifier",field:"key",class:"nowrap",link:"https://daymon.atlassian.net/browse/@value"},{label:"Estimate",field:"estimate",class:""},{label:"Sprint",field:"sprint.current",class:""},{label:"Status",field:"status",class:"status @value"},{label:"Risk",field:"risk",class:"risk"},{label:"Debt",field:"debt",class:"debt grey-10"},{label:"Pushed",field:"pushed",class:"pushed grey-10"},{label:"Assignee",field:"assignee",class:"left"}]},function(t,e){t.exports=[{label:"Sprint 18",field:"sprint18",startDate:"08/14/2017",endDate:"08/28/2017",phase:"1",class:"past"},{label:"Sprint 19",field:"sprint19",startDate:"08/29/2017",endDate:"09/11/2017",phase:"1",class:"past"},{label:"Sprint 20",field:"sprint20",startDate:"09/12/2017",endDate:"09/25/2017",phase:"1",class:"current"},{label:"Sprint 21",field:"sprint21",startDate:"09/26/2017",endDate:"10/09/2017",phase:"2",class:"future"},{label:"Sprint 22",field:"sprint22",startDate:"10/10/2017",endDate:"10/23/2017",phase:"2",class:"future"},{label:"Sprint 23",field:"sprint23",startDate:"10/24/2017",endDate:"11/06/2017",phase:"2",class:"future"},{label:"Sprint 24",field:"sprint24",startDate:"11/07/2017",endDate:"11/20/2017",phase:"3",class:"future"},{label:"Sprint 25",field:"sprint25",startDate:"11/21/2017",endDate:"12/04/2017",phase:"3",class:"future"},{label:"Sprint 26",field:"sprint26",startDate:"12/05/2017",endDate:"12/18/2017",phase:"3",class:"future"},{label:"Sprint 27",field:"sprint27",startDate:"12/19/2017",endDate:"01/01/2018",phase:"4",class:"future"},{label:"Sprint 28",field:"sprint28",startDate:"01/02/2018",endDate:"01/15/2018",phase:"4",class:"future"},{label:"Sprint 29",field:"sprint29",startDate:"01/16/2018",endDate:"01/29/2018",phase:"4",class:"future"},{label:"Sprint 30",field:"sprint30",startDate:"01/30/2018",endDate:"02/12/2018",phase:"5",class:"future"},{label:"Sprint 31",field:"sprint31",startDate:"02/13/2018",endDate:"02/26/2018",phase:"5",class:"future"},{label:"Sprint 32",field:"sprint32",startDate:"02/27/2018",endDate:"03/12/2018",phase:"5",class:"future"}]},function(t,e){}]);
//# sourceMappingURL=bundle.js.map