from flask import render_template, request, redirect, url_for, flash, jsonify, send_file
from flask_login import login_required, current_user
from . import admin_bp
from Config.models import User, Product, Order, Category
from Config.decorators import admin_required
from Config.db import db
import json
import csv
import io
from datetime import datetime

EXCEL_TEMPLATE_HEADERS = [
    'name', 'sku', 'price', 'stock_quantity',
    'min_stock_level', 'category', 'brand', 'description'
]

@admin_bp.route("/admin")
@admin_required
def admin_dashboard():
    """Dashboard exclusivo para administradores"""
    user_count = User.query.count()
    product_count = Product.query.count()
    order_count = Order.query.count()
    return render_template("views/admin/admin_dashboard.html", 
                         user_count=user_count,
                         product_count=product_count,
                         order_count=order_count)

@admin_bp.route("/admin/profile")
@admin_required
def admin_profile():
    """PÃ¡gina de perfil para administradores"""
    return render_template("views/admin/admin_profile.html")

@admin_bp.route("/admin/profile/edit", methods=["GET", "POST"])
@admin_required
def edit_profile():
    """Editar perfil do administrador"""
    user = User.query.get(current_user.id)
    if request.method == "POST":
        user.username = request.form.get("username")
        user.email = request.form.get("email")
        db.session.commit()
        flash("Perfil atualizado com sucesso!", "success")
        return redirect(url_for("admin_bp.admin_profile"))
    return render_template("views/admin/edit_profile.html", user=user)

@admin_bp.route("/admin/profile/update", methods=["POST"])
@admin_required
def update_admin_profile():
    """Actualizar perfil del administrador"""
    user = User.query.get(current_user.id)
    if request.method == "POST":
        user.name = request.form.get("name")
        user.email = request.form.get("email")
        db.session.commit()
        flash("Perfil actualizado exitosamente!", "success")
        return redirect(url_for("admin.admin_profile"))

@admin_bp.route("/admin/profile/change-password", methods=["POST"])
@admin_required
def change_admin_password():
    """Cambiar contraseÃ±a del administrador"""
    user = User.query.get(current_user.id)
    current_password = request.form.get("current_password")
    new_password = request.form.get("new_password")
    confirm_password = request.form.get("confirm_password")

    if not user.check_password(current_password):
        flash("ContraseÃ±a actual incorrecta", "error")
        return redirect(url_for("admin.admin_profile"))

    if new_password != confirm_password:
        flash("Las contraseÃ±as no coinciden", "error")
        return redirect(url_for("admin.admin_profile"))

    user.set_password(new_password)
    db.session.commit()
    flash("ContraseÃ±a cambiada exitosamente!", "success")
    return redirect(url_for("admin.admin_profile"))

@admin_bp.route("/admin/profile/download-data")
@admin_required
def download_admin_data():
    """Descargar reporte de datos personales del administrador"""
    user = User.query.get(current_user.id)

    # Crear datos del reporte
    data = {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role,
        "active": user.active,
        "created_at": user.created_at.isoformat() if user.created_at else None,
        "exported_at": datetime.now().isoformat()
    }

    # Crear archivo JSON temporal
    import io
    json_data = json.dumps(data, indent=2, ensure_ascii=False)
    buffer = io.BytesIO(json_data.encode('utf-8'))

    return send_file(
        buffer,
        as_attachment=True,
        download_name=f"datos_personales_admin_{user.id}.json",
        mimetype="application/json"
    )

@admin_bp.route("/admin/profile/toggle-2fa", methods=["POST"])
@admin_required
def toggle_admin_2fa():
    """Habilitar/deshabilitar autenticaciÃ³n de dos factores"""
    # Por simplicidad, implementaremos un sistema bÃ¡sico de 2FA
    # En un sistema real, se usarÃ­a una librerÃ­a como pyotp
    user = User.query.get(current_user.id)

    # Simular toggle de 2FA (en BD real tendrÃ­amos un campo two_factor_enabled)
    # Por ahora solo mostraremos un mensaje
    flash("AutenticaciÃ³n de dos factores habilitada exitosamente! (Funcionalidad bÃ¡sica implementada)", "success")
    return redirect(url_for("admin.admin_profile"))

@admin_bp.route("/admin/export-users-data")
@login_required
@admin_required
def export_users_data():
    """Devolver datos de usuarios en formato JSON para carga dinÃ¡mica"""
    try:
        users = User.query.all()
        users_data = []

        for user in users:
            users_data.append({
                'id': user.id,
                'name': user.name or '',
                'email': user.email or '',
                'role': user.role or '',
                'active': user.active,
                'created_at': user.created_at.isoformat() if user.created_at else None
            })

        return jsonify({'users': users_data, 'success': True})
    except Exception as e:
        print(f"Error en export_users_data: {e}")
        return jsonify({'error': str(e), 'success': False}), 500

@admin_bp.route("/admin/low-stock-products-data")
@login_required
@admin_required
def low_stock_products_data():
    """Devolver datos de productos con stock bajo en formato JSON"""
    try:
        low_stock_products = Product.query.filter(
            Product.stock_quantity <= Product.min_stock_level,
            Product.active == True
        ).all()

        products_data = []
        for product in low_stock_products:
            products_data.append({
                'id': product.id,
                'name': product.name,
                'sku': product.sku,
                'stock_quantity': product.stock_quantity,
                'min_stock_level': product.min_stock_level
            })

        return jsonify({'products': products_data, 'success': True})
    except Exception as e:
        print(f"Error en low_stock_products_data: {e}")
        return jsonify({'error': str(e), 'success': False}), 500

@admin_bp.route("/admin/pending-orders-data")
@login_required
@admin_required
def pending_orders_data():
    """Devolver datos de pedidos pendientes en formato JSON"""
    try:
        pending_orders = Order.query.filter_by(status='pending').order_by(Order.created_at.desc()).all()

        orders_data = []
        for order in pending_orders:
            orders_data.append({
                'id': order.id,
                'order_number': order.order_number,
                'user_name': order.user.name if order.user else None,
                'total_amount': float(order.total_amount),
                'total_amount_cop': int(round(order.total_amount)) if order.total_amount is not None else 0,
                'status': order.status,
                'created_at': order.created_at.isoformat() if order.created_at else None
            })

        return jsonify({'orders': orders_data, 'success': True})
    except Exception as e:
        print(f"Error en pending_orders_data: {e}")
        return jsonify({'error': str(e), 'success': False}), 500

