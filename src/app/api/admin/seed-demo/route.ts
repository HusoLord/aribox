import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { ADMIN_EMAIL } from '@/lib/constants'

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 })
  }

  const admin = createAdminClient()

  // ---- Forum kategorileri ----
  const { data: existingCategories, error: catError } = await admin
    .from('forum_categories')
    .select('id')
    .limit(1)

  if (catError) {
    return NextResponse.json({ error: catError.message }, { status: 500 })
  }

  let createdCategories = 0
  if (!existingCategories || existingCategories.length === 0) {
    const { error } = await admin.from('forum_categories').insert([
      {
        name: 'Genel Sohbet (Örnek)',
        slug: 'genel-sohbet-ornek',
        description: 'Bu kategori, ARIBox içindeki örnek forum içeriklerini göstermek için oluşturulmuştur.',
        icon: 'MessageSquare',
        post_count: 3,
        sort_order: 1,
      },
      {
        name: 'Hastalık ve Tedavi (Örnek)',
        slug: 'hastalik-tedavi-ornek',
        description: 'Örnek hastalık tartışmaları ve yapay zeka önerileri.',
        icon: 'HeartPulse',
        post_count: 2,
        sort_order: 2,
      },
    ])
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    createdCategories = 2
  }

  // Kategorileri tekrar çek (id lazım)
  const { data: categories } = await admin
    .from('forum_categories')
    .select('id, slug')
    .in('slug', ['genel-sohbet-ornek', 'hastalik-tedavi-ornek'])

  const genelCat = categories?.find(c => c.slug === 'genel-sohbet-ornek')
  const hastalikCat = categories?.find(c => c.slug === 'hastalik-tedavi-ornek')

  // ---- Forum konuları ----
  const { data: existingTopics, error: topicCheckError } = await admin
    .from('forum_topics')
    .select('id')
    .eq('user_id', user.id)
    .limit(1)

  if (topicCheckError) {
    return NextResponse.json({ error: topicCheckError.message }, { status: 500 })
  }

  let createdTopics = 0
  if (!existingTopics || existingTopics.length === 0) {
    const topicsToInsert = []

    if (genelCat) {
      topicsToInsert.push(
        {
          category_id: genelCat.id,
          user_id: user.id,
          title: 'Örnek Konu: İlkbahar Beslemesi Deneyimleriniz',
          content:
            'Bu konu, ARIBox platformunda örnek olarak oluşturulmuştur. Gerçek kullanıcılar katıldığında, kendi deneyimlerini burada paylaşabilecekler.\n\nSiz de arkadaşlarınızla denerken bu metni değiştirebilir, yeni konular açabilirsiniz.',
          tags: ['örnek', 'besleme'],
          is_pinned: true,
        },
        {
          category_id: genelCat.id,
          user_id: user.id,
          title: 'Örnek Konu: ARIBox ile Kovan Takibi',
          content:
            'Bu başlık, ARIBox kovan defteri modülünün nasıl kullanılabileceğini örneklemek için oluşturuldu.\n\nKayıt ekranlarında görülen veriler demo amaçlıdır.',
          tags: ['örnek', 'kovan-defteri'],
        },
      )
    }

    if (hastalikCat) {
      topicsToInsert.push({
        category_id: hastalikCat.id,
        user_id: user.id,
        title: 'Örnek Konu: Varroa ile Mücadele Stratejileri',
        content:
          'Bu içerik eğitim ve demo amacıyla eklenmiştir. Gerçek tedavi kararları almadan önce mutlaka yerel uzmanlara ve resmî rehberlere danışın.',
        tags: ['örnek', 'hastalik'],
      })
    }

    if (topicsToInsert.length > 0) {
      const { error } = await admin.from('forum_topics').insert(topicsToInsert)
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
      createdTopics = topicsToInsert.length
    }
  }

  // ---- Haberler ----
  const { data: demoNews, error: newsCheckError } = await admin
    .from('news_articles')
    .select('id')
    .ilike('title', '[Örnek]%')
    .limit(1)

  if (newsCheckError) {
    return NextResponse.json({ error: newsCheckError.message }, { status: 500 })
  }

  let createdNews = 0
  if (!demoNews || demoNews.length === 0) {
    const now = new Date().toISOString()
    const { error } = await admin.from('news_articles').insert([
      {
        title: '[Örnek] Türkiye’de Arıcılıkta İklim Değişikliği Etkileri',
        slug: 'ornek-iklim-degisikligi-aricilik',
        summary:
          'Bu metin, ARIBox içinde demo amaçlı oluşturulmuş bir haber özetidir. Gerçek verilerle değiştirilmek üzere tasarlanmıştır.',
        content:
          'Bu içerik, iklim değişikliğinin arıcılık üzerindeki olası etkilerini anlatan ÖRNEK bir makaledir. ' +
          'Gerçek haber ve makalelerle değiştirildiğinde, ARIBox AI botu bu metinleri özetleyebilir ve kullanıcılara kişiselleştirilmiş bildirimler sunabilir.\n\n' +
          'Şu anda gördüğünüz tüm bilgiler demo amaçlıdır.',
        category: 'haberler',
        tags: ['örnek', 'iklim', 'aricilik'],
        source_url: 'https://example.com/demo/iklim-aricilik',
        image_url: null,
        is_breaking: false,
        published_at: now,
      },
      {
        title: '[Örnek] Balda Kalıntı Analizi Üzerine Yeni Akademik Çalışma',
        slug: 'ornek-balda-kalinti-analizi',
        summary:
          'Bu makale özeti, ARIBox haber modülünün nasıl çalışacağını göstermek için hazırlanmış ÖRNEK bir içeriktir.',
        content:
          'Buradaki metin, balda kalıntı analizi ile ilgili HAYALİ bir akademik çalışmayı özetler. ' +
          'Gerçek projede, akademik makale özetleri API ya da RSS kaynaklarından çekilip, ARIBox AI tarafından Türkçe olarak özetlenebilir.\n\n' +
          'Kullanıcılar bu tür makaleleri kendi arşivlerine kaydedip daha sonra tekrar inceleyebilir.',
        category: 'teknoloji',
        tags: ['örnek', 'akademik', 'kalinti'],
        source_url: 'https://example.com/demo/bal-kalinti-analizi',
        image_url: null,
        is_breaking: false,
        published_at: now,
      },
    ])

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    createdNews = 2
  }

  return NextResponse.json({
    ok: true,
    createdCategories,
    createdTopics,
    createdNews,
    note:
      'Tüm oluşturulan içerikler ÖRNEK amaçlıdır ve gerçek kullanıcı verileriyle değiştirilmek üzere hazırlanmıştır.',
  })
}

