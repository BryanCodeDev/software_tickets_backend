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
('empleado7', 'Diego Morales', 'diego.morales@duvyclass.com', '+57 310 123 4567', 'Compras', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 3, TRUE);

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
('Problema con impresora HP LaserJet', 'La impresora no responde y muestra error de conexión. Está ubicada en el área de contabilidad.', 'Hardware', 'media', 'abierto', 3, 2),
('Actualización de software antivirus', 'Es necesario actualizar el antivirus en todas las estaciones de trabajo del área de ventas.', 'Software', 'alta', 'en progreso', 3, 2),
('Configuración de nuevo usuario', 'Crear cuenta de usuario para el nuevo empleado del departamento de marketing.', 'Usuario', 'baja', 'resuelto', 3, 1),
('Falla en conexión a internet', 'Varias estaciones no pueden acceder a internet. Problema en el router principal.', 'Red', 'alta', 'en progreso', 3, 2),
('Instalación de Office 365', 'Instalar suite de Office 365 en 5 nuevas laptops del área de sistemas.', 'Software', 'media', 'abierto', 3, 2),
('Problema con Outlook', 'El cliente de correo electrónico no sincroniza correctamente los emails.', 'Software', 'media', 'cerrado', 3, 2),
('Mantenimiento preventivo de servidores', 'Realizar mantenimiento preventivo en los servidores del data center.', 'Hardware', 'alta', 'en progreso', 2, 2),
('Configuración de VPN', 'Configurar acceso VPN para empleados que trabajan desde casa.', 'Red', 'media', 'resuelto', 3, 1),
('Problema con scanner', 'El scanner multifunción no reconoce documentos. Necesita calibración.', 'Hardware', 'baja', 'abierto', 3, 2),
('Actualización de Windows', 'Actualizar sistema operativo Windows en 10 estaciones de trabajo.', 'Software', 'media', 'en progreso', 3, 2);

-- Insert sample documents data (1 example - Word document)
INSERT INTO Documents (title, description, filePath, version, type, category, expiryDate, createdBy) VALUES
('Manual de Procedimientos IT', 'Documento con todos los procedimientos de TI de la empresa', '/uploads/manuales/manual_it_v1.docx', 'v1.0', 'Word', 'Procedimientos', '2026-12-31', 1);

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

-- Note: The password hash above is for 'password'. In production, use bcrypt to hash passwords.