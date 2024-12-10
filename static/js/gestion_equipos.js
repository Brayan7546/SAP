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
            `;
        })
        .catch(error => {
            console.error('Error al cargar los datos del equipo:', error);
            alert('No se pudo cargar la información del equipo.');
        });
}

function guardarEquipo() {
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
    };

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
}
