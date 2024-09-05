
const apiDomain = "https://betterbluesky.nemtudo.me";
let trendsUpdatesCounts = 0;

function loadBetterbluesky() {
    const storage = JSON.parse(localStorage.getItem("BETTERBLUESKY"));
    if (!storage) {
        localStorage.setItem("BETTERBLUESKY", "{loaded: true}");
        alert("Seja muito bem-vindo ao BetterBluesky! Ajude mais pessoas a conhecerem o nosso trabalho curtindo e repostando o post de onde você nos conheceu! Siga @nemtudo.me para atualizações <3")
    }
}

function setFavicon() {
    document.querySelectorAll('link[rel*="icon"]').forEach(element => {
        element.href = "https://nemtudo.me/cdn/betterblueskylogo.png";
    })
}

async function getTrends(count) {
    const trends = await fetch(`${apiDomain}/api/trends?updateCount=${count}`).then(r => r.json());
    return trends.data;
}

async function updateTrends(replaceAll = false) {
    console.log("ATUALIZANDO TRENDS", trendsUpdatesCounts)
    const trends = await getTrends(trendsUpdatesCounts);
    trendsUpdatesCounts++;

    let html = "";

    for (const trend in trends) {
        html += `<li><a href='${`https://bsky.app/search?q=${encodeURIComponent(trends[trend].text)}`}'><span class="counter">${Number(trend) + 1}</span>
                <div class="content"><span class="trend">${escapeHTML(trends[trend].text)}</span>${trends[trend].count ? `<span>${formatNumber(trends[trend].count)} posts</span>` : ""}</div></a>
            </li>`
    }

    html += `<span class="apoie">Gostou? Apoie o projeto! <a target="_blank" href='https://livepix.gg/nemtudo'>livepix.gg/nemtudo</a></span>`

    if (document.querySelector("#trendsarea").innerHTML) replaceAll ? document.querySelector("#trendsarea").innerHTML = html : document.querySelector("#trendsarea").innerHTML += html;
}

setInterval(() => {
    updateTrends(true);
}, 1000 * 30)

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

window.addEventListener('load', () => setTimeout(() => { loadBetterbluesky(); setFavicon() }, 3000));
window.addEventListener('load', setFavicon);
window.addEventListener('load', () => {
    setInterval(() => {
        replaceBetterBlueSkyVideos()
    }, 1000)
});
window.addEventListener('load', () => setTimeout(() => { addTrendsHTML() }, 2000));
document.addEventListener('click', () => {
    addTrendsHTML();
    addVideoButton();
})

document.addEventListener('click', (event) => {
    if (event.target.id === "betterblueskyvideobutton") document.querySelector('div[contenteditable="true"]').innerHTML += `&lt;BetterBlueSky_video:${escapeHTML(prompt('Insira o link do vídeo. (Deve terminar em .mp4)'))}&gt;`
})

function addTrendsHTML() {
    if (document.querySelector("#trendsarea")) return;

    const element = document.querySelector("div[class='css-175oi2r r-qklmqi r-5kkj8d r-le4sbl r-1444osr']") || document.querySelector('div[class="css-175oi2r r-196lrry r-pm9dpa r-1rnoaur r-1xcajam r-1ipicw7"]')

    if (element) element.innerHTML = `<div class="trends">
    <h2 id="trendingsname">Trending Topics <span class='beta'>BETA</span></h2>
    <div class='description'>
    <span>Fornecido por <a style="color: #FF9325;" target="_blank" role="link" href='https://nemtudo.me/betterbluesky'>BetterBluesky</a>.<br> Desenvolvido por <a target="_blank" href='https://bsky.app/profile/nemtudo.me'>@nemtudo.me</a>. Siga!</span>
    </div>
    <ul id="trendsarea">
    <span class="loadingtrends">Carregando...</span>
    </ul>
</div>` + element.innerHTML;
    updateTrends(true);
}

function addVideoButton() {
    if (!document.querySelector("#betterblueskyvideobutton")) document.querySelector('div[style="flex-direction: row; padding: 8px; background-color: rgb(0, 0, 0); border-top-width: 1px; border-color: rgba(0, 0, 0, 0);"]').innerHTML += `<button id='betterblueskyvideobutton'>Vídeo</button>` //+ document.querySelector("div[class='css-175oi2r r-1awozwy r-5kkj8d r-18u37iz r-cnw61z r-16lhzmz r-i023vh']").innerHTML;
}

function replaceBetterBlueSkyVideos() {
    // Seleciona todo o conteúdo da página
    const pageContents = document.querySelectorAll('div[data-testid="contentHider-post"],div[class="css-175oi2r r-1hfyk0a r-1qfoi16 r-1mi0q7o"]');

    // Regex para capturar o link no formato <betterblueskyvideo:link>
    const regex = /&lt;BetterBlueSky_video:(https?:\/\/[^\s>]+)&gt;/g;

    pageContents.forEach(element => {
        // Substitui pelo elemento de vídeo
        if (!element.innerHTML.match(regex)) return;
        element.innerHTML.replace(regex, function (match, url) {
            if (!validURL(url)) return;
            const updatedContent = `<video class="betterblueskyvideo" controls>
                    <source src="${escapeHTML(url)}" type="video/mp4">
                    Your browser does not support the video tag.
                </video>`;
            console.log(updatedContent, "updatedContent")
            element.innerHTML = updatedContent;
        });

        // Atualiza o conteúdo da página
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