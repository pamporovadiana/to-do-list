$(document).ready(function () {
    let authCode;
    const BASE_URL = 'http://217.195.200.69:5000/task4/';

    const addField = $('#add-field');
    const editField = $('#edit-field');
    const toDoListField = $('#list-field');

    const authInput = $('#auth');
    const setBtn = $('#set-btn');

    // Helpers
    function createAddForm() {
        const form = $(`<form></form>`);

        const labelTitle = $('<label for="title" class="form-label my-1">Title</label>');
        const labelDescription = $('<label for="description" class="form-label my-1">Description</label>');
        const labelDate = $('<label for="date" class="form-label my-1">Date</label>');
        const labelTime = $('<label for="time" class="form-label my-1">Time</label>');

        const inputTitle = $('<input type="text" id="title" class="form-control my-1" required>');
        const textareaDescription = $('<textarea id="description" class="form-control my-1"></textarea>');
        const inputDate = $('<input type="date" id="date" class="form-control my-1" placeholder="yyyy-mm-dd">');
        const inputTime = $('<input type="time" id="time" class="form-control my-1" value="HH:mm">');

        const addButton = $('<button id="add-btn" type="button" class="btn btn-success w-25 mt-3">Add</button>');
        addButton.click(() => {
            const data = getAddFormData();
            addToDo(data);
        });

        form.append(labelTitle)
            .append(inputTitle)
            .append(labelDescription)
            .append(textareaDescription)
            .append(labelDate)
            .append(inputDate)
            .append(labelTime)
            .append(inputTime)
            .append(addButton);
        return form;
    }

    function getAddFormData() {
        return {
            title: $('#title').val(),
            description: $('#description').val(),
            date: $('#date').val(),
            time: $('#time').val()
        };
    }

    function createToDoCard(data) {
        const { title, description, date, time, id } = data;

        const card = $(`<div id=${id} class="my-card card my-3"></div>`);
        const cardBody = $(`<div class="card-body"></div>`);
        const cardTitle = $(`<h5 class="card-title">${title}</h5>`);
        const cardDescription = $(`<p class="card-text">${description}</p>`);
        const div = $('<div class="row"></div>');
        const cardTime = $(`<span class="col card-link time">${time}</span>`);
        let cardDate;
        if (date) {
            cardDate = $(`<span class="col col-sm-6 col-md-8 col-lg-9 card-link date">${date}</span>`);
        } else {
            cardDate = $(`<span class="col col-sm-6 col-md-8 col-lg-9 card-link date"></span>`);
        }

        card.click(() => {
            $('.my-card').removeClass('bg-success text-white')
            $(card).addClass('bg-success text-white');
            $('#edit-collapse').addClass('show');
            $('#auth-collapse').removeClass('show');
            $('#add-collapse').removeClass('show');
            editField.empty();
            editField.append(createEditForm(card));
        });

        cardBody.append(cardTitle).append(cardDescription).append(div.append(cardDate).append(cardTime));
        card.append(cardBody);

        return card;
    }

    function createToDoList(data) {
        data.forEach(item => {
            const card = createToDoCard(item);
            toDoListField.append(card);
        });
    }

    function loadToDoList() {
        $.post(`${BASE_URL}auth`, {
            "auth": authCode,
        }).then((res) => {
            const { data } = res;

            toDoListField.empty();
            createToDoList(data);
        });

        clearFormFields();
    }

    function createEditForm(data) {
        const id = data[0].id
        const title = $($(data).find('h5.card-title')[0]).text();
        const description = $($(data).find('p.card-text')[0]).text();
        const date = $($(data).find('span.date')[0]).text();
        const time = $($(data).find('span.time')[0]).text();

        const form = $(`<form class='card-${id}'></form>`);
        const divButtons = $('<div class="d-flex flex-row justify-content-between mt-3"></div>');

        const labelTitle = $('<label for="title" class="form-label my-1">Title</label>');
        const labelDescription = $('<label for="description" class="form-label my-1">Description</label>');
        const labelDate = $('<label for="date" class="form-label my-1">Date</label>');
        const labelTime = $('<label for="time" class="form-label my-1">Time</label>');

        const inputTitle = $(`<input type="text" id="title" class="form-control my-1" value=${title}>`);
        const textareaDescription = $(`<textarea id="description" class="form-control my-1">${description}</textarea>`);
        const inputDate = $(`<input type="date" id="date" class="form-control my-1" placeholder="yyyy-mm-dd" value=${date}>`);
        const inputTime = $(`<input type="time" id="time" class="form-control my-1" value=${time}>`);

        $(inputTitle).keyup(() => $(inputTitle).val($(inputTitle).val()));
        $(textareaDescription).keyup(() => $(textareaDescription).val($(textareaDescription).val()));
        $(inputDate).change(() => $(inputDate).val($(inputDate).val()));
        $(inputTime).change(() => $(inputTime).val($(inputTime).val()));

        const editBtn = $('<button class="col-3 btn btn-success">Edit</button>');
        editBtn.click((e) => {
            e.preventDefault();
            editToDo(id);
        });
        const deleteBtn = $('<button class="col-3 btn btn-danger">Delete</button>');
        deleteBtn.click((e) => {
            e.preventDefault();
            deleteToDo(id)
        });
        
        form.append(labelTitle)
            .append(inputTitle)
            .append(labelDescription)
            .append(textareaDescription)
            .append(labelDate)
            .append(inputDate)
            .append(labelTime)
            .append(inputTime)
            .append(divButtons.append(editBtn).append(deleteBtn));

            return form;
    }

    function clearFormFields(id) {
        if (!id) {
            $('#title').val('');
            $('#description').val('');
            $('#description').val('');
            $('#time').val('');

            return;
        }

        const form = $(`.card-${id}`).get(0);
        $(form).find('input#title').val('');
        $(form).find('textarea#description').val('');
        $(form).find('input#date').val('');
        $(form).find('input#time').val('');
    }

    function prmanentlyDeleteToDo(id) {
        $.post(`${BASE_URL}delete`, {
            "auth": authCode,
            "id": id
        }).then((res) => {
            if (!res.ok) {
                Swal.fire({
                    title: 'Ops!',
                    text: 'Something went wrong!',
                    text: "We can't delete the task!",
                    icon: 'error',
                    confirmButtonText: 'Try again!'
                });
                return;
            }

            Swal.fire({
                title: 'Good Job!',
                text: 'You successfully deleted this task!',
                icon: 'success'
            });
            loadToDoList();
            clearFormFields(id);
        });
    }

    // Add task
    function addToDo(data) {
        if (!data.title) {
            Swal.fire({
                text: 'Title field required!',
                icon: 'error',
            });

            return;
        }

        $.post(`${BASE_URL}add`, {
            "auth": authCode,
            "title": data.title,
            "description": data.description,
            "date": data.date,
            "time": data.time
        }).then((res) => {
            const { data } = res;
            if (!res.ok) {
                Swal.fire({
                    title: 'Ops!',
                    text: 'Something went wrong!',
                    icon: 'error',
                    confirmButtonText: 'Try again!'
                });
                return;
            }

            Swal.fire({
                title: 'Good Job!',
                text: 'You successfully added a new task!',
                icon: 'success'
            });

            const card = createToDoCard(data);
            toDoListField.append(card);
            clearFormFields();
        });
    }

    // Edit task
    function editToDo(id) {
        const form = $(`.card-${id}`).get(0);
        let title = $(form).find('input#title').val();
        let description = $(form).find('textarea#description').val();
        let date = $(form).find('input#date').val();
        let time = $(form).find('input#time').val();

        $.post(`${BASE_URL}edit`, {
            "auth": authCode,
            "id": id,
            "title": title,
            "description": description,
            "date": date,
            "time": time
        }).then((res) => {
            if (!res.ok) {
                Swal.fire({
                    title: 'Ops!',
                    text: 'Something went wrong!',
                    text: "We can't edit this task!",
                    icon: 'error',
                    confirmButtonText: 'Try again!'
                });
                return;
            } else {
                Swal.fire({
                    title: 'Good Job!',
                    text: 'You successfully edited this task!',
                    icon: 'success'
                });
                loadToDoList();
                clearFormFields(id);
            }

        });
    }

    // Delete task
    function deleteToDo(id) {
        Swal.fire({
            showCancelButton: true,
            title: 'Are you sure!',
            icon: 'error',
            confirmButtonText: 'Yes',
            cancelButtonText: 'Cancel'
        }).then((result) => {
            if (result.isConfirmed) {
                prmanentlyDeleteToDo(id);
            }
        });
    }

    // Authenticate
    setBtn.click(() => {
        authCode = authInput.val();

        if (!authCode) {
            Swal.fire({
                title: 'Ops!',
                text: 'Auth field required!',
                icon: 'error'
            });

            return;
        }

        $.post(`${BASE_URL}auth`, {
            "auth": authCode
        }).then((res) => {
            Swal.fire({
                title: 'Auth successfull!',
                icon: 'success'
            });

            toDoListField.empty();
            const { data } = res;
            createToDoList(data);

            addField.empty();
            const form = createAddForm();
            addField.append(form);

            editField.empty();
            const selectItem = $('<div>Select item</div>');
            editField.append(selectItem);
        }).fail(() => {
            Swal.fire({
                title: 'Ops!',
                text: 'Auth failed!',
                icon: 'error',
                confirmButtonText: 'ok'
            });
        });

        authInput.val('');
    });
});
