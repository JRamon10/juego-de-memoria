let pokemons = [];
let cards = [];
let flippedCards = [];
let matchedPairs = 0;
let canFlip = true;
let images = {};
let restartButton;

function preload() {
    fetchPokemons();
}

async function fetchPokemons() {
    let promises = [];
    let usedIds = new Set();
    while (usedIds.size < 10) {
        let id = Math.floor(Math.random() * 151) + 1;
        if (!usedIds.has(id)) {
            usedIds.add(id);
            promises.push(fetch(`https://pokeapi.co/api/v2/pokemon/${id}`).then(res => res.json()));
        }
    }
    let results = await Promise.all(promises);
    pokemons = results.map(p => p.sprites.front_default);
    pokemons.forEach(img => images[img] = loadImage(img));
    setupCards();
}

function setupCards() {
    let canvas = createCanvas(600, 650);
    canvas.position((windowWidth - width) / 2, (windowHeight - height) / 2);
    let tempCards = pokemons.flatMap(img => [{ img, flipped: false, matched: false }, { img, flipped: false, matched: false }]);
    tempCards = shuffle(tempCards);
    cards = tempCards;
    matchedPairs = 0;
    canFlip = true;
    flippedCards = [];
    if (restartButton) restartButton.remove();
    loop();
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function draw() {
    background(50, 150, 200);
    if (cards.length === 0) return;
    drawCards();
    if (matchedPairs === 10) {
        noLoop();
        fill(255);
        textSize(32);
        textAlign(CENTER, CENTER);
        text("¡Ganaste!", width / 2, height - 25);
        showRestartButton();
    }
}

function drawCards() {
    let cols = 5, rows = 4;
    let cardSize = 90;
    let startX = (width - (cols * cardSize)) / 2;
    let startY = (height - 50 - (rows * cardSize)) / 2;
    
    for (let i = 0; i < cards.length; i++) {
        let x = startX + (i % cols) * cardSize;
        let y = startY + Math.floor(i / cols) * cardSize;
        
        fill(cards[i].flipped || cards[i].matched ? 255 : 180);
        ellipse(x + cardSize / 2, y + cardSize / 2, cardSize - 10);
        
        if (cards[i].flipped || cards[i].matched) {
            image(images[cards[i].img], x + 15, y + 15, cardSize - 30, cardSize - 30);
        }
    }
}

function mousePressed() {
    if (!canFlip) return;
    let cols = 5, rows = 4;
    let cardSize = 90;
    let startX = (width - (cols * cardSize)) / 2;
    let startY = (height - 50 - (rows * cardSize)) / 2;
    
    for (let i = 0; i < cards.length; i++) {
        let x = startX + (i % cols) * cardSize;
        let y = startY + Math.floor(i / cols) * cardSize;
        let d = dist(mouseX, mouseY, x + cardSize / 2, y + cardSize / 2);
        
        if (d < cardSize / 2 && !cards[i].flipped && !cards[i].matched) {
            cards[i].flipped = true;
            flippedCards.push(i);
            if (flippedCards.length === 2) {
                canFlip = false;
                checkMatch();
            }
        }
    }
}

function checkMatch() {
    let [first, second] = flippedCards;
    if (cards[first].img === cards[second].img) {
        cards[first].matched = true;
        cards[second].matched = true;
        matchedPairs++;
    } else {
        setTimeout(() => {
            cards[first].flipped = false;
            cards[second].flipped = false;
        }, 1000);
    }
    flippedCards = [];
    setTimeout(() => canFlip = true, 1000);
}

function showRestartButton() {
    restartButton = createButton("Jugar de nuevo");
    restartButton.position((windowWidth - restartButton.width) / 2, (windowHeight / 2) + 100);
    restartButton.mousePressed(setupCards);
}

function windowResized() {
    let canvas = select("canvas");
    canvas.position((windowWidth - width) / 2, (windowHeight - height) / 2);
    if (restartButton) restartButton.position((windowWidth - restartButton.width) / 2, (windowHeight / 2) + 100);
}