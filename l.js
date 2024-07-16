// Initialize Chart.js bar chart
const ctx = document.getElementById('sound-chart').getContext('2d');
const soundChart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: ['Sound Level'],
        datasets: [{
            label: 'dB',
            data: [50], // Set initial value to 50 dB
            backgroundColor: '#4caf50',
            borderWidth: 0 // Remove the border around the bars
        }]
    },
    options: {
        responsive: true,
        scales: {
            y: {
                beginAtZero: false,
                min: 50, // Set minimum value to 50 dB
                suggestedMax: 100,
                grid: {
                    display: false, // Remove the horizontal grid lines
                },
                ticks: {
                    display: false // Remove the side values (tick marks and labels)
                }
            }
        },
        plugins: {
            legend: {
                display: false // Remove the legend
            },
            tooltip: {
                enabled: false // Disable tooltips
            }
        }
    }
});

// Function to update the chart based on sound level
function updateChart(soundLevel) {
    // Clamp sound level between 50 dB and 100 dB
    const clampedLevel = Math.min(Math.max(soundLevel, 50), 100);

    // Update the Chart.js data
    soundChart.data.datasets[0].data[0] = clampedLevel;
    soundChart.update();
}

// Access the microphone and stream audio
navigator.mediaDevices.getUserMedia({ audio: true })
    .then(function(stream) {
        const audioContext = new AudioContext();
        const analyser = audioContext.createAnalyser();
        const microphone = audioContext.createMediaStreamSource(stream);
        microphone.connect(analyser);
        
        // Configure the analyser node
        analyser.fftSize = 256;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        let previousLevel = 50; // Initialize with 50 dB

        // Update sound level in real-time
        function updateSoundLevel() {
            analyser.getByteFrequencyData(dataArray);
            const average = dataArray.reduce((acc, val) => acc + val, 0) / bufferLength;
            const soundLevel = mapRange(average, 0, 255, 50, 100); // Map range from 0-255 to 50-100 dB
            
            // Smooth the sound level
            const smoothedLevel = previousLevel * 0.8 + soundLevel * 0.2;
            previousLevel = smoothedLevel;

            updateChart(smoothedLevel);
            requestAnimationFrame(updateSoundLevel);
        }
        
        // Start updating sound level
        updateSoundLevel();
    })
    .catch(function(err) {
        console.error('Error accessing microphone:', err);
    });

// Helper function to map range
function mapRange(value, minIn, maxIn, minOut, maxOut) {
    return minOut + (maxOut - minOut) * ((value - minIn) / (maxIn - minIn));
}
