const addBtn = document.getElementById("add-task-btn") as HTMLButtonElement;
const modal = document.getElementById("modal-overlay") as HTMLElement;
const closeBtn = document.getElementById(
  "close-modal-btn",
) as HTMLButtonElement;
const cancelBtn = document.getElementById("cancel-btn") as HTMLButtonElement;
const title = document.getElementById("task-title") as HTMLInputElement;
const description = document.getElementById(
  "task-description",
) as HTMLInputElement;
const priority = document.getElementById("task-priority") as HTMLSelectElement;
const date = document.getElementById("task-due-date") as HTMLInputElement;
date.setAttribute("value", new Date().toISOString().slice(0, 10));
const form = document.getElementById("task-form") as HTMLFormElement;
const emptyMessageErorr = document.getElementById(
  "title-empty-error",
) as HTMLElement;
const formatMessageErorr = document.getElementById(
  "title-format-error",
) as HTMLElement;
const errorMessageInput = document.getElementById("date-error") as HTMLElement;
let editingTaskId: number | null = null;
let editingColumn: column | null = null;



type column = "todo" | "in-progress" | "completed";
interface task {
  id: number;
  title: string;
  description: string;
  priority: string;
  date: string;
  completed: boolean;
  startDate: string;
}
interface tasks {
  todo: task[];
  "in-progress": task[];
  completed: task[];
}
let tasks: tasks = {
  todo: [],
  "in-progress": [],
  completed: [],
};
if (localStorage.getItem("tasks")) {
  tasks = JSON.parse(localStorage.getItem("tasks")!) as tasks;
}
function emptyMessage(col: column): void {
  const tasks = document.getElementById(`tasks-${col}`) as HTMLElement;
  tasks.innerHTML = `<div class="flex flex-col items-center justify-center py-12 text-slate-400">
              <i class="fa-regular fa-folder-open text-4xl mb-3 opacity-50"></i>
              <p class="text-sm">No tasks yet</p>
              <p class="text-xs mt-1">Click + to add one</p>
            </div>`;
}