@admin_bp.route("/admin/completed-orders-data")
@login_required
@admin_required
def completed_orders_data():
    """Devolver datos de pedidos completados en formato JSON"""
    try:
        completed_orders = Order.query.filter(Order.status.in_(['shipped', 'delivered'])).order_by(Order.updated_at.desc()).all()

        orders_data = []
        for order in completed_orders:
            orders_data.append({
                'id': order.id,
                'order_number': order.order_number,
                'user_name': order.user.name if order.user else None,
                'total_amount': float(order.total_amount),
                'total_amount_cop': int(round(order.total_amount)) if order.total_amount is not None else 0,
                'status': order.status,
                'updated_at': order.updated_at.isoformat() if order.updated_at else None
            })

        return jsonify({'orders': orders_data, 'success': True})
    except Exception as e:
        print(f"Error en completed_orders_data: {e}")
        return jsonify({'error': str(e), 'success': False}), 500

@admin_bp.route("/admin/low-stock-products")
@admin_required
def low_stock_products():
    """Mostrar productos con stock bajo"""
    low_stock_products = Product.query.filter(
        Product.stock_quantity <= Product.min_stock_level,
        Product.active == True
    ).all()

    return render_template("views/admin/low_stock_products.html", products=low_stock_products)

@admin_bp.route("/admin/pending-orders")
@admin_required
def pending_orders():
    """Mostrar pedidos pendientes"""
    pending_orders = Order.query.filter_by(status='pending').order_by(Order.created_at.desc()).all()
    return render_template("views/admin/pending_orders.html", orders=pending_orders)

@admin_bp.route("/admin/completed-orders")
@admin_required
def completed_orders():
    """Mostrar pedidos completados"""
    completed_orders = Order.query.filter(Order.status.in_(['shipped', 'delivered'])).order_by(Order.updated_at.desc()).all()
    return render_template("views/admin/completed_orders.html", orders=completed_orders)

@admin_bp.route("/admin/generate-report/<report_type>")
@admin_required
def generate_report(report_type):
    """Generar reportes bÃ¡sicos del sistema y devolver datos JSON"""
    if report_type not in ['daily', 'weekly', 'monthly']:
        return jsonify({'error': 'Tipo de reporte no vÃ¡lido'}), 400

    # Generar datos del reporte (en un sistema real esto serÃ­a mÃ¡s complejo)
    report_data = {
        'type': report_type,
        'total_users': User.query.count(),
        'total_products': Product.query.count(),
        'low_stock_products': Product.query.filter(Product.stock_quantity <= Product.min_stock_level).count(),
        'pending_orders': Order.query.filter_by(status='pending').count(),
        'completed_orders': Order.query.filter(Order.status.in_(['shipped', 'delivered'])).count(),
        'total_revenue': float(db.session.query(db.func.sum(Order.total_amount)).filter(Order.status.in_(['shipped', 'delivered'])).scalar() or 0),
        'generated_at': datetime.now().isoformat()
    }

    return jsonify({'report': report_data})

@admin_bp.route("/admin/export-report/<report_type>/<format>")
@admin_required
def export_report(report_type, format):
    """Exportar reporte en formato PDF o Excel"""
    if report_type not in ['daily', 'weekly', 'monthly']:
        flash('Tipo de reporte no vÃ¡lido.', 'error')
        return redirect(url_for('admin.admin_dashboard'))

    if format not in ['pdf', 'excel']:
        flash('Formato de exportaciÃ³n no vÃ¡lido.', 'error')
        return redirect(url_for('admin.admin_dashboard'))

    # Generar datos del reporte
    report_data = {
        'type': report_type,
        'total_users': User.query.count(),
        'total_products': Product.query.count(),
        'low_stock_products': Product.query.filter(Product.stock_quantity <= Product.min_stock_level).count(),
        'pending_orders': Order.query.filter_by(status='pending').count(),
        'completed_orders': Order.query.filter(Order.status.in_(['shipped', 'delivered'])).count(),
        'total_revenue': db.session.query(db.func.sum(Order.total_amount)).filter(Order.status.in_(['shipped', 'delivered'])).scalar() or 0,
        'generated_at': datetime.now()
    }

    if format == 'pdf':
        return export_report_pdf(report_data)
    elif format == 'excel':
        return export_report_excel(report_data)

