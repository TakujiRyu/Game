const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d')

canvas.width = 1024
canvas.height = 576

c.fillRect(0, 0, canvas.width, canvas.height)

const gravity = 0.7

const background = new Sprite({
    position: {
        x: 0,
        y: 0
    },
    imageSrc: 'Game Assets/background.png'
})

const player = new Fighter ({
    position: {
        x: 0,
        y: 0
    },
    velocity: {
        x: 0,
        y: 10
    },
    imageSrc: './Game Assets/Huntress/idle.png',
    framesMax: 8,
    scale: 3.6,
    offset: {
        x: 215,
        y: 125
    },
    sprites: {
        idle: {
            imageSrc: './Game Assets/Huntress/Idle.png',
            framesMax: 8
        },
        run: {
            imageSrc: './Game Assets/Huntress/Run.png',
            framesMax: 8
        },
        jump: {
            imageSrc: './Game Assets/Huntress/Jump.png',
            framesMax: 2
        },
        fall: {
            imageSrc: './Game Assets/Huntress/Fall.png',
            framesMax: 2
        },
        attack1: {
            imageSrc: './Game Assets/Huntress/Attack1.png',
            framesMax: 5
        },
        takeHit: {
            imageSrc: './Game Assets/Huntress/Take Hit.png',
            framesMax: 3
        },
        death: {
            imageSrc: './Game Assets/Huntress/Death.png',
            framesMax: 8
        }
    },
    attackBox: {
        offset: {
            x: 40,
            y: 100
        },
        width: 100,
        height: 50
    }
})

const enemy = new Fighter ({
    position: {
        x: 800,
        y: 100
    },
    velocity: {
        x: 0,
        y: 0
    },
    imageSrc: './Game Assets/Martial Hero 3/Idle.png',
    framesMax: 10,
    scale: 3,
    offset: {
        x: 140,
        y: 160
    },
    sprites: {
        idle: {
            imageSrc: './Game Assets/Martial Hero 2/Idle.png',
            framesMax: 4
        },
        run: {
            imageSrc: './Game Assets/Martial Hero 2/Run.png',
            framesMax: 8
        },
        jump: {
            imageSrc: './Game Assets/Martial Hero 2/Jump.png',
            framesMax: 2
        },
        fall: {
            imageSrc: './Game Assets/Martial Hero 2/Fall.png',
            framesMax: 2
        },
        attack1: {
            imageSrc: './Game Assets/Martial Hero 2/Attack1.png',
            framesMax: 4
        },
        takeHit: {
            imageSrc: './Game Assets/Martial Hero 2/Take Hit.png',
            framesMax: 3
        },
        death: {
            imageSrc: './Game Assets/Martial Hero 2/Death.png',
            framesMax: 7
        }
    },
    attackBox: {
        offset: {
            x: -140,
            y: 100
        },
        width: 10000,
        height: 50
    }
})

console.log(player)

const keys = {
    a: {
        pressed: false
    },
    d: {
        pressed: false
    },
    ArrowRight: {
        pressed: false
    },
    ArrowLeft: {
        pressed: false
    }
}

decreaseTimer()

function animate() {
    window.requestAnimationFrame(animate)
    c.fillStyle = 'black'
    c.fillRect(0, 0, canvas.width, canvas.height)
    background.update()
    c.fillStyle = 'rgba(255, 255, 255, 0.1)'
    c.fillRect(0, 0, canvas.width, canvas.height)
    player.update()
    enemy.update()

    player.velocity.x = 0
    enemy.velocity.x = 0

    // Player Movement
    if (keys.a.pressed && player.lastKey === 'a') {
        player.velocity.x = -5
        player.switchSprite('run')
    } else if (keys.d.pressed && player.lastKey === 'd') {
        player.velocity.x = 5
        player.switchSprite('run')
    } else {
        player.switchSprite('idle')
    }

    // Jumping
    if (player.velocity.y < 0) {
        player.switchSprite('jump')
    } else if (player.velocity.y > 0) {
        player.switchSprite('fall')
    }

    // Enemy Movement
    if (keys.ArrowLeft.pressed && enemy.lastKey === 'ArrowLeft') {
        enemy.velocity.x = -5
        enemy.switchSprite('run')
    } else if (keys.ArrowRight.pressed && enemy.lastKey === 'ArrowRight') {
        enemy.velocity.x = 5
        enemy.switchSprite('run')
    } else {
        enemy.switchSprite('idle')
    }

    // Jumping
    if (enemy.velocity.y < 0) {
    enemy.switchSprite('jump')
    } else if (enemy.velocity.y > 0) {
    enemy.switchSprite('fall')
    }

    // Detect For Collision & Enemy Gets Hit
    if (
        rectangularCollision({
            rectangle1: player,
            rectangle2: enemy
        }) &&
        player.isAttacking && 
        player.framesCurrent === 1
    ) {
        enemy.takeHit()
        player.isAttacking = false
        document.querySelector('#enemyHealth').style.width = enemy.health + '%'
    }

    // If Player Misses
    if (player.isAttacking && player.framesCurrent === 3) {
        player.isAttacking = false
    }

    // Detect For Collision & Player Gets Hit
    if (
        rectangularCollision({
            rectangle1: enemy,
            rectangle2: player
        }) &&
        enemy.isAttacking &&
        enemy.framesCurrent === 2
    ) {
        player.takeHit()
        enemy.isAttacking = false
        document.querySelector('#playerHealth').style.width = player.health + '%'
    }

    // If Enemy Misses
    if (enemy.isAttacking && enemy.framesCurrent === 2) {
        enemy.isAttacking = false
    }

    // End Game Based on Health
    if (enemy.health <= 0 || player.health <= 0) {
        determineWinner({player, enemy, timerId})
    }
}

animate()

window.addEventListener('keydown', (event) => {
    if (!player.dead) {
        switch (event.key) {
            case 'd':
                keys.d.pressed = true
                player.lastKey = 'd'
                break
            case 'a':
                keys.a.pressed = true
                player.lastKey = 'a'
                break
            case 'w':
                player.velocity.y = -20
                break
            case ' ':
                player.attack()
                break
        }
    }

    if (!enemy.dead) {
        switch (event.key) {                
            case 'ArrowRight':
                keys.ArrowRight.pressed = true
                enemy.lastKey = 'ArrowRight'
                break
            case 'ArrowLeft':
                keys.ArrowLeft.pressed = true
                enemy.lastKey = 'ArrowLeft'
                break
            case 'ArrowUp':
                enemy.velocity.y = -20
                break
            case 'ArrowDown':
                enemy.attack()
                break
        }
    }
    
})

window.addEventListener('keyup', (event) => {
    // Player Keys
    switch (event.key) {
        case 'd':
            keys.d.pressed = false
            break
        case 'a':
            keys.a.pressed = false
            break
    }

    // Enemy Keys
    switch (event.key) {
        case 'ArrowRight':
            keys.ArrowRight.pressed = false
            break
        case 'ArrowLeft':
            keys.ArrowLeft.pressed = false
            break
    }
})