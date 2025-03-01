class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    preload() {
        this.load.image('space', '/static/images/space.png');
    }

    create() {
        this.add.image(0, 0, 'space').setOrigin(0, 0).setDisplaySize(this.sys.game.config.width, this.sys.game.config.height);
        
        this.add.text(500, 200, 'ALIEN SHOOTER', { fontSize: '40px', fill: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);
        
        this.createButton(500, 300, 'Mode Arcade', '#0080ff', () => this.scene.start('ArcadeMode'));
        this.createButton(500, 400, 'Mode Survival', '#ff8000', () => this.scene.start('SurvivalMode'));
    }

    createButton(x, y, text, color, callback) {
        let button = this.add.text(x, y, text, {
            fontSize: '32px', fill: '#ffffff', backgroundColor: color, padding: { x: 20, y: 10 }, fontStyle: 'bold'
        })
        .setOrigin(0.5)
        .setInteractive()
        .on('pointerdown', callback)
        .on('pointerover', () => button.setStyle({ backgroundColor: Phaser.Display.Color.HexStringToColor(color).darken(20).saturate(20).color }))
        .on('pointerout', () => button.setStyle({ backgroundColor: color }));
    }
}

class ArcadeMode extends Phaser.Scene {
    constructor() {
        super({ key: 'ArcadeMode' });
    }

    preload() {
        this.load.image('ship', 'https://labs.phaser.io/assets/sprites/ufo.png');
        this.load.image('laser', 'https://labs.phaser.io/assets/sprites/bullet.png');
        this.load.image('alien', '/static/images/alien.png');
        this.load.image('space', '/static/images/space.png');
    }

    create() {
        this.add.image(0, 0, 'space').setOrigin(0, 0).setDisplaySize(this.sys.game.config.width, this.sys.game.config.height);
        
        this.player = this.physics.add.image(500, 550, 'ship').setCollideWorldBounds(true).setScale(1.4);
        this.bullets = this.physics.add.group({ classType: Phaser.Physics.Arcade.Image });
        this.aliens = this.physics.add.group();
        
        this.score = 0;
        this.scoreText = this.add.text(20, 20, 'Score: 0', { fontSize: '24px', fill: '#ffffff' }).setDepth(1);
        this.timerText = this.add.text(850, 20, 'Time: 30', { fontSize: '24px', fill: '#ffffff' }).setDepth(1);
        this.timeLeft = 30;
        
        this.cursors = this.input.keyboard.createCursorKeys();
        this.input.keyboard.on('keydown-SPACE', () => this.shoot());

        this.physics.add.overlap(this.bullets, this.aliens, this.hitAlien, null, this);

        for (let i = 0; i < 5; i++) {
            this.spawnAlien();
        }
        
        this.time.addEvent({ delay: 500, callback: this.spawnAlien, callbackScope: this, loop: true });
        this.time.addEvent({ delay: 1000, callback: this.updateTimer, callbackScope: this, loop: true });
        
        this.createPauseButton();
    }

    update() {
        this.player.setVelocityX(0);
        if (this.cursors.left.isDown) this.player.setVelocityX(-300);
        else if (this.cursors.right.isDown) this.player.setVelocityX(300);
    }

    shoot() {
        let bullet = this.bullets.create(this.player.x, this.player.y - 20, 'laser');
        if (bullet) bullet.setVelocityY(-400);
    }

    hitAlien(bullet, alien) {
        bullet.destroy();
        alien.setTint(0xff0000);
        this.time.delayedCall(200, () => {
            alien.clearTint();
            alien.destroy();
        });
        this.score += 10;
        this.scoreText.setText('Score: ' + this.score);
    }

    spawnAlien() {
        let alien = this.aliens.create(Phaser.Math.Between(50, 950), Phaser.Math.Between(50, 150), 'alien');
        alien.setVelocityX(Phaser.Math.Between(-100, 100));
        alien.setVelocityY(Phaser.Math.Between(-20, 20));
        alien.setBounce(1, 1).setCollideWorldBounds(true).setScale(0.05);
    }

    updateTimer() {
        this.timeLeft--;
        this.timerText.setText('Time: ' + this.timeLeft);
        if (this.timeLeft <= 0) {
            this.scene.start('GameOverScene', { score: this.score });
        }
    }

    createPauseButton() {
        let button = this.add.text(900, 60, 'Pause', {
            fontSize: '24px', fill: '#ffffff', backgroundColor: '#ff0000', padding: { x: 10, y: 5 }, fontStyle: 'bold'
        })
        .setOrigin(0.5)
        .setInteractive()
        .setDepth(1)
        .on('pointerdown', () => {
            this.scene.pause();
            this.scene.launch('PauseScene');
        })
        .on('pointerover', () => button.setStyle({ backgroundColor: '#cc0000' }))
        .on('pointerout', () => button.setStyle({ backgroundColor: '#ff0000' }));
    }
}

class PauseScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PauseScene' });
    }

    create() {
        let bg = this.add.graphics();
        bg.fillStyle(0x000000, 0.7);
        bg.fillRoundedRect(300, 180, 400, 300, 20);
        bg.setDepth(1);

        this.add.text(500, 250, 'Jeu en pause', { fontSize: '40px', fill: '#ffffff' })
            .setOrigin(0.5)
            .setDepth(2);

        this.createButton(500, 350, 'Reprendre', '#0080ff', () => {
            this.scene.resume('ArcadeMode');
            this.scene.stop();
        });

        this.createButton(500, 450, 'Menu Principal', '#ff0000', () => {
            this.scene.stop('ArcadeMode');
            this.scene.start('MenuScene');
        });
    }

    createButton(x, y, text, color, callback) {
        let button = this.add.text(x, y, text, {
            fontSize: '24px', fill: '#ffffff', backgroundColor: color, padding: { x: 20, y: 10 }, fontStyle: 'bold'
        })
        .setOrigin(0.5)
        .setInteractive()
        .setDepth(2)
        .on('pointerdown', callback)
        .on('pointerover', () => button.setStyle({ backgroundColor: Phaser.Display.Color.HexStringToColor(color).darken(20).saturate(20).color }))
        .on('pointerout', () => button.setStyle({ backgroundColor: color }));
    }
}

class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene' });
    }

    init(data) {
        this.score = data.score;
    }

    create() {
        let bg = this.add.graphics();
        bg.fillStyle(0x000000, 0.7);
        bg.fillRoundedRect(300, 180, 400, 300, 20);
        bg.setDepth(1);

        this.add.text(500, 250, `Score : ${this.score}`, { fontSize: '40px', fill: '#ffffff' })
            .setOrigin(0.5)
            .setDepth(2);

        this.createButton(500, 350, 'Rejouer', '#0080ff', () => {
            this.scene.start('ArcadeMode');
        });

        this.createButton(500, 450, 'Menu Principal', '#ff0000', () => {
            this.scene.start('MenuScene');
        });
    }

    createButton(x, y, text, color, callback) {
        let button = this.add.text(x, y, text, {
            fontSize: '24px', fill: '#ffffff', backgroundColor: color, padding: { x: 20, y: 10 }, fontStyle: 'bold'
        })
        .setOrigin(0.5)
        .setInteractive()
        .setDepth(2)
        .on('pointerdown', callback)
        .on('pointerover', () => button.setStyle({ backgroundColor: Phaser.Display.Color.HexStringToColor(color).darken(20).saturate(20).color }))
        .on('pointerout', () => button.setStyle({ backgroundColor: color }));
    }
}

class SurvivalMode extends Phaser.Scene {
    constructor() {
        super({ key: 'SurvivalMode' });
    }

    preload() {
        this.load.image('ship', 'https://labs.phaser.io/assets/sprites/ufo.png');
        this.load.image('laser', 'https://labs.phaser.io/assets/sprites/bullet.png');
        this.load.image('alien', '/static/images/alien.png');
        this.load.image('space', '/static/images/space.png');
        this.load.image('redLaser', 'https://labs.phaser.io/assets/sprites/bullet.png'); // Load red laser image
    }

    create() {
        this.add.image(0, 0, 'space').setOrigin(0, 0).setDisplaySize(this.sys.game.config.width, this.sys.game.config.height);
        
        this.player = this.physics.add.image(500, 550, 'ship').setCollideWorldBounds(true).setScale(1.4);
        this.bullets = this.physics.add.group({ classType: Phaser.Physics.Arcade.Image });
        this.alienBullets = this.physics.add.group({ classType: Phaser.Physics.Arcade.Image });
        this.aliens = this.physics.add.group();
        
        this.score = 0;
        this.lives = 5;
        this.scoreText = this.add.text(20, 20, 'Score: 0', { fontSize: '24px', fill: '#ffffff' }).setDepth(1);
        this.livesText = this.add.text(20, 50, 'Lives: 5', { fontSize: '24px', fill: '#ffffff' }).setDepth(1);
        this.timerText = this.add.text(850, 20, 'Time: 30', { fontSize: '24px', fill: '#ffffff' }).setDepth(1);
        this.timeLeft = 30;
        
        this.cursors = this.input.keyboard.createCursorKeys();
        this.input.keyboard.on('keydown-SPACE', () => this.shoot());

        this.physics.add.overlap(this.bullets, this.aliens, this.hitAlien, null, this);
        this.physics.add.overlap(this.alienBullets, this.player, this.hitPlayer, null, this);

        for (let i = 0; i < 10; i++) {
            this.spawnAlien();
        }
        
        this.time.addEvent({ delay: 2000, callback: this.spawnAlien, callbackScope: this, loop: true });
        this.time.addEvent({ delay: 1000, callback: this.updateTimer, callbackScope: this, loop: true });
        this.time.addEvent({ delay: 1000, callback: this.alienShoot, callbackScope: this, loop: true });
        
        this.createPauseButton();
    }