addBtn.onclick = openModal;
cancelBtn.onclick = closeModal;
closeBtn.onclick = closeModal;
function openModal(): void {
  modal.classList.remove("hidden");
  modal.classList.add("flex");
}
function closeModal(): void {
  modal.classList.add("hidden");
  modal.classList.remove("flex");
  editingTaskId = null;
  editingColumn = null;
  document.getElementById("modal-title")!.innerText = "Create New Task";
  document.getElementById("submit-btn-text")!.innerText = "Add Task";
  form.reset();
  removeErorr();
}
function addTasks(): void {
  const task: task = {
    id: Date.now(),
    title: title.value,
    description: description.value,
    priority: priority.value,
    date: date.value,
    completed: false,
    startDate: new Date().toISOString(),
  };
  tasks.todo.push(task);
  save();
  closeModal();
  showNotification("Task added successfully", "success");
}
function save(): void {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}
form.onsubmit = (e) => {
  e.preventDefault();
  if (!validationTitle() && !validationDate()){
   showNotification("Not Allowed to add task", "error");
return;
  } 

  if (editingTaskId !== null) {
    updateTask();
  } else {
    addTasks();
    renderTasks();
  }
};
renderTasks();
function renderTasks() {
  ["todo", "in-progress", "completed"].forEach((col) => {
    if (tasks[col as column].length === 0) {
      emptyMessage(col as column);
    }
    const taskColumn = document.getElementById(
      `tasks-${col as column}`,
    ) as HTMLElement;
    console.log(taskColumn);
    let box = ``;

    document.querySelector(`[data-status="${col as column}"] p`)!.textContent =
      `${tasks[col as column].length} tasks`;
    tasks[col as column].forEach((task) => {
      box += `<div
              class="group bg-white rounded-xl p-4 shadow-sm border border-slate-100 hover:shadow-md hover:border-slate-200 transition-all duration-200 ring-2 ring-red-100 border-red-200"
              data-task-id="${task.id}">
              <!-- Top Bar -->
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center gap-2">
                ${col === "todo" ? `<span class="w-2 h-2 rounded-full bg-slate-300"></span>` : ``}
                ${col === "in-progress" ? `<span class="w-2 h-2 rounded-full bg-amber-400"></span>` : ``}
                ${col === "completed" ? `<span class="w-2 h-2 rounded-full bg-emerald-500"></span>` : ``}
                  <span class="text-[10px] font-medium text-slate-400 uppercase tracking-wider">${task.id.toString().slice(-3)}</span>
                </div>
                <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onclick="editTask('${col}',${task.id})"
                    class="edit-btn text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                     title="Edit task">
                    <i class="fa-solid fa-pen text-xs pointer-events-none"></i>
                  </button>
                  <button onclick="deleteTask('${col}',${task.id})"
                    class="delete-btn text-slate-400 hover:text-red-500 hover:bg-red-50 w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                     title="Delete task">
                    <i class="fa-solid fa-trash-can text-xs pointer-events-none"></i>
                  </button>
                </div>
              </div>

              <!-- Title -->
              <h3 class="font-semibold text-slate-800 mb-2 leading-snug">
                ${task.title}
              </h3>

              <!-- Description -->

              <p class="text-slate-500 text-sm mb-4 leading-relaxed line-clamp-2">
                ${task.description}
              </p>

              <!-- Tags Row -->
              <div class="flex flex-wrap items-center gap-2 mb-4">
                <!-- Priority Badge -->
                ${
                  task.priority === "low"
                    ? `<span
                  class="bg-blue-50 text-blue-600 text-[10px] font-semibold px-2 py-1 rounded-full flex items-center gap-1.5 uppercase tracking-wide">
                  <span class="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                  Low
                </span>`
                    : ``
                }
                ${
                  task.priority === "medium"
                    ? `<span
                  class="bg-amber-50 text-amber-600 text-[10px] font-semibold px-2 py-1 rounded-full flex items-center gap-1.5 uppercase tracking-wide">
                  <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                  Medium
                </span>`
                    : ``
                }
                ${
                  task.priority === "high"
                    ? `<span
                  class="bg-red-50 text-red-600 text-[10px] font-semibold px-2 py-1 rounded-full flex items-center gap-1.5 uppercase tracking-wide">
                  <span class="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                  High Priority
                </span>`
                    : ``
                }
                
                ${showBadgeState(task.date, task.completed)}
               </div>
              <!-- Meta Info -->
              <div class="flex items-center gap-3 text-xs text-slate-400 pb-3 mb-3 border-b border-slate-100">
                ${showDueDate(task.date)}

                <div class="flex items-center gap-1.5" title="Created 1/21/2026, 8:16:46 AM">
                  <i class="fa-regular fa-clock"></i>
                  <span>${timeAgo(task.startDate)}</span>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="flex flex-wrap gap-2">
                ${
                  col !== "todo"
                    ? `<button
                  class="status-btn text-[11px] px-3 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center gap-1.5 hover:scale-105 active:scale-95 bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-700"
                  data-task-id="${task.id}" onclick="changeColumn('${col}','todo',${task.id})" data-status="todo">
                  <i class="fa-solid fa-arrow-rotate-left pointer-events-none"></i>
                  <span class="pointer-events-none">To Do</span>
                </button>`
                    : ``
                }
                ${
                  col !== "in-progress"
                    ? `<button
                  class="status-btn text-[11px] px-3 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center gap-1.5 hover:scale-105 active:scale-95 bg-amber-100 text-amber-700 hover:bg-amber-200"
                  data-task-id="${task.id}" onclick="changeColumn('${col}','in-progress',${task.id})" data-status="in-progress">
                  <i class="fa-solid fa-play pointer-events-none"></i>
                  <span class="pointer-events-none">Start</span>
                </button>`
                    : ``
                }
                ${
                  col !== "completed"
                    ? `<button
                  class="status-btn text-[11px] px-3 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center gap-1.5 hover:scale-105 active:scale-95 bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                  data-task-id="${task.id}" onclick="changeColumn('${col}','completed',${task.id})" data-status="completed">
                  <i class="fa-solid fa-check pointer-events-none"></i>
                  <span class="pointer-events-none">Complete</span>
                </button>`
                    : ``
                }  
              </div>
            </div>`;
    });
    taskColumn.innerHTML = box;
  });
}

function showBadgeState(date: string, completed: boolean) {
  if (completed) {
    return `<span
                  class="bg-emerald-100 text-emerald-600 text-[10px] font-semibold px-2 py-1 rounded-full uppercase tracking-wide flex items-center gap-1">
                  <i class="fa-solid fa-check"></i>
                  Completed
                </span>`;
  } else {
    const today: number = parseInt(
      new Date().toISOString().slice(0, 10).split("-").join(""),
    );
    const dueDate: number = parseInt(
      new Date(date).toISOString().slice(0, 10).split("-").join(""),
    );
    const daysNumber: number = dueDate - today;
    if (daysNumber === 0) {
      return `<span
                  class="bg-red-100 text-red-600 text-[10px] font-semibold px-2 py-1 rounded-full uppercase tracking-wide flex items-center gap-1">
                  <i class="fa-solid fa-triangle-exclamation"></i>
                  Overdue
                </span>`;
    } else if (daysNumber === 1 || daysNumber === 2) {
      return `<span
                  class="bg-orange-100 text-orange-600 text-[10px] font-semibold px-2 py-1 rounded-full uppercase tracking-wide">
                  Due Soon
                </span>`;
    } else {
      return ``;
    }
  }
}
function showDueDate(date: string) {
  const today: number = parseInt(
    new Date().toISOString().slice(0, 10).split("-").join(""),
  );
  const dueDate: number = parseInt(
    new Date(date).toISOString().slice(0, 10).split("-").join(""),
  );
  const dateString: string = new Date(date).toDateString();
  const daysNumber: number = dueDate - today;
  if (daysNumber === 0) {
    return `<div class="flex items-center gap-1.5 text-red-500">
                  <i class="fa-regular fa-calendar"></i>
                  <span>${dateString.split(" ").slice(1, 3).join(" ")}</span>
                </div>`;
  } else if (daysNumber === 1 || daysNumber === 2) {
    return `<div class="flex items-center gap-1.5 text-orange-500">
                  <i class="fa-regular fa-calendar"></i>
                  <span>${dateString.split(" ").slice(1, 3).join(" ")}</span>
                </div>`;
  } else {
    return `<div class="flex items-center gap-1.5">
                  <i class="fa-regular fa-calendar"></i>
                  <span>${dateString.split(" ").slice(1, 3).join(" ")}</span>
                </div>`;
  }
}
function timeAgo(date: string) {
  const taskDate: Date = new Date(date);
  const now: Date = new Date();
  const diffMs = now.getTime() - taskDate.getTime();

  const diffMinutes = Math.floor(diffMs / 1000 / 60);
  const diffHours = Math.floor(diffMs / 1000 / 60 / 60);
  const diffDays = Math.floor(diffMs / 1000 / 60 / 60 / 24);
  if (diffMinutes < 1) {
    return "just now";
  } else if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  } else if (diffHours < 24) {
    return `${diffHours}h ago`;
  } else {
    return `${diffDays}d ago`;
  }
}

