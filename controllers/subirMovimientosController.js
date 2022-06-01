const sql = require('mssql');
const config = require('../config/dbConn');
const xlsx = require('xlsx');



const subirMovimientos = async (req, res) => {

    console.log("Testing Subir Movimientos");

    //Variables de ID
    var idEmpresa = req.body.idEmpresa;
    console.log(idEmpresa);
    var idCuenta = 0;

    var workbook = xlsx.read(req.file.buffer);
    var sheet_name_list = workbook.SheetNames;
    var data = xlsx.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
    var account = "";
    var count = 0;
    var movimientos = [];
    // SQL
    var sqlMov = [];
    var ind = 0;

    var sqlCuen = [];
    var indCuen = 0;
    var sqlIndCuen = 0;



    try {


        for (let line of data) {
            if (Object.keys(line).length >= 4 && line["CONTPAQ i"] !== undefined && line["__EMPTY"] !== "") {
                if (String(line["CONTPAQ i"]).match(/\d{3}-\d{3}/)) {
                    account = line["CONTPAQ i"];
                    sqlCuen.push([]);
                    sqlCuen[indCuen].push(account);
                    // sqlCuen[indCuen].push(new Date(line["CONTPAQ i"]).toLocaleDateString('en-ZA'));
                    sqlCuen[indCuen].push(new Date("2020-01-01").toLocaleDateString('en-ZA'));
                    sqlCuen[indCuen].push(line["Hoja:      1"]);
                    // console.log(sqlCuen);
                    indCuen++;
    


                    //Update en la base de datos de los respectivos atributos
                    sql.connect(config, function (err) {
                      if (err) console.log(err);
                      let sqlRequest = new sql.Request();
                      // console.log("indice");
                      // console.log(ind);
                      // console.log("count");
                      // console.log(count);
    
                      // Asignación de las variables a insertar en cada query
                      sqlRequest.input('cod', sql.VarChar, sqlCuen[sqlIndCuen][0]);
                      sqlRequest.input('fec', sql.Date, sqlCuen[sqlIndCuen][1]);
                      sqlRequest.input('sal', sql.Float, sqlCuen[sqlIndCuen][2]);
                      sqlRequest.input('idemp', sql.SmallInt, idEmpresa);

                      //console.log(sqlCuen);
    
                      // Se inicia con cont teniendo valor final, por lo que se necesita un indice para manejo interno en la función
                      // console.log("Prueba");
                      // console.log(sqlCuen[sqlIndCuen][1]);
                      // console.log(typeof(sqlMov[sqlIndCuen][1]));
                      sqlIndCuen++;
    
                      let sqlQuerySe = 'SELECT ID_Cuenta, Codigo FROM cuenta WHERE Codigo = @cod AND ID_Empresa = @idemp';
                      sqlRequest.query(sqlQuerySe, function(err, data){
                        if(err) console.log(err)
                        // console.log(data.recordsets[0][0].ID_Cuenta);
                        idCuenta = data.recordsets[0][0].ID_Cuenta;
                        codigo = data.recordsets[0][0].Codigo;
                        console.log(idCuenta);
                        insertarMovimientos(idCuenta, codigo, movimientos);

                        //insertarMovimientos(ind, idCuenta);
                        ind++;
                        // res.send(data);
    
                      });

                      //console.log(idCuenta);

                      let sqlQueryUp = 'UPDATE cuenta SET Fecha = @fec, Saldo = @sal WHERE Codigo = @cod AND ID_Empresa = @idemp';
                      // let sqlQueryUp = "SELECT * FROM Movimiento";
    
                     sqlRequest.query(sqlQueryUp, function(err, data){
                        if(err) console.log(err)
                        // console.log(sqlMov);
                        // res.send(data);
    
                      });
                    });
    
    
                } else {
                    if (Object.keys(line).length >= 6 && line["CONTPAQ i"] !== "Fecha") {
    
                      // Inserción del nuevo movimiento a llenar de información
                      movimientos.push(
                        {
                          "Cuenta": "",
                          "Fecha": "",
                          "Tipo": "",
                          "Numero": "",
                          "Concepto": "",
                          "Referencia": "",
                          "Cargo": "",
                          "Abono": "",
                          "Saldo": "",
                          "Codigo": ""
                        });

                        // Codigo esta solo para verificacion al momento de insertar los datos en la base de datos
                        movimientos[count].Codigo = account;
    
                        // Cambios para intentar inserción
                        movimientos[count].Cuenta = account;
                        movimientos[count].Fecha = new Date(line["CONTPAQ i"]).toLocaleDateString('en-ZA');
                        movimientos[count].Tipo = line["__EMPTY"];
                        movimientos[count].Numero = line["__EMPTY_1"];
                        movimientos[count].Concepto = line["Lecar Consultoria en TI, S.C."];
    
                        // Revisión de si referencia es indefinido para insertar string vacío en la base de datos
                        if (typeof(line["__EMPTY_2"]) == typeof(""))
                        {
                          movimientos[count].Referencia = line["__EMPTY_2"];
                        } else 
                        {
                          movimientos[count].Referencia = "";
                        }
    
                        // Revisión de si cargo o abono está vacío, para que el otro se almacene con un 0 y no como indefinido
                        if (typeof(line["__EMPTY_3"]) == typeof(1))
                        {
                          movimientos[count].Cargo = line["__EMPTY_3"];
                          movimientos[count].Abono = 0;
    
                        } else if ((typeof(line["__EMPTY_4"]) == typeof(1)))
                        {
                          movimientos[count].Cargo = 0;
                          movimientos[count].Abono = line["__EMPTY_4"];
    
                        }
                       
                        movimientos[count].Saldo = line["Hoja:      1"];
    
                        // console.log("Tipo Fecha");
                        // console.log(typeof(movimientos[count].Fecha))
    
    
                        // Inserción en sqlMov para el formato específico y requerido
                        sqlMov.push([]);
                        sqlMov[count].push(movimientos[count].Fecha);
                        sqlMov[count].push(movimientos[count].Tipo);
                        sqlMov[count].push(movimientos[count].Numero);
                        sqlMov[count].push(movimientos[count].Concepto);
                        sqlMov[count].push(movimientos[count].Referencia);
                        sqlMov[count].push(movimientos[count].Cargo);
                        sqlMov[count].push(movimientos[count].Abono);
                        sqlMov[count].push(movimientos[count].Saldo);
                        sqlMov[count].push(movimientos[count].Codigo); // Para verificacióndel array al insertar los datos
                        //sqlMov[count].push(idCuenta); // ID_Cuenta
    
    
    
    
    
                        count++;
                    }
                }
            }
        }
    
        //////////////////////////////////////////////////////////console.log(sqlMov);
        // console.log(count);
        // console.log(typeof(movimientos[0].Fecha));
        //console.log(sqlCuen.length);    
        //console.log(movimientos.Codigo);
    
        return res.status(201).send(sqlCuen);

       

    } catch (error) {
        console.log(error);

        res.status(500).json({ 'message': err.message });
    }
}