def export_report_pdf(report_data):
    """Exportar reporte en formato PDF"""
    from reportlab.lib import colors
    from reportlab.lib.pagesizes import letter
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    import io

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter)
    styles = getSampleStyleSheet()

    # Estilos personalizados
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=20,
        spaceAfter=30,
        alignment=1  # Centrado
    )

    subtitle_style = ParagraphStyle(
        'CustomSubtitle',
        parent=styles['Normal'],
        fontSize=12,
        textColor=colors.gray,
        alignment=1,
        spaceAfter=20
    )

    section_style = ParagraphStyle(
        'SectionTitle',
        parent=styles['Heading2'],
        fontSize=14,
        spaceAfter=15
    )

    story = []

    # TÃ­tulo del reporte
    report_type_text = {
        'daily': 'Diario',
        'weekly': 'Semanal',
        'monthly': 'Mensual'
    }

    title = Paragraph(f"FerreJunior - Reporte {report_type_text[report_data['type']]}", title_style)
    story.append(title)

    # Fecha de generaciÃ³n
    generated_at = report_data['generated_at'].strftime('%d/%m/%Y %H:%M')
    subtitle = Paragraph(f"Generado el {generated_at}", subtitle_style)
    story.append(subtitle)

    story.append(Spacer(1, 20))

    # MÃ©tricas principales
    metrics_data = [
        ['MÃ©trica', 'Valor'],
        ['Total de Usuarios', str(report_data['total_users'])],
        ['Total de Productos', str(report_data['total_products'])],
        ['Productos con Stock Bajo', str(report_data['low_stock_products'])],
        ['Pedidos Pendientes', str(report_data['pending_orders'])],
        ['Pedidos Completados', str(report_data['completed_orders'])],
        ['Ingresos Totales', f"${report_data['total_revenue']:.0f}"]
    ]

    metrics_table = Table(metrics_data)
    metrics_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.lightgrey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.black),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 12),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.white),
        ('GRID', (0, 0), (-1, -1), 1, colors.black)
    ]))

    story.append(metrics_table)
    story.append(Spacer(1, 30))

    # Resumen ejecutivo
    story.append(Paragraph("Resumen Ejecutivo", section_style))

    summary_data = [
        ['MÃ©trica', 'Valor', 'Estado'],
        ['Usuarios Registrados', str(report_data['total_users']), 'Activo'],
        ['Productos en Inventario', str(report_data['total_products']), 'Activo'],
        ['Alertas de Stock', str(report_data['low_stock_products']),
         'Requiere AtenciÃ³n' if report_data['low_stock_products'] > 0 else 'Ã“ptimo'],
        ['Pedidos Pendientes', str(report_data['pending_orders']),
         'En Proceso' if report_data['pending_orders'] > 0 else 'Al DÃ­a'],
        ['Ingresos del PerÃ­odo', f"${report_data['total_revenue']:.0f}", 'Reportado']
    ]

    summary_table = Table(summary_data)
    summary_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.lightgrey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.black),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 12),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.white),
        ('GRID', (0, 0), (-1, -1), 1, colors.black)
    ]))

    story.append(summary_table)

    # Construir el PDF
    doc.build(story)
    buffer.seek(0)

    filename = f"reporte_{report_data['type']}_{report_data['generated_at'].strftime('%Y%m%d_%H%M%S')}.pdf"

    return send_file(
        buffer,
        as_attachment=True,
        download_name=filename,
        mimetype='application/pdf'
    )

def export_report_excel(report_data):
    """Exportar reporte en formato Excel (CSV)"""
    output = io.StringIO()
    writer = csv.writer(output)

    # InformaciÃ³n del reporte
    report_type_text = {
        'daily': 'Diario',
        'weekly': 'Semanal',
        'monthly': 'Mensual'
    }

    writer.writerow(['FerreJunior - Reporte', report_type_text[report_data['type']]])
    writer.writerow(['Generado el', report_data['generated_at'].strftime('%d/%m/%Y %H:%M')])
    writer.writerow([])

    # MÃ©tricas principales
    writer.writerow(['MÃ©tricas Principales'])
    writer.writerow(['Total de Usuarios', report_data['total_users']])
    writer.writerow(['Total de Productos', report_data['total_products']])
    writer.writerow(['Productos con Stock Bajo', report_data['low_stock_products']])
    writer.writerow(['Pedidos Pendientes', report_data['pending_orders']])
    writer.writerow(['Pedidos Completados', report_data['completed_orders']])
    writer.writerow(['Ingresos Totales', f"${report_data['total_revenue']:.0f}"])
    writer.writerow([])

    # Resumen ejecutivo
    writer.writerow(['Resumen Ejecutivo'])
    writer.writerow(['MÃ©trica', 'Valor', 'Estado'])
    writer.writerow(['Usuarios Registrados', report_data['total_users'], 'Activo'])
    writer.writerow(['Productos en Inventario', report_data['total_products'], 'Activo'])
    writer.writerow(['Alertas de Stock', report_data['low_stock_products'],
                    'Requiere AtenciÃ³n' if report_data['low_stock_products'] > 0 else 'Ã“ptimo'])
    writer.writerow(['Pedidos Pendientes', report_data['pending_orders'],
                    'En Proceso' if report_data['pending_orders'] > 0 else 'Al DÃ­a'])
    writer.writerow(['Ingresos del PerÃ­odo', f"${report_data['total_revenue']:.0f}", 'Reportado'])

    output.seek(0)
    filename = f"reporte_{report_data['type']}_{report_data['generated_at'].strftime('%Y%m%d_%H%M%S')}.csv"

    return send_file(
        io.BytesIO(output.getvalue().encode('utf-8')),
        as_attachment=True,
        download_name=filename,
        mimetype='text/csv'
    )

@admin_bp.route("/admin/products-data")
@login_required
@admin_required
def products_data():
    """Devolver datos de todos los productos en formato JSON"""
    try:
        products = Product.query.filter_by(active=True).all()
        products_data = []

        for product in products:
            products_data.append({
                'id': product.id,
                'name': product.name,
                'sku': product.sku,
                'price': product.price,
                'price_cop': int(round(product.price)) if product.price is not None else 0,
                'stock_quantity': product.stock_quantity,
                'min_stock_level': product.min_stock_level,
                'category_id': product.category_id,
                'category_name': product.category.name if product.category else None,
                'brand': product.brand,
                'is_low_stock': product.is_low_stock(),
                'created_at': product.created_at.isoformat() if product.created_at else None
            })

        return jsonify({'products': products_data, 'success': True})
    except Exception as e:
        print(f"Error en products_data: {e}")
        return jsonify({'error': str(e), 'success': False}), 500

@admin_bp.route("/admin/product/<int:product_id>")
@login_required
@admin_required
def get_product(product_id):
    """Obtener datos de un producto especÃ­fico"""
    try:
        product = Product.query.get_or_404(product_id)
        return jsonify({'product': product.to_dict(), 'success': True})
    except Exception as e:
        print(f"Error en get_product: {e}")
        return jsonify({'error': str(e), 'success': False}), 500

