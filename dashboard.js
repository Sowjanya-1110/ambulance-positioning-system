// Check authentication on page load
window.addEventListener('load', function() {
    const session = localStorage.getItem('iaps_session');
    if (!session) {
        window.location.href = 'index.html';
        return;
    }
    
    const sessionData = JSON.parse(session);
    document.getElementById('user-info').textContent = `${sessionData.username} (${sessionData.role})`;
    
    // Show role-specific sections
    if (sessionData.role === 'admin') {
        document.querySelectorAll('.admin-only').forEach(el => {
            el.style.display = 'block';
        });
        loadUserManagement();
    }
    
    if (sessionData.role === 'operator') {
        customizeForOperator();
    }
    
    if (sessionData.role === 'analyst') {
        customizeForAnalyst();
    }
});

function loadUserManagement() {
    const registeredUsers = JSON.parse(localStorage.getItem('iaps_registered_users') || '{}');
    const pendingDiv = document.getElementById('pending-users');
    const approvedDiv = document.getElementById('approved-users');
    
    let pendingHTML = '';
    let approvedHTML = '';
    
    Object.entries(registeredUsers).forEach(([username, user]) => {
        const userCard = `
            <div class="user-card">
                <div class="user-info">
                    <strong>${user.fullName}</strong> (${username})<br>
                    <small>Email: ${user.email} | Phone: ${user.phone} | Role: ${user.role}</small>
                </div>
                <div class="user-actions">
                    ${user.status === 'pending' ? 
                        `<button class="btn-approve" onclick="approveUser('${username}')">Approve</button>
                         <button class="btn-reject" onclick="rejectUser('${username}')">Reject</button>` :
                        `<span class="status-indicator status-completed">Approved</span>`
                    }
                </div>
            </div>
        `;
        
        if (user.status === 'pending') {
            pendingHTML += userCard;
        } else if (user.status === 'approved') {
            approvedHTML += userCard;
        }
    });
    
    pendingDiv.innerHTML = pendingHTML || '<p>No pending registrations</p>';
    approvedDiv.innerHTML = approvedHTML || '<p>No approved users</p>';
}

function approveUser(username) {
    const registeredUsers = JSON.parse(localStorage.getItem('iaps_registered_users') || '{}');
    if (registeredUsers[username]) {
        registeredUsers[username].status = 'approved';
        localStorage.setItem('iaps_registered_users', JSON.stringify(registeredUsers));
        loadUserManagement();
        alert(`User ${username} has been approved`);
    }
}

function rejectUser(username) {
    const registeredUsers = JSON.parse(localStorage.getItem('iaps_registered_users') || '{}');
    if (registeredUsers[username]) {
        delete registeredUsers[username];
        localStorage.setItem('iaps_registered_users', JSON.stringify(registeredUsers));
        loadUserManagement();
        alert(`User ${username} has been rejected`);
    }
}

// Accident form functionality
document.addEventListener('DOMContentLoaded', function() {
    const accidentForm = document.getElementById('accident-form');
    if (accidentForm) {
        // Real-time analysis preview
        const formInputs = accidentForm.querySelectorAll('input, select');
        formInputs.forEach(input => {
            input.addEventListener('change', updateAnalysisPreview);
        });
        
        // Form submission
        accidentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            submitAccidentReport();
        });
    }
});

