const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 960;
canvas.height = 560;

const introMusic = new Audio('https://raw.githubusercontent.com/Swillycoder/Namageddon/main/helicopter.mp3')
const music = new Audio('https://raw.githubusercontent.com/Swillycoder/Namageddon/main/sacrifice.mp3');
const gunshot = new Audio('https://raw.githubusercontent.com/Swillycoder/Namageddon/main/gunshot2.mp3');
const grenade_snd = new Audio('https://raw.githubusercontent.com/Swillycoder/Namageddon/main/airstrike.mp3');
const airstrike_snd = new Audio('https://raw.githubusercontent.com/Swillycoder/Namageddon/main/airstrike.mp3');
const voice1 = new Audio('https://raw.githubusercontent.com/Swillycoder/Namageddon/main/voice1.mp3');
const voice2 = new Audio('https://raw.githubusercontent.com/Swillycoder/Namageddon/main/voice2.mp3')

introMusic.loop = true;
music.loop = true;
music.volume = 0.2;
gunshot.volume = 0.3;


const images = {
    soldier: 'https://raw.githubusercontent.com/Swillycoder/Namageddon/main/soldier.png',
    map_img: 'https://raw.githubusercontent.com/Swillycoder/Namageddon/main/clearing.png',
    tree1_img: 'https://raw.githubusercontent.com/Swillycoder/Namageddon/main/tree1.png',
    trees2_img: 'https://raw.githubusercontent.com/Swillycoder/Namageddon/main/tree2.png',
    trees3_img: 'https://raw.githubusercontent.com/Swillycoder/Namageddon/main/trees4.png',
    tower_img: 'https://raw.githubusercontent.com/Swillycoder/Namageddon/main/watch_tower.png',
    vietkong1_img: 'https://raw.githubusercontent.com/Swillycoder/Namageddon/main/vietkong1.png',
    grenade_img: 'https://raw.githubusercontent.com/Swillycoder/Namageddon/main//grenade_img.png',
    grenade: 'https://raw.githubusercontent.com/Swillycoder/Namageddon/main/grenade.png',
    missile_img: 'https://raw.githubusercontent.com/Swillycoder/Namageddon/main/missile_img.png',
    missile: 'https://raw.githubusercontent.com/Swillycoder/Namageddon/main/missile.png',
    airstrike_img: 'https://raw.githubusercontent.com/Swillycoder/Namageddon/main/airstrike_img.png',
    airdrop_img: 'https://raw.githubusercontent.com/Swillycoder/Namageddon/main/airdrop.png',
    explosion_img: 'https://raw.githubusercontent.com/Swillycoder/Namageddon/main/explosion_img.png',
    bomber_img: 'https://raw.githubusercontent.com/Swillycoder/Namageddon/main/bomber_img.png',
    preintro_img: 'https://raw.githubusercontent.com/Swillycoder/Namageddon/main/preintro.png',
    intro_img: 'https://raw.githubusercontent.com/Swillycoder/Namageddon/main/intro.png',
    PVT_img: 'https://raw.githubusercontent.com/Swillycoder/Namageddon/main/1PV2.png',
    PVT2_img: 'https://raw.githubusercontent.com/Swillycoder/Namageddon/main/2PFC.png',
    SPC_img: 'https://raw.githubusercontent.com/Swillycoder/Namageddon/main/3SPC.png',
    CPL_img: 'https://raw.githubusercontent.com/Swillycoder/Namageddon/main/4CPL.png',
    SGT_img: 'https://raw.githubusercontent.com/Swillycoder/Namageddon/main/5SGT.png',
    SFC_img: 'https://raw.githubusercontent.com/Swillycoder/Namageddon/main/6SFC.png',
    gameover_img: 'https://raw.githubusercontent.com/Swillycoder/Namageddon/main/gameover.png',
    medalofhonor: 'https://raw.githubusercontent.com/Swillycoder/Namageddon/main/medalofhonor.png',
};

function loadImages(callback) {
    let loadedImages = 0;
    const totalImages = Object.keys(images).length;

    for (const key in images) {
        const img = new Image();
        img.onload = () => {
            loadedImages++;
            images[key] = img;  // Replace URL with the loaded image object
            if (loadedImages === totalImages) {
                callback();
            }
        };
        img.src = images[key];
    }
}

let targetX = null;
let targetY = null;
let leftMousePressed = false;
let rightMousePressed = false;
let middleMousePressed = false;
let mousePos = { x: 0, y: 0 };

