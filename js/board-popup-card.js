let selectedPriority;


/**
 * Opens the popup card for a task
 * @param {number} taskIndex - The index of the task
 */
function openPopupCard(taskIndex, event) {
    event.stopPropagation();
    document.getElementById('popup-card').classList.remove('d-none');
    generatePopupCardHTML(taskIndex);
    generatePopupCardCategoryColor(taskIndex);
}


/**
 * Closes the popup card
 */
function closePopupCard() {
    document.getElementById('popup-card').classList.add('d-none');
}


/**
 * Generates the HTML content for the popup card
 * @param {number} taskIndex - The index of the task
 */
function generatePopupCardHTML(taskIndex) {
    let content = document.getElementById('popup-card');
    content.innerHTML = '';
    content.innerHTML += popupCardHTML(taskIndex);
    generateSubtasks(taskIndex);
}


/**
 * Generates the category color for the popup card 
 * @param {number} taskIndex - The index of the task
 */
function generatePopupCardCategoryColor(taskIndex) {
    document.getElementById(`popup-card-category-${taskIndex}`).style.backgroundColor = `${tasks[taskIndex].categoryColor}`;
}


/**
 * Checks the priority of a task and returns the HTML
 * @param {string} prio - The priority value of the task
 * @returns {string} - The HTML string for the priority
 */
function checkPopupCardPrio(prio) {
    let prioImg;
    let prioText;
    let prioColor;

    if (prio === 'Urgent') {
        prioText = 'Urgent';
        prioImg = "./assets/img/prio-urgent-white.png";
        prioColor = "#FF3D00";
    }
    if (prio === 'Medium') {
        prioText = 'Medium';
        prioImg = "./assets/img/prio-medium-white.png";
        prioColor = "#FFA800";
    }
    if (prio === 'Low') {
        prioText = 'Low';
        prioImg = "./assets/img/prio-low-white.png"
        prioColor = "#7AE229";

    }
    return `<div class="popup-card-prio-btn" style="background-color:${prioColor};"><span>${prioText}</span> <img src="${prioImg}"></div>`;
}


/**
 * Generates the users HTML
 * @param {number} taskIndex - The index of the task
 * @returns {string} - The generated HTML code
 */
function generateUsersPopupCard(taskIndex) {
    let usersHTML = '';
    for (let i = 0; i < tasks[taskIndex].assignedTo.length; i++) {
        const taskId = tasks[taskIndex].assignedTo[i].id;
        const users = getUsers(taskId);
        for (let j = 0; j < users.length; j++) {
            usersHTML += `<div class="popup-card-assigned-to-container">
                <div class="popup-card-user-initials" style="background-color: ${users[j].color}">${users[j].initials}</div>
                <div>${users[j].fullName}</div>
            </div>`;
        }
    }
    return usersHTML;
}


/**
 * Generates the subtasks for the popup card
 * @param {number} taskIndex - The index of the task
 */
function generateSubtasks(taskIndex) {
    let subtasks = tasks[taskIndex].subtask;
    let content = document.getElementById('popup-card-subtasks');
    content.innerHTML = '';

    for (let i = 0; i < subtasks.length; i++) {
        const checkboxId = `subtask-${taskIndex}-${i}`;
        const isChecked = subtasks[i].checked ? 'checked' : ''; // Ternary Operator ((Bedingung) ? wenn true : wenn false;)

        content.innerHTML += `
            <input type="checkbox" id="${checkboxId}" onchange="submitCheckboxValue(${taskIndex}, ${i})" ${isChecked}>
            <label for="${checkboxId}">${subtasks[i].name}</label><br>
        `;
    }
};


/**
 * Submits the checkbox value of a subtask
 * @param {number} taskIndex - The index of the task
 * @param {number} i - The index of the subtask
 */
function submitCheckboxValue(taskIndex, i) {
    let checkbox = document.getElementById(`subtask-${taskIndex}-${i}`);
    tasks[taskIndex].subtask[i].checked = checkbox.checked;
    saveTasks();
    generateProgressBar();
}


/**
 * Deletes a task
 * @param {number} taskIndex - The index of the task
 */
function deleteTask(taskIndex) {
    tasks.splice(taskIndex, 1);
    updateId();
    saveTasks();
    closePopupCard();
    updateBoard();
}


/**
 * Edits a task and loads the selected priority
 * @param {number} taskIndex - The index of the task
 */
function editTask(taskIndex) {
    const currentPriority = tasks[taskIndex]['priority'];
    let content = document.getElementById('popup-card');
    content.innerHTML = '';
    content.innerHTML += editTaskHTML(taskIndex);
    generateEditTaskCategoryColor(taskIndex);
    loadPriorityButtons(currentPriority);
}


/**
 * Updates the priority radio buttons based on the current priority
 * @param {string} currentPriority - The current priority of the task
 */
