/**
 * Cria (ou promove) o primeiro administrador da Bancada 10.
 *
 * Uso:
 *   npm run create-admin -- admin@bancada10.com.br "Senha temporária forte"
 *
 * Requer as variáveis de ambiente:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * Nunca rode este script no navegador — a service role key tem acesso total
 * ao banco, ignorando Row Level Security.
 */
import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

async function main() {
  const [, , email, password] = process.argv
  if (!email || !password) {
    console.error('Uso: npm run create-admin -- <email> <senha>')
    process.exit(1)
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceRoleKey) {
    console.error('Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY em .env.local antes de rodar.')
    process.exit(1)
  }

  const supabase = createClient(url, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } })

  const { data: created, error: createError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  let userId = created?.user?.id

  if (createError) {
    if (!createError.message.includes('already been registered')) {
      console.error('Erro ao criar usuário:', createError.message)
      process.exit(1)
    }
    const { data: existing, error: listError } = await supabase.auth.admin.listUsers()
    if (listError) {
      console.error('Erro ao buscar usuário existente:', listError.message)
      process.exit(1)
    }
    userId = existing.users.find((u) => u.email === email)?.id
  }

  if (!userId) {
    console.error('Não foi possível determinar o ID do usuário.')
    process.exit(1)
  }

  const { error: upsertError } = await supabase.from('admin_users').upsert({ id: userId, role: 'owner', active: true })
  if (upsertError) {
    console.error('Erro ao registrar como admin:', upsertError.message)
    process.exit(1)
  }

  console.log(`Pronto! ${email} agora é administrador da Bancada 10.`)
}

main()
