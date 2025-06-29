document.addEventListener('DOMContentLoaded', function() {
    // Verificar sesión
    if (!checkSession()) return;

    // Obtener tipo de gráfica de la URL
    const urlParams = new URLSearchParams(window.location.search);
    const tipo = urlParams.get('tipo') || 'diarias';
    
    // Cargar gráfica inicial
    loadChart(tipo);
    loadSummaryStats();
});

let earningsChart = null;
let categoryChart = null;
let typeChart = null;

function loadChart(tipo) {
    // Actualizar título
    const titles = {
        'diarias': 'Ganancias Diarias',
        'semanales': 'Ganancias Semanales',
        'mensuales': 'Ganancias Mensuales',
        'anuales': 'Ganancias Anuales'
    };
    document.getElementById('chartTitle').textContent = titles[tipo] || 'Gráfica de Ganancias';

    // Cargar datos
    fetch(`php/graficas.php?action=getEarnings&tipo=${tipo}`)
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            createEarningsChart(data.data, tipo);
        } else {
            console.error('Error al cargar datos:', data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function createEarningsChart(data, tipo) {
    const ctx = document.getElementById('earningsChart').getContext('2d');
    
    // Destruir gráfica anterior si existe
    if (earningsChart) {
        earningsChart.destroy();
    }

    const labels = data.map(item => item.label);
    const values = data.map(item => item.value);

    earningsChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Ganancias ($)',
                data: values,
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '$' + value.toLocaleString();
                        }
                    }
                }
            }
        }
    });
}

function loadSummaryStats() {
    fetch('php/graficas.php?action=getSummaryStats')
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            document.getElementById('totalEarnings').textContent = '$' + data.stats.totalEarnings.toLocaleString();
            document.getElementById('totalTickets').textContent = data.stats.totalTickets.toLocaleString();
            document.getElementById('totalFood').textContent = '$' + data.stats.totalFood.toLocaleString();
            document.getElementById('avgPerDay').textContent = '$' + data.stats.avgPerDay.toLocaleString();
            
            // Crear gráficas de distribución
            createCategoryChart(data.stats.categoryDistribution);
            createTypeChart(data.stats.typeDistribution);
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function createCategoryChart(data) {
    const ctx = document.getElementById('categoryChart').getContext('2d');
    
    if (categoryChart) {
        categoryChart.destroy();
    }

    const labels = data.map(item => item.category);
    const values = data.map(item => item.value);
    const colors = [
        '#667eea', '#28a745', '#ffc107', '#dc3545', 
        '#fd7e14', '#6f42c1', '#20c997', '#e83e8c'
    ];

    categoryChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: colors.slice(0, labels.length),
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

function createTypeChart(data) {
    const ctx = document.getElementById('typeChart').getContext('2d');
    
    if (typeChart) {
        typeChart.destroy();
    }

    const labels = data.map(item => item.type);
    const values = data.map(item => item.value);
    const colors = ['#667eea', '#28a745', '#ffc107'];

    typeChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: colors.slice(0, labels.length),
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
} 