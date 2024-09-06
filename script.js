
const apiDomain = "https://betterbluesky.nemtudo.me"; //production
// const apiDomain = "http://localhost:3692"; //dev
let trendsUpdatesCounts = 0;

const sessionID = `${Date.now()}_${randomString(10)}` //gera um ID para fins de uso no backend
console.log(`[BetterBluesky] SessionID: ${sessionID}`)

let betterblueskystorage = {};

function loadBetterbluesky() {
    if (!localStorage.getItem("BETTERBLUESKY")) {
        localStorage.setItem("BETTERBLUESKY", JSON.stringify({ loaded: true }));
        alert("Seja muito bem-vindo ao BetterBluesky! Ajude mais pessoas a conhecerem o nosso trabalho curtindo e repostando o post de onde você nos conheceu! Siga @nemtudo.me para atualizações <3")
    }

    if (localStorage.getItem("BETTERBLUESKY") === '{loaded: true}') localStorage.setItem("BETTERBLUESKY", JSON.stringify({ loaded: true })); //convert old version to new

    const storage = JSON.parse(localStorage.getItem("BETTERBLUESKY"));
    betterblueskystorage = storage;

}

function setFavicon() {
    document.querySelectorAll('link[rel*="icon"]').forEach(element => {
        element.href = "https://nemtudo.me/cdn/betterblueskylogo.png";
    })
}

async function getTrends(count) {
    const trends = await fetch(`${apiDomain}/api/trends?updateCount=${count}&sessionID=${sessionID}`).then(r => r.json());
    return trends.data;
}

async function updateTrends(replaceAll = false) {
    console.log("[BetterBluesky] Trends Atualizado", trendsUpdatesCounts)
    const trends = await getTrends(trendsUpdatesCounts);
    trendsUpdatesCounts++;

    let html = "";

    for (const trend in trends) {
        html += `<li><a class="trend_item" trend_data='{"text": "${encodeURIComponent(trends[trend].text)}", "position": ${trend}, "count": ${trends[trend].count}}' href='${`https://bsky.app/search?q=${encodeURIComponent(trends[trend].text)}`}'><span class="counter">${Number(trend) + 1}</span>
                <div class="content"><span class="trend">${escapeHTML(trends[trend].text)}</span>${`${trends[trend].message ? `<span class="trendmessage">${escapeHTML(trends[trend].message)}</span>` : (trends[trend].count ? `<span class="trendcount">${formatNumber(trends[trend].count)} posts</span>` : "")}`}</div></a>
            </li>`
    }

    html += `<span class="apoie">Gostou? Apoie o projeto! <a id="apoieurl" target="_blank" href='https://livepix.gg/nemtudo'>livepix.gg/nemtudo</a></span>`

    if (document.querySelector("#trendsarea")) replaceAll ? document.querySelector("#trendsarea").innerHTML = html : document.querySelector("#trendsarea").innerHTML += html;
}

setInterval(() => {
    updateTrends(true);
}, 1000 * 30)

setInterval(() => {
    replaceBetterBlueSkyVideos()
}, 1000)

//eventos

window.addEventListener('load', () => setTimeout(() => { loadBetterbluesky(); setFavicon() }, 3000));
window.addEventListener('load', setFavicon);
window.addEventListener('load', () => setTimeout(() => { addTrendsHTML() }, 2000));

//atualizador de eventos
document.addEventListener('click', () => {
    addTrendsHTML();
    addVideoButton();
    setTimeout(() => {
        addLikedButton();
    }, 1000)
})

//eventos especificos 
document.addEventListener('click', (event) => {
    if (event.target.id === "betterblueskyvideobutton") {
        const url = prompt('[BetterBluesky] Insira o link do vídeo. (Deve terminar em .mp4)');
        if (!url) return;
        sendStats("createpost.videobutton.click", `{"url": "${url}"}`)
        document.querySelector('div[contenteditable="true"]').innerHTML += `&lt;BetterBlueSky_video:${escapeHTML(url)}&gt;`
    }

    if (event.target.classList.contains("betterbluesky_setting")) {
        updateSetting(event.target.getAttribute("betterbluesky_update", e.target.checked))
    }

    if (event.target.id === "userlikedbutton") {
        sendStats("profile.likedbutton.click", JSON.stringify({ user: getViewingProfile() }))
        window.open(`https://likedbetterbluesky.nemtudo.me/?defaultHandle=${encodeURIComponent(getViewingProfile())}`)
    }

    //stats

    if (event.target.classList.contains("trend_item")) {
        sendStats("trends.trend.click", event.target.getAttribute("trend_data"))
    }
    if (event.target.id === "apoieurl") {
        sendStats("trends.apoie.click", "{}")
    }
    if (event.target.id === "devcredits") {
        sendStats("trends.dev.click", "{}")
    }
})

//funções gerais

