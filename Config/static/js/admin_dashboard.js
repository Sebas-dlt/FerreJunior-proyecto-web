console.log('admin_dashboard.js loaded - version 3');

// Section navigation with data loading
function showSection(sectionName) {
    console.log('Showing section:', sectionName);
    
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.style.display = 'none';
    });

    // Show selected section
    const targetSection = document.getElementById('section-' + sectionName);
    if (targetSection) {
        targetSection.style.display = 'block';
        console.log('Section found and displayed:', sectionName);
    } else {
        console.error('Section not found:', 'section-' + sectionName);
    }

    // Update active nav link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    const activeLink = document.querySelector(`[onclick="showSection('${sectionName}')"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }

    // Update breadcrumb
    document.getElementById('currentSection').textContent = getSectionTitle(sectionName);

    // Load data for specific sections
    loadSectionData(sectionName);
}

// Load data for sections that need it
function loadSectionData(sectionName) {
    if (sectionName === 'users') {
        loadUsers();
    } else if (sectionName === 'products') {
        loadProducts();
    } else if (sectionName === 'orders') {
        loadOrders();
    } else if (sectionName === 'analytics') {
        loadAnalytics();
    } else if (sectionName === 'tickets') {
        loadTickets();
        startTicketsPolling();
    }
    // No auto-load for main sections, only when buttons are clicked
}

// Get section title for breadcrumb
function getSectionTitle(sectionName) {
    const titles = {
        'dashboard': 'Dashboard',
        'users': 'Usuarios',
        'products': 'Productos',
        'orders': 'Pedidos',
        'inventory': 'Inventario',
        'analytics': 'Analytics',
        'reports': 'Reportes',
        'tickets': 'Atención al Cliente',
        'settings': 'Configuración',
        'support': 'Soporte',
        'export-users': 'Exportar Usuarios',
        'low-stock': 'Stock Bajo',
        'pending-orders': 'Pedidos Pendientes',
        'completed-orders': 'Pedidos Completados',
        'report-generated': 'Reporte Generado'
    };
    return titles[sectionName] || capitalizeFirst(sectionName);
}

// Load export users data
function loadExportUsers() {
    const content = document.getElementById('export-users-content');
    content.innerHTML = '<div class="action-section"><p>Cargando datos de usuarios...</p></div>';

    fetch('/admin/export-users-data')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                renderExportUsers(data);
            } else {
                content.innerHTML = '<div class="action-section"><div class="alert alert-danger">Error al cargar datos: ' + data.error + '</div></div>';
            }
        })
        .catch(error => {
            console.error('Error loading users:', error);
            content.innerHTML = '<div class="action-section"><div class="alert alert-danger">Error al cargar datos de usuarios: ' + error.message + '</div></div>';
        });
}

// Load low stock products data
function loadLowStockProducts() {
    const content = document.getElementById('low-stock-content');
    content.innerHTML = '<div class="action-section"><p>Cargando productos con stock bajo...</p></div>';

    fetch('/admin/low-stock-products-data')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                renderLowStockProducts(data);
            } else {
                content.innerHTML = '<div class="action-section"><div class="alert alert-danger">Error al cargar productos: ' + data.error + '</div></div>';
            }
        })
        .catch(error => {
            console.error('Error loading low stock products:', error);
            content.innerHTML = '<div class="action-section"><div class="alert alert-danger">Error al cargar productos con stock bajo: ' + error.message + '</div></div>';
        });
}

// Load pending orders data
function loadPendingOrders() {
    const content = document.getElementById('pending-orders-content');
    content.innerHTML = '<div class="action-section"><p>Cargando pedidos pendientes...</p></div>';

    fetch('/admin/pending-orders-data')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                renderPendingOrders(data);
            } else {
                content.innerHTML = '<div class="action-section"><div class="alert alert-danger">Error al cargar pedidos: ' + data.error + '</div></div>';
            }
        })
        .catch(error => {
            console.error('Error loading pending orders:', error);
            content.innerHTML = '<div class="action-section"><div class="alert alert-danger">Error al cargar pedidos pendientes: ' + error.message + '</div></div>';
        });
}

// Load completed orders data
function loadCompletedOrders() {
    const content = document.getElementById('completed-orders-content');
    content.innerHTML = '<div class="action-section"><p>Cargando pedidos completados...</p></div>';

    fetch('/admin/completed-orders-data')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                renderCompletedOrders(data);
            } else {
                content.innerHTML = '<div class="action-section"><div class="alert alert-danger">Error al cargar pedidos: ' + data.error + '</div></div>';
            }
        })
        .catch(error => {
            console.error('Error loading completed orders:', error);
            content.innerHTML = '<div class="action-section"><div class="alert alert-danger">Error al cargar pedidos completados: ' + error.message + '</div></div>';
        });
}

// Render functions
function renderExportUsers(data) {
    const content = document.getElementById('export-users-content');
    let html = `
        <div class="action-section">
            <div class="section-header">
                <div class="section-icon" style="background: #fff0eb; color: #ff6b35;">
                    <i class="fas fa-users"></i>
                </div>
                <h3 class="section-title">Lista de Usuarios (${data.users.length})</h3>
            </div>
            <div class="action-buttons">
                <button class="action-btn secondary" onclick="showSection('dashboard')">
                    <i class="fas fa-arrow-left"></i>
                    Regresar al Dashboard
                </button>
                <button class="action-btn primary" onclick="downloadUsersCSV()">
                    <i class="fas fa-download"></i>
                    Descargar CSV
                </button>
            </div>
        </div>
        <div class="action-section">
            <table class="table table-striped">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Email</th>
                        <th>Rol</th>
                        <th>Estado</th>
                        <th>Registro</th>
                    </tr>
                </thead>
                <tbody>
    `;

    data.users.forEach(user => {
        html += `
            <tr>
                <td>${user.id}</td>
                <td>${user.name || ''}</td>
                <td>${user.email || ''}</td>
                <td>${user.role || ''}</td>
                <td><span class="badge ${user.active ? 'bg-success' : 'bg-danger'}">${user.active ? 'Activo' : 'Inactivo'}</span></td>
                <td>${user.created_at ? new Date(user.created_at).toLocaleDateString() : ''}</td>
            </tr>
        `;
    });

    html += `
                </tbody>
            </table>
        </div>
    `;

    content.innerHTML = html;
}

function renderLowStockProducts(data) {
    const content = document.getElementById('low-stock-content');
    let html = `
        <div class="action-section">
            <div class="section-header">
                <div class="section-icon" style="background: #fff3cd; color: #856404;">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <h3 class="section-title">Productos con Stock Bajo (${data.products.length})</h3>
            </div>
            <div class="action-buttons">
                <button class="action-btn secondary" onclick="showSection('dashboard')">
                    <i class="fas fa-arrow-left"></i>
                    Regresar al Dashboard
                </button>
            </div>
        </div>
    `;

    if (data.products.length === 0) {
        html += `
            <div class="action-section">
                <div class="alert alert-success">
                    <i class="fas fa-check-circle"></i>
                    ¡Excelente! Todos los productos tienen stock suficiente.
                </div>
            </div>
        `;
    } else {
        html += `
            <div class="action-section">
                <table class="table table-striped">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Producto</th>
                            <th>SKU</th>
                            <th>Stock Actual</th>
                            <th>Stock Mínimo</th>
                            <th>Estado</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        data.products.forEach(product => {
            const status = product.stock_quantity <= product.min_stock_level ? 'Crítico' : 'Bajo';
            const statusClass = status === 'Crítico' ? 'bg-danger' : 'bg-warning';

            html += `
                <tr>
                    <td>${product.id}</td>
                    <td>${product.name}</td>
                    <td>${product.sku}</td>
                    <td><span class="text-danger font-weight-bold">${product.stock_quantity}</span></td>
                    <td>${product.min_stock_level}</td>
                    <td><span class="badge ${statusClass}">${status}</span></td>
                </tr>
            `;
        });

        html += `
                    </tbody>
                </table>
            </div>
        `;
    }

    content.innerHTML = html;
}

function renderPendingOrders(data) {
    const content = document.getElementById('pending-orders-content');
    let html = `
        <div class="action-section">
            <div class="section-header">
                <div class="section-icon" style="background: #fff3cd; color: #856404;">
                    <i class="fas fa-clock"></i>
                </div>
                <h3 class="section-title">Pedidos Pendientes (${data.orders.length})</h3>
            </div>
            <div class="action-buttons">
                <button class="action-btn secondary" onclick="showSection('dashboard')">
                    <i class="fas fa-arrow-left"></i>
                    Regresar al Dashboard
                </button>
            </div>
        </div>
    `;

    if (data.orders.length === 0) {
        html += `
            <div class="action-section">
                <div class="alert alert-success">
                    <i class="fas fa-check-circle"></i>
                    ¡Excelente! No hay pedidos pendientes.
                </div>
            </div>
        `;
    } else {
        html += `
            <div class="action-section">
                <table class="table table-striped">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Número</th>
                            <th>Cliente</th>
                            <th>Total</th>
                            <th>Estado</th>
                            <th>Fecha</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        data.orders.forEach(order => {
            html += `
                <tr>
                    <td>${order.id}</td>
                    <td>${order.order_number}</td>
                    <td>${order.user_name || 'N/A'}</td>
                    <td>${typeof formatCOP === 'function' ? formatCOP(order.total_amount) : '$' + (order.total_amount || 0).toLocaleString()}</td>
                    <td><span class="badge bg-warning">${order.status}</span></td>
                    <td>${order.created_at ? new Date(order.created_at).toLocaleDateString() : ''}</td>
                </tr>
            `;
        });

        html += `
                    </tbody>
                </table>
            </div>
        `;
    }

    content.innerHTML = html;
}

