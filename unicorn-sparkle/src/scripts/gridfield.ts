/**
 * The functionality of this script is inspired by this codepen:

* - https://codepen.io/wefiy/pen/JxdzPG - Canvas Grid lines animation
 */

export class GridField {
  private readonly canvas: HTMLCanvasElement // Canvas element where the grid is drawn
  private readonly context: CanvasRenderingContext2D | null // 2D canvas context
  private readonly lines: GridLine[] = [] // Arrangement of grid lines
  private size: number = 50 // Grid cell size
  private readonly duration = 4000 // Animation duration in milliseconds
  private startTime: number = 0 // Animation start time
  private animationFrameId: number = 0 // Animation frame ID

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas // Set the received canvas
    this.context = this.canvas.getContext('2d') // Get the 2D context

    this.resizeCanvas() // Resizes the canvas on startup
    window.addEventListener('resize', this.handleResize.bind(this)) // Adds an event for resizing

    this.initGrid() // Initializes the grid
  }

  // Handles the resize event
  private handleResize(): void {
    this.resizeCanvas() // Resizes the canvas
    this.play() // Restarts the animation
  }

  // Resizes the canvas to the size of the window
  private resizeCanvas(): void {
    this.canvas.width = window.innerWidth // Sets the width of the canvas
    this.canvas.height = window.innerHeight // Set the height of the canvas
    this.size = Math.floor(Math.min(this.canvas.width, this.canvas.height) / 20) // Calculate the size of the grid
    this.updateGridLines() // Update the grid lines
  }

  // Initialize the lines to be animated
  private initGrid(): void {
    if (this.context === null) return // Check that the context is not null
    this.updateGridLines() // Update the lines
  }

  // Update the positions of the grid lines
  private updateGridLines(): void {
    if (this.context === null) return // Check that the context is not null

    const OFFSET = -5 // Offset to draw the lines
    const width = this.canvas.width // Width of the canvas
    const height = this.canvas.height // Height of the canvas

    this.lines.length = 0 // Clear the lines previous lines

    // Draw horizontal lines
    for (let y = OFFSET; y <= height; y += this.size) {
      const lineLeft = new GridLine(this.context, 0, y, 0, y)
      lineLeft.animateTo({ x: width / 2 }, this.duration, EASING.easeInOutQuad)
      this.lines.push(lineLeft) // Add the left line

      const lineRight = new GridLine(this.context, width, y, width, y)
      lineRight.animateTo({ x: width / 2 }, this.duration, EASING.easeInOutQuad)
      this.lines.push(lineRight) // Add the right line
    }

    // Draw vertical lines
    for (let x = OFFSET; x <= width; x += this.size) {
      const lineTop = new GridLine(this.context, x, 0, x, 0)
      lineTop.animateTo({ y: height / 2 }, this.duration, EASING.easeInOutQuad)
      this.lines.push(lineTop) // Add the top line

      const lineBottom = new GridLine(this.context, x, height, x, height)
      lineBottom.animateTo(
        { y: height / 2 },
        this.duration,
        EASING.easeInOutQuad
      )
      this.lines.push(lineBottom) // Add the bottom line
    }
  }

  // Main animation method
  private animate(currentTime: number): void {
    const progress = Math.min(1, (currentTime - this.startTime) / this.duration) // Calculate progress

    if (this.context === null) return // Check that the context is not null

    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height) // Clear the canvas

    // Draw all lines
    this.lines.forEach((line) => {
      line.draw(progress) // Draw each line based on progress
    })

    // If the animation hasn't finished, continue the animation
    if (progress < 1) {
      this.animationFrameId = requestAnimationFrame(this.animate.bind(this))
    } else {
      this.animationFrameId = 0 // Reset the animation ID
    }
  }

  // Start the animation
  public play(): void {
    this.startTime = performance.now() // Mark the start time
    this.animate(this.startTime) // Start the animation
  }
}

// Define the type of function for easing
type EasingFunction = (t: number, b: number, c: number, d: number) => number

// Define the easing system (smooth interpolation)
const EASING = {
  easeInOutQuad: ((t, b, c, d) => {
    t /= d / 2 // Normalize the time
    if (t < 1) return (c / 2) * t * t + b // Easing forwards
    t-- // Reduce t
    return (-c / 2) * (t * (t - 2) - 1) + b // Easing backwards
  }) as EasingFunction
}

// Class to animate properties
class Animatable {
  private animation: {
    target: Record<string, number> // Target of the properties to animate
    duration: number // Duration of the animation
    easing: EasingFunction // Easing function
  } | null = null // Initialize the animation to null

  // Method to animate to specific properties
  animateTo(
    properties: Record<string, number>,
    duration: number,
    easing: EasingFunction
  ): void {
    this.animation = { target: properties, duration, easing } // Set up the animation
  }

  // Get the animated property based on progress
  protected _getAnimatedProperty(
    property: string,
    progress: number,
    start: number
  ): number {
    if (this.animation?.target[property] !== undefined) {
      const change = this.animation.target[property] - start // Calculate the change
      return this.animation.easing(
        progress * this.animation.duration,
        start,
        change,
        this.animation.duration
      ) // Apply the easing function
    }
    return start // Return the initial value if there is no animation
  }
}

// Class to render a grid line
class GridLine extends Animatable {
  private readonly startX: number // Initial position in X
  private readonly startY: number // Initial position in Y

  constructor(
    private readonly context: CanvasRenderingContext2D,
    startX: number,
    startY: number,
    endX: number,
    endY: number
  ) {
    super()
    this.startX = startX // Assigns the initial position in X
    this.startY = startY // Assigns the initial position in Y
  }

  // Method to draw the line
  draw(progress: number): void {
    const x = this._getAnimatedProperty('x', progress, this.startX) // Gets the animated position in X
    const y = this._getAnimatedProperty('y', progress, this.startY) // Gets the animated position in Y

    this.context.beginPath() // Begin a new path
    this.context.moveTo(this.startX, this.startY) // Move to the start position
    this.context.lineTo(x, y) // Draw the line to the animated position
    this.context.strokeStyle = 'rgba(128, 128, 128, 0.44)' // Color of the lines
    this.context.stroke() // Draw the line on the canvas
  }
}