function addLikedButton() {
    document.querySelectorAll('div[style="flex-direction: row; gap: 4px; align-items: center;"]').forEach(element => {
        if (element) {
            if (!element.querySelector('#userlikedbutton')) {
                element.innerHTML += `<button id="userlikedbutton">❤</button>`
            }
        }
    })
}

function sendStats(event, data) {
    fetch(`${apiDomain}/api/stats?action=${event}&data=${encodeURIComponent(data)}&sessionID=${sessionID}`, { //"action" because "event" cause a bug
        method: "POST"
    })
}


function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1).replace('.0', '') + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1).replace('.0', '') + ' mil';
    } else {
        return num.toString();
    }
}

function escapeHTML(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function addTrendsHTML() {
    if (document.querySelector("#trendsarea")) return;

    const element = document.querySelector("div[class='css-175oi2r r-qklmqi r-5kkj8d r-le4sbl r-1444osr']") || document.querySelector('div[class="css-175oi2r r-196lrry r-pm9dpa r-1rnoaur r-1xcajam r-1ipicw7"]')

    if (element) element.innerHTML = `<div class="trends">
    <h2 id="trendingsname">Trending Topics <span class='beta'>BETA</span></h2>
    <div class='description'>
    <span>Fornecido por <a style="color: #FF9325;" target="_blank" role="link" href='https://nemtudo.me/betterbluesky'>BetterBluesky</a>.<br> Desenvolvido por <a id="devcredits" target="_blank" href='https://bsky.app/profile/nemtudo.me'>@nemtudo.me</a>. Siga!</span>
    </div>
    <ul id="trendsarea">
    <span class="loadingtrends">Carregando...</span>
    </ul>
</div>` + element.innerHTML;
    updateTrends(true);
}

function addVideoButton() {
    if ((!document.querySelector("#betterblueskyvideobutton")) && (document.querySelector('div[style="flex-direction: row; padding: 8px; background-color: rgb(0, 0, 0); border-top-width: 1px; border-color: rgba(0, 0, 0, 0);"]'))) document.querySelector('div[style="flex-direction: row; padding: 8px; background-color: rgb(0, 0, 0); border-top-width: 1px; border-color: rgba(0, 0, 0, 0);"]').innerHTML += `<button id='betterblueskyvideobutton'>Vídeo</button>` //+ document.querySelector("div[class='css-175oi2r r-1awozwy r-5kkj8d r-18u37iz r-cnw61z r-16lhzmz r-i023vh']").innerHTML;
}

function replaceBetterBlueSkyVideos() {
    // Seleciona todo o conteúdo da página
    const pageContents = document.querySelectorAll('div[data-testid="contentHider-post"],div[class="css-146c3p1 r-1xnzce8"]');

    // Regex para capturar o link no formato <betterblueskyvideo:link>
    const regex = /&lt;BetterBlueSky_video:(https?:\/\/[^\s>]+)&gt;/g;

    pageContents.forEach(element => {
        // Substitui pelo elemento de vídeo
        if (!element.innerHTML.match(regex)) return;
        const html = element.innerHTML.replace(regex, function (match, url) {
            if (!validURL(url)) return;
            const videoElement = `<video class="betterblueskyvideo" controls>
                    <source src="${escapeHTML(url)}" type="video/mp4">
                    Seu navegador não suporta tags de vídeos.
                </video>`;
            return videoElement;
        });

        // Atualiza o conteúdo da página
        element.innerHTML = html;
    })

}



(function () { //easter egg trem de tópicos
    let typed = ""; // String para armazenar as teclas pressionadas
    const target = "tremdetopicos"; // A sequência que você quer detectar
    const maxLength = target.length; // Tamanho da sequência alvo

    document.addEventListener("keydown", function (event) {
        // Adiciona a tecla pressionada à string
        typed += event.key.toLowerCase(); // Converte para minúscula para comparação

        // Mantém a string com no máximo o tamanho da sequência alvo
        if (typed.length > maxLength) {
            typed = typed.slice(-maxLength);
        }

        // Verifica se a sequência alvo foi digitada
        if (typed === target) {
            if (document.querySelector("#trendingsname")) document.querySelector("#trendingsname").innerHTML = "Trem de Tópicos <span class='beta'>BETA</span>"
            sendStats("context.easteregg.activated", `{"typed": "${typed}"}`)
        }
    });
})();


function validURL(str) {
    var pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
        '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
    return !!pattern.test(str);
}

function randomString(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
        counter += 1;
    }
    return result;
}

function updateSetting(setting, value) {
    const storage = JSON.parse(localStorage.getItem("BETTERBLUESKY"));

    storage[setting] = value;

    localStorage.setItem("BETTERBLUESKY", JSON.stringify(storage));

    betterblueskystorage = storage;
}

function getViewingProfile() {
    const url = window.location.href;
    const parts = url.split('/').filter(part => part); // Remove strings vazias
    return parts[parts.length - 1]; // Retorna o último segmento
}