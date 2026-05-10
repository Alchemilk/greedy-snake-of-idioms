const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const overlay = document.getElementById("overlay");
const startBtn = document.getElementById("startBtn");
const scoreEl = document.getElementById("score");
const levelEl = document.getElementById("level");
const idiomDisplay = document.getElementById("idiomDisplay");
const stageInfo = document.getElementById("stageInfo");

const GRID = 20;
const COLS = 20;
const ROWS = 20;
canvas.width = COLS * GRID;
canvas.height = ROWS * GRID;

const IDIOMS = [
    ["一","心","一","意"],
    ["三","心","二","意"],
    ["四","面","八","方"],
    ["五","颜","六","色"],
    ["七","上","八","下"],
    ["九","牛","一","毛"],
    ["十","全","十","美"],
    ["百","发","百","中"],
    ["千","山","万","水"],
    ["万","紫","千","红"],
    ["春","暖","花","开"],
    ["风","和","日","丽"],
    ["山","清","水","秀"],
    ["鸟","语","花","香"],
    ["龙","飞","凤","舞"],
    ["虎","头","蛇","尾"],
    ["画","蛇","添","足"],
    ["守","株","待","兔"],
    ["亡","羊","补","牢"],
    ["刻","舟","求","剑"],
    ["叶","公","好","龙"],
    ["掩","耳","盗","铃"],
    ["对","牛","弹","琴"],
    ["井","底","之","蛙"],
    ["狐","假","虎","威"],
    ["鹤","立","鸡","群"],
    ["鱼","目","混","珠"],
    ["鸡","犬","不","宁"],
    ["马","到","成","功"],
    ["牛","鬼","蛇","神"],
    ["风","调","雨","顺"],
    ["国","泰","民","安"],
    ["欣","欣","向","荣"],
    ["蒸","蒸","日","上"],
    ["心","想","事","成"],
    ["花","好","月","圆"],
    ["金","玉","满","堂"],
    ["吉","祥","如","意"],
    ["开","天","辟","地"],
    ["精","卫","填","海"],
    ["愚","公","移","山"],
    ["卧","薪","尝","胆"],
    ["破","釜","沉","舟"],
    ["闻","鸡","起","舞"],
    ["悬","梁","刺","股"],
    ["程","门","立","雪"],
    ["铁","杵","成","针"],
    ["望","梅","止","渴"],
    ["杯","弓","蛇","影"],
    ["草","木","皆","兵"],
    ["完","璧","归","赵"],
    ["负","荆","请","罪"],
    ["纸","上","谈","兵"],
    ["暗","度","陈","仓"],
    ["四","面","楚","歌"],
    ["草","船","借","箭"],
    ["三","顾","茅","庐"],
    ["势","如","破","竹"],
    ["半","途","而","废"],
    ["持","之","以","恒"],
    ["勇","往","直","前"],
    ["百","折","不","挠"],
    ["自","强","不","息"],
    ["厚","德","载","物"],
    ["见","义","勇","为"],
    ["舍","己","为","人"],
    ["助","人","为","乐"],
    ["大","义","凛","然"],
    ["临","危","不","惧"],
    ["力","挽","狂","澜"],
];

const COMMON_CHARS = "的一是了不在有个人这中大为上以到说时要就出会也生于子可下年自作那她着他时候着对里小去然没很什么得又都后来看没天去过起发只如回事样能地";

let snake, direction, nextDirection, foods, score, level;
let idiomIndex, charIndex, usedIdioms;
let gameLoop, running;
let showingStageResult;

function initGame() {
    snake = [];
    const startX = Math.floor(COLS / 2);
    const startY = Math.floor(ROWS / 2);
    for (let i = 0; i < 3; i++) {
        snake.push({ x: startX - i, y: startY });
    }
    direction = { x: 1, y: 0 };
    nextDirection = { x: 1, y: 0 };
    score = 0;
    level = 1;
    usedIdioms = [];
    showingStageResult = false;
    pickNewIdiom();
    updateUI();
}

function pickNewIdiom() {
    let available = IDIOMS.filter((_, i) => !usedIdioms.includes(i));
    if (available.length === 0) {
        usedIdioms = [];
        available = IDIOMS;
    }
    const randIdx = Math.floor(Math.random() * available.length);
    idiomIndex = IDIOMS.indexOf(available[randIdx]);
    usedIdioms.push(idiomIndex);
    charIndex = 0;
    foods = [];
    spawnFirstChar();
    updateUI();
}

function spawnFirstChar() {
    foods = [];
    const idiom = IDIOMS[idiomIndex];
    const pos = getRandomEmptyCell();
    foods.push({
        x: pos.x,
        y: pos.y,
        char: idiom[0],
        isCorrect: true
    });
}

