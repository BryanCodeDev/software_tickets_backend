-- Duvy Class Database Schema
-- Run this script in MySQL to set up the database

-- Create database
CREATE DATABASE IF NOT EXISTS duvy_class;
USE duvy_class;

-- Roles table
CREATE TABLE Roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  level INT NOT NULL,
  description TEXT
);

-- Users table
CREATE TABLE Users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(100),
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  department VARCHAR(100),
  it VARCHAR(50),
  roleId INT NOT NULL,
  isActive BOOLEAN DEFAULT TRUE,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (roleId) REFERENCES Roles(id)
);

-- Tickets table
CREATE TABLE Tickets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  priority ENUM('baja', 'media', 'alta') NOT NULL,
  status ENUM('abierto', 'en progreso', 'resuelto', 'cerrado') DEFAULT 'abierto',
  userId INT NOT NULL,
  assignedTo INT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES Users(id),
  FOREIGN KEY (assignedTo) REFERENCES Users(id)
);

-- Inventory table
CREATE TABLE Inventories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  propiedad VARCHAR(255) NOT NULL,
  it VARCHAR(50) NOT NULL,
  area VARCHAR(255) NOT NULL,
  responsable VARCHAR(255) NOT NULL,
  serial VARCHAR(255) NOT NULL,
  capacidad VARCHAR(100) NOT NULL,
  ram VARCHAR(50) NOT NULL,
  marca VARCHAR(100) NOT NULL,
  status ENUM('disponible', 'en uso', 'mantenimiento', 'fuera de servicio') DEFAULT 'disponible',
  assignedTo INT,
  location VARCHAR(255),
  warrantyExpiry DATE,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (assignedTo) REFERENCES Users(id)
);

-- Documents table
CREATE TABLE Documents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  filePath VARCHAR(500) NOT NULL,
  version VARCHAR(10) DEFAULT 'v1',
  type VARCHAR(100),
  category VARCHAR(100),
  expiryDate DATE,
  createdBy INT NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (createdBy) REFERENCES Users(id)
);

-- Credentials table
CREATE TABLE Credentials (
  id INT AUTO_INCREMENT PRIMARY KEY,
  service VARCHAR(255) NOT NULL,
  username VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  area VARCHAR(100),
  description TEXT,
  createdBy INT NOT NULL,
  updatedBy INT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (createdBy) REFERENCES Users(id),
  FOREIGN KEY (updatedBy) REFERENCES Users(id)
);

-- Comments table
CREATE TABLE Comments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  content TEXT NOT NULL,
  ticketId INT NOT NULL,
  userId INT NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (ticketId) REFERENCES Tickets(id),
  FOREIGN KEY (userId) REFERENCES Users(id)
);

-- User Settings table
CREATE TABLE UserSettings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL UNIQUE,
  notifications BOOLEAN DEFAULT TRUE,
  emailAlerts BOOLEAN DEFAULT TRUE,
  darkMode BOOLEAN DEFAULT FALSE,
  language VARCHAR(10) DEFAULT 'es',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE
);

-- Attachments table for tickets
CREATE TABLE TicketAttachments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  filename VARCHAR(255) NOT NULL,
  originalName VARCHAR(255) NOT NULL,
  type VARCHAR(100) NOT NULL,
  size INT NOT NULL,
  path VARCHAR(500) NOT NULL,
  ticketId INT NOT NULL,
  uploadedBy INT NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ticketId) REFERENCES Tickets(id),
  FOREIGN KEY (uploadedBy) REFERENCES Users(id)
);

-- History table
CREATE TABLE Histories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  action VARCHAR(50) NOT NULL,
  tableName VARCHAR(50) NOT NULL,
  recordId INT NOT NULL,
  oldValues JSON,
  newValues JSON,
  userId INT NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES Users(id)
);

-- Insert initial roles
INSERT INTO Roles (name, level, description) VALUES
('Administrador', 4, 'Control total del sistema'),
('Técnico', 2, 'Atiende tickets y consulta inventario'),
('Empleado', 1, 'Crea tickets y consulta documentos');