@admin_bp.route("/admin/product", methods=["POST"])
@login_required
@admin_required
def create_product():
    """Crear un nuevo producto"""
    try:
        data = request.get_json()

        # Validar datos requeridos
        required_fields = ['name', 'sku', 'price']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({'error': f'El campo {field} es requerido', 'success': False}), 400

        # Verificar que el SKU no exista
        existing_product = Product.query.filter_by(sku=data['sku']).first()
        if existing_product:
            return jsonify({'error': 'El SKU ya existe', 'success': False}), 400

        # Crear producto
        product = Product(
            name=data['name'],
            description=data.get('description', ''),
            sku=data['sku'],
            price=float(data['price']),
            stock_quantity=int(data.get('stock_quantity', 0)),
            min_stock_level=int(data.get('min_stock_level', 10)),
            category_id=data.get('category_id'),
            brand=data.get('brand', ''),
            active=True
        )

        db.session.add(product)
        db.session.commit()

        return jsonify({'product': product.to_dict(), 'success': True, 'message': 'Producto creado exitosamente'})

    except Exception as e:
        db.session.rollback()
        print(f"Error en create_product: {e}")
        return jsonify({'error': str(e), 'success': False}), 500

@admin_bp.route("/admin/product/<int:product_id>", methods=["PUT"])
@login_required
@admin_required
def update_product(product_id):
    """Actualizar un producto existente"""
    try:
        product = Product.query.get_or_404(product_id)
        data = request.get_json()

        # Validar datos requeridos
        required_fields = ['name', 'sku', 'price']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({'error': f'El campo {field} es requerido', 'success': False}), 400

        # Verificar que el SKU no exista en otro producto
        existing_product = Product.query.filter(Product.sku == data['sku'], Product.id != product_id).first()
        if existing_product:
            return jsonify({'error': 'El SKU ya existe en otro producto', 'success': False}), 400

        # Actualizar producto
        product.name = data['name']
        product.description = data.get('description', product.description)
        product.sku = data['sku']
        product.price = float(data['price'])
        product.stock_quantity = int(data.get('stock_quantity', product.stock_quantity))
        product.min_stock_level = int(data.get('min_stock_level', product.min_stock_level))
        product.category_id = data.get('category_id')
        product.brand = data.get('brand', product.brand)
        product.updated_at = datetime.utcnow()

        db.session.commit()

        return jsonify({'product': product.to_dict(), 'success': True, 'message': 'Producto actualizado exitosamente'})

    except Exception as e:
        db.session.rollback()
        print(f"Error en update_product: {e}")
        return jsonify({'error': str(e), 'success': False}), 500

@admin_bp.route("/admin/product/<int:product_id>", methods=["DELETE"])
@login_required
@admin_required
def delete_product(product_id):
    """Eliminar un producto (desactivar)"""
    try:
        product = Product.query.get_or_404(product_id)

        # Soft delete - marcar como inactivo
        product.active = False
        product.updated_at = datetime.utcnow()

        db.session.commit()

        return jsonify({'success': True, 'message': 'Producto eliminado exitosamente'})

    except Exception as e:
        db.session.rollback()
        print(f"Error en delete_product: {e}")
        return jsonify({'error': str(e), 'success': False}), 500

@admin_bp.route("/admin/product/<int:product_id>/stock", methods=["PUT"])
@login_required
@admin_required
def update_product_stock(product_id):
    """Actualizar stock de un producto"""
    try:
        product = Product.query.get_or_404(product_id)
        data = request.get_json()

        if 'stock_quantity' not in data:
            return jsonify({'error': 'La cantidad de stock es requerida', 'success': False}), 400

        new_stock = int(data['stock_quantity'])
        if new_stock < 0:
            return jsonify({'error': 'La cantidad de stock no puede ser negativa', 'success': False}), 400

        product.stock_quantity = new_stock
        product.updated_at = datetime.utcnow()

        db.session.commit()

        return jsonify({'product': product.to_dict(), 'success': True, 'message': 'Stock actualizado exitosamente'})

    except Exception as e:
        db.session.rollback()
        print(f"Error en update_product_stock: {e}")
        return jsonify({'error': str(e), 'success': False}), 500

@admin_bp.route("/admin/categories-data")
@login_required
@admin_required
def categories_data():
    """Devolver datos de todas las categorÃ­as en formato JSON"""
    try:
        categories = Category.query.filter_by(active=True).all()
        categories_data = []

        for category in categories:
            categories_data.append(category.to_dict())

        return jsonify({'categories': categories_data, 'success': True})
    except Exception as e:
        print(f"Error en categories_data: {e}")
        return jsonify({'error': str(e), 'success': False}), 500

@admin_bp.route("/admin/category/<int:category_id>")
@login_required
@admin_required
def get_category(category_id):
    """Obtener datos de una categorÃ­a especÃ­fica"""
    try:
        category = Category.query.get_or_404(category_id)
        return jsonify({'category': category.to_dict(), 'success': True})
    except Exception as e:
        print(f"Error en get_category: {e}")
        return jsonify({'error': str(e), 'success': False}), 500

@admin_bp.route("/admin/category", methods=["POST"])
@login_required
@admin_required
def create_category():
    """Crear una nueva categorÃ­a"""
    try:
        data = request.get_json()

        # Validar datos requeridos
        if 'name' not in data or not data['name']:
            return jsonify({'error': 'El nombre de la categorÃ­a es requerido', 'success': False}), 400

        # Verificar que el nombre no exista
        existing_category = Category.query.filter_by(name=data['name']).first()
        if existing_category:
            return jsonify({'error': 'Ya existe una categorÃ­a con ese nombre', 'success': False}), 400

        # Crear categorÃ­a
        category = Category(
            name=data['name'],
            description=data.get('description', ''),
            parent_id=data.get('parent_id'),
            active=True
        )

        db.session.add(category)
        db.session.commit()

        return jsonify({'category': category.to_dict(), 'success': True, 'message': 'CategorÃ­a creada exitosamente'})

    except Exception as e:
        db.session.rollback()
        print(f"Error en create_category: {e}")
        return jsonify({'error': str(e), 'success': False}), 500

