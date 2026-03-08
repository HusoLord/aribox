import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface WeatherData {
  temp: number
  feels_like: number
  humidity: number
  wind_speed: number
  condition: string
  condition_id: number
  city: string
  icon: string
}

function getBeekeeperAdvice(weather: WeatherData): string[] {
  const advice: string[] = []
  const { temp, wind_speed, condition_id } = weather

  // Yağış (condition_id 200-622)
  if (condition_id >= 200 && condition_id < 700) {
    advice.push('Bugün kovan kontrolü için uygun değil — yağış var')
    advice.push('Arılar kovanlarında kalacak, ek besin gerekebilir')
  }

  // Aşırı soğuk
  if (temp < 10) {
    advice.push('Kovanlarınızı soğuktan koruyun')
    advice.push('Düşük sıcaklıkta kovan açmayın')
  }

  // İdeal kontrol sıcaklığı
  if (temp >= 18 && temp <= 28 && condition_id >= 800) {
    advice.push('Bugün kovan kontrolü için ideal hava')
    advice.push('Arılar aktif uçuş yapabilir')
  }

  // Yüksek sıcaklık
  if (temp > 35) {
    advice.push('Sıcaklık yüksek — kovanların havalandırmasını kontrol edin')
    advice.push('Su kaynağı sağladığınızdan emin olun')
  }

  // Yüksek rüzgar
  if (wind_speed > 10) {
    advice.push('Rüzgar hızlı — arılar uçuşta zorlanabilir')
    advice.push('Kovan kapaklarını kontrol edin')
  }

  if (advice.length === 0) {
    advice.push('Hava koşulları normal — rutin bakımınıza devam edebilirsiniz')
  }

  return advice
}

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const lat = searchParams.get('lat') || '41.0082'
  const lon = searchParams.get('lon') || '28.9784'

  const apiKey = process.env.OPENWEATHER_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'API key eksik' }, { status: 500 })
  }

  try {
    const [currentRes, forecastRes] = await Promise.all([
      fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=tr`),
      fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=tr&cnt=40`),
    ])

    if (!currentRes.ok) throw new Error('Hava verisi alınamadı')

    const current = await currentRes.json()
    const forecast = forecastRes.ok ? await forecastRes.json() : null

    const weather: WeatherData = {
      temp: Math.round(current.main.temp),
      feels_like: Math.round(current.main.feels_like),
      humidity: current.main.humidity,
      wind_speed: Math.round(current.wind.speed * 3.6), // m/s -> km/h
      condition: current.weather[0].description,
      condition_id: current.weather[0].id,
      city: current.name,
      icon: current.weather[0].icon,
    }

    const advice = getBeekeeperAdvice(weather)

    // Günlük tahmin özeti
    const dailyForecast = forecast?.list
      ? forecast.list
          .filter((_: unknown, i: number) => i % 8 === 0)
          .slice(0, 7)
          .map((item: { dt: number; main: { temp: number }; weather: { description: string; icon: string }[] }) => ({
            date: new Date(item.dt * 1000).toLocaleDateString('tr-TR', { weekday: 'short', day: 'numeric' }),
            temp: Math.round(item.main.temp),
            condition: item.weather[0].description,
            icon: item.weather[0].icon,
          }))
      : []

    return NextResponse.json({ current: weather, advice, forecast: dailyForecast })
  } catch (error) {
    console.error('Weather error:', error)
    return NextResponse.json({ error: 'Hava durumu alınamadı' }, { status: 500 })
  }
}
