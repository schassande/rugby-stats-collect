import { LocalAuthService } from '../services/local-auth.service';

export async function setupLocalUsers(localAuth: LocalAuthService) {
  // Create a default development local user if none exists
  const existing = await localAuth.getAllLocalUsers();
  if (existing.length > 0) return;

  try {
    await localAuth.createLocalUser('test@rugby.local', 'password123', 'Test', 'Local');
    console.info('Created default local user: test@rugby.local / password123');
  } catch (e) {
    console.warn('Could not create default local user', e);
  }
}