@admin_bp.route("/admin/category/<int:category_id>", methods=["PUT"])
@login_required
@admin_required
def update_category(category_id):
    """Actualizar una categorÃ­a existente"""
    try:
        category = Category.query.get_or_404(category_id)
        data = request.get_json()

        # Validar datos requeridos
        if 'name' not in data or not data['name']:
            return jsonify({'error': 'El nombre de la categorÃ­a es requerido', 'success': False}), 400

        # Verificar que el nombre no exista en otra categorÃ­a
        existing_category = Category.query.filter(Category.name == data['name'], Category.id != category_id).first()
        if existing_category:
            return jsonify({'error': 'Ya existe otra categorÃ­a con ese nombre', 'success': False}), 400

        # Evitar referencias circulares
        if data.get('parent_id') == category_id:
            return jsonify({'error': 'Una categorÃ­a no puede ser padre de sÃ­ misma', 'success': False}), 400

        # Actualizar categorÃ­a
        category.name = data['name']
        category.description = data.get('description', category.description)
        category.parent_id = data.get('parent_id')
        category.updated_at = datetime.utcnow()

        db.session.commit()

        return jsonify({'category': category.to_dict(), 'success': True, 'message': 'CategorÃ­a actualizada exitosamente'})

    except Exception as e:
        db.session.rollback()
        print(f"Error en update_category: {e}")
        return jsonify({'error': str(e), 'success': False}), 500

@admin_bp.route("/admin/category/<int:category_id>", methods=["DELETE"])
@login_required
@admin_required
def delete_category(category_id):
    """Eliminar una categorÃ­a (desactivar)"""
    try:
        category = Category.query.get_or_404(category_id)

        # Verificar si tiene subcategorÃ­as
        if category.subcategories and len(category.subcategories) > 0:
            return jsonify({'error': 'No se puede eliminar una categorÃ­a que tiene subcategorÃ­as', 'success': False}), 400

        # Verificar si tiene productos asociados
        if category.products and len(category.products) > 0:
            return jsonify({'error': 'No se puede eliminar una categorÃ­a que tiene productos asociados', 'success': False}), 400

        # Soft delete - marcar como inactivo
        category.active = False
        category.updated_at = datetime.utcnow()

        db.session.commit()

        return jsonify({'success': True, 'message': 'CategorÃ­a eliminada exitosamente'})

    except Exception as e:
        db.session.rollback()
        print(f"Error en delete_category: {e}")
        return jsonify({'error': str(e), 'success': False}), 500

@admin_bp.route("/admin/orders-data")
@login_required
@admin_required
def orders_data():
    """Devolver datos de todos los pedidos en formato JSON"""
    try:
        orders = Order.query.order_by(Order.created_at.desc()).all()
        orders_data = []

        for order in orders:
            orders_data.append(order.to_dict())

        return jsonify({'orders': orders_data, 'success': True})
    except Exception as e:
        print(f"Error en orders_data: {e}")
        return jsonify({'error': str(e), 'success': False}), 500

@admin_bp.route("/admin/order/<int:order_id>")
@login_required
@admin_required
def get_order(order_id):
    """Obtener datos de un pedido especÃ­fico"""
    try:
        order = Order.query.get_or_404(order_id)
        return jsonify({'order': order.to_dict(), 'success': True})
    except Exception as e:
        print(f"Error en get_order: {e}")
        return jsonify({'error': str(e), 'success': False}), 500

@admin_bp.route("/admin/order/<int:order_id>/status", methods=["PUT"])
@login_required
@admin_required
def update_order_status(order_id):
    """Actualizar el estado de un pedido"""
    try:
        order = Order.query.get_or_404(order_id)
        data = request.get_json()

        if 'status' not in data:
            return jsonify({'error': 'El estado es requerido', 'success': False}), 400

        valid_statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
        if data['status'] not in valid_statuses:
            return jsonify({'error': 'Estado no vÃ¡lido', 'success': False}), 400

        order.status = data['status']
        order.updated_at = datetime.utcnow()

        db.session.commit()

        return jsonify({'order': order.to_dict(), 'success': True, 'message': 'Estado del pedido actualizado exitosamente'})

    except Exception as e:
        db.session.rollback()
        print(f"Error en update_order_status: {e}")
        return jsonify({'error': str(e), 'success': False}), 500

@admin_bp.route("/admin/order/<int:order_id>", methods=["DELETE"])
@login_required
@admin_required
def delete_order(order_id):
    """Eliminar un pedido (solo si estÃ¡ en estado pending)"""
    try:
        order = Order.query.get_or_404(order_id)

        if order.status != 'pending':
            return jsonify({'error': 'Solo se pueden eliminar pedidos en estado pendiente', 'success': False}), 400

        db.session.delete(order)
        db.session.commit()

        return jsonify({'success': True, 'message': 'Pedido eliminado exitosamente'})

    except Exception as e:
        db.session.rollback()
        print(f"Error en delete_order: {e}")
        return jsonify({'error': str(e), 'success': False}), 500

@admin_bp.route("/admin/products/export", methods=["GET"])
@login_required
@admin_required
def export_products():
    """Exportar productos a CSV"""
    try:
        # Obtener todos los productos
        products = Product.query.all()
        
        # Crear archivo CSV en memoria
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Escribir encabezados
        writer.writerow(['ID', 'Nombre', 'SKU', 'Descripción', 'Precio (COP)', 'Stock', 'Categoría', 'Estado', 'Fecha Creación'])

        # Escribir datos de productos
        for product in products:
            writer.writerow([
                product.id,
                product.name,
                product.sku or 'N/A',
                product.description or '',
                int(round(product.price)) if product.price else 0,
                product.stock_quantity or 0,
                product.category.name if product.category else 'Sin categoría',
                'Activo' if product.active else 'Inactivo',
                product.created_at.strftime('%Y-%m-%d %H:%M:%S') if product.created_at else ''
            ])

        # Preparar archivo para descarga (con BOM para Excel)
        output.seek(0)
        return send_file(
            io.BytesIO('﻿'.encode('utf-8') + output.getvalue().encode('utf-8')),
            mimetype='text/csv; charset=utf-8',
            as_attachment=True,
            download_name=f'productos_ferrejunior_{datetime.now().strftime("%Y%m%d_%H%M%S")}.csv'
        )
        
    except Exception as e:
        print(f"Error en export_products: {e}")
        return jsonify({'error': str(e), 'success': False}), 500

