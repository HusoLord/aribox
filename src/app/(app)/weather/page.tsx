'use client'

import { useEffect, useState, useCallback } from 'react'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Wind, Droplets, Thermometer, AlertTriangle, CheckCircle } from 'lucide-react'

interface WeatherCurrent {
  temp: number
  feels_like: number
  humidity: number
  wind_speed: number
  condition: string
  condition_id: number
  city: string
  icon: string
}

interface ForecastDay {
  date: string
  temp: number
  condition: string
  icon: string
}

interface WeatherData {
  current: WeatherCurrent
  advice: string[]
  forecast: ForecastDay[]
}

export default function WeatherPage() {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadWeather = useCallback(async (lat: number, lon: number) => {
    try {
      const res = await fetch(`/api/weather?lat=${lat}&lon=${lon}`)
      if (!res.ok) throw new Error('Hava verisi alınamadı')
      setWeather(await res.json())
    } catch {
      setError('Hava durumu bilgisi alınamadı')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => loadWeather(pos.coords.latitude, pos.coords.longitude),
        () => loadWeather(41.0082, 28.9784) // Varsayılan: İstanbul
      )
    } else {
      loadWeather(41.0082, 28.9784)
    }
  }, [loadWeather])

  const isPositiveAdvice = (advice: string) =>
    advice.toLowerCase().includes('ideal') || advice.toLowerCase().includes('normal')

  if (loading) {
    return (
      <div className="container max-w-2xl mx-auto p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-40 bg-muted rounded-xl" />
          <div className="h-24 bg-muted rounded-xl" />
        </div>
      </div>
    )
  }

  if (error || !weather) {
    return (
      <div className="container max-w-2xl mx-auto p-4">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6 text-center">
            <p className="text-red-600">{error || 'Hata oluştu'}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container max-w-2xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold">Hava Durumu</h1>

      {/* Mevcut hava */}
      <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-muted-foreground text-sm">{weather.current.city}</p>
              <div className="flex items-baseline gap-2 my-2">
                <span className="text-5xl font-bold">{weather.current.temp}°C</span>
              </div>
              <p className="text-muted-foreground capitalize">{weather.current.condition}</p>
              <p className="text-xs text-muted-foreground">Hissedilen: {weather.current.feels_like}°C</p>
            </div>
            <Image
              src={`https://openweathermap.org/img/wn/${weather.current.icon}@2x.png`}
              alt={weather.current.condition}
              width={64}
              height={64}
            />
          </div>

          <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-amber-200">
            <div className="flex items-center gap-2">
              <Droplets className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-xs text-muted-foreground">Nem</p>
                <p className="text-sm font-medium">%{weather.current.humidity}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Wind className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-xs text-muted-foreground">Rüzgar</p>
                <p className="text-sm font-medium">{weather.current.wind_speed} km/h</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Thermometer className="h-4 w-4 text-orange-500" />
              <div>
                <p className="text-xs text-muted-foreground">Hissedilen</p>
                <p className="text-sm font-medium">{weather.current.feels_like}°C</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Arıcılık tavsiyeleri */}
      <Card>
        <CardHeader><CardTitle className="text-sm">Arıcılık Tavsiyeleri</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {weather.advice.map((advice, i) => (
            <div key={i} className="flex items-start gap-2">
              {isPositiveAdvice(advice) ? (
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
              )}
              <p className="text-sm">{advice}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* 7 günlük tahmin */}
      {weather.forecast.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-sm">7 Günlük Tahmin</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1">
              {weather.forecast.map((day, i) => (
                <div key={i} className="flex flex-col items-center gap-1 text-center">
                  <p className="text-xs text-muted-foreground">{day.date}</p>
                  <Image
                    src={`https://openweathermap.org/img/wn/${day.icon}.png`}
                    alt={day.condition}
                    width={32}
                    height={32}
                  />
                  <p className="text-sm font-medium">{day.temp}°</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
