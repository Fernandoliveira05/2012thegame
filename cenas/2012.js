// Criando a classe menu e exportando ela como uma cena
class Menu extends Phaser.Scene {
  constructor() {
    super({
      key: "Menu",
    });
  }

  // Carregando os itens que utilizaremos nessa cena
  preload() {
    // Fundo
    this.load.image("background_menu", "assets/fundomenu.png");
    // Botão de jogar
    this.load.image("playButton", "assets/jogar (2).png");
    // Botão de Controles
    this.load.image("controlsButton", "assets/controles.png");
  }

  // Criando os elementos no jogo
  create() {
    // Criando o fundo
    this.add.image(0, 0, "background_menu").setOrigin(0, 0);

    // Criando o botão de jogar
    const playButton = this.add.image(400, 200, "playButton").setInteractive();

    // Criando o botão de controles
    const controlsButton = this.add
      .image(400, 300, "controlsButton")
      .setInteractive();

    // Criando função para clicar no botão de jogar
    playButton.on("pointerdown", () => {
      this.scene.start("Plataformas");
    });

    // Criando função para clicar no botão e ir para a cena de controles
    controlsButton.on("pointerdown", () => {
      this.scene.start("Controles");
    });
  }
}

// Criando a classe plataformas
class Plataformas extends Phaser.Scene {
  constructor() {
    super({
      key: "Plataformas",
    });

    // Variáveis usadas nessa cena
    this.score = 0;
    this.player = null;
    this.foguete = null;
    this.platforms = null;
    this.cursors = null;
  }

  // Carregando itens que usaremos dentro do jogo
  preload() {
    this.load.image("sky", "assets/fundo(1).png");
    this.load.image("ground", "assets/ground.png");
    this.load.spritesheet("player", "assets/sprite.png", {
      frameWidth: 60,
      frameHeight: 60,
    });
    this.load.image("foguete", "assets/foguete.png", {
      frameWidth: 48,
      frameHeight: 48,
    });
    this.load.image("fogueteParado", "assets/FogueteParado.png");
  }

  create() {
    // Fundo
    this.add.image(0, 0, "sky").setOrigin(0, 0);
    // Foguete que o jogador deve encontrar
    this.add.image(650, 85, "fogueteParado");

    // Adicionando o texto de guia para o jogador
    this.add.text(16, 16, "Encontre o foguete e fuja da terra!", {
      fontSize: "24px",
      fill: "#fff",
    });

    // Criando as plataformas
    this.platforms = this.physics.add.staticGroup();
    this.platforms.create(100, 350, "ground").refreshBody();
    this.platforms.create(250, 300, "ground").refreshBody();
    this.platforms.create(400, 250, "ground").refreshBody();
    this.platforms.create(450, 150, "ground").refreshBody();
    this.platforms.create(500, 250, "ground").refreshBody();
    this.platforms.create(550, 150, "ground").refreshBody();
    this.platforms.create(650, 150, "ground").refreshBody();

    // Criando o jogador na cena
    this.player = this.physics.add.sprite(50, 300, "player");
    this.player.setCollideWorldBounds(true);
    // Física entre jogador e plataformas
    this.physics.add.collider(this.player, this.platforms);

    // Criando o 'cursors' para que possamos utilizar das teclas para nos movimentarmos
    this.cursors = this.input.keyboard.createCursorKeys();

    // Comandos de câmera; Câmera seguirá o jogador conforme ele andar
    this.cameras.main.setBounds(0, 0, 1000, 400);
    this.cameras.main.startFollow(this.player);
    this.cameras.main.setFollowOffset(-200, 0);

    // Animações de movimentos
    this.anims.create({
      key: "andarLateral",
      frames: this.anims.generateFrameNumbers("player", { start: 8, end: 11 }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "andarLateral2",
      frames: this.anims.generateFrameNumbers("player", { start: 4, end: 7 }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "parado",
      frames: this.anims.generateFrameNumbers("player", {
        start: 0,
        end: 0,
      }),
      frameRate: 0,
      repeat: -1,
    });
  }

  update() {
    // Comandos de movimentação e atribuição de teclas
    if (this.cursors.right.isDown) {
      this.player.setVelocityX(160);
      this.player.anims.play("andarLateral", true);
    } else if (this.cursors.left.isDown) {
      this.player.setVelocityX(-160);
      this.player.anims.play("andarLateral2", true);
    } else {
      this.player.setVelocityX(0);
      this.player.anims.play("parado", true);
    }

    // Condições para o jogador pular
    if (this.cursors.up.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-330);
    }

    // Criando condição para o jogador avançar para a próxima fase
    if (this.player.x > 550 && !this.foguete) {
      this.foguete = this.physics.add.sprite(600, 300, "foguete");
      this.foguete.setCollideWorldBounds(true);
      this.physics.add.collider(this.foguete, this.platforms);
      this.foguete.setAlpha(0);
      this.time.delayedCall(
        500,
        () => {
          this.scene.start("Espaco", { score: this.score });
        },
        [],
        this
      );
    }
  }
}

// Classe espaço, uma outra fase
class Espaco extends Phaser.Scene {
  constructor() {
    super({
      key: "Espaco",
    });

    // Variáveis
    this.score = 0;
    this.gameOver = false;
    this.transitioning = false;
    this.obstacles = null;
    this.obstacleSpeed = 5;
    this.turbo = null;
    this.fire = null;
    this.restartButton = null;
    this.scoreText = null;
  }

