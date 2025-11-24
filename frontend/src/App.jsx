import { useSuiClient, useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { isValidSuiObjectId } from "@mysten/sui/utils";
import { useNetworkVariable } from "./networkConfig";
import { ConnectButton, useCurrentAccount } from "@mysten/dapp-kit";
import { useState, useEffect } from 'react';
import video from './Gradient-background.mp4'
import { esAdministrador, esOwnerDelConcesionario } from './adminConfig';

import './App.css'
import FormInicial from "./formInicial";
import { AdminDashboard } from "./AdminDashboard";

function App() {
  const suiClient = useSuiClient()
  const cuenta = useCurrentAccount()
  const { mutate: signAndExecute } = useSignAndExecuteTransaction()
  const [estado, cambiarEstado] = useState(false);
  const [respuesta, cambiarRespuesta] = useState(null);
  const [nuevaEmpresa, setNuevaEmpresa] = useState(false)
  const [esAdmin, setEsAdmin] = useState(false)
  const [esOwner, setEsOwner] = useState(false)
  const [objectId, setObjectId] = useState(() => {
    const hash = window.location.hash.slice(1);
    return isValidSuiObjectId(hash) ? hash : null;
  });
  const packageId = useNetworkVariable("PackageId");
  const modulo = "empresa"

  // Verificar problemas de red (se usa en el manejo de errores más abajo)

  // Verificar si el usuario es administrador o owner del concesionario
  useEffect(() => {
    async function verificarPermisos() {
      if (!cuenta?.address) {
        setEsAdmin(false);
        setEsOwner(false);
        return;
      }

      // Verificar si es administrador configurado
      const admin = esAdministrador(cuenta.address);
      setEsAdmin(admin);

      // Verificar si es owner del concesionario actual
      if (objectId) {
        const owner = await esOwnerDelConcesionario(objectId, cuenta.address, suiClient);
        setEsOwner(owner);
      } else {
        setEsOwner(false);
      }
    }

    verificarPermisos();
  }, [cuenta, objectId, suiClient]);

    async function ClientCall(params) {
    
    cambiarEstado(true);

    try {
      cambiarRespuesta(null);

      const tx = new Transaction();

      // ===============================
      // 1) SERIALIZACIÓN DE ARGUMENTOS
      // ===============================
      const args = params.args.map((arg, idx) => {
        console.log("ARG RAW", idx, arg, typeof arg);

        // Validar que el argumento no sea null o undefined
        if (arg === null || arg === undefined) {
          throw new Error(`Argumento ${idx} es null o undefined`);
        }

        // 1. ObjectID válido → tx.object(...)
        // IMPORTANTE: Verificar ObjectID PRIMERO antes de otros strings
        if (typeof arg === "string" && isValidSuiObjectId(arg)) {
          console.log(`Arg[${idx}] es ObjectID → tx.object(${arg})`);
          return tx.object(arg);
        }

        // 2. Tipos explícitos { type, value }
        if (arg && typeof arg === "object" && !Array.isArray(arg) && "type" in arg) {
          const { type, value } = arg;

          switch (type) {
            case "u8": return tx.pure.u8(Number(value));
            case "u16": return tx.pure.u16(Number(value));
            case "u32": return tx.pure.u32(Number(value));
            case "u64": return tx.pure.u64(BigInt(value));
            case "u128": return tx.pure.u128(BigInt(value));
            case "bool": return tx.pure.bool(Boolean(value));
            case "string": return tx.pure.string(String(value));
            case "address": return tx.pure.address(value);
            default:
              console.warn(`Tipo no manejado (${type}), usando tx.pure`);
              return tx.pure(value);
          }
        }

        // 3. Inferencias básicas (en orden específico)
        if (typeof arg === "boolean") return tx.pure.bool(arg);
        if (typeof arg === "number") return tx.pure.u64(BigInt(arg));
        if (typeof arg === "bigint") return tx.pure.u64(arg);
        
        // 4. Strings - IMPORTANTE: después de verificar ObjectID
        if (typeof arg === "string") {
          // Validar que el string no esté vacío para funciones críticas
          if (arg.trim() === "" && params.funcion === "crear_empresa") {
            throw new Error("El nombre del concesionario no puede estar vacío");
          }
          return tx.pure.string(String(arg));
        }

        // 5. Fallback - lanzar error en lugar de usar tx.pure genérico
        console.error(`Arg[${idx}] tipo no soportado:`, typeof arg, arg);
        throw new Error(`Tipo de argumento no soportado en posición ${idx}: ${typeof arg}`);
      });

      console.log("ARGS FINAL →", args);

      // ===============================
      // 2) CONSTRUIR MOVE CALL
      // ===============================
      tx.moveCall({
        target: `${packageId}::${modulo}::${params.funcion}`,
        arguments: args,
      });

      console.log("TARGET:", `${packageId}::${modulo}::${params.funcion}`);

      // ====================================
      // 3) DETECTAR SI ES FUNCIÓN "VIEW"
      // ====================================
      const esLectura =
        params?.soloLectura === 1 ||
        params?.soloLectura === "1" ||
        params?.soloLectura === true ||
        params?.soloLectura === "true";

      // =======================================================
      // CASE 1: FUNCIÓN DE SOLO LECTURA → devInspect
      // =======================================================
      if (esLectura) {
        console.log("FUNCIÓN VIEW → ejecutando devInspect…");

        const result = await suiClient.devInspectTransactionBlock({
          sender: cuenta.address,
          transactionBlock: tx,
        });

        console.log("devInspect result:", result);

        const decoded = decodeReturnValues(result);
        
        // Formatear respuesta según la función
        let respuestaFormateada = null;
        
        if (decoded !== null) {
          switch (params.funcion) {
            case "ver_nombre":
              respuestaFormateada = `📋 Nombre del Concesionario: "${decoded}"`;
              break;
              
            case "aplicar_descuento":
              respuestaFormateada = `💵 ${decoded}`;
              break;
              
            case "ver_estado_cliente":
              respuestaFormateada = `📊 ${decoded}`;
              break;
              
            case "retornar_todo": {
              // Formatear la tupla retornada
              if (Array.isArray(decoded) && decoded.length >= 5) {
                const [ano, direccion, servicios, nivel, nombre] = decoded;
                let nivelTexto = "Desconocido";
                let descuento = 0;
                
                // Decodificar nivel
                if (nivel && nivel.raw && Array.isArray(nivel.raw)) {
                  const variant = nivel.raw[0];
                  descuento = nivel.raw[1] || 0;
                  const niveles = ["Básico (Cobre)", "Plata", "Oro", "Diamante"];
                  nivelTexto = niveles[variant] || "Desconocido";
                }
                
                respuestaFormateada = `🔍 Información Completa del Cliente:\n\n` +
                  `👤 Nombre: ${nombre}\n` +
                  `📅 Año de Registro: ${ano}\n` +
                  `📍 Dirección de Facturación: ${direccion}\n` +
                  `⭐ Nivel: ${nivelTexto} (${descuento}% descuento)\n` +
                  `🔧 Servicios: ${Array.isArray(servicios) ? servicios.join(", ") || "Ninguno" : servicios || "Ninguno"}`;
              } else {
                respuestaFormateada = `🔍 Datos del Cliente:\n${JSON.stringify(decoded, null, 2)}`;
              }
              break;
            }
              
            default:
              // Para otras funciones, mostrar el valor decodificado
              if (typeof decoded === "string") {
                respuestaFormateada = decoded;
              } else if (Array.isArray(decoded)) {
                respuestaFormateada = `Resultado: ${decoded.map(v => String(v)).join(", ")}`;
              } else {
                respuestaFormateada = `✅ Resultado: ${String(decoded)}`;
              }
          }
          
          cambiarRespuesta(respuestaFormateada);
        } else {
          cambiarRespuesta("⚠️ La función no retornó ningún valor");
        }

        return decoded;
      }

      // =======================================================
      // CASE 2: TRANSACCIÓN REAL
      // =======================================================
      console.log("FUNCIÓN MUTANTE → firmando transacción…");

      signAndExecute(
        { transaction: tx },
        {
          onSuccess: async (txres) => {
            const result = await suiClient.waitForTransaction({
              digest: txres.digest,
              options: { showEffects: true, showEvents: true },
            });

            console.log("RESULTADO EJECUCIÓN:", result);

            // Formatear mensaje de éxito según la función
            let mensajeExito = null;
            
            switch (params.funcion) {
              case "crear_empresa": {
                const id = result.effects?.created?.[0]?.reference?.objectId;
                if (id) {
                  setObjectId(id);
                  window.location.hash = id;
                  setNuevaEmpresa(true);
                  setEsOwner(true);
                  mensajeExito = `✅ ¡Concesionario creado exitosamente!\n\n` +
                    `🆔 ID del Concesionario: ${id}\n` +
                    `📋 Este ID ha sido guardado en la URL.`;
                } else {
                  mensajeExito = "✅ Concesionario creado exitosamente";
                }
                break;
              }
                
              case "agregar_cliente":
                mensajeExito = "✅ Cliente agregado exitosamente al registro";
                break;
                
              case "agregar_servicio":
                mensajeExito = "✅ Servicio agregado al historial del cliente";
                break;
                
              case "cambiar_nivel_a_cobre":
                mensajeExito = "✅ Nivel del cliente actualizado a Básico (Cobre) - 5% descuento";
                break;
                
              case "cambiar_nivel_a_plata":
                mensajeExito = "✅ Nivel del cliente actualizado a Plata - 10% descuento";
                break;
                
              case "cambiar_nivel_a_oro":
                mensajeExito = "✅ Nivel del cliente actualizado a Oro - 15% descuento";
                break;
                
              case "cambiar_nivel_a_diamante":
                mensajeExito = "✅ Nivel del cliente actualizado a Diamante - 20% descuento";
                break;
                
              case "eliminar_cliente":
                mensajeExito = "✅ Cliente eliminado del registro exitosamente";
                break;
                
              default: {
                // Intentar decodificar si hay valores retornados
                const decoded = decodeReturnValues(result);
                if (decoded !== null) {
                  mensajeExito = `✅ Operación completada exitosamente\n\nResultado: ${String(decoded)}`;
                } else {
                  mensajeExito = "✅ Operación completada exitosamente";
                }
                break;
              }
            }
            
            if (mensajeExito) {
              cambiarRespuesta(mensajeExito);
            }
          },
          onError: (err) => {
            // Mostrar mensaje más detallado para errores comunes
            let mensajeError = err.message;
            
            if (err.message.includes("No valid gas coins") || err.message.includes("gas")) {
              mensajeError = "⚠️ No tienes tokens SUI en testnet para pagar el gas.\n\n" +
                           "Solución:\n" +
                           "1. Ve a https://faucet.sui.io/\n" +
                           "2. Conecta tu wallet (asegúrate de estar en TESTNET)\n" +
                           "3. Haz clic en 'Request Testnet SUI'\n" +
                           "4. Reconecta tu wallet y vuelve a intentar";
            } else if (err.message.includes("mainnet") || err.message.includes("network")) {
              mensajeError = "⚠️ Problema de red detectado.\n\n" +
                           "La aplicación está en TESTNET pero tu wallet puede estar en MAINNET.\n\n" +
                           "Solución:\n" +
                           "1. Cambia tu wallet a TESTNET\n" +
                           "2. Obtén tokens en https://faucet.sui.io/\n" +
                           "3. Reconecta tu wallet";
            }
            
            alert(mensajeError);
            
            // Mostrar mensaje de ayuda visualmente
            const mensajeRed = document.getElementById("mensaje-red");
            if (mensajeRed && (err.message.includes("gas") || err.message.includes("network"))) {
              mensajeRed.style.display = "block";
            }
          },
        }
      );
    } catch (error) {
      alert("Hubo un error: " + error.message);
      console.error(error);
    } finally {
      cambiarEstado(false);
    }
  }

  //
  // ========================================
  // DECODIFICADOR UNIVERSAL DE RETURN VALUES
  // ========================================
  //
  function decodeReturnValues(result) {
    try {
      const values =
        result.results?.[0]?.returnValues ||
        result.effects?.returnValues;

      if (!values || values.length === 0) return null;

      const decoded = values.map(([bytes, typeTag]) => {
        return decodeByType(bytes, typeTag);
      });

      return decoded.length === 1 ? decoded[0] : decoded;
    } catch (err) {
      console.warn("decodeReturnValues ERROR:", err);
      return null;
    }
  }

  //
  // ===========================
  // DECODIFICACIÓN POR TIPO
  // ===========================
  //
  function decodeByType(bytes, typeTag) {
    const arr = Uint8Array.from(bytes);

    if (!typeTag) return null;

    // PRIMITIVOS
    if (typeTag === "u8") return arr[0];
    if (typeTag === "u16") return new DataView(arr.buffer).getUint16(0, true);
    if (typeTag === "u32") return new DataView(arr.buffer).getUint32(0, true);
    if (typeTag === "u64") {
      // arr viene en formato little-endian → revertir
      const reversed = Array.from(arr).reverse();

      // Convertir a hex WITHOUT Buffer
      const hex = reversed
        .map(b => b.toString(16).padStart(2, "0"))
        .join("");

      // Crear BigInt desde hex
      return BigInt("0x" + hex);
    }


    if (typeTag === "bool") return arr[0] === 1;

    // STRING
    if (typeTag === "0x1::string::String") {
      return decodeBCSString(bytes);
    }

    // VECTOR<STRING>
    if (typeTag.startsWith("vector<0x1::string::String>")) {
      return decodeBCSVectorString(bytes);
    }

    // STRUCT (ej: Nivel)
    if (typeTag.includes("Nivel")) {
      return decodeNivel(bytes);
    }

    return "<?> Tipo no soportado: " + typeTag;
  }

  //
  // ===========================
  // DECODIFICAR STRING BCS
  // ===========================
  //
  function decodeBCSString(bytes) {
    const arr = Uint8Array.from(bytes);
    let length = 0;
    let shift = 0;
    let offset = 0;

    while (offset < arr.length) {
      const byte = arr[offset++];
      length |= (byte & 0x7F) << shift;
      if ((byte & 0x80) === 0) break;
      shift += 7;
    }

    const content = arr.slice(offset, offset + length);
    return new TextDecoder().decode(content);
  }

  //
  // ===========================
  // DECODIFICAR vector<String>
  // ===========================
  //
  function decodeBCSVectorString(bytes) {
    const arr = Uint8Array.from(bytes);
    let offset = 0;

    // tamaño del vector
    let vecLen = 0;
    let shift = 0;

    while (true) {
      const byte = arr[offset++];
      vecLen |= (byte & 0x7F) << shift;
      if ((byte & 0x80) === 0) break;
      shift += 7;
    }

    const items = [];

    for (let i = 0; i < vecLen; i++) {
      // longitud del string
      let len = 0;
      shift = 0;

      while (true) {
        const byte = arr[offset++];
        len |= (byte & 0x7F) << shift;
        if ((byte & 0x80) === 0) break;
        shift += 7;
      }

      const content = arr.slice(offset, offset + len);
      offset += len;

      items.push(new TextDecoder().decode(content));
    }

    return items;
    }

    //
    // ===========================
    // DECODIFICADOR STRUCT NIVEL
    // ===========================
    //
    function decodeNivel(bytes) {
      // const arr = Uint8Array.from(bytes);

      // if (arr.length < 2) {
      //   return { tipo: "desconocido", descuento: null };
      // }

      // const variant = arr[0];
      // const descuento = arr[1]; // u8 directo

      // const variants = ["cobre", "plata", "oro", "diamante"];

      // return {
      //   tipo: variants[variant] ?? "desconocido",
      //   descuento
      // };
      return { raw: bytes };
  }
  
  // Debug: verificar que el video se carga
  useEffect(() => {
    console.log("Video importado:", video);
  }, []);

  return (
    <div style={{ position: "relative", minHeight: "100vh", background: "transparent", overflow: "hidden" }}>
      <video 
        autoPlay 
        loop 
        playsInline 
        muted 
        className="back-video"
        onLoadedData={() => console.log("Video cargado correctamente")}
        onError={(e) => console.error("Error cargando video:", e)}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          minWidth: "100%",
          minHeight: "100%",
          objectFit: "cover",
          zIndex: -1,
          pointerEvents: "none",
          backgroundColor: "transparent"
        }}
      >
        <source src={video} type="video/mp4" />
        Tu navegador no soporta la reproducción de videos.
      </video>
      <div className="app-header" style={{ position: "relative", zIndex: 1000 }}>
        <a>
          <img className="logo" src="WayLearn_logo-horizontal_texto-blanco.png" onClick={() => setNuevaEmpresa(false)}/>
        </a>
        <ConnectButton />
      </div>
        {!nuevaEmpresa && (
          <div style={{
            marginTop: "200px",
            textAlign: "center",
            padding: "0 20px",
            position: "relative",
            zIndex: 1
          }}>
            <h1 style={{
              fontSize: "clamp(40px, 8vw, 80px)",
              fontWeight: "800",
              margin: "0 0 20px 0",
              textShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
              background: "linear-gradient(135deg, #ffffff 0%, #f1c40f 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text"
            }}>
              🚗 Sistema de Gestión de Concesionario
            </h1>
            <p style={{
              fontSize: "clamp(16px, 2vw, 24px)",
              color: "rgba(255, 255, 255, 0.9)",
              marginTop: "20px",
              fontWeight: "300"
            }}>
              Gestiona tus clientes, servicios y descuentos en la blockchain
            </p>
          </div>
        )}
        {!cuenta ?  
        <h3 style={{
          marginTop: "50px", 
          fontSize: "clamp(18px, 2vw, 24px)",
          color: "rgba(255, 255, 255, 0.95)",
          fontWeight: "500",
          textShadow: "0 2px 10px rgba(0, 0, 0, 0.2)",
          position: "relative",
          zIndex: 1
        }}> 
          🔐 Conecta tu wallet para continuar 
        </h3> : (
        <div style={{ position: "relative", zIndex: 1 }}>
          {/* Mensaje de ayuda para problemas de red */}
          <div style={{
            maxWidth: "800px",
            margin: "20px auto",
            padding: "20px",
            background: "rgba(230, 57, 70, 0.95)",
            borderRadius: "12px",
            border: "2px solid rgba(255, 255, 255, 0.3)",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)",
            display: "none" // Lo ocultamos por defecto, se mostrará si hay error
          }} id="mensaje-red">
            <h3 style={{ color: "white", margin: "0 0 15px 0", fontSize: "20px" }}>
              ⚠️ Problema de Red Detectado
            </h3>
            <div style={{ color: "white", fontSize: "16px", lineHeight: "1.6" }}>
              <p style={{ margin: "0 0 10px 0" }}>
                <strong>La aplicación está configurada para TESTNET.</strong>
              </p>
              <p style={{ margin: "0 0 15px 0" }}>
                Si ves un error al crear el concesionario:
              </p>
              <ol style={{ margin: "0 0 15px 0", paddingLeft: "20px" }}>
                <li>Asegúrate de que tu wallet esté en <strong>TESTNET</strong></li>
                <li>Obtén tokens de testnet en: <a href="https://faucet.sui.io/" target="_blank" rel="noopener noreferrer" style={{ color: "#f1c40f", textDecoration: "underline" }}>faucet.sui.io</a></li>
                <li>Reconecta tu wallet después de cambiar la red</li>
              </ol>
              <p style={{ margin: "0", fontSize: "14px", opacity: "0.9" }}>
                💡 <a href="./SOLUCION_ERROR_RED.md" target="_blank" style={{ color: "#f1c40f", textDecoration: "underline" }}>Ver guía completa de solución</a>
              </p>
            </div>
          </div>
          {nuevaEmpresa ? (
            (esAdmin || esOwner || !objectId) ? (
        <AdminDashboard 
          ClientCall={ClientCall}
          estado={estado}
          objectId={objectId}
          setObjectId={setObjectId}
          respuesta={respuesta}
                esAdmin={esAdmin || esOwner}
              />
            ) : (
              <div style={{
                maxWidth: "600px",
                margin: "100px auto",
                padding: "40px",
                background: "rgba(230, 57, 70, 0.95)",
                borderRadius: "16px",
                textAlign: "center",
                color: "white"
              }}>
                <h2 style={{ margin: "0 0 20px 0", fontSize: "24px" }}>
                  🔒 Acceso Restringido
                </h2>
                <p style={{ fontSize: "18px", lineHeight: "1.6", margin: "0 0 20px 0" }}>
                  Solo el administrador o el propietario del concesionario puede gestionar este panel.
                </p>
                <p style={{ fontSize: "14px", opacity: "0.9" }}>
                  Tu dirección: <code style={{
                    background: "rgba(0,0,0,0.3)",
                    padding: "4px 8px",
                    borderRadius: "4px",
                    fontSize: "12px"
                  }}>{cuenta?.address?.slice(0, 10)}...{cuenta?.address?.slice(-8)}</code>
                </p>
                <button
                  className="purple-button"
                  onClick={() => setNuevaEmpresa(false)}
                  style={{ marginTop: "20px" }}
                >
                  Volver al Inicio
                </button>
              </div>
            )
          ) : (
        <FormInicial 
          ClientCall={ClientCall}
          estado={estado}
          setNuevaEmpresa={setNuevaEmpresa}
        />
          )}
        </div>
        )}
        
      <div>

      </div>
    </div>
  )
}

export default App
