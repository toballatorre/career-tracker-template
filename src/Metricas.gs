/*******************************************************
 * METRICAS.GS
 *
 * Métricas de búsqueda laboral.
 *
 * Tablas / rangos del template:
 *
 * Periodo
 * A2:B3
 *
 * Indicadores
 * D2:F10
 *
 * Conversiones
 * H2:J7
 *
 *
 * Fuentes:
 * - Historial
 * - Postulaciones
 * - Estado_Postulacion
 *
 *
 * IMPORTANTE:
 * Este archivo NO utiliza la Google Sheets API.
 * Todo se gestiona mediante SpreadsheetApp.
 *******************************************************/


const CONFIG_METRICAS = {

  hojas: {

    metricas: 'Metricas',

    historial: 'Historial',

    postulaciones: 'Postulaciones',

    estados: 'Estado_Postulacion'
  },


  rangos: {

    periodo: 'A2:B3',

    indicadores: 'D2:F10',

    conversiones: 'H2:J7'
  }
};


/*******************************************************
 * PROCESAR EDICIÓN
 *
 * Router.gs llama esta función cuando se edita
 * la hoja "Metricas".
 *******************************************************/

function procesarMetricas(e) {

  if (!e || !e.range) {
    return;
  }


  const hoja =
    e.range.getSheet();


  if (
    hoja.getName() !==
    CONFIG_METRICAS.hojas.metricas
  ) {
    return;
  }


  /*
   * Solo reaccionamos cuando la edición
   * ocurre dentro del rango de Periodo.
   *
   * Periodo:
   *
   * A2:B3
   */

  const rangoPeriodo =
    hoja.getRange(
      CONFIG_METRICAS.rangos.periodo
    );


  if (
    !rangoContieneRango_(
      rangoPeriodo,
      e.range
    )
  ) {
    return;
  }


  /*
   * Solo reaccionamos a cambios
   * en la columna Valor.
   *
   * Periodo:
   *
   * A = Parámetro
   * B = Valor
   */

  const columnaValor =
    rangoPeriodo.getColumn() + 1;


  if (
    e.range.getColumn() !==
    columnaValor
  ) {
    return;
  }


  actualizarMetricas();
}


/*******************************************************
 * ACTUALIZAR MÉTRICAS
 *******************************************************/

function actualizarMetricas() {

  const periodo =
    obtenerPeriodo_();


  const fechaInicio =
    inicioDelDia_(
      periodo.fechaInicio
    );


  const fechaFin =
    finDelDia_(
      periodo.fechaFin
    );


  if (
    fechaInicio >
    fechaFin
  ) {

    throw new Error(
      'La Fecha inicio no puede ser posterior a la Fecha fin.'
    );
  }


  /*
   * Estados desde Estado_Postulacion.
   */

  const estados =
    obtenerEstados_();


  /*
   * Datos.
   */

  const historial =
    obtenerHistorial_();


  const postulaciones =
    obtenerPostulaciones_();


  /*
   * Indicadores.
   */

  const indicadores =
    calcularIndicadores_(
      historial,
      postulaciones,
      fechaInicio,
      fechaFin,
      estados
    );


  /*
   * Escribir indicadores.
   */

  escribirIndicadores_(
    indicadores
  );


  /*
   * Conversiones.
   */

  const conversiones =
    calcularConversiones_(
      indicadores
    );


  /*
   * Escribir conversiones.
   */

  escribirConversiones_(
    conversiones
  );
}


/*******************************************************
 * COMPROBAR SI UN RANGO CONTIENE OTRO RANGO
 *******************************************************/

function rangoContieneRango_(
  rangoContenedor,
  rangoEvaluado
) {

  const filaInicio =
    rangoContenedor.getRow();

  const filaFin =
    filaInicio +
    rangoContenedor.getNumRows() -
    1;


  const columnaInicio =
    rangoContenedor.getColumn();

  const columnaFin =
    columnaInicio +
    rangoContenedor.getNumColumns() -
    1;


  const filaEvaluadaInicio =
    rangoEvaluado.getRow();

  const filaEvaluadaFin =
    filaEvaluadaInicio +
    rangoEvaluado.getNumRows() -
    1;


  const columnaEvaluadaInicio =
    rangoEvaluado.getColumn();

  const columnaEvaluadaFin =
    columnaEvaluadaInicio +
    rangoEvaluado.getNumColumns() -
    1;


  return (

    filaEvaluadaInicio >=
      filaInicio &&

    filaEvaluadaFin <=
      filaFin &&

    columnaEvaluadaInicio >=
      columnaInicio &&

    columnaEvaluadaFin <=
      columnaFin
  );
}


