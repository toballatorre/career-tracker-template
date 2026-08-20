# Career Tracker Template

Plantilla open source para gestionar, registrar y analizar una búsqueda laboral utilizando **Google Sheets** y **Google Apps Script**.

El proyecto permite centralizar empresas, postulaciones, estados, historial de eventos y métricas de búsqueda laboral en una única herramienta.

Está diseñado para ser utilizado como plantilla, adaptado a diferentes procesos de búsqueda laboral y modificado libremente según las necesidades de cada usuario.

## Características

* Generación automática de IDs para empresas, postulaciones e historial.
* Registro centralizado de empresas.
* Registro y seguimiento de postulaciones.
* Asociación automática entre empresas, estados y sus respectivos IDs.
* Historial automático de cambios de estado.
* Registro de eventos asociados a cada estado.
* Actualización del historial cuando cambia la empresa o el cargo de una candidatura.
* Indicadores de búsqueda laboral.
* Cálculo de conversiones entre etapas.
* Análisis por período.
* Arquitectura modular mediante archivos `.gs`.
* Uso de servicios nativos de Google Apps Script.
* Sin dependencia de Google Sheets API.

---

## Estructura del proyecto

```text
career-tracker-template/
│
├── README.md
├── LICENSE
├── .gitignore
│
└── src/
    ├── Router.gs
    ├── Empresas.gs
    ├── Postulaciones.gs
    ├── Historial.gs
    └── Metricas.gs
```

---

## Módulos

### Router.gs

Es el punto central de entrada para las ediciones realizadas en Google Sheets.

Utiliza un único `onEdit(e)` y distribuye los eventos al módulo correspondiente.

Actualmente gestiona:

* `Postulaciones`
* `Empresas`
* `Metricas`

Esto evita tener múltiples funciones `onEdit()` independientes dentro del proyecto.

---

### Empresas.gs

Gestiona automáticamente la tabla `Empresas`.

Cuando se agrega una empresa nueva, genera automáticamente un identificador único.

Formato:

```text
EMP-0001
EMP-0002
EMP-0003
```

También comprueba si ya existe una empresa con el mismo nombre antes de generar un nuevo ID.

Estructura:

| Columna | Campo     |
| ------- | --------- |
| A       | ID        |
| B       | Name      |
| C       | Tipo      |
| D       | Industria |
| E       | Pais      |
| F       | Rol       |
| G       | Fuente    |
| H       | Notas     |

---

### Postulaciones.gs

Gestiona automáticamente la tabla `Postulaciones`.

Cuando se crea una nueva candidatura:

1. Genera un ID único.
2. Inserta la fórmula para obtener el ID de la empresa.
3. Inserta la fórmula para obtener el ID del estado.

Formato del ID:

```text
JOB-0001
JOB-0002
JOB-0003
```

Las asociaciones utilizan las tablas de Google Sheets mediante fórmulas `XLOOKUP`.

#### ID Empresa

```text
Empresa → Empresas[Name] → Empresas[ID]
```

#### ID Estado

```text
Estado → Estado_Postulacion[Name] → Estado_Postulacion[ID]
```

Estructura:

| Columna | Campo                 |
| ------- | --------------------- |
| A       | ID                    |
| B       | Fecha                 |
| C       | ID Empresa            |
| D       | Empresa               |
| E       | Cargo                 |
| F       | Link                  |
| G       | ID Estado             |
| H       | Estado                |
| I       | Fecha último contacto |
| J       | Próximo paso          |
| K       | Notas                 |

---

### Historial.gs

Registra automáticamente los eventos relevantes de cada candidatura.

Cada registro recibe un identificador único:

```text
HIS-0001
HIS-0002
HIS-0003
```

El historial conserva información de la candidatura y registra los cambios de estado.

Estructura:

| Columna | Campo          |
| ------- | -------------- |
| A       | ID             |
| B       | ID Candidatura |
| C       | Fecha          |
| D       | ID Empresa     |
| E       | Cargo          |
| F       | ID Estado      |
| G       | Evento         |

El evento se obtiene desde la tabla `Estado_Postulacion`.

### Estados disponibles

