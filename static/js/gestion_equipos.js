let equiposCargados = [];
let modalEquiposInstance = null;
let enEdicion = false; 
let esCreacion = false; 

document.addEventListener('DOMContentLoaded', () => {
    // Inicializar el modal una vez al cargar la página
    const modalElement = document.getElementById('modalEquipos');
    modalEquiposInstance = new bootstrap.Modal(modalElement);
});


function guardarEquipo() {
    const equipoId = document.getElementById('detalle-titulo').dataset.id || null;
    const url = equipoId ? `/equipos/${equipoId}` : '/equipos';
    const method = equipoId ? 'PUT' : 'POST';
    const datos = {
        datsl: document.getElementById('datsl').value || '',
        eqtyp: document.getElementById('eqtyp').value.trim() || '',
        shtxt: document.getElementById('shtxt').value.trim().toUpperCase() || '',
        brgew: document.getElementById('brgew').value ? parseFloat(document.getElementById('brgew').value) : '',
        gewei: document.getElementById('gewei').value.trim() || '',
        groes: document.getElementById('groes').value.trim() || '',
        inbdt: document.getElementById('inbdt').value || '',
        eqart: document.getElementById('eqart').value.trim() || '',
        answt: document.getElementById('answt').value ? parseFloat(document.getElementById('answt').value) : '',
        ansdt: document.getElementById('ansdt').value || '',
        waers: document.getElementById('waers').value.trim() || '',
        herst: document.getElementById('herst').value.trim() || '',
        herld: document.getElementById('herld').value.trim() || '',
        typbz: document.getElementById('typbz').value.trim() || '',
        baujj: document.getElementById('baujj').value.trim() || '',
        baumm: document.getElementById('baumm').value.trim() || '',
        mapar: document.getElementById('mapar').value.trim() || '',
        serge: document.getElementById('serge').value.trim() || '',
        abckz: document.getElementById('abckz').value.trim() || '',
        gewrk: document.getElementById('gewrk').value.trim() || '',
        tplnr: document.getElementById('tplnr').value.trim() || '',
        class: document.getElementById('class').value || ''
    };

    fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {

            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: data.error,
            });
        } else {
            Swal.fire({
                icon: 'success',
                title: 'Éxito',
                text: equipoId ? 'Equipo actualizado correctamente.' : 'Equipo creado correctamente.',
                timer: 1500,
                showConfirmButton: false
            });

            if (!equipoId) {
                datos.id = data.id; // ID generado por el servidor
                agregarEquipoALista(datos); // Nuevo equipo al inicio de la lista
                document.getElementById('detalle-titulo').dataset.id = data.id; // Actualizar el ID
                esCreacion = false; // Ya no es creación
            } else {
                actualizarDenominacionEnLista(equipoId, datos.shtxt);
            }

            // Marcar como activo el equipo recién creado o actualizado
            marcarEquipoActivo(data.id);

            toggleBotonEliminar(); // Mostrar u ocultar el botón de eliminar según el estado
            toggleEdicion(false); // Salir de modo edición

        }
    })
    .catch(error => {
        console.error('Error al guardar el equipo:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Ocurrió un error al guardar el equipo.',
        });
    });
}

function agregarEquipoALista(equipo) {
    const contenedorEquipos = document.querySelector('.list-group-equipos'); // Contenedor de equipos

    // Crear el botón del nuevo equipo
    const button = document.createElement('button');
    button.className = 'list-group-item list-group-item-action';
    button.textContent = `${equipo.shtxt}`;
    button.dataset.id = equipo.id;
    button.onclick = () => cargarEquipo(equipo.id);

    contenedorEquipos.prepend(button); // Agregar el nuevo botón al inicio del contenedor
}



function mostrarBotonEliminar() {
    const btnEliminar = document.getElementById('btn-borrar');
    if (btnEliminar) {
        btnEliminar.style.display = 'block'; // Mostrar el botón de eliminar
    }
}




