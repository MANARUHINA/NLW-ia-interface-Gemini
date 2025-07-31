//começamos pegando as informações contidas no HTML, cada getElementById('...') esta pegando, linha 29,30 e assim por diante
const apiKeyInput = document.getElementById('apiKey')
const gameSelect = document.getElementById('gameSelect')
const questionInput = document.getElementById('questionInput')
const askButton = document.getElementById('askButton')
const aiResponse = document.getElementById('aiResponse')
const form = document.getElementById('form')


//Markdown é uma linguagem de marcação simples (usa **negrito**, # título, - lista, etc.)
//essa função e a que esta convertendo o Markdown que o gemini manda para HTML
//a magica acontece aqui O showdown.Converter() transforma isso em HTML real
//ele esta convertendo o texto de "**Oi!**" para "<strong>Oi!</strong>"

const markdownToHTML = (text) => {
    const converter = new showdown.Converter()
    return converter.makeHtml(text)
}
//aqui são as customizações de cada "pergunta"
const perguntaLeagueofLegends = (question) => `  
    ## Especialidade
    Você é um especialista em League of Legends, com foco em meta competitivo, builds, rotas e itemizações.
   
    ## Tarefa
    Você deve responder as perguntas do usuário com base no seu conhecimento do jogo, estratégias, build e dicas

    ## Regras
    - Se você não sabe a resposta, responda com 'Não sei' e não tente inventar uma resposta.
    - Se a pergunta não está relacionada ao jogo league of legends, responda com 'Essa pergunta não está relacionada ao jogo selecionado'
    - Verifique se existe algum nome de campeão ou item similar antes de dizer que nãoi existe, se encontrar algum pergunte "o nome esta correto? localizei esse nome" e preencha com o nome localizado
    - Considere a data atual ${new Date().toLocaleDateString()}
    - Faça pesquisas atualizadas sobre o patch atual, baseado na data atual, para dar uma resposta coerente.
    - Nunca responda itens que vc não tenha certeza de que existe no patch atual.

    ## Resposta
    - Economize na resposta, seja direto e responda no máximo 800 caracteres
    - Responda em markdown
    - Não precisa fazer nenhuma saudação ou despedida
    - deve ser respondida na mesma lingua da pergunta

    ## Exemplo de resposta
    pergunta do usuário: Melhor build rengar jungle
    resposta: A build mais atual para o seu campeão é: \n\n **Itens:**\n\n coloque os itens aqui.\n\n**Runas:**\n\nexemplo de runas\n\n **Dicas de comportamento**: \n\n como deve se comportar na rota \n\n **dificuldade no jogo:\n\n **nivel de dificuldade** \n\n ordem de evolução de habilidades: \n\n**LV 1 - up o "Q"\n\n LV 2 - up o "W" ** \n\n

    ---
    Aqui está a pergunta do usuário: ${question}
  `
const perguntaValorant = (question) => `  
    ## Especialidade
    Você é um especialista em Valorant, focado em agentes, táticas, armas e estratégias competitivas.

    ## Tarefa
    Responda a perguntas sobre agentes, mapas, economia e estratégias do meta atual, sempre com base no patch mais recente.

    ## Regras
    - Se não souber a resposta, diga "Não sei"
    - Se a pergunta não for sobre Valorant, diga "Essa pergunta não está relacionada ao jogo selecionado"
    - Data atual: ${new Date().toLocaleDateString()}
    -Use dados do patch atual, sem citar conteúdos desatualizados.

    ## Resposta
    - Máximo de 800 caracteres
    - Markdown
    - Sem saudação ou despedida

    ## Exemplo
    Pergunta: Melhor agente para Pearl  
    Resposta: \n\n**Agente:** Viper. \n\n**Tática:** \n\ncontrole de zona com parede e smoke. Alta efetividade na defesa.\n\n

    ---
    Aqui está a pergunta do usuário: ${question}
    `

const perguntaDota2 = (question) => `  
    ## Especialidade
    Você é um especialista em Dota 2, com foco em meta competitivo, builds, rotas e itemizações.

    ## Tarefa
    Responda com base no patch atual, indicando builds, talentos, estratégias e heróis meta.

    ## Regras
    - Se não souber, diga "Não sei"
    - Se não for sobre Dota 2, diga "Essa pergunta não está relacionada ao jogo selecionado"
    - Data: ${new Date().toLocaleDateString()}
    - Nunca use dados ultrapassados

    ## Resposta
    - 800 caracteres no máximo
    - Use markdown
    - Não cumprimente

    ## Exemplo
    Pergunta: Melhor build para Storm Spirit  
    Resposta: **Itens:** Bloodstone, BKB, Shiva. **Talentos:** +20 Dano, +0.4s Vortex.

    ---
    Aqui está a pergunta do usuário: ${question}
    `
