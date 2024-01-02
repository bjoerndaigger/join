let tasks = [];
let categories = [];
let subtasks = [];
let subtaskValues = [];
let contactValues = [];
let categoryColors = [];
let selectedCategoryColor = "#CCCCCC";
let status = 'to-do';


/**
 * Initializes the Add Task functionality by loading necessary data and setting up the UI
 * @returns {Promise<void>} A promise that resolves when the operation is complete
 */
async function initAddTask() {
   await loadAddTaskHeaderAndSidebar();
   await loadAddTaskData();
}


/**
 * Loads the header and sidebar.
 * @returns {Promise<void>} A promise that resolves when the operation is complete
 */
async function loadAddTaskHeaderAndSidebar() {
    await includeHTML();
    navLinkActive('nav-add-task');
}


/**
 * Loads data for the "Add Task" page, including tasks, categories, contacts, subtasks, and category colors
 * Sets category options, renders subtasks, and sets the minimum date
 * @returns {Promise<void>} A promise that resolves when the operation is complete
 */
async function loadAddTaskData() {
    await loadTasks();
    await loadCategories();
    await loadContacts();
    await loadSubtasks();
    await loadCategoryColors();
    setCategoryOptions();
    renderSubtasks();
    setMinDate();
}


/**
 * Loads tasks from the backend.
 */
async function loadTasks() {
    tasks = JSON.parse(await getItem('tasks')) || [];
}


/**
 * Loads categorys from the backend.
 */
async function loadCategories() {
    categories = JSON.parse(await getItem('categories')) || [];
}


/**
 * Loads contacts from the backend.
 */
async function loadContacts() {
    contacts = JSON.parse(await getItem('contacts')) || [];
}


/**
 * Loads subtaskss from the backend.
 */
async function loadSubtasks() {
    subtasks = JSON.parse(await getItem('subtasks')) || [];
}


/**
 * Loads category colors from the backend.
 */
async function loadCategoryColors() {
    categoryColors = JSON.parse(await getItem('categoryColors')) || [];
}


/**
 * Creates a new task by validating inputs, disabling the button during processing,
 * adding the new task, and re-enabling the button upon completion
 * @returns {Promise<void>} A promise that resolves when the new task is created
 */
async function createTask() {
    let addTaskBTN = document.getElementById('createTaskButton');
    addTaskBTN.disabled = true;

    if (!validateContacts() || !validateCategorys()) {
        addTaskBTN.disabled = false;
        return;
    }

    await addNewTask();

    addTaskBTN.disabled = false;
}


/**
 * Validates selected category
 * @returns {boolean} True if a valid category is selected, false otherwise
 */
function validateCategorys() {
    const category = document.getElementById('chooseCategory');
    const categoryValue = category.options[category.selectedIndex].value;

    if (categoryValue === "Choose Category") {
        document.getElementById('alertCategory').innerHTML = 'This field is required.';
        return false;
    } else {
        document.getElementById('alertCategory').innerHTML = '';
    }

    return true;
}


/**
 * Validates the presence of at least one selected contact
 * @returns {boolean} True if at least one contact is selected, false otherwise
 */
function validateContacts() {
    if (contactValues.length === 0) {
        document.getElementById('alertContact').innerHTML = 'This field is required.';
        return false;
    } else {
        document.getElementById('alertContact').innerHTML = '';
    }

    return true;
}

/**
 * Sets the minimum date and the placeholder for the date input element to the current date
 */
function setMinDate() {
    const today = new Date();
    const currentDate = today.toISOString().split('T')[0];
    document.getElementById("dueDateField").min = currentDate;
    document.getElementById("dueDateField").value = currentDate; 
  }


/**
 * Creates subtasks based on selected checkboxes.
 */
function createSubtasks() {
    let subtasks = document.querySelectorAll("#subtaskList input[type='checkbox']:checked");
    subtasks.forEach(function (input) {
        subtaskValues.push({ name: input.name, checked: false });
    });
}


/**
 * Adds a new task to the 'tasks' array and stores it in the backend
 * @returns {Promise<void>} A promise that resolves when the task is added and stored
 */