function renderCompletedOrders(data) {
    const content = document.getElementById('completed-orders-content');
    let html = `
        <div class="action-section">
            <div class="section-header">
                <div class="section-icon" style="background: #d4edda; color: #155724;">
                    <i class="fas fa-check-circle"></i>
                </div>
                <h3 class="section-title">Pedidos Completados (${data.orders.length})</h3>
        </div>
        <div class="action-buttons">
            <button class="action-btn secondary" onclick="showSection('dashboard')">
                <i class="fas fa-arrow-left"></i>
                Regresar al Dashboard
            </button>
        </div>
    </div>
`;

    if (data.orders.length === 0) {
        html += `
            <div class="action-section">
                <div class="alert alert-info">
                    <i class="fas fa-info-circle"></i>
                    Aún no hay pedidos completados.
                </div>
            </div>
        `;
    } else {
        html += `
            <div class="action-section">
                <table class="table table-striped">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Número</th>
                            <th>Cliente</th>
                            <th>Total</th>
                            <th>Estado</th>
                            <th>Completado</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        data.orders.forEach(order => {
            html += `
                <tr>
                    <td>${order.id}</td>
                    <td>${order.order_number}</td>
                    <td>${order.user_name || 'N/A'}</td>
                    <td>${typeof formatCOP === 'function' ? formatCOP(order.total_amount) : '$' + (order.total_amount || 0).toLocaleString()}</td>
                    <td><span class="badge bg-success">${order.status}</span></td>
                    <td>${order.updated_at ? new Date(order.updated_at).toLocaleDateString() : ''}</td>
                </tr>
            `;
        });

        html += `
                    </tbody>
                </table>
            </div>
        `;
    }

    content.innerHTML = html;
}

// Modal functionality
function openModal(modalId) {
    document.getElementById(modalId).style.display = 'flex';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// User menu toggle
function toggleUserMenu() {
    const dropdown = document.getElementById('userDropdown');
    dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
}

// Utility functions
function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Action functions for main sections
function showExportUsers() {
    showSection('export-users');
    loadExportUsers();
}

function showLowStock() {
    showSection('low-stock');
    loadLowStockProducts();
}

function showPendingOrders() {
    showSection('orders');
    // Filter will be applied after orders are loaded
    setTimeout(() => filterOrdersByStatus('pending'), 1000);
}

function showCompletedOrders() {
    showSection('orders');
    // Filter will be applied after orders are loaded
    setTimeout(() => filterOrdersByStatus('delivered'), 1000);
}

function filterOrdersByStatus(status) {
    const rows = document.querySelectorAll('#orders-list-content tbody tr');
    rows.forEach(row => {
        if (!status) {
            // Show all orders
            row.style.display = '';
            return;
        }

        const statusBadge = row.querySelector('.badge');
        if (!statusBadge) return;

        const rowStatus = statusBadge.textContent.toLowerCase().trim();

        if (status === 'pending') {
            // Show pending orders
            if (rowStatus === 'pendiente') {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        } else if (status === 'delivered') {
            // Show delivered and shipped orders as completed
            if (rowStatus === 'entregado' || rowStatus === 'enviado') {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        } else {
            // Show all orders
            row.style.display = '';
        }
    });
}

function downloadUsersCSV() {
    window.location.href = '/admin/export-users';
}

function generateReport(type) {
    const content = document.getElementById('report-generated-content');
    content.innerHTML = '<div class="action-section"><p>Generando reporte...</p></div>';

    fetch(`/admin/generate-report/${type}`)
        .then(response => response.json())
        .then(data => {
            renderReportGenerated(data);
            showSection('report-generated');
            document.getElementById('report-title').textContent = `Reporte ${type.charAt(0).toUpperCase() + type.slice(1)}`;
        })
        .catch(error => {
            content.innerHTML = '<div class="action-section"><p>Error al generar reporte</p></div>';
        });
}

function renderReportGenerated(data) {
    const content = document.getElementById('report-generated-content');
    const report = data.report;

    let html = `
        <div class="action-section">
            <div class="section-header">
                <div class="section-icon" style="background: #e7f3ff; color: #0066cc;">
                    <i class="fas fa-chart-bar"></i>
                </div>
                <h3 class="section-title">Resumen Ejecutivo</h3>
            </div>
            <div class="action-buttons">
                <button class="action-btn secondary" onclick="showSection('dashboard')">
                    <i class="fas fa-arrow-left"></i>
                    Regresar al Dashboard
                </button>
                <button class="action-btn primary" onclick="downloadReportPDF('${report.type}')">
                    <i class="fas fa-file-pdf"></i>
                    Descargar PDF
                </button>
                <button class="action-btn secondary" onclick="downloadReportExcel('${report.type}')">
                    <i class="fas fa-file-excel"></i>
                    Descargar Excel
                </button>
            </div>
        </div>

        <div class="stats-overview">
            <div class="stat-card">
                <div class="stat-content">
                    <h3>${report.total_users}</h3>
                    <p>Total de Usuarios</p>
                </div>
                <div class="stat-icon" style="background: #fff0eb; color: #ff6b35;">
                    <i class="fas fa-users"></i>
                </div>
            </div>

            <div class="stat-card">
                <div class="stat-content">
                    <h3>${report.total_products}</h3>
                    <p>Total de Productos</p>
                </div>
                <div class="stat-icon" style="background: #e6f7ff; color: #1890ff;">
                    <i class="fas fa-box"></i>
                </div>
            </div>

            <div class="stat-card">
                <div class="stat-content">
                    <h3>${report.low_stock_products}</h3>
                    <p>Productos con Stock Bajo</p>
                </div>
                <div class="stat-icon" style="background: #fff3cd; color: #856404;">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
            </div>

            <div class="stat-card">
                <div class="stat-content">
                    <h3>${typeof formatCOP === 'function' ? formatCOP(report.total_revenue) : '$' + (report.total_revenue || 0).toLocaleString()}</h3>
                    <p>Ingresos Totales</p>
                </div>
                <div class="stat-icon" style="background: #d4edda; color: #155724;">
                    <i class="fas fa-dollar-sign"></i>
                </div>
            </div>
        </div>

        <div class="action-section">
            <h4>Detalles del Reporte</h4>
            <p><strong>Generado el:</strong> ${new Date(report.generated_at).toLocaleString()}</p>
            <p><strong>Pedidos Pendientes:</strong> ${report.pending_orders}</p>
            <p><strong>Pedidos Completados:</strong> ${report.completed_orders}</p>
        </div>
    `;

    content.innerHTML = html;
}

function downloadReportPDF(type) {
    window.location.href = `/admin/export-report/${type}/pdf`;
}

function downloadReportExcel(type) {
    window.location.href = `/admin/export-report/${type}/excel`;
}

// Close modals when clicking outside
window.onclick = function(event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Close user dropdown when clicking outside
    const userDropdown = document.getElementById('userDropdown');
    if (!event.target.closest('.user-info') && userDropdown.style.display === 'block') {
        userDropdown.style.display = 'none';
    }
}

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    // Add hover effects
    const cards = document.querySelectorAll('.stat-card, .action-section');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
        });
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });

    // Add form event listeners
    const productForm = document.getElementById('productForm');
    if (productForm) {
        productForm.addEventListener('submit', submitProductForm);
    }

    const importProductsForm = document.getElementById('importProductsForm');
    if (importProductsForm) {
        importProductsForm.addEventListener('submit', submitImportProductsForm);
    }

    const categoryFormElement = document.getElementById('categoryForm');
    if (categoryFormElement) {
        categoryFormElement.addEventListener('submit', submitCategoryForm);
    }

    const inventoryForm = document.getElementById('inventoryForm');
    if (inventoryForm) {
        inventoryForm.addEventListener('submit', submitInventoryForm);
    }

    const adjustmentForm = document.getElementById('adjustmentForm');
    if (adjustmentForm) {
        adjustmentForm.addEventListener('submit', submitAdjustmentForm);
    }

    const updateOrderStatusForm = document.getElementById('updateOrderStatusForm');
    if (updateOrderStatusForm) {
        updateOrderStatusForm.addEventListener('submit', submitOrderStatusForm);
    }

    const categoryForm = document.getElementById('categoryForm');
    if (categoryForm) {
        categoryForm.addEventListener('submit', submitCategoryForm);
    }

    // Show dashboard section by default
    showSection('dashboard');
});

// Product management functions
function openProductModal(productId = null) {
    const modal = document.getElementById('productModal');
    const form = document.getElementById('productForm');
    const title = document.getElementById('productModalTitle');
    const submitBtn = document.getElementById('productSubmitText');

    // Reset form
    form.reset();
    document.getElementById('productId').value = '';

    // Load categories first
    loadCategoriesForSelect().then(() => {
        if (productId) {
            // Edit mode
            title.textContent = 'Editar Producto';
            submitBtn.textContent = 'Actualizar Producto';

            // Load product data
            fetch(`/admin/product/${productId}`)
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        const product = data.product;
                        document.getElementById('productId').value = product.id;
                        document.getElementById('productName').value = product.name;
                        document.getElementById('productSKU').value = product.sku;
                        document.getElementById('productPrice').value = product.price;
                        document.getElementById('productStock').value = product.stock_quantity;
                        document.getElementById('productCategory').value = product.category_id || '';
                        document.getElementById('productBrand').value = product.brand || '';
                        document.getElementById('productMinStock').value = product.min_stock_level;
                        document.getElementById('productDescription').value = product.description || '';
                    } else {
                        alert('Error al cargar datos del producto: ' + data.error);
                    }
                })
                .catch(error => {
                    console.error('Error loading product:', error);
                    alert('Error al cargar datos del producto');
                });
        } else {
            // Create mode
            title.textContent = 'Crear Nuevo Producto';
            submitBtn.textContent = 'Crear Producto';
        }

        modal.style.display = 'flex';
    });
}

function submitProductForm(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const productId = formData.get('productId');
    const isEdit = productId !== '';

    const productData = {
        name: formData.get('name'),
        sku: formData.get('sku'),
        price: parseFloat(formData.get('price')),
        stock_quantity: parseInt(formData.get('stock_quantity') || 0),
        category_id: formData.get('category_id') ? parseInt(formData.get('category_id')) : null,
        brand: formData.get('brand') || '',
        min_stock_level: parseInt(formData.get('min_stock_level') || 10),
        description: formData.get('description') || ''
    };

    const submitBtn = document.getElementById('productSubmitBtn');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';
    submitBtn.disabled = true;

    const url = isEdit ? `/admin/product/${productId}` : '/admin/product';
    const method = isEdit ? 'PUT' : 'POST';

    fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert(data.message);
            closeModal('productModal');

            // Reload products if we're in the products section
            if (document.getElementById('section-products').style.display !== 'none') {
                loadProducts();
            }

            // Update dashboard stats if needed
            updateDashboardStats();
        } else {
            alert('Error: ' + data.error);
        }
    })
    .catch(error => {
        console.error('Error saving product:', error);
        alert('Error al guardar el producto');
    })
    .finally(() => {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    });
}

function openImportProductsModal() {
    const modal = document.getElementById('importProductsModal');
    const form = document.getElementById('importProductsForm');
    const result = document.getElementById('importProductsResult');
    if (form) form.reset();
    if (result) {
        result.style.display = 'none';
        result.innerHTML = '';
    }
    if (modal) modal.style.display = 'flex';
}

function submitImportProductsForm(event) {
    event.preventDefault();

    const fileInput = document.getElementById('importProductsFile');
    const updateExisting = document.getElementById('importProductsUpdateExisting');
    const submitBtn = document.getElementById('importProductsSubmitBtn');
    const submitText = document.getElementById('importProductsSubmitText');
    const resultBox = document.getElementById('importProductsResult');

    if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
        alert('Selecciona un archivo Excel (.xlsx).');
        return;
    }

    const formData = new FormData();
    formData.append('file', fileInput.files[0]);
    formData.append('update_existing', updateExisting && updateExisting.checked ? 'true' : 'false');

    const originalText = submitText ? submitText.textContent : '';
    if (submitBtn) submitBtn.disabled = true;
    if (submitText) submitText.textContent = 'Importando...';
    if (resultBox) {
        resultBox.style.display = 'block';
        resultBox.innerHTML = '<div class="alert alert-info"><i class="fas fa-spinner fa-spin"></i> Procesando archivo...</div>';
    }

    fetch('/admin/products/import', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json().then(data => ({ ok: response.ok, data })))
    .then(({ ok, data }) => {
        if (!ok || !data.success) {
            const message = (data && data.error) ? data.error : 'Error al importar productos.';
            if (resultBox) {
                resultBox.innerHTML = `<div class="alert alert-danger"><i class="fas fa-times-circle"></i> ${message}</div>`;
            }
            return;
        }

        let html = `
            <div class="alert alert-success">
                <i class="fas fa-check-circle"></i> ${data.message || 'Importación completada.'}
            </div>
            <ul style="margin: 8px 0 0 18px;">
                <li><strong>Creados:</strong> ${data.created}</li>
                <li><strong>Actualizados:</strong> ${data.updated}</li>
                <li><strong>Omitidos:</strong> ${data.skipped}</li>
                <li><strong>Total procesado:</strong> ${data.total_processed}</li>
            </ul>
        `;

        if (data.errors && data.errors.length > 0) {
            html += `
                <div class="alert alert-warning" style="margin-top: 12px;">
                    <strong><i class="fas fa-exclamation-triangle"></i> Avisos (${data.errors.length}${data.errors_truncated ? '+' : ''}):</strong>
                    <ul style="margin: 8px 0 0 18px; max-height: 200px; overflow-y: auto;">
                        ${data.errors.map(e => `<li>${escapeHtml(e)}</li>`).join('')}
                    </ul>
                    ${data.errors_truncated ? '<small class="text-muted">Se muestran solo los primeros avisos.</small>' : ''}
                </div>
            `;
        }

        if (resultBox) resultBox.innerHTML = html;

        if (document.getElementById('section-products').style.display !== 'none') {
            loadProducts();
        }
        if (typeof updateDashboardStats === 'function') {
            updateDashboardStats();
        }
    })
    .catch(error => {
        console.error('Error importing products:', error);
        if (resultBox) {
            resultBox.innerHTML = `<div class="alert alert-danger"><i class="fas fa-times-circle"></i> Error de red: ${escapeHtml(error.message || String(error))}</div>`;
        }
    })
    .finally(() => {
        if (submitBtn) submitBtn.disabled = false;
        if (submitText) submitText.textContent = originalText || 'Importar productos';
    });
}

function escapeHtml(text) {
    if (text === null || text === undefined) return '';
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function loadProducts() {
    const content = document.getElementById('section-products');
    // Find the content area within the products section
    const existingContent = content.querySelector('.products-list-content');
    if (existingContent) {
        existingContent.innerHTML = '<div class="action-section"><p>Cargando productos...</p></div>';
    } else {
        // Add content area if it doesn't exist
        const productsContent = document.createElement('div');
        productsContent.id = 'products-list-content';
        productsContent.className = 'products-list-content';
        productsContent.innerHTML = '<div class="action-section"><p>Cargando productos...</p></div>';
        content.appendChild(productsContent);
    }

    fetch('/admin/products-data')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                renderProductsList(data);
            } else {
                document.getElementById('products-list-content').innerHTML = '<div class="action-section"><div class="alert alert-danger">Error al cargar productos: ' + data.error + '</div></div>';
            }
        })
        .catch(error => {
            console.error('Error loading products:', error);
            document.getElementById('products-list-content').innerHTML = '<div class="action-section"><div class="alert alert-danger">Error al cargar productos: ' + error.message + '</div></div>';
        });
}

function renderProductsList(data) {
    const content = document.getElementById('products-list-content');
    let html = `
        <div class="action-section">
            <div class="section-header">
                <div class="section-icon" style="background: #e6f7ff; color: #1890ff;">
                    <i class="fas fa-box"></i>
                </div>
                <h3 class="section-title">Lista de Productos (${data.products.length})</h3>
            </div>
            <div class="action-buttons">
                <button class="action-btn primary" onclick="openProductModal()">
                    <i class="fas fa-plus"></i>
                    Nuevo Producto
                </button>
                <button class="action-btn primary" onclick="openImportProductsModal()">
                    <i class="fas fa-file-excel"></i>
                    Importar Excel
                </button>
                <button class="action-btn secondary" onclick="showLowStock()">
                    <i class="fas fa-exclamation-triangle"></i>
                    Ver Stock Bajo
                </button>
                <button class="action-btn secondary" onclick="exportProducts()">
                    <i class="fas fa-download"></i>
                    Exportar
                </button>
            </div>
        </div>
    `;

    if (data.products.length === 0) {
        html += `
            <div class="action-section">
                <div class="alert alert-info">
                    <i class="fas fa-info-circle"></i>
                    No hay productos registrados aún. <a href="#" onclick="openProductModal()">Crear el primer producto</a>
                </div>
            </div>
        `;
    } else {
        html += `
            <div class="action-section">
                <div class="table-responsive">
                    <table class="table table-striped">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Producto</th>
                                <th>SKU</th>
                                <th>Precio</th>
                                <th>Stock</th>
                                <th>Categoría</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
        `;

        data.products.forEach(product => {
            const stockStatus = product.is_low_stock ? 'bg-warning' : 'bg-success';
            const stockText = product.is_low_stock ? 'Stock Bajo' : 'Normal';

            html += `
                <tr>
                    <td>${product.id}</td>
                    <td>
                        <strong>${product.name}</strong>
                        ${product.brand ? `<br><small class="text-muted">${product.brand}</small>` : ''}
                    </td>
                    <td><code>${product.sku}</code></td>
                    <td>${typeof formatCOP === 'function' ? formatCOP(product.price) : '$' + (product.price || 0).toLocaleString()}</td>
                    <td>
                        <span class="badge ${stockStatus}">${product.stock_quantity}</span>
                        ${product.is_low_stock ? '<i class="fas fa-exclamation-triangle text-warning ml-1"></i>' : ''}
                    </td>
                    <td>${product.category_name || '-'}</td>
                    <td><span class="badge bg-success">Activo</span></td>
                    <td>
                        <div class="btn-group btn-group-sm">
                            <button class="btn btn-outline-primary" onclick="openProductModal(${product.id})" title="Editar">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-outline-danger" onclick="deleteProduct(${product.id}, '${product.name}')" title="Eliminar">
                                <i class="fas fa-trash"></i>
                            </button>
                            <button class="btn btn-outline-info" onclick="adjustStock(${product.id}, '${product.name}', ${product.stock_quantity})" title="Ajustar Stock">
                                <i class="fas fa-plus"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        });

        html += `
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    content.innerHTML = html;
}

function deleteProduct(productId, productName) {
    if (confirm(`¿Está seguro de que desea eliminar el producto "${productName}"?\n\nEsta acción no se puede deshacer.`)) {
        fetch(`/admin/product/${productId}`, {
            method: 'DELETE'
        })
        .then(async response => {
            const contentType = response.headers.get('content-type') || '';
            if (contentType.includes('application/json')) {
                const data = await response.json();
                if (!response.ok) throw new Error(data.error || data.message || `HTTP ${response.status}`);
                return data;
            } else {
                // non-json response (likely an HTML error page) - read as text for diagnostics
                const text = await response.text();
                throw new Error(text || `HTTP ${response.status}`);
            }
        })
        .then(data => {
            if (data.success) {
                alert(data.message);
                loadProducts(); // Reload the products list
                updateDashboardStats(); // Update dashboard stats
            } else {
                alert('Error: ' + (data.error || data.message || 'Respuesta inesperada'));
            }
        })
        .catch(error => {
            console.error('Error deleting product:', error);
            // If the error message looks like HTML, give a friendly hint
            if (typeof error.message === 'string' && error.message.trim().startsWith('<')) {
                alert('Error al eliminar el producto: el servidor devolvió una página HTML (ver consola para más detalles). Posible causa: sesión expirada o error en el servidor.');
            } else {
                alert('Error al eliminar el producto: ' + (error.message || 'Error desconocido'));
            }
        });
    }
}

function adjustStock(productId, productName, currentStock) {
    const newStock = prompt(`Ajustar stock para "${productName}"\n\nStock actual: ${currentStock}\n\nNuevo stock:`, currentStock);

    if (newStock !== null && newStock !== '') {
        const stockValue = parseInt(newStock);
        if (isNaN(stockValue) || stockValue < 0) {
            alert('Por favor ingrese un número válido mayor o igual a 0');
            return;
        }

        fetch(`/admin/product/${productId}/stock`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ stock_quantity: stockValue })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert(data.message);
                loadProducts(); // Reload products
                updateDashboardStats(); // Update stats
            } else {
                alert('Error: ' + data.error);
            }
        })
        .catch(error => {
            console.error('Error adjusting stock:', error);
            alert('Error al ajustar el stock');
        });
    }
}

function exportProducts() {
    // Crear un enlace temporal para descargar el archivo
    const link = document.createElement('a');
    link.href = '/admin/products/export';
    link.download = 'productos.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Mostrar mensaje de confirmación
    setTimeout(() => {
        alert('¡Exportación de productos iniciada! El archivo se descargará automáticamente.');
    }, 100);
}

function updateDashboardStats() {
    // Update the product count in the sidebar badge
    fetch('/admin/products-data')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const badge = document.querySelector('[href="#products"] .badge');
                if (badge) {
                    badge.textContent = data.products.length;
                }
            }
        })
        .catch(error => console.error('Error updating stats:', error));
}

function loadCategoriesForSelect() {
    return fetch('/admin/categories-data')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const select = document.getElementById('productCategory');
                // Clear existing options except the first one
                select.innerHTML = '<option value="">Seleccionar categoría...</option>';

                // Add categories
                data.categories.forEach(category => {
                    const option = document.createElement('option');
                    option.value = category.id;
                    option.textContent = category.name;
                    select.appendChild(option);
                });
            } else {
                console.error('Error loading categories:', data.error);
            }
        })
        .catch(error => {
            console.error('Error loading categories:', error);
        });
}

function openCategoryModal(categoryId = null) {
    const modal = document.getElementById('categoryModal');
    const form = document.getElementById('categoryForm');
    const title = document.getElementById('categoryModalTitle');
    const submitBtn = document.getElementById('categorySubmitText');

    // Reset form
    form.reset();
    document.getElementById('categoryId').value = '';

    // Load categories for parent select
    loadCategoriesForParentSelect().then(() => {
        if (categoryId) {
            // Edit mode
            title.textContent = 'Editar Categoría';
            submitBtn.textContent = 'Actualizar Categoría';

            // Load category data
            fetch(`/admin/category/${categoryId}`)
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        const category = data.category;
                        document.getElementById('categoryId').value = category.id;
                        document.getElementById('categoryName').value = category.name;
                        document.getElementById('categoryParent').value = category.parent_id || '';
                        document.getElementById('categoryDescription').value = category.description || '';
                    } else {
                        alert('Error al cargar datos de la categoría: ' + data.error);
                    }
                })
                .catch(error => {
                    console.error('Error loading category:', error);
                    alert('Error al cargar datos de la categoría');
                });
        } else {
            // Create mode
            title.textContent = 'Crear Nueva Categoría';
            submitBtn.textContent = 'Crear Categoría';
        }

        modal.style.display = 'flex';
    });
}

function submitCategoryForm(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const categoryId = formData.get('categoryId');
    const isEdit = categoryId !== '';

    const categoryData = {
        name: formData.get('name'),
        parent_id: formData.get('parent_id') ? parseInt(formData.get('parent_id')) : null,
        description: formData.get('description') || ''
    };

    const submitBtn = document.getElementById('categorySubmitBtn');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';
    submitBtn.disabled = true;

    const url = isEdit ? `/admin/category/${categoryId}` : '/admin/category';
    const method = isEdit ? 'PUT' : 'POST';

    fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(categoryData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert(data.message);
            closeModal('categoryModal');

            // Reload categories in product form if needed
            if (document.getElementById('productModal').style.display !== 'none') {
                loadCategoriesForSelect();
            }
        } else {
            alert('Error: ' + data.error);
        }
    })
    .catch(error => {
        console.error('Error saving category:', error);
        alert('Error al guardar la categoría');
    })
    .finally(() => {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    });
}

function loadCategoriesForParentSelect() {
    return fetch('/admin/categories-data')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const select = document.getElementById('categoryParent');
                // Clear existing options except the first one
                select.innerHTML = '<option value="">Ninguna (Categoría principal)</option>';

                // Add categories
                data.categories.forEach(category => {
                    const option = document.createElement('option');
                    option.value = category.id;
                    option.textContent = category.name;
                    select.appendChild(option);
                });
            } else {
                console.error('Error loading categories for parent select:', data.error);
            }
        })
        .catch(error => {
            console.error('Error loading categories for parent select:', error);
        });
}

function openInventoryModal() {
    const modal = document.getElementById('inventoryModal');
    const form = document.getElementById('inventoryForm');
    const title = document.getElementById('inventoryModalTitle');

    // Reset form
    form.reset();

    // Load products for select
    loadProductsForInventorySelect().then(() => {
        modal.style.display = 'flex';
    });
}

function openAdjustmentModal() {
    const modal = document.getElementById('adjustmentModal');
    const form = document.getElementById('adjustmentForm');
    const title = document.getElementById('adjustmentModalTitle');

    // Reset form
    form.reset();

    // Load products for select
    loadProductsForAdjustmentSelect().then(() => {
        modal.style.display = 'flex';
    });
}

function submitInventoryForm(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const productId = formData.get('productId');
    const quantity = parseInt(formData.get('quantity'));

    if (!productId || quantity <= 0) {
        alert('Por favor complete todos los campos requeridos');
        return;
    }

    const submitBtn = document.getElementById('inventorySubmitBtn');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';
    submitBtn.disabled = true;

    // Get current stock first
    fetch(`/admin/product/${productId}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const currentStock = data.product.stock_quantity;
                const newStock = currentStock + quantity;

                // Update stock
                return fetch(`/admin/product/${productId}/stock`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ stock_quantity: newStock })
                });
            } else {
                throw new Error(data.error);
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert(`Stock agregado exitosamente. Nuevo stock: ${data.product.stock_quantity}`);
                closeModal('inventoryModal');

                // Reload products if we're in the products section
                if (document.getElementById('section-products').style.display !== 'none') {
                    loadProducts();
                }

                updateDashboardStats();
            } else {
                alert('Error: ' + data.error);
            }
        })
        .catch(error => {
            console.error('Error adding inventory:', error);
            alert('Error al agregar stock al inventario');
        })
        .finally(() => {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        });
}

