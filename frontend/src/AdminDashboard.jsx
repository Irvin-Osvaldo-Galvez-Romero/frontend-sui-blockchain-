import { useState } from 'react';
import { FUNCTIONS } from './functionsConfig'; // Tu archivo de configuración

export function AdminDashboard({ ClientCall, estado, objectId, setObjectId, respuesta, esAdmin }) {
    // Estado compartido para el ID de la empresa con la que vamos a trabajar

    return (
        <div style={{ 
            padding: "30px 20px", 
            maxWidth: "1400px", 
            margin: "0 auto", 
            marginTop: "80px"
        }}>
            
            {/* Badge de Administrador/Owner */}
            {esAdmin && (
                <div style={{
                    maxWidth: "600px",
                    margin: "0 auto 30px auto",
                    padding: "12px 20px",
                    background: "linear-gradient(135deg, #f1c40f 0%, #f39c12 100%)",
                    borderRadius: "10px",
                    textAlign: "center",
                    color: "#1e3c72",
                    fontWeight: "700",
                    fontSize: "16px",
                    boxShadow: "0 4px 15px rgba(241, 196, 15, 0.4)"
                }}>
                    👑 {objectId ? "Propietario del Concesionario" : "Administrador"}
                </div>
            )}
            
            {/* 1. HEADER: Input Global para el ID del Concesionario */}
            <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "20px",
                marginBottom: "50px",
                padding: "30px",
                background: "linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(245, 247, 250, 0.95) 100%)",
                borderRadius: "16px",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
                border: "1px solid rgba(255, 255, 255, 0.5)"
            }}>
                <div style={{ textAlign: "center" }}>
                    <h2 style={{ 
                        color: "#1e3c72", 
                        margin: "0 0 10px 0",
                        fontSize: "28px",
                        fontWeight: "700"
                    }}>
                        🏢 Panel de Administración
                    </h2>
                    <p style={{
                        color: "#666",
                        fontSize: "14px",
                        margin: "0"
                    }}>
                        Gestión de clientes y servicios del concesionario
                    </p>
                </div>
                <input 
                    type="text" 
                    placeholder="Pega aquí el ID del Concesionario (0x...)"
                    value={objectId}
                    onChange={(e) => setObjectId(e.target.value)}
                    style={{
                        padding: "14px 24px",
                        fontSize: "16px",
                        borderRadius: "10px",
                        border: "2px solid #e0e0e0",
                        width: "100%",
                        maxWidth: "600px",
                        textAlign: "center",
                        fontFamily: "monospace",
                        background: "white",
                        color: "#1e3c72",
                        fontWeight: "500",
                        transition: "all 0.3s ease",
                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)"
                    }}
                    onFocus={(e) => {
                        e.target.style.border = "2px solid #457b9d";
                        e.target.style.boxShadow = "0 4px 12px rgba(69, 123, 157, 0.2)";
                    }}
                    onBlur={(e) => {
                        e.target.style.border = "2px solid #e0e0e0";
                        e.target.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.05)";
                    }}
                />
            </div>
            
            {respuesta !== null && (
                <div style={{
                    padding: "20px",
                    background: "linear-gradient(135deg, rgba(69, 123, 157, 0.1) 0%, rgba(29, 53, 87, 0.1) 100%)",
                    borderRadius: "12px",
                    marginBottom: "30px",
                    border: "2px solid #457b9d",
                    boxShadow: "0 4px 15px rgba(69, 123, 157, 0.2)"
                }}>
                    <strong style={{
                        color: '#adc6f3ff',
                        fontSize: "16px",
                        display: "block",
                        marginBottom: "12px"
                    }}>
                        ✅ Resultado de la operación:
                    </strong>
                    <pre style={{
                        whiteSpace: "pre-wrap",
                        marginTop: "10px",
                        color: "#546d9cff",
                        fontFamily: "system-ui, -apple-system, sans-serif",
                        fontSize: "15px",
                        background: "rgba(255, 255, 255, 0.9)",
                        padding: "20px",
                        borderRadius: "8px",
                        overflow: "auto",
                        maxHeight: "400px",
                        lineHeight: "1.8",
                        border: "1px solid rgba(101, 165, 204, 1)",
                        boxShadow: "0 2px 8px rgba(87, 79, 159, 0.91)"
                    }}>
                        {typeof respuesta === 'string' ? respuesta : JSON.stringify(respuesta, null, 2)}
                    </pre>
                </div>
                )}


            {/* 2. GRID DE FUNCIONES: Renderizamos una tarjeta por cada función en la config */}
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))",
                gap: "30px"
            }}>
                {FUNCTIONS.map((config, index) => (
                    <FunctionCard 
                        key={index}
                        config={config}
                        ClientCall={ClientCall}
                        estado={estado}
                        objectId={objectId}
                    />
                ))}
            </div>
        </div>
    );
}

