/*******************************************************
 * ROUTER
 *
 * Único onEdit del proyecto.
 *
 * Decide qué módulo ejecutar según la hoja editada.
 *******************************************************/

function onEdit(e) {

  if (!e || !e.range) {
    return;
  }

  const hoja = e.range.getSheet();
  const nombreHoja = hoja.getName();


  /***************************************************
   * POSTULACIONES
   ***************************************************/

  if (nombreHoja === 'Postulaciones') {

    procesarPostulacion(e);

    procesarHistorial(e);

    return;
  }


  /***************************************************
   * EMPRESAS
   ***************************************************/

  if (nombreHoja === 'Empresas') {

    procesarEmpresa(e);

    return;
  }


  /***************************************************
   * MÉTRICAS
   ***************************************************/

  if (nombreHoja === 'Metricas') {

    procesarMetricas(e);

    return;
  }
}