function insertarMovimientos(idCuenta, codigo, movimientos)
{
  //console.log(sqlMov);
  // Comprobación para verificar que el movimiento corresponda a dicho código 
  const movs = movimientos.filter(item => item.Codigo.indexOf(codigo) !== -1);
  console.log(movs);
  var cantMov = movs.length;
  var ind = 0;
  if (cantMov == 0)
  {
    return 0;
  }
  else
  {
    for (var i = 0; i < cantMov; i++)
    {
      console.log("else");
      //Inserción en la base de datos de los respectivos atributos
      sql.connect(config, function (err) {
        if (err) console.log(err);
        let sqlRequest = new sql.Request();
        // console.log("indice");
        // console.log(ind);
        // console.log("count");
        // console.log(count);

        // Asignación de las variables a insertar en cada query
        sqlRequest.input('fec', sql.Date, movs[ind].Fecha);
        sqlRequest.input('tip', sql.VarChar, movs[ind].Tipo);
        sqlRequest.input('num', sql.Int, movs[ind].Numero);
        sqlRequest.input('con', sql.VarChar, movs[ind].Concepto);
        sqlRequest.input('ref', sql.VarChar, movs[ind].Referencia);
        sqlRequest.input('car', sql.Float, movs[ind].Cargo);
        sqlRequest.input('abo', sql.Float, movs[ind].Abono);
        sqlRequest.input('sal', sql.Float, movs[ind].Saldo);
        sqlRequest.input('idc', sql.SmallInt, idCuenta);

        ind++;

        // Se inicia con k teniendo valor final, por lo que se necesita un indice para manejo interno en la función


        // console.log("Cuentas completas antes solicitud");
        // console.log(cuentas);
        // console.log("Cuentas indice 0");
        // console.log(cuentas[0]);
        // console.log("cuentas 0 Nivel");
        // console.log(cuentas[0].Nivel);
    
        let sqlQuery = "INSERT INTO movimiento (Fecha, Tipo, Numero, Concepto, Referencia, CArgo, Abono, Saldo, ID_Cuenta) VALUES (@fec, @tip, @num, @con, @ref, @car, @abo, @sal, @idc)";
        // let sqlQuery = "SELECT * FROM Movimiento";
        sqlRequest.query(sqlQuery, function(err, data){
          if(err) console.log(err)
          // console.log(sqlMov);
          // res.send(data);
        });
      });
    }
  }
}

module.exports = subirMovimientos;