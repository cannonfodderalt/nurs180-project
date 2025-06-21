// To-Do List
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

// Schedule
function loadSchedule() {
    const events = JSON.parse(localStorage.getItem("schedule") || "[]");
    const list = document.getElementById("schedule-list");
    list.innerHTML = "";
    events.forEach((item, index) => {
    const li = document.createElement("li");
    li.innerHTML = `${item} <button onclick="removeSchedule(${index})">❌</button>`;
    list.appendChild(li);
    });
}

function addSchedule() {
    const input = document.getElementById("schedule-input");
    const events = JSON.parse(localStorage.getItem("schedule") || "[]");
    if (input.value.trim()) {
    events.push(input.value.trim());
    localStorage.setItem("schedule", JSON.stringify(events));
    input.value = "";
    loadSchedule();
    }
}

function removeSchedule(index) {
    const events = JSON.parse(localStorage.getItem("schedule") || "[]");
    events.splice(index, 1);
    localStorage.setItem("schedule", JSON.stringify(events));
    loadSchedule();
}

// Initial load
loadTodos();
loadSchedule();