class SomuOS {
  constructor() {
    this.windows = new Map()
    this.windowZIndex = 100
    this.activeWindow = null
    this.draggedWindow = null
    this.dragOffset = { x: 0, y: 0 }
    this.terminalHistory = []
    this.terminalCommands = {
      help: "Available commands: help, clear, date, whoami, ls, pwd, echo, neofetch, about",
      clear: "",
      date: () => new Date().toString(),
      whoami: "somu-user",
      ls: "Desktop  Documents  Downloads  Pictures  Music  Movies",
      pwd: "/Users/somu-user",
      echo: (args) => args.join(" "),
      neofetch: () => `
        ███████╗ ██████╗ ███╗   ███╗██╗   ██╗ ██████╗ ███████╗
        ██╔════╝██╔═══██╗████╗ ████║██║   ██║██╔═══██╗██╔════╝
        ███████╗██║   ██║██╔████╔██║██║   ██║██║   ██║███████╗
        ╚════██║██║   ██║██║╚██╔╝██║██║   ██║██║   ██║╚════██║
        ███████║╚██████╔╝██║ ╚═╝ ██║╚██████╔╝╚██████╔╝███████║
        ╚══════╝ ╚═════╝ ╚═╝     ╚═╝ ╚═════╝  ╚═════╝ ╚══════╝
        
        OS: SomuOS 1.0
        Kernel: SomuKernel 5.15.0
        Shell: SomuShell 1.0
        CPU: Intel Core i7-12700K
        Memory: 16GB DDR4
        Uptime: ${Math.floor(Math.random() * 24)}h ${Math.floor(Math.random() * 60)}m
      `,
      about: "SomuOS - A modern operating system built with web technologies",
    }

    this.init()
  }

  init() {
    this.showBootScreen()
  }

  showBootScreen() {
    const bootScreen = document.getElementById("boot-screen")
    const desktop = document.getElementById("desktop")

    // Simulate boot process
    setTimeout(() => {
      bootScreen.style.opacity = "0"
      bootScreen.style.transition = "opacity 1s ease-out"

      setTimeout(() => {
        bootScreen.classList.add("hidden")
        desktop.classList.remove("hidden")
        this.startDesktop()
      }, 1000)
    }, 4000) // 4 seconds boot time
  }

  startDesktop() {
    this.updateTime()
    this.setupEventListeners()
    this.setupDockHover()
    setInterval(() => this.updateTime(), 1000)
  }

