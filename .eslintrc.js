module.exports = {
  extends: [
    'erb', // 关闭eslint配置中与prettier冲突的格式化规则
    'prettier',
    'prettier/react',
    'prettier/@typescript-eslint',
  ],
  rules: {
    // A temporary hack related to IDE not resolving correct package.json
    'import/no-extraneous-dependencies': 'off',
    'jsx-a11y/no-static-element-interactions': 0,
    'no-underscore-dangle': 'off',
    'class-methods-use-this': 'off',
    'no-empty-function': 'off',
    'jsx-a11y/click-events-have-key-events': 'off',
    'typescript-eslint/naming-convention': 'off',
    'import/prefer-default-export': 'off',
    'no-plusplus': 'off',
    '@typescript-eslint/no-use-before-define': 'off',
    '@typescript-eslint/no-shadow': 'off',
    'consistent-return': 0,
    '@typescript-eslint/no-unused-expressions': 'off',
    'react/prop-types': 'off',
    'no-await-in-loop': 'off',
    'jsx-a11y/no-noninteractive-element-interactions': 'off',
    '@typescript-eslint/naming-convention': 'off',
  },
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
    createDefaultProgram: true,
  },
  settings: {
    'import/resolver': {
      // See https://github.com/benmosher/eslint-plugin-import/issues/1396#issuecomment-575727774 for line below
      node: {},
      webpack: {
        config: require.resolve('./.erb/configs/webpack.config.eslint.js'),
      },
    },
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
    },
  },
};