/*******************************************************
 * OBTENER PERÍODO
 *
 * Rango:
 *
 * A2:B3
 *
 * Parámetro | Valor
 *******************************************************/

function obtenerPeriodo_() {

  const hoja =
    SpreadsheetApp
      .getActiveSpreadsheet()
      .getSheetByName(
        CONFIG_METRICAS.hojas.metricas
      );


  if (!hoja) {

    throw new Error(
      'No existe la hoja "Metricas".'
    );
  }


  const rango =
    hoja.getRange(
      CONFIG_METRICAS.rangos.periodo
    );


  const datos =
    rango.getValues();


  let fechaInicio = null;

  let fechaFin = null;


  datos.forEach(
    fila => {

      const parametro =
        String(
          fila[0]
        ).trim();


      const valor =
        fila[1];


      if (
        parametro ===
        'Fecha inicio'
      ) {

        fechaInicio =
          valor;
      }


      if (
        parametro ===
        'Fecha fin'
      ) {

        fechaFin =
          valor;
      }
    }
  );


  if (
    !(fechaInicio instanceof Date)
  ) {

    throw new Error(
      'La tabla "Periodo" no contiene una Fecha inicio válida.'
    );
  }


  if (
    !(fechaFin instanceof Date)
  ) {

    throw new Error(
      'La tabla "Periodo" no contiene una Fecha fin válida.'
    );
  }


  return {

    fechaInicio,

    fechaFin
  };
}


/*******************************************************
 * OBTENER ESTADOS
 *
 * Estado_Postulacion:
 *
 * A = ID
 * B = Name
 * C = Evento
 *******************************************************/

function obtenerEstados_() {

  const ss =
    SpreadsheetApp
      .getActiveSpreadsheet();


  const hoja =
    ss.getSheetByName(
      CONFIG_METRICAS.hojas.estados
    );


  if (!hoja) {

    throw new Error(
      'No existe la hoja "Estado_Postulacion".'
    );
  }


  const ultimaFila =
    hoja.getLastRow();


  if (
    ultimaFila < 2
  ) {

    throw new Error(
      'La tabla Estado_Postulacion está vacía.'
    );
  }


  const datos =
    hoja
      .getRange(
        2,
        1,
        ultimaFila - 1,
        2
      )
      .getValues();


  const mapa =
    {};


  datos.forEach(
    fila => {

      const id =
        String(
          fila[0]
        ).trim();


      const nombre =
        String(
          fila[1]
        ).trim();


      if (
        id &&
        nombre
      ) {

        mapa[nombre] =
          id;
      }
    }
  );


  return {

    enviado:
      obtenerEstado_(
        mapa,
        'Enviado, esperando respuesta'
      ),


    primerContacto:
      obtenerEstado_(
        mapa,
        'Primer contacto'
      ),


    entrevista:
      obtenerEstado_(
        mapa,
        'Entrevista (realizada)'
      ),


    tecnica:
      obtenerEstado_(
        mapa,
        'Entrevista técnica (realizada)'
      ),


    psicologica:
      obtenerEstado_(
        mapa,
        'Entrevista psicológica (realizada)'
      ),


    oferta:
      obtenerEstado_(
        mapa,
        'Oferta'
      ),


    rechazado:
      obtenerEstado_(
        mapa,
        'Rechazado'
      ),


    retirado:
      obtenerEstado_(
        mapa,
        'Retirado'
      )
  };
}


/*******************************************************
 * OBTENER ESTADO
 *******************************************************/

function obtenerEstado_(
  mapa,
  nombre
) {

  if (
    !mapa[nombre]
  ) {

    throw new Error(
      'No existe el estado "' +
      nombre +
      '" en Estado_Postulacion.'
    );
  }


  return mapa[nombre];
}


/*******************************************************
 * OBTENER HISTORIAL
 *
 * Historial:
 *
 * A = ID
 * B = ID Candidatura
 * C = Fecha
 * D = ID Empresa
 * E = Cargo
 * F = ID Estado
 * G = Evento
 *******************************************************/

function obtenerHistorial_() {

  const ss =
    SpreadsheetApp
      .getActiveSpreadsheet();


  const hoja =
    ss.getSheetByName(
      CONFIG_METRICAS.hojas.historial
    );


  if (!hoja) {

    throw new Error(
      'No existe la hoja "Historial".'
    );
  }


  const ultimaFila =
    hoja.getLastRow();


  if (
    ultimaFila < 2
  ) {

    return [];
  }


  return hoja
    .getRange(
      2,
      1,
      ultimaFila - 1,
      7
    )
    .getValues();
}


