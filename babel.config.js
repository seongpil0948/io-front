module.exports = {
  presets: ["@vue/cli-plugin-babel/preset"],
  overrides: [
    {
      test: /\.js$/,
      compact: false,
    },
    {
      test: "**/node_modules/**",
      compact: false,
    },
    {
      test: "**/administrationAreas.ts",
      compact: false,
    },
  ],
  // loaders: [{ test: /\.js$/, loader: "babel", query: { compact: false } }],
};
