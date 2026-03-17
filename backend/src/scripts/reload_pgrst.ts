import { prisma } from '../config/database';

async function main() {
  console.log('Forçando recarregamento do cache do PostgREST...');
  
  try {
    await prisma.$executeRawUnsafe(`NOTIFY pgrst, 'reload schema';`);
    console.log('Notificação enviada com sucesso.');
  } catch (error) {
    console.error('Erro ao enviar notificação:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