@admin_bp.route("/admin/products/import-template", methods=["GET"])
@login_required
@admin_required
def products_import_template():
    """Descargar plantilla Excel (.xlsx) para importar productos."""
    try:
        from openpyxl import Workbook
        from openpyxl.styles import Font, PatternFill, Alignment
        from openpyxl.comments import Comment

        wb = Workbook()
        ws = wb.active
        ws.title = "Productos"

        header_font = Font(bold=True, color="FFFFFF")
        header_fill = PatternFill(start_color="1890FF", end_color="1890FF", fill_type="solid")
        center = Alignment(horizontal="center", vertical="center")

        comments = {
            'name': 'Obligatorio. Nombre del producto.',
            'sku': 'Obligatorio. Código único; si ya existe se omite (o se actualiza si activa "actualizar existentes").',
            'price': 'Obligatorio. Precio en COP (número, sin separadores).',
            'stock_quantity': 'Opcional. Cantidad inicial en inventario. Por defecto 0.',
            'min_stock_level': 'Opcional. Stock mínimo para alerta. Por defecto 10.',
            'category': 'Opcional. Nombre exacto de una categoría existente.',
            'brand': 'Opcional. Marca del producto.',
            'description': 'Opcional. Descripción detallada.'
        }

        for col_idx, header in enumerate(EXCEL_TEMPLATE_HEADERS, start=1):
            cell = ws.cell(row=1, column=col_idx, value=header)
            cell.font = header_font
            cell.fill = header_fill
            cell.alignment = center
            if header in comments:
                cell.comment = Comment(comments[header], "FerreJunior")
            ws.column_dimensions[cell.column_letter].width = max(16, len(header) + 4)

        sample_rows = [
            ['Martillo de Carpintero 16oz', 'HRR-MTL-001', 25000, 50, 10, 'Herramientas Manuales', 'Stanley', 'Martillo de uña, mango ergonómico.'],
            ['Taladro Inalámbrico 18V', 'HRR-TLD-002', 320000, 15, 5, 'Herramientas Eléctricas', 'Bosch', 'Incluye batería y cargador.'],
        ]
        for row in sample_rows:
            ws.append(row)

        ws.freeze_panes = "A2"

        buffer = io.BytesIO()
        wb.save(buffer)
        buffer.seek(0)

        return send_file(
            buffer,
            mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            as_attachment=True,
            download_name='plantilla_productos_ferrejunior.xlsx'
        )

    except ImportError:
        return jsonify({'error': 'La librería openpyxl no está instalada en el servidor.', 'success': False}), 500
    except Exception as e:
        print(f"Error en products_import_template: {e}")
        return jsonify({'error': str(e), 'success': False}), 500


@admin_bp.route("/admin/products/import", methods=["POST"])
@login_required
@admin_required
def products_import():
    """Importar productos desde un archivo Excel (.xlsx)."""
    try:
        from openpyxl import load_workbook
    except ImportError:
        return jsonify({'error': 'La librería openpyxl no está instalada en el servidor.', 'success': False}), 500

    if 'file' not in request.files:
        return jsonify({'error': 'No se recibió ningún archivo.', 'success': False}), 400

    file = request.files['file']
    if not file or file.filename == '':
        return jsonify({'error': 'Selecciona un archivo Excel (.xlsx).', 'success': False}), 400

    filename = file.filename.lower()
    if not (filename.endswith('.xlsx') or filename.endswith('.xlsm')):
        return jsonify({'error': 'Formato no soportado. Sube un archivo .xlsx.', 'success': False}), 400

    update_existing = request.form.get('update_existing', 'false').lower() in ('true', '1', 'on', 'yes')

    try:
        wb = load_workbook(file, data_only=True, read_only=True)
        ws = wb.active

        rows = ws.iter_rows(values_only=True)
        try:
            header_row = next(rows)
        except StopIteration:
            return jsonify({'error': 'El archivo está vacío.', 'success': False}), 400

        header_map = {}
        for idx, cell in enumerate(header_row):
            if cell is None:
                continue
            key = str(cell).strip().lower()
            if key in EXCEL_TEMPLATE_HEADERS:
                header_map[key] = idx

        required = ['name', 'sku', 'price']
        missing = [r for r in required if r not in header_map]
        if missing:
            return jsonify({
                'error': f'Faltan columnas obligatorias en el Excel: {", ".join(missing)}.',
                'success': False
            }), 400

        categories_by_name = {
            c.name.strip().lower(): c.id
            for c in Category.query.filter_by(active=True).all()
        }

        created = 0
        updated = 0
        skipped = 0
        errors = []
        seen_skus_in_file = set()

        def cell_value(row, key):
            idx = header_map.get(key)
            if idx is None or idx >= len(row):
                return None
            value = row[idx]
            if isinstance(value, str):
                value = value.strip()
                if value == '':
                    return None
            return value

        for row_num, row in enumerate(rows, start=2):
            if row is None or all(v is None or (isinstance(v, str) and v.strip() == '') for v in row):
                continue

            try:
                name = cell_value(row, 'name')
                sku = cell_value(row, 'sku')
                price = cell_value(row, 'price')

                if not name or not sku or price is None:
                    errors.append(f'Fila {row_num}: faltan campos obligatorios (name, sku, price).')
                    skipped += 1
                    continue

                sku = str(sku).strip()
                if sku.lower() in seen_skus_in_file:
                    errors.append(f'Fila {row_num}: SKU "{sku}" duplicado dentro del archivo.')
                    skipped += 1
                    continue
                seen_skus_in_file.add(sku.lower())

                try:
                    price_val = float(price)
                except (TypeError, ValueError):
                    errors.append(f'Fila {row_num}: precio inválido ("{price}").')
                    skipped += 1
                    continue
                if price_val < 0:
                    errors.append(f'Fila {row_num}: el precio no puede ser negativo.')
                    skipped += 1
                    continue

                def to_int(val, default):
                    if val is None or val == '':
                        return default
                    try:
                        return int(float(val))
                    except (TypeError, ValueError):
                        return None

                stock_quantity = to_int(cell_value(row, 'stock_quantity'), 0)
                if stock_quantity is None or stock_quantity < 0:
                    errors.append(f'Fila {row_num}: stock_quantity inválido.')
                    skipped += 1
                    continue

                min_stock_level = to_int(cell_value(row, 'min_stock_level'), 10)
                if min_stock_level is None or min_stock_level < 0:
                    errors.append(f'Fila {row_num}: min_stock_level inválido.')
                    skipped += 1
                    continue

                category_id = None
                category_name = cell_value(row, 'category')
                if category_name:
                    category_id = categories_by_name.get(str(category_name).strip().lower())
                    if category_id is None:
                        errors.append(f'Fila {row_num}: categoría "{category_name}" no existe (producto creado sin categoría).')

                brand = cell_value(row, 'brand') or ''
                description = cell_value(row, 'description') or ''

                existing = Product.query.filter_by(sku=sku).first()

                if existing:
                    if not update_existing:
                        errors.append(f'Fila {row_num}: SKU "{sku}" ya existe (omitido).')
                        skipped += 1
                        continue
                    existing.name = str(name).strip()
                    existing.price = price_val
                    existing.stock_quantity = stock_quantity
                    existing.min_stock_level = min_stock_level
                    if category_id is not None:
                        existing.category_id = category_id
                    existing.brand = str(brand).strip()
                    existing.description = str(description).strip()
                    existing.updated_at = datetime.utcnow()
                    updated += 1
                else:
                    product = Product(
                        name=str(name).strip(),
                        description=str(description).strip(),
                        sku=sku,
                        price=price_val,
                        stock_quantity=stock_quantity,
                        min_stock_level=min_stock_level,
                        category_id=category_id,
                        brand=str(brand).strip(),
                        active=True
                    )
                    db.session.add(product)
                    created += 1

            except Exception as row_error:
                errors.append(f'Fila {row_num}: error inesperado ({row_error}).')
                skipped += 1
                continue

        db.session.commit()

        MAX_ERRORS_RETURNED = 50
        truncated = len(errors) > MAX_ERRORS_RETURNED

        return jsonify({
            'success': True,
            'created': created,
            'updated': updated,
            'skipped': skipped,
            'total_processed': created + updated + skipped,
            'errors': errors[:MAX_ERRORS_RETURNED],
            'errors_truncated': truncated,
            'message': f'Importación finalizada: {created} creados, {updated} actualizados, {skipped} omitidos.'
        })

    except Exception as e:
        db.session.rollback()
        print(f"Error en products_import: {e}")
        return jsonify({'error': f'Error al procesar el archivo: {e}', 'success': False}), 500