/*******************************************************
 * OBTENER POSTULACIONES
 *
 * Postulaciones:
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
 *******************************************************/

function obtenerPostulaciones_() {

  const ss =
    SpreadsheetApp
      .getActiveSpreadsheet();


  const hoja =
    ss.getSheetByName(
      CONFIG_METRICAS.hojas.postulaciones
    );


  if (!hoja) {

    throw new Error(
      'No existe la hoja "Postulaciones".'
    );
  }


  const ultimaFila =
    hoja.getLastRow();


  if (
    ultimaFila < 2
  ) {

    return [];
  }


  return hoja
    .getRange(
      2,
      1,
      ultimaFila - 1,
      11
    )
    .getValues();
}


/*******************************************************
 * CALCULAR INDICADORES
 *******************************************************/

function calcularIndicadores_(
  historial,
  postulaciones,
  fechaInicio,
  fechaFin,
  estados
) {

  const resultado = {

    postulacionesEnviadas: 0,

    primerosContactos: 0,

    entrevistasRealizadas: 0,

    entrevistasTecnicas: 0,

    entrevistasPsicologicas: 0,

    ofertas: 0,

    rechazos: 0,

    retirados: 0,

    candidaturasActivas: 0
  };


  /*
   * Eventos ocurridos durante
   * el período seleccionado.
   *
   * IMPORTANTE:
   *
   * Historial:
   *
   * F = ID Estado
   * G = Evento
   *
   * Por eso el ID Estado está
   * en índice 5 del array.
   */

  historial.forEach(
    fila => {

      const fecha =
        fila[2];


      const idEstado =
        String(
          fila[5]
        ).trim();


      if (
        !(fecha instanceof Date)
      ) {
        return;
      }


      if (
        fecha < fechaInicio ||
        fecha > fechaFin
      ) {
        return;
      }


      switch (
        idEstado
      ) {

        case estados.enviado:

          resultado
            .postulacionesEnviadas++;

          break;


        case estados.primerContacto:

          resultado
            .primerosContactos++;

          break;


        case estados.entrevista:

          resultado
            .entrevistasRealizadas++;

          break;


        case estados.tecnica:

          resultado
            .entrevistasTecnicas++;

          break;


        case estados.psicologica:

          resultado
            .entrevistasPsicologicas++;

          break;


        case estados.oferta:

          resultado
            .ofertas++;

          break;


        case estados.rechazado:

          resultado
            .rechazos++;

          break;


        case estados.retirado:

          resultado
            .retirados++;

          break;
      }
    }
  );


  /*
   * Candidaturas activas se calcula
   * sobre el estado ACTUAL de Postulaciones.
   */

  resultado
    .candidaturasActivas =
      calcularCandidaturasActivas_(
        postulaciones,
        estados
      );


  return resultado;
}


/*******************************************************
 * CANDIDATURAS ACTIVAS
 *******************************************************/

function calcularCandidaturasActivas_(
  postulaciones,
  estados
) {

  const estadosFinales = [

    estados.oferta,

    estados.rechazado,

    estados.retirado
  ];


  let cantidad = 0;


  postulaciones.forEach(
    fila => {

      /*
       * G = ID Estado
       */

      const idEstado =
        String(
          fila[6]
        ).trim();


      if (
        !idEstado
      ) {
        return;
      }


      if (
        !estadosFinales.includes(
          idEstado
        )
      ) {

        cantidad++;
      }
    }
  );


  return cantidad;
}


/*******************************************************
 * CALCULAR CONVERSIONES
 *******************************************************/

function calcularConversiones_(
  indicadores
) {

  return {

    primerContacto:
      calcularPorcentaje_(
        indicadores.primerosContactos,
        indicadores.postulacionesEnviadas
      ),


    entrevista:
      calcularPorcentaje_(
        indicadores.entrevistasRealizadas,
        indicadores.primerosContactos
      ),


    tecnica:
      calcularPorcentaje_(
        indicadores.entrevistasTecnicas,
        indicadores.entrevistasRealizadas
      ),


    psicologica:
      calcularPorcentaje_(
        indicadores.entrevistasPsicologicas,
        indicadores.entrevistasTecnicas
      ),


    oferta:
      calcularPorcentaje_(
        indicadores.ofertas,
        indicadores.postulacionesEnviadas
      ),


    rechazo:
      calcularPorcentaje_(
        indicadores.rechazos,
        indicadores.postulacionesEnviadas
      )
  };
}


