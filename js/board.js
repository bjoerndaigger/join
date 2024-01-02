let contacts = [];
let filteredTasks = [];
let currentDraggedElement;


/**
 * Initializes the board
 */
async function initBoard() {
    await loadBoardHeaderAndSidebar();
    await loadBoardData();
}


/**
 * Loads the header and sidebar.
 * @returns {Promise<void>} A promise that resolves when the operation is complete
 */
async function loadBoardHeaderAndSidebar() {
    await includeHTML();
    navLinkActive('nav-board');
}


/**
 * Loads data for the board, including tasks and contacts.
 * @returns {Promise<void>} A promise that resolves when the operation is complete
 */
async function loadBoardData() {
    tasks = JSON.parse(await getItem('tasks'));
    contacts = JSON.parse(await getItem('contacts'));
    updateId();
    updateBoard();
}


/**
 * Updates the board and generating HTML elements
 */
function updateBoard() {
    updateTasksHTML();
    generateUsers();
    generateProgressBar();
    generateCategoryColor();
}


/**
 * Updates the IDs of tasks in the array
 */
function updateId() {
    for (let i = 0; i < tasks.length; i++) {
        tasks[i].id = i;
        saveTasks();
    }
}


/**
 * Saves the updated tasks to storage
 */
async function saveTasks() {
    await setItem('tasks', JSON.stringify(tasks));
}


/**
 * Updates the HTML elements for the tasks on the board
 */
function updateTasksHTML() {
    updateToDo();
    updateInProgress();
    updateAwaitingFeedback();
    updateDone();
}


/**
 * Updates the "To Do" column on the board
 */
function updateToDo() {
    let toDo = tasks.filter(t => t['status'] == 'to-do');
    document.getElementById('to-do').innerHTML = '';
    for (let i = 0; i < toDo.length; i++) {
        const task = toDo[i];
        document.getElementById('to-do').innerHTML += generateTasksHTML(task);
    }
}


/**
 * Updates the "In Progress" column on the board
 */
function updateInProgress() {
    let inProgress = tasks.filter(t => t['status'] == 'in-progress');
    document.getElementById('in-progress').innerHTML = '';
    for (let i = 0; i < inProgress.length; i++) {
        const task = inProgress[i];
        document.getElementById('in-progress').innerHTML += generateTasksHTML(task);
    }
}


/**
 * Updates the "Awaiting Feedback" column on the board
 */
function updateAwaitingFeedback() {
    let awaitingFeedback = tasks.filter(t => t['status'] == 'awaiting-feedback');
    document.getElementById('awaiting-feedback').innerHTML = '';
    for (let i = 0; i < awaitingFeedback.length; i++) {
        const task = awaitingFeedback[i];
        document.getElementById('awaiting-feedback').innerHTML += generateTasksHTML(task);
    }
}


/**
 * Updates the "Done" column on the board
 */
function updateDone() {
    let done = tasks.filter(t => t['status'] == 'done');
    document.getElementById('done').innerHTML = '';
    for (let i = 0; i < done.length; i++) {
        const task = done[i];
        document.getElementById('done').innerHTML += generateTasksHTML(task);
    }
}


/**
 * Highlights drag area while moving
 */
function highlight(id) {
    document.getElementById(id).classList.add('drag-area-highlight');
}


/**
 * Removes highlight drag area while moving
 */
function removeHighlight(id) {
    document.getElementById(id).classList.remove('drag-area-highlight');
}


/**
 * Sets the current dragged element
 * @param {number} id - The ID of the dragged element
 */
function startDragging(id) {
    currentDraggedElement = id;
}


/**
 * Allows dropping of elements during drag and drop
 * @param {Event} ev - The drag event
 */
function allowDrop(ev) {
    ev.preventDefault();
}


/**
 * Moves the current dragged task to the specified status and updates the board
 * @param {string} status - The status to move the task to
 */
async function moveTo(status) {
    tasks[currentDraggedElement]['status'] = status;
    await saveTasks();
    updateBoard();
}


/**
 * Moves a task to the specified status based on its index and updates the board
 * @param {number} taskIndex - The index of the task to move
 * @param {string} status - The status to move the task to
 */
async function moveTask(taskIndex, status) {
    tasks[taskIndex].status = status;
    await saveTasks();
    updateBoard();
    closePopupCard();
}


/**
 * Finds tasks based on the search value and updates the board
 */
function findTasks() {
    let searchValue = document.querySelector('.search-box input').value;
    searchValue = searchValue.toLowerCase();
    filteredTasks = filterTasksBySearch(searchValue);
    updateBoard();
}


/**
 * Filters tasks based on the search value
 * @param {string} searchValue - The search value to filter tasks
 * @returns {Array} - The filtered tasks
 */
function filterTasksBySearch(searchValue) {
    let filteredTasks = [];

    if (searchValue.length > 0) {
        for (let i = 0; i < tasks.length; i++) {
            let taskTitle = tasks[i].title;
            taskTitle = taskTitle.toLowerCase();
            let taskDescription = tasks[i].description;
            taskDescription = taskDescription.toLowerCase();

            if (taskTitle.includes(searchValue) || taskDescription.includes(searchValue)) {
                filteredTasks.push(tasks[i]);
            }
        }
    }

    return filteredTasks;
}


