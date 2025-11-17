#!/usr/bin/env bash
set -e

echo "📦 Instalando suiup..."
curl -sSfL https://raw.githubusercontent.com/Mystenlabs/suiup/main/install.sh | sh

echo "📦 Instalando sui..."
suiup install sui -y

echo "--- Iniciando configuración interactiva de SUI Client ---"

# Este bloque (<< EOF ... EOF) alimenta las siguientes líneas
# al comando 'sui client' una por una.
sui client << EOF
y

0
EOF

echo "--- Configuración de SUI Client completada ---"

echo "Instalación de node.."

curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash

\. "$HOME/.nvm/nvm.sh"

nvm install 24

npm install @mysten/sui.js @mysten/wallet-kit

npm upgrade @mysten/sui.js @mysten/wallet-kit
