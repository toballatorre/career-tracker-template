<h1 align="center">Career Tracker</h1>

<p align="center">
  <em>Open-source Google Sheets template for managing and analyzing your job search.</em>
</p>
<p align="center"><a href="README.md">English</a> · <a href="README.es.md">Español</a></p>
<p align="center">
  <img src="https://img.shields.io/badge/Google%20Sheets-Apps%20Script-4285F4?style=flat-square" alt="Google Sheets Apps Script">
  <img src="https://img.shields.io/badge/status-functional-green?style=flat-square" alt="Functional">
  <img src="https://img.shields.io/badge/API-Google%20Sheets%20API%20not%20required-blue?style=flat-square" alt="Google Sheets API not required">
  <img src="https://img.shields.io/badge/license-MIT-green?style=flat-square" alt="MIT license">
</p>

---

**Career Tracker** is an open-source job-search management template built with **Google Sheets and Google Apps Script**.

It helps you keep track of companies, job applications, application stages, historical events and search metrics in one place.

The project was originally created as a personal tool for managing a job search and was later structured as a reusable template that can be shared, copied and modified freely.

Do you want to use Career Tracker in Google Sheets?

**[Create a copy from the Template](https://docs.google.com/spreadsheets/d/1tYiN0VNhKKJHav6gcv_3Fu9Wp7t_yCFkGQ09BQP-h34/copy)**


## Table of Contents

* [Features](#features)
* [How it works](#how-it-works)
* [Project structure](#project-structure)
* [Google Sheets structure](#google-sheets-structure)
* [Automation](#automation)
* [Metrics](#metrics)
* [Installation](#installation)
* [Usage](#usage)
* [Customization](#customization)
* [Design principles](#design-principles)
* [Privacy](#privacy)
* [Contributing](#contributing)
* [License](#license)
* [Author](#author)

## Features

* Automatic IDs for companies, applications and history records.
* Company database.
* Job application tracking.
* Automatic company ID lookup.
* Automatic application status ID lookup.
* Application status and event tracking.
* Automatic application history.
* Historical tracking of status changes.
* Historical synchronization when a company's name or position changes.
* Search-period filtering.
* Job-search indicators.
* Conversion metrics between application stages.
* Separate interview metrics.
* Active application tracking.
* No external database required.
* No Google Sheets API required.
* Fully customizable Google Sheets structure.

## How it works

The spreadsheet is organized around four main concepts:

```text
Companies
    │
    ▼
Applications
    │
    ├── Current status
    │
    └── Historical events
              │
              ▼
           Metrics
```

A typical workflow looks like this:

```text
Create company
      │
      ▼
EMP-XXXX
      │
      ▼
Create application
      │
      ├── JOB-XXXX
      ├── Company ID
      └── Status ID
      │
      ▼
Change application status
      │
      ▼
Create historical event
      │
      ▼
Update search metrics
```

The automation is handled by Google Apps Script and is divided into small modules with a single responsibility.

## Project structure

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

Central entry point for spreadsheet edits.

It contains the project's single `onEdit(e)` function and routes changes to the appropriate module.

```text
Postulaciones → Postulaciones.gs + Historial.gs
Empresas      → Empresas.gs
Metricas      → Metricas.gs
```

### `Empresas.gs`

Handles company records and generates unique company IDs.

```text
EMP-0001
EMP-0002
EMP-0003
```

It also prevents creating duplicate companies based on their normalized name.

### `Postulaciones.gs`

Handles job applications.

When a new application is created, the script:

1. Generates a unique application ID.
2. Inserts the formula used to obtain the company ID.
3. Inserts the formula used to obtain the status ID.

Application IDs use the following format:

```text
JOB-0001
JOB-0002
JOB-0003
```

### `Historial.gs`

Records application status changes as historical events.

Historical records receive IDs such as:

```text
HIS-0001
HIS-0002
HIS-0003
```

The event description is associated with the selected application status.

For example:

```text
Enviado, esperando respuesta
            ↓
Postulación enviada
```

The first historical event uses the application date defined by the user. Subsequent events use the date on which the event is registered.

If the company or position of an application changes, the corresponding historical records are updated.

### `Metricas.gs`

Calculates job-search indicators and conversion rates using information from `Historial` and `Postulaciones`.

The analysis can be filtered by a selected date range.

## Google Sheets structure

The template uses the following sheets:

| Sheet                | Purpose                         |
| -------------------- | ------------------------------- |
| `Empresas`           | Company database                |
| `Postulaciones`      | Current job applications        |
| `Estado_Postulacion` | Application statuses and events |
| `Historial`          | Historical application events   |
| `Metricas`           | Search metrics and conversions  |

### Empresas

| Column | Field     |
| ------ | --------- |
| A      | ID        |
| B      | Name      |
| C      | Tipo      |
| D      | Industria |
| E      | Pais      |
| F      | Rol       |
| G      | Fuente    |
| H      | Notas     |

### Postulaciones

| Column | Field                 |
| ------ | --------------------- |
| A      | ID                    |
| B      | Fecha                 |
| C      | ID Empresa            |
| D      | Empresa               |
| E      | Cargo                 |
| F      | Link                  |
| G      | ID Estado             |
| H      | Estado                |
| I      | Fecha último contacto |
| J      | Próximo paso          |
| K      | Notas                 |

### Historial

| Column | Field          |
| ------ | -------------- |
| A      | ID             |
| B      | ID Candidatura |
| C      | Fecha          |
| D      | ID Empresa     |
| E      | Cargo          |
| F      | ID Estado      |
| G      | Evento         |

### Estado_Postulacion

The default status catalogue is:

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

## Automation

### Application IDs

New applications automatically receive a sequential ID:

```text
JOB-0001
JOB-0002
JOB-0003
```

The script checks existing IDs and generates the next available number.

### Company IDs

New companies receive:

```text
EMP-0001
EMP-0002
EMP-0003
```

Duplicate company names are detected before creating a new ID.

### Status and company relationships

The application table uses formulas to associate human-readable values with their internal IDs.

Company:

```text
Empresa → Empresas[Name] → Empresas[ID]
```

Status:

```text
Estado → Estado_Postulacion[Name] → Estado_Postulacion[ID]
```

This keeps the spreadsheet readable for the user while allowing the scripts and metrics to work with stable IDs.

### Application history

Changing an application's status creates a new historical event.

For example:

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

The historical record preserves the state reached by the application during its lifecycle.

## Metrics

The `Metricas` sheet provides two main analytical areas.

### Indicators

The current indicators are:

* Postulaciones enviadas
* Contactos recibidos
* Entrevistas realizadas
* Entrevistas técnicas
* Entrevistas psicológicas
* Ofertas
* Rechazos
* Retirados
* Candidaturas activas

Interviews are intentionally separated into different categories instead of being represented only as a single total.

### Active applications

An application is considered active when its current status is not:

```text
Oferta
Rechazado
Retirado
```

### Conversion rates

The template calculates conversion between stages:

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

It also tracks rejection conversion relative to applications sent.

### Metrics tables

The current data ranges are:

```text
Periodo       → A2:B3
Indicadores   → D2:F10
Conversiones  → H2:J7
```

These ranges refer to the data area of the tables and do not include their headers.

The script identifies the tables by their table names rather than depending on fixed sheet coordinates.

## Installation

### 1. Create a copy of the spreadsheet template

Make your own copy of the Career Tracker Google Sheets template.

### 2. Open Apps Script

In Google Sheets:

**Extensions → Apps Script**

### 3. Add the scripts

Copy the files from `src/` into the Apps Script project:

```text
Router.gs
Empresas.gs
Postulaciones.gs
Historial.gs
Metricas.gs
```

### 4. Verify sheet names

The following sheets must exist:

```text
Empresas
Postulaciones
Estado_Postulacion
Historial
Metricas
```

### 5. Verify table names

The following Google Sheets tables are used by the metrics module:

```text
Periodo
Indicadores
Conversiones
```

### 6. Save the project

Save the Apps Script project.

No Google Sheets API configuration is required.

## Usage

### Add a company

Enter a company into the `Empresas` table.

The system generates the company ID automatically.

```text
EMP-XXXX
```

### Add an application

Enter the application information in `Postulaciones`.

The system generates:

```text
JOB-XXXX
```

It also creates the formulas used to resolve:

```text
Company → Company ID
Status  → Status ID
```

### Update an application status

Change the `Estado` field of an application.

The system creates a corresponding event in `Historial`.

### Update company or position

If the company or position changes, the existing historical records associated with that application are updated to reflect the current company and position.

### Analyze the search

Set the desired date range in `Metricas`.

The indicators and conversion values are then recalculated for that period.

## Customization

The template is intentionally designed to be modified.

You can customize:

* Company fields.
* Application fields.
* Application statuses.
* Historical events.
* Metrics.
* Conversion formulas.
* Dashboard layout.
* Visual design.
* ID prefixes.
* Automation rules.

If you change sheet or table names, update the corresponding configuration constants in the `.gs` files.

For example:

```text
CONFIG_POSTULACIONES
CONFIG_HISTORIAL
CONFIG_METRICAS
CONFIG_EMPRESAS
```

## Design principles

### Modular automation

Each script has a specific responsibility.

```text
Router.gs
    ↓
Routes events

Empresas.gs
    ↓
Company management

Postulaciones.gs
    ↓
Application management

Historial.gs
    ↓
Historical events

Metricas.gs
    ↓
Analytics
```

### Spreadsheet-first

The project uses Google Sheets as both the interface and data store.

There is no separate database or backend server.

### Stable IDs

Entities use predictable IDs:

```text
EMP-XXXX → Company
JOB-XXXX → Application
HIS-XXXX → History
EPO-XXXX → Application status
```

This makes relationships easier to maintain and provides stable references for automation and analysis.

### Native Google Apps Script

The project intentionally avoids the Google Sheets API.

It relies on native Apps Script services such as:

* `SpreadsheetApp`
* `LockService`

This keeps the installation simpler and avoids requiring an external API project or additional credentials.

## Privacy

The repository contains only the template's source code.

**Do not commit personal job-search data.**

Never upload:

* Personal information.
* Contact information.
* Private application links.
* Recruiter information.
* Private notes.
* Credentials.
* API keys.
* Access tokens.
* Real application history.

Each user should work with their own copy of the Google Sheets template.

## Contributing

Contributions are welcome.

You can contribute by:

* Reporting bugs.
* Suggesting improvements.
* Improving documentation.
* Adding new metrics.
* Improving the automation.
* Adding new application stages.
* Improving the dashboard.
* Submitting pull requests.

For significant changes, open an issue first to discuss the proposed approach.

## Project status

**Status: Functional**

The current version includes:

* Company management.
* Application management.
* Automatic IDs.
* Company and status ID lookup.
* Application history.
* Status/event relationships.
* Search indicators.
* Conversion metrics.
* Period filtering.

The visual dashboard can continue evolving independently from the core automation.

## License

This project is licensed under the **MIT License**.

The MIT License allows anyone to use, copy, modify, merge, publish, distribute, sublicense and sell copies of the software, provided that the copyright notice and license are included.

See [`LICENSE`](LICENSE) for the complete license text.

Copyright (c) 2026 Cristóbal Matías Latorre Padilla

## Author

**Cristóbal Matías Latorre Padilla**

Career Tracker was originally created as a personal job-search management tool and later developed into a reusable open-source template.
