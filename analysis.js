document.getElementById('searchButton').addEventListener('click', function() {
    var startDate = new Date(document.getElementById('startDate').value);
    var endDate = new Date(document.getElementById('endDate').value);
    var selectedClass = document.getElementById('classSelect').value;

    // Fetch the JSON data
    fetch('combined.json')
        .then(response => response.json())
        .then(data => {
            // Filter the data based on the time window and the selected class
            var filteredData = data.filter(function(record) {
                var date = new Date(record.metadata.date);
                return date >= startDate && date <= endDate && (selectedClass === "" || record.metadata.class === selectedClass);
            });

            // Count the number of times each student has been late, absent, and present, and keep track of the dates and times they were tardy and the dates they were absent
            var studentDetails = {};
            filteredData.forEach(function(record) {
                record.attendance.forEach(function(student) {
                    if (!studentDetails[student.name]) {
                        studentDetails[student.name] = { tardy: 0, absent: 0, present: 0, tardyDetails: [], absentDates: [] };
                    }
                    if (student.status === 'Tardy') {
                        studentDetails[student.name].tardy++;
                        console.log(record.metadata.startTime, student.time, calculateMinutesLate(record.metadata.startTime, student.time))
                        const minutesLate = calculateMinutesLate(record.metadata.startTime, student.time);
                        studentDetails[student.name].tardyDetails.push({ date: record.metadata.date, time: student.time, minutesLate: minutesLate });
                    } else if (student.status === 'Absent') {
                        studentDetails[student.name].absent++;
                        studentDetails[student.name].absentDates.push(record.metadata.date);
                    } else if (student.status === 'Present') {
                        studentDetails[student.name].present++;
                    }
                });
            });

            // Convert the object into an array of [student, details] pairs
            var studentDetailsArray = Object.keys(studentDetails).map(function(name) {
                return [name, studentDetails[name]];
            });

            // Sort the array in descending order based on the count of tardies
            studentDetailsArray.sort(function(a, b) {
                return b[1].tardy - a[1].tardy;
            });

            // Create a table and add it to the page
            var table = document.createElement('table');
            var thead = document.createElement('thead');
            var tbody = document.createElement('tbody');
            var headerRow = document.createElement('tr');

            ['Student', 'Tardies', 'Absences', 'Present'].forEach(function(text) {
                var th = document.createElement('th');
                th.textContent = text;
                headerRow.appendChild(th);
            });

            thead.appendChild(headerRow);
            table.appendChild(thead);

            // Add a row to the table for each student
            studentDetailsArray.forEach(function(pair) {
                var tr = document.createElement('tr');
                [pair[0], pair[1].tardy, pair[1].absent, pair[1].present].forEach(function(text, index) {
                    var td = document.createElement('td');
                    if (index === 0) { // If this is the student's name
                        var a = document.createElement('a');
                        a.textContent = text;
                        a.href = '#';
                        a.addEventListener('click', function(event) {
                            event.preventDefault();
                            if (pair[1]) {
                                displayStudentDetails(pair[0], pair[1]);
                            } else {
                                console.error('No details found for student: ' + pair[0]);
                            }
                        });
                        td.appendChild(a);
                    } else {
                        td.textContent = text;
                    }
                    tr.appendChild(td);
                });
                tbody.appendChild(tr);
            });

            table.appendChild(tbody);

            // Replace the existing table with the new one
            var container = document.getElementById('tardyList');
            container.innerHTML = '';
            container.appendChild(table);
        })
        .catch(error => console.error('Error:', error));
});

function displayStudentDetails(name, details) {
    console.log(details)
    details.tardyDetails = details.tardyDetails || [];
    details.absentDates = details.absentDates || [];

    details.tardyDetails.sort(function(a, b) {
        return new Date(a.date) - new Date(b.date);
    });
    details.absentDates.sort(function(a, b) {
        return new Date(a) - new Date(b);
    });
    // Display the student's details in a new element
    var detailsElement = document.createElement('div');
    detailsElement.textContent = 'Name: ' + name + ', Tardies: ' + details.tardy + ', Absences: ' + details.absent + ', Present: ' + details.present;

    var tardyList = document.createElement('ul');
    details.tardyDetails.forEach(function(tardyDetail) {
        var li = document.createElement('li');
        li.textContent = 'Date: ' + tardyDetail.date + ', Time: ' + tardyDetail.time + ', Minutes late: ' + tardyDetail.minutesLate;
        tardyList.appendChild(li);
    });
    detailsElement.appendChild(tardyList);

    var absentList = document.createElement('ul');
    details.absentDates.forEach(function(absentDate) {
        var li = document.createElement('li');
        li.textContent = 'Date: ' + absentDate;
        absentList.appendChild(li);
    });
    detailsElement.appendChild(absentList);

    // Add the details element to the page
    var container = document.getElementById('tardyList');
    container.appendChild(detailsElement);
}

function calculateMinutesLate(startTime, arrivalTime) {
    // Add seconds to the startTime if they are not included
    if (startTime.length === 5) startTime += ':00';
    console.log(arrivalTime, arrivalTime.split(' '))
    // Convert arrivalTime from 12-hour format to 24-hour format
    const [time, period] = arrivalTime.split(' ');
    let [hours, minutes, seconds] = time.split(':');
    if (hours.length === 1) hours = '0' + hours;
    if (period.toUpperCase() === 'PM' && hours !== '12') hours = Number(hours) + 12;
    if (period.toUpperCase() === 'AM' && hours === '12') hours = '00';
    arrivalTime = `${hours}:${minutes}:${seconds}`;

    // Prepend the times with a dummy date string to make them valid date strings
    const dummyDateString = '1970-01-01T';
    const startDateTime = Date.parse(dummyDateString + startTime);
    const arrivalDateTime = Date.parse(dummyDateString + arrivalTime);

    // Calculate the difference in minutes
    const differenceInMilliseconds = arrivalDateTime - startDateTime;
    const differenceInMinutes = differenceInMilliseconds / 60000;

    return differenceInMinutes;
}