async function addNewTask() {
    const title = document.getElementById('titleField').value;
    const description = document.getElementById('descriptionField').value;
    const category = document.getElementById('chooseCategory');
    const categoryValue = category.options[category.selectedIndex].value;
    const date = document.getElementById('dueDateField').value;
    const checkedPrioBtn = document.querySelector('.prioRadio:checked').value;
    const categoryIndex = categories.findIndex(cat => cat.category === categoryValue);
    const selectedCategoryColor = categoryColors[categoryIndex]?.color || "";

    createSubtasks();

    const newTask = {
        "id": tasks.length,
        "status": status,
        "title": title,
        "description": description,
        "category": categoryValue,
        "assignedTo": contactValues,
        "date": date,
        "priority": checkedPrioBtn,
        "subtask": subtaskValues,
        "categoryColor": selectedCategoryColor
    };

    tasks.push(newTask);
    await setItem('tasks', JSON.stringify(tasks));
    resetForm();
    showSuccess();
}


/**
 * Shows a success message and redirects to the board page after a new task is added
 */
function showSuccess() {
    document.getElementById('task-added-msg').classList.remove('d-none');
    setTimeout(function () {
        window.location.href = 'board.html';
    }, 3000);
}


/**
 * Resets the task form to its initial state
 */
function resetForm() {
    document.getElementById('titleField').value = '';
    document.getElementById('descriptionField').value = '';
    document.getElementById('dueDateField').value = '';
    document.getElementById('subtaskInput').value = '';
    document.querySelectorAll('.prioRadio').forEach(button => button.checked = false);
    document.getElementById('alertCategory').innerHTML = '';
    document.getElementById('alertContact').innerHTML = '';

    contactValues = [];

    resetSubtasks();
    resetCategoryOptions();
    hideContactListDropdown();

    let addTaskBTN = document.getElementById('createTaskButton');
    addTaskBTN.disabled = false;
}


/**
 * Resets the category selection dropdown to its initial state
 */
function resetCategoryOptions() {
    let categoryOptions = document.getElementById("chooseCategory");
    categoryOptions.selectedIndex = 0;
}


/**
 * Resets the subtasks list to its initial state
 */
function resetSubtasks() {
    subtasks = [];
    subtaskValues = []
    setItem('subtasks', JSON.stringify(subtasks));
    renderSubtasks();
}


/**
 * Sets contact options in the contact selection dropdown
 */
function setContactOptions() {
    let contactSelectBox = document.getElementById('chooseContact');

    for (let i = 0; i < contacts.length; i++) {
        contactSelectBox.innerHTML += /*html*/`
            <option value="${contacts[i]['id']}">${contacts[i]['firstName'] + ' ' + contacts[i]['lastName']}</option>
        `;
    }
}


/**
 * Toggles the visibility of the contact list dropdown
 */
function showContactList() {
    let dropdownContent = document.getElementById('addTaskDropdownContent');
    dropdownContent.innerHTML = '';

    if (dropdownContent.classList.contains('d-none')) {
        showContactListDropdown(dropdownContent);
    } else {
        hideContactListDropdown();
    }
}


/**
 * Displays the contact list dropdown
 * @param {HTMLElement} dropdownContent - The contact list dropdown content
 */
function showContactListDropdown(dropdownContent) {
    for (let i = 0; i < contacts.length; i++) {
        const isChecked = contactValues.some(contact => contact.id === contacts[i].id) ? 'checked="checked"' : '';
        dropdownContent.innerHTML += /*html*/`
        <div class="addTaskDropdownContent">
            <input type="checkbox" ${isChecked} id="contacts-${i}" onclick="selectContact(this, ${i})">
            <label for="contacts-${i}">${contacts[i].firstName} ${contacts[i].lastName}</label>
        </div>`;
    }
    dropdownContent.classList.remove('d-none');
}


/**
 * Hides the contact list dropdown
 */
function hideContactListDropdown() {
    let dropdownContent = document.getElementById('addTaskDropdownContent');
    dropdownContent.classList.add('d-none');
}


/**
 * Handles the selection of a contact
 * @param {HTMLInputElement} checkbox - The checkbox input element
 * @param {number} contactIndex - The index of the selected contact
 */
