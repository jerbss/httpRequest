export async function loadEndpoints() {
  const resp = await fetch('http://localhost:3000/')  
  const html = await resp.text()
  const doc = new DOMParser().parseFromString(html, 'text/html')
  const links = Array.from(doc.querySelectorAll('a[href]'))
    .map(a => a.getAttribute('href'))
    .filter(h => h && !h.startsWith('http'))
    .filter((v,i,a) => a.indexOf(v) === i)

  const ul = document.getElementById('endpoints')
  links.forEach(ep => {
    const li = document.createElement('li')
    const btn = document.createElement('button')
    btn.textContent = ep
    btn.addEventListener('click', () => fetchAndShow(ep))
    li.appendChild(btn)
    ul.appendChild(li)
  })
}

export async function fetchAndShow(endpoint) {
  const out = document.getElementById('output')
  out.textContent = 'Carregando...'
  try {
    const resp = await fetch(`http://localhost:3000/${endpoint}`)
    const data = await resp.json()
    out.textContent = JSON.stringify(data, null, 2)
  } catch (e) {
    out.textContent = 'Erro: ' + e.message
  }
}

// carrega toda a lista de empresas
async function fetchEmpresas() {
  const resp = await fetch('http://localhost:3000/empresas')
  return resp.json()
}

// 1. Agrupar por regimeTributario
async function groupByRegime() {
  const empresas = await fetchEmpresas()
  const grouped = empresas.reduce((acc, emp) => {
    const key = emp.regimeTributario || 'Não informado'
    acc[key] = acc[key] || []
    acc[key].push(emp)
    return acc
  }, {})
  showOutput(grouped)
}

// 2. Empresas com CPF
async function filterWithCpf() {
  const empresas = await fetchEmpresas()
  const filtered = empresas.filter(e => e.cpfCnpj)
  showOutput(filtered)
}

// 3. Empresas sem CPF
async function filterNoCpf() {
  const empresas = await fetchEmpresas()
  const filtered = empresas.filter(e => !e.cpfCnpj)
  showOutput(filtered)
}

// 4. Ativas / Inativas
async function filterStatus(status) {
  const empresas = await fetchEmpresas()
  const filtered = empresas.filter(e => e.status === status)
  showOutput(filtered)
}

// 5. Contar ativas por mês
async function countActiveByMonth() {
  const empresas = await fetchEmpresas()
  const active = empresas.filter(e => e.status === 'ativa')
  const counts = active.reduce((acc, e) => {
    const dt = new Date(e.dataRegistro)
    // format "mmm/yyyy"
    const key = dt.toLocaleString('pt-BR', { month: 'short', year: 'numeric' })
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {})
  showOutput(counts)
}

// 6. Empresas por sócio
async function groupBySocio() {
  const nome = document.getElementById('input-socio').value.trim()
  if (!nome) return showOutput({ error: 'Digite o nome do sócio' })
  const empresas = await fetchEmpresas()
  const list = empresas
    .filter(e => Array.isArray(e.socios) && e.socios.includes(nome))
    .map(e => e.id)
  showOutput({ socio: nome, empresas: list })
}

// 7. Agrupar por ramoAtividade
async function groupByRamo() {
  const empresas = await fetchEmpresas()
  const grouped = empresas.reduce((acc, e) => {
    const key = e.ramoAtividade || 'Não informado'
    acc[key] = acc[key] || []
    acc[key].push(e)
    return acc
  }, {})
  showOutput(grouped)
}

// exibidor genérico
function showOutput(data) {
  document.getElementById('output').textContent =
    JSON.stringify(data, null, 2)
}

// liga os botões
window.addEventListener('DOMContentLoaded', () => {
  loadEndpoints()
  document.getElementById('btn-group-regime')
    .addEventListener('click', groupByRegime)
  document.getElementById('btn-with-cpf')
    .addEventListener('click', filterWithCpf)
  document.getElementById('btn-no-cpf')
    .addEventListener('click', filterNoCpf)
  document.getElementById('btn-ativas')
    .addEventListener('click', () => filterStatus('ativa'))
  document.getElementById('btn-inativas')
    .addEventListener('click', () => filterStatus('inativa'))
  document.getElementById('btn-count-month')
    .addEventListener('click', countActiveByMonth)
  document.getElementById('btn-by-socio')
    .addEventListener('click', groupBySocio)
  document.getElementById('btn-group-ramo')
    .addEventListener('click', groupByRamo)
})