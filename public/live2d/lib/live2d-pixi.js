// Stub version of Live2D SDK for testing
console.log("📦 Live2D SDK loaded")

window.Live2D = {
  loadModel: function(url) {
    return new Promise((resolve, reject) => {
      console.log("⏳ Simulated model load from:", url)
      setTimeout(() => {
        resolve({
          position: {
            set(x, y) {
              console.log("Avatar moved to", x, y)
            }
          },
          scale: {
            set() {}
          }
        })
      }, 1000)
    })
  }
}