const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'apps', 'frontend', 'pages', 'index.tsx');

// Read the file
let content = fs.readFileSync(filePath, 'utf8');

// Replace Grid2 import
content = content.replace(/import {([^}]+)}(\s+)from '@mui\/material';/, (match, imports) => {
  // Remove Grid from the imports if it exists
  const importsList = imports
    .split(',')
    .map(i => i.trim())
    .filter(i => i !== 'Grid');
  return `import Grid from '@mui/system/Unstable_Grid2';\nimport {${importsList.join(', ')}} from '@mui/material';`;
});

// Replace all Grid component usage - remove container and item props
// Replace <Grid container> with <Grid container>
content = content.replace(/<Grid container([^>]*)>/g, '<Grid container$1>');

// Replace <Grid item with <Grid size
content = content.replace(/<Grid item ([^>]*)>/g, (match, props) => {
  // Convert xs={12} md={6} to size={{ xs: 12, md: 6 }}
  const sizeProps = {};

  // Extract xs, sm, md, lg, xl properties
  const xsMatch = props.match(/xs={(\d+)}/);
  const smMatch = props.match(/sm={(\d+)}/);
  const mdMatch = props.match(/md={(\d+)}/);
  const lgMatch = props.match(/lg={(\d+)}/);
  const xlMatch = props.match(/xl={(\d+)}/);

  if (xsMatch) sizeProps.xs = xsMatch[1];
  if (smMatch) sizeProps.sm = smMatch[1];
  if (mdMatch) sizeProps.md = mdMatch[1];
  if (lgMatch) sizeProps.lg = lgMatch[1];
  if (xlMatch) sizeProps.xl = xlMatch[1];

  // Build size prop
  const sizeEntries = Object.entries(sizeProps)
    .map(([key, val]) => `${key}: ${val}`)
    .join(', ');
  const sizeProp = sizeEntries ? `size={{ ${sizeEntries} }}` : '';

  // Remove the xs, sm, md, lg, xl from original props
  const otherProps = props
    .replace(/\s*xs={(\d+)}/g, '')
    .replace(/\s*sm={(\d+)}/g, '')
    .replace(/\s*md={(\d+)}/g, '')
    .replace(/\s*lg={(\d+)}/g, '')
    .replace(/\s*xl={(\d+)}/g, '')
    .trim();

  return `<Grid ${sizeProp} ${otherProps}>`.replace(/\s+/g, ' ').trim();
});

// Write back
fs.writeFileSync(filePath, content, 'utf8');

console.log('✅ Fixed MUI Grid usage in index.tsx');