function loadPriorityButtons(currentPriority) {
    const radioButtons = document.querySelectorAll('input[type="radio"][name="priority"]');
    for (let radioButton of radioButtons) {
        if (radioButton.value === currentPriority) {
            radioButton.checked = true;
        } else {
            radioButton.checked = false;
        }
    }
}


/**
 * Updates the selected priority when a radio button is checked
 * @param {HTMLInputElement} radioButton - The radio button element that was checked
 */
function updateSelectedPriority(radioButton) {
    if (radioButton.checked) {
        selectedPriority = radioButton.value;
    }
} 


/**
 * Generates the category color for the task being edited
 * @param {number} taskIndex - The index of the task
 */
function generateEditTaskCategoryColor(taskIndex) {
    document.getElementById(`edit-task-category-${taskIndex}`).style.backgroundColor = `${tasks[taskIndex].categoryColor}`;
}


/**
 * Generates the users for the task being edited
 * @param {number} taskIndex - The index of the task
 * @returns {string} - The generated HTML code
 */
function generateUsersEditTask(taskIndex) {
    let usersHTML = '';
    for (let i = 0; i < tasks[taskIndex].assignedTo.length; i++) {
        const taskId = tasks[taskIndex].assignedTo[i].id;
        const users = getUsers(taskId);
        for (let j = 0; j < users.length; j++) {
            usersHTML += `<div class="popup-card-assigned-to-container">
                <div class="popup-card-user-initials" style="background-color: ${users[j].color}">${users[j].initials}</div>
            </div>`;
        }
    }
    return usersHTML;
}


/**
 * Displays all contacts in a dropdown menu for a task
 *
 * @param {number} taskIndex - The index of the task
 */
function showContacts(taskIndex) {
    let assignedContactIds = getAssignedContactIds(taskIndex);
    let dropdownContent = document.getElementById('edit-task-dropdown-content');
    dropdownContent.innerHTML = '';

    if (dropdownContent.classList.contains('d-none')) {
        showContactsDropdown(contacts, assignedContactIds, taskIndex, dropdownContent);
    } else {
        hideContactsDropdown(dropdownContent);
    }
}


/**
 * Retrieves the assigned contact IDs for a task
 *
 * @param {number} taskIndex - The index of the task
 * @returns {Array} - An array of assigned contact IDs
 */
function getAssignedContactIds(taskIndex) {
    let assignedContactIds = [];

    for (let i = 0; i < tasks[taskIndex].assignedTo.length; i++) {
        const assignedToId = tasks[taskIndex].assignedTo[i].id;
        assignedContactIds.push(assignedToId);
    }

    return assignedContactIds;
}


/**
 * Displays all contacts from Array contantcs in a dropdown menu
 *
 * @param {Array} contacts - An array of contact objects
 * @param {Array} assignedContactIds - An array of assigned contact IDs
 * @param {number} taskIndex - The index of the task
 * @param {HTMLElement} dropdownContent - The dropdown content element
 */
function showContactsDropdown(contacts, assignedContactIds, taskIndex, dropdownContent) {
    for (let i = 0; i < contacts.length; i++) {
        const contactId = contacts[i].id;
        const isChecked = assignedContactIds.includes(contactId) ? 'checked="checked"' : ''; // Ternary Operator

        dropdownContent.innerHTML += `
        <div class="edit-task-dropdown-content">
            <input type="checkbox" id="contacts-${[i]}" onchange="editAssignedTo(${taskIndex}, ${contactId})" ${isChecked}>
            <label for="contacts-${[i]}">${contacts[i].firstName} ${contacts[i].lastName}</label>
        </div>`;
    }
    dropdownContent.classList.remove('d-none');
}


/**
 * Hides the contacts dropdown menu
 *
 * @param {HTMLElement} dropdownContent - The dropdown content element
 */
function hideContactsDropdown(dropdownContent) {
    dropdownContent.classList.add('d-none');
}


/**
 * Edits the assigned contact for a task
 *
 * @param {number} taskIndex - The index of the task
 * @param {number} contactId - The ID of the contact
 */
function editAssignedTo(taskIndex, contactId) {
    const task = tasks[taskIndex];
    const index = task.assignedTo.findIndex(item => item.id === contactId);

    if (index > -1) {
        task.assignedTo.splice(index, 1);
    } else {
        task.assignedTo.push({ id: contactId });
    }
}


/**
 * Saves the edited task
 * @param {number} taskIndex - The index of the task
 */
async function saveEdit(taskIndex) {
    tasks[taskIndex]['title'] = document.getElementById('input-title-edit-task').value;
    tasks[taskIndex]['description'] = document.getElementById('input-description-edit-task').value;
    tasks[taskIndex]['date'] = document.getElementById('input-date-edit-task').value;

    if (selectedPriority) {
        tasks[taskIndex]['priority'] = selectedPriority;
    }

    await setItem('tasks', JSON.stringify(tasks));
    closePopupCard();
    updateBoard();
}