function selectContact(checkbox, contactIndex) {
    document.getElementById('alertCategory').innerHTML = '';
    const selectedContact = contacts[contactIndex];

    if (checkbox.checked) {
        contactValues.push({ id: selectedContact.id });
    } else {
        const indexToRemove = contactValues.findIndex(contact => contact.id === selectedContact.id);
        if (indexToRemove !== -1) {
            contactValues.splice(indexToRemove, 1);
        }
    }
}


/**
 * Sets category options in the category selection dropdown
 */
function setCategoryOptions() {

    let categorySelectBox = document.getElementById('chooseCategory');
    for (let i = 0; i < categories.length; i++) {
        categorySelectBox.innerHTML += `<option value="${categories[i]['category']}">${categories[i]['category']}</option>`;
    }
}


/**
 * Handles the addition of a new category
 */
function addCategory() {
    let selectElement = document.getElementById("chooseCategory");
    let selectedValue = selectElement.value;

    if (selectedValue === "NewCategory") {
        selectToInput();
    }
}


/**
 * Switches the category selection dropdown to input mode for creating a new category
 */
function selectToInput() {
    document.getElementById('alertCategory').innerHTML = '';

    let addTaskBTN = document.getElementById('createTaskButton');
    addTaskBTN.disabled = true;

    let selectToInput = document.getElementById('selectToInput');
    selectToInput.innerHTML = /*html*/`
    <div id="categoryField">
        <div>
            <input id="newCategoryInput" type="text" placeholder="New Category">
            <div class="categoryColorNew" id="selectedCategoryColor"></div>
            <img onclick="resetSelect()" src="./assets/img/close-btn.png">
            <img onclick="addNewCategory()" src="./assets/img/checkmark.png">
        </div>
    </div>`;
    let element = document.getElementById("categoryColors");
    element.classList.remove("d-none");
}


/**
 * Sets the selected category color
 * @param {string} color - The selected category color
 */
function selectCategoryColor(color) {
    selectedCategoryColor = color;
    let selectedColorDiv = document.getElementById('selectedCategoryColor');
    selectedColorDiv.style.backgroundColor = color;
}


/**
 * Adds a new category to the 'categories' array and stores it in the backend
 */
async function addNewCategory() {
    let addTaskBTN = document.getElementById('createTaskButton');
    addTaskBTN.disabled = false;

    let category = document.getElementById('newCategoryInput');

    if (category.value.trim() !== "") {
        categories.push({ "category": category.value });
        categoryColors.push({ "color": selectedCategoryColor });
        await setItem('categories', JSON.stringify(categories));
        await setItem('categoryColors', JSON.stringify(categoryColors));
        resetSelect();
    } else {
        document.getElementById('alertCategory').innerHTML = 'Please enter a category name.';
    }
}


/**
 * Resets the category selection dropdown to its initial state.
 */
function resetSelect() {
    let addTaskBTN = document.getElementById('createTaskButton');
    addTaskBTN.disabled = false;

    document.getElementById('alertCategory').innerHTML = '';
    let selectToInput = document.getElementById('selectToInput');
    selectToInput.innerHTML = /*html*/`
    <select name="" id="chooseCategory" class="selectInput" onchange="addCategory()">
        <option selected disabled>Choose Category</option>
        <option value="NewCategory">New Category</option>
    </select>`;
    let element = document.getElementById("categoryColors");
    element.classList.add("d-none");
    setCategoryOptions();
}


/**
 * Adds a new subtask to the 'subtasks' array and stores it in the backend
 */
async function addNewSubtask() {
    let subtask = document.getElementById('subtaskInput');

    if (subtask.value.trim() !== "") {
        subtasks.push({ "subtask": subtask.value });
        await setItem('subtasks', JSON.stringify(subtasks));
        subtask.value = '';
        renderSubtasks();
    }
}


/**
 * Renders the list of subtasks in the UI
 */
function renderSubtasks() {
    let subtaskList = document.getElementById('subtaskList');
    subtaskList.innerHTML = '';
    for (let i = 0; i < subtasks.length; i++) {
        subtaskList.innerHTML += /*html*/ `
            <li>
                 <input type="checkbox" name="${subtasks[i]['subtask']}" checked>
                 <label for="${subtasks[i]['subtask']}">${subtasks[i]['subtask']}</label>
            </li>
        `;
    }
}