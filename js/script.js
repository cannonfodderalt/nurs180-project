const hours = ["8am", "9am", "10am", "11am", "12pm", "1pm", "2pm", "3pm", "4pm", "5pm"];

function buildScheduleTable() {
    const body = document.getElementById("schedule-table-body");
    const schedule = JSON.parse(localStorage.getItem("schedule") || "{}");
    body.innerHTML = "";

    hours.forEach(time => {
    const tr = document.createElement("tr");
    const timeCell = document.createElement("td");
    timeCell.textContent = time;
    tr.appendChild(timeCell);

    for (let d = 1; d <= 7; d++) {
        const td = document.createElement("td");
        const key = `${time}-${d}`;
        if (schedule[key]) {
        td.textContent = schedule[key];
        }
        tr.appendChild(td);
    }

    body.appendChild(tr);
    });
}

function addSchedule() {
    const time = document.getElementById("time-slot").value.trim();
    const text = document.getElementById("event-text").value.trim();
    const day = document.getElementById("day-select").value;
    if (!time || !text) return;

    const key = `${time}-${day}`;
    const schedule = JSON.parse(localStorage.getItem("schedule") || "{}");
    schedule[key] = text;
    localStorage.setItem("schedule", JSON.stringify(schedule));
    buildScheduleTable();
    document.getElementById("time-slot").value = "";
    document.getElementById("event-text").value = "";
}

function loadTodos() {
    const todos = JSON.parse(localStorage.getItem("todos") || "[]");
    const list = document.getElementById("todo-list");
    list.innerHTML = "";
    todos.forEach((item, index) => {
    const li = document.createElement("li");
    li.innerHTML = `${item} <button onclick="removeTodo(${index})">❌</button>`;
    list.appendChild(li);
    });
}

function addTodo() {
    const input = document.getElementById("todo-input");
    const todos = JSON.parse(localStorage.getItem("todos") || "[]");
    if (input.value.trim()) {
    todos.push(input.value.trim());
    localStorage.setItem("todos", JSON.stringify(todos));
    input.value = "";
    loadTodos();
    }
}

function removeTodo(index) {
    const todos = JSON.parse(localStorage.getItem("todos") || "[]");
    todos.splice(index, 1);
    localStorage.setItem("todos", JSON.stringify(todos));
    loadTodos();
}

// Initial load
loadTodos();
buildScheduleTable();