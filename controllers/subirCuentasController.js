const sql = require('mssql');
const config = require('../config/dbConn');
const xlsx = require('xlsx');



const subirCuentas = async (req, res) => {

    console.log("Testing Subir Cuentas");

    //Variables para asignación de IDS
    var idUsuario = req.body.idUsuario;
    var idEmpresa = req.body.idEmpresa;
    console.log(idUsuario);
    console.log(idEmpresa);

    // Interpretar archivo y convertirlo a Json
    var workbook = xlsx.read(req.file.buffer);
    // console.log(req.file);
    // console.log(req.file.buffer);
    var sheet_name_list = workbook.SheetNames;
    var data = xlsx.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);

    // Variables para manejo e inserción
    // console.log("Data Completa recién asignada");
    // console.log(data);
    // console.log("Tamaño");
    // console.log(data.length);

    //Se define el tamaño de todo según los contenidos
    const size = data.length;

    // Cuentas tendrá data en formato json
    var cuentas = [];
    // Variable para indice de cuentas
    var k = 0;

    // sqlCuen tendrá cuentas en formato de arreglo, para inyección individual en cada query
    var sqlCuen = [];
    // Variable apra indice de sqlCuen dentro de la inyección a la base de datos
    var ind = 0;

    //Convertir cada línea horizontal en un objeto fijo para poder acceder al valor dado iterando
    for (var i = 0; i < size; i++)
    {
    data[i] = Object.values(data[i]);
    }
    

    try {

       
        // Inserción en base de datos. Es necesario solo almacenar las cuentas, no toda la información (encabezado y pie)
        //Ciclo para almacenar los valores en cuentas, al mismo tiempo que se insertan en la base de datos
        for (var i = 0; i < size; i++)
        {
            //Se comprueba que el primer elemento sea un número, verificación de que el dato sea un nivel de cuenta
            if (typeof(data[i][0]) == typeof(13))
            {
                //Se llena de elementos vacíos acorde al tamaño, iterativamente
                cuentas.push(
                    {
                    "Nivel": "",
                    "Codigo": "",
                    "Nombre": "",
                    "Tipo": "",
                    "Afectable": ""
                    }
                );

                // Se asignan los valores de data (que ya estamos seguros que es una cuenta) a cuentas
                cuentas[k].Nivel = data[i][0];
                cuentas[k].Codigo = data[i][1];
                cuentas[k].Nombre = data[i][2];
                cuentas[k].Tipo = data[i][3];
                //Pequeña verificación y conversión de string a bool
                if (data[k][4] == "Afectable")
                {
                    cuentas[k].Afectable = true;
                } else {
                    cuentas[k].Afectable = false;
                }

                // Inserción en sqlCuen para el formato específico y requerido
                sqlCuen.push([]);
                sqlCuen[k].push(cuentas[k].Nivel);
                sqlCuen[k].push(cuentas[k].Codigo);
                sqlCuen[k].push(cuentas[k].Nombre);
                sqlCuen[k].push(cuentas[k].Tipo);
                sqlCuen[k].push(cuentas[k].Afectable);
                sqlCuen[k].push(idEmpresa); // ID_Empresa
                sqlCuen[k].push(idUsuario); // ID_Usuario

                //Inserción en la base de datos de los respectivos atributos
                sql.connect(config, function (err) {
                if (err) console.log(err);
                let sqlRequest = new sql.Request();
                // console.log("indice");
                // console.log(ind);
                // console.log("k");
                // console.log(k);

                // Asignación de las variables a insertar en cada query
                sqlRequest.input('niv', sql.SmallInt, sqlCuen[ind][0]);
                sqlRequest.input('cod', sql.VarChar, sqlCuen[ind][1]);
                sqlRequest.input('nom', sql.VarChar, sqlCuen[ind][2]);
                sqlRequest.input('tip', sql.VarChar, sqlCuen[ind][3]);
                sqlRequest.input('afe', sql.Bit, sqlCuen[ind][4]);
                sqlRequest.input('ide', sql.SmallInt, sqlCuen[ind][5]);
                sqlRequest.input('idu', sql.SmallInt, sqlCuen[ind][6]);
                // Se inicia con k teniendo valor final, por lo que se necesita un indice para manejo interno en la función
                ind++;


                // console.log("Cuentas completas antes solicitud");
                // console.log(cuentas);
                // console.log("Cuentas indice 0");
                // console.log(cuentas[0]);
                // console.log("cuentas 0 Nivel");
                // console.log(cuentas[0].Nivel);

                
                let sqlQuery = "INSERT INTO cuenta (Nivel, Codigo, Nombre, Tipo, Es_Afectable, ID_Empresa, ID_Usuario) VALUES (@niv, @cod, @nom, @tip, @afe, @ide, @idu)";
                // let sqlQuery = "SELECT * FROM Cuenta";

                sqlRequest.query(sqlQuery, function(err, data){
                    if(err) console.log(err)
                    // console.log(sqlCuen);
                    // res.send(data);

                    });
                });

                //Aumento del índice que tendra cuentas, debido al desface que existe debido al encabezado
                k++;
            
            }
        }

        //Verificación final de los valores que contiene cuentas después del ciclo
        console.log("sqlCuentas");
        console.log(sqlCuen);
        console.log(sqlCuen.length);

        return res.status(201).send(sqlCuen);
       

    } catch (error) {
        console.log(error);

        res.status(500).json({ 'message': err.message });
    }
}

module.exports = subirCuentas;