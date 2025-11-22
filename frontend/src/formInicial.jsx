import { useState } from "react"



function FormInicial({ ClientCall, estado, setNuevaEmpresa }) {
    const funcion = "crear_empresa"
    const [nombre, cambiarNombre] = useState("")

    function enviar() {
        ClientCall({
            funcion,
            args: [nombre]
        })
    }
    
    return(
        <form style={{
          display: "flex",
          flexDirection: "column", // Los elementos uno debajo del otro
          alignItems: "center", // Centrados horizontalmente
          gap: "15px", // Espacio entre cada elemento
          marginTop: "30px" // Un poco de aire arriba
        }}>
          
          {/* 1. Input para el nombre */}
          <input 
            type="text" 
            placeholder="Ej: AutoMall Premium, Concesionario El Roble..."
            value={nombre}
            style={{
              padding: "16px 24px",
              fontSize: "18px",
              borderRadius: "10px",
              border: "2px solid rgba(255, 255, 255, 0.3)",
              width: "100%",
              maxWidth: "500px",
              textAlign: "center",
              background: "rgba(255, 255, 255, 0.95)",
              color: "#1e3c72",
              fontWeight: "500",
              transition: "all 0.3s ease",
              boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)"
            }}
            onFocus={(e) => {
              e.target.style.border = "2px solid #e63946";
              e.target.style.boxShadow = "0 4px 20px rgba(230, 57, 70, 0.3)";
            }}
            onBlur={(e) => {
              e.target.style.border = "2px solid rgba(255, 255, 255, 0.3)";
              e.target.style.boxShadow = "0 4px 15px rgba(0, 0, 0, 0.1)";
            }}
            onChange={(e) => cambiarNombre(e.target.value)} 
          />

          {/* 2. Botón principal */}
          <button 
            className='purple-button' 
            type="button"
            disabled={estado || !nombre.trim()}
            style={{ width: "100%", maxWidth: "350px", marginTop: "10px" }}
            onClick={() => enviar()}
          >
            🚗 Registrar Concesionario
          </button>

          {/* 3. Texto y enlace para los que ya tienen concesionario */}
          <p style={{ fontSize: "16px", color: "rgba(255, 255, 255, 0.9)", marginTop: "20px", fontWeight: "500" }}>
            ¿Ya tienes un concesionario registrado?{' '}
            <span 
              style={{ 
                color: "#f1c40f", 
                cursor: "pointer", 
                textDecoration: "underline", 
                fontWeight: "bold",
                transition: "color 0.3s ease"
              }}
              onMouseEnter={(e) => e.target.style.color = "#f39c12"}
              onMouseLeave={(e) => e.target.style.color = "#f1c40f"}
              onClick={() => setNuevaEmpresa(true)}
            >
              Acceder al panel
            </span>
          </p>

        </form>
    )
}


export default FormInicial