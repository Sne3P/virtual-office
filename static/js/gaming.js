var config = {
    type: Phaser.AUTO,
    width: 1000,
    height: 650,
    physics: {
        default: 'arcade',
        arcade: { debug: false }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var game = new Phaser.Game(config);

var player;
var cursors;
var bullets;
var aliens;
var spaceKey;
var canShoot = true;

function preload() {
    this.load.image('space', '/static/images/space.png');
    this.load.spritesheet('alien', '/static/images/alien.png', { frameWidth: 1280, frameHeight: 649 });
    this.load.image('ship', 'https://labs.phaser.io/assets/sprites/ufo.png');
    this.load.image('laser', 'https://labs.phaser.io/assets/sprites/bullet.png');
}

function create() {
    // Ajuster le fond à la taille de l'écran
    let background = this.add.image(0, 0, 'space').setOrigin(0, 0);
    background.setDisplaySize(this.sys.game.config.width, this.sys.game.config.height);
    background.setDepth(-1);

    player = this.physics.add.image(400, 550, 'ship');
    player.setCollideWorldBounds(true);
    player.setDepth(1);
    player.setScale(1.4);

    bullets = this.physics.add.group();
    
    aliens = this.physics.add.group();
    spawnAliens(8);
    
    cursors = this.input.keyboard.createCursorKeys();
    spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    
    this.physics.add.overlap(bullets, aliens, hitAlien, null, this);
    spaceKey.on('up', shoot, this);
    
    this.time.addEvent({ delay: 2000, callback: spawnAlien, callbackScope: this, loop: true });
}

function update() {
    if (cursors.left.isDown) {
        player.setVelocityX(-300);
    } else if (cursors.right.isDown) {
        player.setVelocityX(300);
    } else {
        player.setVelocityX(0);
    }
}

function shoot() {
    if (canShoot) {
        var bullet = bullets.create(player.x, player.y - 20, 'laser');
        if (bullet) {
            bullet.setActive(true);
            bullet.setVisible(true);
            bullet.setVelocityY(-400);
            bullet.setCollideWorldBounds(true);
            bullet.body.onWorldBounds = true;
            bullet.body.world.on('worldbounds', function (body) {
                if (body.gameObject === bullet) {
                    bullet.destroy();
                }
            });
        }
    }
}

function hitAlien(bullet, alien) {
    bullet.destroy();
    alien.setVelocity(0, 0);
    this.tweens.add({
        targets: alien,
        alpha: 0,
        ease: 'Linear',
        duration: 500,
        onComplete: () => alien.destroy()
    });
}

function spawnAliens(count) {
    for (let i = 0; i < count; i++) {
        spawnAlien();
    }
}

function spawnAlien() {
    let alien = aliens.create(Phaser.Math.Between(50, 750), Phaser.Math.Between(50, 150), 'alien');
    alien.setDepth(1);
    alien.setVelocityX(Phaser.Math.Between(-100, 100));
    alien.setVelocityY(Phaser.Math.Between(-20, 20));
    alien.setBounce(1, 1);
    alien.setCollideWorldBounds(true);
    alien.setScale(0.05);
}
