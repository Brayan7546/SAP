// Inicializar DataTable
$(document).ready(function() {
    let table = $('#equipos-table').DataTable({
        scrollX: true,
        language: {
            url: '//cdn.datatables.net/plug-ins/1.13.7/i18n/es-ES.json'
        },
        dom: 'Bfrtip',
        buttons: [
            {
                text: 'Guardar Todos los Cambios',
                action: function(e, dt, node, config) {
                    guardarTodosLosCambios();
                }
            }
        ]
    });

    // Guardar cambios de una fila
    $('#equipos-table').on('click', '.save-row', function() {
        const row = $(this).closest('tr');
        const equipoId = row.data('id');
        const equipoData = {
            id: equipoId,
            eqtyp: row.find('td:eq(1)').text(),
            shtxt: row.find('td:eq(2)').text(),
            brgew: row.find('td:eq(3)').text(),
            gewei: row.find('td:eq(4)').text(),
            groes: row.find('td:eq(5)').text(),
            inbdt: row.find('td:eq(6)').text(),
            eqart: row.find('td:eq(7)').text(),
            answt: row.find('td:eq(8)').text(),
            ansdt: row.find('td:eq(9)').text(),
            waers: row.find('td:eq(10)').text(),
            herst: row.find('td:eq(11)').text(),
            herld: row.find('td:eq(12)').text(),
            typbz: row.find('td:eq(13)').text(),
            baujj: row.find('td:eq(14)').text(),
            baumm: row.find('td:eq(15)').text(),
            mapar: row.find('td:eq(16)').text(),
            serge: row.find('td:eq(17)').text(),
            abckz: row.find('td:eq(18)').text(),
            gewrk: row.find('td:eq(19)').text(),
            tplnr: row.find('td:eq(20)').text(),
            caracteristicas: row.find('td:eq(21)').text(),
            class: row.find('td:eq(22)').text()
        };

        guardarCambios(equipoId, equipoData);
    });

    // Función para guardar todos los cambios
    function guardarTodosLosCambios() {
        const cambios = [];
        table.rows().every(function() {
            const row = $(this.node());
            const equipoId = row.data('id');
            const equipoData = {
                id: equipoId,
                eqtyp: row.find('td:eq(1)').text(),
                // ... (mismo mapeo que arriba)
            };
            cambios.push(equipoData);
        });

        // Enviar todos los cambios al servidor
        fetch('/actualizar_equipos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ equipos: cambios })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Todos los cambios guardados correctamente');
            } else {
                alert('Error al guardar los cambios');
            }
        });
    }

    // Función para guardar cambios de una fila
    function guardarCambios(equipoId, data) {
        fetch(`/actualizar_equipo/${equipoId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Cambios guardados correctamente');
            } else {
                alert('Error al guardar los cambios');
            }
        });
    }
});

let tablaEquipos;
let modoEdicion = false;

function inicializarTabla() {
    if (!tablaEquipos) {
        tablaEquipos = $('#equipos-table').DataTable({
            scrollX: true,
            language: {
                url: '//cdn.datatables.net/plug-ins/1.13.7/i18n/es-ES.json'
            },
            dom: 'frtip', // Removemos los botones por defecto
        });
    }
}

function toggleVista() {
    const detalleEquipo = document.getElementById('detalle-equipo');
    const tablaEquipos = document.getElementById('tabla-equipos');
    const toggleButton = document.getElementById('toggle-view-btn');

    if (tablaEquipos.classList.contains('d-none')) {
        tablaEquipos.classList.remove('d-none');
        detalleEquipo.classList.add('d-none');
        toggleButton.textContent = "Mostrar Formulario";
        document.body.style.overflow = 'hidden';
        inicializarTabla();
    } else {
        tablaEquipos.classList.add('d-none');
        detalleEquipo.classList.remove('d-none');
        toggleButton.textContent = "Mostrar Listado";
        document.body.style.overflow = 'auto';
        // Salir del modo edición si está activo
        if (modoEdicion) {
            toggleEditMode();
        }
    }
}

function toggleEditMode() {
    const tabla = document.getElementById('equipos-table');
    const btnEdit = document.getElementById('btn-edit-table');
    const btnSave = document.getElementById('btn-save-table');
    
    modoEdicion = !modoEdicion;
    
    if (modoEdicion) {
        tabla.classList.add('editing-mode');
        btnEdit.classList.add('d-none');
        btnSave.classList.remove('d-none');
        // Hacer las celdas editables
        const celdas = tabla.querySelectorAll('tbody td:not(:first-child)');
        celdas.forEach(celda => {
            celda.setAttribute('contenteditable', 'true');
        });
    } else {
        tabla.classList.remove('editing-mode');
        btnEdit.classList.remove('d-none');
        btnSave.classList.add('d-none');
        // Hacer las celdas no editables
        const celdas = tabla.querySelectorAll('tbody td');
        celdas.forEach(celda => {
            celda.removeAttribute('contenteditable');
        });
    }
}

function guardarCambiosTabla() {
    const cambios = [];
    const filas = document.querySelectorAll('#equipos-table tbody tr');
    
    filas.forEach(fila => {
        const equipoId = fila.dataset.id;
        const celdas = fila.querySelectorAll('td');
        
        const equipoData = {
            id: equipoId,
            eqtyp: celdas[1].textContent,
            shtxt: celdas[2].textContent,
            brgew: celdas[3].textContent,
            gewei: celdas[4].textContent,
            groes: celdas[5].textContent,
            inbdt: celdas[6].textContent,
            eqart: celdas[7].textContent,
            answt: celdas[8].textContent,
            ansdt: celdas[9].textContent,
            waers: celdas[10].textContent,
            herst: celdas[11].textContent,
            herld: celdas[12].textContent,
            typbz: celdas[13].textContent,
            baujj: celdas[14].textContent,
            baumm: celdas[15].textContent,
            mapar: celdas[16].textContent,
            serge: celdas[17].textContent,
            abckz: celdas[18].textContent,
            gewrk: celdas[19].textContent,
            tplnr: celdas[20].textContent,
            caracteristicas: celdas[21].textContent,
            class: celdas[22].textContent
        };
        
        cambios.push(equipoData);
    });

    // Enviar los cambios al servidor
    fetch('/actualizar_equipos', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ equipos: cambios })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Cambios guardados correctamente');
            toggleEditMode(); // Salir del modo edición
        } else {
            alert('Error al guardar los cambios');
            //mostrar todo lo que viene en data
            alert(data.error)
            alert(data.message)
            console.log(data)
        }
    });
}

// Inicializar cuando el documento esté listo
$(document).ready(function() {
    // La tabla se inicializará cuando se muestre por primera vez
});