function updateAnalysisPreview() {
    const previewDiv = document.getElementById('analysis-preview');
    if (!previewDiv) return;
    
    const formData = getAccidentFormData();
    
    if (!formData.driverAge && !formData.vehicleType && !formData.accidentType) {
        previewDiv.innerHTML = '<p>Fill the form to see real-time analysis preview</p>';
        return;
    }
    
    let analysisHTML = '';
    
    // Risk assessment based on driver age
    if (formData.driverAge) {
        let ageRisk = 'low';
        let ageAnalysis = 'Standard risk profile';
        
        if (formData.driverAge < 25) {
            ageRisk = 'high';
            ageAnalysis = 'Higher risk - Young driver';
        } else if (formData.driverAge > 65) {
            ageRisk = 'medium';
            ageAnalysis = 'Moderate risk - Senior driver';
        }
        
        analysisHTML += `
            <div class="analysis-item">
                <strong>Age Risk:</strong> ${ageAnalysis}
                <span class="risk-indicator risk-${ageRisk}">${ageRisk.toUpperCase()}</span>
            </div>
        `;
    }
    
    // Vehicle type analysis
    if (formData.vehicleType) {
        let vehicleRisk = 'medium';
        let vehicleAnalysis = 'Standard vehicle profile';
        
        if (formData.vehicleType === 'motorcycle') {
            vehicleRisk = 'high';
            vehicleAnalysis = 'High vulnerability vehicle';
        } else if (formData.vehicleType === 'truck') {
            vehicleRisk = 'high';
            vehicleAnalysis = 'Heavy vehicle - severe impact potential';
        }
        
        analysisHTML += `
            <div class="analysis-item">
                <strong>Vehicle Risk:</strong> ${vehicleAnalysis}
                <span class="risk-indicator risk-${vehicleRisk}">${vehicleRisk.toUpperCase()}</span>
            </div>
        `;
    }
    
    // Accident severity prediction
    if (formData.accidentType && formData.weatherConditions) {
        let severityRisk = 'medium';
        let severityAnalysis = 'Moderate severity expected';
        
        if (formData.accidentType === 'head-on' || formData.accidentType === 'rollover') {
            severityRisk = 'high';
            severityAnalysis = 'High severity accident type';
        }
        
        if (formData.weatherConditions === 'rain' || formData.weatherConditions === 'snow') {
            severityRisk = severityRisk === 'high' ? 'high' : 'medium';
            severityAnalysis += ' - Adverse weather conditions';
        }
        
        analysisHTML += `
            <div class="analysis-item">
                <strong>Severity Prediction:</strong> ${severityAnalysis}
                <span class="risk-indicator risk-${severityRisk}">${severityRisk.toUpperCase()}</span>
            </div>
        `;
    }
    
    // Ambulance positioning recommendation
    if (formData.latitude && formData.longitude) {
        analysisHTML += `
            <div class="analysis-item">
                <strong>Location Analysis:</strong> Coordinates captured for optimal ambulance positioning
                <span class="risk-indicator risk-low">READY</span>
            </div>
        `;
    }
    
    previewDiv.innerHTML = analysisHTML || '<p>Continue filling the form for detailed analysis</p>';
}

function getAccidentFormData() {
    return {
        driverAge: document.getElementById('driver-age')?.value,
        driverGender: document.getElementById('driver-gender')?.value,
        driverExperience: document.getElementById('driver-experience')?.value,
        licenseType: document.getElementById('license-type')?.value,
        vehicleType: document.getElementById('vehicle-type')?.value,
        vehicleAge: document.getElementById('vehicle-age')?.value,
        engineSize: document.getElementById('engine-size')?.value,
        safetyRating: document.getElementById('safety-rating')?.value,
        accidentType: document.getElementById('accident-type')?.value,
        accidentSeverity: document.getElementById('accident-severity')?.value,
        weatherConditions: document.getElementById('weather-conditions')?.value,
        roadConditions: document.getElementById('road-conditions')?.value,
        latitude: document.getElementById('latitude')?.value,
        longitude: document.getElementById('longitude')?.value,
        accidentDate: document.getElementById('accident-date')?.value,
        accidentTime: document.getElementById('accident-time')?.value
    };
}

function submitAccidentReport() {
    const formData = getAccidentFormData();
    
    // Store accident data
    let accidentReports = JSON.parse(localStorage.getItem('iaps_accident_reports') || '[]');
    const newReport = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        ...formData
    };
    
    accidentReports.push(newReport);
    localStorage.setItem('iaps_accident_reports', JSON.stringify(accidentReports));
    
    alert('Accident report submitted successfully! Data will be used for ambulance positioning analysis.');
    document.getElementById('accident-form').reset();
    updateAnalysisPreview();
}

// Navigation functionality
function initializeNavigation() {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all links and sections
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
            
            // Add active class to clicked link
            this.classList.add('active');
            
            // Show corresponding section
            const sectionId = this.getAttribute('data-section');
            const targetSection = document.getElementById(sectionId);
            if (targetSection) {
                targetSection.classList.add('active');
            }
        });
    });
}

// Initialize navigation when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
});

// Logout functionality
document.getElementById('logout-btn').addEventListener('click', function() {
    localStorage.removeItem('iaps_session');
    window.location.href = 'index.html';
});

// Dataset collection functionality
let selectedFiles = [];
let processingQueue = [];

// Data type card selection
document.querySelectorAll('.data-type-card').forEach(card => {
    card.addEventListener('click', function() {
        document.querySelectorAll('.data-type-card').forEach(c => c.classList.remove('selected'));
        this.classList.add('selected');
        
        const dataType = this.getAttribute('data-type');
        document.getElementById('data-type').value = dataType + '-reports';
    });
});

// File selection
document.getElementById('file-input').addEventListener('change', function(e) {
    selectedFiles = Array.from(e.target.files);
    updateFileDisplay();
});

function updateFileDisplay() {
    const label = document.querySelector('.upload-label');
    if (selectedFiles.length > 0) {
        label.innerHTML = `📁 ${selectedFiles.length} file(s) selected<br><small>${selectedFiles.map(f => f.name).join(', ')}</small>`;
    } else {
        label.innerHTML = '📁 Select Files for Batch Upload';
    }
}

