module.exports = {
  files: [
    "examples/**/*.html",
    "examples/**/*.css",
    "examples/**/*.js",
    "index.html"
  ],
  server: {
    baseDir: ".",
    index: "index.html"
  },
  port: 8000,
  open: true,
  notify: false,
  logLevel: "silent",
  ignore: [
    "node_modules/**",
     ".idea/**",
    ".git/**",
    "scripts/**",
    "*.json",
    "*.md"
  ]
};


