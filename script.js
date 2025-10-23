// Chave usada para armazenar/recuperar dados no localStorage
// Mantemos uma chave única para não conflitar com outros dados do navegador
const STORAGE_KEY = "prompts_storage"

// Estado da aplicação em memória
// - prompts: array com os prompts salvos
// - selectedId: id do prompt atualmente selecionado (ou null)
const state = {
	prompts: [],
	selectedId: null,
}

// Cache dos elementos do DOM usados pela aplicação
// Ter esse objeto facilita referenciar elementos e testar sua existência
const elements = {
	promptTitle: document.getElementById("prompt-title"),
	promptContent: document.getElementById("prompt-content"),
	titleWrapper: document.getElementById("title-wrapper"),
	contentWrapper: document.getElementById("content-wrapper"),
	btnOpen: document.getElementById("btn-open"),
	btnCollapse: document.getElementById("btn-collapse"),
	sidebar: document.querySelector(".sidebar"),
	btnSave: document.getElementById("btn-save"),
	list: document.getElementById("prompt-list"),
	search: document.querySelector(".search-input"),
	// O botão "Novo Prompt" no HTML possui a classe .new-prompt-btn
	btnNew: document.querySelector(".new-prompt-btn"),
	btnCopy: document.getElementById("btn-copy"),
}

// Atualiza o estado do wrapper conforme o conteúdo do elemento
// Atualiza a classe do wrapper para mostrar/ocultar o placeholder
// element: o elemento editável (h1 ou div)
// wrapper: o elemento pai que contém o placeholder via CSS (pseudo-elemento)
function updateEditableWrapperState(element, wrapper) {
	const hasText = element.textContent.trim().length > 0

	// Se o elemento estiver vazio, adiciona a classe `is-empty` para exibir placeholder
	wrapper.classList.toggle("is-empty", !hasText)
}

// Atualiza o estado de todos os elementos editáveis
// Atualiza todos os wrappers editáveis (chama a função acima para título e conteúdo)
function updateAllEditableStates() {
	updateEditableWrapperState(elements.promptTitle, elements.titleWrapper)
	updateEditableWrapperState(elements.promptContent, elements.contentWrapper)
}

// Adiciona ouvintes de evento para atualizar wrappers em tempo real
// Anexa listeners para detectar quando o usuário digita nos campos editáveis
// e atualizar o estado dos placeholders em tempo real
function attachAllEditableHandlers() {
	elements.promptTitle.addEventListener("input", () => {
		updateEditableWrapperState(elements.promptTitle, elements.titleWrapper)
	})
	elements.promptContent.addEventListener("input", () => {
		updateEditableWrapperState(elements.promptContent, elements.contentWrapper)
	})

	// Executa uma atualização inicial para ajustar placeholders conforme conteúdo atual
	updateAllEditableStates()
}

// Função para abrir a sidebar
// Mostra a sidebar (usado no modo mobile) e esconde o botão de abrir
function openSidebar() {
	elements.sidebar.style.display = "flex"
	elements.btnOpen.style.display = "none"
}

// Esconde a sidebar e mostra o botão de abrir
function closeSidebar() {
	elements.sidebar.style.display = "none"
	elements.btnOpen.style.display = "block"
}

// Anexa listeners dos controles da sidebar (abrir/fechar)
function attachSidebarHandlers() {
	elements.btnOpen.addEventListener("click", openSidebar)
	elements.btnCollapse.addEventListener("click", closeSidebar)

	// Por padrão a sidebar está visível; escondemos o botão de abrir
	elements.btnOpen.style.display = "none"
}

// Salva o prompt atual: valida dados, cria ou atualiza o prompt e persiste
function save() {
	// Usamos innerHTML para preservar quebras/formatos inseridos pelo usuário
	// e textContent para validação de conteúdo "visível" (sem tags)
	const title = elements.promptTitle.innerHTML.trim()
	const content = elements.promptContent.innerHTML.trim()
	const hasContent = elements.promptContent.textContent.trim()

	// Validação mínima: título e conteúdo não vazios
	if (!title || !hasContent) {
		alert("Título e conteúdo não podem estar vazios.")
		return
	}

	if (state.selectedId) {
		// localizar o prompt e atualizar
		const existingPrompt = state.prompts.find((p) => p.id === state.selectedId)
		if (existingPrompt) {
			existingPrompt.title = title || "Sem título"
			existingPrompt.content = content || "Sem conteudo"
		}
	} else {
		// Cria um novo prompt e adiciona ao início da lista
		const newPrompt = {
			// Gera um ID simples baseado no timestamp
			id: Date.now().toString(36),
			title,
			content,
		}
		state.prompts.unshift(newPrompt)
		state.selectedId = newPrompt.id
	}

	renderList(elements.search.value)
	// Persiste no localStorage e informa o usuário
	persist()
	alert("Prompt salvo com sucesso!")
}

