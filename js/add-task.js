function clearBackend() {
    categories = [];
    categoryColors = [];
    subtasks = [];
    setItem('categories', JSON.stringify(categories));
    setItem('categoryColors', JSON.stringify(categoryColors));
    setItem('subtasks', JSON.stringify(subtasks));
}

let tasks = [];
let categories = [];
let subtasks = [];
let subtaskValues = [];
let contactValues = [];
let categoryColors = [];
let selectedCategoryColor = "#CCCCCC";

// Init 
async function initAddTask() {
    await loadTasks();
    await loadCategories();
    await loadContacts();
    await loadSubtasks();
    await loadCategoryColors();
    setCategoryOptions();
    renderSubtasks();
    setContactOptions();
}

async function loadTasks() {
    tasks = JSON.parse(await getItem('tasks')) || [];
}

async function loadCategories() {
    categories = JSON.parse(await getItem('categories')) || [];
}

async function loadContacts() {
    contacts = JSON.parse(await getItem('contacts')) || [];
}

async function loadSubtasks() {
    subtasks = JSON.parse(await getItem('subtasks')) || [];
}

async function loadCategoryColors() {
    categoryColors = JSON.parse(await getItem('categoryColors')) || [];
}

// Create Task
async function createTask() {
    // Deaktiviere den "Add Task" Button, während die Aufgabe erstellt wird
    addTaskBTN.disabled = true;

    // Sammle die Daten aus den Eingabefeldern und Dropdowns
    const title = document.getElementById('titleField').value;
    const description = document.getElementById('descriptionField').value;
    const category = document.getElementById('chooseCategory');
    const categoryValue = category.options[category.selectedIndex].value;
    const date = document.getElementById('dueDateField').value;
    const checkedValue = document.querySelector('.button1:checked').value;
    // const subtask = document.getElementById('subtaskInput').value;

    // Verarbeite die Subtasks
    subtasksToArray();

    // Ermittle den Index der ausgewählten Kategorie
    const categoryIndex = categories.findIndex(cat => cat.category === categoryValue);
    const selectedCategoryColor = categoryColors[categoryIndex].color;

    // Erstelle eine neue Aufgabe
    const newTask = {
        "id": tasks.length,
        "status": "to-do",
        "title": title,
        "description": description,
        "category": categoryValue,
        "assignedTo": contactValues,
        "date": date,
        "priority": checkedValue,
        "subtask": subtaskValues,
        "categoryColor": selectedCategoryColor
    };

    // Füge die neue Aufgabe zur Liste hinzu und speichere sie
    tasks.push(newTask);
    await setItem('tasks', JSON.stringify(tasks));

    // Aktiviere den "Add Task" Button wieder
    addTaskBTN.disabled = false;

      // Setze die Eingabefelder und Optionen zurück
      document.getElementById('titleField').value = '';
      document.getElementById('descriptionField').value = '';
      document.getElementById('dueDateField').value = '';
      document.getElementById('subtaskInput').value = '';
      resetCategoryOptions();
      resetContactOptions();
      resetSubtasks();
      resetPriorityButtons();
      selectContact();
}

function subtasksToArray() {
    var subtasks = document.querySelectorAll("#subtaskList input[type='checkbox']:checked");
    subtasks.forEach(function (input) {
        subtaskValues.push({ name: input.name, checked: false });
    });
}

function resetCategoryOptions() {
    let categoryOptions = document.getElementById("chooseCategory");
    categoryOptions.selectedIndex = 0;
}

function resetContactOptions() {
    let contactOptions = document.getElementById("chooseContact");
    contactOptions.selectedIndex = 0;
}

function resetSubtasks() {
    subtasks = [];
    subtaskValues = []
    setItem('subtasks', JSON.stringify(subtasks));
    renderSubtasks();
}

function resetPriorityButtons() {
    const priorityButtons = document.querySelectorAll('.button1');
    for (const button of priorityButtons) {
        button.checked = false;
    }
}