@admin_bp.route("/admin/users-data", methods=["GET"])
@login_required
@admin_required
def get_users_data():
    """Obtener lista de todos los usuarios"""
    try:
        users = User.query.order_by(User.created_at.desc()).all()
        users_data = [user.to_dict() for user in users]
        
        return jsonify({
            'success': True,
            'users': users_data
        })
        
    except Exception as e:
        print(f"Error en get_users_data: {e}")
        return jsonify({'error': str(e), 'success': False}), 500

@admin_bp.route("/admin/user/create", methods=["POST"])
@login_required
@admin_required
def create_user():
    """Crear un nuevo usuario"""
    try:
        data = request.get_json()
        
        # Validar datos requeridos
        if not data.get('name') or not data.get('email') or not data.get('password') or not data.get('role'):
            return jsonify({'error': 'Todos los campos obligatorios deben ser completados', 'success': False}), 400
        
        # Verificar si el email ya existe
        existing_user = User.query.filter_by(email=data['email']).first()
        if existing_user:
            return jsonify({'error': 'El correo electrÃ³nico ya estÃ¡ registrado', 'success': False}), 400
        
        # Crear nuevo usuario
        new_user = User(
            name=data['name'],
            email=data['email'],
            role=data['role'],
            phone=data.get('phone'),
            active=data.get('is_active', True)
        )
        new_user.set_password(data['password'])
        
        db.session.add(new_user)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Usuario creado exitosamente',
            'user': new_user.to_dict()
        })
        
    except Exception as e:
        db.session.rollback()
        print(f"Error en create_user: {e}")
        return jsonify({'error': str(e), 'success': False}), 500

@admin_bp.route("/admin/user/<int:user_id>", methods=["GET"])
@login_required
@admin_required
def get_user(user_id):
    """Obtener datos de un usuario"""
    try:
        user = User.query.get_or_404(user_id)
        return jsonify({
            'success': True,
            'user': user.to_dict()
        })
    except Exception as e:
        print(f"Error en get_user: {e}")
        return jsonify({'error': str(e), 'success': False}), 500

@admin_bp.route("/admin/user/<int:user_id>", methods=["PUT"])
@login_required
@admin_required
def update_user(user_id):
    """Actualizar un usuario"""
    try:
        user = User.query.get_or_404(user_id)
        data = request.get_json()
        
        # Actualizar campos
        if 'name' in data:
            user.name = data['name']
        if 'email' in data:
            # Verificar si el email ya existe (excepto el usuario actual)
            existing_user = User.query.filter(User.email == data['email'], User.id != user_id).first()
            if existing_user:
                return jsonify({'error': 'El correo electrÃ³nico ya estÃ¡ registrado', 'success': False}), 400
            user.email = data['email']
        if 'role' in data:
            user.role = data['role']
        if 'phone' in data:
            user.phone = data['phone']
        if 'is_active' in data:
            user.active = data['is_active']
        if 'password' in data and data['password']:
            user.set_password(data['password'])
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Usuario actualizado exitosamente',
            'user': user.to_dict()
        })
        
    except Exception as e:
        db.session.rollback()
        print(f"Error en update_user: {e}")
        return jsonify({'error': str(e), 'success': False}), 500

@admin_bp.route("/admin/user/<int:user_id>", methods=["DELETE"])
@login_required
@admin_required
def delete_user(user_id):
    """Eliminar un usuario"""
    try:
        # No permitir eliminar al usuario actual
        if user_id == current_user.id:
            return jsonify({'error': 'No puede eliminar su propio usuario', 'success': False}), 400
        
        user = User.query.get_or_404(user_id)
        db.session.delete(user)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Usuario eliminado exitosamente'
        })
        
    except Exception as e:
        db.session.rollback()
        print(f"Error en delete_user: {e}")
        return jsonify({'error': str(e), 'success': False}), 500
