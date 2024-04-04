document.getElementById('searchButton').addEventListener('click', function() {
    var studentName = document.getElementById('studentName').value;
    var resultDiv = document.getElementById('result');

    fetch('combined.json')
        .then(response => response.json())
        .then(data => {
            console.log(data)
            var attendance = data.attendance;
            var tardies = attendance.filter(function(record) {
                return record.name === studentName && record.status === 'T';
            });

            var totalTardiness = tardies.reduce(function(total, record) {
                var startTime = new Date('1970-01-01T' + data.metadata.startTime + ':00Z');
                var arrivalTime = new Date('1970-01-01T' + record.time + ':00Z');
                return total + (arrivalTime - startTime) / 60000; // Convert milliseconds to minutes
            }, 0);

            resultDiv.textContent = studentName + ' was tardy ' + tardies.length + ' times. Total tardiness: ' + totalTardiness + ' minutes.';
        })
        .catch(error => console.error('Error:', error));
});