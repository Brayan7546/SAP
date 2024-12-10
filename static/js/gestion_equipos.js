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