function submitAdjustmentForm(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const productId = formData.get('productId');
    const newStock = parseInt(formData.get('newStock'));
    const reason = formData.get('reason');
    const notes = formData.get('notes');

    if (!productId || newStock < 0 || !reason || !notes.trim()) {
        alert('Por favor complete todos los campos requeridos');
        return;
    }

    const submitBtn = document.getElementById('adjustmentSubmitBtn');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';
    submitBtn.disabled = true;

    // Update stock
    fetch(`/admin/product/${productId}/stock`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ stock_quantity: newStock })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert(`Ajuste de inventario aplicado exitosamente. Nuevo stock: ${data.product.stock_quantity}`);
            closeModal('adjustmentModal');

            // Reload products if we're in the products section
            if (document.getElementById('section-products').style.display !== 'none') {
                loadProducts();
            }

            updateDashboardStats();
        } else {
            alert('Error: ' + data.error);
        }
    })
    .catch(error => {
        console.error('Error adjusting inventory:', error);
        alert('Error al aplicar ajuste de inventario');
    })
    .finally(() => {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    });
}

function loadProductsForInventorySelect() {
    return fetch('/admin/products-data')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const select = document.getElementById('inventoryProductSelect');
                select.innerHTML = '<option value="">Seleccionar producto...</option>';

                data.products.forEach(product => {
                    const option = document.createElement('option');
                    option.value = product.id;
                    option.textContent = `${product.name} (Stock actual: ${product.stock_quantity})`;
                    select.appendChild(option);
                });

                // Add event listener for product selection
                select.addEventListener('change', function() {
                    const productId = this.value;
                    if (productId) {
                        fetch(`/admin/product/${productId}`)
                            .then(response => response.json())
                            .then(data => {
                                if (data.success) {
                                    document.getElementById('inventoryCurrentStock').value = data.product.stock_quantity;
                                }
                            })
                            .catch(error => console.error('Error loading product stock:', error));
                    } else {
                        document.getElementById('inventoryCurrentStock').value = '';
                    }
                });
            } else {
                console.error('Error loading products for inventory:', data.error);
            }
        })
        .catch(error => {
            console.error('Error loading products for inventory:', error);
        });
}

