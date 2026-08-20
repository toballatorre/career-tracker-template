/*******************************************************
 * POSTULACIONES.GS
 *
 * Gestión automática de la tabla Postulaciones.
 *
 * Estructura:
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
 * AUTOMATIZACIÓN:
 *
 * - Genera automáticamente JOB-XXXX.
 * - Inserta XLOOKUP para obtener ID Empresa.
 * - Inserta XLOOKUP para obtener ID Estado.
 *
 *******************************************************/


const CONFIG_POSTULACIONES = {

  hoja: 'Postulaciones',

  columnas: {

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

  prefijo: 'JOB'
};


/*******************************************************
 * PROCESAR POSTULACIÓN
 *
 * Esta es la función pública llamada por Router.gs.
 *******************************************************/

function procesarPostulacion(e) {

  if (!e || !e.range) {
    return;
  }


  const hoja =
    e.range.getSheet();


  if (
    hoja.getName() !==
    CONFIG_POSTULACIONES.hoja
  ) {
    return;
  }


  /*
   * Ignorar encabezado.
   */

  if (
    e.range.getRow() === 1
  ) {
    return;
  }


  const filaInicial =
    e.range.getRow();


  const cantidadFilas =
    e.range.getNumRows();


  for (
    let i = 0;
    i < cantidadFilas;
    i++
  ) {

    procesarPostulacionFila_(
      hoja,
      filaInicial + i
    );
  }
}


/*******************************************************
 * PROCESAR FILA
 *******************************************************/

function procesarPostulacionFila_(
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


  const id =
    datos[
      CONFIG_POSTULACIONES.columnas.id - 1
    ];


  /***************************************************
   * COMPROBAR FILA VACÍA
   ***************************************************/

  const filaVacia =
    datos.every(
      valor =>
        valor === '' ||
        valor === null
    );


  if (filaVacia) {
    return;
  }


  /***************************************************
   * SI YA EXISTE ID
   *
   * No generamos otro ID.
   *
   * Tampoco volvemos a escribir las fórmulas,
   * para no interferir con una candidatura existente.
   ***************************************************/

  if (id) {
    return;
  }


  /***************************************************
   * GENERAR ID
   ***************************************************/

  const nuevoId =
    generarIdPostulacion_(
      hoja
    );


  /***************************************************
   * ESCRIBIR ID
   ***************************************************/

  hoja
    .getRange(
      fila,
      CONFIG_POSTULACIONES.columnas.id
    )
    .setValue(
      nuevoId
    );


  /***************************************************
   * INSERTAR FÓRMULA ID EMPRESA
   *
   * C = ID Empresa
   * D = Empresa
   *
   * Busca:
   *
   * Postulaciones[Empresa]
   *          ↓
   * Empresas[Name]
   *          ↓
   * Empresas[ID]
   *
   * Si no encuentra la empresa,
   * devuelve una celda vacía.
   ***************************************************/

  const formulaIdEmpresa =
    '=IFERROR(' +
    'XLOOKUP(' +
    'D' + fila + ',' +
    'Empresas[Name],' +
    'Empresas[ID]' +
    '),' +
    '""' +
    ')';


  hoja
    .getRange(
      fila,
      CONFIG_POSTULACIONES.columnas.idEmpresa
    )
    .setFormula(
      formulaIdEmpresa
    );


  /***************************************************
   * INSERTAR FÓRMULA ID ESTADO
   *
   * G = ID Estado
   * H = Estado
   *
   * Busca:
   *
   * Postulaciones[Estado]
   *          ↓
   * Estado_Postulacion[Name]
   *          ↓
   * Estado_Postulacion[ID]
   *
   * Si no encuentra el estado,
   * devuelve una celda vacía.
   ***************************************************/

  const formulaIdEstado =
    '=IFERROR(' +
    'XLOOKUP(' +
    'H' + fila + ',' +
    'Estado_Postulacion[Name],' +
    'Estado_Postulacion[ID]' +
    '),' +
    '""' +
    ')';


  hoja
    .getRange(
      fila,
      CONFIG_POSTULACIONES.columnas.idEstado
    )
    .setFormula(
      formulaIdEstado
    );
}


/*******************************************************
 * GENERAR ID DE POSTULACIÓN
 *
 * JOB-0001
 * JOB-0002
 * JOB-0003
 *
 * Busca el número más alto existente y genera
 * el siguiente.
 *******************************************************/

function generarIdPostulacion_(
  hoja
) {

  const lock =
    LockService.getScriptLock();


  lock.waitLock(30000);


  try {

    const ultimaFila =
      hoja.getLastRow();


    /*
     * Si solamente existe el encabezado,
     * comenzamos desde JOB-0001.
     */

    if (
      ultimaFila < 2
    ) {

      return 'JOB-0001';
    }


    const ids =
      hoja
        .getRange(
          2,
          CONFIG_POSTULACIONES.columnas.id,
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


        const coincidencia =
          String(id).match(
            /^JOB-(\d+)$/
          );


        if (!coincidencia) {
          return;
        }


        const numero =
          parseInt(
            coincidencia[1],
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
      'JOB-' +
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