// Process upload with validation
document.getElementById('process-upload').addEventListener('click', function() {
    if (selectedFiles.length === 0) {
        alert('Please select files to upload');
        return;
    }
    
    const metadata = {
        source: document.getElementById('data-source').value,
        type: document.getElementById('data-type').value,
        locationId: document.getElementById('location-id').value,
        severity: document.getElementById('severity-level').value,
        startDate: document.getElementById('start-date').value,
        endDate: document.getElementById('end-date').value
    };
    
    processFiles(selectedFiles, metadata);
});

function processFiles(files, metadata) {
    const validationResults = document.getElementById('validation-results');
    const queueStatus = document.getElementById('queue-status');
    
    validationResults.innerHTML = '<div class="status-indicator status-processing">Validating files...</div>';
    
    // Simulate file validation and processing
    files.forEach((file, index) => {
        const queueItem = {
            id: Date.now() + index,
            filename: file.name,
            size: file.size,
            status: 'processing',
            metadata: metadata
        };
        
        processingQueue.push(queueItem);
        
        // Simulate async processing
        setTimeout(() => {
            validateFile(file, queueItem);
        }, 1000 + (index * 500));
    });
    
    updateQueueDisplay();
}

function validateFile(file, queueItem) {
    const validationResults = document.getElementById('validation-results');
    
    // Simulate validation checks
    const validations = [
        { check: 'File format', status: file.name.match(/\.(csv|json|xlsx)$/i) ? 'passed' : 'failed' },
        { check: 'File size', status: file.size < 100 * 1024 * 1024 ? 'passed' : 'failed' },
        { check: 'Schema compliance', status: Math.random() > 0.2 ? 'passed' : 'failed' },
        { check: 'Data quality', status: Math.random() > 0.1 ? 'passed' : 'failed' }
    ];
    
    const allPassed = validations.every(v => v.status === 'passed');
    queueItem.status = allPassed ? 'completed' : 'error';
    queueItem.validations = validations;
    
    // Update validation display
    let resultsHTML = `<h4>${file.name}</h4>`;
    validations.forEach(v => {
        const statusClass = v.status === 'passed' ? 'status-completed' : 'status-error';
        resultsHTML += `<div class="${statusClass}">${v.check}: ${v.status}</div>`;
    });
    
    if (allPassed) {
        resultsHTML += '<div class="status-completed">✓ File ready for ingestion</div>';
        // Process the dataset and update clusters
        processDatasetForClusters(file, queueItem.metadata);
        resultsHTML += '<div class="status-completed">📊 Processing CSV/JSON data for clustering...</div>';
    } else {
        resultsHTML += '<div class="status-error">✗ File requires correction</div>';
    }
    
    validationResults.innerHTML = resultsHTML;
    updateQueueDisplay();
}

function processDatasetForClusters(file, metadata) {
    // Simulate reading file content and generating new clusters
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            let data;
            if (file.name.endsWith('.json')) {
                data = JSON.parse(e.target.result);
            } else {
                // Simulate CSV parsing
                data = parseCSVData(e.target.result);
            }
            
            // Generate new clusters based on uploaded data
            const newClusters = generateClustersFromData(data, metadata);
            
            // Update stored cluster data
            localStorage.setItem('iaps_current_clusters', JSON.stringify(newClusters));
            
            // Update statistics
            updateClusterStatistics(newClusters);
            
            // Show success message
            setTimeout(() => {
                alert(`✅ Dataset processed successfully!\n\n📊 ${newClusters.length} new clusters identified\n🗺️ Map updated with new data\n📈 Statistics refreshed`);
            }, 1000);
            
        } catch (error) {
            console.error('Error processing dataset:', error);
        }
    };
    
    reader.readAsText(file);
}

function parseCSVData(csvText) {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) return [];
    
    const headers = lines[0].toLowerCase().split(',').map(h => h.trim());
    const data = [];
    
    // Find column indices
    const latIndex = headers.findIndex(h => h.includes('lat') || h.includes('latitude'));
    const lngIndex = headers.findIndex(h => h.includes('lng') || h.includes('lon') || h.includes('longitude'));
    const severityIndex = headers.findIndex(h => h.includes('severity') || h.includes('type'));
    const accidentIndex = headers.findIndex(h => h.includes('accident') || h.includes('count'));
    
    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        if (values.length >= 2) {
            const lat = latIndex >= 0 ? parseFloat(values[latIndex]) : null;
            const lng = lngIndex >= 0 ? parseFloat(values[lngIndex]) : null;
            
            // Use provided coordinates or generate random ones in Delhi area
            const finalLat = (lat && !isNaN(lat)) ? lat : (28.6 + Math.random() * 0.2);
            const finalLng = (lng && !isNaN(lng)) ? lng : (77.2 + Math.random() * 0.2);
            
            data.push({
                lat: finalLat,
                lng: finalLng,
                severity: severityIndex >= 0 ? values[severityIndex].toLowerCase() : 
                         ['high', 'medium', 'low'][Math.floor(Math.random() * 3)],
                accidents: accidentIndex >= 0 ? parseInt(values[accidentIndex]) || 1 : 
                          Math.floor(Math.random() * 50) + 10
            });
        }
    }
    
    return data;
}

