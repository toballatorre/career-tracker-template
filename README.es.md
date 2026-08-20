<h1 align="center">Career Tracker</h1>

<p align="center">
  <em>Plantilla de código abierto para Google Sheets para gestionar y analizar tu búsqueda de empleo.</em>
</p>
<p align="center"><a href="README.md">English</a> · <a href="README.es.md">Español</a></p>
<p align="center">
  <img src="https://img.shields.io/badge/Google%20Sheets-Apps%20Script-4285F4?style=flat-square" alt="Google Sheets Apps Script">
  <img src="https://img.shields.io/badge/status-functional-green?style=flat-square" alt="Functional">
  <img src="https://img.shields.io/badge/API-Google%20Sheets%20API%20not%20required-blue?style=flat-square" alt="Google Sheets API not required">
  <img src="https://img.shields.io/badge/license-MIT-green?style=flat-square" alt="MIT license">
</p>

---

**Career Tracker** es una plantilla de código abierto para la gestión de búsqueda de empleo, construida con **Google Sheets y Google Apps Script**.

Te ayuda a llevar el registro de empresas, postulaciones a empleos, estados de las postulaciones, eventos históricos y métricas de búsqueda en un solo lugar.

El proyecto se creó originalmente como una herramienta personal para gestionar una búsqueda de empleo, y luego se estructuró como una plantilla reutilizable que se puede compartir, copiar y modificar libremente.

¿Quieres utilizar Career Tracker directamente en Google Sheets?

