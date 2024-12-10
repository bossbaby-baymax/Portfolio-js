/**
* The functionality of this script is inspired by these codepens:

* - https://codepen.io/veljamatic/pen/pypxRR - canvas-dot-grid
* - Draw a grid of dots on a canvas

* - https://codepen.io/efriberg/pen/ExaxzKq - Interactive Dot Grid
* - Repel effect based on mouse position

* - https://codepen.io/BuiltByEdgar/pen/gvEPya - Dot grid (canvas)
* - Flash effect of dots on canvas
*/

export class StarField {
  // Canvas element and its 2D context
  private readonly canvas: HTMLCanvasElement
  private readonly context: CanvasRenderingContext2D | null

  // Array storing stars with their properties: position, alpha (opacity), and speed
  private stars: Array<{
    x: number
    y: number
    originalX: number
    originalY: number
    alpha: number
    speed: number
  }> = []

  // Mouse position and configuration constants
  private readonly mousePosition = { x: -1000, y: -1000 } // Initial mouse position outside the canvas
  private readonly SPACING = 18 // Spacing between stars
  private readonly starRadius = 1 // Radius of each star
  private readonly influenceRadius = 80 // Influence radius for the mouse repellent effect
  private canvasWidth: number
  private canvasHeight: number

  // Color of stars (white by default)
  private starColor = '255, 255, 255'

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    this.context = this.canvas?.getContext('2d') ?? null

    // Set canvas dimensions
    this.canvasWidth = this.getCanvasWidth()
    this.canvasHeight = this.getCanvasHeight()

    // Check if the context is valid before proceeding
    if (this.context !== null) {
      this.initStars() // Initialize stars
      this.resizeCanvas() // Adjust the canvas size
      this.drawStars() // Draw the stars
      this.addEventListeners() // Add mouse events
      this.observeThemeChanges() // Observe changes in theme (class 'dark' in <html> tag)
    } else {
      console.error('The 2D context could not be obtained.')
    }

    // Add event to resize the canvas when the window size changes
    window.addEventListener('resize', this.onResize.bind(this), false)
  }

  // Get the width of the canvas
  private getCanvasWidth(): number {
    return this.canvas.clientWidth
  }

  // Get the height of the canvas
  private getCanvasHeight(): number {
    return this.canvas.clientHeight
  }

  // Resize the canvas
  private resizeCanvas(): void {
    this.canvas.width = this.canvasWidth
    this.canvas.height = this.canvasHeight
  }

  // Initialize the stars with random positions and properties
  private initStars(): void {
    this.stars = []

    // Generate stars on the canvas, initialize the x and y position to -5 to adjust it correctly
    for (let x = -5; x < this.canvasWidth; x += this.SPACING) {
      for (let y = -5; y < this.canvasHeight; y += this.SPACING) {
        this.stars.push({
          x,
          y,
          originalX: x, // Save original position for "push back" effect
          originalY: y,
          alpha: Math.random(), // Random opacity
          speed: Math.random() * 0.005 + 0.002 // Speed ​​of opacity variation
        })
      }
    }
  }

  // Draw stars and apply push effect based on mouse position
  private drawStars(): void {
    if (this.context !== null) {
      this.context.clearRect(0, 0, this.canvasWidth, this.canvasHeight) // Clear canvas
    }

    this.stars.forEach((star) => {
      // Calculate distance between mouse and star
      const dx = this.mousePosition.x - star.x
      const dy = this.mousePosition.y - star.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      // If star is within mouse influence radius, apply repellency
      if (distance < this.influenceRadius) {
        const angle = Math.atan2(dy, dx) // Direction angle towards mouse
        const force = (this.influenceRadius - distance) / this.influenceRadius // Strength of repellency
        star.x = star.originalX - Math.cos(angle) * force * 20 // Move star away from mouse
        star.y = star.originalY - Math.sin(angle) * force * 20
      } else {
        // If star is outside from the radius of influence, returns to its original position
        star.x += (star.originalX - star.x) * 0.05
        star.y += (star.originalY - star.y) * 0.05
      }

      // Update the opacity (alpha) of the stars with their speed
      star.alpha += star.speed
      if (star.alpha > 1 || star.alpha < 0) {
        star.speed = -star.speed // Reverse the direction of the opacity change
      }

      // Draw each star with its color (depending on the theme) and opacity
      if (this.context !== null) {
        this.context.fillStyle = `rgba(${this.starColor}, ${Math.abs(star.alpha)})`
        this.context.beginPath()
        this.context.arc(star.x, star.y, this.starRadius, 0, Math.PI * 2) // Draw the star
        this.context.fill()
      }
    })

    // Continue animation on the next frame
    requestAnimationFrame(this.drawStars.bind(this))
  }

  // Add mouse events: move and leave the canvas area
  private addEventListeners(): void {
    this.canvas.parentElement?.addEventListener(
      'mousemove',
      this.onMouseMove.bind(this)
    )
    this.canvas.parentElement?.addEventListener(
      'mouseleave',
      this.onMouseLeave.bind(this)
    )
  }

  // Update the mouse position when moving it within the canvas
  private onMouseMove(event: MouseEvent): void {
    const rect = this.canvas.getBoundingClientRect()
    this.mousePosition.x = event.clientX - rect.left
    this.mousePosition.y = event.clientY - rect.top
  }

  // When exiting the canvas, place the mouse in a position outside the visible area
  private onMouseLeave(): void {
    this.mousePosition.x = -1000
    this.mousePosition.y = -1000
  }

  // Resize the canvas and reset the stars when the window changes size
  private onResize(): void {
    this.canvasWidth = this.getCanvasWidth()
    this.canvasHeight = this.getCanvasHeight()
    this.resizeCanvas()
    this.initStars()
  }

  // Method to observe changes in the 'dark' class of the <html>
  private observeThemeChanges(): void {
    const htmlElement = document.documentElement

    // Initially we check if the 'dark' class is present
    this.updateStarColor()

    // Create a MutationObserver to detect changes in the <html> class
    const observer = new MutationObserver(() => {
      this.updateStarColor() // Update the color of the stars when the class changes
    })

    // Start observing changes in the <html> attributes
    observer.observe(htmlElement, {
      attributes: true, // Observe attributes only
      attributeFilter: ['class'] // Only observe changes in class
    })
  }

  // Change the color of the stars based on the 'dark' class
  private updateStarColor(): void {
    const htmlElement = document.documentElement

    if (htmlElement.classList.contains('dark')) {
      this.starColor = '0, 0, 0' // Black if the 'dark' class is present
    } else {
      this.starColor = '255, 255, 255' // White if not present
    }
  }
}