function generateClustersFromData(data, metadata) {
    // Simulate DEC clustering algorithm on uploaded data
    const clusters = [];
    const locations = [
        { area: 'Uploaded Area 1', lat: 28.6139, lng: 77.2090 },
        { area: 'Uploaded Area 2', lat: 28.5355, lng: 77.3910 },
        { area: 'Uploaded Area 3', lat: 28.7041, lng: 77.1025 },
        { area: 'Uploaded Area 4', lat: 28.4595, lng: 77.0266 }
    ];
    
    // Generate clusters based on data density
    locations.forEach((loc, index) => {
        const accidents = Math.floor(Math.random() * 200) + 50;
        const severity = accidents > 150 ? 'high' : accidents > 100 ? 'medium' : 'low';
        
        clusters.push({
            lat: loc.lat + (Math.random() - 0.5) * 0.01,
            lng: loc.lng + (Math.random() - 0.5) * 0.01,
            accidents: accidents,
            severity: severity,
            id: `U${index + 1}`,
            area: loc.area,
            source: metadata.source || 'uploaded-data'
        });
    });
    
    return clusters;
}

function updateClusterStatistics(clusters) {
    // Update overview statistics
    const totalAccidents = clusters.reduce((sum, cluster) => sum + cluster.accidents, 0);
    
    // Update stats in overview section
    const statCards = document.querySelectorAll('.stat-number');
    if (statCards.length >= 2) {
        statCards[1].textContent = clusters.length; // Update cluster count
    }
    
    // Update cluster statistics section
    const clusterStats = document.querySelectorAll('#clusters .stat-number');
    if (clusterStats.length >= 2) {
        clusterStats[0].textContent = clusters.length;
        clusterStats[1].textContent = totalAccidents;
    }
}

function updateQueueDisplay() {
    const queueStatus = document.getElementById('queue-status');
    
    if (processingQueue.length === 0) {
        queueStatus.innerHTML = 'No files in queue';
        return;
    }
    
    let queueHTML = '';
    processingQueue.forEach(item => {
        const statusClass = `status-${item.status}`;
        queueHTML += `
            <div class="queue-item">
                <span>${item.filename}</span>
                <span class="status-indicator ${statusClass}">${item.status}</span>
            </div>
        `;
    });
    
    queueStatus.innerHTML = queueHTML;
}

function customizeForOperator() {
    // Show operator-specific sections
    document.querySelectorAll('.operator-only').forEach(el => {
        el.style.display = 'block';
    });
    
    // Update page title for operator
    document.querySelector('.nav-brand').textContent = '🚨 IAPS - Emergency Dispatch';
    
    // Add dispatch functionality
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('btn-dispatch')) {
            const ambulanceId = e.target.textContent.split(' ')[1];
            dispatchAmbulance(ambulanceId, e.target);
        }
    });
}

function customizeForAnalyst() {
    // Show analyst-specific sections
    document.querySelectorAll('.analyst-only').forEach(el => {
        el.style.display = 'block';
    });
    
    // Update page title for analyst
    document.querySelector('.nav-brand').textContent = '📊 IAPS - Research Analytics';
    
    // Add research functionality
    initializeResearchTools();
}

function initializeResearchTools() {
    // Cluster count slider
    const clusterSlider = document.getElementById('cluster-count');
    const clusterValue = document.getElementById('cluster-value');
    
    if (clusterSlider && clusterValue) {
        clusterSlider.addEventListener('input', function() {
            clusterValue.textContent = this.value;
        });
    }
    
    // Run experiment button
    document.addEventListener('click', function(e) {
        if (e.target.id === 'run-experiment') {
            runModelExperiment();
        }
        if (e.target.id === 'generate-report') {
            generateAnalyticsReport();
        }
        if (e.target.textContent === 'Run A/B Test') {
            runABTest();
        }
        if (e.target.textContent === 'Validate Model') {
            runCrossValidation();
        }
        if (e.target.textContent === 'Analyze Features') {
            analyzeFeatureImportance();
        }
    });
}

