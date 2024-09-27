const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const timeSpan = document.getElementById('timeSpan');
const scoreSpan = document.getElementById('scoreSpan');
const leaderboardList = document.getElementById('leaderboardList');

const 宽度 = canvas.width;
const 高度 = canvas.height;
const 块大小 = 20;

let 老鼠, 芝士, 游戏结束, 方向, 开始时间, 计时器, 得分;
let 排行榜 = [];
let 游戏速度 = 300; // 初始速度，数值越大越慢
let 等待输入名字 = false;
let 游戏已开始 = false;

function 显示开始界面() {
    ctx.fillStyle = 'black';
    ctx.font = '30px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('老鼠吃芝士游戏', 宽度/2, 高度/2 - 40);
    ctx.fillText('按空格键开始', 宽度/2, 高度/2 + 20);
    ctx.textAlign = 'left'; // 重置文本对齐方式
}

function 初始化游戏() {
    老鼠 = [{x: 宽度/2, y: 高度/2}];
    生成芝士();
    游戏结束 = false;
    方向 = '右';
    开始时间 = Date.now();
    得分 = 0;
    游戏速度 = 300; // 重置速度
    if (计时器) clearInterval(计时器);
    计时器 = setInterval(更新时间, 1000);
    更新得分显示();
    游戏已开始 = true;
}

function 生成芝士() {
    芝士 = {
        x: Math.floor(Math.random() * (宽度 / 块大小)) * 块大小,
        y: Math.floor(Math.random() * (高度 / 块大小)) * 块大小
    };
}

function 画老鼠() {
    ctx.fillStyle = 'gray';
    老鼠.forEach(部分 => {
        ctx.fillRect(部分.x, 部分.y, 块大小, 块大小);
    });
}

function 画芝士() {
    ctx.fillStyle = 'yellow';
    ctx.fillRect(芝士.x, 芝士.y, 块大小, 块大小);
}

function 移动老鼠() {
    const 头 = {x: 老鼠[0].x, y: 老鼠[0].y};

    switch(方向) {
        case '上': 头.y -= 块大小; break;
        case '下': 头.y += 块大小; break;
        case '左': 头.x -= 块大小; break;
        case '右': 头.x += 块大小; break;
    }

    老鼠.unshift(头);

    if (头.x === 芝士.x && 头.y === 芝士.y) {
        得分++;
        更新得分显示();
        生成芝士();
        加快游戏速度();
    } else {
        老鼠.pop();
    }
}

function 加快游戏速度() {
    游戏速度 = Math.max(50, 游戏速度 - 10); // 每次得分减少10毫秒，最快50毫秒
}

function 检查碰撞() {
    const 头 = 老鼠[0];

    if (头.x < 0 || 头.x >= 宽度 || 头.y < 0 || 头.y >= 高度) {
        游戏结束 = true;
    }

    for (let i = 1; i < 老鼠.length; i++) {
        if (头.x === 老鼠[i].x && 头.y === 老鼠[i].y) {
            游戏结束 = true;
            break;
        }
    }
}

function 更新时间() {
    const 当前时间 = Math.floor((Date.now() - 开始时间) / 1000);
    timeSpan.textContent = 当前时间;
}

function 更新得分显示() {
    scoreSpan.textContent = 得分;
}

function 更新排行榜(姓名) {
    排行榜.push({分数: 得分, 姓名: 姓名});
    排行榜.sort((a, b) => b.分数 - a.分数);
    排行榜 = 排行榜.slice(0, 5);
    
    leaderboardList.innerHTML = '';
    const 名次 = ['第一名', '第二名', '第三名', '第四名', '第五名'];
    排行榜.forEach((记录, 索引) => {
        const li = document.createElement('li');
        li.title = `${名次[索引]}: ${记录.分数}分 (${记录.姓名})`; // 添加完整信息作为title
        li.textContent = `${名次[索引]}: ${记录.分数}分 (${记录.姓名.length > 4 ? 记录.姓名.slice(0, 4) + '...' : 记录.姓名})`;
        leaderboardList.appendChild(li);
    });
}

function 游戏结束处理() {
    clearInterval(计时器);
    ctx.fillStyle = 'black';
    ctx.font = '30px Arial';
    ctx.fillText('游戏结束!', 宽度/2 - 70, 高度/2 - 60);
    ctx.fillText(`最终得分: ${得分}`, 宽度/2 - 80, 高度/2 - 20);
    ctx.fillText('请输入您的姓名', 宽度/2 - 100, 高度/2 + 20);

    等待输入名字 = true;

    // 创建输入框
    const 输入框 = document.createElement('input');
    输入框.type = 'text';
    输入框.style.position = 'absolute';
    输入框.style.left = `${canvas.offsetLeft + 宽度/2 - 100}px`;
    输入框.style.top = `${canvas.offsetTop + 高度/2 + 40}px`;
    输入框.style.width = '200px';
    document.body.appendChild(输入框);

    输入框.focus();

    输入框.addEventListener('keydown', (事件) => {
        if (事件.key === 'Enter') {
            const 姓名 = 输入框.value.trim() || '匿名';
            更新排行榜(姓名);
            document.body.removeChild(输入框);
            ctx.fillText('按空格键重新开始', 宽度/2 - 130, 高度/2 + 60);
            等待输入名字 = false;
        }
    });
}

function 游戏循环() {
    ctx.clearRect(0, 0, 宽度, 高度);

    if (!游戏已开始) {
        显示开始界面();
        return;
    }

    移动老鼠();
    检查碰撞();

    画老鼠();
    画芝士();

    if (游戏结束) {
        游戏结束处理();
    } else {
        setTimeout(游戏循环, 游戏速度);
    }
}

document.addEventListener('keydown', (事件) => {
    if (!游戏已开始 && 事件.code === 'Space') {
        初始化游戏();
        游戏循环();
    } else if (游戏结束 && !等待输入名字 && 事件.code === 'Space') {
        初始化游戏();
        游戏循环();
    } else if (!游戏结束 && 游戏已开始) {
        switch(事件.key) {
            case 'ArrowUp':
            case 'w':
            case 'W':
                if (方向 !== '下') 方向 = '上';
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                if (方向 !== '上') 方向 = '下';
                break;
            case 'ArrowLeft':
            case 'a':
            case 'A':
                if (方向 !== '右') 方向 = '左';
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                if (方向 !== '左') 方向 = '右';
                break;
        }
    }
});

显示开始界面();
游戏循环();