function spawnThreeChars() {
    foods = [];
    const idiom = IDIOMS[idiomIndex];
    const correctChar = idiom[charIndex];
    const positions = [];

    for (let i = 0; i < 3; i++) {
        let pos;
        let attempts = 0;
        do {
            pos = getRandomEmptyCell();
            attempts++;
        } while (attempts < 500 && (
            isOccupiedByFood(pos.x, pos.y, positions) ||
            positions.some(p => Math.abs(p.x - pos.x) + Math.abs(p.y - pos.y) < 2)
        ));
        positions.push(pos);
    }

    const correctSlot = Math.floor(Math.random() * 3);

    for (let i = 0; i < 3; i++) {
        let char;
        if (i === correctSlot) {
            char = correctChar;
        } else {
            char = getRandomChar(correctChar, idiom);
        }
        foods.push({
            x: positions[i].x,
            y: positions[i].y,
            char: char,
            isCorrect: i === correctSlot
        });
    }
}

function getRandomChar(exclude1, exclude2) {
    let char;
    do {
        const idx = Math.floor(Math.random() * COMMON_CHARS.length);
        char = COMMON_CHARS[idx];
    } while (char === exclude1 || exclude2.includes(char));
    return char;
}

function isOccupiedByFood(x, y, extraPositions) {
    if (snake.some(s => s.x === x && s.y === y)) return true;
    if (extraPositions && extraPositions.some(p => p.x === x && p.y === y)) return true;
    return foods.some(f => f.x === x && f.y === y);
}

function getRandomEmptyCell() {
    let pos;
    let attempts = 0;
    do {
        pos = {
            x: Math.floor(Math.random() * COLS),
            y: Math.floor(Math.random() * ROWS)
        };
        attempts++;
    } while (attempts < 1000 && (
        snake.some(s => s.x === pos.x && s.y === pos.y) ||
        foods.some(f => f.x === pos.x && f.y === pos.y)
    ));
    return pos;
}