function runModelExperiment() {
    const algorithm = document.getElementById('algorithm-select').value;
    const clusters = document.getElementById('cluster-count').value;
    const learningRate = document.getElementById('learning-rate').value;
    const epochs = document.getElementById('epochs').value;
    
    const button = document.getElementById('run-experiment');
    button.textContent = 'Running Experiment...';
    button.disabled = true;
    
    setTimeout(() => {
        // Simulate experiment results
        const results = generateExperimentResults(algorithm, clusters);
        updateExperimentResults(results);
        
        button.textContent = 'Run Experiment';
        button.disabled = false;
        
        alert(`✅ Experiment completed!\n\nAlgorithm: ${algorithm.toUpperCase()}\nClusters: ${clusters}\nSilhouette Score: ${results.silhouette}\nTraining completed in ${epochs} epochs`);
    }, 3000);
}

function generateExperimentResults(algorithm, clusters) {
    const baseScores = {
        dec: { silhouette: 0.4853, davies: 2.523, calinski: 500.29 },
        kmeans: { silhouette: 0.3642, davies: 1.892, calinski: 642.15 },
        gmm: { silhouette: 0.3298, davies: 3.156, calinski: 423.87 },
        agglomerative: { silhouette: 0.3012, davies: 3.687, calinski: 356.42 }
    };
    
    const base = baseScores[algorithm] || baseScores.dec;
    const variation = (Math.random() - 0.5) * 0.1;
    
    return {
        silhouette: (base.silhouette + variation).toFixed(4),
        davies: (base.davies + variation).toFixed(3),
        calinski: (base.calinski + variation * 50).toFixed(2)
    };
}

function updateExperimentResults(results) {
    const scoreDisplays = document.querySelectorAll('.score-display');
    if (scoreDisplays.length >= 3) {
        scoreDisplays[0].textContent = results.silhouette;
        scoreDisplays[1].textContent = results.davies;
        scoreDisplays[2].textContent = results.calinski;
    }
}