    update() {
        this.player.setVelocityX(0);
        if (this.cursors.left.isDown) this.player.setVelocityX(-300);
        else if (this.cursors.right.isDown) this.player.setVelocityX(300);
    }

    shoot() {
        let bullet = this.bullets.create(this.player.x, this.player.y - 20, 'laser');
        if (bullet) bullet.setVelocityY(-400);
    }

    alienShoot() {
        this.aliens.children.iterate((alien) => {
            let bullet = this.alienBullets.create(alien.x, alien.y + 20, 'redLaser');
            if (bullet) bullet.setVelocityY(400).setTint(0xff0000); // Set bullet color to red
        });
    }

    hitAlien(bullet, alien) {
        bullet.destroy();
        alien.setTint(0xff0000);
        this.time.delayedCall(200, () => {
            alien.clearTint();
            alien.destroy();
        });
        this.score += 10;
        this.scoreText.setText('Score: ' + this.score);
    }

    hitPlayer(player, bullet) {
        bullet.destroy();
        player.setTint(0xff0000);
        this.lives--;
        this.livesText.setText('Lives: ' + this.lives);
        this.time.delayedCall(200, () => {
            player.clearTint();
        });
        if (this.lives <= 0) {
            this.scene.start('SurvivalGameOverScene', { score: this.score, success: false });
        }
    }

    spawnAlien() {
        let alien = this.aliens.create(Phaser.Math.Between(50, 950), Phaser.Math.Between(50, 150), 'alien');
        alien.setVelocityX(Phaser.Math.Between(-100, 100));
        alien.setVelocityY(Phaser.Math.Between(-20, 20));
        alien.setBounce(1, 1).setCollideWorldBounds(true).setScale(0.05);
    }

    updateTimer() {
        this.timeLeft--;
        this.timerText.setText('Time: ' + this.timeLeft);
        if (this.timeLeft <= 0) {
            this.scene.start('SurvivalGameOverScene', { score: this.score, success: true });
        }
    }

    createPauseButton() {
        let button = this.add.text(900, 60, 'Pause', {
            fontSize: '24px', fill: '#ffffff', backgroundColor: '#ff0000', padding: { x: 10, y: 5 }, fontStyle: 'bold'
        })
        .setOrigin(0.5)
        .setInteractive()
        .setDepth(1)
        .on('pointerdown', () => {
            this.scene.pause();
            this.scene.launch('PauseScene');
        })
        .on('pointerover', () => button.setStyle({ backgroundColor: '#cc0000' }))
        .on('pointerout', () => button.setStyle({ backgroundColor: '#ff0000' }));
    }
}

class SurvivalGameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'SurvivalGameOverScene' });
    }

    init(data) {
        this.score = data.score;
        this.success = data.success;
    }

    create() {
        let bg = this.add.graphics();
        bg.fillStyle(0x000000, 0.7);
        bg.fillRoundedRect(300, 180, 400, 300, 20);
        bg.setDepth(1);

        let message = this.success ? 'Vous avez réussi !' : 'Vous avez perdu !';
        this.add.text(500, 250, message, { fontSize: '40px', fill: '#ffffff' })
            .setOrigin(0.5)
            .setDepth(2);

        this.createButton(500, 350, 'Rejouer', '#0080ff', () => {
            this.scene.start('SurvivalMode');
        });

        this.createButton(500, 450, 'Menu Principal', '#ff0000', () => {
            this.scene.start('MenuScene');
        });
    }

    createButton(x, y, text, color, callback) {
        let button = this.add.text(x, y, text, {
            fontSize: '24px', fill: '#ffffff', backgroundColor: color, padding: { x: 20, y: 10 }, fontStyle: 'bold'
        })
        .setOrigin(0.5)
        .setInteractive()
        .setDepth(2)
        .on('pointerdown', callback)
        .on('pointerover', () => button.setStyle({ backgroundColor: Phaser.Display.Color.HexStringToColor(color).darken(20).saturate(20).color }))
        .on('pointerout', () => button.setStyle({ backgroundColor: color }));
    }
}

var config = {
    type: Phaser.AUTO,
    width: 1000,
    height: 650,
    physics: { default: 'arcade', arcade: { debug: false } },
    scene: [MenuScene, ArcadeMode, PauseScene, GameOverScene, SurvivalMode, SurvivalGameOverScene]
};

var game = new Phaser.Game(config);
