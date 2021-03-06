const ColorObj = {
  FOOD: 'red',
  EMPTY: '#333333',
  SNAKE: 'black'
}

class Game {
  constructor(x, y, speed) {
    this.size = { x, y }
    this.speed = speed

    this.canvas = document.createElement('canvas')
    this.canvas.width = x * 17
    this.canvas.height = y * 17

    document.getElementById('main').appendChild(this.canvas)

    this.ctx = this.canvas.getContext('2d')
    this.boardMap = new Map()

    this.start()
  }

  createFood() {
    try {
      const pos = { x: Math.floor(Math.random() * this.size.x), y: Math.floor(Math.random() * this.size.y) }
      if (this.snake.positions.find(p => p.x === pos.x && p.y === pos.y)) return this.createFood()
      return pos
    } catch (e) {
      this.gameOver();
    }
  }

  gameOver() {
    this.canvas.remove()
    document.getElementById('h-gameover').style.visibility = 'visible'
  }

  drawBox(x, y, color) {
    this.ctx.strokeStyle = color
    this.ctx.strokeRect(17 * x, 17 * y, 17, 17)

    this.ctx.fillStyle = color
    this.ctx.fillRect(17 * x, 17 * y, 16, 16)
  }

  start() {
    this.paused = false
    this.snake = new Snake(this)
    this.foodPos = this.createFood()
    this.queLength = []

    document.addEventListener('keypress', this.handlePress.bind(this))
    window.requestAnimationFrame(this.draw.bind(this))

    this.loop()
  }

  checkDeath() {
    const positionsArray = this.snake.positions.map(e => `${e.x}-${e.y}`)
    if (positionsArray.some(e => positionsArray.indexOf(e) !== positionsArray.lastIndexOf(e))) return true
    if (this.snake.positions.some(e => e.x >= this.size.x || e.y >= this.size.y || e.x < 0 || e.y < 0)) return true
    return false
  }

  async loop() {
    // Check if paused
    if (!this.paused) {
      this.snake.move(this.queLength.shift())
      this.allowMove = true;
    }

    // Check if the user should be dead?
    if (this.checkDeath()) {
      this.ctx.fillStyle = 'red'
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
      this.gameOver()
      return
    }

    // Wait 100ms
    await new Promise((resolve, reject) => { setTimeout(resolve, 1000 / this.speed) })

    // Run the function again
    return this.loop()
  }

  draw(time) {
    this.ctx.fillStyle = ColorObj.EMPTY
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

    this.ctx.strokeStyle = 'black'
    this.ctx.strokeRect(0, 0, this.canvas.width, this.canvas.height)

    this.drawBox(this.foodPos.x, this.foodPos.y, ColorObj.FOOD)

    for (const pos of this.snake.positions) {
      if (pos.x === this.foodPos.x && pos.y === this.foodPos.y) {
        this.queLength.push(pos)
        this.foodPos = this.createFood()
      }
      this.drawBox(pos.x, pos.y, ColorObj.SNAKE)
    }

    window.requestAnimationFrame(this.draw.bind(this))
  }

  handlePress(event) {
    if (!this.allowMove) return;
    switch (event.code) {
      case 'ArrowDown':
      case 'KeyS':
        if (this.snake.direction === 3) break
        this.snake.setDirection(1)
        break

      case 'ArrowLeft':
      case 'KeyA':
        if (this.snake.direction === 4) break
        this.snake.setDirection(2)
        break

      case 'ArrowUp':
      case 'KeyW':
        if (this.snake.direction === 1) break
        this.snake.setDirection(3)
        break

      case 'ArrowRight':
      case 'KeyD':
        if (this.snake.direction === 2) break
        this.snake.setDirection(4)
        break

      case 'Space':
        this.paused = !this.paused
        if (this.died) window.location.reload()
        return;

      default:
    }
    this.allowMove = false;
  }
}

class Snake {
  constructor(g) {
    this.game = g
    this.positions = [{ x: 5, y: 5 }, { x: 6, y: 5 }, { x: 7, y: 5 }]
    this.setDirection(4);
  }

  setDirection(direction) {
    this.direction = direction
  }

  move(food = false) {
    const head = { ...this.positions[this.positions.length - 1] }
    switch (this.direction) {
      // Up
      case 1:
        head.y = head.y + 1
        break

      // Left
      case 2:
        head.x = head.x - 1
        break

      // Down
      case 3:
        head.y = head.y - 1
        break

      // Right
      case 4:
        head.x = head.x + 1
        break

      default:
        console.log('FUCK')
    }

    if (head.y > this.game.size.y - 1) head.y = 0
    if (head.y < 0) head.y = this.game.size.y - 1
    if (head.x > this.game.size.x - 1) head.x = 0
    if (head.x < 0) head.x = this.game.size.x - 1

    if (!food) this.positions.shift()
    this.positions.push(head)
  }
}