function loadProductsForAdjustmentSelect() {
    return fetch('/admin/products-data')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const select = document.getElementById('adjustmentProductSelect');
                select.innerHTML = '<option value="">Seleccionar producto...</option>';

                data.products.forEach(product => {
                    const option = document.createElement('option');
                    option.value = product.id;
                    option.textContent = `${product.name} (Stock actual: ${product.stock_quantity})`;
                    select.appendChild(option);
                });

                // Add event listener for product selection
                select.addEventListener('change', function() {
                    const productId = this.value;
                    if (productId) {
                        fetch(`/admin/product/${productId}`)
                            .then(response => response.json())
                            .then(data => {
                                if (data.success) {
                                    document.getElementById('adjustmentCurrentStock').value = data.product.stock_quantity;
                                }
                            })
                            .catch(error => console.error('Error loading product stock:', error));
                    } else {
                        document.getElementById('adjustmentCurrentStock').value = '';
                    }
                });
            } else {
                console.error('Error loading products for adjustment:', data.error);
            }
        })
        .catch(error => {
            console.error('Error loading products for adjustment:', error);
        });
}

function openOrderModal(orderId = null) {
    const modal = document.getElementById('orderModal');
    const title = document.getElementById('orderModalTitle');
    const detailsContent = document.getElementById('orderDetailsContent');
    const statusForm = document.getElementById('orderStatusForm');

    if (orderId) {
        // View/edit existing order
        title.textContent = 'Detalles del Pedido';
        detailsContent.style.display = 'block';
        statusForm.style.display = 'none';

        // Load order details
        fetch(`/admin/order/${orderId}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    renderOrderDetails(data.order);
                } else {
                    detailsContent.innerHTML = '<div class="alert alert-danger">Error al cargar detalles del pedido: ' + data.error + '</div>';
                }
            })
            .catch(error => {
                console.error('Error loading order:', error);
                detailsContent.innerHTML = '<div class="alert alert-danger">Error al cargar detalles del pedido</div>';
            });
    } else {
        // Create new order - not implemented yet
        title.textContent = 'Crear Nuevo Pedido';
        detailsContent.innerHTML = '<div class="alert alert-info">Funcionalidad de creación de pedidos próximamente disponible</div>';
        statusForm.style.display = 'none';
    }

    modal.style.display = 'flex';
}

function renderOrderDetails(order) {
    const content = document.getElementById('orderDetailsContent');

    const statusClasses = {
        'pending': 'badge-warning',
        'processing': 'badge-info',
        'shipped': 'badge-primary',
        'delivered': 'badge-success',
        'cancelled': 'badge-danger'
    };

    const statusLabels = {
        'pending': 'Pendiente',
        'processing': 'En Proceso',
        'shipped': 'Enviado',
        'delivered': 'Entregado',
        'cancelled': 'Cancelado'
    };

    html = `
        <div class="order-details">
            <div class="order-header">
                <h4>Pedido #${order.order_number}</h4>
                <span class="badge ${statusClasses[order.status] || 'badge-secondary'}">${statusLabels[order.status] || order.status}</span>
            </div>

            <div class="order-info">
                <div class="info-section">
                    <h5><i class="fas fa-user"></i> Información del Cliente</h5>
                    <p><strong>Nombre:</strong> ${order.user_name || 'N/A'}</p>
                    <p><strong>Email:</strong> ${order.user_email || 'N/A'}</p>
                </div>

                <div class="info-section">
                    <h5><i class="fas fa-dollar-sign"></i> Información del Pedido</h5>
                    <p><strong>Total:</strong> ${typeof formatCOP === 'function' ? formatCOP(order.total_amount) : '$' + (order.total_amount || 0).toLocaleString()}</p>
                    <p><strong>Método de Pago:</strong> ${order.payment_method || 'N/A'}</p>
                    <p><strong>Fecha:</strong> ${order.created_at ? new Date(order.created_at).toLocaleString() : 'N/A'}</p>
                </div>

                <div class="info-section">
                    <h5><i class="fas fa-map-marker-alt"></i> Dirección de Envío</h5>
                    <p>${order.shipping_address || 'No especificada'}</p>
                </div>

                ${order.notes ? `
                <div class="info-section">
                    <h5><i class="fas fa-sticky-note"></i> Notas</h5>
                    <p>${order.notes}</p>
                </div>
                ` : ''}
            </div>

            <div class="order-actions">
                <button class="btn btn-primary" onclick="showOrderStatusForm(${order.id}, '${order.status}')">
                    <i class="fas fa-edit"></i>
                    Cambiar Estado
                </button>
                ${order.status === 'pending' ? `
                <button class="btn btn-danger" onclick="deleteOrder(${order.id}, '${order.order_number}')">
                    <i class="fas fa-trash"></i>
                    Eliminar Pedido
                </button>
                ` : ''}
                <button class="btn btn-secondary" onclick="closeModal('orderModal')">
                    <i class="fas fa-times"></i>
                    Cerrar
                </button>
            </div>
        </div>
    `;

    content.innerHTML = html;
}

function showOrderStatusForm(orderId, currentStatus) {
    document.getElementById('orderDetailsContent').style.display = 'none';
    document.getElementById('orderStatusForm').style.display = 'block';
    document.getElementById('statusOrderId').value = orderId;
    document.getElementById('orderStatus').value = currentStatus;
}

function cancelOrderStatusUpdate() {
    document.getElementById('orderDetailsContent').style.display = 'block';
    document.getElementById('orderStatusForm').style.display = 'none';
}

function submitOrderStatusForm(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const orderId = formData.get('orderId');
    const newStatus = formData.get('status');

    const submitBtn = document.getElementById('orderStatusSubmitBtn');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Actualizando...';
    submitBtn.disabled = true;

    // Obtener CSRF token
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    console.log('CSRF Token:', csrfToken);
    console.log('Order ID:', orderId, 'New Status:', newStatus);

    fetch(`/admin/order/${orderId}/status`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken
        },
        body: JSON.stringify({ status: newStatus })
    })
    .then(response => {
        console.log('Response status:', response.status);
        return response.json();
    })
    .then(data => {
        console.log('Response data:', data);
        if (data.success) {
            alert(data.message);
            // Reload order details
            openOrderModal(orderId);
            // Reload orders if we're in the orders section
            if (document.getElementById('section-orders').style.display !== 'none') {
                loadOrders();
            }
        } else {
            alert('Error: ' + data.error);
        }
    })
    .catch(error => {
        console.error('Error updating order status:', error);
        alert('Error al actualizar el estado del pedido');
    })
    .finally(() => {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    });
}

function deleteOrder(orderId, orderNumber) {
    if (confirm(`¿Está seguro de que desea eliminar el pedido "${orderNumber}"?\n\nEsta acción no se puede deshacer.`)) {
        fetch(`/admin/order/${orderId}`, {
            method: 'DELETE'
        })
        .then(async response => {
            const contentType = response.headers.get('content-type') || '';
            if (contentType.includes('application/json')) {
                const data = await response.json();
                if (!response.ok) throw new Error(data.error || data.message || `HTTP ${response.status}`);
                return data;
            } else {
                const text = await response.text();
                throw new Error(text || `HTTP ${response.status}`);
            }
        })
        .then(data => {
            if (data.success) {
                alert(data.message);
                closeModal('orderModal');
                // Reload orders if we're in the orders section
                if (document.getElementById('section-orders').style.display !== 'none') {
                    loadOrders();
                }
                updateDashboardStats();
            } else {
                alert('Error: ' + (data.error || data.message || 'Respuesta inesperada'));
            }
        })
        .catch(error => {
            console.error('Error deleting order:', error);
            if (typeof error.message === 'string' && error.message.trim().startsWith('<')) {
                alert('Error al eliminar el pedido: el servidor devolvió una página HTML (ver consola para más detalles). Posible causa: sesión expirada o error en el servidor.');
            } else {
                alert('Error al eliminar el pedido: ' + (error.message || 'Error desconocido'));
            }
        });
    }
}

function loadOrders() {
    const content = document.getElementById('section-orders');
    // Find the content area within the orders section
    const existingContent = content.querySelector('.orders-list-content');
    if (existingContent) {
        existingContent.innerHTML = '<div class="action-section"><p>Cargando pedidos...</p></div>';
    } else {
        // Add content area if it doesn't exist
        const ordersContent = document.createElement('div');
        ordersContent.id = 'orders-list-content';
        ordersContent.className = 'orders-list-content';
        ordersContent.innerHTML = '<div class="action-section"><p>Cargando pedidos...</p></div>';
        content.appendChild(ordersContent);
    }

    fetch('/admin/orders-data')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                renderOrdersList(data);
            } else {
                document.getElementById('orders-list-content').innerHTML = '<div class="action-section"><div class="alert alert-danger">Error al cargar pedidos: ' + data.error + '</div></div>';
            }
        })
        .catch(error => {
            console.error('Error loading orders:', error);
            document.getElementById('orders-list-content').innerHTML = '<div class="action-section"><div class="alert alert-danger">Error al cargar pedidos: ' + error.message + '</div></div>';
        });
}

function renderOrdersList(data) {
    const content = document.getElementById('orders-list-content');
    let html = `
        <div class="action-section">
            <div class="section-header">
                <div class="section-icon" style="background: #f0f9ff; color: #0ea5e9;">
                    <i class="fas fa-shopping-cart"></i>
                </div>
                <h3 class="section-title">Lista de Pedidos (${data.orders.length})</h3>
            </div>
            <div class="action-buttons">
                <button class="action-btn primary" onclick="loadOrders()">
                    <i class="fas fa-list"></i>
                    Ver Todos
                </button>
                <button class="action-btn secondary" onclick="showPendingOrders()">
                    <i class="fas fa-clock"></i>
                    Ver Pendientes
                </button>
                <button class="action-btn secondary" onclick="showCompletedOrders()">
                    <i class="fas fa-check"></i>
                    Ver Completados
                </button>
            </div>
        </div>
    `;

    if (data.orders.length === 0) {
        html += `
            <div class="action-section">
                <div class="alert alert-info">
                    <i class="fas fa-info-circle"></i>
                    No hay pedidos registrados aún.
                </div>
            </div>
        `;
    } else {
        html += `
            <div class="action-section">
                <div class="table-responsive">
                    <table class="table table-striped">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Número</th>
                                <th>Cliente</th>
                                <th>Total</th>
                                <th>Estado</th>
                                <th>Fecha</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
        `;

        data.orders.forEach(order => {
            const statusClasses = {
                'pending': 'bg-warning',
                'processing': 'bg-info',
                'shipped': 'bg-primary',
                'delivered': 'bg-success',
                'cancelled': 'bg-danger'
            };

            const statusLabels = {
                'pending': 'Pendiente',
                'processing': 'En Proceso',
                'shipped': 'Enviado',
                'delivered': 'Entregado',
                'cancelled': 'Cancelado'
            };

            html += `
                <tr>
                    <td>${order.id}</td>
                    <td><strong>${order.order_number}</strong></td>
                    <td>${order.user_name || 'N/A'}</td>
                    <td>${typeof formatCOP === 'function' ? formatCOP(order.total_amount) : '$' + (order.total_amount || 0).toLocaleString()}</td>
                    <td><span class="badge ${statusClasses[order.status] || 'bg-secondary'}">${statusLabels[order.status] || order.status}</span></td>
                    <td>${order.created_at ? new Date(order.created_at).toLocaleDateString() : ''}</td>
                    <td>
                        <div class="btn-group btn-group-sm">
                            <button class="btn btn-outline-primary" onclick="openOrderModal(${order.id})" title="Ver Detalles">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn btn-outline-info" onclick="showOrderStatusForm(${order.id}, '${order.status}')" title="Cambiar Estado">
                                <i class="fas fa-edit"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        });

        html += `
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    content.innerHTML = html;
}

// ==================== USER MANAGEMENT FUNCTIONS ====================

function loadUsers() {
    const content = document.getElementById('users-list-content');
    content.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> Cargando usuarios...</div>';

    fetch('/admin/users-data')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                renderUsersList(data.users);
            } else {
                content.innerHTML = `<div class="alert alert-danger">Error al cargar usuarios: ${data.error}</div>`;
            }
        })
        .catch(error => {
            console.error('Error loading users:', error);
            content.innerHTML = `<div class="alert alert-danger">Error al cargar usuarios: ${error.message}</div>`;
        });
}

function renderUsersList(users) {
    const content = document.getElementById('users-list-content');
    
    if (!users || users.length === 0) {
        content.innerHTML = `
            <div class="alert alert-info">
                <i class="fas fa-info-circle"></i> No hay usuarios registrados.
            </div>
        `;
        return;
    }

    const roleLabels = {
        'admin': 'Administrador',
        'employee': 'Empleado',
        'client': 'Cliente'
    };

    const roleColors = {
        'admin': 'danger',
        'employee': 'warning',
        'client': 'info'
    };

    let html = `
        <div class="table-responsive">
            <table class="table table-hover">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Email</th>
                        <th>Rol</th>
                        <th>Teléfono</th>
                        <th>Estado</th>
                        <th>Fecha Registro</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
    `;

    users.forEach(user => {
        const roleBadge = roleColors[user.role] || 'secondary';
        const roleLabel = roleLabels[user.role] || user.role;
        const statusBadge = user.is_active ? 'success' : 'secondary';
        const statusLabel = user.is_active ? 'Activo' : 'Inactivo';
        
        html += `
            <tr>
                <td>${user.id}</td>
                <td><strong>${user.name}</strong></td>
                <td>${user.email}</td>
                <td><span class="badge bg-${roleBadge}">${roleLabel}</span></td>
                <td>${user.phone || 'N/A'}</td>
                <td><span class="badge bg-${statusBadge}">${statusLabel}</span></td>
                <td>${user.created_at ? new Date(user.created_at).toLocaleDateString('es-ES') : 'N/A'}</td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-primary" onclick="editUser(${user.id})" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-outline-danger" onclick="deleteUser(${user.id})" title="Eliminar">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });

    html += `
                </tbody>
            </table>
        </div>
    `;

    content.innerHTML = html;
}

