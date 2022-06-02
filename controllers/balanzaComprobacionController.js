const bcrypt = require('bcrypt');
const sql = require('mssql');
const config = require('../config/dbConn');
    
const getData  = async (req, res) => {

    console.log("Testing ver balanza");

    try {
     
        const pool = await sql.connect(config);
        const cuentas = await pool.request().query("SELECT Codigo, Nombre, Nivel, c.DeudoraInicial, b.AcreedoraInicial, IIF(b.TipoSaldo = 'A', 'A', 'D' ) AS TipoSaldo FROM [dbo].[cuenta] a FULL JOIN( SELECT ID_Cuenta, [Saldo] AS AcreedoraInicial, TipoSaldo = 'A' FROM [dbo].[cuenta]  WHERE [Tipo] LIKE ('B%') OR [Tipo] LIKE ('D%') OR [Tipo] LIKE ('F%') OR [Tipo] LIKE ('H%'))b ON a.ID_Cuenta = b.[ID_Cuenta] FULL JOIN( SELECT ID_Cuenta, [Saldo] AS DeudoraInicial FROM [dbo].[cuenta] WHERE [Tipo] LIKE ('A%') OR [Tipo] LIKE ('G%')) c ON a.ID_Cuenta = c.[ID_Cuenta];");

        const listaCuentas = cuentas.recordsets[0]; 

        const mov = await pool.request().query("SELECT g.Cargo_Cuenta, g.Abono_Cuenta FROM [dbo].[cuenta] e LEFT JOIN (SELECT ID_Cuenta, SUM(Cargo) AS Cargo_Cuenta, SUM(Abono) AS Abono_Cuenta FROM [dbo].[movimiento] GROUP BY ID_Cuenta) g ON e.ID_Cuenta = g.ID_Cuenta;");
        const listaMovimientos = mov.recordsets[0]; 
        
        const saldoActual = {};
        
        //Ciclo Nivel 3
       for( i in listaMovimientos){
            if(listaCuentas[i].Nivel == 3 && listaCuentas[Number(i)+1].Nivel == 4){

                cont = Number(i) + 1;
                auxSumaCargo = 0;
                auxSumaAbono = 0;

                while(listaCuentas[cont].Nivel == 4){
                    auxSumaCargo += listaMovimientos[cont].Cargo_Cuenta;
                    auxSumaAbono += listaMovimientos[cont].Abono_Cuenta;
                    cont++;
                }

                if(listaMovimientos[i].Cargo_Cuenta == null){ 
                    listaMovimientos[i].Cargo_Cuenta = auxSumaCargo;
                }
                if(listaMovimientos[i].Abono_Cuenta == null){
                listaMovimientos[i].Abono_Cuenta = auxSumaAbono;
                }
                
            }
        }
        //Ciclo nivel 2
        for(i in listaMovimientos){
            
            if(listaCuentas[i].Nivel == 2 && i < (Object.keys(listaCuentas).length -1)){

                cont = Number(i) + 1 ;
                auxSumSaldoAcreedor = 0;
                auxSumSaldoDeudor = 0;
                auxSumaCargo = 0;
                auxSumaAbono = 0;
                
                while((listaCuentas[cont].Nivel) > 2 ){
                    if(listaCuentas[cont].Nivel == 3){
                       if(listaCuentas[i].TipoSaldo == 'D'){
                            auxSumSaldoDeudor -= listaCuentas[cont].AcreedoraInicial;
                            auxSumSaldoDeudor += listaCuentas[cont].DeudoraInicial;

                        }else if(listaCuentas[i].TipoSaldo == 'A'){
                            auxSumSaldoAcreedor += listaCuentas[cont].AcreedoraInicial;
                            auxSumSaldoAcreedor -= listaCuentas[cont].DeudoraInicial;
                        }
                    
                        auxSumaCargo += listaMovimientos[cont].Cargo_Cuenta;
                        auxSumaAbono += listaMovimientos[cont].Abono_Cuenta;
                    }
                    
                   cont++;
                   
                }
                if(listaCuentas[i].TipoSaldo == 'D'  && listaCuentas[i].DeudoraInicial == null){
                    listaCuentas[i].DeudoraInicial = auxSumSaldoDeudor;
                }
                else if(listaCuentas[i].TipoSaldo == 'A' && listaCuentas[i].AcreedoraInicial == null){
                    listaCuentas[i].AcreedoraInicial = auxSumSaldoAcreedor;
                }
                listaMovimientos[i].Cargo_Cuenta = auxSumaCargo;
                if(listaMovimientos[i].Abono_Cuenta == null){
                    listaMovimientos[i].Abono_Cuenta = auxSumaAbono;
                    }
                
            }
        }
        
        //ciclo nivel 1
        for(i in listaCuentas){
            if(listaCuentas[i].Nivel == 1 && i < (Object.keys(listaCuentas).length) -1){
                cont = Number(i) + 1;
                auxSumSaldoAcreedor = 0;
                auxSumSaldoDeudor = 0;
                auxSumaCargo = 0;
                auxSumaAbono = 0;

                while((listaCuentas[cont].Nivel) != 1  &&  cont < (Object.keys(listaCuentas).length) -1){
                    
                    if(listaCuentas[cont].Nivel == 2){
                        auxSumSaldoAcreedor += listaCuentas[cont].AcreedoraInicial;
                        auxSumSaldoDeudor += listaCuentas[cont].DeudoraInicial;
                        auxSumaCargo += listaMovimientos[cont].Cargo_Cuenta;
                        auxSumaAbono += listaMovimientos[cont].Abono_Cuenta;
                    }
                    cont++; 
               }

                if(listaCuentas[i].TipoSaldo == 'D'){
                    listaCuentas[i].DeudoraInicial = auxSumSaldoDeudor;
                }
                else if(listaCuentas[i].TipoSaldo == 'A'){
                    listaCuentas[i].AcreedoraInicial = auxSumSaldoAcreedor;
                }
                listaMovimientos[i].Cargo_Cuenta = auxSumaCargo;
                listaMovimientos[i].Abono_Cuenta = auxSumaAbono;
                
            }
        }
        
        for(i in listaCuentas){
            //Operaciones para sacar Saldo Actual
            if(listaCuentas[i].TipoSaldo == 'D' && listaCuentas[i].DeudoraInicial != null){
                listaCuentas[i].DeudoraInicial = Number(listaCuentas[i].DeudoraInicial.toFixed(2));
                auxDeudora = listaCuentas[i].DeudoraInicial  +  listaMovimientos[i].Cargo_Cuenta;
                auxDeudora -=  listaMovimientos[i].Abono_Cuenta;
                saldoActual[i] = {DeudoraActual: Number(auxDeudora.toFixed(2)), AcreedoraActual: ' '};
                
                
            }

            else if(listaCuentas[i].TipoSaldo == 'A' && listaCuentas[i].AcreedoraInicial != null){
                listaCuentas[i].AcreedoraInicial = Number(listaCuentas[i].AcreedoraInicial.toFixed(2));
                auxAcreedora = listaCuentas[i].AcreedoraInicial +  listaMovimientos[i].Cargo_Cuenta;
                auxAcreedora -= listaMovimientos[i].Abono_Cuenta;
                saldoActual[i] = {DeudoraActual: '  ', AcreedoraActual: Number(auxAcreedora.toFixed(2))};


            }

           

            if(listaMovimientos[i].Abono_Cuenta == null){
                listaMovimientos[i].Abono_Cuenta = 0; 
            
            }else{
                listaMovimientos[i].Abono_Cuenta = Number(listaMovimientos[i].Abono_Cuenta.toFixed(2));
             }   

            if(listaMovimientos[i].Cargo_Cuenta == null){
                listaMovimientos[i].Cargo_Cuenta = 0; 
            }else{ 
                listaMovimientos[i].Cargo_Cuenta = Number(listaMovimientos[i].Cargo_Cuenta.toFixed(2));
            }  
            
            
           
            listaCuentas[i] = Object.assign(listaCuentas[i],listaMovimientos[i],saldoActual[i]);
            
            
           

        }
        console.log(listaCuentas);
        
        res.json(listaCuentas);

    } catch (error) {
       console.log(error);

    } 
    console.log("Done");
}

module.exports = getData;

