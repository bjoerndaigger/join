/**
 * Generates the HTML of the task cards
 *
 * @param {Object} task - The task object containing task information
 * @returns {string} - The HTML markup for the task card
 */
function tasksHTML(task) {
    return /*html*/ `
    <div class="card-container margin-bottom-25" draggable="true" ondragstart="startDragging(${task['id']})" onclick="openPopupCard(${task['id']})">
        <div id ="card-category-${task.id}" class="card-category margin-bottom-10">${task['category']}</div>
        <div class="card-title margin-bottom-10">${task['title']}</div>
        <div class="card-description margin-bottom-10">${task['description']}</div>
        <div id="progress-bar-container-${task.id}" class="progress-bar-container">
            <progress id="progress-bar-${task.id}" max="100" value="0"></progress>
            <div id="progress-value-${task.id}" class="progress-bar-counter"></div>
        </div>
        <div class="card-bottom">
            <div class="card-users" id="card-user-initials-${task.id}">
            </div>
            <div class="card-prio">${checkCardPrio(task['priority'])}</div>
        </div>
    </div>
`;
}


/**
 * Generates the HTML of the popup card of a task
 *
 * @param {number} taskIndex - The index of the task in the tasks array
 * @returns {string} - The HTML markup for the popup card
 */
function popupCardHTML(taskIndex) {
    return /*html*/ `
    <div class="popup-card-content">
        <div class="close-popup-card" onclick="closePopupCard()">
            <img src="./assets/img/close-btn.png">
        </div>
        <div id="popup-card-category-${taskIndex}" class="popup-card-category margin-bottom-25">${tasks[taskIndex]['category']}</div>
        <div class="popup-card-title margin-bottom-25">
            <h2>${tasks[taskIndex]['title']}</h2>
        </div>
        <div class="margin-bottom-25">${tasks[taskIndex]['description']}</div>
        <div class="margin-bottom-25">
            <b>Due date:</b> ${tasks[taskIndex]['date']}
        </div>
        <div class="popup-card-prio-container margin-bottom-25">
            <b>Priority:</b> ${checkPopupCardPrio(tasks[taskIndex]['priority'])}
        </div>
        <div>
            <div class="margin-bottom-25"><b>Assigned To:</b>
                <div>${generateUsersPopupCard(taskIndex)}</div>
            </div>
        </div>
        <div id="popup-card-subtasks-container-${taskIndex}" class="margin-bottom-25"><b>Subtasks:</b>
            <div id="popup-card-subtasks"></div>
        </div>
        <div class="popup-card-move-task-mobile margin-bottom-25">
            <b>Move Task:</b>
            <div>
                <div class="popup-card-move-task">
                    <button class="move-task-btn" onclick="moveTask('${taskIndex}', 'to-do')">To Do</button>
                    <button class="move-task-btn" onclick="moveTask('${taskIndex}', 'in-progress')">In Progress</button>
                    <button class="move-task-btn" onclick="moveTask('${taskIndex}', 'awaiting-feedback')">Awaiting Feedback</button>
                    <button class="move-task-btn" onclick="moveTask('${taskIndex}', 'done')">Done</button>
                </div>
            </div>
        </div>
        <div class="popup-card-btns">
            <div onclick="deleteTask(${taskIndex})" class="delete-btn">
                <img src="./assets/img/delete-button.png">
            </div>
            <div onclick="editTask(${taskIndex})" class="edit-btn">
                <img src="./assets/img/edit-pencil.png">
            </div>
        </div>
    </div>
`;
}


/**
 * Generates the HTML of the edit task popup
 *
 * @param {number} taskIndex - The index of the task in the tasks array
 * @returns {string} - The HTML markup for the popup card
 */
function editTaskHTML(taskIndex) {
    return /*html*/ `
    <div class="popup-card-content">
        <div class="close-popup-card" onclick="closePopupCard()">
            <img src="./assets/img/close-btn.png">
        </div>
        <div id="edit-task-category-${taskIndex}" class="popup-card-category margin-bottom-25">${tasks[taskIndex]['category']}</div>
        <div class="edit-task-title margin-bottom-25">
            <p><b>Title</b></p>
            <input required id="input-title-edit-task" value="${tasks[taskIndex]['title']}" class="edit-task-input" type="text" placeholder="Enter a title">
        </div>
        <div class="edit-task-description margin-bottom-25">
            <p><b>Description</b></p>
            <input required id="input-description-edit-task" value="${tasks[taskIndex]['description']}" class="edit-task-input" type="text" placeholder="Enter a description">
        </div>
        <div class="edit-due-date margin-bottom-25">
            <p><b>Due date:</b></p> 
            <input required id="input-date-edit-task" value="${tasks[taskIndex]['date']}" class="edit-task-input edit-due-date-input" type="date" placeholder="DD/MM/YYYY">
        </div>
        <div class="edit-priority margin-bottom-25">
            <label for="priority">
                <p><b>Priority:</b> </p>
            </label>
            <div class="edit-task-show-prio">
                <label>
                    <div class="edit-task-prio-btn">
                        <input required value="Urgent" type="radio" name="priority" class="edit-task-prio-radio" onclick="updateSelectedPriority(this)">
                        <span>Urgent</span>
                        <img id="Urgent" src="./assets/img/prio-urgent.png">
                    </div>
                </label>
                <label>
                    <div class="edit-task-prio-btn">
                        <input value="Medium" type="radio" name="priority" class="edit-task-prio-radio" onclick="updateSelectedPriority(this)">
                        <span>Medium</span>
                        <img id="Medium" src="./assets/img/prio-medium.png">
                    </div>
                </label>
                <label>
                    <div class="edit-task-prio-btn">
                        <input value="Low" type="radio" name="priority" class="edit-task-prio-radio" onclick="updateSelectedPriority(this)">
                        <span>Low</span>
                        <img id="Low" src="./assets/img/prio-low.png">
                    </div>
                </label>
            </div>
        </div>
        <div>
            <div class="margin-bottom-25">
                <b>Assigned To:</b>
                <div class="edit-task-dropdown">
                    <div class="edit-task-dropdown-title" onclick="showContacts(${taskIndex})">Select contacts to assign <img src="./assets/img/arrow_down.png" alt="Arrow Down"></div>
                    <div class="d-none" id="edit-task-dropdown-content"></div>
                </div>
            </div>
        </div>
        <div class="popup-card-btns">
        <div class="dark-btn save-btn" onclick="saveEdit(${taskIndex})">
            <span>OK ✓</span>
        </div>
    </div>
`;
}