  // Carregando recursos para o jogo
  preload() {
    this.load.image("background", "assets/fundo.png");
    this.load.image("obstacle", "assets/rock.png");
    this.load.image("turbo", "assets/turbo.png");
    this.load.image("restartButton", "assets/restart.png");
    this.load.image("back", "assets/YOU SURVIVED!.png");
  }

  // Criando os elementos no jogo
  create() {
    // Fundo
    this.bg = this.add.image(0, 0, "background").setOrigin(0, 0);

    // Inimigos, pedras
    this.obstacles = this.physics.add.group({
      immovable: true,
      allowGravity: false,
    });

    // Efeito especial de turbo na nave
    this.turbo = this.add.image(0, 0, "turbo");
    this.turbo.setVisible(false);
    this.stonesPassed = 0;

    // Adicionando o foguete, nosso personagem dessa fase
    this.foguete = this.physics.add.sprite(12, 200, "foguete");
    this.foguete.setCollideWorldBounds(true);
    this.foguete.setSize(32, 32);

    // Adicionando colisão entre obstáculos e nosso foguete
    this.physics.add.collider(
      this.foguete,
      this.obstacles,
      this.handleObstacleCollision,
      null,
      this
    );

    // Novamente utilizando o 'cursors' para podermos usar as teclas para nos movimentarmos
    this.cursors = this.input.keyboard.createCursorKeys();

    // Adicionando texto que mostra quantos pontos faltam para a próxima fase
    this.scoreText = this.add.text(16, 16, "Pontos restantes: 1000", {
      fontSize: "24px",
      fill: "#fff",
    });

    // Adicionando loop
    this.time.addEvent({
      delay: 1000,
      callback: this.addObstacles,
      callbackScope: this,
      loop: true,
    });
  }

  update() {
    // Adicionando penalidade para as colisões entre jogador e obstáculos/pedras
    this.obstacles.children.iterate(function (obstacle) {
      if (obstacle) {
        if (obstacle.x < this.foguete.x && !obstacle.passed) {
          obstacle.passed = true;
          this.stonesPassed += 1;
          console.log(`Pedras passadas: ${this.stonesPassed}`);
        }

        obstacle.x -= this.obstacleSpeed;

        // Adicionando pontuação ao desviar das pedras
        if (obstacle.x < -obstacle.displayWidth / 2) {
          obstacle.destroy();
          this.score += 10;
        }
      }
    }, this);

    // Adicionando condição de vitória
    if (this.score >= 1000 && !this.transitioning) {
      this.transitioning = true;
      this.scene.pause();
      this.scene.launch("Creditos", { score: this.score });
    }

    // Caso o jogo termine, aparecer botão para recomeçar
    if (this.gameOver) {
      if (!this.restartButton) {
        this.createRestartButton();
      }
      return;
    }

    // Adicionando condição para a pedra sumir da tela
    this.obstacles.children.iterate(function (obstacle) {
      if (obstacle) {
        obstacle.x -= this.obstacleSpeed;

        if (obstacle.x < -obstacle.displayWidth / 2) {
          obstacle.destroy();
          this.score += 10;
        }
      }
    }, this);

    // Funções
    this.updateBackground();
    this.handlefogueteMovement();
    this.updatefoguetePosition();
    this.updateTurboPosition();

    // Contagem dos pontos que faltam
    const remainingPoints = Math.max(0, 1000 - this.score);
    this.scoreText.setText("Pontos restantes: " + remainingPoints);

    // Começar novamente o fundo
    if (this.foguete.y > this.game.config.height || this.foguete.y < 0) {
      this.gameOver = true;
      this.showGameOverScene();
    }
  }

  // Adicionando loop para a criação de obstáculos de forma randômica
  addObstacles() {
    const numberOfObstacles = 5;
    for (let i = 0; i < numberOfObstacles; i++) {
      if (this.gameOver) {
        break;
      }

      const y = Phaser.Math.Between(50, 550);
      const obstacle = this.physics.add.sprite(
        this.game.config.width,
        y,
        "obstacle"
      );

      if (this.obstacles) {
        this.obstacles.add(obstacle);
      }
    }
  }

