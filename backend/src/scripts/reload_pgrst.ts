import { prisma } from '../config/database';

async function main() {
  console.log('Forcando recarregamento do cache do PostgREST...');
  
  try {
    await prisma.$executeRawUnsafe(`NOTIFY pgrst, 'reload schema';`);
    console.log('Notificacao enviada com sucesso.');
  } catch (error) {
    console.error('Erro ao enviar notificacao:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
