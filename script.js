// --- 1. SEGURIDAD: VERIFICACIÓN DE ACCESO ---
window.verificarAcceso = () => {
    const passInput = document.getElementById('passInput').value;
    const loginScreen = document.getElementById('loginScreen');
    const mainApp = document.getElementById('mainApp');
    const loginError = document.getElementById('loginError');

    if (passInput === "0132") {
        // Animación de salida y despliegue del Dashboard
        loginScreen.classList.add('opacity-0', 'pointer-events-none');
        setTimeout(() => {
            loginScreen.style.display = 'none';
            mainApp.classList.remove('hidden');
            
            // Inicializar renderizado de datos post-login
            window.actualizarSelectorPerfiles();
// --- 2. ESTRUCTURA DE DATOS UNIFICADA Y FIREBASE ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, set, get } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

// Pegarás aquí la configuración que te dé Firebase al crear el proyecto
const firebaseConfig = {
  apiKey: "AIzaSyBI343Syz-P8qPkgGqs-RZvac64zyfQl6s",
  authDomain: "realtime-database-b685a.firebaseapp.com",
  projectId: "realtime-database-b685a",
  storageBucket: "realtime-database-b685a.firebasestorage.app",
  messagingSenderId: "354223722580",
  appId: "1:354223722580:web:42ad7713daed77c9b6ddc1",
  measurementId: "G-EH29WKEXCB"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Variables globales
let dbGlobal = { perfiles: {}, prestamosHistorial: [] };
let perfilActivo = ""; 
let scanActual = { monto: 0, fecha: "" };

// Función para cargar los datos desde la nube al iniciar
window.cargarDB = async () => {
    try {
        const snapshot = await get(ref(db, 'fintechData'));
        if (snapshot.exists()) {
            dbGlobal = snapshot.val();
            // Asegurar la estructura por si la BD está vacía
            if (!dbGlobal.perfiles) dbGlobal.perfiles = {};
            if (!dbGlobal.prestamosHistorial) dbGlobal.prestamosHistorial = [];
        }
    } catch (error) {
        console.error("Error cargando Firebase, usando LocalStorage local:", error);
        dbGlobal = JSON.parse(localStorage.getItem('fintechGlobalDB')) || { perfiles: {}, prestamosHistorial: [] };
    }
    window.actualizarSelectorPerfiles();
    window.renderizarPrestamos();
};

// Modificamos guardarDB para que envíe los datos a Firebase y mantenga una copia local
window.guardarDB = async () => {
    localStorage.setItem('fintechGlobalDB', JSON.stringify(dbGlobal)); // Backup local
    try {
        await set(ref(db, 'fintechData'), dbGlobal); // Guardado en la nube
    } catch (error) {
        console.error("No se pudo sincronizar con la nube:", error);
    }
};

// Llama a cargarDB cuando todo el documento esté listo
document.addEventListener("DOMContentLoaded", () => {
    window.cargarDB();
});
let scanActual = { monto: 0, fecha: "" };

window.guardarDB = () => {
    localStorage.setItem('fintechGlobalDB', JSON.stringify(dbGlobal));
};

// --- 3. SISTEMA DE PESTAÑAS ---
window.cambiarPestaña = (tab) => {
    const vAbonos = document.getElementById('vistaAbonos');
    const vPrestamos = document.getElementById('vistaPrestamos');
    const btnAbonos = document.getElementById('btnTabAbonos');
    const btnPrestamos = document.getElementById('btnTabPrestamos');

    if(tab === 'abonos') {
        vAbonos.classList.remove('hidden'); vAbonos.classList.add('block');
        vPrestamos.classList.remove('block'); vPrestamos.classList.add('hidden');
        btnAbonos.className = "flex-1 md:flex-none px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-md bg-white text-purple-800";
        btnPrestamos.className = "flex-1 md:flex-none px-6 py-3 rounded-xl font-bold text-sm transition-all text-gray-500 hover:text-purple-600";
        window.actualizarSelectorPerfiles();
    } else {
        vPrestamos.classList.remove('hidden'); vPrestamos.classList.add('block');
        vAbonos.classList.remove('block'); vAbonos.classList.add('hidden');
        btnPrestamos.className = "flex-1 md:flex-none px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-md bg-white text-purple-800";
        btnAbonos.className = "flex-1 md:flex-none px-6 py-3 rounded-xl font-bold text-sm transition-all text-gray-500 hover:text-purple-600";
    }
};

// --- 4. LÓGICA: PERFILES Y ABONOS ---
window.actualizarSelectorPerfiles = () => {
    const selector = document.getElementById('selectorPerfil');
    const seleccionPrevia = selector.value;
    
    selector.innerHTML = '<option value="">-- Selecciona un cliente registrado --</option>';
    
    Object.keys(dbGlobal.perfiles).sort().forEach(cliente => {
        selector.innerHTML += `<option value="${cliente}">${cliente}</option>`;
    });

    if(seleccionPrevia && dbGlobal.perfiles[seleccionPrevia]) {
        selector.value = seleccionPrevia;
        window.cargarPerfilSeleccionado();
    } else {
        perfilActivo = "";
        document.getElementById('bloqueoEscaner').classList.remove('hidden');
        document.getElementById('infoPerfilActivo').classList.add('hidden');
        window.limpiarUIAbonos();
    }
};

window.cargarPerfilSeleccionado = () => {
    perfilActivo = document.getElementById('selectorPerfil').value;
    
    if(!perfilActivo) {
        document.getElementById('bloqueoEscaner').classList.remove('hidden');
        document.getElementById('infoPerfilActivo').classList.add('hidden');
        window.limpiarUIAbonos();
        return;
    }

    document.getElementById('bloqueoEscaner').classList.add('hidden');
    document.getElementById('infoPerfilActivo').classList.remove('hidden');
    window.actualizarUIAbonosCliente();
};

window.editarDeudaManual = () => {
    if(!perfilActivo) return;
    const deudaActual = dbGlobal.perfiles[perfilActivo].deudaTotal;
    const nuevaDeuda = prompt(`Modificar deuda total asignada a ${perfilActivo}:`, deudaActual);
    
    if(nuevaDeuda !== null && !isNaN(nuevaDeuda) && nuevaDeuda.trim() !== "") {
        dbGlobal.perfiles[perfilActivo].deudaTotal = parseFloat(nuevaDeuda);
        window.guardarDB();
        window.actualizarUIAbonosCliente();
    }
};

window.actualizarUIAbonosCliente = () => {
    if(!perfilActivo) return;
    
    const perfil = dbGlobal.perfiles[perfilActivo];
    document.getElementById('abDeudaVisual').innerText = `S/ ${perfil.deudaTotal.toFixed(2)}`;
    
    const abonado = perfil.abonos.reduce((s, i) => s + i.monto, 0);
    const saldo = perfil.deudaTotal - abonado;

    document.getElementById('abTotalAbonado').innerText = `S/ ${abonado.toFixed(2)}`;
    
    const elSaldo = document.getElementById('abSaldoPendiente');
    const tagPagado = document.getElementById('tagPagado');
    
    if (saldo <= 0) {
        elSaldo.innerText = `S/ 0.00`;
        elSaldo.className = "text-4xl font-black text-gray-400 line-through";
        tagPagado.classList.remove('hidden');
    } else {
        elSaldo.innerText = `S/ ${saldo.toFixed(2)}`;
        elSaldo.className = "text-4xl font-black text-green-600";
        tagPagado.classList.add('hidden');
    }
    
    const tbody = document.getElementById('abTabla');
    tbody.innerHTML = "";
    perfil.abonos.forEach(ab => {
        tbody.innerHTML += `<tr class="hover:bg-gray-50"><td class="px-6 py-3">${ab.fecha}</td><td class="px-6 py-3 text-right font-bold text-gray-800">S/ ${ab.monto.toFixed(2)}</td><td class="px-6 py-3 text-center"><button onclick="eliminarAbono(${ab.id})" class="text-red-400 font-bold hover:text-red-600">X</button></td></tr>`;
    });
    if(perfil.abonos.length === 0) tbody.innerHTML = `<tr><td colspan="3" class="p-6 text-center text-gray-400 italic">No hay pagos registrados para este cliente.</td></tr>`;
    
    return { abonado, saldo };
};

window.limpiarUIAbonos = () => {
    document.getElementById('abDeudaVisual').innerText = "S/ 0.00";
    document.getElementById('abTotalAbonado').innerText = "S/ 0.00";
    document.getElementById('abSaldoPendiente').innerText = "S/ 0.00";
    document.getElementById('abSaldoPendiente').className = "text-4xl font-black text-green-600";
    document.getElementById('tagPagado').classList.add('hidden');
    document.getElementById('abTabla').innerHTML = "";
    document.getElementById('abPreview').classList.add('hidden');
    document.getElementById('abResultado').classList.add('hidden');
};

window.eliminarAbono = (id) => {
    if(!perfilActivo || !confirm("¿Eliminar abono?")) return;
    dbGlobal.perfiles[perfilActivo].abonos = dbGlobal.perfiles[perfilActivo].abonos.filter(a => a.id !== id);
    window.guardarDB();
    window.actualizarUIAbonosCliente();
};

// --- ESCÁNER OCR ---
const obtenerParteSuperior = (file) => {
    return new Promise(resolve => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas'); const ctx = canvas.getContext('2d');
            canvas.width = img.width; canvas.height = img.height * 0.30; 
            ctx.drawImage(img, 0, img.height * 0.10, img.width, img.height * 0.30, 0, 0, canvas.width, canvas.height);
            resolve(canvas.toDataURL('image/jpeg'));
        };
        img.src = URL.createObjectURL(file);
    });
};

document.getElementById('abImagen').addEventListener('change', async (e) => {
    const archivo = e.target.files[0]; if(!archivo) return;
    document.getElementById('abImgTag').src = URL.createObjectURL(archivo);
    document.getElementById('abPreview').classList.remove('hidden');
    
    const abEstado = document.getElementById('abEstado');
    abEstado.classList.remove('hidden');
    abEstado.classList.add('block');
    document.getElementById('abEstadoTxt').innerText = "Escaneando... (Espera unos segundos)";
    document.getElementById('abResultado').classList.add('hidden');

    try {
        const imgTop = await obtenerParteSuperior(archivo);
        const [resFull, resTop] = await Promise.all([
            Tesseract.recognize(archivo, 'spa'),
            Tesseract.recognize(imgTop, 'spa', { tessedit_pageseg_mode: '6' })
        ]);

        const txtMonto = resTop.data.text.replace(/[\n\r]/g, " ");
        const m_monto = txtMonto.match(/(?:[S\$s5]\s*[\/\\]|S\.)\s*([0-9SOso]{1,5}(?:[.,][0-9SOso]{1,2})?)/i);
        const m_fecha = resFull.data.text.match(/(\d{2}\s+[a-záéíóú]{3}\.?\s+\d{4})/i);

        if (m_monto) {
            let cLimpia = m_monto[1].toUpperCase().replace(/O/g, '0').replace(/S/g, '5').replace(',', '.');
            scanActual.monto = parseFloat(cLimpia);
            document.getElementById('abTempMonto').innerText = (scanActual.monto>0) ? `S/ ${scanActual.monto.toFixed(2)}` : "Inválido";
        } else {
            scanActual.monto = 0; document.getElementById('abTempMonto').innerText = "No detectado";
        }

        scanActual.fecha = m_fecha ? m_fecha[1] : new Date().toLocaleDateString();
        document.getElementById('abTempFecha').innerText = scanActual.fecha;

        abEstado.classList.add('hidden');
        abEstado.classList.remove('block');
        document.getElementById('abResultado').classList.remove('hidden');
    } catch(error) { 
        alert("Error al leer imagen."); 
        document.getElementById('abEstado').classList.add('hidden'); 
    }
    e.target.value = '';
});

window.registrarAbono = () => {
    if (!perfilActivo) return alert("Selecciona un perfil.");
    if (scanActual.monto <= 0) return alert("Monto no válido.");
    
    dbGlobal.perfiles[perfilActivo].abonos.unshift({ id: Date.now(), fecha: scanActual.fecha, monto: scanActual.monto });
    window.guardarDB();
    window.actualizarUIAbonosCliente();
    
    document.getElementById('abResultado').classList.add('hidden');
    document.getElementById('abPreview').classList.add('hidden');
};

// --- 5. LÓGICA: EMISIÓN DE PRÉSTAMOS E INTEGRACIÓN ---
window.calcularPrestamo = () => {
    const s = parseFloat(document.getElementById('prSaldo').value)||0;
    const n = parseFloat(document.getElementById('prNuevo').value)||0;
    const c = parseFloat(document.getElementById('prComision').value)||0;
    const t = s+n+c;
    document.getElementById('prTotalCalc').innerText = `S/ ${t.toFixed(2)}`;
    return {s, n, c, t};
};

window.guardarPrestamo = () => {
    let cli = document.getElementById('prCliente').value.trim();
    cli = cli.replace(/\b\w/g, l => l.toUpperCase());
    
    if(!cli) return alert("Ingresa el nombre del cliente.");
    const v = window.calcularPrestamo();
    if(v.t <= 0) return alert("El monto total debe ser mayor a cero.");
    
    const now = new Date();
    const registroPrestamo = { id: Date.now(), cliente: cli, fecha: `${now.toLocaleDateString()} ${now.toLocaleTimeString()}`, ...v };
    dbGlobal.prestamosHistorial.unshift(registroPrestamo);
    
    if (!dbGlobal.perfiles[cli]) {
        dbGlobal.perfiles[cli] = { deudaTotal: v.t, abonos: [] };
    } else {
        dbGlobal.perfiles[cli].deudaTotal += v.t;
    }

    window.guardarDB();
    window.renderizarPrestamos();
    
    alert(`Préstamo emitido. Se ha creado/actualizado el perfil de "${cli}".`);

    document.getElementById('prCliente').value=""; 
    document.getElementById('prSaldo').value="0"; 
    document.getElementById('prNuevo').value="0"; 
    document.getElementById('prComision').value="0"; 
    window.calcularPrestamo();
};

window.renderizarPrestamos = () => {
    const tbody = document.getElementById('prTabla'); tbody.innerHTML = "";
    let cap = 0, com = 0;
    dbGlobal.prestamosHistorial.forEach(p => {
        cap += p.n; com += p.c;
        tbody.innerHTML += `
        <tr class="hover:bg-purple-50 transition">
            <td class="px-6 py-3"><p class="font-bold text-gray-800">${p.cliente}</p><p class="text-xs text-gray-400">${p.fecha}</p></td>
            <td class="px-6 py-3 text-right text-xs text-gray-500 border-l border-r">Ant: S/${p.s.toFixed(2)}<br><span class="text-purple-600 font-bold">Nvo: S/${p.n.toFixed(2)}</span><br><span class="text-orange-500">Com: S/${p.c.toFixed(2)}</span></td>
            <td class="px-6 py-3 text-right font-black text-gray-900">S/ ${p.t.toFixed(2)}</td>
            <td class="px-6 py-3 text-center">
                <button onclick="generarReciboPNG(${p.id})" class="bg-purple-100 hover:bg-purple-600 hover:text-white text-purple-700 px-3 py-1 rounded-lg font-bold text-xs transition shadow-sm">Recibo PNG</button>
            </td>
        </tr>`;
    });
    if(dbGlobal.prestamosHistorial.length===0) tbody.innerHTML=`<tr><td colspan="4" class="p-8 text-center text-gray-400 italic">Sin historial de préstamos emitidos.</td></tr>`;
    
    document.getElementById('prStatCapital').innerText = `S/ ${cap.toFixed(2)}`;
    document.getElementById('prStatComision').innerText = `S/ ${com.toFixed(2)}`;
};

// --- 6. EXPORTACIÓN Y REINICIO ---
window.exportarAppGlobal = () => {
    const jsonDbGlobal = JSON.stringify(dbGlobal);
    const scriptRestauracion = `<script id="inyector-fintech-global">
        localStorage.setItem('fintechGlobalDB', JSON.stringify(${jsonDbGlobal}));
    <\/script>`;
    
    let clone = document.documentElement.cloneNode(true);
    let oldInyector = clone.querySelector('#inyector-fintech-global');
    if(oldInyector) oldInyector.remove();
    
    clone.querySelector('head').insertAdjacentHTML('afterbegin', scriptRestauracion);
    
    const htmlFinal = "<!DOCTYPE html>\n" + clone.outerHTML;
    const blob = new Blob([htmlFinal], {type: "text/html"});
    const url = URL.createObjectURL(blob);
    
    const now = new Date();
    const filename = `Fintech_Manager_V6_${now.getDate()}${now.getMonth()+1}${now.getFullYear()}.html`;
    
    const a = document.createElement("a"); a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
};

window.limpiarAppGlobal = () => {
    if(confirm("⚠️ ¿PELIGRO: ESTO BORRARÁ ABSOLUTAMENTE TODOS LOS DATOS. SEGURO?")) {
        localStorage.removeItem('fintechGlobalDB');
        location.reload();
    }
};

// --- 7. EXPORTACIÓN PNGs ---
const nombreArchivo = (prefijo, nombreP) => {
    let n = (nombreP || "S/N").trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
    const d = new Date(); return `${n}-${d.getDate()}${d.getMonth()+1}${d.getFullYear()}-${d.getHours()}${d.getMinutes()}-${prefijo}.png`;
};

window.descargarPNG = async (tipo) => {
    if(!perfilActivo) return alert("Selecciona un perfil de cliente primero.");
    const stats = window.actualizarUIAbonosCliente();
    const nm = perfilActivo;
    const fd = new Date().toLocaleString();
    const perfilData = dbGlobal.perfiles[perfilActivo];
    
    if(tipo === 'resumen') {
        document.getElementById('exp-res-nombre').innerText = nm;
        document.getElementById('exp-res-prestamo').innerText = `S/ ${perfilData.deudaTotal.toFixed(2)}`;
        document.getElementById('exp-res-abonado').innerText = `S/ ${stats.abonado.toFixed(2)}`;
        document.getElementById('exp-res-saldo').innerText = `S/ ${stats.saldo.toFixed(2)}`;
        document.getElementById('exp-res-fecha').innerText = `Generado: ${fd}`;
        const c = await html2canvas(document.getElementById('plt-resumen'), {scale: 2});
        window.crearD(c, nombreArchivo("RESUMEN_ABONOS", nm));
    } else if (tipo === 'detalle') {
        document.getElementById('exp-det-nombre').innerText = nm;
        document.getElementById('exp-det-prestamo').innerText = `S/ ${perfilData.deudaTotal.toFixed(2)}`;
        document.getElementById('exp-det-saldo').innerText = `S/ ${stats.saldo.toFixed(2)}`;
        const tb = document.getElementById('exp-det-tabla'); tb.innerHTML = "";
        if(perfilData.abonos.length===0) tb.innerHTML=`<tr><td colspan="2" class="p-4 text-center">Sin abonos registrados</td></tr>`;
        else perfilData.abonos.forEach(a => tb.innerHTML+=`<tr><td class="px-4 py-2 border text-gray-700">${a.fecha}</td><td class="px-4 py-2 border text-right font-bold text-gray-900">S/ ${a.monto.toFixed(2)}</td></tr>`);
        const c = await html2canvas(document.getElementById('plt-detalle'), {scale: 2});
        window.crearD(c, nombreArchivo("DETALLE_ABONOS", nm));
    }
};

window.generarReciboPNG = async (id) => {
    const p = dbGlobal.prestamosHistorial.find(x => x.id === id); if(!p) return;
    document.getElementById('rec-cliente').innerText = p.cliente;
    document.getElementById('rec-fecha').innerText = `Emitido: ${p.fecha}`;
    document.getElementById('rec-saldo').innerText = `S/ ${p.s.toFixed(2)}`;
    document.getElementById('rec-nuevo').innerText = `S/ ${p.n.toFixed(2)}`;
    document.getElementById('rec-comision').innerText = `S/ ${p.c.toFixed(2)}`;
    document.getElementById('rec-total').innerText = `S/ ${p.t.toFixed(2)}`;
    const c = await html2canvas(document.getElementById('plt-recibo'), {scale: 2});
    window.crearD(c, nombreArchivo("NUEVO_PRESTAMO", p.cliente));
};

window.crearD = (canvas, fn) => {
    const a = document.createElement('a'); a.href = canvas.toDataURL("image/png"); a.download = fn; a.click();
};
