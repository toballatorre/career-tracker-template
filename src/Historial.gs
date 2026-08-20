/*******************************************************
 * HISTORIAL.GS
 *
 * Gestiona automáticamente la tabla Historial
 * a partir de cambios realizados en Postulaciones.
 *
 *
 * POSTULACIONES
 *
 * A = ID
 * B = Fecha
 * C = ID Empresa
 * D = Empresa
 * E = Cargo
 * F = Link
 * G = ID Estado
 * H = Estado
 * I = Fecha último contacto
 * J = Próximo paso
 * K = Notas
 *
 *
 * HISTORIAL
 *
 * A = ID
 * B = ID Candidatura
 * C = Fecha
 * D = ID Empresa
 * E = Cargo
 * F = ID Estado
 * G = Evento
 *
 *
 * ESTADO_POSTULACION
 *
 * A = ID
 * B = Name
 * C = Evento
 *******************************************************/


/*******************************************************
 * CONFIGURACIÓN
 *******************************************************/

const CONFIG_HISTORIAL = {

  hojaPostulaciones: 'Postulaciones',

  hojaHistorial: 'Historial',

  hojaEstados: 'Estado_Postulacion',

  columnasPostulaciones: {

    id: 1,

    fecha: 2,

    idEmpresa: 3,

    empresa: 4,

    cargo: 5,

    link: 6,

    idEstado: 7,

    estado: 8,

    fechaUltimoContacto: 9,

    proximoPaso: 10,

    notas: 11
  },

  columnasHistorial: {

    id: 1,

    idCandidatura: 2,

    fecha: 3,

    idEmpresa: 4,

    cargo: 5,

    idEstado: 6,

    evento: 7
  },

  columnasEstados: {

    id: 1,

    nombre: 2,

    evento: 3
  },

  prefijo: 'HIS'
};


/*******************************************************
 * PROCESAR CAMBIO DE POSTULACIÓN
 *
 * Esta función es llamada por Router.gs.
 *******************************************************/

function procesarHistorial(e) {

  if (!e || !e.range) {
    return;
  }


  const hoja =
    e.range.getSheet();


  if (
    hoja.getName() !==
    CONFIG_HISTORIAL.hojaPostulaciones
  ) {
    return;
  }


  const filaInicial =
    e.range.getRow();


  const cantidadFilas =
    e.range.getNumRows();


  /*
   * Ignorar encabezados.
   */

  if (filaInicial < 2) {
    return;
  }


  /*
   * Procesar cada fila afectada.
   */

  for (
    let i = 0;
    i < cantidadFilas;
    i++
  ) {

    procesarHistorialFila_(
      hoja,
      filaInicial + i,
      e.range.getColumn()
    );
  }
}


/*******************************************************
 * PROCESAR FILA
 *******************************************************/

function procesarHistorialFila_(
  hoja,
  fila,
  columnaEditada
) {

  /*
   * Solo nos interesan estas columnas:
   *
   * B = Fecha
   * C = ID Empresa
   * D = Empresa
   * E = Cargo
   * G = ID Estado
   * H = Estado
   */

  const columnasRelevantes = [

    CONFIG_HISTORIAL
      .columnasPostulaciones.fecha,

    CONFIG_HISTORIAL
      .columnasPostulaciones.idEmpresa,

    CONFIG_HISTORIAL
      .columnasPostulaciones.empresa,

    CONFIG_HISTORIAL
      .columnasPostulaciones.cargo,

    CONFIG_HISTORIAL
      .columnasPostulaciones.idEstado,

    CONFIG_HISTORIAL
      .columnasPostulaciones.estado
  ];


  if (
    !columnasRelevantes.includes(
      columnaEditada
    )
  ) {
    return;
  }


  /*
   * Obtener candidatura actual.
   */

  const candidatura =
    obtenerCandidatura_(
      hoja,
      fila
    );


  /*
   * Sin ID de candidatura
   * no podemos crear historial.
   */

  if (!candidatura.id) {
    return;
  }


  /***************************************************
   * CAMBIO DE ESTADO
   *
   * H = Estado seleccionado
   *
   * G contiene XLOOKUP, pero NO dependemos
   * de G para obtener el estado.
   ***************************************************/

  if (
    columnaEditada ===
    CONFIG_HISTORIAL
      .columnasPostulaciones.estado
  ) {

    registrarCambioEstado_(
      candidatura
    );

    return;
  }


  /***************************************************
   * CAMBIO DE ID ESTADO
   *
   * Compatibilidad si G se modifica manualmente.
   ***************************************************/

  if (
    columnaEditada ===
    CONFIG_HISTORIAL
      .columnasPostulaciones.idEstado
  ) {

    /*
     * Si G fue modificada directamente,
     * usamos su valor para registrar el estado.
     */

    const estado =
      obtenerEstadoPorId_(
        candidatura.idEstado
      );


    if (!estado) {
      return;
    }


    registrarEstado_(
      candidatura,
      estado.id
    );

    return;
  }


  /***************************************************
   * CAMBIO DE EMPRESA O CARGO
   ***************************************************/

  if (

    columnaEditada ===
      CONFIG_HISTORIAL
        .columnasPostulaciones.idEmpresa ||

    columnaEditada ===
      CONFIG_HISTORIAL
        .columnasPostulaciones.empresa ||

    columnaEditada ===
      CONFIG_HISTORIAL
        .columnasPostulaciones.cargo

  ) {

    actualizarDatosHistorial_(
      candidatura
    );

    return;
  }
}