// Persiste o array de prompts no localStorage
function persist() {
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(state.prompts))
	} catch (error) {
		console.error("Erro ao salvar os prompts:", error)
	}
}

// Carrega os prompts do localStorage para o estado em memória
function load() {
	try {
		const storage = localStorage.getItem(STORAGE_KEY)
		state.prompts = storage ? JSON.parse(storage) : []
		state.selectedId = null

		// Log para depuração durante desenvolvimento
		console.log("Prompts carregados:", state.prompts)
	} catch (error) {
		console.error("Erro ao carregar os prompts:", error)
	}
}

// Gera o HTML de um item da lista de prompts
// Cada item carrega atributos data-id (para identificar) e data-action para distinguir
// cliques no próprio item (seleção) ou no botão de remover
function createPromptItem(prompt) {
	return `
            <li class="prompt-item" data-id="${prompt.id}" data-action="select">
                <div class="prompt-item-info">
                  <div class="prompt-item-title">${prompt.title}</div>
                  <div class="prompt-item-description" >
                    ${prompt.content}
                  </div>
                </div>

                <button class="btn-icon" title="Remover" data-action="remove">
                  <img src="assets/remove.svg" alt="Remover" class="icon icon-trash" />
                </button>
            </li>
         `
}

// Renderiza a lista de prompts aplicando um filtro por título
// filterText: string usada para filtrar prompts pelo título
function renderList(filterText = "") {
	const filteredPrompts = state.prompts
		.filter((prompt) =>
			prompt.title.toLowerCase().includes(filterText.toLowerCase().trim())
		)
		.map((p) => createPromptItem(p))
		.join("")

	// Substitui o conteúdo da UL com os itens gerados
	elements.list.innerHTML = filteredPrompts
}

function newPrompt() {
	state.selectedId = null
	elements.promptTitle.innerHTML = ""
	elements.promptContent.innerHTML = ""
	updateAllEditableStates()
	elements.promptTitle.focus()
}

function copySelected() {
	try {
		const content = elements.promptContent
		navigator.clipboard.writeText(content.innerText)
		alert("Conteúdo copiado para a área de transferência!")
	} catch (error) {
		console.error("Erro ao copiar para a área de transferência:", error)
	}
}

//Eventos
if (elements.btnCopy) {
	elements.btnCopy.addEventListener("click", copySelected)
}

if (elements.btnSave) {
	elements.btnSave.addEventListener("click", save)
}

if (elements.btnNew) {
	elements.btnNew.addEventListener("click", newPrompt)
}

// Anexa listeners de eventos principais (salvar e busca) com checagem preventiva
if (elements.search) {
	elements.search.addEventListener("input", function (event) {
		renderList(event.target.value)
	})
}

// Delegação de eventos na lista: trata seleção e remoção de itens
elements.list.addEventListener("click", function (event) {
	// Verifica se o clique foi no botão de remover (ou dentro dele)
	const removeBtn = event.target.closest('button[data-action="remove"]')
	// Identifica o item mais próximo que tenha data-id (o LI)
	const item = event.target.closest("[data-id]")

	// Se não encontrou um item, nada a fazer
	if (!item) return

	const id = item.getAttribute("data-id")
	state.selectedId = id

	if (removeBtn) {
		// Remover prompt do estado e re-renderizar a lista
		state.prompts = state.prompts.filter((p) => p.id !== id)
		renderList(elements.search.value)
		persist()
		alert("Prompt deletado com sucesso!")
		return
	}

	// Se o clique foi para selecionar o item, carrega seu conteúdo nos campos
	if (event.target.closest('[data-action="select"]')) {
		const prompt = state.prompts.find((p) => p.id === id)
		if (prompt) {
			elements.promptTitle.innerHTML = prompt.title
			elements.promptContent.innerHTML = prompt.content
			updateAllEditableStates()
		}
	}
})

// Função de inicialização
// Inicialização da aplicação: carrega dados, renderiza e anexa handlers
function init() {
	load()
	renderList("")
	attachAllEditableHandlers()
	attachSidebarHandlers()
}

// Executa a inicialização
init()
