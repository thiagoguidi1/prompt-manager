// Chave para identificar os dados salvos pela aplicação no localStorage
const STORAGE_KEY = 'prompts_storage';

//Estado carregar os prompts salvos e exibir
const state = {
  prompts: [],
  selectedId: null,
}

// Seleciona os elementos por id
const elements = {
  promptTitle: document.getElementById('prompt-title'),
  promptContent: document.getElementById('prompt-content'),
  titleWrapper: document.getElementById('title-wrapper'),
  contentWrapper: document.getElementById('content-wrapper'),
  btnOpen: document.getElementById('btn-open'),
  btnCollapse: document.getElementById('btn-collapse'),
  sidebar: document.querySelector('.sidebar'),
  btnSave: document.getElementById('btn-save'),
};

// Atualiza o estado do wrapper conforme o conteúdo do elemento
function updateEditableWrapperState(element, wrapper) {
  const hasText = element.textContent.trim().length > 0;

  wrapper.classList.toggle('is-empty', !hasText);
}

// Atualiza o estado de todos os elementos editáveis
function updateAllEditableStates() {
  updateEditableWrapperState(elements.promptTitle, elements.titleWrapper);
  updateEditableWrapperState(elements.promptContent, elements.contentWrapper);
}

// Adiciona ouvintes de evento para atualizar wrappers em tempo real
function attachAllEditableHandlers() {
  elements.promptTitle.addEventListener('input', () => {
    updateEditableWrapperState(elements.promptTitle, elements.titleWrapper);
  });
  elements.promptContent.addEventListener('input', () => {
    updateEditableWrapperState(elements.promptContent, elements.contentWrapper);
  });
  updateAllEditableStates();
}


// Função para abrir a sidebar
function openSidebar() {
  elements.sidebar.style.display = 'flex';
  elements.btnOpen.style.display = 'none';
}

function closeSidebar() {
  elements.sidebar.style.display = 'none';
  elements.btnOpen.style.display = 'block';
}

function attachSidebarHandlers() {
  elements.btnOpen.addEventListener('click', openSidebar);
  elements.btnCollapse.addEventListener('click', closeSidebar);
  // Inicialmente, sidebar visível, botão de abrir oculto
  elements.btnOpen.style.display = 'none';
}

function save() {
  //innerHTML para manter formatação
  //textContent para manter apenas o texto
  const title = elements.promptTitle.innerHTML.trim();
  const content = elements.promptContent.innerHTML.trim();
  const hasContent = elements.promptContent.textContent.trim()

  if (!title || !hasContent) {
    alert('Título e conteúdo não podem estar vazios.');
    return;
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
    };
    state.prompts.unshift(newPrompt);
    state.selectedId = newPrompt.id;
  }

  persist();
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.prompts));
    alert('Prompt salvo com sucesso!');
  } catch (error) {
    console.error('Erro ao salvar os prompts:', error);
  }
}

function load() {
  try {
    const storage = localStorage.getItem(STORAGE_KEY);
    state.prompts = storage ? JSON.parse(storage) : [];
    selectedId = null;

    console.log('Prompts carregados:', state.prompts);
  } catch (error) {
    console.error('Erro ao carregar os prompts:', error);
  }
}

//Eventos dos botoes
elements.btnSave.addEventListener('click', save);

// Função de inicialização
function init() {
  load();
  attachAllEditableHandlers();
  attachSidebarHandlers();
}

// Executa a inicialização
init();