-- Insert demo users (password: 'password' - hashed with bcrypt)
INSERT INTO Users (username, name, email, phone, department, password, roleId, isActive) VALUES
('admin', 'Carlos Rodríguez', 'admin@duvyclass.com', '+57 300 123 4567', 'Sistemas', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 1, TRUE),
('tecnico', 'María González', 'tecnico@duvyclass.com', '+57 301 234 5678', 'Tecnología', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 2, TRUE),
('empleado', 'Juan Pérez', 'empleado@duvyclass.com', '+57 302 345 6789', 'Ventas', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 3, TRUE);

-- Insert additional sample users
INSERT INTO Users (username, name, email, phone, department, password, roleId, isActive) VALUES
('admin2', 'Ana López', 'ana.lopez@duvyclass.com', '+57 303 456 7890', 'Recursos Humanos', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 1, TRUE),
('tecnico2', 'Pedro Martínez', 'pedro.martinez@duvyclass.com', '+57 304 567 8901', 'Tecnología', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 2, TRUE),
('empleado2', 'Laura Sánchez', 'laura.sanchez@duvyclass.com', '+57 305 678 9012', 'Marketing', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 3, TRUE),
('empleado3', 'Roberto Díaz', 'roberto.diaz@duvyclass.com', '+57 306 789 0123', 'Contabilidad', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 3, TRUE),
('empleado4', 'Sofia Ramírez', 'sofia.ramirez@duvyclass.com', '+57 307 890 1234', 'Logística', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 3, TRUE),
('empleado5', 'Miguel Torres', 'miguel.torres@duvyclass.com', '+57 308 901 2345', 'Producción', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 3, TRUE),
('empleado6', 'Elena Vargas', 'elena.vargas@duvyclass.com', '+57 309 012 3456', 'Calidad', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 3, TRUE),
('empleado7', 'Diego Morales', 'diego.morales@duvyclass.com', '+57 310 123 4567', 'Compras', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 3, TRUE),
('supervisor', 'Gabriela Ruiz', 'gabriela.ruiz@duvyclass.com', '+57 311 234 5678', 'Operaciones', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 1, TRUE),
('gerente', 'Fernando Castro', 'fernando.castro@duvyclass.com', '+57 312 345 6789', 'Dirección', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 1, TRUE),
('auditor', 'Héctor Morales', 'hector.morales@duvyclass.com', '+57 313 456 7890', 'Auditoría', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 2, TRUE),
('consultor', 'Isabel Torres', 'isabel.torres@duvyclass.com', '+57 314 567 8901', 'Consultoría', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 3, TRUE),
('soporte', 'Javier Ruiz', 'javier.ruiz@duvyclass.com', '+57 315 678 9012', 'Soporte', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 2, TRUE),
('desarrollador', 'Karla Mendoza', 'karla.mendoza@duvyclass.com', '+57 316 789 0123', 'Desarrollo', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 1, TRUE),
('analista', 'Luis García', 'luis.garcia@duvyclass.com', '+57 317 890 1234', 'Análisis', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 2, TRUE);

