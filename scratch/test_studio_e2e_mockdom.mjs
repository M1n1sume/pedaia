import fs from 'fs';

// If jsdom is not available, we can mock basic DOM
console.log('Testing full HTML and listeners setup...');
const html = fs.readFileSync('public/index.html', 'utf8');

// We test if imports and modules load without errors
try {
  const aiOutputMod = await import('../public/js/views/aiOutputStudio.js');
  const rendered = aiOutputMod.renderAiOutputStudioView();
  console.log('AiOutputStudio rendered successfully. Length:', rendered.length);

  // Check all template variables
  const appMod = await import('../public/js/app.js');
  console.log('app.js imported successfully.');
  
  const stateMod = await import('../public/js/state.js');
  console.log('state.js imported successfully.');
  
  const authModalMod = await import('../public/js/views/authModal.js');
  console.log('authModal.js imported successfully.');
  
  const adminDashMod = await import('../public/js/views/adminDashboard.js');
  console.log('adminDashboard.js imported successfully.');
  
} catch (e) {
  console.error('ERROR during module import / render:', e);
  process.exit(1);
}