| ID       | Name                               | Evento                           |
| -------- | ---------------------------------- | -------------------------------- |
| EPO-0001 | Sin enviar                         | Candidatura creada               |
| EPO-0002 | Enviado, esperando respuesta       | Postulación enviada              |
| EPO-0003 | Primer contacto                    | Primer contacto recibido         |
| EPO-0004 | Entrevista (espera)                | Entrevista pendiente             |
| EPO-0005 | Entrevista (realizada)             | Entrevista realizada             |
| EPO-0006 | Entrevista técnica (espera)        | Entrevista técnica pendiente     |
| EPO-0007 | Entrevista técnica (realizada)     | Entrevista técnica realizada     |
| EPO-0008 | Entrevista psicológica (espera)    | Entrevista psicológica pendiente |
| EPO-0009 | Entrevista psicológica (realizada) | Entrevista psicológica realizada |
| EPO-0010 | Oferta                             | Oferta recibida                  |
| EPO-0011 | Rechazado                          | Candidatura rechazada            |
| EPO-0012 | Retirado                           | Candidatura retirada             |

Cuando se registra el primer evento de una candidatura, el historial utiliza la fecha definida en `Postulaciones` como fecha inicial del proceso.

Los eventos posteriores utilizan la fecha en que se registra el cambio.

Si cambia la empresa o el cargo de una candidatura, la información correspondiente se actualiza en los registros existentes de su historial.

---

### Metricas.gs

Calcula indicadores y conversiones de la búsqueda laboral utilizando los datos de `Historial` y `Postulaciones`.

#### Indicadores

* Postulaciones enviadas.
* Contactos recibidos.
* Entrevistas realizadas.
* Entrevistas técnicas.
* Entrevistas psicológicas.
* Ofertas.
* Rechazos.
* Retirados.
* Candidaturas activas.

Las entrevistas se mantienen separadas para permitir un análisis más preciso de cada etapa.

#### Candidaturas activas

Una candidatura se considera activa mientras su estado actual no sea:

* Oferta.
* Rechazado.
* Retirado.

#### Conversiones

Actualmente se calculan conversiones entre:

```text
Postulaciones enviadas
        ↓
Primer contacto
        ↓
Entrevista
        ↓
Entrevista técnica
        ↓
Entrevista psicológica
        ↓
Oferta
```

También se calculan conversiones de rechazo respecto de las postulaciones enviadas.

---

## Estructura de Google Sheets

La plantilla utiliza las siguientes hojas:

```text
Empresas
Postulaciones
Estado_Postulacion
Historial
Metricas
```

### Empresas

Catálogo de empresas utilizadas durante la búsqueda laboral.

### Postulaciones

Registro actual de cada candidatura.

### Estado_Postulacion

Catálogo de estados y eventos asociados.

### Historial

Registro histórico de los cambios de estado de las candidaturas.

### Metricas

Panel de análisis compuesto por período, indicadores y conversiones.

---

## Tablas de métricas

La estructura actual utiliza los siguientes rangos de datos:

```text
Periodo       → A2:B3
Indicadores   → D2:F10
Conversiones  → H2:J7
```

Estos rangos corresponden únicamente al área de datos de las tablas y no incluyen sus encabezados.

La lógica de `Metricas.gs` identifica las tablas por nombre, por lo que la ubicación física de las tablas puede cambiar siempre que se mantengan correctamente definidas.

---

## Instalación

### 1. Crear una copia de la plantilla

Crea una copia del documento de Google Sheets que contenga las hojas y tablas necesarias.

### 2. Abrir Apps Script

En Google Sheets:

**Extensiones → Apps Script**

### 3. Copiar los scripts

Copia los archivos del directorio `src/`:

```text
Router.gs
Empresas.gs
Postulaciones.gs
Historial.gs
Metricas.gs
```

### 4. Verificar las hojas

La plantilla debe conservar los nombres:

```text
Empresas
Postulaciones
Estado_Postulacion
Historial
Metricas
```

### 5. Verificar las tablas

Las tablas utilizadas por la automatización deben conservar sus nombres:

```text
Periodo
Indicadores
Conversiones
```

### 6. Guardar

Guarda el proyecto de Apps Script.

No es necesario configurar la Google Sheets API.

---

## Uso básico

### Crear una empresa

Agrega una empresa en la tabla `Empresas`.

El sistema generará automáticamente un ID:

```text
EMP-XXXX
```

### Crear una postulación

Agrega una nueva candidatura en `Postulaciones`.

El sistema generará:

```text
JOB-XXXX
```

Además, incorporará automáticamente las fórmulas para relacionar:

```text
Empresa → ID Empresa
Estado  → ID Estado
```

### Cambiar el estado

Selecciona un nuevo estado en la candidatura.

