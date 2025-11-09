let currentWeekOffset = 0;
let newsData = [];

function loadJSON() {
  fetch("data/usd-high-impact.json")
    .then(res => res.json())
    .then(data => {
      newsData = data;
      renderWeek();
    });
}

function renderWeek() {
  const today = new Date();
  const start = new Date(today.setDate(today.getDate() - today.getDay() + (7 * currentWeekOffset)));
  const end = new Date(start);
  end.setDate(start.getDate() + 6);

  document.getElementById("weekRange").textContent = `${start.toDateString()} - ${end.toDateString()}`;

  const tbody = document.getElementById("newsTable");
  tbody.innerHTML = "";

  const weekEvents = newsData.filter(event => {
    const d = new Date(event.date);
    return d >= start && d <= end;
  });

  weekEvents.forEach(event => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${event.date}</td>
      <td>${event.time}</td>
      <td>${event.event}</td>
      <td>🔴 ${event.impact}</td>
      <td>${event.forecast}</td>
    `;
    tbody.appendChild(row);
  });
}

document.getElementById("prevWeek").addEventListener("click", () => {
  currentWeekOffset -= 1;
  renderWeek();
});

document.getElementById("nextWeek").addEventListener("click", () => {
  currentWeekOffset += 1;
  renderWeek();
});

loadJSON();
