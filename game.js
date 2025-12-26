class Game {
    // 辅助函数：生成奖励图片 SVG DataURI
    // 避免用户没有图片导致显示裂图
    generateRewardSVG(type) {
        let content = '';
        let color = '#4CC9F0';
        
        switch(type) {
            case 1: // 加油海报
                color = '#F72585';
                content = `
                    <rect x="50" y="50" width="300" height="200" fill="#fff" stroke="#333" stroke-width="5"/>
                    <text x="200" y="150" font-family="Arial" font-size="40" text-anchor="middle" fill="#333">考研加油</text>
                    <path d="M 80 80 L 120 120 M 120 80 L 80 120" stroke="#F72585" stroke-width="5"/>
                    <circle cx="300" cy="100" r="20" fill="#FFD166"/>
                `;
                break;
            case 3: // 手机收纳
                color = '#4361EE';
                content = `
                    <rect x="100" y="50" width="200" height="200" fill="#ddd" stroke="#333" stroke-width="5"/>
                    <text x="200" y="150" font-family="Arial" font-size="30" text-anchor="middle" fill="#666">NO PHONE</text>
                    <rect x="160" y="80" width="80" height="140" rx="10" fill="#333"/>
                    <rect x="170" y="90" width="60" height="100" fill="#000"/>
                `;
                break;
            case 5: // 服务站
                color = '#FFD166';
                content = `
                    <rect x="50" y="100" width="300" height="150" fill="#fff" stroke="#333" stroke-width="5"/>
                    <rect x="150" y="50" width="100" height="50" fill="#FF5252"/>
                    <text x="200" y="85" font-family="Arial" font-size="20" text-anchor="middle" fill="#fff">SERVICE</text>
                    <circle cx="100" cy="180" r="30" fill="#C62828"/>
                    <text x="100" y="190" font-family="Arial" font-size="20" text-anchor="middle" fill="#fff">+</text>
                `;
                break;
            case 7: // 上岸
                color = '#06D6A0';
                content = `
                    <path d="M 0 200 Q 100 150 200 200 T 400 200" stroke="#4CC9F0" stroke-width="10" fill="none"/>
                    <rect x="250" y="50" width="100" height="150" fill="#333"/>
                    <polygon points="250,50 350,50 300,10" fill="#FFD166"/>
                    <text x="200" y="250" font-family="Arial" font-size="30" text-anchor="middle" fill="#333">成功上岸！</text>
                `;
                break;
        }

        const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
            <rect width="100%" height="100%" fill="${color}" fill-opacity="0.2"/>
            ${content}
        </svg>
        `.trim();
        return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
    }

    constructor() {
        this.levels = [
            { name: "备考启动期", difficulty: 1, desc: "万里长征第一步，先去图书馆占个座！" },
            { name: "基础夯实期", difficulty: 2, desc: "背单词、看教材，打好地基最重要。" },
            { name: "强化训练期", difficulty: 3, desc: "题海战术开始，小心不要秃头哦。" },
            { name: "暑期特训营", difficulty: 4, desc: "天气炎热，心浮气躁，稳住能赢！" },
            { name: "真题模拟战", difficulty: 5, desc: "直面真题，查漏补缺，心态要稳。" },
            { name: "冲刺突击战", difficulty: 6, desc: "最后时刻，背水一战，拼了！" },
            { name: "考前决胜夜", difficulty: 7, desc: "调整呼吸，明天就是战场！" }
        ];

        // 奖励配置：key 为完成后的关卡索引（即当前关卡索引+1）
        this.rewards = {
            1: { 
                imgs: ['assets/reward_1.jpg', 'assets/reward_1-1.jpg', 'assets/reward_1-2.jpg', 'assets/reward_1-3.jpg'], 
                text: '恭喜通过第一关！\n解锁服务：【考研加油海报】\n每一句鼓励，都是前行的动力！' 
            },
            2: { 
                imgs: ['assets/reward_2-1.jpg', 'assets/reward_2-2.jpg'], 
                text: '恭喜通过第二关！\n解锁服务：【暖心补给】\n冬日里的温暖，守护你的研途！' 
            },
            3: { 
                imgs: ['assets/reward_3.jpg'], 
                text: '恭喜通过第三关！\n解锁服务：【手机收纳处】\n告别手机诱惑，专注当下！' 
            },
            4: { 
                imgs: ['assets/reward_4-1.jpg', 'assets/reward_4-2.jpg', 'assets/reward_4-3.jpg', 'assets/reward_4-4.jpg'], 
                text: '恭喜通过第四关！\n解锁服务：【解压活动区】\n适当放松，为了更好地冲刺！' 
            },
            5: { 
                imgs: ['assets/reward_5.jpg'], 
                text: '恭喜通过第五关！\n解锁服务：【研考服务站】\n累了困了？来这里补充能量！' 
            },
            6: { 
                imgs: ['assets/reward_6.jpg'], 
                text: '恭喜通过第六关！\n解锁服务：【暖心大礼包】\n全心全意，为你保驾护航！' 
            },
            7: { 
                imgs: ['assets/reward_7.jpg'], 
                text: '恭喜通关！\n解锁服务：【下一站，上岸】\n星光不负赶路人，你一定能行！' 
            }
        };
        
        this.resetGame();
        this.audio = new AudioController(); // Initialize Audio Controller
        this.platformer = new PlatformerGame(this);
        
        // Initial Theme
        this.setTheme('day');
        this.initSlideshow();

        // 尝试添加全局点击监听，以便尽早激活音频（解决标题界面没声音的问题）
        const unlockAudio = () => {
            if (this.audio.ctx.state === 'suspended' || !this.audio.enabled) {
                this.audio.init().then(() => {
                    this.showToast("🔊 音频引擎已启动");
                    // 如果当前还在标题界面，就开始播放大厅音乐作为背景音
                    if (document.getElementById('scene-start').classList.contains('active')) {
                        this.audio.playBgm('lobby');
                    }
                }).catch(console.error);
            }
        };
        document.addEventListener('click', unlockAudio, { once: true });
        document.addEventListener('touchstart', unlockAudio, { once: true });
    }

    initSlideshow() {
        const bgContainer = document.getElementById('bg-slideshow');
        if (!bgContainer) return;

        // 辅助函数：创建青春波普风格的 SVG 背景
        const createPopSlide = (colors, pattern) => {
            // colors: [bg_main, shape_color_1, shape_color_2]
            
            let patternSVG = '';
            
            if (pattern === 'dots') {
                patternSVG = `<pattern id="p-dots" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                    <circle cx="20" cy="20" r="4" fill="${colors[1]}" opacity="0.4"/>
                </pattern>
                <rect width="100%" height="100%" fill="url(#p-dots)" />`;
            } else if (pattern === 'grid') {
                patternSVG = `<pattern id="p-grid" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                    <path d="M 60 0 L 0 0 0 60" fill="none" stroke="${colors[1]}" stroke-width="2" opacity="0.3"/>
                </pattern>
                <rect width="100%" height="100%" fill="url(#p-grid)" />`;
            } else if (pattern === 'shapes') {
                 patternSVG = `
                    <circle cx="10%" cy="10%" r="50" fill="${colors[1]}" opacity="0.6"/>
                    <rect x="80%" y="20%" width="80" height="80" transform="rotate(15)" fill="${colors[2]}" opacity="0.6"/>
                    <circle cx="50%" cy="60%" r="120" stroke="${colors[1]}" stroke-width="10" fill="none" opacity="0.4"/>
                    <path d="M 100 800 L 200 600 L 300 800 Z" fill="${colors[2]}" opacity="0.5"/>
                    <rect x="70%" y="70%" width="60" height="60" rx="10" fill="${colors[1]}" opacity="0.6"/>
                 `;
            }

            const svg = `
            <svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" preserveAspectRatio="none">
                <rect width="100%" height="100%" fill="${colors[0]}" />
                ${patternSVG}
            </svg>
            `.trim();
            return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
        };

        // 青春活力配色组
        const imageUrls = [
            // Blue/Pink Pop
            createPopSlide(['#4CC9F0', '#F72585', '#4361EE'], 'shapes'),
            // Yellow/Purple Pop
            createPopSlide(['#FFD166', '#7209B7', '#F72585'], 'grid'),
            // Green/Blue Pop
            createPopSlide(['#06D6A0', '#4CC9F0', '#073B4C'], 'dots')
        ];

        // 清空现有内容
        bgContainer.innerHTML = '';

        // Create img elements
        imageUrls.forEach((url, index) => {
            const img = document.createElement('img');
            img.src = url;
            img.className = 'bg-slide';
            if (index === 0) img.classList.add('active');
            bgContainer.appendChild(img);
        });

        // Cycle Logic
        let currentIndex = 0;
        const slides = document.getElementsByClassName('bg-slide');
        
        if (this.slideshowInterval) clearInterval(this.slideshowInterval);

        this.slideshowInterval = setInterval(() => {
            if(slides.length > 0) {
                slides[currentIndex].classList.remove('active');
                currentIndex = (currentIndex + 1) % slides.length;
                slides[currentIndex].classList.add('active');
            }
        }, 6000); 
    }

    resetGame() {
        this.currentLevelIndex = 0; // 0-6
        this.money = 2000;
        this.stats = {
            health: 100,
            mood: 100,
            knowledge: 0
        };
        this.buffs = {
            speed: 1, // Movement speed multiplier
            knowledgeRate: 1 // Knowledge gain multiplier
        };
        this.isGameOver = false;
        
        this.updateUI();
    }

    setTheme(mode) {
        document.body.className = `theme-${mode}`;
        // Update background layer
        // const bg = document.getElementById('dynamic-bg');
        // bg.className = `bg-${mode}`;
        // 背景现在由 slideshow 控制，不再需要切换 CSS 类名来改变背景色，
        // 但我们保留 body 的类名以便 UI 面板适配颜色。
    }

    enterLobby() {
        // 第一次交互时初始化音频系统
        this.audio.init().then(() => {
            this.audio.playBgm('lobby');
            // Play a confirmation sound
            this.audio.playTone(600, 'square', 0.1); 
        }).catch(e => console.error("Audio init failed:", e));

        document.getElementById('scene-start').classList.remove('active');
        document.getElementById('scene-lobby').classList.add('active');
        this.updateUI();
    }

    updateUI() {
        // Update Level/Day display
        const levelData = this.levels[this.currentLevelIndex];
        const dayDisplay = document.getElementById('day-display');
        if(dayDisplay) dayDisplay.textContent = `Day ${this.currentLevelIndex + 1}`;
        
        // If in game scene, update level name
        const levelNameEl = document.getElementById('level-name');
        if (levelNameEl) levelNameEl.textContent = levelData ? levelData.name : "已通关";

        const moneyDisplay = document.getElementById('money-display');
        if(moneyDisplay) moneyDisplay.textContent = this.money;
        
        this.updateBar('health', this.stats.health);
        this.updateBar('mood', this.stats.mood);
        this.updateBar('knowledge', this.stats.knowledge);

        // Update Avatar Mood
        const moodEmoji = document.getElementById('avatar-mood');
        if(moodEmoji) {
            if (this.stats.mood > 80) moodEmoji.textContent = '😄';
            else if (this.stats.mood > 50) moodEmoji.textContent = '😐';
            else moodEmoji.textContent = '😫';
        }
    }

    updateBar(type, value) {
        const bar = document.getElementById(`${type}-bar`);
        const valText = document.getElementById(`${type}-val`);
        const displayValue = Math.max(0, Math.min(100, Math.floor(value)));
        
        bar.style.width = `${displayValue}%`;
        valText.textContent = displayValue;
    }

    showToast(msg) {
        const toast = document.getElementById('toast');
        toast.textContent = msg;
        toast.classList.remove('hidden');
        setTimeout(() => toast.classList.add('hidden'), 2000);
    }

    buyItem(type) {
        let cost = 0;
        let success = false;

        switch(type) {
            case 'meal':
                cost = 150;
                if (this.money >= cost) {
                    this.money -= cost;
                    this.stats.health = Math.min(100, this.stats.health + 30);
                    this.stats.mood = Math.min(100, this.stats.mood + 5);
                    success = true;
                    this.audio.playBuy();
                    this.showToast("购买了豪华营养餐，身体倍儿棒！");
                }
                break;
            case 'coffee':
                cost = 80;
                if (this.money >= cost) {
                    this.money -= cost;
                    this.buffs.speed = 1.3;
                    success = true;
                    this.audio.playBuy();
                    this.showToast("喝了咖啡，今天的反应速度变快了！");
                }
                break;
            case 'notes':
                cost = 200;
                if (this.money >= cost) {
                    this.money -= cost;
                    this.buffs.knowledgeRate = 1.5;
                    success = true;
                    this.audio.playBuy();
                    this.showToast("购买了学霸笔记，学习效率大幅提升！");
                }
                break;
            case 'game':
                cost = 50;
                if (this.money >= cost) {
                    this.money -= cost;
                    this.stats.mood = Math.min(100, this.stats.mood + 40);
                    this.stats.knowledge -= 2; // Distraction
                    success = true;
                    this.audio.playBuy();
                    this.showToast("玩了一会儿游戏，心情好多了！");
                }
                break;
        }

        if (!success && this.money < cost) {
            this.showToast("资金不足！");
        } else if (success) {
            this.updateUI();
        }
    }

    showGuide() {
        document.getElementById('modal-guide').classList.remove('hidden');
    }

    startLevel() {
        document.getElementById('modal-guide').classList.add('hidden');

        if (this.stats.health < 20 || this.stats.mood < 20) {
            this.showToast("状态太差，无法进行高强度复习！请先休息或补充营养。");
            return;
        }

        if (this.currentLevelIndex >= this.levels.length) {
            return;
        }

        document.getElementById('scene-lobby').classList.remove('active');
        document.getElementById('scene-game').classList.add('active');
        
        this.updateUI();
        
        // Switch BGM (Ensure audio is ready)
        if (!this.audio.enabled) {
            this.audio.init().then(() => this.audio.playBgm('game'));
        } else {
            this.audio.playBgm('game');
        }

        // Start the platformer game with current level difficulty
        const currentLevel = this.levels[this.currentLevelIndex];
        this.platformer.init(currentLevel.difficulty, this.stats, this.buffs);
        this.showToast(`第 ${this.currentLevelIndex + 1} 关开始：${currentLevel.desc}`);
    }

    completeLevel(knowledgeGained, healthLost, moodLost) {
        this.stats.knowledge += knowledgeGained;
        this.stats.health -= healthLost;
        this.stats.mood -= moodLost;
        
        // Reset buffs
        this.buffs.speed = 1;
        this.buffs.knowledgeRate = 1;

        // Next Level
        this.currentLevelIndex++;
        this.money += 300; // Level clear bonus

        this.checkGameStatus();
        this.updateUI();
        
        // Switch back to lobby BGM
        this.audio.playBgm('lobby');
        
        // Check reward immediately after completing level
        // (Wait a bit for UI transition if needed, but immediate is fine)
        setTimeout(() => this.checkReward(), 100);
    }

    returnToLobby() {
        document.getElementById('scene-game').classList.remove('active');
        document.getElementById('scene-lobby').classList.add('active');
        document.getElementById('game-overlay').classList.add('hidden');
        
        // Switch BGM
        this.audio.playBgm('lobby');
        
        // Redundant check removed to avoid double popup if logic was correct,
        // but since we moved it to completeLevel, this is just for scene switch.
    }

    quitLevel() {
        if(confirm("确定放弃今天的复习吗？虽然不会扣除健康，但不会获得知识。")) {
            this.completeLevel(0, 0, 10); // Penalty to mood for quitting
            this.returnToLobby();
        }
    }

    checkGameStatus() {
        if (this.stats.health <= 0 || this.stats.mood <= 0) {
            alert("游戏结束：身体垮了或心态崩了！");
            location.reload();
        } else if (this.currentLevelIndex >= this.levels.length) {
            // Game Clear
            // Don't reload immediately, wait for returnToLobby -> checkReward -> modal
            // But we need to prevent starting next level.
            // checkReward handles the final modal.
        }
    }

    checkReward() {
        const reward = this.rewards[this.currentLevelIndex];
        if (reward) {
            const modal = document.getElementById('modal-reward');
            const gallery = document.getElementById('reward-gallery');
            gallery.innerHTML = ''; // Clear previous images
            
            // Toggle layout mode based on image count
            if (reward.imgs.length === 1) {
                gallery.classList.add('single-mode');
            } else {
                gallery.classList.remove('single-mode');
            }

            // Handle multiple images
            reward.imgs.forEach(imgSrc => {
                const imgEl = document.createElement('img');
                imgEl.className = 'reward-image';
                imgEl.src = imgSrc + "?t=" + new Date().getTime();
                
                imgEl.onerror = () => {
                    console.error("Image failed to load:", imgSrc);
                    imgEl.alt = "加载失败: " + imgSrc;
                };
                
                gallery.appendChild(imgEl);
            });

            document.getElementById('reward-text').innerText = reward.text;
            
            // 如果是通关（第7关），修改按钮行为为重置
            const btn = modal.querySelector('.btn-confirm');
            if (this.currentLevelIndex >= 7) {
                btn.onclick = () => location.reload();
                btn.textContent = "重新开始";
            } else {
                btn.onclick = () => this.closeReward();
                btn.textContent = "太棒了！";
            }
            
            modal.classList.remove('hidden');
            this.audio.playWin(); 
        }
    }

    closeReward() {
        document.getElementById('modal-reward').classList.add('hidden');
    }

    toggleAudio() {
        // Initialize audio context on first user interaction
        if (this.audio.ctx.state === 'suspended') {
            this.audio.init().then(() => {
                const btn = document.getElementById('btn-music');
                if(btn) btn.textContent = '🔊';
                // Play lobby music if in lobby
                if (document.getElementById('scene-lobby').classList.contains('active')) {
                    this.audio.playBgm('lobby');
                }
            });
        } else {
            const isUnmuted = this.audio.toggleMute();
            const btn = document.getElementById('btn-music');
            if(btn) btn.textContent = isUnmuted ? '🔊' : '🔇';
        }
    }
}

class PlatformerGame {
    constructor(mainGame) {
        this.mainGame = mainGame;
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Config
        this.gravity = 0.7; // 增加重力 (原0.6)，下落更快
        this.friction = 0.8;
        this.baseSpeed = 5;
        this.jumpForce = 13; // 略微增加跳跃力度 (原12) 以对抗重力，但操作窗口期变短
        
        this.keys = {
            left: false,
            right: false,
            up: false
        };

        window.addEventListener('keydown', (e) => this.handleInput(e, true));
        window.addEventListener('keyup', (e) => this.handleInput(e, false));

        // Mouse/Touch Jump Support
        this.canvas.addEventListener('mousedown', (e) => {
            e.preventDefault();
            this.keys.up = true;
        });
        this.canvas.addEventListener('mouseup', (e) => {
            e.preventDefault();
            this.keys.up = false;
        });
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault(); // Prevent scroll
            this.keys.up = true;
        }, {passive: false});
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.keys.up = false;
        });
    }

    handleInput(e, isDown) {
        // Debug log
        // console.log(e.code);
        
        if (e.code === 'ArrowLeft' || e.code === 'KeyA') this.keys.left = isDown;
        if (e.code === 'ArrowRight' || e.code === 'KeyD') this.keys.right = isDown;
        
        // Jump: Space, ArrowUp, PageUp, W
        if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'PageUp' || e.code === 'KeyW') {
            if(isDown) e.preventDefault(); 
            this.keys.up = isDown;
        }
    }

    init(difficulty, stats, buffs) {
        this.running = true;
        this.won = false;
        this.knowledgeCollected = 0;
        this.healthLost = 0;
        this.moodLost = 0;
        
        // Buffs application
        this.speed = this.baseSpeed * buffs.speed;
        this.knowledgeMultiplier = buffs.knowledgeRate;

        // Player
        this.player = {
            x: 50,
            y: 300,
            width: 30,
            height: 30,
            velX: 0,
            velY: 0,
            grounded: false,
            color: '#1565C0', // Update to match primary color
            face: '🎓'
        };

        // Generate Level
        this.generateLevel(difficulty);

        this.loop();
    }

    generateLevel(difficulty) {
        this.platforms = [];
        this.items = [];
        this.enemies = [];

        // Ground
        // Length increases with difficulty
        const totalLength = 1500 + (difficulty * 200); 
        this.platforms.push({ x: 0, y: 400, width: totalLength + 500, height: 50 });

        // Platforms & Obstacles
        let currentX = 300;
        
        while (currentX < totalLength) {
            const y = 250 + Math.random() * 100; // Height variation
            const width = 100 + Math.random() * 150;
            
            // Add Platform
            this.platforms.push({ x: currentX, y: y, width: width, height: 20 });

            // 1. Items (Books) - More needed in later levels
            if (Math.random() > 0.4) { // 减少书本生成 (原>0.3)
                this.items.push({
                    x: currentX + width / 2 - 15,
                    y: y - 40,
                    width: 30,
                    height: 30,
                    type: 'book',
                    symbol: '📚'
                });
            }

            // 2. Enemies - Difficulty scales quantity and types
            // More enemies and faster
            const enemyChance = 0.4 + (difficulty * 0.08); // 增加敌人生成概率 (原0.3 + diff*0.05)
            
            if (Math.random() < enemyChance) {
                const enemyType = Math.random() > 0.5 ? 'phone' : 'sleep';
                this.enemies.push({
                    x: currentX + 20,
                    y: y - 30,
                    width: 30,
                    height: 30,
                    type: enemyType,
                    symbol: enemyType === 'phone' ? '📱' : '💤',
                    patrolStart: currentX,
                    patrolEnd: currentX + width,
                    speed: 1.0 + (difficulty * 0.15), // 显著降低敌人速度 (原2.5+diff*0.3)
                    dir: 1
                });
            }

            // Gap between platforms (Wider gaps)
            const gap = 80 + Math.random() * (60 + difficulty * 15); // 增加间隙 (原50)
            currentX += width + gap;
        }

        // Finish Line
        this.goal = { x: totalLength + 50, y: 350, width: 50, height: 50, symbol: '🏁' };
        
        // Camera
        this.camera = { x: 0 };
    }

    update() {
        if (!this.running) return;

        // Player Movement
        if (this.keys.left) {
            if (this.player.velX > -this.speed) this.player.velX--;
        }
        if (this.keys.right) {
            if (this.player.velX < this.speed) this.player.velX++;
        }

        this.player.velX *= this.friction;

        // Jump (Moved BEFORE position update and collision)
        if (this.keys.up && this.player.grounded) {
            this.player.velY = -this.jumpForce;
            this.player.grounded = false;
            this.mainGame.audio.playJump();
        }

        this.player.velY += this.gravity;

        this.player.x += this.player.velX;
        this.player.y += this.player.velY;

        this.player.grounded = false;

        // Platform Collisions
        this.platforms.forEach(p => {
            const dir = this.colCheck(this.player, p);
            if (dir === "b") {
                this.player.grounded = true;
                this.player.velY = 0;
            } else if (dir === "t") {
                this.player.velY *= -1;
            }
        });

        // Bounds
        if (this.player.y > 500) { // Fell off
            this.player.y = 0;
            this.player.x = this.camera.x + 50;
            this.player.velY = 0;
            this.healthLost += 20; // 掉落惩罚加倍 (原10)
        }

        // Enemy Logic & Collision
        this.enemies.forEach(enemy => {
            // Patrol
            enemy.x += enemy.speed * enemy.dir;
            if (enemy.x > enemy.patrolEnd || enemy.x < enemy.patrolStart) {
                enemy.dir *= -1;
            }

            // Collision with player
            const dir = this.colCheck(this.player, enemy);
            if (dir) {
                // If player lands on top of enemy (Jump attack)
                if (dir === "b" && this.player.velY > 0) {
                     // Kill enemy
                     const idx = this.enemies.indexOf(enemy);
                     if (idx > -1) {
                         this.enemies.splice(idx, 1);
                         // Small boost
                         this.player.velY = -8;
                         this.moodLost -= 2; // Killing stress/distraction feels good
                     }
                } else {
                    // Hurt player (Heavy damage)
                    if (enemy.type === 'phone') {
                        this.moodLost += 5; // 心情惩罚加倍 (原2)
                    } else {
                        this.healthLost += 5; // 健康惩罚加倍 (原2)
                    }
                    // Bounce back
                    this.player.velX = -this.player.velX * 1.5;
                    this.player.velY = -5;
                }
            }
        });

        // Item Collection
        for (let i = this.items.length - 1; i >= 0; i--) {
            if (this.colCheck(this.player, this.items[i])) {
                this.knowledgeCollected += 5 * this.knowledgeMultiplier; // Increased base value
                this.items.splice(i, 1);
            }
        }

        // Goal
        if (this.colCheck(this.player, this.goal)) {
            this.win();
        }

        // Camera Follow
        this.camera.x = this.player.x - 300;
        if (this.camera.x < 0) this.camera.x = 0;
    }

    colCheck(shapeA, shapeB) {
        // get the vectors to check against
        const vX = (shapeA.x + (shapeA.width / 2)) - (shapeB.x + (shapeB.width / 2));
        const vY = (shapeA.y + (shapeA.height / 2)) - (shapeB.y + (shapeB.height / 2));
        // add the half widths and half heights of the objects
        const hWidths = (shapeA.width / 2) + (shapeB.width / 2);
        const hHeights = (shapeA.height / 2) + (shapeB.height / 2);
        let colDir = null;

        // if the x and y vector are less than the half width or half height, they we must be inside the object, causing a collision
        if (Math.abs(vX) < hWidths && Math.abs(vY) < hHeights) {
            
            // Special case for Goal: Don't resolve collision, just return true/direction
            // Check if shapeB is the goal
            if (shapeB === this.goal) {
                return "goal"; 
            }

            const oX = hWidths - Math.abs(vX);
            const oY = hHeights - Math.abs(vY);
            if (oX >= oY) {
                if (vY > 0) {
                    colDir = "t";
                    shapeA.y += oY;
                } else {
                    colDir = "b";
                    shapeA.y -= oY;
                }
            } else {
                if (vX > 0) {
                    colDir = "l";
                    shapeA.x += oX;
                } else {
                    colDir = "r";
                    shapeA.x -= oX;
                }
            }
        }
        return colDir;
    }

    draw() {
        // Clear
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.save();
        this.ctx.translate(-this.camera.x, 0);

        // Draw Platforms
        this.ctx.fillStyle = "#37474F"; // Update to match dark blue-grey theme
        this.platforms.forEach(p => {
            this.ctx.fillRect(p.x, p.y, p.width, p.height);
        });

        // Draw Items
        this.ctx.font = "30px Arial";
        this.items.forEach(item => {
            this.ctx.fillText(item.symbol, item.x, item.y + 25);
        });

        // Draw Enemies
        this.enemies.forEach(enemy => {
            this.ctx.fillText(enemy.symbol, enemy.x, enemy.y + 25);
        });

        // Draw Goal
        this.ctx.fillText(this.goal.symbol, this.goal.x, this.goal.y + 40);

        // Draw Player
        this.ctx.fillText(this.player.face, this.player.x - 5, this.player.y + 25);

        this.ctx.restore();

        // HUD
        this.ctx.fillStyle = "black";
        this.ctx.font = "20px Fredoka";
        this.ctx.fillText(`📚 本局获取: ${Math.floor(this.knowledgeCollected)}`, 20, 40);
        this.ctx.fillStyle = "red";
        this.ctx.fillText(`❤️ 消耗: ${Math.floor(this.healthLost)}`, 20, 70);

        // Debug info (small)
        this.ctx.fillStyle = "#888";
        this.ctx.font = "12px monospace";
        this.ctx.fillText(`Grounded: ${this.player.grounded ? 'YES' : 'NO'} | JumpKey: ${this.keys.up ? 'ON' : 'OFF'}`, 20, 100);
    }

    loop() {
        if (!this.running) return;
        this.update();
        this.draw();
        requestAnimationFrame(() => this.loop());
    }

    win() {
        this.running = false;
        this.mainGame.audio.playWin();
        
        // Calculate Results
        const knowledge = Math.floor(this.knowledgeCollected + 20); // +20 base for clearing
        const health = Math.floor(this.healthLost + 5); 
        const mood = Math.floor(this.moodLost + 5); 

        // Show Overlay
        const overlay = document.getElementById('game-overlay');
        document.getElementById('overlay-title').textContent = "挑战成功！";
        document.getElementById('overlay-desc').innerHTML = `
            知识储备 +${knowledge}<br>
            身体健康 -${health}<br>
            心理状态 -${mood}
        `;
        overlay.classList.remove('hidden');

        // Update Main Game
        this.pendingResult = { k: knowledge, h: health, m: mood };
        
        const originalReturn = this.mainGame.returnToLobby;
        this.mainGame.returnToLobby = () => {
            this.mainGame.completeLevel(this.pendingResult.k, this.pendingResult.h, this.pendingResult.m);
            this.mainGame.returnToLobby = originalReturn; 
            originalReturn.call(this.mainGame);
        };
    }
}

const game = new Game();
