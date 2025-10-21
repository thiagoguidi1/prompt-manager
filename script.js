// Chave para identificar os dados salvos pela aplicação no localStorage
const STORAGE_KEY = "prompts_storage"

//Estado carregar os prompts salvos e exibir
const state = {
	prompts: [],
	selectedId: null,
}

// Seleciona os elementos por id
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
}

// Atualiza o estado do wrapper conforme o conteúdo do elemento
function updateEditableWrapperState(element, wrapper) {
	const hasText = element.textContent.trim().length > 0

	wrapper.classList.toggle("is-empty", !hasText)
}

// Atualiza o estado de todos os elementos editáveis
function updateAllEditableStates() {
	updateEditableWrapperState(elements.promptTitle, elements.titleWrapper)
	updateEditableWrapperState(elements.promptContent, elements.contentWrapper)
}

// Adiciona ouvintes de evento para atualizar wrappers em tempo real
function attachAllEditableHandlers() {
	elements.promptTitle.addEventListener("input", () => {
		updateEditableWrapperState(elements.promptTitle, elements.titleWrapper)
	})
	elements.promptContent.addEventListener("input", () => {
		updateEditableWrapperState(elements.promptContent, elements.contentWrapper)
	})
	updateAllEditableStates()
}

// Função para abrir a sidebar
function openSidebar() {
	elements.sidebar.style.display = "flex"
	elements.btnOpen.style.display = "none"
}

function closeSidebar() {
	elements.sidebar.style.display = "none"
	elements.btnOpen.style.display = "block"
}

function attachSidebarHandlers() {
	elements.btnOpen.addEventListener("click", openSidebar)
	elements.btnCollapse.addEventListener("click", closeSidebar)
	// Inicialmente, sidebar visível, botão de abrir oculto
	elements.btnOpen.style.display = "none"
}

function save() {
	//innerHTML para manter formatação
	//textContent para manter apenas o texto
	const title = elements.promptTitle.innerHTML.trim()
	const content = elements.promptContent.innerHTML.trim()
	const hasContent = elements.promptContent.textContent.trim()

	if (!title || !hasContent) {
		alert("Título e conteúdo não podem estar vazios.")
		return
	}

	if (state.selectedId) {
		// Edityando um prompt existente
	} else {
		// Criando um novo prompt
		const newPrompt = {
			// Gera um ID simples baseado no timestamp
			id: Date.now().toString(36),
			title,
			content,
		}
		state.prompts.unshift(newPrompt)
		state.selectedId = newPrompt.id
	}

	persist()
	alert("Prompt salvo com sucesso!")
}

function persist() {
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(state.prompts))
	} catch (error) {
		console.error("Erro ao salvar os prompts:", error)
	}
}

function load() {
	try {
		const storage = localStorage.getItem(STORAGE_KEY)
		state.prompts = storage ? JSON.parse(storage) : []
		state.selectedId = null

		console.log("Prompts carregados:", state.prompts)
	} catch (error) {
		console.error("Erro ao carregar os prompts:", error)
	}
}

function createPromptItem(prompt) {
	return `
            <li class="prompt-item" data-id="${prompt.id}" data-action="select">
                <div class="prompt-item-info">
                  <div class="prompt-item-title">${prompt.title}</div>
                  <div class="prompt-item-description">
                    ${prompt.content}
                  </div>
                </div>

                <button class="btn-icon" title="Remover" data-action="remove">
                  <img src="assets/remove.svg" alt="Remover" class="icon icon-trash" />
                </button>
            </li>
         `
}

function renderList(filterText = "") {
	const filteredPrompts = state.prompts
		.filter((prompt) =>
			prompt.title.toLowerCase().includes(filterText.toLowerCase().trim())
		)
		.map((p) => createPromptItem(p))
		.join("")

	elements.list.innerHTML = filteredPrompts
}

//Eventos
// elements.btnSave.addEventListener("click", save)
// elements.search.addEventListener("input", function (event) {
// 	renderList(event.target.value)
// })
if (elements.btnSave) {
	elements.btnSave.addEventListener("click", save)
}

if (elements.search) {
	elements.search.addEventListener("input", function (event) {
		renderList(event.target.value)
	})
}

elements.list.addEventListener("click", function (event) {
	const removeBtn = event.target.closest('button[data-action="remove"]')
	const item = event.target.closest("[data-id]")

	if (!item) return

	const id = item.getAttribute("data-id")

	if (removeBtn) {
		// Remover prompt
		state.prompts = state.prompts.filter((p) => p.id !== id)
		renderList(elements.search.value)
		persist()
		alert("Prompt deletado com sucesso!")
		return
	}

	if (event.target.closest('[data-action="select"]')) {
		// Selecionar prompt
		const prompt = state.prompts.find((p) => p.id === id)
		if (prompt) {
			elements.promptTitle.innerHTML = prompt.title
			elements.promptContent.innerHTML = prompt.content
			updateAllEditableStates()
		}
	}
})

// Função de inicialização
function init() {
	load()
	renderList("")
	attachAllEditableHandlers()
	attachSidebarHandlers()
}

// Executa a inicialização
init()