class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 20; // Width of a single sprite
        this.height = 28; // Height of a single sprite
        this.speed = 1.75;
        this.projectiles = [];
        this.projectileRange = 100;
        this.hp = 100;
        this.lastShotTime = 0;
        this.fireRate = 300;
        this.isFiring = false;

        this.powerups = {
        grenades : 1,
        missiles : 1,
        airstrike : 1,
        }
        this.selectedIndex = 0;
        this.selectorY = 50;

        this.grenades = [];
        this.missiles = [];
        this.airstrike = [];
        

        this.currentDirection = 'W'; // Default direction
        // Mapping directions to sprite positions (column index in sprite sheet)
        this.spriteMap = {
            N: 6,
            NE: 7,
            E: 0,
            SE: 1,
            S: 2,
            SW: 3,
            W: 4,
            NW: 5,
        };
    }

    draw() {
        const spriteIndex = this.spriteMap[this.currentDirection];
        const spriteX = spriteIndex * this.width; // X position of the sprite in the sheet
        const spriteY = 0; // Assuming all sprites are on the first row

        ctx.drawImage(
            images.soldier, // Source image (sprite sheet)
            spriteX, // X position of the sprite in the sheet
            spriteY, // Y position of the sprite in the sheet
            this.width, // Width of the sprite
            this.height, // Height of the sprite
            this.x - this.width / 2, // Destination X position on canvas
            this.y - this.height / 2, // Destination Y position on canvas
            this.width, // Drawn width
            this.height // Drawn height
        );
        //Draw projectiles
        ctx.fillStyle = 'black';
        this.projectiles.forEach(p => {
            p.x += p.speed * Math.cos(p.angle);
            p.y += p.speed * Math.sin(p.angle);
            ctx.beginPath();
            ctx.arc(p.x, p.y, 2, 0, Math.PI*2);
            ctx.closePath();
            ctx.fill();

        });
        //Draw Healthbar
        ctx.fillStyle = 'black';
        ctx.fillRect(this.x - 15, this.y +16, 30, 5);
        ctx.fillStyle = 'lime';
        ctx.fillRect(this.x - 15, this.y + 16, (this.hp / 100) * 30, 5);
    }

    drawPowerups(){
        ctx.drawImage(images.grenade_img, canvas.width - 75, 50);
        ctx.drawImage(images.missile_img, canvas.width - 75, 125);
        ctx.drawImage(images.airstrike_img, canvas.width - 75, 200);
        ctx.fillStyle = 'white';  // Color for the text (optional, to make it visible)
        ctx.font = 'bold 20px Courier New';  // Font style for the number (optional)
        ctx.fillText(`${this.powerups.grenades}`, canvas.width - 78, 45);
        ctx.fillText(`${this.powerups.missiles}`, canvas.width - 78, 120);
        ctx.fillText(`${this.powerups.airstrike}`, canvas.width - 78, 195);

        ctx.strokeStyle = 'blue';
        ctx.lineWidth = 4;
        ctx.setLineDash([]); // Solid line
        ctx.strokeRect(canvas.width - 75, this.selectorY, 50, 50);
    }

    updateDirection(mouseX, mouseY) {
        const dx = mouseX - this.x;
        const dy = mouseY - this.y;
        const angle = Math.atan2(dy, dx);

        // Update the direction based on angle
        if (angle >= -Math.PI / 8 && angle < Math.PI / 8) this.currentDirection = 'S';
        else if (angle >= Math.PI / 8 && angle < 3 * Math.PI / 8) this.currentDirection = 'SW';
        else if (angle >= 3 * Math.PI / 8 && angle < 5 * Math.PI / 8) this.currentDirection = 'W';
        else if (angle >= 5 * Math.PI / 8 && angle < 7 * Math.PI / 8) this.currentDirection = 'NW';
        else if (angle >= 7 * Math.PI / 8 || angle < -7 * Math.PI / 8) this.currentDirection = 'N';
        else if (angle >= -7 * Math.PI / 8 && angle < -5 * Math.PI / 8) this.currentDirection = 'NE';
        else if (angle >= -5 * Math.PI / 8 && angle < -3 * Math.PI / 8) this.currentDirection = 'E';
        else if (angle >= -3 * Math.PI / 8 && angle < -Math.PI / 8) this.currentDirection = 'SE';
    }

    fireProjectile() {
        const currentTime = Date.now();
        if (currentTime - this.lastShotTime >= this.fireRate) {
            gunshot.play();
            const angleToMouse = Math.atan2(mousePos.y - this.y, mousePos.x - this.x);
            this.projectiles.push({
                x: this.x,
                y: this.y,
                angle: angleToMouse,
                distance: 0,
                speed: 4
            });
            this.lastShotTime = currentTime; // Update last shot time
        }
    }

    updateProjectiles() {
        this.projectiles = this.projectiles.filter(p => p.distance < this.projectileRange);
        this.projectiles.forEach(p => {
            p.x += p.speed * Math.cos(p.angle);
            p.y += p.speed * Math.sin(p.angle);
            p.distance += p.speed;
        });
    }

    fireGrenade () {
        const angleToMouse = Math.atan2(mousePos.y - this.y, mousePos.x - this.x);
        this.grenades.push({
            x: this.x,
            y: this.y,
            angle: angleToMouse,
            distance: 0,
            speed: 4,
            lastFrameTime: 0,
            explosionFrame: 0,
            range: 150,
            blast: 50
        });
    }

    updateGrenades() {
        const currentTime = performance.now();
        this.grenades.forEach(g => {
            
            g.x += g.speed * Math.cos(g.angle);
            g.y += g.speed * Math.sin(g.angle);
            g.distance += g.speed;

            ctx.drawImage(images.grenade, g.x, g.y);


            if (g.distance >= g.range - 15) {
                if (g.explosionFrame !== null) {
                    if (currentTime - g.lastFrameTime >= 60) {  // Change frame every 100ms (adjust for slower/faster animation)
                        g.explosionFrame++;
                        g.lastFrameTime = currentTime;
                    }
        
                    if (g.explosionFrame < 6) {
                        grenade_snd.play()
                        ctx.drawImage(
                            images.explosion_img,
                            g.explosionFrame * 100, 0, 100, 100, // Source rectangle on the sprite sheet
                            g.x - 50, g.y - 50, 100, 100      // Destination rectangle on the canvas
                        );
                    } else {
                        this.grenades.splice(this.grenades.indexOf(g), 1); // Remove bomb once animation completes
                    }
                } else {
                    g.explosionFrame = 0;
                    g.lastFrameTime = currentTime;
                }
                for (let i = enemies.length - 1; i >= 0; i--) { 
                    const enemy = enemies[i];
                    const dx = enemy.x - g.x;
                    const dy = enemy.y - g.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance <= g.blast) {
                        killCount += 1;
                        console.log("Enemy hit!");
                        enemies.splice(i, 1); // Remove enemy from the array
                    }
                }
            }
        }); 
    }
    
    fireMissile() {
        const angleToMouse = Math.atan2(mousePos.y - this.y, mousePos.x - this.x);
        this.missiles.push({
            x: this.x,
            y: this.y,
            targetX: mousePos.x,
            targetY: mousePos.y,
            angle: angleToMouse,
            speed: 4,
            lastFrameTime: 0,
            explosionFrame: 0,
            blast: 50,
        });
    }

    updateMissiles() {
        const currentTime = performance.now();
        this.missiles.forEach((m, index) => {
            const dx = m.targetX - m.x;
            const dy = m.targetY - m.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            ctx.save();
            ctx.translate(m.x, m.y);
            const angle = Math.atan2(dy, dx);
            ctx.rotate(angle);
            ctx.drawImage(images.missile, -images.missile.width / 2, -images.missile.height / 2);
            ctx.restore();
    
            if (distance > 5) {
                // Move missile toward target
                //const angle = Math.atan2(dy, dx);
                m.x += m.speed * Math.cos(angle);
                m.y += m.speed * Math.sin(angle);
            } else {
                // Trigger explosion at target position if not already triggered
                if (m.explosionFrame === undefined) {
                    m.explosionFrame = 0;
                    m.lastFrameTime = currentTime;
                }
    
                // Draw explosion animation
                if (m.explosionFrame < 6) {
                    grenade_snd.play();
                    ctx.drawImage(
                        images.explosion_img,
                        m.explosionFrame * 100, 0, 100, 100,  // Sprite sheet source rectangle
                        m.x - 50, m.y - 50, 100, 100         // Destination on canvas
                    );
    
                    // Update frame if enough time has passed
                    if (currentTime - m.lastFrameTime > 100) {
                        m.explosionFrame++;
                        m.lastFrameTime = currentTime;
                    }
                } else {
                    // Remove missile once animation is complete
                    this.missiles.splice(index, 1);
                    return;  // Skip further checks for this missile
                }
            }
    
            // Check for collision with enemies (only after reaching the target)
            for (let i = enemies.length - 1; i >= 0; i--) {
                const enemy = enemies[i];
                const ex = enemy.x - m.x;
                const ey = enemy.y - m.y;
                const enemyDistance = Math.sqrt(ex * ex + ey * ey);
    
                if (enemyDistance <= m.blast && m.explosionFrame > 1) {
                    // Enemy hit
                    killCount++;
                    console.log("Enemy hit!");
                    enemies.splice(i, 1);
                }
            }
        });
    }

    checkCollisions(enemies) {
        this.projectiles.forEach((projectile, index) => {
            enemies.forEach(enemy => {
                const enemyLeft = enemy.x - enemy.width / 2;
                const enemyRight = enemy.x + enemy.width / 2;
                const enemyTop = enemy.y - enemy.height / 2;
                const enemyBottom = enemy.y + enemy.height / 2;
    
            // Check if the projectile's position is within the player's bounds
                if (
                    projectile.x >= enemyLeft &&
                    projectile.x <= enemyRight &&
                    projectile.y >= enemyTop &&
                    projectile.y <= enemyBottom
                ) {
                    this.handleHit(index, enemy, enemies);  // Handle the collision if the projectile hits the player
                }
            });
        });
    };

    collectPowerup (powerups) {
        for (let i = powerups.length - 1; i >= 0; i--) {
            const powerup = powerups[i];
            const dx = this.x - powerup.x;
            const dy = this.y - powerup.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
        
            if (distance <= (this.width / 2 + powerup.radius)) {
                this.hp += 10;
                const powerupType = Math.floor(Math.random() * 3);  // Generates 0, 1, or 2
            
                if (powerupType === 0) {
                    this.powerups.grenades += 1;
                } else if (powerupType === 1) {
                    this.powerups.missiles += 1; 
                } else {
                    this.powerups.airstrike += 1;
                }
                powerups.splice(i, 1); // Remove power-up from array
                //this.powerups += 1;
            }
        }
    }

    handleHit(projectileIndex, enemy, enemies) {
        // Reduce the enemy's health (for example, 10 damage per hit)
        enemy.hp -= 10;
        
        if (enemy.hp <= 0) {
            enemy.hp = 0;  // Ensure health doesn't go below 0
            // Find the index of the enemy in the enemies array
            const enemyIndex = enemies.indexOf(enemy);
            if (enemyIndex !== -1) {
                // Remove the enemy from the enemies array
                enemies.splice(enemyIndex, 1);
                killCount += 1;
                totalKills += 1;
                console.log(`Kill Count: ${killCount}`);
            }
        }
 
        this.projectiles.splice(projectileIndex, 1);
    }

    move() {
        if (targetX !== null && targetY !== null) {
            const dx = targetX - this.x;
            const dy = targetY - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
    
            if (distance > this.speed) {
                let nextX = this.x + (dx / distance) * this.speed;
                let nextY = this.y + (dy / distance) * this.speed;
    
                // Check collision with all obstacles before moving
                let collisionX = obstacles.some(obstacle => isColliding({ ...this, x: nextX, y: this.y }, obstacle));
                let collisionY = obstacles.some(obstacle => isColliding({ ...this, x: this.x, y: nextY }, obstacle));
    
                if (!collisionX) {
                    this.x = nextX;
                }
                if (!collisionY) {
                    this.y = nextY;
                }
            } else {
                this.x = targetX;
                this.y = targetY;
                targetX = null;
                targetY = null;
            }
        }
    }

    update(enemy, powerups) {
        if (this.hp >= 100) {
            this.hp = 100;
        }

        if (this.isFiring) {
            this.fireProjectile();
        }
        this.updateProjectiles();
        this.updateGrenades();
        this.updateMissiles();
        this.move();
        this.checkCollisions(enemy);
        this.collectPowerup(powerups)
        this.draw();
        this.drawPowerups();
    }
}