function submitUserForm(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const userId = formData.get('userId');
    const userData = {
        name: formData.get('name'),
        email: formData.get('email'),
        role: formData.get('role'),
        phone: formData.get('phone') || null,
        is_active: formData.get('is_active') === 'on'
    };

    const password = formData.get('password');
    if (password && password.trim() !== '') {
        userData.password = password;
    }

    const submitBtn = document.getElementById('userSubmitBtn');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class=\"fas fa-spinner fa-spin\"></i> Guardando...';
    submitBtn.disabled = true;

    const csrfToken = document.querySelector('meta[name=\"csrf-token\"]')?.getAttribute('content');

    const url = userId ? `/admin/user/${userId}` : '/admin/user/create';
    const method = userId ? 'PUT' : 'POST';

    fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken
        },
        body: JSON.stringify(userData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert(data.message);
            closeModal('userModal');
            loadUsers();
        } else {
            alert('Error: ' + data.error);
        }
    })
    .catch(error => {
        console.error('Error saving user:', error);
        alert('Error al guardar el usuario');
    })
    .finally(() => {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    });
}

function editUser(userId) {
    fetch(`/admin/user/${userId}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const user = data.user;
                document.getElementById('userId').value = user.id;
                document.getElementById('userName').value = user.name;
                document.getElementById('userEmail').value = user.email;
                document.getElementById('userRole').value = user.role;
                document.getElementById('userPhone').value = user.phone || '';
                document.getElementById('userActive').checked = user.is_active;
                document.getElementById('userPassword').value = '';
                document.getElementById('userPassword').required = false;
                document.getElementById('userModalTitle').textContent = 'Editar Usuario';
                openModal('userModal');
            } else {
                alert('Error al cargar datos del usuario: ' + data.error);
            }
        })
        .catch(error => {
            console.error('Error loading user:', error);
            alert('Error al cargar datos del usuario');
        });
}

function deleteUser(userId) {
    if (!confirm('�Est� seguro de eliminar este usuario? Esta acci�n no se puede deshacer.')) {
        return;
    }

    const csrfToken = document.querySelector('meta[name=\"csrf-token\"]')?.getAttribute('content');

    fetch(`/admin/user/${userId}`, {
        method: 'DELETE',
        headers: {
            'X-CSRFToken': csrfToken
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert(data.message);
            loadUsers();
        } else {
            alert('Error: ' + data.error);
        }
    })
    .catch(error => {
        console.error('Error deleting user:', error);
        alert('Error al eliminar el usuario');
    });
}

function openUserModalForNew() {
    // Limpiar formulario
    document.getElementById('userForm').reset();
    document.getElementById('userId').value = '';
    document.getElementById('userPassword').required = true;
    document.getElementById('userModalTitle').textContent = 'Crear Usuario';
    // Abrir modal
    openModal('userModal');
}

// Analytics Functions
function loadAnalytics() {
    fetch('/admin/analytics-data')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                renderAnalytics(data.analytics);
            } else {
                console.error('Error loading analytics:', data.error);
            }
        })
        .catch(error => {
            console.error('Error fetching analytics:', error);
        });
}

function renderAnalytics(analytics) {
    // Update stats cards
    document.getElementById('total-orders').textContent = analytics.total_orders || 0;
    document.getElementById('total-revenue').textContent = '$' + (analytics.total_revenue || 0).toLocaleString('es-CO');
    document.getElementById('total-customers').textContent = analytics.total_customers || 0;
    document.getElementById('total-products').textContent = analytics.total_products || 0;
    
    // Update changes (últimos 30 días)
    document.getElementById('orders-change').textContent = '+' + (analytics.orders_change || 0) + ' este mes';
    document.getElementById('revenue-change').textContent = '+$' + (analytics.revenue_change || 0).toLocaleString('es-CO') + ' este mes';
    document.getElementById('customers-change').textContent = '+' + (analytics.customers_change || 0) + ' este mes';
    document.getElementById('products-change').textContent = (analytics.products_change || 0) + ' en stock';
    
    // Render top products
    renderTopProducts(analytics.top_products || []);
    
    // Render orders by status
    renderOrdersByStatus(analytics.orders_by_status || {});
    
    // Render recent orders
    renderRecentOrders(analytics.recent_orders || []);
}

function renderTopProducts(products) {
    const container = document.getElementById('top-products-list');
    
    if (!products || products.length === 0) {
        container.innerHTML = '<p class="loading-text">No hay datos de productos vendidos</p>';
        return;
    }
    
    container.innerHTML = products.map(product => `
        <div class="product-item">
            <span class="product-name">${product.name}</span>
            <span class="product-sales">${product.quantity} vendidos</span>
        </div>
    `).join('');
}

function renderOrdersByStatus(statusData) {
    const container = document.getElementById('orders-by-status');
    
    const statuses = {
        'pendiente': { label: 'Pendiente', class: 'pending' },
        'procesando': { label: 'Procesando', class: 'processing' },
        'completado': { label: 'Completado', class: 'completed' },
        'cancelado': { label: 'Cancelado', class: 'cancelled' }
    };
    
    const total = Object.values(statusData).reduce((sum, count) => sum + count, 0);
    
    if (total === 0) {
        container.innerHTML = '<p class="loading-text">No hay pedidos registrados</p>';
        return;
    }
    
    container.innerHTML = Object.entries(statuses).map(([key, status]) => {
        const count = statusData[key] || 0;
        const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
        
        return `
            <div class="status-item">
                <span class="status-label">${status.label}</span>
                <div class="status-bar">
                    <div class="status-fill ${status.class}" style="width: ${percentage}%">
                        ${percentage}%
                    </div>
                </div>
                <span class="status-count">${count}</span>
            </div>
        `;
    }).join('');
}

function renderRecentOrders(orders) {
    const container = document.getElementById('recent-orders-list');
    
    if (!orders || orders.length === 0) {
        container.innerHTML = '<p class="loading-text">No hay pedidos recientes</p>';
        return;
    }
    
    container.innerHTML = orders.slice(0, 5).map(order => `
        <div class="activity-item">
            <div class="activity-info">
                <div class="activity-user">Pedido #${order.id} - ${order.user_name}</div>
                <div class="activity-details">${order.items_count} productos - $${order.total.toLocaleString('es-CO')}</div>
            </div>
            <div class="activity-time">${formatDate(order.created_at)}</div>
        </div>
    `).join('');
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours} h`;
    if (diffDays < 7) return `Hace ${diffDays} días`;
    
    return date.toLocaleDateString('es-CO');
}

// Settings Functions
function saveGeneralSettings() {
    const settings = {
        site_name: document.getElementById('siteName').value,
        site_email: document.getElementById('siteEmail').value,
        site_phone: document.getElementById('sitePhone').value,
        site_address: document.getElementById('siteAddress').value
    };
    
    saveSettings('general', settings);
}

function saveShippingSettings() {
    const settings = {
        free_shipping_min: parseFloat(document.getElementById('freeShippingMin').value),
        standard_shipping_cost: parseFloat(document.getElementById('standardShippingCost').value),
        delivery_days: parseInt(document.getElementById('deliveryDays').value)
    };
    
    saveSettings('shipping', settings);
}

function saveStockSettings() {
    const settings = {
        low_stock_threshold: parseInt(document.getElementById('lowStockThreshold').value),
        email_low_stock: document.getElementById('emailLowStock').checked
    };
    
    saveSettings('stock', settings);
}

function saveTaxSettings() {
    const settings = {
        tax_rate: parseFloat(document.getElementById('taxRate').value),
        tax_included: document.getElementById('taxIncluded').checked
    };
    
    saveSettings('tax', settings);
}

function saveNotificationSettings() {
    const settings = {
        notify_new_order: document.getElementById('notifyNewOrder').checked,
        notify_low_stock: document.getElementById('notifyLowStock').checked,
        notify_new_user: document.getElementById('notifyNewUser').checked
    };
    
    saveSettings('notifications', settings);
}

function saveSettings(category, settings) {
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    
    fetch('/admin/settings/save', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken
        },
        body: JSON.stringify({
            category: category,
            settings: settings
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Configuración guardada exitosamente');
        } else {
            alert('Error al guardar: ' + (data.error || 'Error desconocido'));
        }
    })
    .catch(error => {
        console.error('Error saving settings:', error);
        alert('Error al guardar la configuración');
    });
}