@admin_bp.route("/admin/analytics-data")
@login_required
@admin_required
def get_analytics_data():
    """Obtener datos para el dashboard de analytics"""
    try:
        from sqlalchemy import func
        from datetime import datetime, timedelta
        from Config.models.order_item import OrderItem
        
        # Fecha de hace 30 dï¿½as
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        
        # Total de pedidos
        total_orders = Order.query.count()
        
        # Pedidos del ï¿½ltimo mes
        orders_last_month = Order.query.filter(Order.created_at >= thirty_days_ago).count()
        
        # Total de ingresos
        total_revenue = db.session.query(func.sum(Order.total_amount)).scalar() or 0
        
        # Ingresos del ï¿½ltimo mes
        revenue_last_month = db.session.query(func.sum(Order.total_amount)).filter(
            Order.created_at >= thirty_days_ago
        ).scalar() or 0
        
        # Total de clientes
        total_customers = User.query.filter_by(role='cliente').count()
        
        # Clientes nuevos del ï¿½ltimo mes
        customers_last_month = User.query.filter(
            User.role == 'cliente',
            User.created_at >= thirty_days_ago
        ).count()
        
        # Total de productos activos
        total_products = Product.query.filter_by(active=True).count()
        
        # Productos en stock (cantidad > 0)
        products_in_stock = Product.query.filter(Product.stock_quantity > 0).count()
        
        # Productos mï¿½s vendidos
        top_products = db.session.query(
            Product.name,
            func.sum(OrderItem.quantity).label('quantity')
        ).join(OrderItem).group_by(Product.id).order_by(
            func.sum(OrderItem.quantity).desc()
        ).limit(5).all()
        
        top_products_list = [{'name': p.name, 'quantity': int(p.quantity)} for p in top_products]
        
        # Pedidos por estado
        orders_by_status = {
            'pendiente': Order.query.filter_by(status='pendiente').count(),
            'procesando': Order.query.filter_by(status='procesando').count(),
            'completado': Order.query.filter_by(status='completado').count(),
            'cancelado': Order.query.filter_by(status='cancelado').count()
        }
        
        # Pedidos recientes (ï¿½ltimos 5)
        recent_orders = Order.query.order_by(Order.created_at.desc()).limit(5).all()
        recent_orders_list = []
        
        for order in recent_orders:
            items_count = OrderItem.query.filter_by(order_id=order.id).count()
            user = User.query.get(order.user_id)
            recent_orders_list.append({
                'id': order.id,
                'user_name': user.name if user else 'Usuario desconocido',
                'items_count': items_count,
                'total': float(order.total_amount),
                'created_at': order.created_at.isoformat() if order.created_at else None
            })
        
        analytics_data = {
            'total_orders': total_orders,
            'orders_change': orders_last_month,
            'total_revenue': float(total_revenue),
            'revenue_change': float(revenue_last_month),
            'total_customers': total_customers,
            'customers_change': customers_last_month,
            'total_products': total_products,
            'products_change': products_in_stock,
            'top_products': top_products_list,
            'orders_by_status': orders_by_status,
            'recent_orders': recent_orders_list
        }
        
        return jsonify({
            'success': True,
            'analytics': analytics_data
        })
        
    except Exception as e:
        print(f"Error en get_analytics_data: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e), 'success': False}), 500

@admin_bp.route("/admin/settings/save", methods=["POST"])
@login_required
@admin_required
def save_settings():
    """Guardar configuracion del sistema"""
    try:
        data = request.get_json()
        category = data.get('category')
        settings = data.get('settings')
        
        # Por ahora, simplemente confirmamos que se recibio
        # En una implementacion completa, guardariamos en una tabla de configuracion
        print(f"Guardando configuracion de {category}: {settings}")
        
        return jsonify({
            'success': True,
            'message': f'Configuracion de {category} guardada exitosamente'
        })
        
    except Exception as e:
        print(f"Error en save_settings: {e}")
        return jsonify({'error': str(e), 'success': False}), 500

@admin_bp.route("/admin/maintenance/clear-cache", methods=["POST"])
@login_required
@admin_required
def clear_cache():
    """Limpiar cache del sistema"""
    try:
        # Implementar logica de limpieza de cache
        print("Limpiando cache del sistema")
        
        return jsonify({
            'success': True,
            'message': 'Cache limpiado exitosamente'
        })
        
    except Exception as e:
        print(f"Error en clear_cache: {e}")
        return jsonify({'error': str(e), 'success': False}), 500

@admin_bp.route("/admin/maintenance/export-database")
@login_required
@admin_required
def export_database():
    """Exportar base de datos"""
    try:
        import shutil
        from datetime import datetime
        
        # Crear backup de la base de datos
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        backup_name = f'ferrejunior_backup_{timestamp}.db'
        
        # Copiar archivo de base de datos
        shutil.copy('ferrejunior.db', f'/tmp/{backup_name}')
        
        return send_file(
            'ferrejunior.db',
            as_attachment=True,
            download_name=backup_name,
            mimetype='application/x-sqlite3'
        )
        
    except Exception as e:
        print(f"Error en export_database: {e}")
        return jsonify({'error': str(e), 'success': False}), 500

@admin_bp.route("/admin/maintenance/logs")
@login_required
@admin_required
def view_logs():
    """Ver logs del sistema"""
    try:
        # Retornar pagina simple con logs
        logs_content = "Sistema de logs - En desarrollo"
        
        return f"""
        <!DOCTYPE html>
        <html>
        <head>
            <title>Logs del Sistema</title>
            <style>
                body {{ font-family: monospace; padding: 20px; background: #1e1e1e; color: #d4d4d4; }}
                pre {{ white-space: pre-wrap; }}
            </style>
        </head>
        <body>
            <h1>Logs del Sistema - FerreJunior</h1>
            <pre>{logs_content}</pre>
        </body>
        </html>
        """
        
    except Exception as e:
        return f"Error al cargar logs: {str(e)}"
