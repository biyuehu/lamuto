import type { Word } from './types'

const URL = 'https://api.github.com/repos/biyuehu/lamuto/contents/data/lamuto-dictionary.json'

async function request(tokenVal?: string, init: RequestInit = {}) {
  return await (
    await fetch(URL, {
      headers: tokenVal
        ? {
            Authorization: `token ${tokenVal}`
          }
        : {},
      ...init
    })
  ).json()
}

export async function loadDictionary(toeknVal?: string): Promise<Word[]> {
  const res = (await request(toeknVal)) as { content: string; download_url: string }
  return JSON.parse(
    res.content
      ? // biome-ignore lint: *
        new TextDecoder().decode((Uint8Array.from as any)(atob(res.content), (m: any) => m.codePointAt(0)))
      : JSON.stringify(await (await fetch(res.download_url.split('?token=')[0])).json())
  )
}

export async function updateDictionary(tokenVal: string, data: Word[], message: string): Promise<void> {
  return await request(tokenVal, {
    method: 'PUT',
    body: JSON.stringify({
      message,
      content: btoa(
        Array.from(new TextEncoder().encode(JSON.stringify(data, null, 2)), (byte) => String.fromCodePoint(byte)).join(
          ''
        )
      ),
      sha: (await request(tokenVal)).sha
    })
  })
}