// --- SUB-COMPONENTE: Tarjeta de Función (Basado en FormInicial) ---
function FunctionCard({ config, ClientCall, estado, objectId }) {
    // Estado local para guardar los valores de ESTE formulario
    const [valores, setValores] = useState({});

    // Función enviar adaptada de tu FormInicial
    function enviar(e) {
        e.preventDefault();
        if (!objectId) {
            alert("⚠️ Primero debes ingresar el ID del concesionario en el campo superior.");
            return;
        }
                // 1. Preparamos los argumentos en orden, convirtiendo tipos si es necesario.
        const argsOrdenados = [objectId, ...config.inputs.map(input => {
            const valorRaw = valores[input.name];
            // Si el tipo esperado es numérico (u8, u16, u32, u64), lo convertimos a objeto tipado.
            if (['u8', 'u16', 'u32', 'u64'].includes(input.type)) {
                return { type: input.type, value: Number(valorRaw) };
            }
            // Para otros tipos (string, bool, etc.), pasamos el valor tal cual.
            return valorRaw;
        })];

        // 2. Llamamos a ClientCall con los argumentos ya procesados.
        ClientCall({
            funcion: config.nombreFuncion,
            args: argsOrdenados,
            soloLectura: config.soloLectura
        });
    }

    // Manejador genérico para los inputs
    const handleChange = (name, value) => {
        setValores(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div style={{
            border: "2px solid #e0e0e0",
            borderRadius: "14px",
            padding: "28px",
            background: "linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(250, 251, 252, 0.98) 100%)",
            boxShadow: "0 6px 20px rgba(0, 0, 0, 0.08)",
            transition: "all 0.3s ease",
            height: "100%",
            display: "flex",
            flexDirection: "column"
        }}
        onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = "0 8px 25px rgba(230, 57, 70, 0.15)";
            e.currentTarget.style.border = "2px solid #e63946";
            e.currentTarget.style.transform = "translateY(-4px)";
        }}
        onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = "0 6px 20px rgba(0, 0, 0, 0.08)";
            e.currentTarget.style.border = "2px solid #e0e0e0";
            e.currentTarget.style.transform = "translateY(0)";
        }}
        >
            <h3 style={{ 
                color: "#1e3c72", 
                marginTop: 0,
                fontSize: "20px",
                fontWeight: "700",
                marginBottom: "12px"
            }}>
                {config.titulo}
            </h3>
            <p style={{ 
                fontSize: "14px", 
                color: "#666", 
                lineHeight: "1.6", 
                marginBottom: "24px",
                flexGrow: 1
            }}>
                {config.descripcion}
            </p>

            <form style={{
                display: "flex",
                flexDirection: "column",
                gap: "15px"
            }}>
                {config.inputs.map((input, idx) => (
                    <div key={idx} style={{ marginBottom: "16px" }}>
                        <label style={{ 
                            display: "block", 
                            fontSize: "13px", 
                            fontWeight: "600", 
                            marginBottom: "8px", 
                            color: "#1e3c72",
                            textTransform: "uppercase",
                            letterSpacing: "0.5px"
                        }}>
                            {input.label}
                        </label>
                        <input 
                            type={input.type.includes('u') ? "number" : "text"}
                            placeholder={`Ejemplo: ${input.label.toLowerCase()}`}
                            value={valores[input.name] || ""}
                            onChange={(e) => handleChange(input.name, e.target.value)}
                            style={{
                                padding: "12px 16px",
                                fontSize: "15px",
                                borderRadius: "8px",
                                border: "2px solid #e0e0e0",
                                width: "100%",
                                boxSizing: "border-box",
                                background: "white",
                                color: "#1e3c72",
                                transition: "all 0.3s ease",
                                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.03)"
                            }}
                            onFocus={(e) => {
                                e.target.style.border = "2px solid #457b9d";
                                e.target.style.boxShadow = "0 4px 12px rgba(69, 123, 157, 0.15)";
                            }}
                            onBlur={(e) => {
                                e.target.style.border = "2px solid #e0e0e0";
                                e.target.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.03)";
                            }}
                        />
                    </div>
                ))}

                <button 
                    className={config.soloLectura === "1" ? 'secondary-button' : 'purple-button'}
                    type="button"
                    disabled={estado}
                    onClick={(e) => enviar(e)}
                    style={{ 
                        width: "100%", 
                        marginTop: "auto",
                        padding: "14px",
                        fontSize: "15px",
                        fontWeight: "700"
                    }}
                >
                    {estado ? "⏳ Procesando..." : `▶️ ${config.soloLectura === "1" ? "Consultar" : "Ejecutar"}`}
                </button>
            </form>
        </div>
    );
}