/*******************************************************
 * CALCULAR PORCENTAJE
 *******************************************************/

function calcularPorcentaje_(
  numerador,
  denominador
) {

  if (
    denominador === 0
  ) {

    return 0;
  }


  return (
    numerador /
    denominador
  );
}


/*******************************************************
 * ESCRIBIR INDICADORES
 *
 * Rango de datos:
 *
 * D2:F10
 *
 * La columna Resultado se busca
 * dentro del rango para evitar
 * depender de una columna fija.
 *******************************************************/

function escribirIndicadores_(
  indicadores
) {

  const hoja =
    SpreadsheetApp
      .getActiveSpreadsheet()
      .getSheetByName(
        CONFIG_METRICAS.hojas.metricas
      );


  if (!hoja) {

    throw new Error(
      'No existe la hoja "Metricas".'
    );
  }


  const rango =
    hoja.getRange(
      CONFIG_METRICAS.rangos.indicadores
    );


  const datos =
    rango.getValues();


  /*
   * La fila de encabezados está
   * inmediatamente sobre el rango
   * de datos.
   *
   * Indicadores:
   *
   * D = Name
   * E = Descripcion
   * F = Resultado
   */

  const encabezados =
    hoja
      .getRange(
        rango.getRow() - 1,
        rango.getColumn(),
        1,
        rango.getNumColumns()
      )
      .getValues()[0];


  const columnaResultado =
    encabezados.indexOf(
      'Resultado'
    );


  if (
    columnaResultado === -1
  ) {

    throw new Error(
      'La tabla "Indicadores" no tiene una columna "Resultado".'
    );
  }


  const valores = [

    indicadores.postulacionesEnviadas,

    indicadores.primerosContactos,

    indicadores.entrevistasRealizadas,

    indicadores.entrevistasTecnicas,

    indicadores.entrevistasPsicologicas,

    indicadores.ofertas,

    indicadores.rechazos,

    indicadores.retirados,

    indicadores.candidaturasActivas
  ];


  if (
    valores.length !==
    rango.getNumRows()
  ) {

    throw new Error(
      'La cantidad de indicadores no coincide con las filas configuradas.'
    );
  }


  rango
    .offset(
      0,
      columnaResultado,
      valores.length,
      1
    )
    .setValues(
      valores.map(
        valor => [valor]
      )
    );
}


/*******************************************************
 * ESCRIBIR CONVERSIONES
 *
 * Rango de datos:
 *
 * H2:J7
 *******************************************************/

function escribirConversiones_(
  conversiones
) {

  const hoja =
    SpreadsheetApp
      .getActiveSpreadsheet()
      .getSheetByName(
        CONFIG_METRICAS.hojas.metricas
      );


  if (!hoja) {

    throw new Error(
      'No existe la hoja "Metricas".'
    );
  }


  const rango =
    hoja.getRange(
      CONFIG_METRICAS.rangos.conversiones
    );


  /*
   * H = Name
   * I = Descripcion
   * J = Resultado
   */

  const encabezados =
    hoja
      .getRange(
        rango.getRow() - 1,
        rango.getColumn(),
        1,
        rango.getNumColumns()
      )
      .getValues()[0];


  const columnaResultado =
    encabezados.indexOf(
      'Resultado'
    );


  if (
    columnaResultado === -1
  ) {

    throw new Error(
      'La tabla "Conversiones" no tiene una columna "Resultado".'
    );
  }


  const valores = [

    conversiones.primerContacto,

    conversiones.entrevista,

    conversiones.tecnica,

    conversiones.psicologica,

    conversiones.oferta,

    conversiones.rechazo
  ];


  if (
    valores.length !==
    rango.getNumRows()
  ) {

    throw new Error(
      'La cantidad de conversiones no coincide con las filas configuradas.'
    );
  }


  const rangoResultado =
    rango.offset(
      0,
      columnaResultado,
      valores.length,
      1
    );


  rangoResultado
    .setValues(
      valores.map(
        valor => [valor]
      )
    );


  rangoResultado
    .setNumberFormat(
      '0.0%'
    );
}


/*******************************************************
 * INICIO DEL DÍA
 *******************************************************/

function inicioDelDia_(
  fecha
) {

  const resultado =
    new Date(
      fecha
    );


  resultado.setHours(
    0,
    0,
    0,
    0
  );


  return resultado;
}


/*******************************************************
 * FIN DEL DÍA
 *******************************************************/

function finDelDia_(
  fecha
) {

  const resultado =
    new Date(
      fecha
    );


  resultado.setHours(
    23,
    59,
    59,
    999
  );


  return resultado;
}