/**
 * Generates the HTML for a task
 * @param {Object} task - The task object
 * @returns {string} - The HTML string for the task
 */
function generateTasksHTML(task) {
    if (filteredTasks.length > 0 && !filteredTasks.includes(task)) {
        return ''; // If the task object is not in the filteredTasks array, return an empty string and do not display the task
    } else {
        return tasksHTML(task);
    }
}


/**
 * Generates the category color for each task
 */
function generateCategoryColor() {
    for (let taskIndex = 0; taskIndex < tasks.length; taskIndex++) {
        let cardCategory = document.getElementById(`card-category-${taskIndex}`);
        if (cardCategory !== null) {
            cardCategory.style.backgroundColor = tasks[taskIndex].categoryColor;
        }
    }
}


/**
 * Generates the progress bar and value for each task
 */
function generateProgressBar() {
    for (let i = 0; i < tasks.length; i++) {
        let subtasksChecked = tasks[i].subtask.filter(subtask => subtask.checked === true);
        let percent = calculatePercent(i, subtasksChecked);
        let progressBar = document.getElementById(`progress-bar-${i}`);
        let progressValue = document.getElementById(`progress-value-${i}`);
        let progressBarContainer = document.getElementById(`progress-bar-container-${i}`);

        if (progressBarContainer !== null) {
            if (tasks[i].subtask.length > 0) {
                progressBar.value = percent;
                progressValue.innerHTML = `${subtasksChecked.length}/${tasks[i].subtask.length} Done`;
                progressBarContainer.classList.remove("d-none");
            } else {
                progressBarContainer.classList.add("d-none");
            }
        }
    }
}


/**
 * Calculates the progress based on the checked subtasks
 * @param {number} i - The index of the task
 * @param {Array} subtasksChecked - The array of checked subtasks
 * @returns {number} - The calculated progress percentage
 */
function calculatePercent(i, subtasksChecked) {
    if (tasks[i].subtask.length === 0) {
        return 0;
    }
    return (subtasksChecked.length / tasks[i].subtask.length) * 100;
}


/**
 * Generates the HTML code for displaying user information on the cards
 */
function generateUsers() {
    for (let taskIndex = 0; taskIndex < tasks.length; taskIndex++) {
        let content = document.getElementById(`card-user-initials-${taskIndex}`);
        if (content !== null) {
            content.innerHTML = '';
            for (let j = 0; j < tasks[taskIndex].assignedTo.length; j++) {
                const taskId = tasks[taskIndex].assignedTo[j].id;
                const users = getUsers(taskId);
                for (let k = 0; k < users.length; k++) {
                    content.innerHTML += `<div class="card-user-initials" style="background-color: ${users[k].color}">${users[k].initials}</div>`;
                }
            }
        }
    }
}


/**
 * Checks the priority of a task and returns the HTML
 * @param {string} prio - The priority value of the task
 * @returns {string} - The HTML string for the priority
 */
function checkCardPrio(prio) {
    let prioImg;

    if (prio === 'Urgent') {
        prioImg = "./assets/img/prio-urgent.png"
    }
    if (prio === 'Medium') {
        prioImg = "./assets/img/prio-medium.png"
    }
    if (prio === 'Low') {
        prioImg = "./assets/img/prio-low.png"
    }
    return `<img src="${prioImg}">`;
}


/**
 * Compares the User ID from Array Tasks with Array Contacts and returns only the matching contacts
 * @param {number} taskId - The ID of the task
 * @returns {Array} - An array of user information
 */
function getUsers(taskId) {
    const userInfos = [];

    for (let contactsIndex = 0; contactsIndex < contacts.length; contactsIndex++) {
        const contactId = contacts[contactsIndex].id;
        if (contactId == taskId) {
            const contact = contacts[contactsIndex];
            const userInfo = createUserInfo(contact);
            userInfos.push(userInfo);
        }
    }
    return userInfos;
}


/**
 * Creates userInfos object from contact object
 * @param {Object} contact - The contact object
 * @returns {Object} - The user information object
 */
function createUserInfo(contact) {
    const firstName = contact.firstName;
    const lastName = contact.lastName;
    const color = contact.color;
    const initials = getInitials(firstName, lastName);
    const fullName = `${firstName} ${lastName}`;
    return { initials, fullName, color };
}


/**
 * Returns the initials for the first and last name
 * @param {string} firstName - The first name
 * @param {string} lastName - The last name
 * @returns {string} - The initials
 */
function getInitials(firstName, lastName) {
    const firstInitial = firstName.charAt(0).toUpperCase();
    const lastInitial = lastName.charAt(0).toUpperCase();
    return `${firstInitial}${lastInitial}`;
}


/**
 * Opens the add task popup and loads the add task content from backend
 */
async function openAddTask(chosenStatus) {
    document.getElementById('add-task-overlay').classList.remove('d-none');
    status = chosenStatus;
    setMinDate();
}


/**
 * Closes the add task popup, resets the form and loads the board content
 */
async function closeAddTask() {
    document.getElementById('add-task-overlay').classList.add('d-none');
    loadBoardData();
    resetForm();
}
