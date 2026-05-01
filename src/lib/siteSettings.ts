import { useCallback, useEffect, useState } from 'react'
import { supabase } from './supabase'

export interface SiteSettings {
  instagram_url: string
  whatsapp_number: string
  contact_email: string
  contact_phone: string
  contact_city: string
}

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  instagram_url: 'https://instagram.com/tripzone_oujda',
  whatsapp_number: '212701730174',
  contact_email: 'contact@tripzone.ma',
  contact_phone: '+212 7 01 73 01 74',
  contact_city: 'Oujda, Maroc',
}

const sanitizePhoneForWa = (value: string) => value.replace(/\D/g, '')

export const getWhatsAppLink = (phone: string, message?: string) => {
  const to = sanitizePhoneForWa(phone)
  if (!message) return `https://wa.me/${to}`
  return `https://wa.me/${to}?text=${encodeURIComponent(message)}`
}

const mapRowToSettings = (row: any): SiteSettings => ({
  instagram_url: row?.instagram_url || DEFAULT_SITE_SETTINGS.instagram_url,
  whatsapp_number: row?.whatsapp_number || DEFAULT_SITE_SETTINGS.whatsapp_number,
  contact_email: row?.contact_email || DEFAULT_SITE_SETTINGS.contact_email,
  contact_phone: row?.contact_phone || DEFAULT_SITE_SETTINGS.contact_phone,
  contact_city: row?.contact_city || DEFAULT_SITE_SETTINGS.contact_city,
})

export const fetchSiteSettings = async (): Promise<SiteSettings> => {
  const { data, error } = await supabase
    .from('site_settings')
    .select('instagram_url, whatsapp_number, contact_email, contact_phone, contact_city')
    .order('id', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (error) {
    console.warn('site_settings unavailable, using defaults:', error.message)
    return DEFAULT_SITE_SETTINGS
  }

  return mapRowToSettings(data)
}

export const saveSiteSettings = async (settings: SiteSettings): Promise<SiteSettings> => {
  const payload = {
    id: 1,
    instagram_url: settings.instagram_url,
    whatsapp_number: settings.whatsapp_number,
    contact_email: settings.contact_email,
    contact_phone: settings.contact_phone,
    contact_city: settings.contact_city,
  }

  const { data, error } = await supabase
    .from('site_settings')
    .upsert(payload, { onConflict: 'id' })
    .select('instagram_url, whatsapp_number, contact_email, contact_phone, contact_city')
    .single()

  if (error) throw error
  return mapRowToSettings(data)
}

export const useSiteSettings = () => {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const fetched = await fetchSiteSettings()
      setSettings(fetched)
      setError(null)
    } catch (err: any) {
      setError(err.message || 'Impossible de charger les paramètres du site.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { settings, loading, error, refresh, setSettings }
}
