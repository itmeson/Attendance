document.getElementById('searchButton').addEventListener('click', function() {
    var studentName = document.getElementById('studentName').value;
    var resultDiv = document.getElementById('result');

    fetch('combined.json')
        .then(response => response.json())
        .then(data => {
            var allTardies = [];

            data.forEach(function(dayData) {
                var attendance = dayData.attendance;
                var tardies = attendance.filter(function(record) {
                    return record.name === studentName && record.status === 'T';
                });
                allTardies = allTardies.concat(tardies);
            });

            var totalTardiness = allTardies.reduce(function(total, record) {
                var startTime = new Date('1970-01-01T' + record.metadata.startTime + ':00Z');
                var arrivalTime = new Date('1970-01-01T' + record.time + ':00Z');
                return total + (arrivalTime - startTime) / 60000; // Convert milliseconds to minutes
            }, 0);

            resultDiv.textContent = studentName + ' was tardy ' + allTardies.length + ' times. Total tardiness: ' + totalTardiness + ' minutes.';
        })
        .catch(error => console.error('Error:', error));
});