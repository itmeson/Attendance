function determineTardiness(li) {
    var currentTime = new Date();
    var timeDiv = li.querySelector('.time');
    timeDiv.textContent = currentTime.toLocaleTimeString(); // Set the time to the current time

    var classStartTime = document.getElementById('classStartTime').value;
    var tardyTime = new Date();
    tardyTime.setHours(...classStartTime.split(':')); // Set the tardy time to the class start time

    var statusDiv = li.querySelector('.status'); // Get the status div

    if (li.classList.contains('tardy')) {
        li.classList.remove('tardy');
        li.classList.add('present');
        statusDiv.textContent = 'P';
    } else if (li.classList.contains('present')) {
        li.classList.remove('present');
        statusDiv.textContent = 'A';
        li.classList.add('absent');
    } else {
        // If the student is absent, change the status to present or tardy based on the time
        li.classList.remove('absent');
        if (currentTime >= tardyTime) {
            li.classList.add('tardy');
            statusDiv.textContent = 'T';
        } else {
            li.classList.add('present');
            statusDiv.textContent = 'P';
        }
    }
    updateCounters();
}

document.getElementById('attendanceForm').addEventListener('submit', function(e) {
    e.preventDefault();
    var submittedName = document.getElementById('studentName').value; // Get the submitted name from the input field
    var lis = Array.from(document.querySelectorAll('li')); // Get all li elements and convert NodeList to Array
    var li = lis.find(li => li.textContent.includes(submittedName)); // Find the li that contains the submitted name
    determineTardiness(li);
    updateCounters();
});



document.getElementById('storeButton').addEventListener('click', function() {
    var attendanceList = document.getElementById('attendanceList');
    var students = Array.from(attendanceList.children);
    var attendanceData = students.map(li => {
        var nameDiv = li.querySelector('.name'); // Select the div for the name
        var name = nameDiv.textContent; // Get the textContent of the name div
        var commentInput = li.querySelector('input');
        var comment = commentInput ? commentInput.value : '';
        var status = 'Absent';
        var time = '';
        if (li.classList.contains('present')) {
            status = 'Present';
            var timeDiv = li.querySelector('.time'); // Select the div for the time
            time = timeDiv.textContent.trim() !== '\xa0' ? timeDiv.textContent : ''; // Get the textContent of the time div
        } else if (li.classList.contains('tardy')) {
            status = 'Tardy';
            var timeDiv = li.querySelector('.time'); // Select the div for the time
            time = timeDiv.textContent.trim() !== '\xa0' ? timeDiv.textContent : ''; // Get the textContent of the time div
        }
        return { name, status, comment, time };
    });

    var classSelect = document.getElementById('classSelect');
    var classStartTime = document.getElementById('classStartTime').value;
    var date = new Date();
    var filename = classSelect.value + '_' + date.toISOString().split('T')[0] + '.json';

    var metadata = {
        class: classSelect.value,
        date: date.toISOString().split('T')[0],
        startTime: classStartTime
    };

    var saveData = {
        metadata: metadata,
        attendance: attendanceData
    };
    // Assuming `data` is the data you want to save
    var blob = new Blob([JSON.stringify(saveData)], {type: 'application/json'});
    var url = URL.createObjectURL(blob);
    var link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();

    attendanceList.innerHTML = '';
});

function loadClass(className) {
    fetch(className + '.json')
        .then(response => response.json())
        .then(data => {
            var attendanceList = document.getElementById('attendanceList');
            var datalist = document.getElementById('students');
            attendanceList.innerHTML = '';
            datalist.innerHTML = '';
            data.forEach(student => {
                var li = document.createElement('li');
                li.style.display = 'flex';
                li.style.justifyContent = 'space-between';
                li.style.alignItems = 'center';

                var nameDiv = document.createElement('div');
                nameDiv.className = 'name';
                nameDiv.textContent = student;
                li.appendChild(nameDiv);

                var commentBox = document.createElement('input');
                commentBox.className = 'comment';
                commentBox.type = 'text';
                commentBox.placeholder = 'Enter comment';
                li.appendChild(commentBox);

                var timeDiv = document.createElement('div');
                timeDiv.className = 'time';
                timeDiv.textContent = '\xa0'; // Non-breaking space
                timeDiv.setAttribute('contentEditable', 'true'); // Make the timeDiv editable
                timeDiv.addEventListener('blur', function() {
                    // Validate and save the new time here
                    var newTime = this.textContent;
                    // Validate newTime here
                    // Save newTime here
                });
                li.appendChild(timeDiv);


                attendanceList.appendChild(li);

                var option = document.createElement('option');
                option.value = student;
                datalist.appendChild(option);

                // Assuming `li` is the list item for a student
                var statusDiv = document.createElement('div');
                statusDiv.classList.add('status');
                statusDiv.textContent = 'A'; // Set the initial status to 'A' for absent
                li.classList.add('absent');
                li.appendChild(statusDiv);

                statusDiv.addEventListener('click', function() {
                    if (this.textContent === 'A') {
                        this.textContent = 'P';
                        li.classList.remove('absent');
                        li.classList.add('present');
                    } else if (this.textContent === 'P') {
                        this.textContent = 'T';
                        li.classList.remove('present');
                        li.classList.add('tardy');
                    } else {
                        this.textContent = 'A';
                        li.classList.remove('tardy');
                        li.classList.add('absent');
                    }
                    updateCounters();
                });

                li.addEventListener('click', function(e) {
                    if (e.target.classList.contains('name')) { // Check if the target of the event is the name div
                        determineTardiness(this);
                    }
                });
            });
            document.getElementById('studentName').value = data[0];
        });
        updateCounters();
}

document.getElementById('classSelect').addEventListener('change', function() {
    loadClass(this.value);
});

window.onload = function() {
    loadClass(document.getElementById('classSelect').value);
};

// Assuming you have a function to calculate the number of students in each category
function updateCounters() {
    var totalStudents = calculateTotalStudents();
    var presentStudents = calculatePresentStudents();
    var absentStudents = calculateAbsentStudents();
    var tardyStudents = calculateTardyStudents();

    document.getElementById('totalStudents').textContent = totalStudents;
    document.getElementById('presentStudents').textContent = presentStudents;
    document.getElementById('absentStudents').textContent = absentStudents;
    document.getElementById('tardyStudents').textContent = tardyStudents;
}

// Call updateCounters whenever a student's status changes
// For example:
document.getElementById('attendanceList').addEventListener('change', updateCounters);

function calculateTotalStudents() {
    return document.getElementById('attendanceList').children.length;
}

function calculatePresentStudents() {
    return document.querySelectorAll('#attendanceList .present').length;
}

function calculateAbsentStudents() {
    return document.querySelectorAll('#attendanceList .absent').length;
}

function calculateTardyStudents() {
    return document.querySelectorAll('#attendanceList .tardy').length;
}