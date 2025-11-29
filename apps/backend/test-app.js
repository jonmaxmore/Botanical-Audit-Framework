try {
  require('./src/core/App');
  console.log('App loaded successfully');
} catch (error) {
  console.error('Failed to load App:', error);
}