/*******************************************************
 * OBTENER CANDIDATURA
 *******************************************************/

function obtenerCandidatura_(
  hoja,
  fila
) {

  const datos =
    hoja
      .getRange(
        fila,
        1,
        1,
        11
      )
      .getValues()[0];


  return {

    id:
      String(
        datos[
          CONFIG_HISTORIAL
            .columnasPostulaciones.id - 1
        ]
      ).trim(),


    fecha:
      datos[
        CONFIG_HISTORIAL
          .columnasPostulaciones.fecha - 1
      ],


    idEmpresa:
      String(
        datos[
          CONFIG_HISTORIAL
            .columnasPostulaciones.idEmpresa - 1
        ]
      ).trim(),


    empresa:
      String(
        datos[
          CONFIG_HISTORIAL
            .columnasPostulaciones.empresa - 1
        ]
      ).trim(),


    cargo:
      String(
        datos[
          CONFIG_HISTORIAL
            .columnasPostulaciones.cargo - 1
        ]
      ).trim(),


    idEstado:
      String(
        datos[
          CONFIG_HISTORIAL
            .columnasPostulaciones.idEstado - 1
        ]
      ).trim(),


    estado:
      String(
        datos[
          CONFIG_HISTORIAL
            .columnasPostulaciones.estado - 1
        ]
      ).trim()
  };
}


/*******************************************************
 * REGISTRAR CAMBIO DE ESTADO
 *******************************************************/

function registrarCambioEstado_(
  candidatura
) {

  /*
   * El estado seleccionado está en H.
   *
   * Buscamos su información en:
   *
   * Estado_Postulacion
   *
   * A = ID
   * B = Name
   * C = Evento
   */

  const estado =
    obtenerEstadoPorNombre_(
      candidatura.estado
    );


  if (!estado) {
    return;
  }


  const idEstado =
    estado.id;


  const evento =
    estado.evento;


  if (!evento) {

    throw new Error(
      'El estado "' +
      candidatura.estado +
      '" no tiene un Evento definido en Estado_Postulacion.'
    );
  }


  const hojaHistorial =
    SpreadsheetApp
      .getActiveSpreadsheet()
      .getSheetByName(
        'Historial'
      );


  if (!hojaHistorial) {

    throw new Error(
      'No existe la hoja "Historial".'
    );
  }


  /***************************************************
   * DETERMINAR FECHA DEL EVENTO
   ***************************************************/

  let fechaEvento =
    new Date();


  /*
   * Comprobamos si esta candidatura
   * ya tiene registros en Historial.
   */

  const ultimaFila =
    hojaHistorial.getLastRow();


  let existeHistorial = false;


  if (
    ultimaFila >= 2
  ) {

    const candidaturasHistorial =
      hojaHistorial
        .getRange(
          2,
          2,
          ultimaFila - 1,
          1
        )
        .getValues();


    existeHistorial =
      candidaturasHistorial.some(
        fila =>
          String(
            fila[0]
          ).trim() ===
          candidatura.id
      );
  }


  /*
   * PRIMER EVENTO
   *
   * Si no existe historial para esta candidatura,
   * utilizamos la fecha definida por el usuario
   * en Postulaciones.
   */

  if (
    !existeHistorial &&
    candidatura.fecha instanceof Date
  ) {

    fechaEvento =
      new Date(
        candidatura.fecha
      );
  }


  /***************************************************
   * GENERAR ID DE HISTORIAL
   ***************************************************/

  const idHistorial =
    generarIdHistorial_(
      hojaHistorial
    );


  /***************************************************
   * CREAR REGISTRO
   *
   * A = ID
   * B = ID Candidatura
   * C = Fecha
   * D = ID Empresa
   * E = Cargo
   * F = ID Estado
   * G = Evento
   ***************************************************/

  hojaHistorial.appendRow([
    idHistorial,
    candidatura.id,
    fechaEvento,
    candidatura.idEmpresa,
    candidatura.cargo,
    idEstado,
    evento
  ]);
}


