#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Lista de archivos a actualizar basada en los resultados de grep
const filesToUpdate = [
  'd:\\Apps\\app-artistpro\\src\\app\\analisis\\rrss\\page.js',
  'd:\\Apps\\app-artistpro\\src\\app\\analisis\\eventos\\page.js',
  'd:\\Apps\\app-artistpro\\src\\app\\analisis\\prensa\\page.js',
  'd:\\Apps\\app-artistpro\\src\\app\\analisis\\plataformas\\page.js',
  'd:\\Apps\\app-artistpro\\src\\app\\equipo\\page.js',
  'd:\\Apps\\app-artistpro\\src\\app\\notas\\page.js',
  'd:\\Apps\\app-artistpro\\src\\app\\blog\\page.js',
  'd:\\Apps\\app-artistpro\\src\\app\\gestion-proyectos\\proyectos\\page.js',
  'd:\\Apps\\app-artistpro\\src\\app\\gestion-proyectos\\actividades\\page.js',
  'd:\\Apps\\app-artistpro\\src\\app\\gestion-proyectos\\kanban\\page.js',
  'd:\\Apps\\app-artistpro\\src\\app\\gestion-proyectos\\gantt\\page.js',
  'd:\\Apps\\app-artistpro\\src\\app\\admin\\database\\page.js',
  'd:\\Apps\\app-artistpro\\src\\app\\admin\\debug\\page.js',
  'd:\\Apps\\app-artistpro\\src\\app\\admin\\solicitudes\\page.js',
  'd:\\Apps\\app-artistpro\\src\\app\\admin\\acceso\\page.js',
  'd:\\Apps\\app-artistpro\\src\\app\\epk\\page.js'
];

function updateFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Remover declaración de state del theme
    content = content.replace(/const \[theme, setTheme\] = useState\([^)]*\);\s*\n/g, '');
    
    // Remover import de useState si ya no se usa (solo si theme era el único use)
    if (!content.includes('useState(') && content.includes('import { useState }')) {
      content = content.replace('import { useState }', 'import {');
      content = content.replace('import { }', 'import');
      content = content.replace(/import\s*{\s*}\s*from\s*"react";\s*\n/, '');
    }
    
    // Actualizar las llamadas a Sidebar
    content = content.replace(/(<Sidebar)\s+theme=\{theme\}\s+setTheme=\{setTheme\}(>)/g, '$1$2');
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
  } catch (error) {
    console.error(`Error updating ${filePath}:`, error.message);
  }
}

console.log('Updating theme-related files...');
filesToUpdate.forEach(updateFile);
console.log('Update complete!');