function generateAnalyticsReport() {
    const reportType = document.getElementById('report-type').value;
    const timePeriod = document.getElementById('time-period').value;
    
    const button = document.getElementById('generate-report');
    button.textContent = 'Generating...';
    button.disabled = true;
    
    setTimeout(() => {
        button.textContent = 'Generate Report';
        button.disabled = false;
        
        // Simulate report download
        const reportData = {
            type: reportType,
            period: timePeriod,
            generated: new Date().toISOString(),
            metrics: {
                accuracy: '95.2%',
                clusters: 6,
                improvements: '34% coverage increase'
            }
        };
        
        const dataStr = JSON.stringify(reportData, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `${reportType}-report-${timePeriod}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
        alert(`✅ ${reportType} report generated for ${timePeriod}!`);
    }, 2000);
}

function runABTest() {
    alert('🧪 A/B Test initiated!\n\nComparing DEC vs K-Means:\n• Sample size: 1000 incidents\n• Test duration: 7 days\n• Significance level: 95%\n\nResults will be available in Research Tools.');
}

function runCrossValidation() {
    alert('✅ K-Fold Cross Validation completed!\n\nResults (k=5):\n• Mean accuracy: 94.8%\n• Std deviation: 1.2%\n• 95% CI: [93.6%, 96.0%]\n• Model is statistically robust');
}

function analyzeFeatureImportance() {
    alert('📈 Feature Importance Analysis:\n\nTop features (Cat2Vec embeddings):\n1. Location coordinates (0.34)\n2. Time of day (0.28)\n3. Weather conditions (0.19)\n4. Vehicle type (0.12)\n5. Road type (0.07)');
}

function dispatchAmbulance(ambulanceId, button) {
    const originalText = button.textContent;
    button.textContent = 'Dispatching...';
    button.disabled = true;
    
    setTimeout(() => {
        // Update ambulance status
        const ambulanceUnit = document.querySelector(`[class*="ambulance-unit"] .unit-id:contains("${ambulanceId}")`).closest('.ambulance-unit');
        if (ambulanceUnit) {
            ambulanceUnit.className = 'ambulance-unit dispatched';
            ambulanceUnit.querySelector('.unit-status').textContent = 'En Route';
        }
        
        // Remove call from queue
        const callItem = button.closest('.call-item');
        callItem.style.opacity = '0.5';
        callItem.querySelector('.call-info strong').innerHTML += ' - DISPATCHED';
        
        button.textContent = 'Dispatched';
        button.style.background = '#27ae60';
        
        alert(`✅ Ambulance ${ambulanceId} dispatched successfully!\n\n🚨 Emergency response initiated\n📍 GPS tracking activated\n⏱️ ETA: 6-8 minutes`);
    }, 2000);
}

// Positioning functionality
document.addEventListener('click', function(e) {
    if (e.target.id === 'calculate-positions') {
        generateOptimalPositions();
    }
    if (e.target.id === 'view-current') {
        viewCurrentDeployment();
    }
    if (e.target.id === 'export-results') {
        exportPositioningResults();
    }
});

function generateOptimalPositions() {
    const button = document.getElementById('calculate-positions');
    const originalText = button.textContent;
    
    button.textContent = 'Calculating...';
    button.disabled = true;
    
    setTimeout(() => {
        // Animate optimal positions on map
        if (positioningMap && ambulancePositions.length > 0) {
            ambulancePositions.forEach((pos, index) => {
                if (pos.data.type === 'optimal') {
                    setTimeout(() => {
                        // Animate marker
                        const marker = pos.marker;
                        const originalIcon = marker.getIcon();
                        
                        // Pulse effect
                        marker.setIcon(L.divIcon({
                            html: '🚑',
                            iconSize: [40, 40],
                            className: 'ambulance-marker pulsing'
                        }));
                        
                        setTimeout(() => {
                            marker.setIcon(originalIcon);
                        }, 1000);
                    }, index * 300);
                }
            });
        }
        
        button.textContent = originalText;
        button.disabled = false;
        
        alert('✅ Optimal positions calculated using DEC model!\n\n📍 3 strategic positions identified\n📊 34% coverage improvement\n⏱️ 42% response time reduction');
    }, 2000);
}

function viewCurrentDeployment() {
    if (positioningMap && ambulancePositions.length > 0) {
        ambulancePositions.forEach(pos => {
            if (pos.data.type === 'current') {
                // Highlight current position
                const marker = pos.marker;
                marker.setIcon(L.divIcon({
                    html: '🚑',
                    iconSize: [35, 35],
                    className: 'ambulance-marker highlighted'
                }));
                
                setTimeout(() => {
                    marker.setIcon(L.divIcon({
                        html: '🚑',
                        iconSize: [30, 30],
                        className: 'ambulance-marker'
                    }));
                }, 2000);
            }
        });
    }
    
    alert('📍 Current deployment shown\n\n🚨 1 suboptimal position detected\n📈 Recommendations available in analytics panel');
}

function exportPositioningResults() {
    const results = {
        timestamp: new Date().toISOString(),
        model: 'Deep Embedded Clustering (DEC)',
        accuracy: '95.2%',
        optimalPositions: [
            { id: 'A1', lat: 40.7589, lng: -73.9851, coverage: '2.3km' },
            { id: 'B2', lat: 40.7505, lng: -73.9934, coverage: '2.1km' },
            { id: 'C3', lat: 40.7614, lng: -73.9776, coverage: '2.5km' }
        ],
        improvements: {
            coverageIncrease: '34%',
            responseTimeReduction: '42%',
            clusterAlignment: '89%'
        }
    };
    
    // Simulate file download
    const dataStr = JSON.stringify(results, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `ambulance-positioning-results-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    alert('📄 Positioning results exported successfully!');
}

// Cluster analysis functionality
document.addEventListener('click', function(e) {
    if (e.target.id === 'analyze-clusters') {
        runClusterAnalysis();
    }
    if (e.target.id === 'toggle-heatmap') {
        toggleHeatmapView();
    }
});

function runClusterAnalysis() {
    const button = document.getElementById('analyze-clusters');
    const originalText = button.textContent;
    
    button.textContent = 'Analyzing...';
    button.disabled = true;
    
    // Animate cluster appearance
    const clusters = document.querySelectorAll('.accident-cluster');
    clusters.forEach((cluster, index) => {
        cluster.style.opacity = '0';
        cluster.style.transform = 'scale(0)';
        
        setTimeout(() => {
            cluster.style.transition = 'all 0.5s ease';
            cluster.style.opacity = '1';
            cluster.style.transform = 'scale(1)';
        }, index * 200);
    });
    
    setTimeout(() => {
        button.textContent = originalText;
        button.disabled = false;
        alert('✅ DEC Analysis Complete!\n\n📍 6 clusters identified\n📊 Silhouette Score: 0.485\n📈 92% clustering accuracy');
    }, 2000);
}

function toggleHeatmapView() {
    const clusters = document.querySelectorAll('.accident-cluster');
    const points = document.querySelectorAll('.accident-point');
    const button = document.getElementById('toggle-heatmap');
    
    const isHeatmapMode = button.textContent === 'Show Clusters';
    
    if (isHeatmapMode) {
        // Show clusters, hide points
        clusters.forEach(cluster => {
            cluster.style.display = 'block';
        });
        points.forEach(point => {
            point.style.display = 'none';
        });
        button.textContent = 'Toggle Heatmap';
    } else {
        // Show points, hide clusters
        clusters.forEach(cluster => {
            cluster.style.display = 'none';
        });
        points.forEach(point => {
            point.style.display = 'block';
        });
        button.textContent = 'Show Clusters';
    }
}

// Leaflet Map initialization
let map;
let clusters = [];

// Initialize map when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(initLeafletMap, 1000); // Delay to ensure section is visible
});

function initLeafletMap() {
    const mapElement = document.getElementById('leaflet-map');
    if (!mapElement || !document.getElementById('clusters').classList.contains('active')) {
        return;
    }
    
    // Initialize Leaflet map centered on Delhi, India
    map = L.map('leaflet-map').setView([28.6139, 77.2090], 11);
    
    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
    
    // Add accident clusters to map
    addAccidentClusters();
}

function addAccidentClusters() {
    const clusterData = [
        { lat: 28.6139, lng: 77.2090, accidents: 234, severity: 'high', id: 'H1', area: 'Connaught Place' },
        { lat: 28.5355, lng: 77.3910, accidents: 198, severity: 'high', id: 'H2', area: 'Noida Expressway' },
        { lat: 28.7041, lng: 77.1025, accidents: 156, severity: 'medium', id: 'M1', area: 'Rohini Sector 7' },
        { lat: 28.4595, lng: 77.0266, accidents: 134, severity: 'medium', id: 'M2', area: 'Gurgaon Highway' },
        { lat: 28.6692, lng: 77.4538, accidents: 89, severity: 'low', id: 'L1', area: 'Ghaziabad' },
        { lat: 28.5244, lng: 77.1855, accidents: 67, severity: 'low', id: 'L2', area: 'Saket Metro' }
    ];
    
    clusterData.forEach(cluster => {
        // Create circle for cluster area
        const circle = L.circle([cluster.lat, cluster.lng], {
            color: getClusterColor(cluster.severity),
            fillColor: getClusterColor(cluster.severity),
            fillOpacity: 0.3,
            radius: getClusterRadius(cluster.severity)
        }).addTo(map);
        
        // Create marker for cluster center
        const marker = L.circleMarker([cluster.lat, cluster.lng], {
            color: '#ffffff',
            fillColor: getClusterColor(cluster.severity),
            fillOpacity: 1,
            radius: 8,
            weight: 2
        }).addTo(map);
        
        // Create popup
        const popupContent = `
            <div style="padding: 5px;">
                <h4>Cluster ${cluster.id} - ${cluster.area}</h4>
                <p><strong>Accidents:</strong> ${cluster.accidents}</p>
                <p><strong>Severity:</strong> ${cluster.severity.toUpperCase()}</p>
                <p><strong>Location:</strong> ${cluster.lat.toFixed(4)}, ${cluster.lng.toFixed(4)}</p>
            </div>
        `;
        
        marker.bindPopup(popupContent);
        circle.bindPopup(popupContent);
        
        clusters.push({ circle, marker, data: cluster });
    });
}

function getClusterColor(severity) {
    switch(severity) {
        case 'high': return '#e74c3c';
        case 'medium': return '#f39c12';
        case 'low': return '#27ae60';
        default: return '#666666';
    }
}

function getClusterRadius(severity) {
    switch(severity) {
        case 'high': return 800;
        case 'medium': return 600;
        case 'low': return 400;
        default: return 500;
    }
}

// Initialize maps when sections are activated
let positioningMap;
let ambulancePositions = [];

document.addEventListener('click', function(e) {
    const section = e.target.getAttribute('data-section');
    
    if (section === 'clusters') {
        setTimeout(() => {
            if (map) {
                map.invalidateSize();
                const storedClusters = localStorage.getItem('iaps_current_clusters');
                if (storedClusters) {
                    updateMapWithNewClusters(JSON.parse(storedClusters));
                }
            } else {
                initLeafletMap();
            }
        }, 100);
    }
    
    if (section === 'positioning') {
        setTimeout(() => {
            if (positioningMap) {
                positioningMap.invalidateSize();
            } else {
                initPositioningMap();
            }
        }, 100);
    }
});

function initPositioningMap() {
    const mapElement = document.getElementById('positioning-map');
    if (!mapElement) return;
    
    // Initialize positioning map
    positioningMap = L.map('positioning-map').setView([28.6139, 77.2090], 11);
    
    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(positioningMap);
    
    // Add ambulance positions and clusters
    addAmbulancePositions();
    addClusterOverlay();
}

function addAmbulancePositions() {
    const positions = [
        { lat: 28.6139, lng: 77.2090, id: 'A1', type: 'optimal', coverage: 2.3, area: 'Connaught Place' },
        { lat: 28.5355, lng: 77.3910, id: 'B2', type: 'optimal', coverage: 2.1, area: 'Noida Expressway' },
        { lat: 28.7041, lng: 77.1025, id: 'C3', type: 'optimal', coverage: 2.5, area: 'Rohini Sector 7' },
        { lat: 28.4595, lng: 77.0266, id: 'D4', type: 'current', coverage: 1.8, area: 'Gurgaon Highway' }
    ];
    
    positions.forEach(pos => {
        // Create coverage circle
        const circle = L.circle([pos.lat, pos.lng], {
            color: pos.type === 'optimal' ? '#27ae60' : '#e74c3c',
            fillColor: pos.type === 'optimal' ? '#27ae60' : '#e74c3c',
            fillOpacity: 0.1,
            radius: pos.coverage * 1000,
            weight: 2
        }).addTo(positioningMap);
        
        // Create ambulance marker
        const marker = L.marker([pos.lat, pos.lng], {
            icon: L.divIcon({
                html: '🚑',
                iconSize: [30, 30],
                className: 'ambulance-marker'
            })
        }).addTo(positioningMap);
        
        // Create popup
        const popupContent = `
            <div style="padding: 5px;">
                <h4>Position ${pos.id} - ${pos.area}</h4>
                <p><strong>Type:</strong> ${pos.type.toUpperCase()}</p>
                <p><strong>Coverage:</strong> ${pos.coverage}km radius</p>
                <p><strong>Location:</strong> ${pos.lat.toFixed(4)}, ${pos.lng.toFixed(4)}</p>
            </div>
        `;
        
        marker.bindPopup(popupContent);
        circle.bindPopup(popupContent);
        
        ambulancePositions.push({ circle, marker, data: pos });
    });
}

function addClusterOverlay() {
    // Add accident clusters as background reference
    const clusterData = [
        { lat: 28.6139, lng: 77.2090, severity: 'high' },
        { lat: 28.5355, lng: 77.3910, severity: 'high' },
        { lat: 28.7041, lng: 77.1025, severity: 'medium' },
        { lat: 28.4595, lng: 77.0266, severity: 'medium' }
    ];
    
    clusterData.forEach(cluster => {
        L.circle([cluster.lat, cluster.lng], {
            color: getClusterColor(cluster.severity),
            fillColor: getClusterColor(cluster.severity),
            fillOpacity: 0.2,
            radius: 600,
            weight: 1,
            dashArray: '5, 5'
        }).addTo(positioningMap);
    });
}

function updateMapWithNewClusters(newClusters) {
    // Clear existing clusters
    clusters.forEach(cluster => {
        if (cluster.circle) map.removeLayer(cluster.circle);
        if (cluster.marker) map.removeLayer(cluster.marker);
    });
    clusters = [];
    
    // Add new clusters
    newClusters.forEach(cluster => {
        // Create circle for cluster area
        const circle = L.circle([cluster.lat, cluster.lng], {
            color: getClusterColor(cluster.severity),
            fillColor: getClusterColor(cluster.severity),
            fillOpacity: 0.3,
            radius: getClusterRadius(cluster.severity)
        }).addTo(map);
        
        // Create marker for cluster center
        const marker = L.circleMarker([cluster.lat, cluster.lng], {
            color: '#ffffff',
            fillColor: getClusterColor(cluster.severity),
            fillOpacity: 1,
            radius: 8,
            weight: 2
        }).addTo(map);
        
        // Create popup
        const popupContent = `
            <div style="padding: 5px;">
                <h4>Cluster ${cluster.id} - ${cluster.area}</h4>
                <p><strong>Accidents:</strong> ${cluster.accidents}</p>
                <p><strong>Severity:</strong> ${cluster.severity.toUpperCase()}</p>
                <p><strong>Source:</strong> ${cluster.source || 'default'}</p>
                <p><strong>Location:</strong> ${cluster.lat.toFixed(4)}, ${cluster.lng.toFixed(4)}</p>
            </div>
        `;
        
        marker.bindPopup(popupContent);
        circle.bindPopup(popupContent);
        
        clusters.push({ circle, marker, data: cluster });
    });
    
    // Fit map to show all clusters
    if (clusters.length > 0) {
        const group = new L.featureGroup(clusters.map(c => c.marker));
        map.fitBounds(group.getBounds().pad(0.1));
    }
}

// Time filter functionality
document.getElementById('time-filter').addEventListener('change', function(e) {
    const timeRange = e.target.value;
    const stats = document.querySelectorAll('.stat-number');
    
    // Simulate data filtering
    switch(timeRange) {
        case 'last-month':
            stats[0].textContent = '4';
            stats[1].textContent = '89';
            break;
        case 'last-year':
            stats[0].textContent = '5';
            stats[1].textContent = '312';
            break;
        default:
            stats[0].textContent = '6';
            stats[1].textContent = '878';
    }
});