class Enemy {
    constructor (x,y, width, height, spriteSheet, speed) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.speed = speed
        this.hp = 100
        this.spriteSheet = spriteSheet
        this.currentDirection = 'RIGHT';
        this.projectiles = [];
        this.projectileRange = 100;
        this.lastFireTime = 0; // To track the last time a projectile was fired
        this.fireDelay = 1000 * Math.random() + 500; // 0.5 second delay (in milliseconds)

        this.spriteMap = {
            LEFT: 0,
            RIGHT: 1,
        };
    }

    updateDirection(player) {
        let dx = player.x - this.x;
    
        // If dx > 0, player is to the right; if dx < 0, player is to the left
        if (dx > 0) {
            this.currentDirection = 'RIGHT';
        } else if (dx < 0) {
            this.currentDirection = 'LEFT';
        }
    }

    fireProjectile(player) {
        const angleToPlayer = Math.atan2(player.y - this.y, player.x - this.x);
    
        // Add a random variation to the angle (±PI/8)
        const accuracyVariation = Math.random() * (Math.PI / 4) - (Math.PI / 8); // Random value between -PI/16 and +PI/16
        const randomAngle = angleToPlayer + accuracyVariation;
    
        this.projectiles.push({
            x: this.x,
            y: this.y,
            angle: randomAngle,
            distance: 0,
            speed: 1.5
        });
    }

    updateProjectiles() {
        this.projectiles = this.projectiles.filter(p => p.distance < this.projectileRange);
        this.projectiles.forEach(p => {
            p.x += p.speed * Math.cos(p.angle);
            p.y += p.speed * Math.sin(p.angle);
            p.distance += p.speed;
        });
    }

    checkCollisions(player) {
        this.projectiles.forEach((projectile, index) => {
            const playerLeft = player.x - player.width / 2;
            const playerRight = player.x + player.width / 2;
            const playerTop = player.y - player.height / 2;
            const playerBottom = player.y + player.height / 2;
    
            // Check if the projectile's position is within the player's bounds
            if (
                projectile.x >= playerLeft &&
                projectile.x <= playerRight &&
                projectile.y >= playerTop &&
                projectile.y <= playerBottom
            ) {
                this.handleHit(index, player);  // Handle the collision if the projectile hits the player
            }
        });
    }

    handleHit(projectileIndex, player) {
        // Reduce the player's health (for example, 10 damage per hit)
        player.hp -= 2;
        if (player.hp <= 0) {
            player.hp = 0;  // Ensure health doesn't go below 0
            // Trigger player death, respawn, etc. (you can add this logic here)
        }
    
        // Remove the projectile from the projectiles array
        this.projectiles.splice(projectileIndex, 1);
    }

    draw () {
        const spriteIndex = this.spriteMap[this.currentDirection];
        const spriteX = spriteIndex * this.width; // X position of the sprite in the sheet
        const spriteY = 0; // Assuming all sprites are on the first row

        ctx.drawImage(
            this.spriteSheet, // Source image (sprite sheet)
            spriteX, // X position of the sprite in the sheet
            spriteY, // Y position of the sprite in the sheet
            this.width, // Width of the sprite
            this.height, // Height of the sprite
            this.x - this.width / 2, // Destination X position on canvas
            this.y - this.height / 2, // Destination Y position on canvas
            this.width, // Drawn width
            this.height // Drawn height
        );

        ctx.fillStyle = 'black';
        this.projectiles.forEach(p => {
            p.x += p.speed * Math.cos(p.angle);
            p.y += p.speed * Math.sin(p.angle);
            ctx.beginPath();
            ctx.arc(p.x, p.y, 2, 0, Math.PI*2);
            ctx.closePath();
            ctx.fill();
        });

        //Health bar
        ctx.fillStyle = 'black';
        ctx.fillRect(this.x - 15, this.y +16, 30, 5);
        ctx.fillStyle = 'lime';
        ctx.fillRect(this.x - 15, this.y + 16, (this.hp / 100) * 30, 5);
    }

    move (player) {
        let dx = player.x - this.x;
        let dy = player.y - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 1) { // Prevent jitter when very close
            this.x += (dx / distance) * this.speed;
            this.y += (dy / distance) * this.speed;
        }
    }

    update (player) {
        this.updateDirection(player);
        this.updateProjectiles()
        this.move (player);
        this.checkCollisions(player);
        this.draw ();

        const currentTime = Date.now();
        if (currentTime - this.lastFireTime >= this.fireDelay) {
            this.fireProjectile(player);
            this.lastFireTime = currentTime; // Update the last fire time
        }
    }
}