  // Atualizar o fundio e dar a ideia de que o jogador está se movendo de fato
  updateBackground() {
    this.bg.x -= this.obstacleSpeed / 6;
    if (this.bg.x < -this.bg.displayWidth) {
      this.bg.x = 0;
    }
  }
  // Adicionando condição para mostrar a tela de gameover (fim de jogo)
  handleObstacleCollision(foguete, obstacle) {
    this.gameOver = true;
    this.obstacles.clear(true, true);
    this.showGameOverScene();
  }

  // Mostrar tela de fim de jogo com o botão de reinicio
  showGameOverScene() {
    if (!this.restartButton) {
      this.createRestartButton();
    }
  }

  // Ativar o efeito especial de turbo
  activateTurbo() {
    if (this.turbo) {
      this.turbo.setVisible(true);
    }
  }
  // Desativar o efeito especial de turbo
  deactivateTurbo() {
    if (this.turbo) {
      this.turbo.setVisible(false);
    }
  }
  // Adicionando movimentação e animação vinculada ao movimento
  handlefogueteMovement() {
    if (this.cursors.up.isDown && this.foguete.y > 0) {
      this.foguete.setVelocityY(-300);
      this.deactivateTurbo();
    } else if (
      this.cursors.down.isDown &&
      this.foguete.y < this.game.config.height
    ) {
      this.foguete.setVelocityY(300);
      this.deactivateTurbo();
    } else {
      this.foguete.setVelocityY(0);
      this.deactivateTurbo();
    }

    if (this.cursors.left.isDown && this.foguete.x > 0) {
      this.foguete.setVelocityX(-300);
      this.deactivateTurbo();
    } else if (
      this.cursors.right.isDown &&
      this.foguete.x < this.game.config.width
    ) {
      this.foguete.setVelocityX(300);
      this.activateTurbo();
    } else {
      this.foguete.setVelocityX(0);
      this.deactivateTurbo();
    }
  }

  // Atualizar a posição do foguete 
  updatefoguetePosition() {
    this.foguete.x += this.foguete.body.velocity.x / 60;
    this.foguete.y += this.foguete.body.velocity.y / 60;
  }

  // Atualizar posição do turbo e vincular ele ao foguete
  updateTurboPosition() {
    if (this.turbo) {
      this.turbo.setPosition(
        this.foguete.x,
        this.foguete.y + this.foguete.height / 9
      );
    }
  }

  // Criar e quando acionado destruir o botão de reinicio
  createRestartButton() {
    if (this.restartButton) {
      this.restartButton.destroy();
    }

    // Adicionar imagem ao botão de reinício 
    this.restartButton = this.add
      .image(
        this.game.config.width / 2,
        this.game.config.height / 2,
        "restartButton"
      )
      .setInteractive();

    this.restartButton.on("pointerdown", () => {
      this.scene.restart();
      this.gameOver = false;
      this.transitioning = false;
      this.restartButton.setVisible(false);
      this.restartButton = null;
    });
  }
}
// Definição de uma cena Phaser chamada Controles
class Controles extends Phaser.Scene {
  constructor() {
    super({
    // Configurações da cena
      key: "Controles",
    });
  }

  // Pré-carregamento de recursos
  preload() {
    this.load.image("controls", "assets/fundocontroles.png");
    this.load.image("backButton", "assets/BotaoVoltar.png");
  }

  // Criação dos elementos na cena
  create() {
    // Configuração do plano de fundo
    this.add.image(0, 0, "controls").setOrigin(0, 0);

    // Adição do botão de voltar à cena do menu
    const backButton = this.add.image(400, 300, "backButton").setInteractive();

    // Adiciona um evento de clique ao botão para voltar à cena do menu
    backButton.on("pointerdown", () => {
      this.scene.start("Menu");
    });
  }
}

// Definição de uma cena Phaser chamada Creditos
class Creditos extends Phaser.Scene {
  constructor() {
    super({
    // Configurações da cena
      key: "Creditos",
    });
  }

  // Criação da cena de créditos com a lógica, se necessário
  create(data) {
    this.add.image(0, 0, "back").setOrigin(0, 0);
    // Lógica para a cena de Créditos, se necessário
  }
}

// Configuração do jogo
const configMenu = {
  type: Phaser.AUTO,
  width: 800,
  height: 400,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 300 },
      debug: false,
    },
  },
  scene: [Menu, Plataformas, Espaco, Controles, Creditos],
};

// Inicialização do jogo
const game = new Phaser.Game(configMenu);