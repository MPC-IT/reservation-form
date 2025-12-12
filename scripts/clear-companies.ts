import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clearCompanies() {
  try {
    console.log('Starting to clear companies and related data...');
    
    // Delete all profiles first (they reference companies and setups)
    const deletedProfiles = await prisma.profile.deleteMany({});
    console.log(`Deleted ${deletedProfiles.count} profiles`);
    
    // Try to delete team calls if the table exists
    try {
      const deletedTeamCalls = await prisma.teamCall.deleteMany({});
      console.log(`Deleted ${deletedTeamCalls.count} team calls`);
    } catch (error) {
      console.log('TeamCall table does not exist, skipping...');
    }
    
    // Delete all setups (they reference companies)
    const deletedSetups = await prisma.setup.deleteMany({});
    console.log(`Deleted ${deletedSetups.count} setups`);
    
    // Finally delete all companies
    const deletedCompanies = await prisma.company.deleteMany({});
    console.log(`Deleted ${deletedCompanies.count} companies`);
    
    console.log('Successfully cleared all companies, setups, and related data!');
    console.log('You can now reupload your reservation data.');
    
  } catch (error) {
    console.error('Error clearing companies:', error);
  } finally {
    await prisma.$disconnect();
  }
}

clearCompanies();
