const bcrypt = require('bcryptjs');
const { JSONCookie } = require('cookie-parser');
const sql = require('mssql');
const config = require('../config/dbConn');

const getData  = async (req, res) => {

    console.log("ver resultados test");

    try {

        //Queries regulares
        const pool = await sql.connect(config);
        const egresos = await pool.request().query("SELECT e.ID_Cuenta, e.Nombre, g.Cargo_Cuenta, g.Saldo_Cuenta, e.Codigo FROM [dbo].[cuenta] e LEFT JOIN (SELECT ID_Cuenta, SUM(Cargo) AS Cargo_Cuenta, MAX(Saldo) AS Saldo_Cuenta FROM [dbo].[movimiento] GROUP BY ID_Cuenta) g ON e.ID_Cuenta = g.ID_Cuenta WHERE Cargo_Cuenta IS NOT NULL AND (Codigo LIKE '50[1-5]%');")
        const listaEgresos = egresos.recordsets[0];

        const ingresos = await pool.request().query("SELECT C.ID_Cuenta, C.Nombre AS Nombre1, M.Abono_Total1, M.Saldo_Total1, C.Codigo FROM [dbo].[cuenta] AS C LEFT JOIN (SELECT M.ID_Cuenta, SUM(Abono) AS Abono_Total1, MIN(Saldo) AS Saldo_Total1 FROM [dbo].[movimiento] AS M GROUP BY ID_Cuenta) M ON C.ID_Cuenta = M.ID_Cuenta WHERE Abono_Total1 IS NOT NULL AND (Codigo LIKE ('400%'));")
        const listaIngresos = ingresos.recordsets[0];

        //Queries para sacar Utilidad
        const egresosP = await pool.request().query("SELECT SUM(g.Cargo_Cuenta) AS Cargo_Total FROM [dbo].[cuenta] e LEFT JOIN (SELECT ID_Cuenta, SUM(Cargo) AS Cargo_Cuenta, MAX(Saldo) AS Saldo_Cuenta FROM [dbo].[movimiento] GROUP BY ID_Cuenta)  g ON e.ID_Cuenta = g.ID_Cuenta WHERE Cargo_Cuenta IS NOT NULL AND (Codigo LIKE '50[1-9]%');")
        const listaEgresosP = egresosP.recordsets[0];

        const ingresosP = await pool.request().query("SELECT SUM(g.Abono_Cuenta) AS Abono_Total FROM [dbo].[cuenta] e LEFT JOIN ( SELECT ID_Cuenta, SUM(Abono) AS Abono_Cuenta, MIN(Saldo) AS Saldo_Cuenta FROM [dbo].[movimiento] GROUP BY ID_Cuenta )  g ON e.ID_Cuenta = g.ID_Cuenta WHERE Abono_Cuenta IS NOT NULL AND (Codigo LIKE '40[0-6]%');")
        const listaIngresosP = ingresosP.recordsets[0];

        const egresosA = await pool.request().query("SELECT SUM(g.Saldo_Cuenta) AS Saldo_TotalE FROM [dbo].[cuenta] e LEFT JOIN ( SELECT ID_Cuenta, MAX(Saldo) AS Saldo_Cuenta FROM [dbo].[movimiento] GROUP BY ID_Cuenta)  g ON e.ID_Cuenta = g.ID_Cuenta WHERE Saldo_Cuenta IS NOT NULL AND (Codigo LIKE '50[1-9]%'); ")
        const listaEgresosA = egresosA.recordsets[0];

        const ingresosA = await pool.request().query("SELECT SUM(g.Saldo_Cuenta) AS Saldo_Totali FROM [dbo].[cuenta] e LEFT JOIN ( SELECT ID_Cuenta, MIN(Saldo) AS Saldo_Cuenta FROM [dbo].[movimiento] GROUP BY ID_Cuenta)  g ON e.ID_Cuenta = g.ID_Cuenta WHERE Saldo_Cuenta IS NOT NULL AND (Codigo LIKE '40[0-6]%');")
        const listaIngresosA = ingresosA.recordsets[0];
        
        //Queries para sacar porcentaje
        const EgresosPorP = await pool.request().query("SELECT e.ID_Cuenta, g.Cargo_CuentaP, e.Codigo FROM [dbo].[cuenta] e LEFT JOIN (SELECT ID_Cuenta, SUM(Cargo) AS Cargo_CuentaP FROM [dbo].[movimiento] GROUP BY ID_Cuenta) g ON e.ID_Cuenta = g.ID_Cuenta WHERE Cargo_CuentaP IS NOT NULL AND (Codigo LIKE '50[1-9]%');")
        const listaEgresosPorP = EgresosPorP.recordsets[0];

        const EgresosPorA = await pool.request().query("SELECT e.ID_Cuenta, g.Saldo_CuentaA, e.Codigo FROM [dbo].[cuenta] e LEFT JOIN (SELECT ID_Cuenta, MAX(Saldo) AS Saldo_CuentaA FROM [dbo].[movimiento] GROUP BY ID_Cuenta) g ON e.ID_Cuenta = g.ID_Cuenta WHERE Saldo_CuentaA IS NOT NULL AND (Codigo LIKE '50[1-9]%');")
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
        var totalP = listaIngresos[0].Abono_Total1;
        var totalA = listaIngresos[0].Saldo_Total1;
    
        for (i = 0; i < tamano; i++)
        {
            listaEgresos[i].PorcentajeP = ((listaEgresosPorP[i].Cargo_CuentaP / totalP) * 100).toFixed(2);
            listaEgresos[i].PorcentajeA = ((listaEgresosPorA[i].Saldo_CuentaA  / totalA) * 100).toFixed(2);
    
        }
        for (i = 0; i < 1; i++)
        {
            listaEgresos[i].PorcentajePi = ((totalP / totalP) * 100).toFixed(2);
            listaEgresos[i].PorcentajeAi = ((totalA / totalA) * 100).toFixed(2);
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
       
        res.json(listaEgresos);

    } 
    
    catch (error){
       console.log(error);
    }
}

module.exports = getData; 