**[Crear una copia del Template](https://docs.google.com/spreadsheets/d/1tYiN0VNhKKJHav6gcv_3Fu9Wp7t_yCFkGQ09BQP-h34/copy)**


## Tabla de contenidos

* [Características](#características)
* [Cómo funciona](#cómo-funciona)
* [Estructura del proyecto](#estructura-del-proyecto)
* [Estructura de Google Sheets](#estructura-de-google-sheets)
* [Automatización](#automatización)
* [Métricas](#métricas)
* [Instalación](#instalación)
* [Uso](#uso)
* [Personalización](#personalización)
* [Principios de diseño](#principios-de-diseño)
* [Privacidad](#privacidad)
* [Contribuir](#contribuir)
* [Estado del proyecto](#estado-del-proyecto)
* [Licencia](#licencia)
* [Autor](#autor)

## Características

* IDs automáticos para empresas, postulaciones y registros de historial.
* Base de datos de empresas.
* Seguimiento de postulaciones a empleos.
* Búsqueda automática del ID de empresa.
* Búsqueda automática del ID de estado de postulación.
* Seguimiento de estados y eventos de las postulaciones.
* Historial automático de postulaciones.
* Registro histórico de cambios de estado.
* Sincronización del historial cuando cambia el nombre de la empresa o el cargo.
* Filtrado por período de búsqueda.
* Indicadores de búsqueda de empleo.
* Métricas de conversión entre etapas de la postulación.
* Métricas de entrevistas separadas.
* Seguimiento de postulaciones activas.
* No requiere base de datos externa.
* No requiere la API de Google Sheets.
* Estructura de Google Sheets totalmente personalizable.

## Cómo funciona

La hoja de cálculo se organiza en torno a cuatro conceptos principales:

```text
Empresas
    │
    ▼
Postulaciones
    │
    ├── Estado actual
    │
    └── Eventos históricos
              │
              ▼
           Métricas
```

Un flujo de trabajo típico es el siguiente:

```text
Crear empresa
      │
      ▼
EMP-XXXX
      │
      ▼
Crear postulación
      │
      ├── JOB-XXXX
      ├── ID de empresa
      └── ID de estado
      │
      ▼
Cambiar estado de la postulación
      │
      ▼
Crear evento histórico
      │
      ▼
Actualizar métricas de búsqueda
```

La automatización se maneja mediante Google Apps Script y está dividida en pequeños módulos, cada uno con una única responsabilidad.

## Estructura del proyecto

```text
career-tracker/
│
├── README.md
├── LICENSE
│
└── src/
    ├── Router.gs
    ├── Empresas.gs
    ├── Postulaciones.gs
    ├── Historial.gs
    └── Metricas.gs
```

### `Router.gs`

Punto de entrada central para las ediciones de la hoja de cálculo.

Contiene la única función `onEdit(e)` del proyecto y enruta los cambios al módulo correspondiente.

```text
Postulaciones → Postulaciones.gs + Historial.gs
Empresas      → Empresas.gs
Metricas      → Metricas.gs
```

### `Empresas.gs`

Gestiona los registros de empresas y genera IDs únicos de empresa.

```text
EMP-0001
EMP-0002
EMP-0003
```

También evita crear empresas duplicadas basándose en su nombre normalizado.

### `Postulaciones.gs`

Gestiona las postulaciones a empleos.

Cuando se crea una nueva postulación, el script:

1. Genera un ID único de postulación.
2. Inserta la fórmula usada para obtener el ID de empresa.
3. Inserta la fórmula usada para obtener el ID de estado.

Los IDs de postulación usan el siguiente formato:

```text
JOB-0001
JOB-0002
JOB-0003
```

### `Historial.gs`

Registra los cambios de estado de las postulaciones como eventos históricos.

Los registros históricos reciben IDs como:

```text
HIS-0001
HIS-0002
HIS-0003
```

La descripción del evento está asociada al estado de postulación seleccionado.

Por ejemplo:

```text
Enviado, esperando respuesta
            ↓
Postulación enviada
```

El primer evento histórico usa la fecha de postulación definida por el usuario. Los eventos siguientes usan la fecha en la que se registra el evento.

Si cambia la empresa o el cargo de una postulación, los registros históricos correspondientes se actualizan.

### `Metricas.gs`

Calcula indicadores de búsqueda de empleo y tasas de conversión utilizando la información de `Historial` y `Postulaciones`.

El análisis se puede filtrar por un rango de fechas seleccionado.

## Estructura de Google Sheets

La plantilla utiliza las siguientes hojas:

| Hoja                  | Propósito                              |
| --------------------- | --------------------------------------- |
| `Empresas`            | Base de datos de empresas               |
| `Postulaciones`       | Postulaciones actuales                  |
| `Estado_Postulacion`  | Estados y eventos de las postulaciones  |
| `Historial`           | Eventos históricos de las postulaciones |
| `Metricas`            | Métricas de búsqueda y conversiones     |

### Empresas

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

### Postulaciones

| Columna | Campo                  |
| ------- | ----------------------- |
| A       | ID                       |
| B       | Fecha                    |
| C       | ID Empresa               |
| D       | Empresa                  |
| E       | Cargo                    |
| F       | Link                     |
| G       | ID Estado                |
| H       | Estado                   |
| I       | Fecha último contacto    |
| J       | Próximo paso             |
| K       | Notas                    |

### Historial

| Columna | Campo          |
| ------- | -------------- |
| A       | ID             |
| B       | ID Candidatura |
| C       | Fecha          |
| D       | ID Empresa     |
| E       | Cargo          |
| F       | ID Estado      |
| G       | Evento         |

### Estado_Postulacion

El catálogo de estados por defecto es:

| ID       | Nombre                              | Evento                            |
| -------- | ------------------------------------ | --------------------------------- |
| EPO-0001 | Sin enviar                          | Candidatura creada                |
| EPO-0002 | Enviado, esperando respuesta        | Postulación enviada               |
| EPO-0003 | Primer contacto                     | Primer contacto recibido          |
| EPO-0004 | Entrevista (espera)                 | Entrevista pendiente              |
| EPO-0005 | Entrevista (realizada)              | Entrevista realizada              |
| EPO-0006 | Entrevista técnica (espera)         | Entrevista técnica pendiente      |
| EPO-0007 | Entrevista técnica (realizada)      | Entrevista técnica realizada      |
| EPO-0008 | Entrevista psicológica (espera)     | Entrevista psicológica pendiente  |
| EPO-0009 | Entrevista psicológica (realizada)  | Entrevista psicológica realizada  |
| EPO-0010 | Oferta                              | Oferta recibida                   |
| EPO-0011 | Rechazado                           | Candidatura rechazada             |
| EPO-0012 | Retirado                            | Candidatura retirada              |

## Automatización

### IDs de postulación

Las nuevas postulaciones reciben automáticamente un ID secuencial:

```text
JOB-0001
JOB-0002
JOB-0003
```

El script verifica los IDs existentes y genera el siguiente número disponible.

### IDs de empresa

Las nuevas empresas reciben:

```text
EMP-0001
EMP-0002
EMP-0003
```

Los nombres de empresa duplicados se detectan antes de crear un nuevo ID.

### Relaciones entre estados y empresas

La tabla de postulaciones usa fórmulas para asociar valores legibles por humanos con sus IDs internos.

Empresa:

```text
Empresa → Empresas[Name] → Empresas[ID]
```

Estado:

```text
Estado → Estado_Postulacion[Name] → Estado_Postulacion[ID]
```

Esto mantiene la hoja de cálculo legible para el usuario, a la vez que permite que los scripts y las métricas trabajen con IDs estables.

### Historial de postulaciones

Cambiar el estado de una postulación crea un nuevo evento histórico.

Por ejemplo:

```text
JOB-0002

Enviado, esperando respuesta
        ↓
Postulación enviada

Primer contacto
        ↓
Primer contacto recibido

Entrevista (realizada)
        ↓
Entrevista realizada
```

El registro histórico conserva los estados alcanzados por la postulación a lo largo de su ciclo de vida.

## Métricas

La hoja `Metricas` ofrece dos áreas de análisis principales.

### Indicadores

Los indicadores actuales son:

* Postulaciones enviadas
* Contactos recibidos
* Entrevistas realizadas
* Entrevistas técnicas
* Entrevistas psicológicas
* Ofertas
* Rechazos
* Retirados
* Candidaturas activas

Las entrevistas se separan intencionalmente en distintas categorías en lugar de representarse solo como un total único.

### Postulaciones activas

Una postulación se considera activa cuando su estado actual no es:

```text
Oferta
Rechazado
Retirado
```

### Tasas de conversión

La plantilla calcula la conversión entre etapas:

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

También registra la conversión de rechazos en relación con las postulaciones enviadas.

### Tablas de métricas

Los rangos de datos actuales son:

```text
Periodo       → A2:B3
Indicadores   → D2:F10
Conversiones  → H2:J7
```

Estos rangos corresponden al área de datos de las tablas y no incluyen sus encabezados.

El script identifica las tablas por su nombre en lugar de depender de coordenadas fijas de la hoja.

## Instalación

### 1. Crea una copia de la plantilla de hoja de cálculo

Haz tu propia copia de la plantilla de Google Sheets de Career Tracker.

### 2. Abre Apps Script

En Google Sheets:

**Extensiones → Apps Script**

### 3. Agrega los scripts

Copia los archivos de `src/` al proyecto de Apps Script:

```text
Router.gs
Empresas.gs
Postulaciones.gs
Historial.gs
Metricas.gs
```

### 4. Verifica los nombres de las hojas

Deben existir las siguientes hojas:

```text
Empresas
Postulaciones
Estado_Postulacion
Historial
Metricas
```

### 5. Verifica los nombres de las tablas

El módulo de métricas utiliza las siguientes tablas de Google Sheets:

```text
Periodo
Indicadores
Conversiones
```

### 6. Guarda el proyecto

Guarda el proyecto de Apps Script.

No se requiere configuración de la API de Google Sheets.

## Uso

### Agregar una empresa

Ingresa una empresa en la tabla `Empresas`.

El sistema genera el ID de empresa automáticamente.

```text
EMP-XXXX
```

### Agregar una postulación

Ingresa la información de la postulación en `Postulaciones`.

El sistema genera:

```text
JOB-XXXX
```

También crea las fórmulas usadas para resolver:

```text
Empresa → ID de empresa
Estado  → ID de estado
```

### Actualizar el estado de una postulación

Cambia el campo `Estado` de una postulación.

El sistema crea un evento correspondiente en `Historial`.

### Actualizar empresa o cargo

Si cambia la empresa o el cargo, los registros históricos existentes asociados a esa postulación se actualizan para reflejar la empresa y el cargo actuales.

### Analizar la búsqueda

Define el rango de fechas deseado en `Metricas`.

Los indicadores y los valores de conversión se recalculan entonces para ese período.

## Personalización

La plantilla está pensada intencionalmente para ser modificada.

Puedes personalizar:

* Campos de empresa.
* Campos de postulación.
* Estados de postulación.
* Eventos históricos.
* Métricas.
* Fórmulas de conversión.
* Diseño del panel.
* Diseño visual.
* Prefijos de ID.
* Reglas de automatización.

Si cambias los nombres de las hojas o tablas, actualiza las constantes de configuración correspondientes en los archivos `.gs`.

Por ejemplo:

```text
CONFIG_POSTULACIONES
CONFIG_HISTORIAL
CONFIG_METRICAS
CONFIG_EMPRESAS
```

## Principios de diseño

### Automatización modular

Cada script tiene una responsabilidad específica.

```text
Router.gs
    ↓
Enruta eventos

Empresas.gs
    ↓
Gestión de empresas

Postulaciones.gs
    ↓
Gestión de postulaciones

Historial.gs
    ↓
Eventos históricos

Metricas.gs
    ↓
Análisis
```

### Hoja de cálculo como base

El proyecto usa Google Sheets tanto como interfaz como almacenamiento de datos.

No existe una base de datos ni un servidor backend separados.

### IDs estables

Las entidades usan IDs predecibles:

```text
EMP-XXXX → Empresa
JOB-XXXX → Postulación
HIS-XXXX → Historial
EPO-XXXX → Estado de postulación
```

Esto facilita mantener las relaciones y provee referencias estables para la automatización y el análisis.

### Google Apps Script nativo

El proyecto evita intencionalmente la API de Google Sheets.

Se apoya en servicios nativos de Apps Script como:

* `SpreadsheetApp`
* `LockService`

Esto simplifica la instalación y evita la necesidad de un proyecto de API externo o credenciales adicionales.

## Privacidad

El repositorio contiene únicamente el código fuente de la plantilla.

**No subas datos personales de tu búsqueda de empleo.**

Nunca subas:

* Información personal.
* Información de contacto.
* Enlaces privados de postulaciones.
* Información de reclutadores.
* Notas privadas.
* Credenciales.
* Claves de API.
* Tokens de acceso.
* Historial real de postulaciones.

Cada usuario debe trabajar con su propia copia de la plantilla de Google Sheets.

## Contribuir

Las contribuciones son bienvenidas.

Puedes contribuir de las siguientes formas:

* Reportando errores.
* Sugiriendo mejoras.
* Mejorando la documentación.
* Agregando nuevas métricas.
* Mejorando la automatización.
* Agregando nuevas etapas de postulación.
* Mejorando el panel.
* Enviando pull requests.

Para cambios significativos, abre primero un issue para discutir el enfoque propuesto.

## Estado del proyecto

**Estado: Funcional**

La versión actual incluye:

* Gestión de empresas.
* Gestión de postulaciones.
* IDs automáticos.
* Búsqueda de ID de empresa y estado.
* Historial de postulaciones.
* Relaciones entre estados y eventos.
* Indicadores de búsqueda.
* Métricas de conversión.
* Filtrado por período.

El panel visual puede seguir evolucionando de forma independiente a la automatización central.

## Licencia

Este proyecto está licenciado bajo la **Licencia MIT**.

La Licencia MIT permite a cualquier persona usar, copiar, modificar, fusionar, publicar, distribuir, sublicenciar y vender copias del software, siempre que se incluyan el aviso de copyright y la licencia.

Consulta [`LICENSE`](LICENSE) para ver el texto completo de la licencia.

Copyright (c) 2026 Cristóbal Matías Latorre Padilla

## Autor

**Cristóbal Matías Latorre Padilla**

Career Tracker se creó originalmente como una herramienta personal para gestionar una búsqueda de empleo, y luego se desarrolló como una plantilla reutilizable de código abierto.
