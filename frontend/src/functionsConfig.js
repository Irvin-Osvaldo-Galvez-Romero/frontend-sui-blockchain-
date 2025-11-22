export const FUNCTIONS = [
    {
        titulo: "📋 Ver Nombre del Concesionario",
        descripcion: "Consulta el nombre registrado del concesionario",
        nombreFuncion: "ver_nombre",
        soloLectura: "1",
        inputs: []
    },
    {
        titulo: "👤 Registrar Nuevo Cliente",
        descripcion: "Registra un nuevo cliente en el sistema con nivel inicial Básico (5% descuento)",
        nombreFuncion: "agregar_cliente",
        soloLectura: "0",
        inputs: [
            { name: "nombre_cliente", type: "string", label: "Nombre Completo del Cliente" },
            { name: "direccion_facturacion", type: "string", label: "Dirección de Facturación" },
            { name: "ano_de_registro", type: "u8", label: "Año de Registro (ej. 24 para 2024)" },
            { name: "id_cliente", type: "u16", label: "ID Único del Cliente" }
        ]
    },
    {
        titulo: "🔧 Agregar Servicio",
        descripcion: "Registra un servicio al historial del cliente (compra, mantenimiento, repuestos, etc.)",
        nombreFuncion: "agregar_servicio",
        soloLectura: "0",
        inputs: [
            { name: "id_cliente", type: "u16", label: "ID del Cliente" },
            { name: "servicio", type: "string", label: "Servicio (ej: Compra Toyota Corolla 2023)" }
        ]
    },
    {
        titulo: "⭐ Subir Nivel a Oro",
        descripcion: "Promociona cliente a nivel Oro - Cliente frecuente (15% descuento en servicios)",
        nombreFuncion: "cambiar_nivel_a_oro",
        soloLectura: "0",
        inputs: [
            { name: "id_cliente", type: "u16", label: "ID del Cliente" }
        ]
    },
    {
        titulo: "💎 Subir Nivel a Diamante",
        descripcion: "Promociona cliente a nivel Diamante - Cliente VIP (20% descuento en servicios)",
        nombreFuncion: "cambiar_nivel_a_diamante",
        soloLectura: "0",
        inputs: [
            { name: "id_cliente", type: "u16", label: "ID del Cliente" }
        ]
    },
    {
        titulo: "💵 Consultar Descuento",
        descripcion: "Consulta el porcentaje de descuento aplicable según el nivel del cliente",
        nombreFuncion: "aplicar_descuento",
        soloLectura: "1",
        inputs: [
            { name: "id_cliente", type: "u16", label: "ID del Cliente" }
        ]
    },
    {
        titulo: "📊 Ver Historial del Cliente",
        descripcion: "Consulta el historial completo del cliente: servicios, nivel y descuentos",
        nombreFuncion: "ver_estado_cliente",
        soloLectura: "1",
        inputs: [
            { name: "id_cliente", type: "u16", label: "ID del Cliente" }
        ]
    },
    {
        titulo: "🔍 Consulta Completa",
        descripcion: "Obtiene todos los datos del cliente en formato estructurado",
        nombreFuncion: "retornar_todo",
        soloLectura: "1",
        inputs: [
            { name: "id_cliente", type: "u16", label: "ID del Cliente" }
        ]
    }
];