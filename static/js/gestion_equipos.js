function cargarEquipo(equipoId) {
    equipoId = parseInt(equipoId, 10); // Convertir a número si es necesario
    fetch(`/equipos/${equipoId}`)
        .then(response => response.json())
        .then(data => {
            const detalleTitulo = document.getElementById('detalle-titulo');
            const infoEquipo = document.getElementById('info-equipo');

            // Actualizar el título
            detalleTitulo.textContent = `${data.invnr} - ${data.shtxt}`;

            // Actualizar información
            infoEquipo.innerHTML = `
                <p><strong>Peso del objeto:</strong> ${data.brgew || 'N/A'} ${data.gewei || ''}</p>
                <p><strong>Tamaño/Dimensión:</strong> ${data.groes || 'N/A'}</p>
                <p><strong>Clase de objeto/tipo de equipo:</strong> ${data.eqart || 'N/A'}</p>
                <p><strong>Valor de adquisición:</strong> ${data.answt || 'N/A'}</p>
                <p><strong>Fecha de adquisición:</strong> ${data.ansdt || 'N/A'}</p>
                <p><strong>Fabricante:</strong> ${data.herst || 'N/A'}</p>
                <p><strong>País de fabricación:</strong> ${data.herld || 'N/A'}</p>
                <p><strong>Ubicación técnica:</strong> ${data.tplnr || 'N/A'}</p>
                <p><strong>Número de pieza del fabricante:</strong> ${data.mapar || 'N/A'}</p>
                <p><strong>N° de clase:</strong> ${data.class || 'N/A'}</p>
            `;
        })
        .catch(error => {
            console.error('Error al cargar los datos del equipo:', error);
            alert('No se pudo cargar la información del equipo.');
        });
}

function guardarEquipo() {
    caracteristicas = obtenerDatosDinamicos();
    console.log(caracteristica);

    const equipoId = document.getElementById('detalle-titulo').dataset.id || null; // Obtener el ID si es edición
    const url = equipoId ? `/equipos/${equipoId}` : '/equipos'; // Ruta para actualizar o crear
    const method = equipoId ? 'PUT' : 'POST'; // Método HTTP para actualizar o crear

    // Recolectar datos del formulario
    const datos = {
        eqtyp: document.getElementById('eqtyp').value,
        shtxt: document.getElementById('shtxt').value,
        brgew: parseFloat(document.getElementById('brgew').value) || null,
        gewei: document.getElementById('gewei').value || null,
        groes: document.getElementById('groes').value || null,
        invnr: document.getElementById('invnr').value || null,
        inbdt: document.getElementById('inbdt').value || null,
        eqart: document.getElementById('eqart').value || null,
        answt: parseFloat(document.getElementById('answt').value) || null,
        ansdt: document.getElementById('ansdt').value || null,
        waers: document.getElementById('waers').value || null,
        herst: document.getElementById('herst').value || null,
        herld: document.getElementById('herld').value || null,
        typbz: document.getElementById('typbz').value || null,
        baujj: document.getElementById('baujj').value || null,
        baumm: document.getElementById('baumm').value || null,
        class: document.getElementById('class').value || null,
    };
/*
    // Enviar los datos al servidor
    fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(datos)
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            alert(`Error: ${data.error}`);
        } else {
            alert('Equipo guardado exitosamente.');
            // Opcional: Recargar la lista de equipos
            location.reload();
        }
    })
    .catch(error => {
        console.error('Error al guardar el equipo:', error);
        alert('Ocurrió un error al guardar el equipo.');
    });
    */
}
document.addEventListener("DOMContentLoaded", () => {
    // Cargar clases al iniciar la página
    cargarClases();

    // Manejar cambio en el campo "N° de clase"
    const classSelect = document.getElementById("class");
    classSelect.addEventListener("change", (event) => {
        const claseSeleccionada = event.target.value;
        console.log("CLASE SELECCIONADA: ", claseSeleccionada);
        if (claseSeleccionada) {
            cargarCamposDinamicos(claseSeleccionada);
        } else {
            limpiarCamposDinamicos();
        }
    });
});

// Lista de clases
const clases = [
    "BOMBAS",
    "ARMAS_NAVALES",
    "BATERIAS",
    "BOTES",
    "BOTES_BALSAS_SALVA",
    "BUQUES",
    "CABRES_WINCHE_GRUA",
    "CASCO_CUBIERTA",
    "COJINETES_EJES",
    "COMPRESORES",
    "COND_EVAP_INTERCAM",
    "ENG_REDUCTORES",
    "EQ_ELECT_RADAR_COM",
    "EQ_ELECTRIC_TALLER",
    "EQ_REFRIGER",
    "EQ_RESP_BOT_EXTINT",
    "GENERADORES",
    "GRUP_VENT_BLOWER",
    "HELICES",
    "MOTORES_DIESEL",
    "MOTORES_ELECTRICOS",
    "MOTORES_FUERA_BOR",
    "PLANTA_TRATAMIENTO",
    "PURIFICADORES",
    "TABLERO_ELECTRICO",
];