-- Insert sample inventory data (10 examples)
INSERT INTO Inventories (propiedad, it, area, responsable, serial, capacidad, ram, marca, status, location, warrantyExpiry, assignedTo) VALUES
('PROPIO', 'IT070', 'MATERIA PRIMA', 'Oscar', 'MP1AP4S', '512GB', '4GB', 'Lenovo', 'disponible', 'Oficina 101', '2026-12-31', 3),
('PROPIO', 'IT071', 'VENTAS', 'María', 'VS2BP5T', '1TB', '8GB', 'Dell', 'en uso', 'Oficina 102', '2027-06-15', 3),
('PROPIO', 'IT072', 'CONTABILIDAD', 'Carlos', 'CT3CP6U', '256GB', '16GB', 'HP', 'mantenimiento', 'Oficina 103', '2025-08-20', 2),
('PROPIO', 'IT073', 'RECURSOS HUMANOS', 'Ana', 'RH4DP7V', '512GB', '8GB', 'Lenovo', 'disponible', 'Oficina 104', '2026-03-10', 3),
('PROPIO', 'IT074', 'SISTEMAS', 'Pedro', 'SY5EP8W', '2TB', '32GB', 'Dell', 'en uso', 'Servidor Room', '2028-01-25', 2),
('PROPIO', 'IT075', 'MARKETING', 'Laura', 'MK6FP9X', '1TB', '16GB', 'Apple', 'disponible', 'Oficina 105', '2027-09-30', 3),
('PROPIO', 'IT076', 'LOGISTICA', 'Roberto', 'LG7GP0Y', '512GB', '8GB', 'HP', 'fuera de servicio', 'Almacén', '2025-12-15', 3),
('PROPIO', 'IT077', 'GERENCIA', 'Sofia', 'GE8HP1Z', '1TB', '16GB', 'Lenovo', 'en uso', 'Oficina Principal', '2026-11-20', 1),
('PROPIO', 'IT078', 'CALIDAD', 'Miguel', 'CA9IP2A', '256GB', '8GB', 'Dell', 'disponible', 'Laboratorio', '2027-04-05', 2),
('PROPIO', 'IT079', 'COMPRAS', 'Elena', 'CO0JP3B', '512GB', '12GB', 'HP', 'en uso', 'Oficina 106', '2026-07-18', 3);

-- Insert sample tickets data (10 examples)
INSERT INTO Tickets (title, description, category, priority, status, userId, assignedTo) VALUES
('Problemas con SAMP', 'El sistema SAMP no responde correctamente en las estaciones de trabajo.', 'Software', 'media', 'abierto', 3, 2),
('Problemas con impresoras', 'La impresora no responde y muestra error de conexión. Está ubicada en el área de contabilidad.', 'Hardware', 'media', 'abierto', 3, 2),
('Problemas con contraseña', 'Usuario no puede acceder al sistema debido a problemas con la contraseña.', 'Usuario', 'alta', 'en progreso', 3, 2),
('Problemas con Heinsohn', 'El sistema Heinsohn presenta errores de sincronización.', 'Software', 'alta', 'en progreso', 3, 2),
('Problemas con Excel, Word, PDF', 'Los archivos de Office no se abren correctamente en algunas estaciones.', 'Software', 'media', 'abierto', 3, 2),
('Problemas con acceso a carpetas', 'Usuarios no pueden acceder a carpetas compartidas en la red.', 'Red', 'media', 'cerrado', 3, 2),
('Problemas con el navegador', 'El navegador web no carga páginas correctamente.', 'Software', 'baja', 'resuelto', 3, 1),
('Mantenimiento preventivo de servidores', 'Realizar mantenimiento preventivo en los servidores del data center.', 'Hardware', 'alta', 'en progreso', 2, 2),
('Configuración de VPN', 'Configurar acceso VPN para empleados que trabajan desde casa.', 'Red', 'media', 'resuelto', 3, 1),
('Actualización de Windows', 'Actualizar sistema operativo Windows en 10 estaciones de trabajo.', 'Software', 'media', 'en progreso', 3, 2);

