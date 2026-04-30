
import { dual, users } from './server/storage/db';
import { supabase } from './server/storage/supabase';

async function setupTestCandidate() {
  const phone = '49988447562';
  const pin = '884475';
  const email = `${phone}@recruta.ai`;

  console.log(`Setting up candidate: ${phone}`);

  try {
    // 1. Create User (or get if exists)
    let user;
    try {
      user = await users.create(email, pin, 'candidate');
      console.log('User created.');
    } catch (e) {
      console.log('User already exists, fetching...');
      const { data } = await supabase.from('users').select('*').eq('email', email).single();
      user = data;
    }

    if (!user) throw new Error('Failed to handle user');

    // 2. Create/Update Profile
    const { data: profile, error: pError } = await supabase
      .from('candidate_profiles')
      .upsert({
        user_id: user.id,
        phone: phone,
        name: 'Francisco Teste',
        raw_cv: 'Experiência em Gestão e Tecnologia. Especialista em automação de processos.'
      })
      .select()
      .single();

    if (pError) throw pError;
    console.log('Profile ready.');

    // 3. Init Wallet
    await dual.initCandidateWallet(profile.id);
    console.log('Wallet initialized with 3 credits.');

    console.log('\n--- CREDENCIAIS DE TESTE ---');
    console.log(`URL: https://app.recruta.ai/login`);
    console.log(`WhatsApp/Email: ${phone}`);
    console.log(`Protocolo/Senha: ${pin}`);
    console.log('----------------------------');

  } catch (err) {
    console.error('Error during setup:', err);
  }
}

setupTestCandidate();
