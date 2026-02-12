/** @type {import("stylelint").Config} */
export default {
  extends: [
    "stylelint-config-standard",
    "@dreamsicle.io/stylelint-config-tailwindcss",
    "stylelint-config-html",
    "stylelint-config-alphabetical-order",
  ],
  ignoreFiles: ["**/node_modules/**", "**/dist/**", "**/.astro/**"],
};
