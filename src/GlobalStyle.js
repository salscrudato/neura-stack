import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  :root {
    --bg-dark:        #121212;
    --bg-panel:       #1f1f1f;
    --text-primary:   #e0e0e0;
    --text-secondary: #888888;
    --placeholder:    #555555;
    --accent:         #007bff;
  }

  *, *::before, *::after {
    box-sizing: border-box;
  }

  body {
    margin: 0;
    padding: 0;
    background: var(--bg-dark);
    color: var(--text-primary);
    font-family: 'Roboto', sans-serif;
  }

  a {
    color: var(--accent);
    text-decoration: none;
  }
`;

export default GlobalStyle;