class Obstacle {
    constructor (x,y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        
    }

    draw () {
        ctx.drawImage(images.tower_img, this.x, this.y - 20 )
    }
}

class Powerup {
    constructor (x,y) {
        this.x = x;
        this.y = y;
        this.radius = 30;
        this.image = images.airdrop_img
    }

    draw () {
        ctx.drawImage(this.image, this.x, this.y)
    }
    update () {
        this.y += 0.9;
        this.x += 6 * Math.sin(0.05 * this.y);
        this.draw();


    }
}

const keys = {
    KeyP: false,
    Enter: false,
    Space: false,
};

const player = new Player(450, 200);
const enemies = [];
let powerups = [];
const obstacles = [
    new Obstacle(200, 230, 65, 85),
    new Obstacle(500, 350, 65, 85),
    new Obstacle(700, 150, 65, 85),
];

function preIntro() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(images.preintro_img,0,0)
}

function introScreen() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(images.intro_img, 0,0)
    //ctx.textAlign = 'center'
    //ctx.fillStyle = 'white'
    //ctx.font ='bold 50px Courier New'
    //ctx.fillText('Press SPACE to continue', canvas.width/2, 100)
}

function gameOverScreen() {
    music.pause();
    enemies.length = 0
    gameOver = true
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    //ctx.fillStyle = 'green'
    //ctx.fillRect(0,0, canvas.width,canvas.height)
    ctx.drawImage(images.gameover_img, 0, 0)
    ctx.textAlign = 'center'
    ctx.fillStyle = 'white'
    ctx.font ='bold 30px Courier New'
    ctx.fillText('Press P to restart', canvas.width/2, 30)
    ctx.font ='bold 70px Courier New'
    ctx.fillText('KILLS', canvas.width/2, 110)
    ctx.fillStyle = 'red'
    ctx.fillText(`${totalKills}`, canvas.width/2, 195)
    ctx.fillStyle = 'white'
    ctx.font ='50px Impact'
    if (totalKills >= 20 && totalKills <= 40) {
        ctx.fillText('PRIVATE', canvas.width/2, 275)
        ctx.drawImage(images.PVT_img, canvas.width/2 - 75, 290)
    }
    if (totalKills >= 41 && totalKills <= 60) {
        ctx.fillText('PRIVATE 1st CLASS', canvas.width/2, 275)
        ctx.drawImage(images.PVT2_img, canvas.width/2 - 75, 290)
    }
    if (totalKills >= 61 && totalKills <= 70) {
        ctx.fillText('SPECIALIST', canvas.width/2, 275)
        ctx.drawImage(images.SPC_img, canvas.width/2 - 75, 290)
    }
    if (totalKills >= 71 && totalKills <= 80) {
        ctx.fillText('CORPORAL', canvas.width/2, 275)
        ctx.drawImage(images.CPL_img, canvas.width/2 - 75, 290)
    }
    if (totalKills >= 81 && totalKills <= 90) {
        ctx.fillText('SARGEANT', canvas.width/2, 275)
        ctx.drawImage(images.SGT_img, canvas.width/2 - 75, 290)
    }
    if (totalKills >= 91 && totalKills <= 99) {
        ctx.fillText('SARGEANT 1st CLASS', canvas.width/2, 275)
        ctx.drawImage(images.SFC_img, canvas.width/2 - 75, 290)

    }
    if (totalKills >= 100) {
        voice2.loop = false
        voice2.play();
        introMusic.play();
        ctx.fillText('SARGEANT 1st CLASS', canvas.width/2, 275)
        ctx.drawImage(images.SFC_img, canvas.width/2 - 75, 290)
        ctx.drawImage(images.medalofhonor, 0, 0)
        ctx.drawImage(images.medalofhonor, canvas.width - 300, 0)
    }
}

