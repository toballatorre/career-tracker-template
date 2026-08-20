/*******************************************************
 * EMPRESAS
 *
 * Gestión automática de la tabla Empresas.
 *
 * Estructura:
 *
 * A = ID
 * B = Name
 * C = Tipo
 * D = Industria
 * E = Pais
 * F = Rol
 * G = Fuente
 * H = Notas
 *******************************************************/


const CONFIG_EMPRESAS = {

  hoja: 'Empresas',

  columnas: {

    id: 1,

    nombre: 2,

    tipo: 3,

    industria: 4,

    pais: 5,

    rol: 6,

    fuente: 7,

    notas: 8
  },

  prefijo: 'EMP'
};


/*******************************************************
 * PROCESAR EMPRESA
 *
 * Esta es la función pública que llama Router.gs.
 *******************************************************/

function procesarEmpresa(e) {

  if (!e || !e.range) {
    return;
  }


  const hoja =
    e.range.getSheet();


  if (
    hoja.getName() !==
    CONFIG_EMPRESAS.hoja
  ) {
    return;
  }


  // Ignorar encabezado
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

    procesarEmpresaFila_(
      hoja,
      filaInicial + i
    );
  }
}


/*******************************************************
 * PROCESAR FILA DE EMPRESA
 *******************************************************/

function procesarEmpresaFila_(
  hoja,
  fila
) {

  const datos =
    hoja
      .getRange(
        fila,
        1,
        1,
        8
      )
      .getValues()[0];


  const id =
    datos[
      CONFIG_EMPRESAS.columnas.id - 1
    ];


  const nombre =
    datos[
      CONFIG_EMPRESAS.columnas.nombre - 1
    ];


  /*
   * Si no existe nombre,
   * no hacemos nada.
   */

  if (!nombre) {
    return;
  }


  /*
   * Si ya existe ID,
   * no lo modificamos.
   */

  if (id) {
    return;
  }


  /***************************************************
   * COMPROBAR DUPLICADO
   ***************************************************/

  const empresaExistente =
    buscarEmpresaPorNombre_(
      hoja,
      nombre,
      fila
    );


  if (empresaExistente) {

    console.warn(
      `La empresa "${nombre}" ya existe ` +
      `con ID ${empresaExistente}.`
    );

    return;
  }


  /***************************************************
   * GENERAR ID
   ***************************************************/

  const nuevoId =
    generarIdEmpresa_(hoja);


  /***************************************************
   * ESCRIBIR ID
   ***************************************************/

  hoja
    .getRange(
      fila,
      CONFIG_EMPRESAS.columnas.id
    )
    .setValue(nuevoId);
}


/*******************************************************
 * BUSCAR EMPRESA POR NOMBRE
 *******************************************************/

function buscarEmpresaPorNombre_(
  hoja,
  nombre,
  filaActual
) {

  const ultimaFila =
    hoja.getLastRow();


  if (
    ultimaFila < 2
  ) {
    return null;
  }


  const datos =
    hoja
      .getRange(
        2,
        CONFIG_EMPRESAS.columnas.id,
        ultimaFila - 1,
        2
      )
      .getValues();


  const nombreBuscado =
    normalizarEmpresa_(
      nombre
    );


  for (
    let i = 0;
    i < datos.length;
    i++
  ) {

    const filaReal =
      i + 2;


    // Ignorar la fila actual
    if (
      filaReal === filaActual
    ) {
      continue;
    }


    const id =
      datos[i][0];

    const nombreExistente =
      datos[i][1];


    if (!nombreExistente) {
      continue;
    }


    if (
      normalizarEmpresa_(
        nombreExistente
      ) === nombreBuscado
    ) {

      return id;
    }
  }


  return null;
}


/*******************************************************
 * GENERAR ID EMPRESA
 *******************************************************/

function generarIdEmpresa_(hoja) {

  const lock =
    LockService.getScriptLock();


  lock.waitLock(30000);


  try {

    const ultimaFila =
      hoja.getLastRow();


    if (
      ultimaFila < 2
    ) {

      return 'EMP-0001';
    }


    const ids =
      hoja
        .getRange(
          2,
          CONFIG_EMPRESAS.columnas.id,
          ultimaFila - 1,
          1
        )
        .getValues()
        .flat();


    let maximo = 0;


    ids.forEach(id => {

      if (!id) {
        return;
      }


      const coincidencia =
        String(id).match(
          /^EMP-(\d+)$/
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
    });


    return (
      'EMP-' +
      String(
        maximo + 1
      ).padStart(4, '0')
    );


  } finally {

    lock.releaseLock();
  }
}


/*******************************************************
 * NORMALIZAR NOMBRE DE EMPRESA
 *******************************************************/

function normalizarEmpresa_(texto) {

  if (
    texto === null ||
    texto === undefined
  ) {

    return '';
  }


  return String(texto)
    .trim()
    .toLowerCase()
    .replace(
      /\s+/g,
      ' '
    );
}