export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { Card, CardContent } from '@/components/ui/card'
import { revalidatePath } from 'next/cache'

export const metadata = { title: 'Admin — Kullanıcılar' }

async function setUserRole(formData: FormData) {
  'use server'
  const userId = formData.get('user_id') as string
  const role = formData.get('role') as string
  if (!userId || !role) return
  const supabase = createAdminClient()
  await supabase.from('users').update({ role }).eq('id', userId)
  revalidatePath('/admin/users')
}

const ROLE_COLORS: Record<string, string> = {
  free: 'bg-muted text-muted-foreground',
  premium: 'bg-amber-100 text-amber-700',
  producer: 'bg-green-100 text-green-700',
  admin: 'bg-red-100 text-red-700',
}

export default async function AdminUsersPage() {
  const supabase = await createClient()

  const { data: users } = await supabase
    .from('users')
    .select('id, full_name, role, created_at, subscription_status')
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Kullanıcılar</h1>

      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left p-3 font-medium">Ad</th>
                <th className="text-left p-3 font-medium">Rol</th>
                <th className="text-left p-3 font-medium">Kayıt</th>
                <th className="text-left p-3 font-medium">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {(users || []).map(u => (
                <tr key={u.id} className="border-b last:border-0">
                  <td className="p-3">{u.full_name || '(isimsiz)'}</td>
                  <td className="p-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${ROLE_COLORS[u.role] || ROLE_COLORS.free}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="p-3 text-muted-foreground">
                    {new Date(u.created_at).toLocaleDateString('tr-TR')}
                  </td>
                  <td className="p-3">
                    <form action={setUserRole}>
                      <input type="hidden" name="user_id" value={u.id} />
                      <select
                        name="role"
                        defaultValue={u.role}
                        className="text-xs border border-border rounded px-2 py-1 bg-background mr-2"
                      >
                        <option value="free">free</option>
                        <option value="premium">premium</option>
                        <option value="producer">producer</option>
                        <option value="admin">admin</option>
                      </select>
                      <button type="submit" className="text-xs text-amber-600 hover:underline">
                        Kaydet
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