function clearCache() {
    if (!confirm('¿Está seguro de limpiar el caché del sistema?')) {
        return;
    }
    
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    
    fetch('/admin/maintenance/clear-cache', {
        method: 'POST',
        headers: {
            'X-CSRFToken': csrfToken
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Caché limpiado exitosamente');
        } else {
            alert('Error: ' + (data.error || 'Error desconocido'));
        }
    })
    .catch(error => {
        console.error('Error clearing cache:', error);
        alert('Error al limpiar el caché');
    });
}

function exportDatabase() {
    alert('Iniciando exportación de la base de datos...');
    window.location.href = '/admin/maintenance/export-database';
}

function viewLogs() {
    window.open('/admin/maintenance/logs', '_blank');
}

// ============================
// TICKETS MANAGEMENT FUNCTIONS
// ============================

let allTickets = [];
let currentTicketId = null;
let lastMessageCount = 0;
let chatPollingInterval = null;
let ticketsPollingInterval = null;

// Load tickets data
async function loadTickets(silent = false) {
    try {
        const response = await fetch('/employee/tickets-data', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();
        
        if (data.success) {
            allTickets = data.tickets;
            updateTicketStats(data.stats);
            updateTicketList(allTickets);
            updateTicketsBadge(data.stats.open_tickets);
        } else if (!silent) {
            showError('Error al cargar tickets: ' + (data.message || 'Error desconocido'));
        }
    } catch (error) {
        console.error('Error loading tickets:', error);
        if (!silent) {
            showError('Error al cargar los tickets');
        }
    }
}

// Update ticket stats
function updateTicketStats(stats) {
    document.getElementById('tickets-total-count').textContent = stats.total_tickets || 0;
    document.getElementById('tickets-open-count').textContent = stats.open_tickets || 0;
    document.getElementById('tickets-inprogress-count').textContent = stats.in_progress || 0;
    document.getElementById('tickets-resolved-count').textContent = stats.resolved || 0;
}

// Update tickets badge in navigation
function updateTicketsBadge(count) {
    const badge = document.getElementById('tickets-badge');
    if (badge) {
        badge.textContent = count || 0;
        badge.style.display = count > 0 ? 'inline' : 'none';
    }
}

// Update ticket list
function updateTicketList(tickets) {
    const listContainer = document.getElementById('tickets-list');
    
    if (!tickets || tickets.length === 0) {
        listContainer.innerHTML = '<div class="no-data-message"><i class="fas fa-inbox"></i><p>No hay tickets disponibles</p></div>';
        return;
    }

    let html = '<table class="tickets-table"><thead><tr>';
    html += '<th>ID</th>';
    html += '<th>Cliente</th>';
    html += '<th>Asunto</th>';
    html += '<th>Categoria</th>';
    html += '<th>Prioridad</th>';
    html += '<th>Estado</th>';
    html += '<th>Asignado a</th>';
    html += '<th>Fecha</th>';
    html += '<th>Acciones</th>';
    html += '</tr></thead><tbody>';

    tickets.forEach(ticket => {
        html += '<tr>';
        html += `<td>#${ticket.id}</td>`;
        html += `<td>${ticket.user_name || 'N/A'}</td>`;
        html += `<td>${ticket.subject}</td>`;
        html += `<td>${getCategoryLabel(ticket.category)}</td>`;
        html += `<td>${getPriorityBadge(ticket.priority)}</td>`;
        html += `<td>${getStatusBadge(ticket.status)}</td>`;
        html += `<td>${ticket.assigned_employee_name || '<em>Sin asignar</em>'}</td>`;
        html += `<td>${formatDateTime(ticket.created_at)}</td>`;
        html += `<td class="ticket-actions">`;
        html += `<button class="btn-icon" onclick="viewTicketChat(${ticket.id})" title="Ver chat"><i class="fas fa-comments"></i></button>`;
        html += `</td>`;
        html += '</tr>';
    });

    html += '</tbody></table>';
    listContainer.innerHTML = html;
}

// Filter tickets
function filterTickets() {
    const statusFilter = document.getElementById('ticketsFilterStatus').value;
    const categoryFilter = document.getElementById('ticketsFilterCategory').value;

    let filtered = allTickets;

    if (statusFilter) {
        filtered = filtered.filter(t => t.status === statusFilter);
    }

    if (categoryFilter) {
        filtered = filtered.filter(t => t.category === categoryFilter);
    }

    updateTicketList(filtered);
}

// View ticket chat
async function viewTicketChat(ticketId) {
    currentTicketId = ticketId;
    lastMessageCount = 0; // Reset counter
    
    try {
        const response = await fetch(`/employee/ticket/${ticketId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();
        
        if (data.success) {
            showTicketChatModal(data.ticket, data.messages);
            // Iniciar polling para nuevos mensajes cada 3 segundos
            startChatPolling();
        } else {
            showError('Error al cargar el ticket: ' + (data.message || 'Error desconocido'));
        }
    } catch (error) {
        console.error('Error loading ticket:', error);
        showError('Error al cargar el ticket');
    }
}

// Show ticket chat modal
function showTicketChatModal(ticket, messages) {
    const modal = document.getElementById('ticketModal');
    const modalBody = document.getElementById('ticketModalBody');
    
    document.getElementById('ticketModalTitle').innerHTML = `Ticket #${ticket.id} - ${ticket.subject}`;
    
    let html = '<div class="ticket-chat-container">';
    
    // Ticket info header
    html += '<div class="ticket-info">';
    html += `<div><strong>Cliente:</strong> ${ticket.user_name || 'N/A'}</div>`;
    html += `<div><strong>Categoria:</strong> ${getCategoryLabel(ticket.category)}</div>`;
    html += `<div><strong>Prioridad:</strong> ${getPriorityBadge(ticket.priority)}</div>`;
    html += `<div><strong>Estado:</strong> ${getStatusBadge(ticket.status)}</div>`;
    html += `<div><strong>Fecha:</strong> ${formatDateTime(ticket.created_at)}</div>`;
    if (ticket.assigned_employee_name) {
        html += `<div><strong>Asignado a:</strong> ${ticket.assigned_employee_name}</div>`;
    } else {
        html += `<div><strong>Asignado a:</strong> <em>Sin asignar</em></div>`;
    }
    html += '</div>';
    
    // Status update section
    html += '<div class="ticket-status-controls" style="margin-top: 15px; padding: 15px; background: #f8f9fa; border-radius: 8px;">';
    html += '<div style="display: flex; gap: 10px; align-items: center;">';
    html += '<strong>Cambiar estado:</strong>';
    html += `<select id="ticketStatusSelect" class="form-control" style="width: 200px;">`;
    html += `<option value="open" ${ticket.status === 'open' ? 'selected' : ''}>Abierto</option>`;
    html += `<option value="in_progress" ${ticket.status === 'in_progress' ? 'selected' : ''}>En Proceso</option>`;
    html += `<option value="resolved" ${ticket.status === 'resolved' ? 'selected' : ''}>Resuelto</option>`;
    html += `<option value="closed" ${ticket.status === 'closed' ? 'selected' : ''}>Cerrado</option>`;
    html += '</select>';
    html += `<button class="btn btn-primary" onclick="updateTicketStatus()">Actualizar</button>`;
    html += '</div></div>';
    
    // Messages thread
    html += '<div class="chat-messages" id="chatMessages" style="margin-top: 20px;">';
    
    // Initial ticket message
    html += '<div class="chat-message client-message">';
    html += `<div class="message-header"><strong>${ticket.user_name || 'Cliente'}</strong> <span class="message-time">${formatDateTime(ticket.created_at)}</span></div>`;
    html += `<div class="message-body">${ticket.message}</div>`;
    html += '</div>';
    
    // Subsequent messages
    if (messages && messages.length > 0) {
        messages.forEach(msg => {
            const isEmployee = msg.user_id !== ticket.user_id;
            const messageClass = isEmployee ? 'employee-message' : 'client-message';
            const internalBadge = msg.is_internal ? '<span class="internal-badge">Nota interna</span>' : '';
            
            html += `<div class="chat-message ${messageClass}">`;
            html += `<div class="message-header"><strong>${msg.user_name || 'Usuario'}</strong> ${internalBadge} <span class="message-time">${formatDateTime(msg.created_at)}</span></div>`;
            html += `<div class="message-body">${msg.message}</div>`;
            html += '</div>';
        });
    }
    
    html += '</div>';
    
    // Message input
    html += '<div class="chat-input-container" style="margin-top: 20px;">';
    html += '<textarea id="ticketMessageInput" class="form-control" placeholder="Escribe tu respuesta..." rows="3"></textarea>';
    html += '<div style="display: flex; gap: 10px; margin-top: 10px; align-items: center;">';
    html += '<label style="margin: 0;"><input type="checkbox" id="isInternalNote"> Nota interna (solo empleados)</label>';
    html += '<button class="btn btn-primary" onclick="sendTicketMessage()" style="margin-left: auto;"><i class="fas fa-paper-plane"></i> Enviar</button>';
    html += '</div>';
    html += '</div>';
    
    html += '</div>';
    
    modalBody.innerHTML = html;
    modal.style.display = 'flex';
    
    // Scroll to bottom of messages
    setTimeout(() => {
        const chatMessages = document.getElementById('chatMessages');
        if (chatMessages) {
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }, 100);
}

// Close ticket modal
function closeTicketModal() {
    document.getElementById('ticketModal').style.display = 'none';
    currentTicketId = null;
    lastMessageCount = 0;
    
    // Detener polling cuando se cierra el chat
    stopChatPolling();
}

// Send ticket message
async function sendTicketMessage() {
    const messageInput = document.getElementById('ticketMessageInput');
    const isInternalCheckbox = document.getElementById('isInternalNote');
    const message = messageInput.value.trim();
    
    if (!message) {
        showError('Por favor escribe un mensaje');
        return;
    }
    
    if (!currentTicketId) {
        showError('Error: Ticket no identificado');
        return;
    }
    
    try {
        const response = await fetch(`/employee/ticket/${currentTicketId}/message`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken()
            },
            body: JSON.stringify({
                message: message,
                is_internal: isInternalCheckbox.checked
            })
        });

        const data = await response.json();
        
        if (data.success) {
            showSuccess('Mensaje enviado');
            messageInput.value = '';
            isInternalCheckbox.checked = false;
            // Reload ticket chat
            viewTicketChat(currentTicketId);
        } else {
            showError('Error al enviar mensaje: ' + (data.message || 'Error desconocido'));
        }
    } catch (error) {
        console.error('Error sending message:', error);
        showError('Error al enviar el mensaje');
    }
}

// Update ticket status
async function updateTicketStatus() {
    const statusSelect = document.getElementById('ticketStatusSelect');
    const newStatus = statusSelect.value;
    
    if (!currentTicketId) {
        showError('Error: Ticket no identificado');
        return;
    }
    
    try {
        const response = await fetch(`/employee/ticket/${currentTicketId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken()
            },
            body: JSON.stringify({
                status: newStatus
            })
        });

        const data = await response.json();
        
        if (data.success) {
            showSuccess('Estado actualizado correctamente');
            loadTickets();
            viewTicketChat(currentTicketId);
        } else {
            showError('Error al actualizar estado: ' + (data.message || 'Error desconocido'));
        }
    } catch (error) {
        console.error('Error updating status:', error);
        showError('Error al actualizar el estado');
    }
}

// Start polling for new messages in the current ticket
function startChatPolling() {
    console.log('Starting chat polling...');
    stopChatPolling(); // Clear any existing interval
    
    chatPollingInterval = setInterval(async () => {
        if (!currentTicketId) {
            console.log('No current ticket, stopping chat polling');
            stopChatPolling();
            return;
        }
        
        await loadTicketMessages(true); // Silent mode
    }, 3000); // Poll every 3 seconds
}

// Stop chat polling
function stopChatPolling() {
    if (chatPollingInterval) {
        console.log('Stopping chat polling');
        clearInterval(chatPollingInterval);
        chatPollingInterval = null;
    }
}

// Load ticket messages (for polling)
async function loadTicketMessages(silent = false) {
    if (!currentTicketId) return;
    
    try {
        const response = await fetch(`/employee/ticket/${currentTicketId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();
        
        if (data.success) {
            const currentMessageCount = (data.messages ? data.messages.length : 0) + 1; // +1 for initial message
            
            if (currentMessageCount > lastMessageCount) {
                console.log(`New messages detected: ${currentMessageCount} vs ${lastMessageCount}`);
                lastMessageCount = currentMessageCount;
                showTicketChatModal(data.ticket, data.messages);
            }
        }
    } catch (error) {
        if (!silent) {
            console.error('Error loading messages:', error);
        }
    }
}

// Start polling for tickets list updates
function startTicketsPolling() {
    console.log('Starting tickets list polling...');
    stopTicketsPolling(); // Clear any existing interval
    
    ticketsPollingInterval = setInterval(async () => {
        await loadTickets(true); // Silent mode
    }, 30000); // Poll every 30 seconds
}

// Stop tickets polling
function stopTicketsPolling() {
    if (ticketsPollingInterval) {
        console.log('Stopping tickets polling');
        clearInterval(ticketsPollingInterval);
        ticketsPollingInterval = null;
    }
}

// Helper functions for tickets
function getCategoryLabel(category) {
    const labels = {
        'consulta': 'Consulta',
        'soporte_tecnico': 'Soporte Técnico',
        'reclamo': 'Reclamo',
        'sugerencia': 'Sugerencia'
    };
    return labels[category] || category;
}

function getPriorityBadge(priority) {
    const badges = {
        'low': '<span class="badge badge-priority-low">Baja</span>',
        'medium': '<span class="badge badge-priority-medium">Media</span>',
        'high': '<span class="badge badge-priority-high">Alta</span>',
        'urgent': '<span class="badge badge-priority-urgent">Urgente</span>'
    };
    return badges[priority] || priority;
}

function getStatusBadge(status) {
    const badges = {
        'open': '<span class="badge badge-status-open">Abierto</span>',
        'in_progress': '<span class="badge badge-status-inprogress">En Proceso</span>',
        'resolved': '<span class="badge badge-status-resolved">Resuelto</span>',
        'closed': '<span class="badge badge-status-closed">Cerrado</span>'
    };
    return badges[status] || status;
}

// Helper functions for general use
function getCSRFToken() {
    const token = document.querySelector('meta[name="csrf-token"]');
    return token ? token.getAttribute('content') : '';
}

function formatDateTime(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function showSuccess(message) {
    // Crear notificación de éxito
    const notification = document.createElement('div');
    notification.className = 'notification notification-success';
    notification.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        background: linear-gradient(135deg, #10b981, #059669);
        color: white;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 14px;
        font-weight: 500;
        z-index: 10001;
        animation: slideIn 0.3s ease;
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

function showError(message) {
    // Crear notificación de error
    const notification = document.createElement('div');
    notification.className = 'notification notification-error';
    notification.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        background: linear-gradient(135deg, #ef4444, #dc2626);
        color: white;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 14px;
        font-weight: 500;
        z-index: 10001;
        animation: slideIn 0.3s ease;
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 4000);
}

// Support section functions
function showFAQ() {
    const faqContent = document.getElementById('faqContent');
    if (faqContent.style.display === 'none') {
        faqContent.style.display = 'block';
        faqContent.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } else {
        faqContent.style.display = 'none';
    }
}

function toggleFAQ(element) {
    const answer = element.nextElementSibling;
    const icon = element.querySelector('i');
    
    if (answer.style.display === 'block') {
        answer.style.display = 'none';
        icon.className = 'fas fa-chevron-right';
    } else {
        answer.style.display = 'block';
        icon.className = 'fas fa-chevron-down';
    }
}

function showGuides() {
    alert('Las guías de usuario se abrirán en una nueva ventana.\n\nPróximamente: Manual completo del sistema FerreJunior.');
}

function contactSupport() {
    const message = 'Información de Contacto:\n\n' +
                   'Email: soporte@ferrejunior.com\n' +
                   'Teléfono: +57 (604) 123-4567\n' +
                   'Horario: Lunes a Viernes, 8:00 AM - 6:00 PM';
    alert(message);
}

// Handle URL hash on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, checking for hash in URL');
    
    // Check if there's a hash in the URL
    const hash = window.location.hash.substring(1); // Remove the '#'
    console.log('URL hash:', hash);
    
    if (hash) {
        // Show the section specified in the hash
        showSection(hash);
    } else {
        // Default to showing dashboard
        showSection('dashboard');
    }
});

// Also handle hash changes when user uses back/forward buttons
window.addEventListener('hashchange', function() {
    const hash = window.location.hash.substring(1);
    console.log('Hash changed to:', hash);
    if (hash) {
        showSection(hash);
    }
});
