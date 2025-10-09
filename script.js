// Seleciona os elementos por id
const elements = {
  promptTitle: document.getElementById('prompt-title'),
  promptContent: document.getElementById('prompt-content'),
  titleWrapper: document.getElementById('title-wrapper'),
  contentWrapper: document.getElementById('content-wrapper'),
  btnOpen: document.getElementById('btn-open'),
  btnCollapse: document.getElementById('btn-collapse'),
  sidebar: document.querySelector('.sidebar'),
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

// Função de inicialização
function init() {
  attachAllEditableHandlers();
  attachSidebarHandlers();
}

// Executa a inicialização
init();