module.exports = {
  root: true,
  env: {
    node: true,
    browser: true,
    es2022: true,
  },
  extends: [
    'plugin:vue/vue3-recommended',
    'eslint:recommended',
  ],
  parserOptions: {
    parser: '@babel/eslint-parser',
    ecmaVersion: 'latest',
    sourceType: 'module',
    requireConfigFile: false,
  },
  rules: {
    // Vue.js rules
    'vue/multi-word-component-names': 'warn',
    'vue/no-unused-vars': 'warn',
    'vue/no-unused-components': 'warn',
    'vue/require-default-prop': 'warn',
    'vue/require-prop-types': 'warn',
    'vue/component-name-in-template-casing': ['warn', 'PascalCase'],
    'vue/html-self-closing': ['warn', {
      html: {
        void: 'always',
        normal: 'always',
        component: 'always',
      },
    }],
    'vue/max-attributes-per-line': ['warn', {
      singleline: 3,
      multiline: 1,
    }],
    'vue/html-indent': ['warn', 2],
    'vue/script-indent': ['warn', 2, { baseIndent: 0 }],
    
    // JavaScript rules
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-unused-vars': ['warn', { 
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
    }],
    'no-var': 'error',
    'prefer-const': 'warn',
    'prefer-arrow-callback': 'warn',
    'prefer-template': 'warn',
    'object-shorthand': 'warn',
    'quote-props': ['warn', 'as-needed'],
    
    // Code quality
    'eqeqeq': ['warn', 'always'],
    'no-duplicate-imports': 'error',
    'no-useless-return': 'warn',
    'no-else-return': 'warn',
    'consistent-return': 'off', // Pode ser restritivo demais
    
    // Style (opcional - ajuste conforme preferência)
    'indent': ['warn', 2, { SwitchCase: 1 }],
    'quotes': ['warn', 'double', { avoidEscape: true }],
    'semi': ['warn', 'always'],
    'comma-dangle': ['warn', 'always-multiline'],
    'arrow-spacing': 'warn',
    'space-before-function-paren': ['warn', {
      anonymous: 'always',
      named: 'never',
      asyncArrow: 'always',
    }],
  },
  ignorePatterns: [
    'node_modules/',
    'dist/',
    'dist-mobile/',
    'dev-dist/',
    '*.min.js',
  ],
};
