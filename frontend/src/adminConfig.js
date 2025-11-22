// Configuración de Administradores
// Puedes agregar múltiples addresses de administradores

export const ADMIN_ADDRESSES = [
"0xd36f4fc0a48d42fc5736c23fedf3adab2a4d034360455d6e2369a9b6f81f9312"
];

// Función para verificar si una dirección es administrador
export function esAdministrador(address) {
  if (!address) return false;
  return ADMIN_ADDRESSES.some(admin => 
    admin.toLowerCase() === address.toLowerCase()
  );
}

// Función para verificar si el usuario actual es el owner del concesionario
export async function esOwnerDelConcesionario(objectId, userAddress, suiClient) {
  if (!objectId || !userAddress || !suiClient) return false;
  
  try {
    const object = await suiClient.getObject({
      id: objectId,
      options: { showOwner: true }
    });
    
    if (object.data?.owner && typeof object.data.owner === 'object' && 'AddressOwner' in object.data.owner) {
      const ownerAddress = object.data.owner.AddressOwner;
      return ownerAddress.toLowerCase() === userAddress.toLowerCase();
    }
    
    return false;
  } catch (error) {
    console.error("Error verificando ownership:", error);
    return false;
  }
}