// Function to generate a random Y position
function getRandomY() {
    return Math.random() * 560;
}



let enemyCount = 4; // Initial enemy count per side

function spawnEnemies() {
    enemyCount++; // Increase enemy count per respawn
    const newEnemies = [];

    function getRandomY() {
        return Math.random() * 560;
    }

    // Spawn enemies to the left of the screen
    for (let i = 0; i < enemyCount; i++) {
        let enemyXspawnleft = 0 - Math.random() * 500;
        let enemyYspawn = getRandomY();
        let enemySpeed = 0.2 + Math.random() * 0.8;
        newEnemies.push(new Enemy(enemyXspawnleft, enemyYspawn, 20, 28, images.vietkong1_img, enemySpeed));
    }

    // Spawn enemies to the right of the screen
    for (let i = 0; i < enemyCount; i++) {
        let enemyXspawnright = 960 + Math.random() * 500;
        let enemyYspawn = getRandomY();
        let enemySpeed = 0.2 + Math.random() * 0.8;
        newEnemies.push(new Enemy(enemyXspawnright, enemyYspawn, 20, 28, images.vietkong1_img, enemySpeed));
    }
    enemies.push(...newEnemies); // Add new enemies to the array
}



function isColliding(player, obstacle) {
    return (
        player.x + player.width/2 > obstacle.x &&
        player.x - player.width/2 < obstacle.x + obstacle.width &&
        player.y + player.height/2 > obstacle.y &&
        player.y - player.height/2 < obstacle.y + obstacle.height
    );
}

