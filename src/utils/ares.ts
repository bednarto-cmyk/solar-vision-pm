export interface AresSubject {
  ico: string
  name: string
  dic?: string
  address?: string
}

const ARES_URL = 'https://ares.gov.cz/ekonomicke-subjekty-v-be/rest/ekonomicke-subjekty'

export const isValidIco = (value: string) => /^\d{8}$/.test(value.trim())

export async function fetchAresSubject(ico: string): Promise<AresSubject> {
  const id = ico.trim()
  if (!isValidIco(id)) throw new Error('invalid-ico')

  const response = await fetch(`${ARES_URL}/${id}`, { headers: { Accept: 'application/json' } })
  if (response.status === 404) throw new Error('not-found')
  if (!response.ok) throw new Error('unavailable')

  const data = await response.json()
  const sidlo = data.sidlo
  return {
    ico: data.ico,
    name: data.obchodniJmeno,
    dic: data.dic,
    address: sidlo?.textovaAdresa,
  }
}
