// Script de verificación de roles para debug
import { ROLES, ACCESS_LEVELS } from './src/utils/roles.js';

console.log('🔍 Verificando definiciones de roles...');

console.log('\n📋 ROLES definidos:');
Object.entries(ROLES).forEach(([key, value]) => {
  console.log(`  ${key}: "${value}"`);
});

console.log('\n🔑 ACCESS_LEVELS definidos:');
Object.entries(ACCESS_LEVELS).forEach(([key, value]) => {
  console.log(`  ${key}: "${value}"`);
});

console.log('\n✅ Todos los roles están definidos correctamente');

// Verificar algunos casos específicos que estaban causando problemas
const problemCases = [
  'ROLES.VIEWER',
  'ACCESS_LEVELS.SUPER_ADMIN',
  'ACCESS_LEVELS.ADMINISTRADOR',
  'ROLES.SUPER_ADMIN (no debería existir)',
  'ROLES.ARTIST_ADMIN (no debería existir)'
];

console.log('\n🧪 Verificando casos problemáticos:');
console.log(`  ROLES.VIEWER: ${ROLES.VIEWER || 'UNDEFINED'}`);
console.log(`  ACCESS_LEVELS.SUPER_ADMIN: ${ACCESS_LEVELS.SUPER_ADMIN || 'UNDEFINED'}`);
console.log(`  ACCESS_LEVELS.ADMINISTRADOR: ${ACCESS_LEVELS.ADMINISTRADOR || 'UNDEFINED'}`);
console.log(`  ROLES.SUPER_ADMIN: ${ROLES.SUPER_ADMIN || 'UNDEFINED (correcto)'}`);
console.log(`  ROLES.ARTIST_ADMIN: ${ROLES.ARTIST_ADMIN || 'UNDEFINED (correcto)'}`);