const perguntaGeral = (question, game) => `
## Contexto
O usuário está fazendo uma pergunta sobre o jogo "${game}", que não está listado entre os suportados diretamente.

## Tarefa
Tente responder a pergunta com base no conhecimento geral sobre o jogo informado, mesmo que ele seja pouco conhecido. Se o jogo for completamente desconhecido ou não existir, diga "Esse jogo não está em nossa base de dados sinto muito".

## Regras
- Nunca invente mecânicas ou personagens inexistentes
- Se o jogo não existir informe apenas "esse jogo não foi localizado pode verificar o nome?"
- Se não tiver certeza, diga "Não sei com certeza, mas baseado em jogos similares..."
- Seja breve (máx. 800 caracteres)
- Use markdown na resposta
- Responda na mesma língua da pergunta
- Não descreva sobre o jogo ao menos que a pergunta seja relacionada a isso.

## Exemplo de estrutura
**Jogo:** nome do jogo  
**Resposta:** descrição clara e curta  
**Dica extra:** (se aplicável)

---
Aqui está a pergunta do usuário: ${question}
`
    const perguntarAi = async (question, game, apiKey) => {
    //estamos escolhendo qual jogo o usuario selecionou
 let prompt = ''

const gameLower = game.toLowerCase().trim()

if (gameLower === 'league of legends') {
  prompt = perguntaLeagueofLegends(question)
} else if (gameLower === 'valorant') {
  prompt = perguntaValorant(question)
} else if (gameLower === 'dota2' || gameLower === 'dota 2') {
  prompt = perguntaDota2(question)
} else {
  prompt = perguntaGeral(question, game)
}
//ele vai usar o modelo do gemini-2.5 flash
const model = "gemini-2.5-flash"
const baseURL = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`

const contents = [{
    role: "user",
    parts: [{
        text: prompt
    }]
}]

const tools = [{
    google_search: {}
    //essa parte e para a ia poder pesquisar no google
}]

//chamada API
const response = await fetch(baseURL, {
    method: 'post',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        contents,
        tools
    })
})
const data = await response.json()
return data.candidates[0].content.parts[0].text
}

//pegando as informações do questionario ela e async porque o perguntarAi precisa 
const enviarFormulario = async (event) => {

    event.preventDefault()
    //pegando as informações da key
    const apiKey = apiKeyInput.value
     //pegando as informações da opçao de qual e o jogo
    const game = gameSelect.value
    //pegando a informação de qual e o jogo
    const question = questionInput.value

  
  //serve para identificar se tem algum campo em branco, se tiver ele retorna o alerta pedindo para preencher
    if (apiKey === '' || game === '' || question === '') {
    alert('Por favor, preencha todos os campos');
    return
    }

    //só funciona se estiver preenchido para evitar muitos clicks
    askButton.disabled = true
    askButton.textContent = 'Perguntando...'
    askButton.classList.add('loading')

    // voltar para o inicio
    try {
    //perguntar para a ia
    const text = await perguntarAi(question, game, apiKey)
    //esta recebendo o texto e convertendo com a ajuda do markdown para ficar de uma forma mais legivel e bonita ^-^
    aiResponse.querySelector('.response-content').innerHTML = markdownToHTML (text)
     // Detecta links simples na resposta da IA, (regex) vai buscar trechos no texto que são links.
    const linkRegex = /(https?:\/\/[^\s]+)/g
    // https? quer dizer: "procure ‘http’ ou ‘https’". :\/\/ é para “://” fixo depois do http.
    // [^\s]+ significa: "pegue tudo que não for espaço até o próximo espaço" (ou seja, o link inteiro até o próximo espaço).
    //O g no final é pra buscar todos os links no texto, não só o primeiro
    const links = text.match(linkRegex)
    if (links) {
    console.log("Links encontrados:", links)
 
    }
    //quando ele achar a resposta ele vai perder o hidden que ele tem de class
    aiResponse.classList.remove('hidden')

    //se der erro
    } catch (error) {
    console.log('Erro: ', error)
    } finally {
        askButton.disabled = false
        askButton.textContent = 'Perguntar'
        askButton.classList.remove('loading')
    }
}

//final enviar as informações
form.addEventListener('submit', enviarFormulario)