document.addEventListener("DOMContentLoaded", () => {
    // Cargar clases al iniciar la página
    cargarClases();

    // Manejar cambio en el campo "N° de clase"
    const classSelect = document.getElementById("class");
    classSelect.addEventListener("change", (event) => {
        const claseSeleccionada = event.target.value;
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

    return formDinamicData; // Devolver el diccionario
}

function handleEliminarEquipo() {
    const equipoId = document.getElementById('detalle-titulo').dataset.id; // Obtener el ID del equipo actual

    if (!equipoId) {
        Swal.fire({
            icon: 'warning',
            title: 'Atención',
            text: 'No hay un equipo seleccionado para eliminar.',
        });
        return;
    }

    // Llamar a la función eliminarEquipo con el ID actual
    eliminarEquipo(equipoId);
}

function eliminarEquipo(id) {
    Swal.fire({
        title: '¿Está seguro?',
        text: "Esta acción no se puede deshacer.",
        icon: 'warning',
        iconColor: '#763626',
        showCancelButton: true,
        confirmButtonColor: '#763626',
        cancelButtonColor: '#6e6e6e',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            fetch(`/equipos/${id}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' }
            })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: `Error: ${data.error}`,
                        iconColor: '#763626',
                        confirmButtonColor: '#763626'
                    });
                } else {
                    Swal.fire({
                        icon: 'success',
                        title: 'Eliminado',
                        text: 'Equipo eliminado exitosamente.',
                        timer: 1500,
                        showConfirmButton: false,
                        iconColor: '#763626'
                    });

                    eliminarEquipoDeLista(id); // Quitar equipo de la lista
                    mostrarMensajePredeterminado(); // Mostrar mensaje predeterminado
                }
            })
            .catch(error => {
                console.error('Error al eliminar el equipo:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Ocurrió un error al eliminar el equipo.',
                    iconColor: '#763626',
                    confirmButtonColor: '#763626'
                });
            });
        }
    });
}

function eliminarEquipoDeLista(equipoId) {
    const botonesLista = document.querySelectorAll('.list-group-item');
    botonesLista.forEach(boton => {
        if (boton.dataset.id === equipoId) {
            boton.remove(); // Eliminar de la lista
        }
    });
}

function mostrarMensajePredeterminado() {
    const mensajePredeterminado = document.getElementById('mensaje-predeterminado');
    const detalleEquipoContent = document.querySelector('#detalle-equipo .card-body');

    mensajePredeterminado.classList.remove('hide');
    detalleEquipoContent.classList.remove('show');
}


function procesarArchivo() {
    const fileInput = document.getElementById('file-input');
    const file = fileInput.files[0];
    if (!file) {
        Swal.fire({
            icon: 'warning',
            title: 'Atención',
            text: 'Por favor, selecciona un archivo.',
            confirmButtonColor: '#763626',
        });
        return;
    }

    const formData = new FormData();
    formData.append('file', file);

    fetch('/upload_excel', { method: 'POST', body: formData })
        .then(response => response.json())
        .then(data => {
            equiposCargados = data.map(equipo => ({
                ...equipo,
                duplicado: verificarEquipoDuplicado(equipo.shtxt), // Verificar duplicados
            }));
            mostrarEquiposModal(equiposCargados);
            fileInput.value = ''; // Asegurarse de resetear el input
        })
        .catch(error => {
            console.error('Error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Ocurrió un error al procesar el archivo.',
                confirmButtonColor: '#763626',
            });
        });
}

function verificarEquipoDuplicado(shtxt) {
    const equiposExistentes = Array.from(
        document.querySelectorAll('.list-group .list-group-item[data-id]')
    ).map(item => item.textContent.trim());
    return equiposExistentes.includes(shtxt.trim());
}

function mostrarEquiposModal(equipos) {
    const lista = document.getElementById('lista-equipos');
    const btnConfirmar = document.getElementById('btn-confirmar-subida');
    lista.innerHTML = ''; // Limpiar lista anterior

    let hayEquiposValidos = false;

    equipos.forEach((equipo, index) => {
        // Crear el contenedor principal para el equipo
        const item = document.createElement('li');
        item.className = 'list-group-item d-flex justify-content-between align-items-center';

        // Crear el texto principal
        const info = document.createElement('span');
        info.textContent = `${index + 1}. ${equipo.shtxt || 'Sin descripción'}`;
        if (equipo.duplicado) {
            info.style.textDecoration = 'line-through'; // Tachado
            info.style.color = '#763626'; // Color rojo para el texto principal
        } else {
            hayEquiposValidos = true;
        }

        // Crear el aviso (warning) para los duplicados
        if (equipo.duplicado) {
            const warning = document.createElement('span');
            warning.textContent = 'Equipo ya existe';
            warning.style.color = '#000'; // Color negro para el aviso
            warning.style.fontSize = '0.9em'; // Tamaño de fuente más pequeño

            // Agregar el aviso al lado derecho
            item.appendChild(warning);
        }

        // Agregar el texto principal al lado izquierdo
        item.prepend(info);

        lista.appendChild(item);
    });

    // Mostrar u ocultar el botón confirmar según si hay equipos válidos
    btnConfirmar.style.display = hayEquiposValidos ? 'block' : 'none';

    // Cambiar el color del botón confirmar
    btnConfirmar.style.backgroundColor = '#003366';
    btnConfirmar.style.color = '#fff';

    // Inicializar el modal si aún no se ha hecho
    if (!modalEquiposInstance) {
        const modalElement = document.getElementById('modalEquipos');
        modalEquiposInstance = new bootstrap.Modal(modalElement);
    }

    // Mostrar el modal
    modalEquiposInstance.show();
}

function confirmarSubida() {
    // Filtrar equipos que no sean duplicados
    const equiposAEnviar = equiposCargados.filter(equipo => !equipo.duplicado);

    if (equiposAEnviar.length === 0) {
        Swal.fire({
            icon: 'warning',
            title: 'Atención',
            text: 'No hay equipos válidos para subir.',
            confirmButtonColor: '#763626',
        });
        return;
    }

    console.log("Datos enviados al servidor:", JSON.stringify(equiposAEnviar));

    fetch('/equipos/masivo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(equiposAEnviar),
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error en el servidor.');
            }
            return response.json();
        })
        .then(data => {
            Swal.fire({
                icon: 'success',
                title: 'Éxito',
                text: 'Equipos subidos exitosamente.',
                timer: 2000,
                showConfirmButton: false,
            });

            // Ocultar el modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('modalEquipos'));
            modal.hide();

            // Actualizar la lista de equipos
            actualizarListadoEquipos(data);
        })
        .catch(error => {
            console.error('Error al confirmar subida:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error al subir los equipos.',
                confirmButtonColor: '#763626',
            });
        });
}

function actualizarListadoEquipos(nuevosEquipos) {
    const contenedorEquipos = document.querySelector('.list-group-equipos'); // Contenedor de equipos

    // Crear un conjunto con los IDs actuales en la lista para evitar duplicados
    const idsActuales = new Set(
        Array.from(contenedorEquipos.querySelectorAll('.list-group-item'))
            .map(item => item.dataset.id)
    );

    // Agregar solo los equipos que no están ya en la lista
    nuevosEquipos.forEach(equipo => {
        if (!idsActuales.has(equipo.id.toString())) {
            const button = document.createElement('button');
            button.className = 'list-group-item list-group-item-action';
            button.textContent = `${equipo.shtxt}`;
            button.dataset.id = equipo.id;
            button.onclick = () => cargarEquipo(equipo.id);
            contenedorEquipos.appendChild(button); // Agregar el botón al contenedor
        }
    });
}

function cerrarModal() {
    if (modalEquiposInstance) {
        modalEquiposInstance.hide();
    }
}

function cargarEquipo(equipoId) {
    // Cancelar creación si estaba activa
    if (esCreacion) {
        esCreacion = false;
        toggleBotonEliminar();
    }

    fetch(`/equipos/${equipoId}`)
        .then(response => {
            if (!response.ok) throw new Error('Error al obtener los datos del equipo');
            return response.json();
        })
        .then(data => {
            enEdicion = false;
            toggleEdicion(false);

            console.log("Datos del equipo:", data);

            const mensajePredeterminado = document.getElementById('mensaje-predeterminado');
            const detalleEquipoContent = document.querySelector('#detalle-equipo .card-body');

            // Aplicar clase para mostrar el contenido con fade
            mensajePredeterminado.classList.add('hide');
            detalleEquipoContent.classList.add('show');

            // Cargar datos básicos en los campos
            cargarDatosBasicos(data);

            // Cargar campos dinámicos
            cargarDatosDinamicos(data.class, data.caracteristicas);

            // Marcar como activo el equipo en la lista
            marcarEquipoActivo(equipoId);

            // Desactivar modo edición (solo visualización)
            enEdicion = false;
            const btnGuardar = document.getElementById('btn-guardar');
            const iconoEditar = document.getElementById('icono-editar');
            btnGuardar.style.display = 'none';
            iconoEditar.classList.remove('bi-x');
            iconoEditar.classList.add('bi-pencil');
        })
        .catch(error => {
            console.error('Error al cargar el equipo:', error);
            alert('No se pudo cargar el equipo seleccionado.');
        });
}

function cargarDatosBasicos(data) {
    document.getElementById('detalle-titulo').dataset.id = data.id;

    const campos = [
        'datsl', 'eqtyp', 'shtxt', 'brgew', 'gewei', 'groes', 'inbdt', 'eqart', 'answt', 
        'ansdt', 'waers', 'herst', 'herld', 'typbz', 'baujj', 'baumm', 
        'mapar', 'serge', 'abckz', 'gewrk', 'tplnr', 'class'
    ];

    campos.forEach(campo => {
        const input = document.getElementById(campo);
        if (input) {
            input.value = data[campo] || '';
            input.setAttribute('readonly', true); // Bloquear por defecto
            input.classList.add('bg-light'); // Opcional: Fondo gris
        }
    });
}

function normalizarClave(clave) {
    // Convierte la clave a mayúsculas y elimina unidades adicionales como "(A)", "(mm)", etc.
    return clave
        .toUpperCase()
        .replace(/\(.*?\)/g, "") // Elimina cualquier texto entre paréntesis
        .replace(/\s+/g, "_")    // Reemplaza espacios por "_"
        .replace(/[ÁÀÂÄ]/g, "A") // Normaliza vocales con tilde
        .replace(/[ÉÈÊË]/g, "E")
        .replace(/[ÍÌÎÏ]/g, "I")
        .replace(/[ÓÒÔÖ]/g, "O")
        .replace(/[ÚÙÛÜ]/g, "U")
        .replace(/Ñ/g, "N")
        .trim();                // Elimina espacios al inicio o final
}

function buscarClaveAproximada(claveBuscada, claves) {
    // Busca si alguna clave incluye la clave buscada (búsqueda aproximada)
    return claves.find(clave => clave.includes(claveBuscada)) || null;
}

function formatearValorParaInput(tipo, valor) {
    if (tipo === 'number') {
        const numero = parseFloat(valor);
        return isNaN(numero) ? '' : numero; // Si no es número, devolver cadena vacía
    }
    return valor; // Retorna el valor sin modificar para otros tipos
}

function cargarDatosDinamicos(clase, caracteristicasJSON) {
    if (!clase || !caracteristicasJSON) return;

    let caracteristicas = {};
    try {
        caracteristicas = JSON.parse(caracteristicasJSON);
    } catch (e) {
        console.warn("Error al parsear características:", e);
        return;
    }

    // Normaliza las claves del JSON de características
    const caracteristicasNormalizadas = {};
    for (let clave in caracteristicas) {
        const claveNormalizada = normalizarClave(clave);
        caracteristicasNormalizadas[claveNormalizada] = caracteristicas[clave];
    }

    fetch(`/clases/${clase}`)
        .then(response => {
            if (!response.ok) throw new Error('Error al cargar los campos dinámicos');
            return response.json();
        })
        .then(campos => {
            const contenedor = document.getElementById("campos-dinamicos");
            contenedor.innerHTML = "";

            // Obtén las claves normalizadas de las características
            const clavesCaracteristicas = Object.keys(caracteristicasNormalizadas);

            campos.forEach(campo => {
                const claveNormalizadaCampo = normalizarClave(campo.caracteristica); // Normaliza clave esperada
                
                // Busca una clave aproximada en las características
                const claveEncontrada = buscarClaveAproximada(claveNormalizadaCampo, clavesCaracteristicas);
                const valor = claveEncontrada ? caracteristicasNormalizadas[claveEncontrada] : '';

                const div = document.createElement("div");
                div.className = "col-md-6 mb-3 form-floating";
                div.innerHTML = `
                    <input type="${obtenerTipoInput(campo.tipo_campo)}" 
                           id="${campo.caracteristica}" 
                           name="${campo.caracteristica}" 
                           class="form-control bg-light" 
                           value="${formatearValorParaInput(obtenerTipoInput(campo.tipo_campo), valor)}" 
                           maxlength="${campo.ctd_posiciones || ''}" 
                           readonly>
                    <label for="${campo.caracteristica}">${campo.denominacion}</label>
                `;
                contenedor.appendChild(div);
            });
        })
        .catch(error => console.error("Error al cargar los campos dinámicos:", error));
}

function toggleEdicion(forzarEdicion = null) {
    if (forzarEdicion !== null) {
        enEdicion = forzarEdicion; // Forzar el estado si es necesario
    } else {
        enEdicion = !enEdicion; // Alternar el estado de edición
    }

    const iconoEditar = document.getElementById('icono-editar');
    const inputs = document.querySelectorAll('#detalle-equipo input, #detalle-equipo select');
    const denominacionInput = document.getElementById('shtxt'); // Campo específico
    const btnGuardar = document.getElementById('btn-guardar'); // Botón Guardar
    const mensajePredeterminado = document.getElementById('mensaje-predeterminado'); // Mensaje inicial
    const detalleEquipoContent = document.querySelector('#detalle-equipo .card-body'); // Formulario

    if (enEdicion) {
        // Modo Edición
        iconoEditar.classList.remove('bi-pencil');
        iconoEditar.classList.add('bi-x');

        inputs.forEach(input => {
            input.removeAttribute('readonly');
            input.classList.remove('bg-light'); // Opcional: Cambiar color
        });

        btnGuardar.style.display = 'inline-block';

        if (denominacionInput) {
            denominacionInput.classList.add('edit-border');
        }

        // Mostrar formulario y ocultar mensaje predeterminado
        mensajePredeterminado.classList.add('hide');
        detalleEquipoContent.classList.add('show');

    } else {
        // Salir del modo Edición
        iconoEditar.classList.remove('bi-x');
        iconoEditar.classList.add('bi-pencil');

        inputs.forEach(input => {
            input.setAttribute('readonly', true);
            input.classList.add('bg-light');
        });

        btnGuardar.style.display = 'none';

        if (denominacionInput) {
            denominacionInput.classList.remove('edit-border');
        }

        // Si estamos en creación, regresar al mensaje inicial
        if (esCreacion) {
            mensajePredeterminado.classList.remove('hide');
            detalleEquipoContent.classList.remove('show');
            esCreacion = false; // Salimos del modo creación
        } else {
            // Si no es creación, solo ocultar el botón Guardar y dejar visible el contenido
            detalleEquipoContent.classList.add('show');
        }
    }
}

function toggleBotonEliminar() {
    const btnEliminar = document.getElementById('btn-borrar');
    const EditionButton = document.getElementById('EditionButton');
    if (btnEliminar) {
        btnEliminar.style.display = esCreacion ? 'none' : 'block';
        EditionButton.style.justifyContent = esCreacion ? 'flex-end' : 'normal'; 
         // Ocultar si es creación, mostrar si no
    }
}


function mostrarFormularioNuevo() {
    esCreacion = true; // Indicamos que estamos creando un nuevo equipo
    enEdicion = true; // Activar el modo edición

    const mensajePredeterminado = document.getElementById('mensaje-predeterminado');
    const detalleEquipoContent = document.querySelector('#detalle-equipo .card-body');
    const denominacionInput = document.getElementById('shtxt'); // Campo específico

    // Aplicar transiciones
    mensajePredeterminado.classList.add('hide');
    detalleEquipoContent.classList.add('show');

    // Limpiar y habilitar formulario
    const inputs = document.querySelectorAll('#detalle-equipo input, #detalle-equipo select');
    inputs.forEach(input => {
        input.removeAttribute('readonly');
        input.classList.remove('bg-light');
        input.value = ''; // Limpiar el valor de los inputs
    });

    // Resetea el ID para evitar sobreescribir un equipo existente
    document.getElementById('detalle-titulo').dataset.id = '';

    if (denominacionInput) {
        denominacionInput.classList.add('edit-border');
    }

    const btnGuardar = document.getElementById('btn-guardar');
    const iconoEditar = document.getElementById('icono-editar');

    btnGuardar.style.display = 'inline-block';
    iconoEditar.classList.remove('bi-pencil');
    iconoEditar.classList.add('bi-x');

    // Quitar clase "active" de cualquier equipo previamente seleccionado
    const botonesLista = document.querySelectorAll('.list-group-item');
    botonesLista.forEach(boton => boton.classList.remove('active'));

    toggleBotonEliminar(); // Ocultar el botón de eliminar, ya que es un nuevo equipo
}


function actualizarDenominacionEnLista(equipoId, nuevaDenominacion) {
    const botonesLista = document.querySelectorAll('.list-group-item');
    botonesLista.forEach(boton => {
        if (boton.dataset.id === equipoId) {
            boton.textContent = nuevaDenominacion;
        }
    });
}

function marcarEquipoActivo(equipoId) {
    // Remover la clase active de todos los botones
    const botonesLista = document.querySelectorAll('.list-group-item');
    botonesLista.forEach(boton => {
        boton.classList.remove('active');
    });

    // Agregar la clase active al botón correspondiente
    const botonActivo = document.querySelector(`.list-group-item[data-id="${equipoId}"]`);
    if (botonActivo) {
        botonActivo.classList.add('active');
    }
}

async function exportarExcel() {
    try {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Equipos');

        // Estilos
        const estiloEstatico = {
            fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: '548235' } }, // Fondo verde
            border: {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' },
            },
        };
        const estiloVacio = {
            fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F8CBAD' } }, // Fondo rosado
            border: {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' },
            },
        };
        const estiloDinamico = {
            fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF00' } }, // Fondo amarillo
            border: {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' },
            },
        };

        // Orden de columnas según especificación
        const columnasOrdenadas = [
            'datsl', 'eqtyp', 'shtxt', 'brgew', 'gewei', 'groes', 'invnr', 'inbdt',
            'eqart', 'answt', 'ansdt', 'waers', 'herst', 'herld', 'typbz', 'baujj',
            'baumm', 'mapar', 'serge', 'datab', 'swerk', 'Local', 'abckz', 'eqfnr',
            'bukrs', 'kostl', 'iwerk', 'ingrp', 'gewrk', 'wergw', 'rbnr', 'tplnr',
            'heqnr', 'hstps', 'posnr', 'lbbsa', 'b_werk', 'b_lager', 'class',
        ];

        // Obtener datos de la API
        const response = await fetch('/equipos');
        const data = await response.json();

        // Agregar columnas dinámicas (características)
        const maxCaracteristicas = Math.max(
            ...data.map((equipo) => {
                const caracteristicas = JSON.parse(equipo.caracteristicas || '{}');
                return Object.keys(caracteristicas).length;
            })
        );

        const columnasDinamicas = [];
        for (let i = 1; i <= maxCaracteristicas; i++) {
            columnasDinamicas.push(`car${i}`);
            columnasDinamicas.push(`val${i}`);
        }

        // Combinar encabezados
        const encabezados = [...columnasOrdenadas, ...columnasDinamicas];
        const filaEncabezados = worksheet.addRow(encabezados);

        // Estilizar encabezados
        filaEncabezados.eachCell((cell, colNumber) => {
            const header = encabezados[colNumber - 1];
            if (columnasOrdenadas.includes(header)) {
                if (['invnr', 'datab', 'swerk', 'Local', 'eqfnr', 'bukrs', 'kostl', 'iwerk', 'ingrp', 'wergw', 'rbnr', 'heqnr', 'hstps', 'posnr', 'lbbsa', 'b_werk', 'b_lager'].includes(header)) {
                    cell.style = estiloVacio; // Columnas vacías
                } else {
                    cell.style = estiloEstatico; // Columnas estáticas
                }
            } else {
                cell.style = estiloEstatico; // Características en verde
            }
        });

        // Agregar datos
        data.forEach((equipo) => {
            const filaDatos = columnasOrdenadas.map((columna) => equipo[columna] || '');
            const caracteristicas = JSON.parse(equipo.caracteristicas || '{}');
            const keys = Object.keys(caracteristicas);

            // Agregar datos dinámicos
            for (let i = 0; i < maxCaracteristicas; i++) {
                filaDatos.push(keys[i] || '');
                filaDatos.push(caracteristicas[keys[i]] || '');
            }

            const fila = worksheet.addRow(filaDatos);

            // Estilizar celdas
            fila.eachCell((cell, colNumber) => {
                const header = encabezados[colNumber - 1];
                const value = filaDatos[colNumber - 1];
                if (columnasOrdenadas.includes(header)) {
                    if (['invnr', 'datab', 'swerk', 'Local', 'eqfnr', 'bukrs', 'kostl', 'iwerk', 'ingrp', 'wergw', 'rbnr', 'heqnr', 'hstps', 'posnr', 'lbbsa', 'b_werk', 'b_lager'].includes(header)) {
                        cell.style = estiloVacio; // Vacías por defecto
                    } else if (value) {
                        cell.style = estiloEstatico; // Con datos
                    } else {
                        cell.style = estiloDinamico; // Sin datos
                    }
                } else {
                    if (value) {
                        cell.style = estiloEstatico; // Características con valores
                    } else {
                        cell.style = estiloDinamico; // Características sin valores
                    }
                }
            });
        });

        // Configurar ancho de columnas
        worksheet.columns = encabezados.map((header) => ({ width: header.length + 5 }));

        // Descargar el archivo
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = 'equipos.xlsx';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    } catch (error) {
        console.error('Error al exportar el Excel:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Ocurrió un error al exportar el Excel.',
            confirmButtonColor: '#763626',
        });
    }
}






/*
function cargarEquipo(equipoId) {
    equipoId = parseInt(equipoId, 10); // Convertir a número si es necesario
    fetch(`/equipos/${equipoId}`)
        .then(response => response.json())
        .then(data => {
            const detalleTitulo = document.getElementById('detalle-titulo');
            const infoEquipo = document.getElementById('info-equipo');

            // Actualizar el título
            detalleTitulo.textContent = `${data.eqtyp} - ${data.shtxt}`;
            detalleTitulo.dataset.id = data.id;

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
}*/