/*******************************************************
 * REGISTRAR ESTADO
 *
 * Guarda únicamente el ID Estado.
 *
 * La columna Evento se completa mediante fórmula.
 *******************************************************/

function registrarEstado_(
  candidatura,
  idEstado
) {

  if (!idEstado) {
    return;
  }


  const hojaHistorial =
    SpreadsheetApp
      .getActiveSpreadsheet()
      .getSheetByName(
        CONFIG_HISTORIAL
          .hojaHistorial
      );


  if (!hojaHistorial) {

    throw new Error(
      'No existe la hoja "Historial".'
    );
  }


  /*
   * Generar ID del historial.
   */

  const idHistorial =
    generarIdHistorial_(
      hojaHistorial
    );


  /*
   * Registrar:
   *
   * ID
   * ID Candidatura
   * Fecha
   * ID Empresa
   * Cargo
   * ID Estado
   *
   * Evento queda vacío inicialmente.
   */

  hojaHistorial.appendRow([

    idHistorial,

    candidatura.id,

    new Date(),

    candidatura.idEmpresa,

    candidatura.cargo,

    idEstado,

    ''
  ]);


  /*
   * Obtener la fila recién creada.
   */

  const fila =
    hojaHistorial.getLastRow();


  /*
   * Escribir fórmula del Evento.
   */

  establecerFormulaEvento_(
    hojaHistorial,
    fila
  );
}


/*******************************************************
 * ESTABLECER FÓRMULA DEL EVENTO
 *******************************************************/

function establecerFormulaEvento_(
  hojaHistorial,
  fila
) {

  /*
   * F = ID Estado
   * G = Evento
   */

  const celdaEvento =
    hojaHistorial.getRange(
      fila,
      CONFIG_HISTORIAL
        .columnasHistorial
        .evento
    );


  /*
   * Usamos VLOOKUP contra:
   *
   * Estado_Postulacion
   *
   * A = ID
   * B = Name
   * C = Evento
   *
   * El índice 3 devuelve Evento.
   */

  const formula =
    '=IFERROR(VLOOKUP(F' +
    fila +
    ',Estado_Postulacion!A:C,3,FALSE),"")';


  celdaEvento.setFormula(
    formula
  );
}


/*******************************************************
 * OBTENER ESTADO POR NOMBRE
 *
 * Estado_Postulacion:
 *
 * A = ID
 * B = Name
 * C = Evento
 *******************************************************/

function obtenerEstadoPorNombre_(
  nombreEstado
) {

  const hojaEstados =
    SpreadsheetApp
      .getActiveSpreadsheet()
      .getSheetByName(
        CONFIG_HISTORIAL
          .hojaEstados
      );


  if (!hojaEstados) {

    throw new Error(
      'No existe la hoja "Estado_Postulacion".'
    );
  }


  const ultimaFila =
    hojaEstados.getLastRow();


  if (
    ultimaFila < 2
  ) {
    return null;
  }


  const datos =
    hojaEstados
      .getRange(
        2,
        CONFIG_HISTORIAL
          .columnasEstados
          .id,
        ultimaFila - 1,
        3
      )
      .getValues();


  const nombreBuscado =
    String(
      nombreEstado
    ).trim();


  for (
    const fila of datos
  ) {

    const id =
      String(
        fila[
          CONFIG_HISTORIAL
            .columnasEstados
            .id - 1
        ]
      ).trim();


    const nombre =
      String(
        fila[
          CONFIG_HISTORIAL
            .columnasEstados
            .nombre - 1
        ]
      ).trim();


    if (
      nombre ===
      nombreBuscado
    ) {

      return {

        id: id,

        nombre: nombre,

        evento:
          String(
            fila[
              CONFIG_HISTORIAL
                .columnasEstados
                .evento - 1
            ]
          ).trim()
      };
    }
  }


  throw new Error(
    'El estado "' +
    nombreEstado +
    '" no existe en Estado_Postulacion.'
  );
}


