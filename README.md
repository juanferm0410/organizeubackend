# 🗓️ Agenda-Backend  

![Node.js](https://img.shields.io/badge/Node.js-18.x-339933?logo=node.js)
![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?logo=mongodb)
![JWT](https://img.shields.io/badge/Auth-JWT-orange?logo=jsonwebtokens)
![bcrypt](https://img.shields.io/badge/Security-BCrypt-blue?logo=auth0)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

API REST para **gestión de agenda médica**.  
Permite **administrar pacientes, doctores y citas médicas**, con autenticación **JWT**, hash seguro de contraseñas, y arquitectura modular en **Node.js + Express + MongoDB**.

---

## 🧩 Estructura del proyecto

```bash
agenda-backend/
├── src/
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── appointment.controller.js
│   │   ├── patient.controller.js
│   │   └── doctor.controller.js
│   ├── services/
│   │   ├── auth.service.js
│   │   ├── appointment.service.js
│   │   ├── patient.service.js
│   │   └── doctor.service.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Doctor.js
│   │   ├── Patient.js
│   │   └── Appointment.js
│   ├── middlewares/
│   │   ├── auth.middleware.js
│   │   ├── error.middleware.js
│   │   └── validate.middleware.js
│   ├── utils/
│   │   ├── jwt.js
│   │   └── logger.js
│   ├── config/
│   │   ├── db.js
│   │   └── env.js
│   └── app.js
├── .env
├── package.json
├── README.md
└── server.js
```

> 🧠 **Arquitectura limpia y desacoplada:** controladores livianos, servicios con la lógica de negocio, modelos Mongoose, validaciones centralizadas y middlewares reutilizables.

---

## 🛠️ Requisitos previos

- 🧱 **Node.js v18+**
- 🍃 **MongoDB** (local o Atlas)
- 🧩 **npm** o **yarn**
- 🧪 (Opcional) **Postman / Insomnia / curl** para pruebas

---

## 🔐 Variables de entorno

Crea un archivo `.env` en la raíz del proyecto con el siguiente contenido:

```dotenv
# Servidor
PORT=4000
NODE_ENV=development

# Base de datos
MONGO_URI=mongodb://localhost:27017/agendaDB

# JWT
JWT_SECRET=mi_clave_ultrasecreta_para_tokens_segura_123456789
JWT_EXPIRES_IN=1h

# Configuración adicional
LOG_LEVEL=info
```

> ⚠️ **Importante:**  
> - Mantén la clave `JWT_SECRET` fuera del repositorio.  
> - Usa gestores de secretos (como **AWS Secrets Manager**, **Azure KeyVault**, etc.) en producción.  

---

## ▶️ Ejecución local

```bash
# 1. Clonar el repositorio
git clone https://github.com/jorgelmunozp/agenda-backend.git
cd agenda-backend

# 2. Instalar dependencias
npm install

# 3. Ejecutar en modo desarrollo
npm run dev

# 4. O en modo producción
npm start
```

La API estará disponible en:  
👉 `http://localhost:4000`

---

## 🔑 Autenticación JWT

La API usa **JSON Web Tokens** para proteger los endpoints.  
Para acceder a recursos restringidos, incluye el encabezado:

```
Authorization: Bearer <tu_token_jwt>
```

### 🧾 Registro (`POST /api/auth/register`)
```bash
curl -X POST http://localhost:4000/api/auth/register   -H "Content-Type: application/json"   -d '{
    "name": "Jorge Muñoz",
    "email": "jorge@example.com",
    "password": "123456",
    "role": "doctor"
  }'
```

### 🔐 Inicio de sesión (`POST /api/auth/login`)
```bash
curl -X POST http://localhost:4000/api/auth/login   -H "Content-Type: application/json"   -d '{
    "email": "jorge@example.com",
    "password": "123456"
  }'
```

Respuesta:
```json
{
  "message": "Inicio de sesión exitoso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI..."
}
```

---

## 🏥 Endpoints principales

### 👩‍⚕️ Doctores (`/api/doctors`)
| Método | Endpoint | Descripción |
|--------|-----------|-------------|
| GET | `/api/doctors` | Lista todos los doctores |
| GET | `/api/doctors/:id` | Obtiene un doctor por ID |
| POST | `/api/doctors` | Crea un nuevo doctor |
| PUT | `/api/doctors/:id` | Actualiza la información de un doctor |
| DELETE | `/api/doctors/:id` | Elimina un doctor (solo admin) |

---

### 👨‍🦰 Pacientes (`/api/patients`)
| Método | Endpoint | Descripción |
|--------|-----------|-------------|
| GET | `/api/patients` | Lista todos los pacientes |
| GET | `/api/patients/:id` | Obtiene un paciente |
| POST | `/api/patients` | Registra un paciente |
| PUT | `/api/patients/:id` | Actualiza datos del paciente |
| DELETE | `/api/patients/:id` | Elimina un paciente |

---

### 📅 Citas médicas (`/api/appointments`)
| Método | Endpoint | Descripción |
|--------|-----------|-------------|
| GET | `/api/appointments` | Lista las citas (filtros: doctorId, patientId, fecha, estado) |
| GET | `/api/appointments/:id` | Obtiene una cita específica |
| POST | `/api/appointments` | Crea una nueva cita |
| PUT | `/api/appointments/:id` | Actualiza una cita existente |
| DELETE | `/api/appointments/:id` | Cancela o elimina una cita |

Ejemplo de creación:
```bash
curl -X POST http://localhost:4000/api/appointments   -H "Authorization: Bearer <TOKEN>"   -H "Content-Type: application/json"   -d '{
    "doctorId": "6710f8d3f4b2e7a1a4d3c001",
    "patientId": "6710f8eaf4b2e7a1a4d3c002",
    "date": "2025-11-02T14:30:00Z",
    "reason": "Chequeo general"
  }'
```

---

## ⚙️ Características técnicas

- **🔒 Seguridad:**  
  - Autenticación y autorización con JWT.  
  - Contraseñas encriptadas con **bcrypt**.  
  - Validación exhaustiva de datos.  

- **🧩 Arquitectura modular:**  
  - Controladores delgados y reutilizables.  
  - Servicios con lógica de negocio independiente.  
  - Middlewares personalizados (autenticación, errores, validación).  

- **📦 Persistencia:**  
  - **MongoDB + Mongoose** para modelado flexible.  
  - Relaciones entre usuarios, doctores, pacientes y citas.  

- **🧠 Validación:**  
  - Validaciones por esquema (por ejemplo, Joi o express-validator).  
  - Sanitización de entradas.  

- **🧾 Logs y errores:**  
  - Middleware global para manejo de errores (`error.middleware.js`).  
  - Sistema de logs con niveles configurables (`logger.js`).  

- **🧪 Pruebas:**  
  - Configurable para Jest o Mocha + Supertest.  
  - Pruebas unitarias y de integración para controladores y servicios.  

- **🚀 Preparado para producción:**  
  - Scripts `npm run build` y `npm start`.  
  - Configuración de variables de entorno y despliegue en Docker o servidores cloud.  

---

## 🧰 Scripts disponibles

```bash
npm run dev      # Ejecuta el servidor en modo desarrollo
npm start        # Ejecuta en producción
npm run lint     # Ejecuta eslint para mantener código limpio
npm test         # Ejecuta pruebas (si están configuradas)
```

---

## 📘 Ejemplo de flujo completo

1. Registrar un usuario → `/api/auth/register`
2. Iniciar sesión → recibir token JWT
3. Crear doctor y paciente
4. Crear una cita vinculando ambos
5. Listar citas filtradas por doctor o paciente

---

## 🧠 Próximos pasos

- 🔁 **Refresh tokens** para mantener sesiones activas.  
- 🧱 **Caché** con Redis para citas recurrentes.  
- 📈 **Swagger / OpenAPI** para documentación interactiva.  
- ⚙️ **CI/CD con GitHub Actions** para despliegue automatizado.  
- 🔍 **Pruebas automatizadas completas** con cobertura de servicios y controladores.  
- 🩺 **Integración de notificaciones** (email o SMS) para recordatorios de citas.  

---

## 👨‍💻 Autor

**Jorge Luis Muñoz Pabón**  
📦 Repositorio: [https://github.com/jorgelmunozp/agenda-backend](https://github.com/jorgelmunozp/agenda-backend)  
🗓️ Proyecto backend para administración y control de agendas médicas, diseñado con las mejores prácticas y enfoque escalable.

---