function changeColumn(from: column, to: column, taskId: number) {
  const task = tasks[from].find((task) => task.id === taskId)!;
  tasks[from] = tasks[from].filter((task) => task.id !== taskId);
  if (to === "completed") {
    task.completed = true;
  } else {
    task.completed = false;
  }
  tasks[to].push(task);
  save();
  renderTasks();
}

function deleteTask(from: column, taskId: number): void {
  tasks[from] = tasks[from].filter((task) => task.id !== taskId);
  save();
  renderTasks();
  showNotification("Task deleted successfully", "success");
}
function editTask(from: column, taskId: number): void {
  editingTaskId = taskId;
  editingColumn = from;
  const task = tasks[from].find((task) => task.id === taskId)!;
  openModal();
  title.value = task.title;
  description.value = task.description;
  priority.value = task.priority;
  date.value = task.date;
  document.getElementById("modal-title")!.innerText = "Edit Task";
  document.getElementById("submit-btn-text")!.innerText = "Save Changes";
}
function updateTask(): void {
  const task = tasks[editingColumn!].find((task) => task.id === editingTaskId)!;
  task.title = title.value;
  task.description = description.value;
  task.priority = priority.value;
  task.date = date.value;
  task.startDate = new Date().toISOString();
  save();
  renderTasks();
  closeModal();
  showNotification("Task updated successfully", "success");
}

function validationDate(): boolean {
  const today: Date = new Date();
  const dueDate: Date = new Date(date.value);

  if (dueDate < today) {
    errorMessageInput.classList.remove("hidden");
    date.classList.add(
      "focus:border-red-500",
      "focus:ring-red-500",
      "border-red-500",
    );
    date.classList.remove(
      "focus:border-indigo-500",
      "focus:ring-indigo-500",
      "border-slate-300",
    );
    return false;
  } else {
    removeErorr();
    return true;
  }
}

function validationTitle(): boolean {
  const titleInput = title.value;

  if (!titleInput) {
    emptyMessageErorr.classList.remove("hidden");
    formatMessageErorr.classList.add("hidden");
    title.classList.add(
      "focus:border-red-500",
      "focus:ring-red-500",
      "border-red-500",
    );
    title.classList.remove(
      "focus:border-indigo-500",
      "focus:ring-indigo-500",
      "border-slate-300",
    );
    return false;
  } else if (titleInput.length < 3) {
    emptyMessageErorr.classList.add("hidden");
    formatMessageErorr.classList.remove("hidden");
    title.classList.add(
      "focus:border-red-500",
      "focus:ring-red-500",
      "border-red-500",
    );
    title.classList.remove(
      "focus:border-indigo-500",
      "focus:ring-indigo-500",
      "border-slate-300",
    );
    return false;
  } else {
    removeErorr();
    return true;
  }
}
function removeErorr(): void {
  emptyMessageErorr.classList.add("hidden");
  formatMessageErorr.classList.add("hidden");
  title.classList.remove(
    "focus:border-red-500",
    "focus:ring-red-500",
    "border-red-500",
  );
  title.classList.add(
    "focus:border-indigo-500",
    "focus:ring-indigo-500",
    "border-slate-300",
  );
  errorMessageInput.classList.add("hidden");
  date.classList.remove(
    "focus:border-red-500",
    "focus:ring-red-500",
    "border-red-500",
  );
  date.classList.add(
    "focus:border-indigo-500",
    "focus:ring-indigo-500",
    "border-slate-300",
  );
}
 function showNotification(t: string, e: string): void {
        const s = document.querySelector(".notification");
        s == null || s.remove();
        const i = document.createElement("div");
        i.className = `notification ${e}`,
        i.textContent = t,
        document.body.appendChild(i),
        setTimeout( () => {
            i.classList.add("fade-out"),
            setTimeout( () => i.remove(), 500)
        }
        , 3000)
    }