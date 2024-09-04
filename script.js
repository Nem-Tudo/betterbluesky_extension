
const apiDomain = "https://betterbluesky.nemtudo.me";
let trendsUpdatesCounts = 0;

function setDarkTheme() {
    const storage = JSON.parse(localStorage.getItem("BSKY_STORAGE"));
    if (!storage) return;
    if (storage.darkTheme == "dark") return;
    storage.darkTheme = "dark";
    localStorage.setItem("BSKY_STORAGE", JSON.stringify(storage));
    alert("Seja muito bem-vindo ao BetterBluesky! Ajude mais pessoas a conhecerem o nosso trabalho curtindo e repostando o post de onde você nos conheceu!")
    location.reload()
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
                <div class="content"><span class="trend">${escapeHTML(trends[trend].text)}</span><span>${formatNumber(trends[trend].count)} posts</span></div></a>
            </li>`
    }

    html+= `<span class="apoie">Apoie o projeto <a target="_blank" href='https://livepix.gg/nemtudo'>livepix.gg/nemtudo</a></span>`

    replaceAll ? document.querySelector("#trendsarea").innerHTML = html : document.querySelector("#trendsarea").innerHTML += html;
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

window.addEventListener('load', () => setTimeout(() => { setDarkTheme(); setFavicon() }, 3000));
window.addEventListener('load', setFavicon);
window.addEventListener('load', () => setTimeout(() => {addTrendsHTML()}, 2000));
document.addEventListener('click', () => {
    addTrendsHTML();
})

function addTrendsHTML() {
    if (document.querySelector("#trendsarea")) return;

    const element = document.querySelector("div[class='css-175oi2r r-qklmqi r-5kkj8d r-le4sbl r-1444osr']") || document.querySelector('div[class="css-175oi2r r-196lrry r-pm9dpa r-1rnoaur r-1xcajam r-1ipicw7"]') 

    element.innerHTML = `<div class="trends">
    <h2>Trendings Topics <span class='beta'>BETA</span></h2>
    <div class='description'>
    <span>Fornecido por <a style="color: #FF9325;" target="_blank" role="link" href='https://nemtudo.me/betterbluesky'>BetterBluesky</a>.<br> Desenvolvido por <a target="_blank" href='https://bsky.app/profile/nemtudo.me'>@nemtudo.me</a></span>
    </div>
    <ul id="trendsarea">
    <span class="loadingtrends">Carregando...</span>
    </ul>
</div>` + element.innerHTML;
    updateTrends(true);
}


