// The main tasks object to store the array of all Task
let Tasks = {
    listOfTasks: []
};

document.addEventListener('DOMContentLoaded', function () {
    function initializeFormData() {
        const storedData = localStorage.getItem('Tasks');
        if (storedData) {
            Tasks = JSON.parse(storedData);
            // Ensure each task has a createdAt field
            Tasks.listOfTasks.forEach(task => {
                if (!task.createdAt) {
                    task.createdAt = new Date(task.id).toLocaleString(); // Use the id (timestamp) to generate a creation date
                }
            });
            saveFormData(); // Save updated data back to localStorage
            renderTasks();
        }
        zeroTask();
    }

    // The required elements to either use for future reference or append new element
    const taskForm = document.getElementById('taskForm');
    const taskCardsRow = document.getElementById('taskCardsRow');
    const modalElement = document.getElementById('modal');
    const modalInstance = new bootstrap.Modal(modalElement);
    const searchBar = document.getElementById('searchBar');
    const forEmpty = document.getElementById('forEmpty');
    const createTaskButton = document.getElementById('createTask'); // add new task button

    // whenever add new task button is clicked a function named saveOrUpdateTask is called
    createTaskButton.addEventListener('click', function (event) {
        event.preventDefault();
        saveOrUpdateTask();
    });

    // This either updates an existing task or adds another task
    function saveOrUpdateTask() {
        const imageURL = document.getElementById('imageURL').value.trim();
        const taskTitle = document.getElementById('taskTitle').value.trim();
        const taskType = document.getElementById('taskType').value.trim();
        const description = document.getElementById('description').value.trim();
        const taskId = document.getElementById('taskId').value;

        if (taskTitle === "" || taskType === "" || description === "") {
            alert('Please enter valid input');
            return;
        }
        if (taskId) {
            const taskIndex = Tasks.listOfTasks.findIndex(task => task.id === taskId);
            Tasks.listOfTasks[taskIndex] = {
                ...Tasks.listOfTasks[taskIndex],
                imageURL: imageURL,
                taskTitle: taskTitle,
                taskType: taskType,
                description: description
            };
        } else {
            const currentDate = new Date().toLocaleString();
            const newTask = {
                id: Date.now(),
                imageURL: imageURL,
                taskTitle: taskTitle,
                taskType: taskType,
                description: description,
                createdAt: currentDate
            };
            Tasks.listOfTasks.push(newTask);
        }

        saveFormData();
        renderTasks();
        taskForm.reset();
        modalInstance.hide();
        zeroTask();
    }

    function saveFormData() {
        localStorage.setItem('Tasks', JSON.stringify(Tasks));
    }

    function renderTasks() {
        taskCardsRow.innerHTML = '';

        Tasks.listOfTasks.forEach(task => {
            const card = createTaskCard(task);
            taskCardsRow.appendChild(card);
        });
    }

    function createTaskCard(task) {
        const card = document.createElement('div');
        card.className = 'col-lg-3 mt-3';
        card.innerHTML = `
            <div class='card shadow-sm task-card' id='${task.id}'>
                <div class='card-header d-flex gap-2 justify-content-end task-card-header'>
                    <button type='button' class='btn btn-outline-info edit-btn' data-id='${task.id}' onclick="editTask(event)">
                        <i class='fa fa-pencil'></i>
                    </button>
                    <button type='button' class='btn btn-outline-danger delete-btn' data-id='${task.id}' onclick="deleteTask(${task.id})">
                        <i class='fa fa-trash'></i>
                    </button>
                </div>
                <div class='card-body'>
                    ${task.imageURL
            ? `<img width='100%' height='150px' src='${task.imageURL}' alt='card image cap' class='card-image-top md-3 rounded-lg' />`
            : `<img width='100%' height='150px' src='https://tse3.mm.bing.net/th?id=OIP.LZsJaVHEsECjt_hv1KrtbAHaHa&pid=Api&P=0' alt='card image cap' class='card-image-top md-3 rounded-lg' />`}
                    <h4 class='task-card-title'>${task.taskTitle}</h4>
                    <p class='description trim-3-lines text-muted'>${task.description}</p>
                    <div class='tags text-white d-flex flex-wrap'>
                        <span class='badge bg-primary m-1'>${task.taskType}</span>
                    </div>
                </div>
                <div class='card-footer'>
                    <button class='btn btn-outline-primary float-right' data-bs-toggle='modal' data-bs-target='#showTask' id='${task.id}' onclick="openTask(${task.id})">
                        Open Task
                    </button>
                </div>
            </div>
        `;
        return card;
    }

    window.zeroTask = function(){
        if(Tasks.listOfTasks.length === 0) {
            forEmpty.style.display = 'flex';
        }
        else{
            forEmpty.style.display = 'none';
        }
    }

    window.openTask = function (taskId) {
        const getTask = Tasks.listOfTasks.find(task => task.id === taskId);

        if (getTask) {
            const modalContent = htmlModalContent(getTask);
            const taskModal = document.getElementById('taskModal');
            if (taskModal) {
                taskModal.innerHTML = modalContent;
            } else {
                console.error('Modal element not found');
            }
        }
    };

    const htmlModalContent = (task) => {
        return `
            <div class="modal-header">
                <h5 class="modal-title">${task.taskTitle}</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                ${task.imageURL
            ? `<img width='100%' src='${task.imageURL}' alt='Image' class='img-fluid' />`
            : `<img width='100%' src='https://tse3.mm.bing.net/th?id=OIP.LZsJaVHEsECjt_hv1KrtbAHaHa&pid=Api&P=0' alt='Image' class='img-fluid' />`}
                <h4>Created On: ${task.createdAt}</h4>
                <p>${task.description}</p>
                <span class='badge bg-primary'>${task.taskType}</span>
            </div>
        `;
    };

    window.deleteTask = function (taskId) {
        Tasks.listOfTasks = Tasks.listOfTasks.filter(task => task.id !== taskId);

        saveFormData();
        renderTasks();
        zeroTask();
    };

    window.editTask = function(e){
        if (!e) e = window.event;

        const taskId = Number(e.target.getAttribute('data-id'));
        const parentNode = e.target.closest('.task-card');

        const taskTitle = parentNode.querySelector('.task-card-title');
        const taskDescription = parentNode.querySelector('.description');
        const taskType = parentNode.querySelector('.tags .badge');
        const submitButton = parentNode.querySelector('.card-footer button');

        taskTitle.setAttribute("contenteditable", "true");
        taskDescription.setAttribute("contenteditable", "true");
        taskType.setAttribute("contenteditable", "true");

        submitButton.setAttribute("onclick", "saveEdit.apply(this, arguments)");
        submitButton.removeAttribute("data-bs-toggle");
        submitButton.removeAttribute("data-bs-target");
        submitButton.innerHTML = "Save Changes";
    };

    window.saveEdit = function(e){
        if (!e) e = window.event;

        const taskId = Number(e.target.id);
        const parentNode = e.target.closest('.task-card');

        const taskTitle = parentNode.querySelector('.task-card-title');
        const taskDescription = parentNode.querySelector('.description');
        const taskType = parentNode.querySelector('.tags .badge');
        const submitButton = parentNode.querySelector('.card-footer button');

        const updatedData = {
            taskTitle: taskTitle.innerHTML,
            taskDescription: taskDescription.innerHTML,
            taskType: taskType.innerHTML
        };

        let taskIndex = Tasks.listOfTasks.findIndex(task => task.id === taskId);
        Tasks.listOfTasks[taskIndex] = {
            ...Tasks.listOfTasks[taskIndex],
            taskTitle: updatedData.taskTitle,
            description: updatedData.taskDescription,
            taskType: updatedData.taskType
        };

        saveFormData();
        renderTasks();

        taskTitle.setAttribute("contenteditable", "false");
        taskDescription.setAttribute("contenteditable", "false");
        taskType.setAttribute("contenteditable", "false");

        submitButton.setAttribute("onclick", `openTask(${taskId})`);
        submitButton.setAttribute("data-bs-toggle", "modal");
        submitButton.setAttribute("data-bs-target", "#showTask");
        submitButton.innerHTML = "Open Task";
    };

    searchBar.addEventListener('input', function () {
        searchTask(searchBar.value.toLowerCase());
    });

    function searchTask(keyword) {
        if (!keyword.trim()) {
            renderTasks(); // If the search bar is empty, render all tasks
            return;
        }

        const filteredTasks = Tasks.listOfTasks.filter(task =>
            task.taskTitle.toLowerCase().startsWith(keyword)
        );

        renderFilteredTasks(filteredTasks);
    }

    function renderFilteredTasks(filteredTasks) {
        taskCardsRow.innerHTML = '';

        filteredTasks.forEach(task => {
            const card = createTaskCard(task);
            taskCardsRow.appendChild(card);
        });
    }

    zeroTask();
    initializeFormData();
});