-- Insert sample documents data (10 examples)
INSERT INTO Documents (title, description, filePath, version, type, category, expiryDate, createdBy) VALUES
('Manual de Procedimientos IT', 'Documento con todos los procedimientos de TI de la empresa', '/uploads/manuales/manual_it_v1.docx', 'v1.0', 'Word', 'Procedimientos', '2026-12-31', 1),
('Política de Seguridad Informática', 'Políticas de seguridad y mejores prácticas', '/uploads/politicas/seguridad_v2.pdf', 'v2.0', 'PDF', 'Seguridad', '2027-06-30', 1),
('Diagrama de Red Corporativa', 'Esquema completo de la infraestructura de red', '/uploads/diagramas/red_corporativa_v1.png', 'v1.0', 'Imagen', 'Infraestructura', '2026-12-31', 2),
('Manual de Usuario Office 365', 'Guía de uso de Office 365 para empleados', '/uploads/manuales/office365_v1.pdf', 'v1.0', 'PDF', 'Software', '2027-03-15', 2),
('Contrato de Mantenimiento Servidores', 'Contrato con proveedor de mantenimiento', '/uploads/contratos/mantenimiento_servidores.pdf', 'v1.0', 'PDF', 'Contratos', '2026-08-20', 1),
('Lista de Inventario 2025', 'Inventario completo de equipos tecnológicos', '/uploads/inventarios/lista_2025.xlsx', 'v1.0', 'Excel', 'Inventario', '2025-12-31', 2),
('Procedimiento de Backup', 'Procedimientos para respaldos de datos', '/uploads/procedimientos/backup_v1.docx', 'v1.0', 'Word', 'Procedimientos', '2026-10-15', 2),
('Certificado SSL Empresa', 'Certificado SSL para sitio web corporativo', '/uploads/certificados/ssl_empresa.crt', 'v1.0', 'Certificado', 'Seguridad', '2026-05-10', 1),
('Manual de Configuración VPN', 'Guía para configurar acceso VPN', '/uploads/manuales/vpn_config_v1.pdf', 'v1.0', 'PDF', 'Redes', '2027-01-20', 2),
('Política de Uso Aceptable', 'Reglas de uso de recursos tecnológicos', '/uploads/politicas/uso_aceptable_v1.docx', 'v1.0', 'Word', 'Políticas', '2026-09-30', 1);

-- Insert sample credentials data (10 examples)
INSERT INTO Credentials (service, username, password, area, description, createdBy) VALUES
('Office 365 Admin', 'admin@duvyclass.com', 'P@ssw0rd2025!', 'Sistemas', 'Cuenta administrativa de Office 365', 1),
('Router Principal', 'admin', 'R0ut3rP@ss2025', 'Redes', 'Acceso al router Cisco principal', 2),
('Servidor SQL', 'sa', 'SQLS3rv3r2025#', 'Base de Datos', 'Cuenta SA del servidor SQL Server', 2),
('Cuenta Google Workspace', 'admin@duvyclass.com', 'G00gl3W5P@ss', 'Administración', 'Cuenta administrativa de Google Workspace', 1),
('Firewall Palo Alto', 'firewall_admin', 'P@lo@lt0F1r3', 'Seguridad', 'Acceso administrativo al firewall', 2),
('Cuenta AWS', 'duvyclass_admin', 'AWS@dm1n2025!', 'Cloud', 'Cuenta administrativa de AWS', 1),
('Servidor FTP', 'ftp_user', 'FTP@ccess2025', 'Transferencias', 'Cuenta para transferencias de archivos', 2),
('Cuenta GitHub', 'duvyclass-it', 'G1tH@bT0k3n', 'Desarrollo', 'Cuenta organizacional de GitHub', 2),
('Base de Datos MySQL', 'root', 'MySQLR00t2025#', 'Base de Datos', 'Cuenta root de MySQL', 2),
('Cuenta Correo Corporativo', 'it@duvyclass.com', 'C0rr30C0rp2025', 'Comunicaciones', 'Cuenta de correo del departamento IT', 1);

-- Insert sample comments data (10 examples)
INSERT INTO Comments (content, ticketId, userId) VALUES
('He revisado el problema con la impresora. Parece ser un problema de driver. Voy a reinstalar el software.', 1, 2),
('El usuario reporta que la conexión a internet se restableció después de reiniciar el router.', 4, 2),
('Se completó la instalación de Office 365 en las 5 laptops solicitadas. Todos los usuarios pueden acceder.', 5, 2),
('El scanner ha sido calibrado y ya funciona correctamente. Se realizó limpieza de cabezales.', 9, 2),
('Actualización de Windows completada en 8 de 10 estaciones. Las 2 restantes requieren reinicio manual.', 10, 2),
('Se configuró la cuenta VPN para el empleado. Se envió el manual de conexión por email.', 8, 1),
('Mantenimiento preventivo completado en servidores principales. Todos los servicios funcionando normalmente.', 8, 2),
('El antivirus se actualizó correctamente en todas las estaciones del área de ventas.', 2, 2),
('Se creó la nueva cuenta de usuario para el departamento de marketing con todos los permisos necesarios.', 3, 1),
('Problema con Outlook resuelto. Se sincronizaron todos los emails pendientes.', 6, 2);

