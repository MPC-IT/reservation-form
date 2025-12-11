// Adobe-style Dark Theme Design Tokens
export const theme = {
  // Colors
  colors: {
    surface: '#FFFFFF',
    surfacePanel: '#F8F9FA',
    surfaceHighlight: '#E9ECEF',
    border: '#DEE2E6',
    borderLight: '#E9ECEF',
    
    accent: '#4F8BFF',
    accentHover: '#6FA0FF',
    
    textPrimary: '#212529',
    textSecondary: '#6C757D',
    textMuted: '#ADB5BD',
    
    success: '#2ECC71',
    warning: '#F4D03F',
    error: '#E74C3C',
  },
  
  // Border radius
  radius: {
    sm: '4px',
    md: '6px',
    lg: '8px',
  },
  
  // Typography
  typography: {
    h1: {
      fontSize: '24px',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    h2: {
      fontSize: '20px',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    h3: {
      fontSize: '18px',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    body: {
      fontSize: '15px',
      fontWeight: 400,
      lineHeight: 1.2,
    },
    small: {
      fontSize: '13px',
      fontWeight: 400,
      lineHeight: 1.5,
    },
    label: {
      fontSize: '13px',
      fontWeight: 300,
      lineHeight: 1.5,
    },
  },
  
  // Spacing scale
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
  },
  
  // CSS custom properties for use in stylesheets
  css: `
    :root {
      --surface: #FFFFFF;
      --surface-panel: #F8F9FA;
      --surface-highlight: #E9ECEF;
      --border: #DEE2E6;
      --border-light: #E9ECEF;
      
      --accent: #4F8BFF;
      --accent-hover: #6FA0FF;
      
      --text-primary: #212529;
      --text-secondary: #6C757D;
      --text-muted: #ADB5BD;
      
      --success: #2ECC71;
      --warning: #F4D03F;
      --error: #E74C3C;
      
      --radius-sm: 4px;
      --radius-md: 6px;
      --radius-lg: 8px;
      
      --spacing-xs: 4px;
      --spacing-sm: 8px;
      --spacing-md: 16px;
      --spacing-lg: 24px;
      --spacing-xl: 32px;
      --spacing-xxl: 48px;
      
      --h1-size: 24px;
      --h1-weight: 600;
      --h2-size: 20px;
      --h2-weight: 600;
      --h3-size: 18px;
      --h3-weight: 600;
      --body-size: 15px;
      --body-weight: 400;
      --body-line-height: 1.2;
      --small-size: 13px;
      --small-weight: 400;
      --label-size: 13px;
      --label-weight: 300;
    }
  `
};

export default theme;