El sistema registrará automáticamente el evento correspondiente en `Historial`.

Por ejemplo:

```text
Enviado, esperando respuesta
            ↓
Postulación enviada
```

Luego:

```text
Primer contacto
            ↓
Primer contacto recibido
```

Y posteriormente:

```text
Entrevista (realizada)
            ↓
Entrevista realizada
```

### Consultar métricas

Define el período de análisis en `Metricas`.

El sistema actualizará los indicadores y conversiones correspondientes.

---

## Arquitectura

El proyecto utiliza una arquitectura modular sencilla:

```text
                         Google Sheets
                              │
                              ▼
                           Router
                              │
              ┌───────────────┼───────────────┐
              │               │               │
              ▼               ▼               ▼
          Empresas      Postulaciones      Metricas
                              │
                              ▼
                          Historial
                              │
                              ▼
                    Estado_Postulacion
```

Cada archivo tiene una responsabilidad específica.

### Flujo de una postulación

```text
Nueva postulación
       │
       ▼
Postulaciones.gs
       │
       ├── Genera JOB-XXXX
       │
       ├── Busca ID Empresa
       │
       └── Busca ID Estado
       │
       ▼
Historial.gs
       │
       └── Registra evento
       │
       ▼
Metricas.gs
       │
       └── Calcula indicadores
```

---

## Dependencias

El proyecto requiere únicamente:

* Google Sheets.
* Google Apps Script.
* Servicios nativos disponibles en Apps Script.

No utiliza:

* Google Sheets API.
* APIs externas.
* Bases de datos externas.
* Servidores adicionales.
* Claves API.

---

## Personalización

El proyecto está diseñado para ser modificado.

Puedes adaptar:

* Estados de postulación.
* Eventos.
* Indicadores.
* Conversiones.
* Campos de las tablas.
* Prefijos de IDs.
* Reglas de automatización.
* Diseño visual.
* Dashboard.
* Estructura de métricas.

Si modificas la estructura de las hojas o los nombres de las tablas, revisa las constantes `CONFIG_*` de los módulos correspondientes.

---

## Buenas prácticas

Para mantener la plantilla funcionando correctamente:

* No modificar manualmente los IDs generados automáticamente.
* No eliminar las fórmulas automáticas de las columnas de ID mientras sean necesarias.
* Mantener consistentes los nombres de los estados.
* Mantener la relación entre `Estado_Postulacion[ID]`, `Estado_Postulacion[Name]` y `Estado_Postulacion[Evento]`.
* Evitar cambiar los nombres de las tablas utilizadas por `Metricas.gs`.
* Mantener los scripts separados por responsabilidad.
* Realizar una copia de seguridad antes de modificar la estructura.

---

## Datos y privacidad

El repositorio contiene únicamente el código fuente de la plantilla.

No deben subirse al repositorio:

* Datos personales.
* Empresas registradas durante una búsqueda laboral real.
* Historial de postulaciones.
* Información de contacto.
* Links privados.
* Credenciales.
* Tokens.
* Claves API.
* Información sensible.

Cada usuario debe trabajar con su propia copia de Google Sheets.

---

## Contribuciones

Las contribuciones son bienvenidas.

Puedes:

* Reportar errores.
* Proponer mejoras.
* Crear nuevas funcionalidades.
* Mejorar la documentación.
* Adaptar la plantilla a otros flujos de búsqueda laboral.
* Enviar pull requests.

Antes de realizar cambios importantes, se recomienda abrir un issue para discutir la propuesta.

---

## Estado del proyecto

**Estado:** funcional / en desarrollo continuo.

La versión actual contiene las automatizaciones principales para:

* Empresas.
* Postulaciones.
* Historial.
* Estados.
* Indicadores.
* Conversiones.

La interfaz visual y el dashboard pueden evolucionar independientemente de la lógica de automatización.

---

## Licencia

Este proyecto está disponible bajo la licencia **MIT**.

La licencia permite utilizar, copiar, modificar, distribuir, sublicenciar y vender el software, siempre que se conserve el aviso de copyright y la licencia correspondiente.

Copyright (c) 2026 Cristóbal Matías Latorre Padilla

Consulta el archivo [`LICENSE`](LICENSE) para conocer los términos completos de la licencia.

---

## Autor

**Cristóbal Matías Latorre Padilla**

Proyecto creado como una herramienta personal de gestión de búsqueda laboral y posteriormente preparado como plantilla reutilizable y open source.