// Categories
function setCategoryOptions() {

    let categorySelectBox = document.getElementById('chooseCategory');
    for (let i = 0; i < categories.length; i++) {
        categorySelectBox.innerHTML += `<option value="${categories[i]['category']}">${categories[i]['category']}</option>`;
        console.log(categoryColors[i]['color']);
    }
}

function addCategory() {
    var selectElement = document.getElementById("chooseCategory");
    var selectedValue = selectElement.value;

    if (selectedValue === "NewCategory") {
        selectToInput();
    }
}

function selectToInput() {
    let selectToInput = document.getElementById('selectToInput');
    selectToInput.innerHTML = /*html*/`
    <div id="subtaskField">
        <div>
            <input id="newCategoryInput" type="text" placeholder="New Category">
            <div class="categoryColor" id="selectedCategoryColor"></div>
            <img onclick="addNewCategory()" src="../assets/img/plus.png">
        </div>
    </div>`;
    let element = document.getElementById("categoryColors");
    element.classList.remove("d-none");
}

function selectCategoryColor(color) {
    selectedCategoryColor = color; 
    let selectedColorDiv = document.getElementById('selectedCategoryColor');
    selectedColorDiv.style.backgroundColor = color;
}

async function addNewCategory() {
    let category = document.getElementById('newCategoryInput');

    if (category.value.trim() !== "") {
        categories.push({ "category": category.value });
        categoryColors.push({ "color": selectedCategoryColor }); 
        await setItem('categories', JSON.stringify(categories));
        await setItem('categoryColors', JSON.stringify(categoryColors));
        resetSelect();
    }
}

function resetSelect() {
    let selectToInput = document.getElementById('selectToInput');
    selectToInput.innerHTML = /*html*/`
    <select name="" id="chooseCategory" class="chooseContact" onchange="addCategory()">
        <option selected disabled>Choose Category</option>
        <option value="NewCategory">New Category</option>
    </select>`;
    var element = document.getElementById("categoryColors");
    element.classList.add("d-none");
    setCategoryOptions();

}

// Contacts 
function setContactOptions() {
    let contactSelectBox = document.getElementById('chooseContact');

    for (let i = 0; i < contacts.length; i++) {
        contactSelectBox.innerHTML += /*html*/`
            <option value="${contacts[i]['id']}">${contacts[i]['firstName'] + ' ' + contacts[i]['lastName']}</option>
        `;
    }
}

function selectContact() {
    var contact = document.getElementById('chooseContact');
    var contactValue = parseInt(contact.options[contact.selectedIndex].value);

    if (contactValue !== -1 && !isContactSelected(contactValue)) {
        contactValues.push({ "id": contactValue });

        let contactList = document.getElementById('contactList');
        contactList.innerHTML = '';
        for (let i = 0; i < contactValues.length; i++) {
            const selectedContact = contacts.find(c => c.id == contactValues[i]["id"]);
            contactList.innerHTML += `<li>${selectedContact.firstName + " " + selectedContact.lastName}</li>`;
        }
    }

    resetContactOptions();
}

function isContactSelected(contactId) {
    return contactValues.some(contact => contact.id === contactId);
}

// Subtasks
async function addNewSubtask() {
    let subtask = document.getElementById('subtaskInput');

    if (subtask.value.trim() !== "") {
        subtasks.push({ "subtask": subtask.value });
        await setItem('subtasks', JSON.stringify(subtasks));
        subtask.value = '';
        renderSubtasks();
    }
}

function renderSubtasks() {
    let subtaskList = document.getElementById('subtaskList');
    subtaskList.innerHTML = '';
    for (let i = 0; i < subtasks.length; i++) {
        subtaskList.innerHTML += /*html*/ `
            <li>
                 <input type="checkbox" name="${subtasks[i]['subtask']}" checked>${subtasks[i]['subtask']}
            </li>
        `;
    }
}







