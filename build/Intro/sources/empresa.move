module mi_empresa::empresa {
    // Importa tipos y funciones para manejo de strings y mapas tipo diccionario
    use std::string::{String, utf8, append};
    use sui::vec_map::{Self, VecMap};

    // --- ESTRUCTURAS PRINCIPALES ---

    // Define la estructura 'Empresa' que representa a una empresa con un ID único,
    // un nombre y un registro de clientes (un mapa con clave u16 y valor Clientes).
    public struct Empresa has key, store {
        id: UID, 
        nombre: String,
        registro_clientes: VecMap<u16, Clientes>
    }

    // Define la estructura 'Clientes' con información básica, nivel y lista de servicios.
    // Tiene propiedades para ser almacenado, copiado y eliminado de la memoria.
    public struct Clientes has store, drop, copy {
        nombre_cliente: String, 
        direccion_facturacion: String,
        ano_de_registro: u8, 
        nivel_cliente: Nivel,
        lista_servicios: vector<String>
    }

    // Enum que representa los niveles de cliente, cada uno con su propia estructura que contiene un descuento.
    public enum Nivel has store, drop, copy {
        cobre(Cobre),
        plata(Plata), 
        oro(Oro), 
        diamante(Diamante) 
    }

    // Estructuras específicas para cada nivel, contienen el porcentaje de descuento.
    public struct Cobre has store, drop, copy {
        descuento: u8
    }
    public struct Plata has store, drop, copy {
        descuento: u8
    }
    public struct Oro has store, drop, copy {
        descuento: u8
    }
    public struct Diamante has store, drop, copy {
        descuento: u8
    }

    // --- CONSTANTES DE ERROR ---
    // Mensajes de error personalizados para validar existencia o no existencia de IDs.
    #[error]
    const ID_EXISTE: vector<u8> = b"ERROR, el id ya existe, intenta con otro numero de id";
    #[error]
    const ID_NO_EXISTE: vector<u8> = b"ERROR, el id de cliente no existe";

    // --- FUNCIONES PRINCIPALES ---

    // Crea una nueva empresa con un nombre dado y un registro vacío de clientes.
    // Se usa el contexto de la transacción para crear un objeto único global.
    public fun crear_empresa(nombre: String, ctx: &mut TxContext) {
        let empresa = Empresa {
            id: object::new(ctx), 
            nombre, 
            registro_clientes: vec_map::empty()
        };
        // Transfiere la propiedad del objeto empresa al emisor de la transacción.
        transfer::transfer(empresa, tx_context::sender(ctx));
    }

    public fun ver_nombre(empresa: & Empresa): String {
        empresa.nombre
    }

    // Agrega un nuevo cliente al registro de la empresa con datos básicos y nivel inicial 'cobre'.
    // Se asegura que el ID del cliente no exista previamente (evita duplicados).
    public fun agregar_cliente(empresa: &mut Empresa, nombre_cliente: String, direccion_facturacion: String, ano_de_registro: u8, id_cliente: u16) {
        // Se valida que el id nuevo del cliente no exista antes de proceder con la creacion del nuevo cliente. 
        assert!(!empresa.registro_clientes.contains(&id_cliente), ID_EXISTE);

        let cliente = Clientes {
            nombre_cliente, 
            direccion_facturacion, 
            ano_de_registro,
            nivel_cliente: Nivel::cobre(Cobre{descuento: 5}), // Nivel inicial con 5% de descuento
            lista_servicios: vector[] // Lista vacía inicialmente
        };

        // Inserta el cliente en el registro con la clave id_cliente
        empresa.registro_clientes.insert(id_cliente, cliente);
    }

    // Añade un servicio a la lista de servicios de un cliente específico.
    // Verifica que el cliente exista antes de modificar.
    public fun agregar_servicio(empresa: &mut Empresa, id_cliente: u16, servicio: String) {
        // Se valida la existetncia del id del cliente previo a continuar con el codigo 
        assert!(empresa.registro_clientes.contains(&id_cliente), ID_NO_EXISTE);

        // Obtiene referencia mutable al cliente para modificar su lista de servicios.
        let cliente = empresa.registro_clientes.get_mut(&id_cliente);
        cliente.lista_servicios.push_back(servicio);
    }

    // Elimina un cliente del registro de la empresa usando su ID.
    // Verifica que el cliente exista antes de eliminar.
    public fun eliminar_cliente(empresa: &mut Empresa, id_cliente: u16) {
        // Se valida la existetncia del id del cliente previo a continuar con el codigo 
        assert!(empresa.registro_clientes.contains(&id_cliente), ID_NO_EXISTE);

        // Remueve la entrada del cliente del mapa
        empresa.registro_clientes.remove(&id_cliente);
    }

    // Elimina completamente el objeto empresa de la blockchain usando su ID.
    public fun eliminar_empresa(empresa: Empresa) {
        let Empresa {id, nombre:_ , registro_clientes:_ } = empresa;
        id.delete();
    }

    // --- FUNCIONES PARA CAMBIAR EL NIVEL DEL CLIENTE ---

    // Cambia el nivel del cliente a 'cobre' con descuento 5%
    public fun cambiar_nivel_a_cobre(empresa: &mut Empresa, id_cliente: u16) {
        // Se valida la existetncia del id del cliente previo a continuar con el codigo 
        assert!(empresa.registro_clientes.contains(&id_cliente), ID_NO_EXISTE);

        let cliente = empresa.registro_clientes.get_mut(&id_cliente);
        cliente.nivel_cliente = Nivel::cobre(Cobre{descuento: 5});
    }

    // Cambia el nivel del cliente a 'plata' con descuento 10%
    public fun cambiar_nivel_a_plata(empresa: &mut Empresa, id_cliente: u16) {
        // Se valida la existetncia del id del cliente previo a continuar con el codigo 
        assert!(empresa.registro_clientes.contains(&id_cliente), ID_NO_EXISTE);

        let cliente = empresa.registro_clientes.get_mut(&id_cliente);
        cliente.nivel_cliente = Nivel::plata(Plata{descuento: 10});
    }

    // Cambia el nivel del cliente a 'oro' con descuento 15%
    public fun cambiar_nivel_a_oro(empresa: &mut Empresa, id_cliente: u16) {
        // Se valida la existetncia del id del cliente previo a continuar con el codigo 
        assert!(empresa.registro_clientes.contains(&id_cliente), ID_NO_EXISTE);

        let cliente = empresa.registro_clientes.get_mut(&id_cliente);
        cliente.nivel_cliente = Nivel::oro(Oro{descuento: 15});
    }

    // Cambia el nivel del cliente a 'diamante' con descuento 20%
    public fun cambiar_nivel_a_diamante(empresa: &mut Empresa, id_cliente: u16) {
        // Se valida la existetncia del id del cliente previo a continuar con el codigo 
        assert!(empresa.registro_clientes.contains(&id_cliente), ID_NO_EXISTE);

        // Obtiene referencia mutable al cliente
        let cliente = empresa.registro_clientes.get_mut(&id_cliente);
        cliente.nivel_cliente = Nivel::diamante(Diamante{descuento: 20});
    }

    // --- FUNCION PARA APLICAR DESCUENTO Y RETORNAR MENSAJE ---

    fun ver_descuento(cliente: &Clientes): String {
        let mut mensaje = utf8(b"");
        
         match(cliente.nivel_cliente) {
            Nivel::cobre(dato) => {
                mensaje.append(dato.descuento.to_string());
                return  mensaje
            }, 
            Nivel::plata(dato) => {
                mensaje.append(dato.descuento.to_string());
                return  mensaje
            },
            Nivel::oro(dato) => {
                mensaje.append(dato.descuento.to_string());
                return  mensaje 
            },
            Nivel::diamante(dato) => {
                mensaje.append(dato.descuento.to_string());
                return  mensaje    
            }
        }
    }
    // Aplica el descuento según el nivel del cliente y devuelve un mensaje con el porcentaje aplicado.
    public fun aplicar_descuento(empresa: &mut Empresa, id_cliente: u16): String {
        assert!(empresa.registro_clientes.contains(&id_cliente), ID_NO_EXISTE);

        // Obtiene referencia mutable al cliente
        let cliente = empresa.registro_clientes.get_mut(&id_cliente);

        // Inicializa mensaje con texto base
        let mut mensaje = utf8(b"Descuento aplicado del: ");

        // Evalúa el nivel del cliente y concatena el porcentaje de descuento y símbolo %
        mensaje.append(ver_descuento(cliente));
        mensaje.append(utf8(b"%"));

        mensaje
    }

    fun concatenar_servicios(servicios: vector<String>): String {
        let mut resultado = utf8(b"");
        let longitud = servicios.length();
        let mut i = 0;

        while (i < longitud) {
            let servicio = servicios.borrow(i);
            resultado.append(*servicio);
            if (i < longitud - 1) {
                resultado.append(utf8(b", "));
            };

            i = i + 1;
        };
        resultado
    }

    public fun ver_estado_cliente(empresa: &mut Empresa, id_cliente: u16): String {
        let data = empresa.registro_clientes.get(&id_cliente);
        let servicios = concatenar_servicios(data.lista_servicios);
        let mut mensaje = utf8(b"El cliente de nombre: ");
        mensaje.append(data.nombre_cliente);
        mensaje.append(utf8(b", direccion de facturacion: "));
        mensaje.append(data.direccion_facturacion);
        mensaje.append(utf8(b", año de registro: "));
        mensaje.append(data.ano_de_registro.to_string());
        mensaje.append(utf8(b" cuenta con un nivel de cliente: "));
        mensaje.append(ver_descuento(data));
        mensaje.append(utf8(b" y una lista de servicios:"));
        mensaje.append(servicios);

        mensaje
    }

    public fun retornar_todo(empresa: &mut Empresa, id_cliente: u16): (u8, String, vector<String>, Nivel, String){
        let data = empresa.registro_clientes.get(&id_cliente);
        (data.ano_de_registro, data.direccion_facturacion, data.lista_servicios, data.nivel_cliente, data.nombre_cliente)
    }

}