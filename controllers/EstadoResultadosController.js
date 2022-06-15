const bcrypt = require('bcryptjs');
const { JSONCookie } = require('cookie-parser');
const sql = require('mssql');
const config = require('../config/dbConn');

const getData  = async (req, res) => {

    console.log("ver resultados test");
    
    try {

        const fechaInicio = new String(req.body.fechaI);
        const fechaFinal = new String(req.body.fechaF);
        const idEmpresa = req.body.idEmpresa;
        console.log(idEmpresa);

        const pool = await sql.connect(config);

        var comp = await pool.request().query("SELECT * FROM [dbo].[cuenta] c WHERE c.ID_Empresa = '" + idEmpresa + "';");
        const compSize = comp.recordsets[0].length;
        console.log("compsize");
        console.log(compSize);
        if (compSize == 0)
        {
            console.log("No hay registros");
            comp = false;
            return res.status(500);

        }
        else {
            comp = true;
        
        //Queries regulares
        const pool = await sql.connect(config);
        const egresos = await pool.request().query("SELECT e.ID_Cuenta, e.Nombre, g.Cargo_Cuenta, (e.Saldo + g.Cargo_Cuenta) AS Saldo_Cuenta, e.Codigo FROM [dbo].[cuenta] e LEFT JOIN (SELECT ID_Cuenta, SUM(Cargo) AS Cargo_Cuenta, (SUM(Cargo) - SUM(Abono)) AS Abono_Cuenta FROM [dbo].[movimiento] WHERE (Fecha between '" + fechaInicio + "' AND '" + fechaFinal + "') GROUP BY ID_Cuenta) g ON e.ID_Cuenta = g.ID_Cuenta WHERE Cargo_Cuenta IS NOT NULL AND (Codigo LIKE '50[1-5]%') AND e.ID_Empresa =  '" + idEmpresa + "';")
        const listaEgresos = egresos.recordsets[0];

        const ingresos = await pool.request().query("SELECT C.ID_Cuenta, C.Nombre AS Nombre1, M.Abono_Total1, M.Saldo_Total1, C.Codigo FROM [dbo].[cuenta] AS C LEFT JOIN (SELECT M.ID_Cuenta, SUM(Abono) AS Abono_Total1, MIN(Saldo) AS Saldo_Total1 FROM [dbo].[movimiento] AS M WHERE (Fecha between '" + fechaInicio + "' AND '" + fechaFinal + "') GROUP BY ID_Cuenta) M ON C.ID_Cuenta = M.ID_Cuenta WHERE Abono_Total1 IS NOT NULL AND (Codigo LIKE ('400%')) AND c.ID_Empresa =  '" + idEmpresa + "';")
        const listaIngresos = ingresos.recordsets[0];

        //Queries para sacar Utilidad
        const egresosP = await pool.request().query("SELECT SUM(g.Cargo_Cuenta) AS Cargo_Total FROM [dbo].[cuenta] e LEFT JOIN (SELECT ID_Cuenta, SUM(Cargo) AS Cargo_Cuenta, MAX(Saldo) AS Saldo_Cuenta FROM [dbo].[movimiento] WHERE (Fecha between '" + fechaInicio + "' AND '" + fechaFinal + "') GROUP BY ID_Cuenta)  g ON e.ID_Cuenta = g.ID_Cuenta WHERE Cargo_Cuenta IS NOT NULL AND (Codigo LIKE '50[1-9]%') AND e.ID_Empresa =  '" + idEmpresa + "';")
        const listaEgresosP = egresosP.recordsets[0];

        const ingresosP = await pool.request().query("SELECT SUM(g.Abono_Cuenta) AS Abono_Total FROM [dbo].[cuenta] e LEFT JOIN ( SELECT ID_Cuenta, SUM(Abono) AS Abono_Cuenta, MIN(Saldo) AS Saldo_Cuenta FROM [dbo].[movimiento] WHERE (Fecha between '" + fechaInicio + "' AND '" + fechaFinal + "') GROUP BY ID_Cuenta )  g ON e.ID_Cuenta = g.ID_Cuenta WHERE Abono_Cuenta IS NOT NULL AND (Codigo LIKE '40[0-6]%') AND e.ID_Empresa =  '" + idEmpresa + "';")
        const listaIngresosP = ingresosP.recordsets[0];

        const egresosA = await pool.request().query("SELECT SUM(g.Saldo_Cuenta) AS Saldo_TotalE FROM [dbo].[cuenta] e LEFT JOIN ( SELECT ID_Cuenta, MAX(Saldo) AS Saldo_Cuenta FROM [dbo].[movimiento] WHERE (Fecha between '" + fechaInicio + "' AND '" + fechaFinal + "') GROUP BY ID_Cuenta)  g ON e.ID_Cuenta = g.ID_Cuenta WHERE Saldo_Cuenta IS NOT NULL AND (Codigo LIKE '50[1-9]%') AND e.ID_Empresa =  '" + idEmpresa + "';")
        const listaEgresosA = egresosA.recordsets[0];

        const ingresosA = await pool.request().query("SELECT SUM(g.Saldo_Cuenta) AS Saldo_Totali FROM [dbo].[cuenta] e LEFT JOIN ( SELECT ID_Cuenta, MIN(Saldo) AS Saldo_Cuenta FROM [dbo].[movimiento] WHERE (Fecha between '" + fechaInicio + "' AND '" + fechaFinal + "') GROUP BY ID_Cuenta)  g ON e.ID_Cuenta = g.ID_Cuenta WHERE Saldo_Cuenta IS NOT NULL AND (Codigo LIKE '40[0-6]%') AND e.ID_Empresa =  '" + idEmpresa + "';")
        const listaIngresosA = ingresosA.recordsets[0];
        
        //Queries para sacar porcentaje
        const EgresosPorP = await pool.request().query("SELECT e.ID_Cuenta, g.Cargo_CuentaP, e.Codigo FROM [dbo].[cuenta] e LEFT JOIN (SELECT ID_Cuenta, SUM(Cargo) AS Cargo_CuentaP FROM [dbo].[movimiento] WHERE (Fecha between '" + fechaInicio + "' AND '" + fechaFinal + "') GROUP BY ID_Cuenta) g ON e.ID_Cuenta = g.ID_Cuenta WHERE Cargo_CuentaP IS NOT NULL AND (Codigo LIKE '50[1-9]%') AND e.ID_Empresa =  '" + idEmpresa + "';")
        const listaEgresosPorP = EgresosPorP.recordsets[0];

        const EgresosPorA = await pool.request().query("SELECT e.ID_Cuenta, g.Saldo_CuentaA, e.Codigo FROM [dbo].[cuenta] e LEFT JOIN (SELECT ID_Cuenta, MAX(Saldo) AS Saldo_CuentaA FROM [dbo].[movimiento] WHERE (Fecha between '" + fechaInicio + "' AND '" + fechaFinal + "') GROUP BY ID_Cuenta) g ON e.ID_Cuenta = g.ID_Cuenta WHERE Saldo_CuentaA IS NOT NULL AND (Codigo LIKE '50[1-9]%') AND e.ID_Empresa =  '" + idEmpresa + "';")
        const listaEgresosPorA = EgresosPorA.recordsets[0];
        
        //Saca el valor de la Utilidad columna Periodo
        listaEgresosP[0].Cargo_Total = Number(listaEgresosP[0].Cargo_Total);
        listaIngresosP[0].Abono_Total = Number(listaIngresosP[0].Abono_Total);
        auxUtilidadP = (listaIngresosP[0].Abono_Total - listaEgresosP[0].Cargo_Total).toFixed(2);

        //Saca el valor de la utilidad columna Acomulado
        listaEgresosA[0].Saldo_TotalE = Number(listaEgresosA[0].Saldo_TotalE);
        listaIngresosA[0].Saldo_Totali = Number(listaIngresosA[0].Saldo_Totali);
        auxUtilidadA = (listaIngresosA[0].Saldo_Totali - listaEgresosA[0].Saldo_TotalE);
        

        listaEgresos[0] = Object.assign(listaEgresosP[0], listaIngresosP[0],
            listaEgresosA[0], listaIngresosA[0], listaEgresos[0], listaIngresos[0]);

           /* for (i in listaEgresos){
        auxPorcentageA = (listaEgresosPorA[i].Saldo_CuentaA / listaIngresos[i].Saldo_Total1) * 100;
    }*/

    //Saca el valor de los porcentajes
        var tamano = listaEgresosPorP.length;
        console.log(listaIngresos)

        if (listaIngresos.length == 0){
          var totalP = 0
          var totalA = 0
        }
        else{
          var totalP = listaIngresos[0].Abono_Total1;
          var totalA = listaIngresos[0].Saldo_Total1;
        }
      
        
        for (i = 0; i < tamano; i++)
        {
          if (totalP == 0){
            listaEgresos[i].PorcentajeP = 0;
          }
          else{
            listaEgresos[i].PorcentajeP = ((listaEgresosPorP[i].Cargo_CuentaP / totalP) * 100).toFixed(2);
          }

          if (totalA == 0){
            listaEgresos[i].PorcentajeA = 0;
          }
          else{
            listaEgresos[i].PorcentajeA = ((listaEgresosPorA[i].Saldo_CuentaA  / totalA) * 100).toFixed(2);
          }
            
    
        }

        for (i = 0; i < 1; i++)
        {
          if (totalP == 0){
            listaEgresos[i].PorcentajeP = 0;
          }
          else{
            listaEgresos[i].PorcentajePi = ((totalP / totalP) * 100).toFixed(2);
          }

          if (totalA == 0){
            listaEgresos[i].PorcentajeA = 0;
          }
          else{
            listaEgresos[i].PorcentajeAi = ((totalA / totalA) * 100).toFixed(2);
          }
            
    
        }

        

    
        // console.log("tamanos");
        // console.log(tamano);
        // console.log(tamano2);


    

        //Guarda el valor de la utilidad
        utilidad = [auxUtilidadP, auxUtilidadA];
        listaEgresos[tamano] = utilidad;
                
        

        
        //console.log(auxPorcentageP);
        //console.log(auxPorcentageA);
        
        console.log(listaEgresos);
        console.log(fechaInicio)
        console.log(fechaFinal)
       
      res.json(listaEgresos);
        }

    } 
    
    catch (error){
       console.log(error);
    }
}

module.exports = getData;