-- Insert sample user settings data (10 examples)
INSERT INTO UserSettings (userId, notifications, emailAlerts, darkMode, language) VALUES
(1, TRUE, TRUE, FALSE, 'es'),
(2, TRUE, TRUE, TRUE, 'es'),
(3, TRUE, FALSE, FALSE, 'es'),
(4, FALSE, TRUE, FALSE, 'es'),
(5, TRUE, TRUE, FALSE, 'es'),
(6, TRUE, FALSE, TRUE, 'es'),
(7, FALSE, FALSE, FALSE, 'es'),
(8, TRUE, TRUE, TRUE, 'es'),
(9, TRUE, TRUE, FALSE, 'es'),
(10, FALSE, TRUE, FALSE, 'es');

-- Insert sample ticket attachments data (10 examples)
INSERT INTO TicketAttachments (filename, originalName, type, size, path, ticketId, uploadedBy) VALUES
('captura_error_impresora.png', 'error_printer.png', 'image/png', 245760, '/uploads/tickets/1/captura_error_impresora.png', 1, 3),
('log_conexion_internet.txt', 'internet_log.txt', 'text/plain', 15360, '/uploads/tickets/4/log_conexion_internet.txt', 4, 3),
('manual_office365.pdf', 'office_manual.pdf', 'application/pdf', 2097152, '/uploads/tickets/5/manual_office365.pdf', 5, 2),
('configuracion_scanner.pdf', 'scanner_config.pdf', 'application/pdf', 1048576, '/uploads/tickets/9/configuracion_scanner.pdf', 9, 2),
('reporte_actualizacion_windows.docx', 'windows_update_report.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 524288, '/uploads/tickets/10/reporte_actualizacion_windows.docx', 10, 2),
('manual_vpn_config.pdf', 'vpn_manual.pdf', 'application/pdf', 1572864, '/uploads/tickets/8/manual_vpn_config.pdf', 8, 1),
('reporte_mantenimiento_servidores.pdf', 'maintenance_report.pdf', 'application/pdf', 3145728, '/uploads/tickets/8/reporte_mantenimiento_servidores.pdf', 8, 2),
('log_actualizacion_antivirus.txt', 'antivirus_update_log.txt', 'text/plain', 32768, '/uploads/tickets/2/log_actualizacion_antivirus.txt', 2, 2),
('credenciales_nuevo_usuario.pdf', 'new_user_credentials.pdf', 'application/pdf', 131072, '/uploads/tickets/3/credenciales_nuevo_usuario.pdf', 3, 1),
('backup_correo_outlook.pst', 'outlook_backup.pst', 'application/vnd.ms-outlook', 10485760, '/uploads/tickets/6/backup_correo_outlook.pst', 6, 2);

-- Insert sample histories data (10 examples)
INSERT INTO Histories (action, tableName, recordId, oldValues, newValues, userId) VALUES
('CREATE', 'Tickets', 1, NULL, '{"title":"Problema con impresora HP LaserJet","status":"abierto"}', 3),
('UPDATE', 'Tickets', 4, '{"status":"abierto"}', '{"status":"en progreso"}', 2),
('UPDATE', 'Tickets', 5, '{"status":"abierto"}', '{"status":"resuelto"}', 2),
('CREATE', 'Inventories', 1, NULL, '{"propiedad":"PROPIO","status":"disponible"}', 3),
('UPDATE', 'Inventories', 2, '{"status":"disponible"}', '{"status":"en uso"}', 3),
('CREATE', 'Credentials', 1, NULL, '{"service":"Office 365 Admin"}', 1),
('UPDATE', 'Users', 3, '{"department":"Ventas"}', '{"department":"Marketing"}', 1),
('DELETE', 'Comments', 1, '{"content":"Comentario de prueba"}', NULL, 2),
('UPDATE', 'Tickets', 6, '{"status":"abierto"}', '{"status":"cerrado"}', 2),
('CREATE', 'Documents', 1, NULL, '{"title":"Manual de Procedimientos IT"}', 1);

-- Note: The password hash above is for 'password'. In production, use bcrypt to hash passwords.