  updateTime() {
    const now = new Date()
    const timeString = now.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
    const dateString = now.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    })

    const menuTime = document.getElementById("menu-time")
    if (menuTime) {
      menuTime.textContent = `${dateString} ${timeString}`
    }
  }

  setupEventListeners() {
    // Dock clicks
    document.querySelectorAll(".dock-item").forEach((item) => {
      item.addEventListener("click", (e) => {
        const app = e.target.dataset.app
        if (app === "launchpad") {
          this.toggleLaunchpad()
        } else {
          this.openApp(app)
        }
      })
    })

    // Launchpad clicks
    document.querySelectorAll(".app-icon").forEach((item) => {
      item.addEventListener("click", (e) => {
        const app = e.target.closest(".app-icon").dataset.app
        this.openApp(app)
        this.hideLaunchpad()
      })
    })

    // Spotlight
    document.getElementById("spotlight-btn").addEventListener("click", () => {
      this.toggleSpotlight()
    })

    // Global keyboard shortcuts
    document.addEventListener("keydown", (e) => {
      if (e.metaKey && e.key === " ") {
        e.preventDefault()
        this.toggleSpotlight()
      }
      if (e.key === "Escape") {
        this.hideSpotlight()
        this.hideLaunchpad()
      }
    })

    // Context menu
    document.getElementById("desktop").addEventListener("contextmenu", (e) => {
      e.preventDefault()
      this.showContextMenu(e.clientX, e.clientY)
    })

    document.addEventListener("click", () => {
      this.hideContextMenu()
    })

    // Spotlight search
    document.getElementById("spotlight-input").addEventListener("input", (e) => {
      this.handleSpotlightSearch(e.target.value)
    })

    // Window dragging
    document.addEventListener("mousedown", (e) => {
      if (e.target.classList.contains("window-header") || e.target.closest(".window-header")) {
        this.startWindowDrag(e)
      }
    })

    document.addEventListener("mousemove", (e) => {
      if (this.draggedWindow) {
        this.dragWindow(e)
      }
    })

    document.addEventListener("mouseup", () => {
      this.stopWindowDrag()
    })
  }

  setupDockHover() {
    const dockItems = document.querySelectorAll(".dock-item")

    dockItems.forEach((item, index) => {
      item.addEventListener("mouseenter", () => {
        this.animateDockItems(index)
      })
    })

    document.getElementById("dock").addEventListener("mouseleave", () => {
      this.resetDockItems()
    })
  }

  animateDockItems(hoveredIndex) {
    const dockItems = document.querySelectorAll(".dock-item")

    dockItems.forEach((item, index) => {
      const distance = Math.abs(index - hoveredIndex)
      let scale = 1

      if (distance === 0) scale = 1.6
      else if (distance === 1) scale = 1.3
      else if (distance === 2) scale = 1.1

      item.style.transform = `scale(${scale}) translateY(${scale > 1 ? -8 : 0}px)`
    })
  }

  resetDockItems() {
    document.querySelectorAll(".dock-item").forEach((item) => {
      item.style.transform = "scale(1) translateY(0)"
    })
  }

  toggleSpotlight() {
    const spotlight = document.getElementById("spotlight")
    const input = document.getElementById("spotlight-input")

    if (spotlight.classList.contains("hidden")) {
      spotlight.classList.remove("hidden")
      input.focus()
    } else {
      this.hideSpotlight()
    }
  }

  hideSpotlight() {
    document.getElementById("spotlight").classList.add("hidden")
    document.getElementById("spotlight-input").value = ""
    document.getElementById("spotlight-results").innerHTML = ""
  }

  handleSpotlightSearch(query) {
    const results = document.getElementById("spotlight-results")

    if (!query.trim()) {
      results.innerHTML = ""
      return
    }

    const apps = [
      { name: "Finder", icon: "📁", app: "finder" },
      { name: "Safari", icon: "🧭", app: "safari" },
      { name: "Mail", icon: "✉️", app: "mail" },
      { name: "Calendar", icon: "📅", app: "calendar" },
      { name: "Calculator", icon: "🧮", app: "calculator" },
      { name: "Notes", icon: "📝", app: "notes" },
      { name: "Photos", icon: "🖼️", app: "photos" },
      { name: "Music", icon: "🎵", app: "music" },
      { name: "System Preferences", icon: "⚙️", app: "settings" },
      { name: "Terminal", icon: "⬛", app: "terminal" },
      { name: "Tutorial", icon: "📚", app: "tutorial" },
    ]

    const filtered = apps.filter((app) => app.name.toLowerCase().includes(query.toLowerCase()))

    results.innerHTML = filtered
      .map(
        (app) => `
            <div class="spotlight-result" data-app="${app.app}">
                <span style="font-size: 20px;">${app.icon}</span>
                <span>${app.name}</span>
            </div>
        `,
      )
      .join("")

    // Add click handlers to results
    results.querySelectorAll(".spotlight-result").forEach((result) => {
      result.addEventListener("click", () => {
        const app = result.dataset.app
        this.openApp(app)
        this.hideSpotlight()
      })
    })
  }

  toggleLaunchpad() {
    const launchpad = document.getElementById("launchpad")
    launchpad.classList.toggle("hidden")
  }

  hideLaunchpad() {
    document.getElementById("launchpad").classList.add("hidden")
  }

  showContextMenu(x, y) {
    const contextMenu = document.getElementById("context-menu")
    contextMenu.style.left = `${x}px`
    contextMenu.style.top = `${y}px`
    contextMenu.classList.remove("hidden")

    // Add click handlers
    contextMenu.querySelectorAll(".context-item").forEach((item) => {
      item.addEventListener("click", () => {
        const action = item.dataset.action
        this.handleContextAction(action)
      })
    })
  }

  hideContextMenu() {
    document.getElementById("context-menu").classList.add("hidden")
  }

  handleContextAction(action) {
    switch (action) {
      case "new-folder":
        alert("New Folder created!")
        break
      case "get-info":
        alert("Desktop Info")
        break
      case "change-wallpaper":
        this.changeWallpaper()
        break
      case "about":
        this.showAbout()
        break
    }
    this.hideContextMenu()
  }

  showAbout() {
    alert(`SomuOS 1.0\n\nA modern operating system built with web technologies.\n\nCreated with ❤️ for the web.`)
  }

  changeWallpaper() {
    const wallpapers = [
      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
      "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
      "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
      "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
    ]

    const randomWallpaper = wallpapers[Math.floor(Math.random() * wallpapers.length)]
    document.getElementById("desktop").style.background = randomWallpaper
  }

  openApp(appName) {
    if (this.windows.has(appName)) {
      this.focusWindow(appName)
      return
    }

    const window = this.createWindow(appName)
    this.windows.set(appName, window)

    // Update dock
    const dockItem = document.querySelector(`[data-app="${appName}"]`)
    if (dockItem) {
      dockItem.classList.add("active")
    }
  }

  createWindow(appName) {
    const windowsContainer = document.getElementById("windows-container")
    const window = document.createElement("div")
    window.className = "window active"
    window.dataset.app = appName

    const windowId = `window-${appName}-${Date.now()}`
    window.id = windowId

    // Random position
    const x = Math.random() * (window.innerWidth - 600) + 50
    const y = Math.random() * (window.innerHeight - 400) + 80

    window.style.left = `${x}px`
    window.style.top = `${y}px`
    window.style.zIndex = ++this.windowZIndex

    const content = this.getAppContent(appName)

    window.innerHTML = `
            <div class="window-header">
                <div class="window-controls">
                    <div class="window-control close" data-action="close"></div>
                    <div class="window-control minimize" data-action="minimize"></div>
                    <div class="window-control maximize" data-action="maximize"></div>
                </div>
                <div class="window-title">${this.getAppTitle(appName)}</div>
            </div>
            <div class="window-content">
                ${content}
            </div>
        `

    // Add window controls
    window.querySelector(".close").addEventListener("click", () => this.closeWindow(appName))
    window.querySelector(".minimize").addEventListener("click", () => this.minimizeWindow(appName))
    window.querySelector(".maximize").addEventListener("click", () => this.maximizeWindow(appName))

    // Focus on click
    window.addEventListener("mousedown", () => this.focusWindow(appName))

    windowsContainer.appendChild(window)
    this.activeWindow = appName

    // Setup app-specific functionality
    if (appName === "terminal") {
      this.setupTerminal(window)
    } else if (appName === "music") {
      this.setupMusicApp(window)
    }

    return window
  }

  getAppTitle(appName) {
    const titles = {
      finder: "Finder",
      safari: "Safari",
      mail: "Mail",
      calendar: "Calendar",
      calculator: "Calculator",
      notes: "Notes",
      photos: "Photos",
      music: "Music",
      settings: "System Preferences",
      terminal: "Terminal",
      tutorial: "SomuOS Tutorial",
    }
    return titles[appName] || "Application"
  }

  getAppContent(appName) {
    switch (appName) {
      case "finder":
        return this.getFinderContent()
      case "calculator":
        return this.getCalculatorContent()
      case "safari":
        return this.getSafariContent()
      case "notes":
        return this.getNotesContent()
      case "calendar":
        return this.getCalendarContent()
      case "terminal":
        return this.getTerminalContent()
      case "settings":
        return this.getSettingsContent()
      case "tutorial":
        return this.getTutorialContent()
      case "music":
        return this.getMusicContent()
      default:
        return `<h2>Welcome to ${this.getAppTitle(appName)}</h2><p>This is a demo application.</p>`
    }
  }

  getTerminalContent() {
    return `
      <div class="terminal-container" id="terminal-container">
        <div class="terminal-header">
          SomuOS Terminal v1.0 - Type 'help' for available commands
        </div>
        <div id="terminal-output"></div>
        <div class="terminal-line">
          <span class="terminal-prompt">somu-user@SomuOS:~$</span>
          <input type="text" class="terminal-input" id="terminal-input" autocomplete="off">
          <span class="terminal-cursor"></span>
        </div>
      </div>
    `
  }

  setupTerminal(window) {
    const input = window.querySelector("#terminal-input")
    const output = window.querySelector("#terminal-output")

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const command = input.value.trim()
        this.executeCommand(command, output)
        input.value = ""
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        if (this.terminalHistory.length > 0) {
          input.value = this.terminalHistory[this.terminalHistory.length - 1]
        }
      }
    })

    // Focus input when terminal is clicked
    window.addEventListener("click", () => {
      input.focus()
    })

    input.focus()
  }

  executeCommand(command, output) {
    if (!command) return

    this.terminalHistory.push(command)

    // Add command to output
    const commandLine = document.createElement("div")
    commandLine.innerHTML = `<span class="terminal-prompt">somu-user@SomuOS:~$</span> ${command}`
    output.appendChild(commandLine)

    const parts = command.split(" ")
    const cmd = parts[0]
    const args = parts.slice(1)

    let result = ""

    if (cmd === "clear") {
      output.innerHTML = ""
      return
    }

    if (this.terminalCommands[cmd]) {
      if (typeof this.terminalCommands[cmd] === "function") {
        result = this.terminalCommands[cmd](args)
      } else {
        result = this.terminalCommands[cmd]
      }
    } else {
      result = `Command not found: ${cmd}. Type 'help' for available commands.`
    }

    if (result) {
      const resultLine = document.createElement("div")
      resultLine.className =
        cmd === "help" || result.includes("Command not found") ? "terminal-error" : "terminal-output"
      resultLine.innerHTML = result.replace(/\n/g, "<br>")
      output.appendChild(resultLine)
    }

    // Scroll to bottom
    output.scrollTop = output.scrollHeight
  }

  getTutorialContent() {
    return `
      <div class="tutorial-container">
        <div class="tutorial-nav">
          <div class="tutorial-tab active" data-tab="basics">Basics</div>
          <div class="tutorial-tab" data-tab="apps">Applications</div>
          <div class="tutorial-tab" data-tab="shortcuts">Shortcuts</div>
          <div class="tutorial-tab" data-tab="tips">Tips & Tricks</div>
        </div>
        
        <div class="tutorial-content" id="tutorial-content">
          <div class="tutorial-section">
            <h3>Welcome to SomuOS!</h3>
            <p>SomuOS is a modern operating system built with web technologies. Here's how to get started:</p>
            
            <h3>🖱️ Basic Navigation</h3>
            <ul>
              <li><strong>Dock:</strong> Click on icons in the bottom dock to open applications</li>
              <li><strong>Launchpad:</strong> Click the rocket icon to see all applications</li>
              <li><strong>Spotlight:</strong> Click the search icon or press Cmd+Space to search</li>
              <li><strong>Windows:</strong> Drag windows by their title bar to move them</li>
            </ul>

            <h3>🎯 Window Controls</h3>
            <ul>
              <li><strong>Red button:</strong> Close window</li>
              <li><strong>Yellow button:</strong> Minimize window</li>
              <li><strong>Green button:</strong> Maximize/restore window</li>
            </ul>

            <h3>🖱️ Right-Click Menu</h3>
            <p>Right-click on the desktop to access options like changing wallpaper and system info.</p>
          </div>
        </div>
      </div>
    `
  }

  getMusicContent() {
    return `
    <div class="music-container">
      <div class="music-header">
        <img src="public/images/itry-music-logo.png" alt="Itry Music" class="music-logo">
        <div>
          <h3>Itry Music</h3>
          <p>Лучший музыкальный сервис</p>
        </div>
      </div>
      <iframe 
        src="https://www.music.itrypro.ru" 
        class="music-iframe"
        title="Itry Music"
        allow="autoplay; encrypted-media">
      </iframe>
      <div class="music-controls">
        <div>
          <button class="music-control-btn" id="music-prev">⏮</button>
          <button class="music-control-btn" id="music-play">▶️</button>
          <button class="music-control-btn" id="music-next">⏭</button>
        </div>
        <div style="flex: 1; margin: 0 16px;">
          <div class="music-progress">
            <div class="music-progress-fill"></div>
          </div>
        </div>
        <button class="music-control-btn" id="music-mini">📱</button>
      </div>
    </div>
    <div class="music-mini-player" id="music-mini-player">
      <div class="music-mini-header">
        <div class="music-mini-title">Itry Music</div>
        <button class="music-mini-close" id="music-mini-close">✕</button>
      </div>
      <div class="music-progress">
        <div class="music-progress-fill"></div>
      </div>
      <div class="music-mini-controls">
        <button class="music-mini-btn">⏮</button>
        <button class="music-mini-btn">▶️</button>
        <button class="music-mini-btn">⏭</button>
      </div>
    </div>
  `
  }

  getFinderContent() {
    return `
            <div style="display: flex; height: 100%;">
                <div class="finder-sidebar">
                    <div class="finder-item">
                        <span>🏠</span> Home
                    </div>
                    <div class="finder-item">
                        <span>📄</span> Documents
                    </div>
                    <div class="finder-item">
                        <span>⬇️</span> Downloads
                    </div>
                    <div class="finder-item">
                        <span>🖼️</span> Pictures
                    </div>
                    <div class="finder-item">
                        <span>🎵</span> Music
                    </div>
                    <div class="finder-item">
                        <span>🎬</span> Movies
                    </div>
                </div>
                <div class="finder-main">
                    <h3>Desktop</h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 16px; margin-top: 16px;">
                        <div style="text-align: center; cursor: pointer;">
                            <div style="font-size: 48px;">📁</div>
                            <div style="font-size: 12px;">SomuOS Files</div>
                        </div>
                        <div style="text-align: center; cursor: pointer;">
                            <div style="font-size: 48px;">📄</div>
                            <div style="font-size: 12px;">README.txt</div>
                        </div>
                        <div style="text-align: center; cursor: pointer;">
                            <div style="font-size: 48px;">🖼️</div>
                            <div style="font-size: 12px;">Wallpapers</div>
                        </div>
                    </div>
                </div>
            </div>
        `
  }

  getCalculatorContent() {
    return `
            <div style="width: 300px;">
                <div class="calculator-display" id="calc-display">0</div>
                <div class="calculator-buttons">
                    <button class="calc-btn" onclick="somuOS.clearCalculator()">C</button>
                    <button class="calc-btn" onclick="somuOS.calcInput('±')">±</button>
                    <button class="calc-btn" onclick="somuOS.calcInput('%')">%</button>
                    <button class="calc-btn operator" onclick="somuOS.calcInput('÷')">÷</button>
                    
                    <button class="calc-btn" onclick="somuOS.calcInput('7')">7</button>
                    <button class="calc-btn" onclick="somuOS.calcInput('8')">8</button>
                    <button class="calc-btn" onclick="somuOS.calcInput('9')">9</button>
                    <button class="calc-btn operator" onclick="somuOS.calcInput('×')">×</button>
                    
                    <button class="calc-btn" onclick="somuOS.calcInput('4')">4</button>
                    <button class="calc-btn" onclick="somuOS.calcInput('5')">5</button>
                    <button class="calc-btn" onclick="somuOS.calcInput('6')">6</button>
                    <button class="calc-btn operator" onclick="somuOS.calcInput('-')">-</button>
                    
                    <button class="calc-btn" onclick="somuOS.calcInput('1')">1</button>
                    <button class="calc-btn" onclick="somuOS.calcInput('2')">2</button>
                    <button class="calc-btn" onclick="somuOS.calcInput('3')">3</button>
                    <button class="calc-btn operator" onclick="somuOS.calcInput('+')">+</button>
                    
                    <button class="calc-btn zero" onclick="somuOS.calcInput('0')">0</button>
                    <button class="calc-btn" onclick="somuOS.calcInput('.')">.</button>
                    <button class="calc-btn operator" onclick="somuOS.calculateResult()">=</button>
                </div>
            </div>
        `
  }

  getSafariContent() {
    return `
            <div>
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 20px; padding: 12px; background: rgba(0,0,0,0.05); border-radius: 8px;">
                    <button style="padding: 8px 12px; border: none; border-radius: 6px; background: rgba(0,0,0,0.1); cursor: pointer;">←</button>
                    <button style="padding: 8px 12px; border: none; border-radius: 6px; background: rgba(0,0,0,0.1); cursor: pointer;">→</button>
                    <input type="text" value="https://somuos.local" style="flex: 1; padding: 8px 12px; border: 1px solid rgba(0,0,0,0.2); border-radius: 6px; outline: none;">
                </div>
                <div style="text-align: center; padding: 40px;">
                    <h1 style="font-size: 48px; margin-bottom: 20px;">🧭</h1>
                    <h2>SomuOS Safari</h2>
                    <p style="color: #666; margin-top: 12px;">The best way to browse the web on SomuOS</p>
                    <div style="margin-top: 24px;">
                        <button style="padding: 12px 24px; background: #007AFF; color: white; border: none; border-radius: 8px; cursor: pointer; margin: 0 8px;">Visit SomuOS.com</button>
                        <button style="padding: 12px 24px; background: rgba(0,0,0,0.1); border: none; border-radius: 8px; cursor: pointer; margin: 0 8px;">Bookmarks</button>
                    </div>
                </div>
            </div>
        `
  }

  getNotesContent() {
    return `
            <div style="height: 100%;">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
                    <button style="padding: 6px 12px; border: none; border-radius: 6px; background: #007AFF; color: white; cursor: pointer;">New Note</button>
                    <button style="padding: 6px 12px; border: none; border-radius: 6px; background: rgba(0,0,0,0.1); cursor: pointer;">Delete</button>
                </div>
                <textarea placeholder="Welcome to SomuOS Notes!

Start typing your thoughts here..." style="width: 100%; height: 300px; border: 1px solid rgba(0,0,0,0.2); border-radius: 8px; padding: 16px; font-family: inherit; font-size: 14px; resize: none; outline: none;"></textarea>
            </div>
        `
  }

  getCalendarContent() {
    const today = new Date()
    const month = today.toLocaleString("default", { month: "long" })
    const year = today.getFullYear()

    return `
            <div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h2>${month} ${year}</h2>
                    <div>
                        <button style="padding: 6px 12px; border: none; border-radius: 6px; background: rgba(0,0,0,0.1); cursor: pointer; margin-right: 8px;">←</button>
                        <button style="padding: 6px 12px; border: none; border-radius: 6px; background: rgba(0,0,0,0.1); cursor: pointer;">→</button>
                    </div>
                </div>
                <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 1px; background: rgba(0,0,0,0.1); border-radius: 8px; overflow: hidden;">
                    ${["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
                      .map(
                        (day) =>
                          `<div style="padding: 12px; background: rgba(0,0,0,0.05); text-align: center; font-weight: 600; font-size: 12px;">${day}</div>`,
                      )
                      .join("")}
                    ${Array.from({ length: 35 }, (_, i) => {
                      const day = i - 6 // Adjust for month start
                      const isToday = day === today.getDate()
                      return `<div style="padding: 12px; background: white; text-align: center; cursor: pointer; ${isToday ? "background: #007AFF; color: white; font-weight: 600;" : ""}">${day > 0 && day <= 31 ? day : ""}</div>`
                    }).join("")}
                </div>
            </div>
        `
  }

  getSettingsContent() {
    return `
            <div style="display: flex; height: 400px;">
                <div style="width: 200px; background: rgba(0,0,0,0.05); padding: 16px; border-right: 1px solid rgba(0,0,0,0.1);">
                    <div style="margin-bottom: 12px; padding: 8px; border-radius: 6px; background: #007AFF; color: white; cursor: pointer;">🖥️ General</div>
                    <div style="margin-bottom: 8px; padding: 8px; border-radius: 6px; cursor: pointer;">🖼️ Desktop & Screen Saver</div>
                    <div style="margin-bottom: 8px; padding: 8px; border-radius: 6px; cursor: pointer;">🔒 Security & Privacy</div>
                    <div style="margin-bottom: 8px; padding: 8px; border-radius: 6px; cursor: pointer;">📶 Network</div>
                    <div style="margin-bottom: 8px; padding: 8px; border-radius: 6px; cursor: pointer;">🔊 Sound</div>
                    <div style="margin-bottom: 8px; padding: 8px; border-radius: 6px; cursor: pointer;">⌨️ Keyboard</div>
                </div>
                <div style="flex: 1; padding: 20px;">
                    <h2>SomuOS Preferences</h2>
                    <div style="margin-top: 20px;">
                        <div style="margin-bottom: 16px;">
                            <label style="display: block; margin-bottom: 8px; font-weight: 600;">Appearance:</label>
                            <select style="padding: 8px; border: 1px solid rgba(0,0,0,0.2); border-radius: 6px;">
                                <option>Light</option>
                                <option>Dark</option>
                                <option>Auto</option>
                            </select>
                        </div>
                        <div style="margin-bottom: 16px;">
                            <label style="display: flex; align-items: center; gap: 8px;">
                                <input type="checkbox" checked>
                                <span>Use dark menu bar and Dock</span>
                            </label>
                        </div>
                        <div style="margin-bottom: 16px;">
                            <label style="display: flex; align-items: center; gap: 8px;">
                                <input type="checkbox">
                                <span>Automatically hide and show the menu bar</span>
                            </label>
                        </div>
                        <div style="margin-bottom: 16px;">
                            <label style="display: flex; align-items: center; gap: 8px;">
                                <input type="checkbox" checked>
                                <span>Show SomuOS logo in menu bar</span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        `
  }

  // Calculator methods
  clearCalculator() {
    document.getElementById("calc-display").textContent = "0"
  }

  calcInput(value) {
    const display = document.getElementById("calc-display")
    if (display.textContent === "0") {
      display.textContent = value
    } else {
      display.textContent += value
    }
  }

  calculateResult() {
    const display = document.getElementById("calc-display")
    try {
      const expression = display.textContent.replace(/×/g, "*").replace(/÷/g, "/").replace(/−/g, "-")
      const result = eval(expression)
      display.textContent = result
    } catch (e) {
      display.textContent = "Error"
    }
  }

  // Window management
  focusWindow(appName) {
    document.querySelectorAll(".window").forEach((w) => w.classList.remove("active"))
    const window = this.windows.get(appName)
    if (window) {
      window.classList.add("active")
      window.style.zIndex = ++this.windowZIndex
      this.activeWindow = appName
    }
  }

  closeWindow(appName) {
    const window = this.windows.get(appName)
    if (window) {
      window.remove()
      this.windows.delete(appName)

      // Update dock
      const dockItem = document.querySelector(`[data-app="${appName}"]`)
      if (dockItem) {
        dockItem.classList.remove("active")
      }
    }
  }

  minimizeWindow(appName) {
    const window = this.windows.get(appName)
    if (window) {
      window.style.transform = "scale(0.1)"
      window.style.opacity = "0"
      setTimeout(() => {
        window.style.display = "none"
      }, 300)
    }
  }

  maximizeWindow(appName) {
    const window = this.windows.get(appName)
    if (window) {
      if (window.dataset.maximized === "true") {
        // Restore
        window.style.width = ""
        window.style.height = ""
        window.style.left = window.dataset.originalLeft
        window.style.top = window.dataset.originalTop
        window.dataset.maximized = "false"
      } else {
        // Maximize
        window.dataset.originalLeft = window.style.left
        window.dataset.originalTop = window.style.top
        window.style.left = "0"
        window.style.top = "24px"
        window.style.width = "100vw"
        window.style.height = "calc(100vh - 24px)"
        window.dataset.maximized = "true"
      }
    }
  }

  // Window dragging
  startWindowDrag(e) {
    const windowElement = e.target.closest(".window")
    if (!windowElement) return

    this.draggedWindow = windowElement
    const rect = windowElement.getBoundingClientRect()
    this.dragOffset = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    }

    windowElement.style.cursor = "grabbing"
    e.preventDefault()
  }

  dragWindow(e) {
    if (!this.draggedWindow) return

    const x = e.clientX - this.dragOffset.x
    const y = Math.max(24, e.clientY - this.dragOffset.y) // Don't go above menu bar

    this.draggedWindow.style.left = `${x}px`
    this.draggedWindow.style.top = `${y}px`
  }

  stopWindowDrag() {
    if (this.draggedWindow) {
      this.draggedWindow.style.cursor = ""
      this.draggedWindow = null
    }
  }

  setupMusicApp(window) {
    const miniBtn = window.querySelector("#music-mini")
    const miniPlayer = document.getElementById("music-mini-player")
    const closeBtn = document.getElementById("music-mini-close")

    if (miniBtn) {
      miniBtn.addEventListener("click", () => {
        miniPlayer.classList.add("active")
      })
    }

    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        miniPlayer.classList.remove("active")
      })
    }

    // Имитация прогресса воспроизведения
    const progressFills = document.querySelectorAll(".music-progress-fill")
    let progress = 30

    setInterval(() => {
      progress = (progress + 1) % 100
      progressFills.forEach((fill) => {
        fill.style.width = `${progress}%`
      })
    }, 1000)
  }
}

// Initialize SomuOS
const somuOS = new SomuOS()

// Make it globally available for calculator
window.somuOS = somuOS