/*******************************************************
 * OBTENER ESTADO POR ID
 *******************************************************/

function obtenerEstadoPorId_(
  idEstado
) {

  if (!idEstado) {
    return null;
  }


  const hojaEstados =
    SpreadsheetApp
      .getActiveSpreadsheet()
      .getSheetByName(
        CONFIG_HISTORIAL
          .hojaEstados
      );


  if (!hojaEstados) {

    throw new Error(
      'No existe la hoja "Estado_Postulacion".'
    );
  }


  const ultimaFila =
    hojaEstados.getLastRow();


  if (
    ultimaFila < 2
  ) {
    return null;
  }


  const datos =
    hojaEstados
      .getRange(
        2,
        1,
        ultimaFila - 1,
        3
      )
      .getValues();


  const idBuscado =
    String(
      idEstado
    ).trim();


  for (
    const fila of datos
  ) {

    const id =
      String(
        fila[0]
      ).trim();


    if (
      id ===
      idBuscado
    ) {

      return {

        id: id,

        nombre:
          String(
            fila[1]
          ).trim(),

        evento:
          String(
            fila[2]
          ).trim()
      };
    }
  }


  return null;
}


/*******************************************************
 * ACTUALIZAR EMPRESA Y CARGO
 *******************************************************/

function actualizarDatosHistorial_(
  candidatura
) {

  const hojaHistorial =
    SpreadsheetApp
      .getActiveSpreadsheet()
      .getSheetByName(
        CONFIG_HISTORIAL
          .hojaHistorial
      );


  if (!hojaHistorial) {

    throw new Error(
      'No existe la hoja "Historial".'
    );
  }


  const ultimaFila =
    hojaHistorial.getLastRow();


  if (
    ultimaFila < 2
  ) {
    return;
  }


  /*
   * Historial:
   *
   * A = ID
   * B = ID Candidatura
   * C = Fecha
   * D = ID Empresa
   * E = Cargo
   * F = ID Estado
   * G = Evento
   */

  const rango =
    hojaHistorial
      .getRange(
        2,
        1,
        ultimaFila - 1,
        7
      );


  const datos =
    rango.getValues();


  let cambios = false;


  datos.forEach(
    fila => {

      const idCandidatura =
        String(
          fila[
            CONFIG_HISTORIAL
              .columnasHistorial
              .idCandidatura - 1
          ]
        ).trim();


      if (
        idCandidatura !==
        candidatura.id
      ) {
        return;
      }


      /*
       * D = ID Empresa
       */

      fila[
        CONFIG_HISTORIAL
          .columnasHistorial
          .idEmpresa - 1
      ] =
        candidatura.idEmpresa;


      /*
       * E = Cargo
       */

      fila[
        CONFIG_HISTORIAL
          .columnasHistorial
          .cargo - 1
      ] =
        candidatura.cargo;


      cambios = true;
    }
  );


  if (cambios) {

    rango.setValues(
      datos
    );
  }
}


/*******************************************************
 * GENERAR ID DE HISTORIAL
 *
 * HIS-0001
 * HIS-0002
 * HIS-0003
 *******************************************************/

function generarIdHistorial_(
  hoja
) {

  const lock =
    LockService.getScriptLock();


  lock.waitLock(30000);


  try {

    const ultimaFila =
      hoja.getLastRow();


    if (
      ultimaFila < 2
    ) {

      return 'HIS-0001';
    }


    const ids =
      hoja
        .getRange(
          2,
          CONFIG_HISTORIAL
            .columnasHistorial
            .id,
          ultimaFila - 1,
          1
        )
        .getValues()
        .flat();


    let maximo = 0;


    ids.forEach(
      id => {

        if (!id) {
          return;
        }


        const match =
          String(id).match(
            /^HIS-(\d+)$/
          );


        if (!match) {
          return;
        }


        const numero =
          parseInt(
            match[1],
            10
          );


        if (
          numero > maximo
        ) {

          maximo =
            numero;
        }
      }
    );


    return (
      'HIS-' +
      String(
        maximo + 1
      ).padStart(
        4,
        '0'
      )
    );


  } finally {

    lock.releaseLock();
  }
}