function handleCollisions() {
    for (let i = 0; i < obstacles.length; i++) {
        if (isColliding(player, obstacles[i])) {
            // Collision response (adjust position if needed)
        }}
    for (let i = 0; i < enemies.length; i++) {
        if (isColliding(player, enemies[i])){
            player.hp -= 0.1
        }
    }
}

let airstrikeTarget = null;
let plane = null;
let bombs = [];
let bombsDropped = false;
const explosionFrameCount = 6;
const frameWidth = 100;
const frameHeight = 100;

function updatePlane () {
    if (airstrikeTarget) {
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(airstrikeTarget.x - 10, airstrikeTarget.y - 10);
        ctx.lineTo(airstrikeTarget.x + 10, airstrikeTarget.y + 10);
        ctx.moveTo(airstrikeTarget.x + 10, airstrikeTarget.y - 10);
        ctx.lineTo(airstrikeTarget.x - 10, airstrikeTarget.y + 10);
        ctx.stroke();
    }
    if (plane) {
        ctx.drawImage(images.bomber_img, plane.x, plane.y)

        plane.x += plane.speed;
        plane.y = airstrikeTarget.y - 50

        if (plane.x >= airstrikeTarget.x && !bombsDropped) {
            dropBombs(plane.x, airstrikeTarget.y);
            bombsDropped = true;
        }

        if (plane.x > canvas.width + 50) {
            plane = null; 
            airstrikeTarget = null;
            bombsDropped = false;
        }
    }

    updateBombs();
}

