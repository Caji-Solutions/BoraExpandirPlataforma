const fs = require('fs');
const files = [
  'src/controllers/financeiro/FinanceiroController.ts',
  'src/controllers/comercial/ComercialController.ts',
  'src/controllers/cliente/ClienteProfileController.ts',
  'src/controllers/cliente/ClienteFormulariosController.ts',
  'src/controllers/cliente/ClienteController.ts',
  'src/controllers/cliente/ClienteContratosController.ts'
];
files.forEach(f => {
  let c = fs.readFileSync(f, 'utf8');
  c = c.replace(/import\('\.\.\/(?!\.)/g, "import('../../");
  fs.writeFileSync(f, c);
});
console.log('Fixed dynamic imports!');