// Cargar las opciones del select "N° de clase"
function cargarClases() {
    const classSelect = document.getElementById("class");
    clases.forEach(clase => {
        const option = document.createElement("option");
        option.value = clase;
        option.textContent = clase;
        classSelect.appendChild(option);
    });
}

function capitalizarPrimeraLetra(texto) {
    return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
}

// Función para cargar los campos dinámicos según la clase seleccionada
function cargarCamposDinamicos(clase) {
    fetch(`/clases/${clase}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error al cargar los campos: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log("data recibida", data)
            const camposDinamicos = document.getElementById("campos-dinamicos");
            limpiarCamposDinamicos(); // Limpiar campos anteriores

            data.forEach(campo => {
                if (!campo.caracteristica || !campo.denominacion || !campo.tipo_campo) {
                    console.warn("Campo con datos incompletos:", campo);
                    return; // Ignorar campos incompletos
                }
            
                // Crear el contenedor principal
                const campoDiv = document.createElement("div");
                campoDiv.className = campo.unidad ? "col-md-6 mb-3 form-floating withUnid" : "col-md-6 mb-3 form-floating";
            
                // Crear el input
                const input = document.createElement("input");
                input.type = obtenerTipoInput(campo.tipo_campo); // Determinar el tipo (NUM, CHAR, DATE)
                input.id = campo.caracteristica;
                input.name = campo.caracteristica;
                input.className = "form-control";
                input.maxLength = campo.ctd_posiciones;
                input.placeholder = campo.unidad ? "" : " "; // Dejar vacío para form-floating, usar placeholder vacío para input-group
            
                // Configurar los decimales si el campo es de tipo "number"
                if (campo.decimales && input.type === "number") {
                    input.step = Math.pow(10, -campo.decimales).toString();
                }
            
                // Crear el label
                const label = document.createElement("label");
                label.htmlFor = campo.caracteristica;
                label.textContent = capitalizarPrimeraLetra(campo.denominacion);
                if (!campo.unidad) {
                    label.className = "form-label";
                }
            
                // Caso con unidad
                if (campo.unidad) {
                    // Crear un span para la unidad
                    const unidadSpan = document.createElement("span");
                    unidadSpan.className = "input-group-text";
                    unidadSpan.textContent = campo.unidad;
            
                    // Agregar el input y el span al contenedor
                    campoDiv.appendChild(input);
                    campoDiv.appendChild(label);
                    campoDiv.appendChild(unidadSpan);
                } else {
                    // Caso sin unidad
                    campoDiv.appendChild(input);
                    campoDiv.appendChild(label);
                }
            
                // Agregar el contenedor al div de campos dinámicos
                camposDinamicos.appendChild(campoDiv);
            });
            
        })
        .catch(error => console.error("Error al cargar los campos dinámicos:", error));
}

// Función para limpiar los campos dinámicos
function limpiarCamposDinamicos() {
    const camposDinamicos = document.getElementById("campos-dinamicos");
    camposDinamicos.innerHTML = "";
}

// Función para obtener el tipo de input basado en "tipo_campo"
function obtenerTipoInput(tipoCampo) {
    switch (tipoCampo) {
        case "NUM":
            return "number";
        case "CHAR":
            return "text";
        case "DATE":
            return "date";
        default:
            return "text"; // Tipo predeterminado
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('.tab-button');
    const sections = document.querySelectorAll('.section');

    buttons.forEach(button => {
        button.addEventListener('click', () => {
            // Remover la clase "active" de todos los botones y secciones
            buttons.forEach(btn => btn.classList.remove('active'));
            sections.forEach(section => section.classList.remove('active'));

            // Activar el botón y la sección correspondiente
            button.classList.add('active');
            const target = document.getElementById(button.dataset.target);
            target.classList.add('active');
        });
    });
});

function obtenerDatosDinamicos() {
    const camposDinamicos = document.getElementById("campos-dinamicos");
    const inputs = camposDinamicos.querySelectorAll("input, select, textarea");
    const formDinamicData = {};

    inputs.forEach(input => {
        const caracteristica = input.name; // Usar el atributo `name` como clave
        const valor = input.value.trim(); // Obtener el valor ingresado
        if (caracteristica) {
            formDinamicData[caracteristica] = valor || null; // Guardar el valor, usar `null` si está vacío
        }
    });

    console.log("Datos dinámicos:", formDinamicData);
    return formDinamicData; // Devolver el diccionario
}