function dropBombs(x, y) {
    for (let i = 0; i < 4; i++) {
        bombs.push({
            x: x + i * 25,  // Spread the bombs along the x-axis
            y: y,
            lastFrameTime: 0,
            explosionFrame: 0,
            blast: 50
        });
    }
}

function updateBombs() {
    const currentTime = performance.now(); // Get the current time in milliseconds

    bombs.forEach(bomb => {
        if (bomb.explosionFrame !== null) {
            if (currentTime - bomb.lastFrameTime >= 100) {  // Change frame every 100ms (adjust for slower/faster animation)
                bomb.explosionFrame++;
                bomb.lastFrameTime = currentTime;
            }

            if (bomb.explosionFrame < 6) {
                ctx.drawImage(
                    images.explosion_img,
                    bomb.explosionFrame * 100, 0, 100, 100, // Source rectangle on the sprite sheet
                    bomb.x - 50, bomb.y - 50, 100, 100      // Destination rectangle on the canvas
                );
            } else {
                bombs.splice(bombs.indexOf(bomb), 1); // Remove bomb once animation completes
            }
        } else {
            bomb.explosionFrame = 0;
            bomb.lastFrameTime = currentTime;
        }
        for (let i = enemies.length - 1; i >= 0; i--) {
            const enemy = enemies[i];
            const ex = enemy.x - bomb.x;
            const ey = enemy.y - bomb.y;
            const enemyDistance = Math.sqrt(ex * ex + ey * ey);

            if (enemyDistance <= bomb.blast && bomb.explosionFrame > 1) {
                // Enemy hit
                airstrike_snd.play();
                killCount++;
                console.log("Enemy hit!");
                enemies.splice(i, 1);
            }
        }
    });
}

function airdropIndicator() {

    ctx.textAlign = 'center'
    ctx.fillStyle = 'white'
    ctx.font ='bold 20px Courier New'
    ctx.fillText('AIRDROP', canvas.width/2, 40)

    ctx.strokeStyle = 'white';
    ctx.lineWidth = 3;
    ctx.strokeRect(canvas.width/2 - 25,10,50,8);
    ctx.fillStyle = 'blue';
    ctx.fillRect(canvas.width/2 - 25, 10, 50, 8);
    ctx.fillStyle = 'red';
    ctx.fillRect(canvas.width/2 - 25, 10, (killCount / 10) * 50, 8);
}


