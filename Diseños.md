# index.css
```css
:root {
  font-family: system-ui, Avenir, Helvetica, Arial, sans-serif;
  line-height: 1.5;
  font-weight: 400;
  margin: 0;
  min-width: 320px;
  min-height: 100vh;
  color-scheme: light dark;
  color: rgba(255, 255, 255, 0.87);
  background: linear-gradient(110deg, #1c90ad9f, hsla(265, 80%, 52%, 0.678));

  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* --- ESTILOS DEL HEADER --- */

/* Contenedor principal del header */

.app-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start; /* Fuerza a TODOS los hijos directos a pegarse arriba */
  padding: 10px 25px;
  position: absolute;
  top: 10px;
  left: 0;
  width: 100%;
  box-sizing: border-box;
}

/* Estilo específico para el logo cuando es hijo directo */
img.logo {
  display: block; /* Importante: evita comportamientos extraños de alineación en imágenes */
  height: 50px;
  width: auto;
  margin-top: -31px; /* Fuerza margen superior cero */
  margin-left: -30px; /* Fuerza margen superior cero */
}

h1 {
  font-size: 1.8em;
  line-height: 1; /* Reducir un poco el interlineado ayuda a que el texto "suba" más visualmente */
  margin: 0;
}

button {
  border-radius: 8px;
  border: 1px solid transparent;
  padding: 0.6em 1.2em;
  font-size: 1em;
  font-weight: 500;
  font-family: inherit;
  background-color: #1a1a1a;
  cursor: pointer;
  transition: border-color 0.25s;
}

button:hover {
  border-color: #646cff;
}

button:focus,
button:focus-visible {
  outline: 4px auto -webkit-focus-ring-color;
}

@media (prefers-color-scheme: light) {
  :root {
    color: #213547;
    background-color: #ffffff;
  }
  a:hover {
    color: #747bff;
  }

  button {
    background-color: #f9f9f9;
  }

}

.purple-button {
  background-color: #1c90ad9f; /* Color morado base */
  color: white; /* Texto blanco para buen contraste */
  border: none;
  padding: 12px 24px; /* Un poco más grande y cómodo */
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;
  font-weight: 600; /* Texto un poco más grueso */
  border-radius: 8px; /* Bordes redondeados */
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease, box-shadow 0.3s ease; /* Transiciones suaves */
  box-shadow: 0 4px 6px rgb(85, 128, 141); /* Sombra sutil para dar profundidad */
}

/* Estado Hover: cuando el mouse está encima */
.purple-button:hover {
  background-color: hsla(265, 80%, 52%, 0.678); /* Un tono morado un poco más claro */
  box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15); /* Sombra un poco más pronunciada */
  transform: translateY(-2px); /* Se mueve ligeramente hacia arriba */
}
```

# app.css
```
#root {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
}

.video-container {
    width: 100%;
    height: 100vh; /* Ocupa toda la altura de la ventana */
    display: flex;
    align-items: center; /* Centra el contenido de ejemplo */
    justify-content: center;
    overflow: hidden; /* Evita barras de scroll si el video se pasa un poco */
    position: relative;
}

/* Estilos clave para el video de fondo */
.back-video {
    position: fixed; /* Se queda fijo al hacer scroll. Usa 'absolute' si prefieres que se mueva */
    right: 0;
    bottom: 0;
    min-width: 100%;
    min-height: 100%;
    width: auto;
    height: auto;
    z-index: -1; /* Envía el video detrás de todo */
    object-fit: cover; /* Asegura que cubra toda el área sin perder proporción */
    /* Opcional: un filtro para oscurecerlo y que el texto se lea mejor */
    filter: brightness(50%); 
}

.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.react:hover {
  filter: drop-shadow(0 0 2em #61dafbaa);
}

@keyframes logo-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: no-preference) {
  a:nth-of-type(2) .logo {
    animation: logo-spin infinite 20s linear;
  }
}

.card {
  padding: 2em;
}

.read-the-docs {
  color: #888;
}

```
