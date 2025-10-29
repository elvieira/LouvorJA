module.exports = {
  presets: [
    [
      "@babel/preset-env",
      {
        modules: false,
        useBuiltIns: "usage",
        corejs: 3,
        targets: {
          browsers: [
            "> 1%",
            "last 2 versions",
            "not dead",
            "not ie 11",
          ],
        },
      },
    ],
  ],
  env: {
    test: {
      presets: [
        [
          "@babel/preset-env",
          {
            targets: { node: "current" },
          },
        ],
      ],
    },
  },
};