function update() {
    if (showingStageResult) return;

    direction = { ...nextDirection };
    const head = {
        x: (snake[0].x + direction.x + COLS) % COLS,
        y: (snake[0].y + direction.y + ROWS) % ROWS
    };

    if (snake.some(s => s.x === head.x && s.y === head.y)) {
        gameOver();
        return;
    }

    snake.unshift(head);

    let eaten = null;
    for (let i = 0; i < foods.length; i++) {
        if (foods[i].x === head.x && foods[i].y === head.y) {
            eaten = foods[i];
            break;
        }
    }

    if (eaten) {
        if (eaten.isCorrect) {
            score += 10;
            charIndex++;
            const idiom = IDIOMS[idiomIndex];

            if (charIndex >= 4) {
                score += 50;
                showingStageResult = true;
                setTimeout(() => {
                    showingStageResult = false;
                    level++;
                    pickNewIdiom();
                }, 1500);
            } else {
                spawnThreeChars();
            }
        } else {
            score = Math.max(0, score - 5);
        }
    } else {
        snake.pop();
    }

    updateUI();
    draw();
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "rgba(255,255,255,0.03)";
    ctx.lineWidth = 1;
    for (let x = 0; x <= COLS; x++) {
        ctx.beginPath();
        ctx.moveTo(x * GRID, 0);
        ctx.lineTo(x * GRID, canvas.height);
        ctx.stroke();
    }
    for (let y = 0; y <= ROWS; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * GRID);
        ctx.lineTo(canvas.width, y * GRID);
        ctx.stroke();
    }

    for (let i = 0; i < snake.length; i++) {
        const seg = snake[i];
        const t = i / snake.length;
        const r = Math.round(80 + (0 - 80) * t);
        const g = Math.round(200 + (120 - 200) * t);
        const b = Math.round(80 + (180 - 80) * t);

        const pad = 1;
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.shadowColor = i === 0 ? "rgba(80,200,80,0.6)" : "transparent";
        ctx.shadowBlur = i === 0 ? 8 : 0;
        ctx.beginPath();
        ctx.roundRect(seg.x * GRID + pad, seg.y * GRID + pad, GRID - pad * 2, GRID - pad * 2, 4);
        ctx.fill();
        ctx.shadowBlur = 0;

        if (i === 0) {
            ctx.fillStyle = "#fff";
            ctx.beginPath();
            let eyeX1, eyeY1, eyeX2, eyeY2;
            const cx = seg.x * GRID + GRID / 2;
            const cy = seg.y * GRID + GRID / 2;
            if (direction.x === 1) {
                eyeX1 = cx + 3; eyeY1 = cy - 3;
                eyeX2 = cx + 3; eyeY2 = cy + 3;
            } else if (direction.x === -1) {
                eyeX1 = cx - 3; eyeY1 = cy - 3;
                eyeX2 = cx - 3; eyeY2 = cy + 3;
            } else if (direction.y === -1) {
                eyeX1 = cx - 3; eyeY1 = cy - 3;
                eyeX2 = cx + 3; eyeY2 = cy - 3;
            } else {
                eyeX1 = cx - 3; eyeY1 = cy + 3;
                eyeX2 = cx + 3; eyeY2 = cy + 3;
            }
            ctx.arc(eyeX1, eyeY1, 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(eyeX2, eyeY2, 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    for (const food of foods) {
        const cx = food.x * GRID + GRID / 2;
        const cy = food.y * GRID + GRID / 2;

        ctx.fillStyle = "rgba(255, 100, 100, 0.2)";
        ctx.beginPath();
        ctx.arc(cx, cy, GRID / 2 + 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = food.isCorrect ? "#ff4444" : "#888888";
        ctx.shadowColor = food.isCorrect ? "rgba(255,50,50,0.5)" : "transparent";
        ctx.shadowBlur = food.isCorrect ? 6 : 0;
        ctx.beginPath();
        ctx.arc(cx, cy, GRID / 2 - 1, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.fillStyle = "#fff";
        ctx.font = "bold 16px 'Microsoft YaHei', sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(food.char, cx, cy + 1);
    }

    if (showingStageResult) {
        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "#ffd700";
        ctx.font = "bold 32px 'Microsoft YaHei', sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.shadowColor = "rgba(255,215,0,0.8)";
        ctx.shadowBlur = 15;
        ctx.fillText("过关！", canvas.width / 2, canvas.height / 2 - 20);
        ctx.shadowBlur = 0;

        ctx.fillStyle = "#fff";
        ctx.font = "18px 'Microsoft YaHei', sans-serif";
        ctx.fillText(IDIOMS[idiomIndex].join(""), canvas.width / 2, canvas.height / 2 + 20);
    }
}

function updateUI() {
    scoreEl.textContent = `得分: ${score}`;
    levelEl.textContent = `第 ${level} 关`;

    const idiom = IDIOMS[idiomIndex];
    let html = "";
    for (let i = 0; i < 4; i++) {
        if (i < charIndex) {
            html += `<span class="filled">${idiom[i]}</span>`;
        } else {
            html += `<span class="empty">　</span>`;
        }
    }
    idiomDisplay.innerHTML = html;

    stageInfo.textContent = `${charIndex === 0 ? "寻找第一个字" : charIndex < 4 ? `寻找第${charIndex + 1}个字` : "成语完成！"}: ${idiom[charIndex] || ""}`;
}

function gameOver() {
    running = false;
    clearInterval(gameLoop);

    overlay.innerHTML = `
        <h2>游戏结束</h2>
        <p>最终得分: ${score}<br>到达第 ${level} 关</p>
        <button class="btn" id="restartBtn">再来一局</button>
    `;
    overlay.style.display = "flex";
    document.getElementById("restartBtn").addEventListener("click", startGame);
}

function startGame() {
    initGame();
    overlay.style.display = "none";
    draw();
    running = true;
    clearInterval(gameLoop);
    gameLoop = setInterval(update, 150);
}

startBtn.addEventListener("click", startGame);

document.addEventListener("keydown", (e) => {
    if (!running) return;
    switch (e.key) {
        case "ArrowUp":
        case "w":
        case "W":
            if (direction.y !== 1) nextDirection = { x: 0, y: -1 };
            e.preventDefault();
            break;
        case "ArrowDown":
        case "s":
        case "S":
            if (direction.y !== -1) nextDirection = { x: 0, y: 1 };
            e.preventDefault();
            break;
        case "ArrowLeft":
        case "a":
        case "A":
            if (direction.x !== 1) nextDirection = { x: -1, y: 0 };
            e.preventDefault();
            break;
        case "ArrowRight":
        case "d":
        case "D":
            if (direction.x !== -1) nextDirection = { x: 1, y: 0 };
            e.preventDefault();
            break;
    }
});

document.querySelectorAll(".ctrl-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        if (!running) return;
        const dir = btn.dataset.dir;
        switch (dir) {
            case "up":
                if (direction.y !== 1) nextDirection = { x: 0, y: -1 };
                break;
            case "down":
                if (direction.y !== -1) nextDirection = { x: 0, y: 1 };
                break;
            case "left":
                if (direction.x !== 1) nextDirection = { x: -1, y: 0 };
                break;
            case "right":
                if (direction.x !== -1) nextDirection = { x: 1, y: 0 };
                break;
        }
    });
});

let touchStartX = 0;
let touchStartY = 0;
canvas.addEventListener("touchstart", (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    e.preventDefault();
}, { passive: false });

canvas.addEventListener("touchend", (e) => {
    if (!running) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;
    if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return;
    if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 0 && direction.x !== -1) nextDirection = { x: 1, y: 0 };
        else if (dx < 0 && direction.x !== 1) nextDirection = { x: -1, y: 0 };
    } else {
        if (dy > 0 && direction.y !== -1) nextDirection = { x: 0, y: 1 };
        else if (dy < 0 && direction.y !== 1) nextDirection = { x: 0, y: -1 };
    }
    e.preventDefault();
}, { passive: false });