let killCount = 0;
let totalKills = 0;
let gameOver = true;

function gameLoop() {
    if (!gameOver)
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'forestgreen';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(images.map_img, 0, 0)

        enemies.forEach(enemy => {
                enemy.update(player);
            });
        if (enemies.length === 0) {
                spawnEnemies();
            }

        player.update(enemies, powerups);

        obstacles.forEach(obstacle => {
            obstacle.draw();
        });

        if (killCount >= 10) {
            powerups.push(new Powerup(440, -100));
            killCount -= 10;
        }

        ctx.drawImage(images.tree1_img, 180, 80)
        ctx.drawImage(images.trees2_img, 700, 350)
        ctx.drawImage(images.trees3_img, 100, 400)
        ctx.drawImage(images.trees3_img, 500, 50)

        powerups = powerups.filter(powerup => {
            powerup.update();
        
            if (powerup.y - powerup.radius > canvas.height) {
                console.log('removed');
                return false; // Remove powerup from array
            }
            return true; // Keep powerup in array
        });

        updatePlane();
        handleCollisions();
        airdropIndicator();

        if (player.hp <= 0) {
            gameOver = true;
            gameOverScreen();
        }

        if (totalKills >= 100) {
            enemies.length = 0;
            gameOver = true;
            gameOverScreen();
        }

        requestAnimationFrame(gameLoop);
    }

loadImages(() => {
    //console.log("All images loaded!");
    preIntro();
});

// Mouse move: Update player direction
canvas.addEventListener('mousemove', (event) => {
    const rect = canvas.getBoundingClientRect();
    mousePos.x = event.clientX - rect.left;
    mousePos.y = event.clientY - rect.top;

    player.updateDirection(mousePos.x, mousePos.y);
});

canvas.addEventListener('contextmenu', (e) => e.preventDefault());

canvas.addEventListener('mousedown', (e) => {
    if (e.button === 0) {
        leftMousePressed = true;
        targetX = mousePos.x;
        targetY = mousePos.y;
    } 
    
    if (e.button === 2) {
        gunshot.play();
        player.isFiring = true;
        rightMousePressed = true;
    } 
    
    if (e.button === 1) {
        middleMousePressed = true;
        if (player.selectedIndex === 0 && player.powerups.grenades >= 1) {
            player.fireGrenade();
            player.powerups.grenades -= 1;
        }
        if (player.selectedIndex === 1 && player.powerups.missiles >= 1) {
            player.fireMissile();
            player.powerups.missiles -= 1;
        }
        if (player.selectedIndex === 2 && player.powerups.airstrike >= 1) {
            player.powerups.airstrike -= 1
            airstrikeTarget = { x: e.offsetX, y: e.offsetY };
            plane = {
                x: -50, // Starts off-screen
                y: targetY,
                speed: 3
            };
        }
    }
});

canvas.addEventListener('mouseup', (e) => {
    if (e.button === 0) leftMousePressed = false;
    if (e.button === 2) {
        player.isFiring = false;
        rightMousePressed = false;
        
    }
    if (e.button === 1) middleMousePressed = false;
});


canvas.addEventListener('wheel', (event) => {
    const powerupKeys = Object.keys(player.powerups);
    if (event.deltaY > 0) {
        // Scroll down
        player.selectedIndex = (player.selectedIndex + 1) % powerupKeys.length;
    } else {
        // Scroll up
        player.selectedIndex = (player.selectedIndex - 1 + powerupKeys.length) % powerupKeys.length;
    }

    // Update the selector Y position based on the selected index
    player.selectorY = 50 + player.selectedIndex * 75;
});

document.addEventListener('keydown', (e) => {
    if (keys.hasOwnProperty(e.code)) {
        keys[e.code] = true;
    }
    if (e.code === 'Enter' && gameOver) {
        introMusic.play();
        voice1.play();
        introScreen();
    }
    if (e.code === 'Space' && gameOver) {
        introMusic.pause();
        music.play();
        gameOver = false;
        gameLoop();
    }
    if (e.code === 'KeyP' && gameOver) {
        location.reload()
        }
});

document.addEventListener('keyup', (e) => {
    if (keys.hasOwnProperty(e.code)) {
        keys[e.code] = false;
    }
});
